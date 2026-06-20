import asyncio
from backend.celery_app import celery_app
from backend.database import SessionLocal
from backend.models import Submission, Score, Assignment, Result, Event, Team
from backend.websocket import ws_manager
from ai.models.llm import generate_project_feedback

@celery_app.task(name="ai.tasks.results.generate_event_results")
def generate_event_results(event_id: str):
    db = SessionLocal()
    try:
        event = db.query(Event).filter(Event.id == event_id).first()
        if not event:
            return f"Event {event_id} not found."
            
        # 1. Fetch all submissions for event
        submissions = db.query(Submission).filter(Submission.event_id == event_id).all()
        if not submissions:
            return "No submissions found to rank."
            
        results_data = []
        
        # 2. Score aggregation per submission (average non-biased scores)
        for sub in submissions:
            scores = db.query(Score).join(Assignment).filter(
                Assignment.submission_id == sub.id,
                Score.bias_flag == False  # Exclude biased scores
            ).all()
            
            if not scores:
                continue
                
            avg_innovation = sum(s.innovation for s in scores) / len(scores)
            avg_tech = sum(s.tech_complexity for s in scores) / len(scores)
            avg_feasibility = sum(s.feasibility for s in scores) / len(scores)
            avg_presentation = sum(s.presentation for s in scores) / len(scores)
            
            # Apply weights: Innovation (30%), Tech (30%), Feasibility (25%), Presentation (15%)
            final_weighted_score = (
                0.30 * avg_innovation +
                0.30 * avg_tech +
                0.25 * avg_feasibility +
                0.15 * avg_presentation
            )
            
            results_data.append({
                "submission": sub,
                "team_id": sub.team_id,
                "final_score": final_weighted_score,
                "innovation_score": avg_innovation,
                "rubric": {
                    "Innovation": avg_innovation,
                    "Tech Complexity": avg_tech,
                    "Feasibility": avg_feasibility,
                    "Presentation": avg_presentation
                }
            })
            
        if not results_data:
            return "No valid evaluations found to rank submissions."
            
        # 3. Sort descending by score. Tie-break rule: higher innovation score wins
        results_data.sort(key=lambda x: (x["final_score"], x["innovation_score"]), reverse=True)
        
        # 4. Generate results and fetch Gemini LLM feedback for top 10 projects
        # Delete previous results if existing
        db.query(Result).filter(Result.event_id == event_id).delete()
        
        ranked_results = []
        for rank, data in enumerate(results_data, start=1):
            sub = data["submission"]
            
            feedback = None
            if rank <= 10:
                # Call Gemini LLM feedback generator
                feedback = generate_project_feedback(
                    project_title=sub.title,
                    description=sub.description or "",
                    scores=data["rubric"]
                )
                
            new_result = Result(
                event_id=event.id,
                team_id=data["team_id"],
                final_score=data["final_score"],
                rank=rank,
                confidence=0.95 if rank <= 3 else 0.85, # mock confidence
                feedback=feedback
            )
            db.add(new_result)
            ranked_results.append(new_result)
            
        db.commit()
        
        # 5. Broadcast websocket reveal update to frontend leaderboard
        reveal_payload = {
            "type": "results_published",
            "event_id": event_id,
            "leaderboard": [
                {
                    "rank": r.rank,
                    "team_name": db.query(Team).filter(Team.id == r.team_id).first().name,
                    "score": r.final_score,
                    "feedback": r.feedback
                }
                for r in ranked_results[:10]
            ]
        }
        
        try:
            loop = asyncio.get_event_loop()
        except RuntimeError:
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            
        loop.run_until_complete(ws_manager.broadcast_to_event(reveal_payload, event_id))
        
        return f"Ranked {len(ranked_results)} teams. Published results successfully."
    finally:
        db.close()
