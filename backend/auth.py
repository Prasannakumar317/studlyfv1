"""Authentication module - Emergent Google Auth integration."""
import os
import uuid
import logging
import httpx
from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, HTTPException, Request, Response, Cookie, Header
from pydantic import BaseModel

EMERGENT_AUTH_URL = "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data"
SESSION_DAYS = 7

logger = logging.getLogger(__name__)


class SessionRequest(BaseModel):
    session_id: str


class UserPublic(BaseModel):
    user_id: str
    email: str
    name: str
    picture: str | None = None


def build_auth_router(db):
    router = APIRouter(prefix="/api/auth", tags=["auth"])

    async def _seed_demo_project(user_id: str):
        existing = await db.projects.find_one({"user_id": user_id}, {"_id": 0})
        if existing:
            return
        pid = f"proj_{uuid.uuid4().hex[:10]}"
        await db.projects.insert_one({
            "project_id": pid,
            "user_id": user_id,
            "name": "Lumen Labs",
            "tagline": "An EV charging marketplace for fleets and prosumers.",
            "industry": "Cleantech / Mobility",
            "stage": "Pre-seed",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "is_demo": True,
        })

    async def get_user_from_request(
        session_token_cookie: str | None,
        authorization: str | None,
    ) -> dict | None:
        token = session_token_cookie
        if not token and authorization and authorization.lower().startswith("bearer "):
            token = authorization.split(" ", 1)[1].strip()
        if not token:
            return None
        sess = await db.user_sessions.find_one({"session_token": token}, {"_id": 0})
        if not sess:
            return None
        expires_at = sess.get("expires_at")
        if isinstance(expires_at, str):
            expires_at = datetime.fromisoformat(expires_at)
        if expires_at and expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)
        if expires_at and expires_at < datetime.now(timezone.utc):
            return None
        user = await db.users.find_one({"user_id": sess["user_id"]}, {"_id": 0})
        return user

    @router.post("/session")
    async def exchange_session(
        payload: SessionRequest,
        response: Response,
    ):
        """Exchange session_id (from URL fragment) for a session_token cookie."""
        async with httpx.AsyncClient(timeout=15.0) as cli:
            r = await cli.get(EMERGENT_AUTH_URL, headers={"X-Session-ID": payload.session_id})
        if r.status_code != 200:
            raise HTTPException(status_code=401, detail="Invalid session_id")
        data = r.json()
        email = (data.get("email") or "").lower()
        if not email:
            raise HTTPException(status_code=400, detail="No email returned")

        # Upsert user (custom user_id)
        existing = await db.users.find_one({"email": email}, {"_id": 0})
        if existing:
            user_id = existing["user_id"]
            await db.users.update_one(
                {"user_id": user_id},
                {"$set": {"name": data.get("name") or existing.get("name"),
                          "picture": data.get("picture") or existing.get("picture"),
                          "last_login": datetime.now(timezone.utc).isoformat()}},
            )
        else:
            user_id = f"user_{uuid.uuid4().hex[:12]}"
            await db.users.insert_one({
                "user_id": user_id,
                "email": email,
                "name": data.get("name") or email.split("@")[0],
                "picture": data.get("picture"),
                "created_at": datetime.now(timezone.utc).isoformat(),
                "last_login": datetime.now(timezone.utc).isoformat(),
            })

        # Seed a demo project for new users
        await _seed_demo_project(user_id)

        # Create session
        token = data.get("session_token") or uuid.uuid4().hex
        expires_at = datetime.now(timezone.utc) + timedelta(days=SESSION_DAYS)
        await db.user_sessions.insert_one({
            "user_id": user_id,
            "session_token": token,
            "expires_at": expires_at.isoformat(),
            "created_at": datetime.now(timezone.utc).isoformat(),
        })

        response.set_cookie(
            key="session_token",
            value=token,
            httponly=True,
            secure=True,
            samesite="none",
            path="/",
            max_age=SESSION_DAYS * 24 * 60 * 60,
        )
        return {"user_id": user_id, "email": email, "name": data.get("name"),
                "picture": data.get("picture"), "session_token": token}

    @router.get("/me", response_model=UserPublic)
    async def me(
        session_token: str | None = Cookie(default=None),
        authorization: str | None = Header(default=None),
    ):
        user = await get_user_from_request(session_token, authorization)
        if not user:
            raise HTTPException(status_code=401, detail="Not authenticated")
        return UserPublic(
            user_id=user["user_id"],
            email=user["email"],
            name=user.get("name") or user["email"],
            picture=user.get("picture"),
        )

    @router.post("/logout")
    async def logout(
        response: Response,
        session_token: str | None = Cookie(default=None),
        authorization: str | None = Header(default=None),
    ):
        token = session_token
        if not token and authorization and authorization.lower().startswith("bearer "):
            token = authorization.split(" ", 1)[1].strip()
        if token:
            await db.user_sessions.delete_one({"session_token": token})
        response.delete_cookie("session_token", path="/")
        return {"ok": True}

    return router, get_user_from_request
