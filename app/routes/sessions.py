from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.auth import require_auth
from app.database import get_db
from app.models import Exercise, WarmupSession, session_exercises
from app.schemas import SessionCreate, SessionOut, SessionRename, SessionSummary

router = APIRouter(prefix="/sessions", tags=["sessions"])


@router.post("", response_model=SessionOut, status_code=status.HTTP_201_CREATED)
def create_session(
    body: SessionCreate,
    db: Session = Depends(get_db),
    _: str = Depends(require_auth),
):
    if not body.exercise_ids:
        raise HTTPException(status_code=400, detail="exercise_ids must not be empty")

    exercises = db.query(Exercise).filter(Exercise.id.in_(body.exercise_ids)).all()
    found_ids = {ex.id for ex in exercises}
    missing = set(body.exercise_ids) - found_ids
    if missing:
        raise HTTPException(status_code=404, detail=f"Exercises not found: {sorted(missing)}")

    session = WarmupSession(name=body.name)
    db.add(session)
    db.flush()  # get session.id before inserting join rows

    ordered = {eid: pos for pos, eid in enumerate(body.exercise_ids)}
    for ex in exercises:
        db.execute(
            session_exercises.insert().values(
                session_id=session.id,
                exercise_id=ex.id,
                position=ordered[ex.id],
            )
        )

    db.commit()
    db.refresh(session)
    return session


@router.get("", response_model=list[SessionSummary])
def list_sessions(
    db: Session = Depends(get_db),
    _: str = Depends(require_auth),
):
    sessions = db.query(WarmupSession).order_by(WarmupSession.created_at.desc()).all()
    return [
        SessionSummary(
            id=s.id,
            name=s.name,
            created_at=s.created_at,
            exercise_count=len(s.exercises),
            exercise_ids=[e.id for e in s.exercises],
        )
        for s in sessions
    ]


@router.get("/{session_id}", response_model=SessionOut)
def get_session(
    session_id: int,
    db: Session = Depends(get_db),
    _: str = Depends(require_auth),
):
    session = db.get(WarmupSession, session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session


@router.patch("/{session_id}", response_model=SessionSummary)
def rename_session(
    session_id: int,
    body: SessionRename,
    db: Session = Depends(get_db),
    _: str = Depends(require_auth),
):
    session = db.get(WarmupSession, session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    session.name = body.name.strip() or session.name
    db.commit()
    db.refresh(session)
    return SessionSummary(
        id=session.id,
        name=session.name,
        created_at=session.created_at,
        exercise_count=len(session.exercises),
        exercise_ids=[e.id for e in session.exercises],
    )


@router.delete("/{session_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_session(
    session_id: int,
    db: Session = Depends(get_db),
    _: str = Depends(require_auth),
):
    session = db.get(WarmupSession, session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    db.delete(session)
    db.commit()
