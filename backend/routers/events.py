from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from uuid import UUID
from typing import List

from ..database import get_db
from .. import models, schemas, auth

router = APIRouter(prefix="/events", tags=["Events"])

@router.post("/", response_model=schemas.EventResponse, status_code=status.HTTP_201_CREATED)
def create_event(
    event_data: schemas.EventCreate, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(auth.require_organizer)
):
    new_event = models.Event(
        title=event_data.title,
        theme=event_data.theme,
        description=event_data.description,
        max_teams=event_data.max_teams,
        team_size=event_data.team_size,
        start_time=event_data.start_time,
        end_time=event_data.end_time,
        organizer_id=current_user.id
    )
    db.add(new_event)
    db.commit()
    db.refresh(new_event)
    return new_event

@router.get("/", response_model=List[schemas.EventResponse])
def list_events(db: Session = Depends(get_db)):
    return db.query(models.Event).all()

@router.get("/{id}", response_model=schemas.EventResponse)
def get_event(id: UUID, db: Session = Depends(get_db)):
    event = db.query(models.Event).filter(models.Event.id == id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return event

@router.patch("/{id}/status", response_model=schemas.EventResponse)
def update_event_status(
    id: UUID, 
    status: str, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(auth.require_organizer)
):
    event = db.query(models.Event).filter(models.Event.id == id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    valid_statuses = ["draft", "published", "registration", "hacking", "judging", "closed"]
    if status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of {valid_statuses}")
        
    event.status = status
    db.commit()
    db.refresh(event)
    return event
