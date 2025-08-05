from fastapi import Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from pydantic import ValidationError
from uuid import UUID

from .config import settings
from ..models.user import User


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login/token")

credentials_exception = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Could not validate credentials",
    headers={"WWW-Authenticate": "Bearer"},
)

def get_current_active_user(token: str = Depends(oauth2_scheme), request: Request = None):
    """
    Dependency to get the current active user.
    1. Decodes the JWT token.
    2. Fetches the user from the database.
    3. Returns the user object.
    """
    try:
        # Decode the JWT
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        
        # The 'sub' claim should be our user's ID
        user_id_str: str = payload.get("sub")
        if user_id_str is None:
            raise credentials_exception
        
        # Convert the string ID back to a UUID
        user_id = UUID(user_id_str)

    except (JWTError, ValidationError):
        # If the token is invalid or the payload is malformed
        raise credentials_exception
    
    db = request.app.database
    user = db.users.find_one({"_id": user_id})

    if user is None:
        raise credentials_exception
        
    # Pydantic will automatically map the '_id' from the DB to 'id' in the model
    return User(**user)