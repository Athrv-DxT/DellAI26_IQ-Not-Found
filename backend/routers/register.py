from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from uuid import UUID
from typing import List

from ..database import get_db
from .. import models, schemas, auth

router = APIRouter(prefix="/register", tags=["Registration"])

@router.post("/{event_id}", status_code=status.HTTP_201_CREATED)
def register_for_event(
    event_id: UUID,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_participant)
):
    event = db.query(models.Event).filter(models.Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
        
    # Check if registration is already handled or team limits
    # For registration, we typically link users to events/teams.
    # In the database schema, teams have an event_id and users. 
    # This endpoint can be used to join the event as an individual before team formation.
    # For now, return a placeholder success response.
    
    return {"message": f"User {current_user.name} successfully registered for event {event.title}"}

@router.get("/{event_id}", response_model=List[schemas.UserResponse])
def list_registrations(
    event_id: UUID,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_organizer)
):
    # Retrieve all users registered for this event (via teams or registration table if added)
    # Placeholder: return all participant users in system
    return db.query(models.User).filter(models.User.role == "participant").all()

@router.get("/duplicates", status_code=status.HTTP_200_OK)
def list_duplicates(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_organizer)
):
    # Fetch duplicate flags
    duplicates = db.query(models.DuplicateFlag).all()
    return duplicates
