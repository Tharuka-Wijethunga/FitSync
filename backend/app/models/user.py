from pydantic import BaseModel, Field, EmailStr
from typing import Optional
from uuid import UUID, uuid4

# The alias='_id' tells Pydantic to map the 'id' field to MongoDB's '_id'
# when converting between the model and a dictionary.
class MongoBaseModel(BaseModel):
    id: UUID = Field(default_factory=uuid4, alias="_id")

class UserBase(BaseModel):
    full_name: str
    email: EmailStr
    gym_registration_number: str
    role: str = Field(default="user")

class UserCreate(UserBase):
    password: str

class UserInDB(MongoBaseModel, UserBase):
    hashed_password: str

class User(MongoBaseModel, UserBase):
    pass

class Token(BaseModel):
    access_token: str
    token_type: str
    user_role: str

class PasswordChange(BaseModel):
    current_password: str
    new_password: str