from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, Request, HTTPException, status
import json 
from ..core.auth import get_current_active_user
from ..models.user import User
from ..models.workout import (
    WorkoutRequestCreate, WorkoutRequestInDB, UserSummary, MetricsAnalysis,
    WorkoutPlan, NutritionAdvice
)
from ..services.ai_service_client import generate_plan_from_ai_service

router = APIRouter()

@router.post(
    "/request-plan",
    response_model=WorkoutRequestInDB,
    status_code=status.HTTP_201_CREATED
)
async def request_workout_plan(
    request_data: WorkoutRequestCreate,
    request: Request,
    current_user: User = Depends(get_current_active_user)
):
    db = request.app.database
    ai_service_payload = request_data.model_dump()

    try:
        print("--- DEBUG STEP 1: Sending request to AI service ---")
        generated_plan_dict = await generate_plan_from_ai_service(ai_service_payload)
        
        print("\n--- DEBUG STEP 2: RAW DICTIONARY RECEIVED FROM AI SERVICE ---")
        print(json.dumps(generated_plan_dict, indent=2))
        print("----------------------------------------------------------\n")

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"The AI service failed to generate a plan: {e}"
        )

    try:
        print("\n--- DEBUG STEP 3: CREATING WorkoutRequestInDB OBJECT ---")
        workout_request_doc = WorkoutRequestInDB(
            user_id=current_user.id,
            status=generated_plan_dict.get("status", "pending_review"),
            coach_notes=generated_plan_dict.get("coach_notes", ""),
            user_summary=UserSummary(**generated_plan_dict["user_summary"]),
            body_analysis=MetricsAnalysis(**generated_plan_dict["body_analysis"]),
            workout_plan=WorkoutPlan(**generated_plan_dict["workout_plan"]),
            nutrition_guidelines=NutritionAdvice(**generated_plan_dict["nutrition_guidelines"])
        )
        print("\n--- Pydantic object created successfully. Contents: ---")
        # .model_dump_json() is a great way to see the true state of the object
        print(workout_request_doc.model_dump_json(indent=2))
        print("----------------------------------------------------------\n")
        
    except Exception as e:
        print(f"\n--- ERROR AT STEP 3: FAILED TO CREATE PYDANTIC OBJECT ---")
        print(f"Error: {e}")
        print("----------------------------------------------------------\n")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process data from AI service. Error: {e}"
        )

    print("\n--- DEBUG STEP 4: DUMPING PYDANTIC OBJECT TO MONGO DICT ---")
    mongo_dict = workout_request_doc.model_dump(by_alias=True)
    print("\n--- Dictionary to be inserted into MongoDB: ---")
    print(mongo_dict)
    print("----------------------------------------------------------\n")

    # Save the new workout request to the database
    db.workout_requests.insert_one(mongo_dict)
    print("\n--- DEBUG STEP 5: INSERTED INTO DATABASE SUCCESSFULLY ---")
    
    # Return the created document
    return workout_request_doc

@router.get(
    "/my-requests",
    response_model=List[WorkoutRequestInDB] 
)
def get_my_workout_requests(
    request: Request,
    current_user: User = Depends(get_current_active_user)
):
    """
    Retrieves all workout plan requests for the currently authenticated user.
    """
    db = request.app.database
    
    user_requests = db.workout_requests.find({"user_id": current_user.id})

    return list(user_requests)

@router.get(
    "/{plan_id}",
    response_model=WorkoutRequestInDB
)
def get_single_workout_request(
    plan_id: UUID,
    request: Request,
    current_user: User = Depends(get_current_active_user)
):
    """
    Retrieves a single workout plan by its ID.
    Ensures the user owns the plan AND the plan has been approved.
    """
    db = request.app.database
    
    workout_plan = db.workout_requests.find_one({
        "_id": plan_id,
        "user_id": current_user.id
    })

    if workout_plan is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workout plan not found or you do not have permission to view it."
        )

    if workout_plan.get("status") != "approved":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This workout plan has not been approved by a coach yet."
        )

    return workout_plan