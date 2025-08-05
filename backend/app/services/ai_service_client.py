import httpx
from ..core.config import settings

async def generate_plan_from_ai_service(user_data: dict) -> dict:
    """
    Makes an asynchronous POST request to the crew_ai_service to generate a workout plan.
    """
    service_url = f"{settings.AI_SERVICE_URL}/generate-plan"
    
    async with httpx.AsyncClient(timeout=240.0) as client:
        try:
            response = await client.post(service_url, json=user_data)
            
            response.raise_for_status()
            
            return response.json()
            
        except httpx.HTTPStatusError as e:
            print(f"Error response {e.response.status_code} while requesting {e.request.url!r}.")
            print(f"AI Service Response: {e.response.text}")
            raise 
        except httpx.RequestError as e:
            print(f"An error occurred while requesting {e.request.url!r}.")
            raise