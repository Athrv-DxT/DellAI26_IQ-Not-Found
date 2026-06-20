from pydantic import BaseModel, EmailStr, Field, HttpUrl
from typing import List, Optional
from uuid import UUID
from datetime import datetime

# ==========================================
# Auth Schemas
# ==========================================
class UserBase(BaseModel):
    name: str = Field(..., max_length=100)
    email: EmailStr
    role: str = Field(..., description="participant, organizer, reviewer, admin")
    gender: Optional[str] = None
    institution: Optional[str] = None
    location: Optional[str] = None

class UserRegister(UserBase):
    password: str = Field(..., min_length=6)
    bio: Optional[str] = None  # Raw text to extract skills
    skills: Optional[List[str]] = []

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class RefreshTokenRequest(BaseModel):
    refresh_token: str

class UserResponse(UserBase):
    id: UUID
    skills: List[str]
    created_at: datetime

    class Config:
        from_attributes = True

# ==========================================
# Event Schemas
# ==========================================
class EventBase(BaseModel):
    title: str = Field(..., max_length=200)
    theme: Optional[str] = None
    description: Optional[str] = None
    max_teams: int = Field(100, ge=1)
    team_size: int = Field(4, ge=1)
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None

class EventCreate(EventBase):
    pass

class EventResponse(EventBase):
    id: UUID
    status: str
    organizer_id: Optional[UUID]
    created_at: datetime

    class Config:
        from_attributes = True

# ==========================================
# Team & Registration Schemas
# ==========================================
class TeamCreate(BaseModel):
    name: str = Field(..., max_length=100)

class TeamResponse(BaseModel):
    id: UUID
    event_id: UUID
    name: str
    members: List[UUID]
    created_at: datetime

    class Config:
        from_attributes = True

# ==========================================
# Submission Schemas
# ==========================================
class SubmissionCreate(BaseModel):
    title: str = Field(..., max_length=200)
    description: Optional[str] = None
    github_url: Optional[str] = None
    demo_url: Optional[str] = None
    video_url: Optional[str] = None
    track: Optional[str] = None
    tags: List[str] = []

class SubmissionResponse(SubmissionCreate):
    id: UUID
    team_id: UUID
    event_id: UUID
    submitted_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# ==========================================
# Scoring & Assignment Schemas
# ==========================================
class AssignmentResponse(BaseModel):
    id: UUID
    reviewer_id: UUID
    submission_id: UUID
    expertise_score: Optional[float] = None
    conflict_flag: bool
    conflict_reason: Optional[str] = None
    assigned_at: datetime

    class Config:
        from_attributes = True

class ScoreSubmit(BaseModel):
    innovation: float = Field(..., ge=0, le=10)
    tech_complexity: float = Field(..., ge=0, le=10)
    feasibility: float = Field(..., ge=0, le=10)
    presentation: float = Field(..., ge=0, le=10)
    overall_comment: Optional[str] = None

class ScoreResponse(BaseModel):
    id: UUID
    assignment_id: UUID
    innovation: float
    tech_complexity: float
    feasibility: float
    presentation: float
    overall_comment: Optional[str] = None
    final_score: float
    bias_flag: bool
    bias_type: Optional[str] = None
    submitted_at: datetime

    class Config:
        from_attributes = True

# ==========================================
# Results & Bias Schemas
# ==========================================
class ResultResponse(BaseModel):
    id: UUID
    event_id: UUID
    team_id: UUID
    final_score: float
    rank: int
    confidence: Optional[float] = None
    feedback: Optional[str] = None
    generated_at: datetime

    class Config:
        from_attributes = True

class BiasAlertResponse(BaseModel):
    id: UUID
    event_id: UUID
    score_id: UUID
    bias_type: str
    z_score: float
    reviewer_id: UUID
    submission_id: UUID
    resolved: bool
    fired_at: datetime

    class Config:
        from_attributes = True
