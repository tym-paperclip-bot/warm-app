from datetime import datetime, timedelta, timezone

from authlib.integrations.httpx_client import AsyncOAuth2Client
from fastapi import Cookie, HTTPException, status
from jose import JWTError, jwt

from app.config import settings

GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo"

REDIRECT_URI = f"{settings.base_url}/auth/callback"


def _oauth_client() -> AsyncOAuth2Client:
    return AsyncOAuth2Client(
        client_id=settings.google_client_id,
        client_secret=settings.google_client_secret,
        redirect_uri=REDIRECT_URI,
        scope="openid email profile",
    )


async def get_google_auth_url() -> str:
    async with _oauth_client() as client:
        url, _ = client.create_authorization_url(GOOGLE_AUTH_URL)
    return url


async def exchange_code_for_email(code: str) -> str:
    async with _oauth_client() as client:
        await client.fetch_token(GOOGLE_TOKEN_URL, code=code)
        resp = await client.get(GOOGLE_USERINFO_URL)
    resp.raise_for_status()
    return resp.json()["email"].lower()


def create_jwt(email: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.jwt_expire_minutes)
    return jwt.encode(
        {"sub": email, "exp": expire},
        settings.jwt_secret,
        algorithm=settings.jwt_algorithm,
    )


def _decode_jwt(token: str) -> str:
    try:
        payload = jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])
        email: str = payload["sub"]
        return email
    except (JWTError, KeyError):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")


def require_auth(access_token: str | None = Cookie(default=None)) -> str:
    if not access_token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    email = _decode_jwt(access_token)
    if email not in settings.allowed_email_set:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    return email
