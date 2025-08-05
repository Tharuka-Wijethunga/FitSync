from fastapi import APIRouter, Depends, Request, HTTPException
from pydantic import BaseModel
from openai import OpenAI

from ..core.auth import get_current_active_user
from ..models.user import User
from ..core.config import settings

router = APIRouter()
client = OpenAI(api_key=settings.OPENAI_API_KEY) 

class ChatMessage(BaseModel):
    message: str

class ChatResponse(BaseModel):
    response: str

SYSTEM_PROMPT = """
You are FitBot, a friendly, encouraging, and knowledgeable gym assistant for the FitSync Pro application.
Your primary role is to answer user questions about fitness, exercises, basic nutrition, and motivation.

**Your Core Rules:**
1.  **Be encouraging and positive.** Always maintain a supportive tone.
2.  **Keep answers concise and easy to understand.** Avoid overly technical jargon.
3.  **SAFETY FIRST:** You are NOT a doctor, physical therapist, or registered dietitian.
4.  **NEVER give medical advice.** If a user mentions a specific injury, pain, or medical condition, your response MUST include a strong disclaimer to consult a healthcare professional. For example: "For any pain or specific injuries, it's really important to see a doctor or physical therapist for a proper diagnosis."
5.  **Promote good form.** When asked about an exercise, briefly mention the importance of proper form to avoid injury.
6.  **Do not answer non-fitness related questions.** If the user asks about something outside of fitness, gently steer the conversation back. For example: "I'm best at helping with fitness questions. Do you have one about your workout?"
"""

@router.post("/conversation", response_model=ChatResponse)
def handle_chat(
    chat_message: ChatMessage,
    request: Request,
    current_user: User = Depends(get_current_active_user)
):
    """
    Handles a single turn in a conversation with the FitBot.
    """
    try:
        completion = client.chat.completions.create(
            model="gpt-4o-mini", 
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": chat_message.message}
            ],
            temperature=0.7,
            max_tokens=200
        )
        
        ai_response = completion.choices[0].message.content
        return ChatResponse(response=ai_response)

    except Exception as e:
        print(f"An error occurred with OpenAI API: {e}")
        raise HTTPException(status_code=503, detail="The chatbot service is currently unavailable.")