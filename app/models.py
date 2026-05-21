from datetime import datetime
from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Table
from sqlalchemy.orm import relationship

from app.database import Base


# M2M join table for WarmupSession ↔ Exercise, with ordering
session_exercises = Table(
    "session_exercises",
    Base.metadata,
    Column("session_id", Integer, ForeignKey("warmup_sessions.id"), primary_key=True),
    Column("exercise_id", Integer, ForeignKey("exercises.id"), primary_key=True),
    Column("position", Integer, nullable=False, default=0),
)


class Equipment(Base):
    __tablename__ = "equipment"

    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False, unique=True)

    exercises = relationship("Exercise", back_populates="equipment")


class BodyPart(Base):
    __tablename__ = "body_parts"

    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False, unique=True)

    exercises = relationship("Exercise", back_populates="body_part")


class Exercise(Base):
    __tablename__ = "exercises"

    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    body_part_id = Column(Integer, ForeignKey("body_parts.id"), nullable=False)
    equipment_id = Column(Integer, ForeignKey("equipment.id"), nullable=True)
    video_url = Column(String, nullable=False)
    video_provider = Column(String, nullable=False, default="youtube")
    notes = Column(String, nullable=True)
    timestamp = Column(String, nullable=True)
    from_who = Column(String, nullable=True)

    body_part = relationship("BodyPart", back_populates="exercises")
    equipment = relationship("Equipment", back_populates="exercises")
    sessions = relationship("WarmupSession", secondary=session_exercises, back_populates="exercises")


class WarmupSession(Base):
    __tablename__ = "warmup_sessions"

    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False, server_default="Session")
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)

    exercises = relationship(
        "Exercise",
        secondary=session_exercises,
        back_populates="sessions",
        order_by=session_exercises.c.position,
    )
