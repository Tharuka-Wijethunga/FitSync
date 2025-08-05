import json
from crewai.tools import tool
from pydantic import ValidationError
from ..tasks import FinalPlan 

@tool("Final Plan JSON Validator Tool")
def validate_final_plan_json(json_string: str) -> str:
    """
    Validates a JSON string against the FinalPlan Pydantic model.
    Use this tool on the final JSON object you have created to ensure it is 100% correct
    before finishing your task.
    If the JSON is valid, it will return a success message.
    If the JSON is invalid, it will return a detailed error message explaining what is wrong,
    so you can fix the JSON and try again.
    """
    try:
        data = json.loads(json_string)
        FinalPlan(**data)
        return "Validation successful. The JSON is perfectly formatted."
    except json.JSONDecodeError as e:
        return f"Invalid JSON format: {e}. Please fix the JSON syntax."
    except ValidationError as e:
        return f"JSON does not match the required schema: {e}. Please fix the data structure and values."