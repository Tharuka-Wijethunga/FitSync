from crewai import Task
from pydantic import BaseModel, Field
from typing import Dict, Any, List, Optional


class MetricsAnalysis(BaseModel):
    bmi: float = Field(..., description="Calculated Body Mass Index.")
    body_fat_percentage: float = Field(..., description="Estimated body fat percentage.")
    body_type: str = Field(..., description="User's body type (e.g., Ectomorph, Mesomorph, Endomorph).")

class Exercise(BaseModel):
    name: str = Field(..., description="Name of the exercise.")
    sets: int = Field(..., description="Number of sets.")
    reps: str = Field(..., description="Repetition range (e.g., '8-12').")
    rest_seconds: int = Field(..., description="Rest time in seconds between sets.")
    duration_seconds: Optional[int] = Field(None, description="Duration in seconds, for exercises like planks.")
    equipment: str = Field(..., description="The equipment needed for the exercise (e.g., 'Dumbbells', 'Barbell', 'Treadmill', 'Bodyweight').")

class WorkoutDetail(BaseModel):
    warm_up: str = Field(..., description="Instructions for warm-up.")
    exercises: List[Exercise] = Field(..., description="List of exercises for this workout.")
    cool_down: str = Field(..., description="Instructions for cool-down.")

class WeeklyScheduleItem(BaseModel):
    day: int = Field(..., description="Day number of the week (1-7).")
    activity: str = Field(..., description="Activity for the day (e.g., 'Full Body Workout A', 'Rest').")

class WorkoutPlan(BaseModel):
    weekly_schedule: List[WeeklyScheduleItem] = Field(..., description="The 7-day schedule.")
    workouts: Dict[str, WorkoutDetail] = Field(..., description="A dictionary mapping workout names to their detailed plans.")
    progressive_overload_notes: str = Field(..., description="Guidance on how to apply progressive overload.")

class NutritionAdvice(BaseModel):
    general_principles: str = Field(..., description="Core principles of the nutrition plan.")
    macronutrient_focus: str = Field(..., description="Guidance on protein, carbs, and fats for the user's goal.")
    hydration: str = Field(..., description="Hydration recommendations.")
    meal_timing_suggestion: str = Field(..., description="Suggestions on pre/post workout nutrition.")

# Model for the final, synthesized plan
class UserSummary(BaseModel):
    fitness_goal: str
    days_per_week: int

class FinalPlan(BaseModel):
    user_summary: UserSummary = Field(..., description="Summary of the user's goals.")
    body_analysis: MetricsAnalysis = Field(..., description="The complete body metrics analysis.")
    workout_plan: WorkoutPlan = Field(..., description="The detailed workout plan.")
    nutrition_guidelines: NutritionAdvice = Field(..., description="The tailored nutrition advice.")
    status: str = Field("pending_review", description="The initial status of the plan.")
    coach_notes: str = Field("", description="A field for the coach to add notes, initially empty.")



def create_metrics_analysis_task(agent, user_data: Dict[str, Any]) -> Task:
    
    description = f"""Analyze the user's data to determine key fitness metrics.
    If some body measurements are not provided (N/A), make your best estimates based on the available data (age, gender, height, weight).

    User Data:
    - Age: {user_data['age']}
    - Gender: {user_data['gender']}
    - Height: {user_data['height']} cm
    - Weight: {user_data['weight']} kg
    - Neck: {user_data.get('neck', 'N/A')} cm
    - Waist: {user_data.get('waist', 'N/A')} cm
    - Hip: {user_data.get('hip', 'N/A')} cm

    Based on this data, calculate or estimate the user's BMI, Body Fat Percentage, and determine their body type (Ectomorph, Mesomorph, or Endomorph).
    """

    return Task(
        description=description,
        expected_output="A JSON object that strictly adheres to the `MetricsAnalysis` Pydantic model schema.",
        agent=agent,
        output_pydantic=MetricsAnalysis
    )
    

def create_workout_draft_task(agent, user_data: Dict[str, Any], context_task: Task) -> Task:
    return Task(
        description=f"""Create a detailed, 7-day workout plan draft based on the user's goals and the provided body analysis.
        
        **Crucial Instructions:**
        - Incorporate a mix of exercise types: bodyweight, free weights (dumbbells, barbells), and common gym machines (like cable machines, leg press, lat pulldown machine).
        - For EVERY exercise, you MUST specify the required equipment in the 'equipment' field of the JSON schema. If no equipment is needed, specify 'Bodyweight'.
        
        User Goals:
        - Primary Goal: "{user_data['fitness_goal']}"
        - Days per week: {user_data['days_per_week']}
        - Injuries: {user_data['injuries']}

        Design a weekly schedule for a beginner, and provide detailed workout plans.
        """,
        expected_output="A JSON object that strictly adheres to the `WorkoutPlan` Pydantic model schema, ensuring the `equipment` field is filled for every exercise.",
        agent=agent,
        context=[context_task],
        output_pydantic=WorkoutPlan
    )

def create_nutrition_advice_task(agent, user_data: Dict[str, Any], context_task: Task) -> Task:
    return Task(
        description=f"""Provide foundational nutrition advice tailored to the user's primary goal of {user_data['fitness_goal']}.
        Consider the body analysis provided in the context. Keep the advice simple and actionable for a beginner.
        """,
        expected_output="A JSON object that strictly adheres to the `NutritionAdvice` Pydantic model schema.",
        agent=agent,
        context=[context_task],
        output_pydantic=NutritionAdvice
    )

def create_synthesis_task(agent, user_data: Dict[str, Any], workout_task: Task, nutrition_task: Task, analysis_task: Task) -> Task:
    user_summary_data = {k: user_data[k] for k in ['fitness_goal', 'days_per_week']}

    return Task(
        description=f"""
        Your mission is to act as the final compiler. You will receive structured data from three other agents.
        You MUST combine them into a single, final JSON object that strictly follows the `FinalPlan` schema.
        The output of this task MUST be a raw JSON string.

        1.  **Body Analysis**: This will be the result from the 'Body Metrics Analyst'.
        2.  **Workout Plan**: This will be the result from the 'Workout Plan Architect'.
        3.  **Nutrition Guidelines**: This will be the result from the 'Nutrition Advisor'.
        4.  **User Summary**: Create this part using this data: {user_summary_data}.

        **Crucial Final Step**: After you have constructed the complete JSON string, you MUST use the `Final Plan JSON Validator Tool` to verify it. If it reports errors, you MUST fix your JSON string and re-validate until it is perfect.

        Your final answer MUST be ONLY the validated JSON string itself. No extra text, no apologies, no "Here is the JSON:". Just the raw, validated string.
        """,
        expected_output="A single, raw JSON string that has been successfully validated against the `FinalPlan` schema.",
        agent=agent,
        context=[analysis_task, workout_task, nutrition_task],
    )