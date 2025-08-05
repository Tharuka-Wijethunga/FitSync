from crewai import Agent
from langchain_openai import ChatOpenAI
import os
from dotenv import load_dotenv
from crewai_tools import CSVSearchTool
from pathlib import Path
from .tools.validation_tool import validate_final_plan_json

APP_DIR = Path(__file__).parent
CSV_PATH = APP_DIR / "tools" / "body_assessment.csv"

if not CSV_PATH.is_file():
    raise FileNotFoundError(
        f"The body_assessment.csv file was not found at the expected path: {CSV_PATH}"
    )

# Tool to access the knowledge base
knowledge_base_tool = CSVSearchTool(csv=str(CSV_PATH))

load_dotenv()
openai_api_key = os.getenv('OPENAI_API_KEY')

if not openai_api_key:
    raise ValueError("No OpenAI API key found. Please set OPENAI_API_KEY in your .env file.")

llm = ChatOpenAI(
    api_key=openai_api_key,
    model_name="gpt-4o",
    temperature=0.7
)


def create_body_metrics_analyst() -> Agent:
    return Agent(
        role='Body Metrics Analyst',
        goal='Analyze user body measurements to determine body type, BMI, and estimated body fat. Output this analysis as a structured JSON object.',
        backstory="""You are an expert in anthropometry and body composition analysis. Your task is to process raw user data (age, gender, measurements) and produce a clear, structured analysis. This data will be used by other agents to formulate a fitness plan. Focus on accuracy and a machine-readable output format.""",
        llm=llm,
        tools=[knowledge_base_tool],
        verbose=True,
    )

def create_workout_architect() -> Agent:
    return Agent(
        role='Workout Plan Architect',
        goal='Design a structured, week-long workout plan draft in JSON format, tailored to the user\'s goals, experience level, and physical analysis. The plan MUST incorporate a variety of exercises, including bodyweight, free weights (dumbbells, barbells), and common gym machines.',
        backstory="""You are a master fitness programmer at a high-end gym, creating blueprints for workout plans. Your expertise lies in creating diverse and effective routines that utilize all the equipment a standard gym has to offer. You design the structure: the weekly split, exercise selection (including bodyweight, dumbbells, barbells, cable machines, leg press, etc.), sets, reps, and rest periods. You consider the user's detailed goals, availability, and any stated injuries to create a scientifically sound draft. Your output must be a clean, well-organized JSON that strictly follows the provided schema.""",
        llm=llm,
        verbose=True,
    )

def create_nutrition_advisor() -> Agent:
    return Agent(
        role='Nutrition Advisor',
        goal='Provide foundational nutrition guidelines as a structured JSON object to complement the user\'s workout plan and goals.',
        backstory="""You are a certified nutritionist who specializes in creating simple, actionable dietary advice. Based on the user's goals and body analysis, you provide guidelines on macronutrient balance, hydration, and food suggestions. Your output should be clear, concise, and structured for easy integration into a larger wellness plan.""",
        llm=llm,
        verbose=True,
    )
    
def create_plan_synthesizer() -> Agent:
    return Agent(
        role='Head Coach Plan Synthesizer',
        goal='Compile the analyses and drafts from other agents into a single, final JSON string. Then, validate this JSON string to ensure it is perfect.',
        backstory="""You are the meticulous Head Coach responsible for final review. Your job is to take outputs from all specialist agents and combine them into one comprehensive JSON object, returned as a raw string.
        After creating the JSON string, you MUST use the 'Final Plan JSON Validator Tool' to check your work.
        If validation fails, you MUST correct the JSON string and validate it again.
        Your final, final output must be ONLY the validated JSON string.""",
        llm=llm,
        tools=[validate_final_plan_json],
        verbose=True,
    )