from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from uuid import UUID
from typing import List

from ..database import get_db
from .. import models, schemas, auth

router = APIRouter(prefix="/bias", tags=["Bias Control Panel"])

@router.get("/alerts/{event_id}", response_model=List[schemas.BiasAlertResponse])
def get_bias_alerts(
    event_id: UUID,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_organizer)
):
    return db.query(models.BiasAlert).filter(models.BiasAlert.event_id == event_id).all()

@router.patch("/alerts/{id}/resolve", response_model=schemas.BiasAlertResponse)
def resolve_bias_alert(
    id: UUID,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_organizer)
):
    alert = db.query(models.BiasAlert).filter(models.BiasAlert.id == id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Bias alert not found")
        
    alert.resolved = True
    db.commit()
    db.refresh(alert)
    return alert
