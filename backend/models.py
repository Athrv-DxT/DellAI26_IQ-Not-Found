import uuid
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, ForeignKey, Text, Table, Index
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, nullable=False, index=True)
    password = Column(String(255), nullable=False)  # bcrypt hashed
    role = Column(String(20), nullable=False)  # participant, organizer, reviewer, admin
    skills = Column(ARRAY(Text), default=[])  # Extracted by spaCy NER
    gender = Column(String(20), nullable=True)  # bias monitoring
    institution = Column(String(150), nullable=True)  # bias monitoring
    location = Column(String(100), nullable=True)  # bias monitoring
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    reviewer_profile = relationship("ReviewerProfile", back_populates="user", uselist=False)
    created_events = relationship("Event", back_populates="organizer")

class Event(Base):
    __tablename__ = "events"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(200), nullable=False)
    theme = Column(Text, nullable=True)
    description = Column(Text, nullable=True)
    status = Column(String(20), nullable=False, default="draft")  # draft, published, registration, hacking, judging, closed
    max_teams = Column(Integer, default=100)
    team_size = Column(Integer, default=4)
    start_time = Column(DateTime(timezone=True), nullable=True)
    end_time = Column(DateTime(timezone=True), nullable=True)
    organizer_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    organizer = relationship("User", back_populates="created_events")
    teams = relationship("Team", back_populates="event", cascade="all, delete-orphan")
    submissions = relationship("Submission", back_populates="event")
    results = relationship("Result", back_populates="event")
    bias_alerts = relationship("BiasAlert", back_populates="event")

class Team(Base):
    __tablename__ = "teams"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    event_id = Column(UUID(as_uuid=True), ForeignKey("events.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(100), nullable=False)
    members = Column(ARRAY(UUID(as_uuid=True)), default=[])  # array of user IDs
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    event = relationship("Event", back_populates="teams")
    submission = relationship("Submission", back_populates="team", uselist=False, cascade="all, delete-orphan")
    results = relationship("Result", back_populates="team")

class Submission(Base):
    __tablename__ = "submissions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    team_id = Column(UUID(as_uuid=True), ForeignKey("teams.id", ondelete="CASCADE"), nullable=False, index=True)
    event_id = Column(UUID(as_uuid=True), ForeignKey("events.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    github_url = Column(String(500), nullable=True)
    demo_url = Column(String(500), nullable=True)
    video_url = Column(String(500), nullable=True)
    track = Column(String(100), nullable=True)
    tags = Column(ARRAY(Text), default=[])  # tech stack tags
    submitted_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    team = relationship("Team", back_populates="submission")
    event = relationship("Event", back_populates="submissions")
    assignments = relationship("Assignment", back_populates="submission", cascade="all, delete-orphan")

class ReviewerProfile(Base):
    __tablename__ = "reviewer_profiles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True)
    expertise_areas = Column(ARRAY(Text), default=[])
    max_assignments = Column(Integer, default=5)
    current_load = Column(Integer, default=0)

    # Relationships
    user = relationship("User", back_populates="reviewer_profile")

class Assignment(Base):
    __tablename__ = "assignments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    reviewer_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    submission_id = Column(UUID(as_uuid=True), ForeignKey("submissions.id", ondelete="CASCADE"), nullable=False)
    expertise_score = Column(Float, nullable=True)
    conflict_flag = Column(Boolean, default=False)
    conflict_reason = Column(String(200), nullable=True)
    assigned_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    submission = relationship("Submission", back_populates="assignments")
    scores = relationship("Score", back_populates="assignment", cascade="all, delete-orphan")

class Score(Base):
    __tablename__ = "scores"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    assignment_id = Column(UUID(as_uuid=True), ForeignKey("assignments.id", ondelete="CASCADE"), nullable=False, index=True)
    innovation = Column(Float, default=0.0)  # 0 to 10
    tech_complexity = Column(Float, default=0.0)  # 0 to 10
    feasibility = Column(Float, default=0.0)  # 0 to 10
    presentation = Column(Float, default=0.0)  # 0 to 10
    overall_comment = Column(Text, nullable=True)
    final_score = Column(Float, default=0.0)  # Weighted average
    bias_flag = Column(Boolean, default=False)
    bias_type = Column(String(50), nullable=True)  # gender, institution, geographic
    bias_confidence = Column(Float, nullable=True)  # z-score
    submitted_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    assignment = relationship("Assignment", back_populates="scores")
    bias_alerts = relationship("BiasAlert", back_populates="score", cascade="all, delete-orphan")

class Result(Base):
    __tablename__ = "results"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    event_id = Column(UUID(as_uuid=True), ForeignKey("events.id", ondelete="CASCADE"), nullable=False, index=True)
    team_id = Column(UUID(as_uuid=True), ForeignKey("teams.id", ondelete="CASCADE"), nullable=False)
    final_score = Column(Float, nullable=False)
    rank = Column(Integer, nullable=False)
    confidence = Column(Float, nullable=True)  # AI ranking confidence
    feedback = Column(Text, nullable=True)  # LLM generated feedback
    generated_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    event = relationship("Event", back_populates="results")
    team = relationship("Team", back_populates="results")

class DuplicateFlag(Base):
    __tablename__ = "duplicate_flags"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    original_user = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    duplicate_user = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    similarity = Column(Float, nullable=False)
    resolved = Column(Boolean, default=False)
    flagged_at = Column(DateTime(timezone=True), server_default=func.now())

class BiasAlert(Base):
    __tablename__ = "bias_alerts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    event_id = Column(UUID(as_uuid=True), ForeignKey("events.id", ondelete="CASCADE"), nullable=False, index=True)
    score_id = Column(UUID(as_uuid=True), ForeignKey("scores.id", ondelete="CASCADE"), nullable=False)
    bias_type = Column(String(50), nullable=False)
    z_score = Column(Float, nullable=False)
    reviewer_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    submission_id = Column(UUID(as_uuid=True), ForeignKey("submissions.id", ondelete="CASCADE"), nullable=False)
    resolved = Column(Boolean, default=False)
    fired_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    event = relationship("Event", back_populates="bias_alerts")
    score = relationship("Score", back_populates="bias_alerts")
