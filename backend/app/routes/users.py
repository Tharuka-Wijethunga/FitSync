# backend/app/routes/users.py

from fastapi import APIRouter, Depends, Request, HTTPException, status
from ..models.user import PasswordChange, User
from ..core.security import verify_password, get_password_hash
from ..core.auth import get_current_active_user

router = APIRouter()

@router.get("/me", response_model=User)
def read_users_me(current_user: User = Depends(get_current_active_user)):
    return current_user

@router.post("/change-password")
def change_password(
    password_data: PasswordChange,
    request: Request,
    current_user: User = Depends(get_current_active_user)
):
    """
    Allows an authenticated user to change their password.
    """
    db = request.app.database
    
    # 1. Fetch the full user document from DB to get the hashed password
    user_doc = db.users.find_one({"_id": current_user.id})
    if not user_doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    # 2. Verify the current password
    if not verify_password(password_data.current_password, user_doc["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect current password."
        )

    # 3. Hash the new password
    new_hashed_password = get_password_hash(password_data.new_password)
    
    # 4. Update the password in the database
    db.users.update_one(
        {"_id": current_user.id},
        {"$set": {"hashed_password": new_hashed_password}}
    )
    
    return {"message": "Password updated successfully"}