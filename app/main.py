from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import Depends, FastAPI, Response
from fastapi.responses import FileResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles

from app.admin import setup_admin
from app.auth import create_jwt, exchange_code_for_email, get_google_auth_url, require_auth
from app.config import settings
from app.database import Base, engine
from app.routes.exercises import router as exercises_router
from app.routes.sessions import router as sessions_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(title="Warm-Up Manager", lifespan=lifespan)

setup_admin(app, engine)

app.include_router(exercises_router)
app.include_router(sessions_router)


@app.get("/health", tags=["meta"])
def health():
    return {"status": "ok"}


@app.get("/auth/login", tags=["auth"])
async def login():
    url = await get_google_auth_url()
    return RedirectResponse(url)


@app.get("/auth/callback", tags=["auth"])
async def auth_callback(code: str, response: Response):
    email = await exchange_code_for_email(code)
    if email not in settings.allowed_email_set:
        return Response(status_code=403, content="Access denied")
    token = create_jwt(email)
    response = RedirectResponse(url=settings.frontend_url)
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        samesite="lax",
        secure=settings.base_url.startswith("https"),
        max_age=settings.jwt_expire_minutes * 60,
    )
    return response


@app.get("/auth/me", tags=["auth"])
def me(email: str = Depends(require_auth)):
    return {"email": email}


# Serve built React frontend — must be registered last
_frontend_dist = Path(__file__).parent.parent / "frontend" / "dist"
if _frontend_dist.exists():
    app.mount("/assets", StaticFiles(directory=_frontend_dist / "assets"), name="assets")

    @app.get("/{full_path:path}", include_in_schema=False)
    async def spa_fallback(full_path: str):
        return FileResponse(_frontend_dist / "index.html")
