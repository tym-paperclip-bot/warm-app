from datetime import datetime
from pydantic import BaseModel


class EquipmentOut(BaseModel):
    id: int
    name: str

    model_config = {"from_attributes": True}


class BodyPartOut(BaseModel):
    id: int
    name: str

    model_config = {"from_attributes": True}


class ExerciseOut(BaseModel):
    id: int
    name: str
    body_part: BodyPartOut
    equipment: EquipmentOut | None
    video_url: str
    video_provider: str
    notes: str | None
    timestamp: str | None
    from_who: str | None

    model_config = {"from_attributes": True}


class SessionCreate(BaseModel):
    exercise_ids: list[int]
    name: str = "Session"


class SessionRename(BaseModel):
    name: str


class SessionOut(BaseModel):
    id: int
    name: str
    created_at: datetime
    exercises: list[ExerciseOut]

    model_config = {"from_attributes": True}


class SessionSummary(BaseModel):
    id: int
    name: str
    created_at: datetime
    exercise_count: int
    exercise_ids: list[int]

    model_config = {"from_attributes": True}
