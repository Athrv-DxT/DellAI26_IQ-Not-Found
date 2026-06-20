from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from uuid import UUID
from typing import List

from ..database import get_db
from .. import models, schemas, auth

router = APIRouter(prefix="/results", tags=["Results & Leaderboards"])

@router.post("/generate", status_code=status.HTTP_202_ACCEPTED)
def generate_results(
    event_id: UUID,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_organizer)
):
    event = db.query(models.Event).filter(models.Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
        
    # TODO: Enqueue async Celery task for score aggregation, ranking, and Gemini feedback generation
    # generate_event_results.delay(str(event_id))
    
    return {"message": "AI results generation task enqueued successfully"}

@router.get("/{event_id}", response_model=List[schemas.ResultResponse])
def get_leaderboard(
    event_id: UUID,
    db: Session = Depends(get_db)
):
    return db.query(models.Result).filter(
        models.Result.event_id == event_id
    ).order_by(models.Result.rank.asc()).all()

@router.get("/{event_id}/{team_id}", response_model=schemas.ResultResponse)
def get_team_result(
    event_id: UUID,
    team_id: UUID,
    db: Session = Depends(get_db)
):
    result = db.query(models.Result).filter(
        models.Result.event_id == event_id,
        models.Result.team_id == team_id
    ).first()
    if not result:
        raise HTTPException(status_code=404, detail="Result not found for specified team")
    return result
