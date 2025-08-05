from pydantic import BaseModel, Field
from typing import List, Dict, Optional
from uuid import UUID, uuid4
from datetime import datetime

class MongoBaseModel(BaseModel):
    id: UUID = Field(default_factory=uuid4, alias="_id")

class UserSummary(BaseModel):
    fitness_goal: str
    days_per_week: int

class MetricsAnalysis(BaseModel):
    bmi: float
    body_fat_percentage: float
    body_type: str

class Exercise(BaseModel):
    name: str
    sets: int
    reps: str
    rest_seconds: int
    duration_seconds: Optional[int] = None

class WorkoutDetail(BaseModel):
    warm_up: str
    exercises: List[Exercise]
    cool_down: str

class WeeklyScheduleItem(BaseModel):
    day: int
    activity: str

class WorkoutPlan(BaseModel):
    weekly_schedule: List[WeeklyScheduleItem]
    workouts: Dict[str, WorkoutDetail]
    progressive_overload_notes: str

class NutritionAdvice(BaseModel):
    general_principles: str
    macronutrient_focus: str
    hydration: str
    meal_timing_suggestion: str


class WorkoutRequestInDB(MongoBaseModel):
    id: UUID = Field(default_factory=uuid4, alias="_id")
    user_id: UUID
    created_at: datetime = Field(default_factory=datetime.utcnow) # <-- ADD THIS LINE
    
    status: str = Field(default="pending_review")
    coach_notes: Optional[str] = ""
    user_summary: UserSummary
    body_analysis: MetricsAnalysis
    workout_plan: WorkoutPlan
    nutrition_guidelines: NutritionAdvice

class WorkoutRequestCreate(BaseModel):
    age: int = Field(..., example=28)
    gender: str = Field(..., example="male")
    weight: float = Field(..., example=69)
    height: float = Field(..., example=181)
    neck: Optional[float] = Field(None, example=40.0)
    waist: Optional[float] = Field(None, example=90.0)
    hip: Optional[float] = Field(None, example=100.0)
    fitness_goal: str = Field(..., example="calisthenic body and power build")
    days_per_week: int = Field(..., example=3, ge=1, le=7)
    injuries: str = Field(..., example="none")

class WorkoutRequestUpdate(BaseModel):
    user_summary: UserSummary
    body_analysis: MetricsAnalysis
    workout_plan: WorkoutPlan
    nutrition_guidelines: NutritionAdvice
    coach_notes: str