import numpy as np
from backend.celery_app import celery_app
from backend.database import SessionLocal
from backend.models import Submission, ReviewerProfile, Assignment, User
from ai.models.matcher import calculate_match_score, solve_assignments
from ai.chroma_client import get_collection

# Wait, wait, calculate_match_score and solve_optimal_assignments are imported.
# In matcher.py we named the solve function solve_optimal_assignments. Let's fix import to use solve_optimal_assignments.

@celery_app.task(name="ai.tasks.assignment.assign_reviewers_to_submissions")
def assign_reviewers_to_submissions(event_id: str):
    db = SessionLocal()
    try:
        submissions = db.query(Submission).filter(Submission.event_id == event_id).all()
        reviewers = db.query(ReviewerProfile).join(User).all()
        
        if not submissions or not reviewers:
            return "No submissions or reviewers found to assign."
            
        # Matrix size: Rows = Submissions, Cols = Reviewers
        num_subs = len(submissions)
        num_revs = len(reviewers)
        
        score_matrix = np.zeros((num_subs, num_revs))
        
        # Helper to compute expertise score (similarity of tags)
        # Cosine similarity matching: tags represent submission profile, reviewer expertise represents reviewer profile
        for s_idx, sub in enumerate(submissions):
            for r_idx, rev in enumerate(reviewers):
                # 1. Compute expertise similarity (e.g. tag overlap or cosine similarity)
                sub_tags = set(sub.tags or [])
                rev_exp = set(rev.expertise_areas or [])
                overlap = sub_tags.intersection(rev_exp)
                exp_similarity = len(overlap) / max(len(sub_tags), 1)
                
                # 2. Compute reviewer workload factor
                workload_factor = 1.0 - (rev.current_load / max(rev.max_assignments, 1))
                
                # 3. Check for conflict of interest (e.g. same institution)
                sub_team = sub.team
                has_conflict = False
                if sub_team and sub_team.members:
                    # Fetch members details
                    team_members = db.query(User).filter(User.id.in_(sub_team.members)).all()
                    for member in team_members:
                        if member.institution and rev.user.institution:
                            if member.institution.lower() == rev.user.institution.lower():
                                has_conflict = True
                                break
                                
                # 4. Diversity boost (for demo: mock or check demographics)
                diversity_boost = 0.1 if (rev.user.location != "Local") else 0.0
                
                score_matrix[s_idx, r_idx] = calculate_match_score(
                    expertise_similarity=exp_similarity,
                    reviewer_load_factor=workload_factor,
                    has_conflict=has_conflict,
                    diversity_boost=diversity_boost
                )
        
        # Run Hungarian optimization solver
        from ai.models.matcher import solve_optimal_assignments
        assignments = solve_optimal_assignments(score_matrix)
        
        # Save results to DB
        created_count = 0
        for s_idx, r_idx in assignments:
            sub = submissions[s_idx]
            rev = reviewers[r_idx]
            
            # Check if assignment already exists
            existing = db.query(Assignment).filter(
                Assignment.submission_id == sub.id,
                Assignment.reviewer_id == rev.user_id
            ).first()
            
            if not existing:
                # Calculate conflict reason if any
                conflict_flag = score_matrix[s_idx, r_idx] == 0.0
                conflict_reason = "Institutional conflict of interest" if conflict_flag else None
                
                new_assignment = Assignment(
                    reviewer_id=rev.user_id,
                    submission_id=sub.id,
                    expertise_score=float(score_matrix[s_idx, r_idx]),
                    conflict_flag=conflict_flag,
                    conflict_reason=conflict_reason
                )
                db.add(new_assignment)
                
                # Increment reviewer current load
                rev.current_load += 1
                created_count += 1
                
        db.commit()
        return f"Completed reviewer assignment. Created {created_count} new assignments."
    finally:
        db.close()
