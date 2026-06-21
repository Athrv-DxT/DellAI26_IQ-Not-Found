from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from uuid import UUID
from typing import List

from ..database import get_db
from .. import models, schemas, auth

router = APIRouter(prefix="/register", tags=["Registration"])

@router.post("/{event_id}", response_model=schemas.TeamResponse, status_code=status.HTTP_201_CREATED)
def register_for_event(
    event_id: UUID,
    team_data: schemas.TeamCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_participant)
):
    event = db.query(models.Event).filter(models.Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    existing_team = db.query(models.Team).filter(
        models.Team.event_id == event_id,
        models.Team.members.any(current_user.id)
    ).first()
    if existing_team:
        raise HTTPException(status_code=400, detail="User is already registered for this event")

    member_ids = [current_user.id]
    if team_data.members:
        member_ids.extend(team_data.members)

    # Deduplicate and preserve ordering
    member_ids = list(dict.fromkeys(member_ids))

    if len(member_ids) > event.team_size:
        raise HTTPException(
            status_code=400,
            detail=f"Team size cannot exceed event limit of {event.team_size}"
        )

    new_team = models.Team(
        event_id=event_id,
        name=team_data.name,
        members=member_ids
    )
    db.add(new_team)
    db.commit()
    db.refresh(new_team)

    return new_team

@router.get("/{event_id}", response_model=List[schemas.TeamResponse])
def list_registrations(
    event_id: UUID,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_organizer)
):
    return db.query(models.Team).filter(models.Team.event_id == event_id).all()

@router.get("/duplicates", status_code=status.HTTP_200_OK)
def list_duplicates(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_organizer)
):
    # Fetch duplicate flags
    duplicates = db.query(models.DuplicateFlag).all()
    return duplicates
