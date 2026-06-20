from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from uuid import UUID
from typing import List

from ..database import get_db
from .. import models, schemas, auth

router = APIRouter(prefix="/review", tags=["Reviewing & Assignment"])

@router.post("/assign", status_code=status.HTTP_202_ACCEPTED)
def trigger_reviewer_assignment(
    event_id: UUID,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_organizer)
):
    event = db.query(models.Event).filter(models.Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
        
    # TODO: Trigger Celery task for reviewer assignment (scipy Hungarian optimization)
    # assign_reviewers.delay(str(event_id))
    
    return {"message": "AI reviewer assignment task successfully enqueued"}

@router.get("/assignments/me", response_model=List[schemas.AssignmentResponse])
def get_my_assignments(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_reviewer)
):
    return db.query(models.Assignment).filter(models.Assignment.reviewer_id == current_user.id).all()

@router.post("/score", response_model=schemas.ScoreResponse, status_code=status.HTTP_200_OK)
def submit_score(
    score_data: schemas.ScoreSubmit,
    assignment_id: UUID,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_reviewer)
):
    # Verify assignment exists and is owned by reviewer
    assignment = db.query(models.Assignment).filter(
        models.Assignment.id == assignment_id,
        models.Assignment.reviewer_id == current_user.id
    ).first()
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found or not assigned to you")

    # Compute final score: rubric-weighted average (e.g. 0.3 Innovation, 0.3 Tech, 0.25 Feasibility, 0.15 Presentation)
    final_score = (
        0.30 * score_data.innovation +
        0.30 * score_data.tech_complexity +
        0.25 * score_data.feasibility +
        0.15 * score_data.presentation
    )

    new_score = models.Score(
        assignment_id=assignment_id,
        innovation=score_data.innovation,
        tech_complexity=score_data.tech_complexity,
        feasibility=score_data.feasibility,
        presentation=score_data.presentation,
        overall_comment=score_data.overall_comment,
        final_score=final_score
    )
    db.add(new_score)
    db.commit()
    db.refresh(new_score)

    # TODO: Enqueue Celery task for async bias check
    # check_scoring_bias.delay(str(new_score.id))

    return new_score

@router.get("/scores/{submission_id}", response_model=List[schemas.ScoreResponse])
def get_submission_scores(
    submission_id: UUID,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_reviewer)
):
    # Get scores for this submission through assignments relationship
    scores = db.query(models.Score).join(models.Assignment).filter(
        models.Assignment.submission_id == submission_id
    ).all()
    return scores
