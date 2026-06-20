import pandas as pd
from backend.celery_app import celery_app
from backend.database import SessionLocal
from backend.models import Score, Assignment, Submission, User, BiasAlert
from backend.websocket import ws_manager
from ai.models.bias_detector import detect_score_outliers

@celery_app.task(name="ai.tasks.bias.check_scoring_bias")
def check_scoring_bias(score_id: str):
    db = SessionLocal()
    try:
        score = db.query(Score).filter(Score.id == score_id).first()
        if not score:
            return f"Score {score_id} not found."
            
        assignment = score.assignment
        submission = assignment.submission
        event_id = str(submission.event_id)
        
        # Load all scores for this event to calculate context statistics
        all_scores = db.query(Score).join(Assignment).join(Submission).filter(
            Submission.event_id == event_id
        ).all()
        
        if len(all_scores) < 3:
            return "Insufficient scores in event database to perform statistical z-score analysis."
            
        # Build pandas DataFrame for demographic group operations
        data = []
        for s in all_scores:
            s_assignment = s.assignment
            s_submission = s_assignment.submission
            s_team = s_submission.team
            
            # Fetch demographic attributes of the team (or first member)
            gender_group = "unknown"
            inst_group = "unknown"
            loc_group = "unknown"
            
            if s_team and s_team.members:
                first_member = db.query(User).filter(User.id == s_team.members[0]).first()
                if first_member:
                    gender_group = first_member.gender or "unknown"
                    inst_group = first_member.institution or "unknown"
                    loc_group = first_member.location or "unknown"
                    
            data.append({
                "score_id": str(s.id),
                "final_score": s.final_score,
                "gender": gender_group,
                "institution": inst_group,
                "location": loc_group,
                "reviewer_id": str(s_assignment.reviewer_id),
                "submission_id": str(s_submission.id)
            })
            
        scores_df = pd.DataFrame(data)
        
        # Call z-score statistical outlier detection engine
        alerts = detect_score_outliers(scores_df, threshold=2.0)
        
        # Check if current score is flagged in alerts
        flagged_alerts = [a for a in alerts if a["score_id"] == str(score.id)]
        
        if flagged_alerts:
            # Mark score as flagged
            score.bias_flag = True
            score.bias_type = flagged_alerts[0]["bias_type"]
            score.bias_confidence = flagged_alerts[0]["z_score"]
            
            # Write alert to DB
            new_alert = BiasAlert(
                event_id=submission.event_id,
                score_id=score.id,
                bias_type=score.bias_type,
                z_score=score.bias_confidence,
                reviewer_id=assignment.reviewer_id,
                submission_id=submission.id,
                resolved=False
            )
            db.add(new_alert)
            db.commit()
            
            # Broadcast WebSocket event to all listening organizers
            # ws_manager is imported from backend.websocket
            import asyncio
            alert_payload = {
                "type": "bias_alert",
                "alert": {
                    "id": str(new_alert.id),
                    "event_id": event_id,
                    "reviewer_id": str(assignment.reviewer_id),
                    "submission_id": str(submission.id),
                    "bias_type": score.bias_type,
                    "z_score": score.bias_confidence,
                    "fired_at": str(new_alert.fired_at)
                }
            }
            
            # Async broadcast run inside sync task thread
            try:
                loop = asyncio.get_event_loop()
            except RuntimeError:
                loop = asyncio.new_event_loop()
                asyncio.set_event_loop(loop)
                
            loop.run_until_complete(ws_manager.broadcast_to_event(alert_payload, event_id))
            
            return f"Bias detected: score {score_id} flagged for {score.bias_type} bias (z-score: {score.bias_confidence:.2f})."
            
        return f"No score outlier/bias detected for score {score_id}."
    finally:
        db.close()
