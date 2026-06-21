from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from uuid import UUID
from typing import List

from ..database import get_db
from .. import models, schemas, auth

router = APIRouter(prefix="/submit", tags=["Submissions"])

@router.post("/{event_id}", response_model=schemas.SubmissionResponse, status_code=status.HTTP_201_CREATED)
def submit_project(
    event_id: UUID,
    submission_data: schemas.SubmissionCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_participant)
):
    event = db.query(models.Event).filter(models.Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    if event.status not in ("hacking", "judging"):
        raise HTTPException(status_code=400, detail="Event is not accepting submissions at this time")

    team = db.query(models.Team).filter(
        models.Team.event_id == event_id,
        models.Team.members.any(current_user.id)
    ).first()
    if not team:
        raise HTTPException(status_code=400, detail="User must belong to a team in this event to submit")

    existing_sub = db.query(models.Submission).filter(models.Submission.team_id == team.id).first()
    if existing_sub:
        raise HTTPException(status_code=400, detail="This team has already submitted a project")

    github_url = str(submission_data.github_url) if submission_data.github_url else None
    demo_url = str(submission_data.demo_url) if submission_data.demo_url else None
    video_url = str(submission_data.video_url) if submission_data.video_url else None

    new_submission = models.Submission(
        team_id=team.id,
        event_id=event_id,
        title=submission_data.title,
        description=submission_data.description,
        github_url=github_url,
        demo_url=demo_url,
        video_url=video_url,
        track=submission_data.track,
        tags=submission_data.tags or []
    )
    db.add(new_submission)
    db.commit()
    db.refresh(new_submission)

    return new_submission


@router.get("/{event_id}", response_model=List[schemas.SubmissionResponse])
def list_submissions(
    event_id: UUID,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_reviewer)
):
    return db.query(models.Submission).filter(models.Submission.event_id == event_id).all()

@router.get("/{id}", response_model=schemas.SubmissionResponse)
def get_submission(id: UUID, db: Session = Depends(get_db)):
    submission = db.query(models.Submission).filter(models.Submission.id == id).first()
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")
    return submission
