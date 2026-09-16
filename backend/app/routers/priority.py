from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.models import LocationModel
from ..schemas.schemas import EmergencyPriorityResponse
from ..services.priority_engine import PriorityEngineService

router = APIRouter(prefix="/api/emergency-priority", tags=["Decision Support System"])

@router.get("", response_model=List[EmergencyPriorityResponse])
def get_emergency_priorities(db: Session = Depends(get_db)):
    """
    Computes real-time Multi-Criteria Decision Analysis (MCDA) emergency response priority.
    Ranks monitored zones based on composite hazard, exposed population, and road lifeline criticality.
    """
    locations = db.query(LocationModel).all()
    return PriorityEngineService.evaluate_priority_list(locations)
