import json
import logging
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field, ValidationError
from typing import Dict, Any, Optional

from crewai import Crew, Process
from crewai.crews.crew_output import CrewOutput

from .agents import (
    create_body_metrics_analyst, create_workout_architect,
    create_nutrition_advisor, create_plan_synthesizer
)
from .tasks import (
    create_metrics_analysis_task, create_workout_draft_task,
    create_nutrition_advice_task, create_synthesis_task, FinalPlan
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
app = FastAPI(title="FitSync AI Crew Service", description="An API to generate personalized workout plan drafts using AI agents.", version="1.0.0")

class UserData(BaseModel):
    age: int = Field(..., json_schema_extra={'example': 30})
    gender: str = Field(..., json_schema_extra={'example': "male"})
    weight: float = Field(..., json_schema_extra={'example': 80.5})
    height: float = Field(..., json_schema_extra={'example': 175.0})
    neck: Optional[float] = Field(None, example=40.0)
    waist: Optional[float] = Field(None, example=90.0)
    hip: Optional[float] = Field(None, example=100.0)
    fitness_goal: str = Field(..., json_schema_extra={'example': "Weight loss"})
    days_per_week: int = Field(..., json_schema_extra={'example': 3}, ge=1, le=7)
    injuries: str = Field(..., json_schema_extra={'example': "none"})

def _clean_json_string(json_str: str) -> str:
    """
    Cleans a string that is supposed to be JSON but might be wrapped
    in markdown code blocks or have leading/trailing text.
    """
    if not isinstance(json_str, str):
        logging.warning(f"Attempted to clean a non-string type: {type(json_str)}")
        return ""

    start_index = json_str.find('{')
    end_index = json_str.rfind('}')

    if start_index != -1 and end_index != -1 and start_index < end_index:
        return json_str[start_index : end_index + 1]
    
    logging.error(f"Could not find a valid JSON object within the string: {json_str}")
    return ""

def run_workout_crew(user_data: Dict[str, Any]) -> str:
    metrics_analyst = create_body_metrics_analyst()
    workout_architect = create_workout_architect()
    nutrition_advisor = create_nutrition_advisor()
    plan_synthesizer = create_plan_synthesizer()

    analysis_task = create_metrics_analysis_task(metrics_analyst, user_data)
    workout_task = create_workout_draft_task(workout_architect, user_data, analysis_task)
    nutrition_task = create_nutrition_advice_task(nutrition_advisor, user_data, analysis_task)
    synthesis_task = create_synthesis_task(
        plan_synthesizer, user_data=user_data, workout_task=workout_task,
        nutrition_task=nutrition_task, analysis_task=analysis_task
    )

    crew = Crew(
        agents=[metrics_analyst, workout_architect, nutrition_advisor, plan_synthesizer],
        tasks=[analysis_task, workout_task, nutrition_task, synthesis_task],
        process=Process.sequential,
        verbose=True
    )
    logging.info("Kicking off the AI Crew...")
    result = crew.kickoff()
    logging.info("AI Crew finished successfully.")

    raw_output_string = ""
    if isinstance(result, CrewOutput) and result.raw:
        raw_output_string = result.raw
    elif isinstance(result, str):
        raw_output_string = result
    else:
        logging.error(f"Crew returned an unexpected type: {type(result)}. Full output: {result}")
        raise TypeError("Crew did not return a string or CrewOutput with a raw attribute.")
    
    return _clean_json_string(raw_output_string)

@app.post("/generate-plan", response_model=FinalPlan)
async def generate_plan_endpoint(user_data: UserData):
    json_string_output = None
    try:
        user_data_dict = user_data.model_dump()
        json_string_output = run_workout_crew(user_data_dict)

        logging.info(f"Cleaned JSON string from crew: {json_string_output}")
        if not json_string_output:
             raise ValueError("The cleaning function resulted in an empty string.")

        data_dict = json.loads(json_string_output)
        final_plan = FinalPlan(**data_dict)
        return final_plan

    except json.JSONDecodeError:
        logging.error(f"Failed to decode JSON from crew output: {json_string_output}", exc_info=True)
        raise HTTPException(status_code=500, detail="AI failed to generate valid JSON.")
    except ValidationError as e:
        logging.error(f"AI generated JSON that failed validation: {json_string_output}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"AI data failed validation: {e}")
    except Exception as e:
        logging.error("An unexpected error occurred in generate_plan_endpoint", exc_info=True)
        raise HTTPException(status_code=500, detail=f"An internal server error occurred: {e}")

@app.get("/")
def read_root():
    return {"message": "FitSync AI Crew Service is running."}