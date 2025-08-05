# backend/app/routes/auth.py

from fastapi import APIRouter, Request, HTTPException, status, Depends
from fastapi.security import OAuth2PasswordRequestForm
from ..models.user import UserCreate, User, UserInDB, Token
from ..core.security import get_password_hash, verify_password, create_access_token
from ..core.config import settings
from datetime import timedelta

router = APIRouter()

@router.post("/register", response_model=User, status_code=status.HTTP_201_CREATED)
def register_user(user: UserCreate, request: Request):
    """
    Registers a new user.
    """
    db = request.app.database

    existing_user = db.users.find_one({
        "$or": [
            {"email": user.email},
            {"gym_registration_number": user.gym_registration_number}
        ]
    })

    if existing_user:
        if existing_user["email"] == user.email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A user with this email already exists."
            )
        else: 
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This gym registration number is already in use."
            )
        
    user_role = "user"
    if user.gym_registration_number.startswith("COACH-"):
        user_role = "coach"
    
    user_in_db = UserInDB(
        full_name=user.full_name,
        email=user.email,
        gym_registration_number=user.gym_registration_number,
        hashed_password=get_password_hash(user.password),
        role=user_role
    )

    user_doc = user_in_db.model_dump(by_alias=True)
    db.users.insert_one(user_doc)

    return user_doc

@router.post("/login/user", response_model=Token)
def login_user(request: Request, form_data: OAuth2PasswordRequestForm = Depends()):
    db = request.app.database
    user_doc = db.users.find_one({"email": form_data.username})
    
    if not user_doc or not verify_password(form_data.password, user_doc["hashed_password"]) or user_doc.get("role") != "user":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password, or not a valid user account",
        )
        
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user_doc["_id"])}, expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_role": "user"
    }

@router.post("/login/coach", response_model=Token)
def login_coach(request: Request, form_data: OAuth2PasswordRequestForm = Depends()):
    db = request.app.database
    user_doc = db.users.find_one({"email": form_data.username})
    
    if not user_doc or not verify_password(form_data.password, user_doc["hashed_password"]) or user_doc.get("role") != "coach":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password, or not a valid coach account",
        )
        
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user_doc["_id"])}, expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_role": "coach"
    }