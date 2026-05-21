import random

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.auth import require_auth
from app.database import get_db
from app.models import Exercise
from app.schemas import ExerciseOut

router = APIRouter(prefix="/exercises", tags=["exercises"])


@router.get("", response_model=list[ExerciseOut])
def list_exercises(
    body_part_id: int | None = Query(default=None),
    equipment_id: int | None = Query(default=None),
    db: Session = Depends(get_db),
    _: str = Depends(require_auth),
):
    q = db.query(Exercise)
    if body_part_id is not None:
        q = q.filter(Exercise.body_part_id == body_part_id)
    if equipment_id is not None:
        q = q.filter(Exercise.equipment_id == equipment_id)
    return q.all()


@router.get("/random", response_model=list[ExerciseOut])
def random_warmup(
    count: int = Query(default=6, ge=1, le=20),
    equipment_id: int | None = Query(default=None),
    db: Session = Depends(get_db),
    _: str = Depends(require_auth),
):
    q = db.query(Exercise)
    if equipment_id is not None:
        q = q.filter(Exercise.equipment_id == equipment_id)
    exercises = q.all()

    # Group by body part and pick one per part (round-robin shuffle)
    by_part: dict[int, list[Exercise]] = {}
    for ex in exercises:
        by_part.setdefault(ex.body_part_id, []).append(ex)

    for part_exercises in by_part.values():
        random.shuffle(part_exercises)

    # Interleave one from each body part until we hit count or run out
    result: list[Exercise] = []
    parts = list(by_part.values())
    random.shuffle(parts)
    i = 0
    while len(result) < count:
        added_any = False
        for part_pool in parts:
            if len(result) >= count:
                break
            if i < len(part_pool):
                result.append(part_pool[i])
                added_any = True
        i += 1
        if not added_any:
            break

    random.shuffle(result)
    return result
