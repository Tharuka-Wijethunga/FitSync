from fastapi import APIRouter, Depends, Request, HTTPException, status
from typing import List
from uuid import UUID
from ..core.auth import get_current_active_user
from ..models.user import User
from ..models.workout import WorkoutRequestInDB, WorkoutRequestUpdate

router = APIRouter()

@router.get(
    "/pending-requests",
    response_model=List[WorkoutRequestInDB]
)
def get_pending_workout_requests(
    request: Request,
    # For now, we protect it so only logged-in users can see it.
    # In a real app, this would be Depends(get_current_coach).
    current_user: User = Depends(get_current_active_user)
):
    """
    Retrieves all workout plan requests that are pending review.
    This is intended for the coach's dashboard.
    """
    db = request.app.database
    
    pending_requests_cursor = db.workout_requests.find({"status": "pending_review"})

    return list(pending_requests_cursor)

@router.put(
    "/requests/{request_id}/approve",
    response_model=WorkoutRequestInDB
)
def approve_workout_request(
    request_id: UUID, 
    update_data: WorkoutRequestUpdate,
    request: Request,
    current_user: User = Depends(get_current_active_user)
):
    """
    Allows a coach to update and approve a specific workout request.
    - Finds the request by its ID.
    - Updates the plan details and coach's notes.
    - Changes the status to "approved".
    """
    db = request.app.database
    
    update_doc = update_data.model_dump()
    
    update_doc["status"] = "approved"

    # Use find_one_and_update to update the document and get the new version back
    # The '$set' operator tells MongoDB to update the fields in update_doc
    # The 'return_document=ReturnDocument.AFTER' option ensures we get the
    # document *after* the update has been applied.
    from pymongo import ReturnDocument
    
    updated_request = db.workout_requests.find_one_and_update(
        {"_id": request_id},
        {"$set": update_doc},
        return_document=ReturnDocument.AFTER
    )

    if updated_request is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Workout request with ID {request_id} not found."
        )

    return updated_request