"""Workspace endpoints — projects + AI generations (structured JSON outputs)."""
import os
import uuid
import json
import re
import logging
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, Cookie, Header
from pydantic import BaseModel
from typing import Optional, Literal

from emergentintegrations.llm.chat import LlmChat, UserMessage, TextDelta, StreamDone
from schemas import KIND_LABELS, build_prompt

logger = logging.getLogger(__name__)
EMERGENT_LLM_KEY = os.environ.get("EMERGENT_LLM_KEY")


class ProjectCreate(BaseModel):
    name: str
    tagline: Optional[str] = ""
    industry: Optional[str] = ""
    stage: Optional[str] = "Idea"


class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    tagline: Optional[str] = None
    industry: Optional[str] = None
    stage: Optional[str] = None


class GenerateRequest(BaseModel):
    project_id: str
    kind: Literal[
        "swot", "business_model_canvas", "go_to_market", "marketing_plan",
        "brand_strategy", "one_minute_pitch", "pitch_deck", "vc_score",
        "customer_persona", "competitor_analysis",
    ]


def _parse_json_response(text: str) -> dict:
    """Best-effort JSON parse. Strips code fences, extracts first {...} block if needed."""
    t = text.strip()
    # Strip ```json ... ``` or ``` ... ``` fences
    if t.startswith("```"):
        t = re.sub(r"^```[a-zA-Z]*\n?", "", t)
        t = re.sub(r"\n?```\s*$", "", t)
    try:
        return json.loads(t)
    except Exception:
        m = re.search(r"\{[\s\S]*\}", t)
        if m:
            return json.loads(m.group(0))
        raise


def build_workspace_router(db, get_user_from_request):
    router = APIRouter(prefix="/api/workspace", tags=["workspace"])

    async def _require_user(session_token, authorization):
        user = await get_user_from_request(session_token, authorization)
        if not user:
            raise HTTPException(status_code=401, detail="Not authenticated")
        return user

    @router.get("/projects")
    async def list_projects(
        session_token: Optional[str] = Cookie(default=None),
        authorization: Optional[str] = Header(default=None),
    ):
        user = await _require_user(session_token, authorization)
        items = await db.projects.find({"user_id": user["user_id"]}, {"_id": 0}).to_list(200)
        items.sort(key=lambda p: p.get("created_at", ""), reverse=True)
        return items

    @router.post("/projects")
    async def create_project(
        payload: ProjectCreate,
        session_token: Optional[str] = Cookie(default=None),
        authorization: Optional[str] = Header(default=None),
    ):
        user = await _require_user(session_token, authorization)
        pid = f"proj_{uuid.uuid4().hex[:10]}"
        doc = {
            "project_id": pid,
            "user_id": user["user_id"],
            "name": payload.name,
            "tagline": payload.tagline or "",
            "industry": payload.industry or "",
            "stage": payload.stage or "Idea",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "is_demo": False,
        }
        await db.projects.insert_one(doc)
        doc.pop("_id", None)
        return doc

    @router.patch("/projects/{project_id}")
    async def update_project(
        project_id: str,
        payload: ProjectUpdate,
        session_token: Optional[str] = Cookie(default=None),
        authorization: Optional[str] = Header(default=None),
    ):
        user = await _require_user(session_token, authorization)
        upd = {k: v for k, v in payload.model_dump().items() if v is not None}
        if not upd:
            raise HTTPException(status_code=400, detail="Nothing to update")
        res = await db.projects.update_one(
            {"project_id": project_id, "user_id": user["user_id"]}, {"$set": upd}
        )
        if res.matched_count == 0:
            raise HTTPException(status_code=404, detail="Project not found")
        doc = await db.projects.find_one({"project_id": project_id}, {"_id": 0})
        return doc

    @router.delete("/projects/{project_id}")
    async def delete_project(
        project_id: str,
        session_token: Optional[str] = Cookie(default=None),
        authorization: Optional[str] = Header(default=None),
    ):
        user = await _require_user(session_token, authorization)
        res = await db.projects.delete_one({"project_id": project_id, "user_id": user["user_id"]})
        if res.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Project not found")
        await db.generations.delete_many({"project_id": project_id, "user_id": user["user_id"]})
        return {"ok": True}

    @router.post("/generate")
    async def generate(
        payload: GenerateRequest,
        session_token: Optional[str] = Cookie(default=None),
        authorization: Optional[str] = Header(default=None),
    ):
        user = await _require_user(session_token, authorization)
        project = await db.projects.find_one(
            {"project_id": payload.project_id, "user_id": user["user_id"]}, {"_id": 0}
        )
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")

        prompt = build_prompt(payload.kind, project)
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"gen-{payload.project_id}-{payload.kind}-{uuid.uuid4().hex[:6]}",
            system_message=(
                "You are STUDLYF AI. ALWAYS reply with a single valid JSON object only. "
                "No markdown, no code fences, no commentary."
            ),
        ).with_model("gemini", "gemini-3-flash-preview")

        try:
            full = ""
            async for ev in chat.stream_message(UserMessage(text=prompt)):
                if isinstance(ev, TextDelta):
                    full += ev.content
                elif isinstance(ev, StreamDone):
                    break
        except Exception as e:
            logger.exception("Generation failed")
            raise HTTPException(status_code=500, detail=f"Generation failed: {e}")

        # Parse JSON output
        try:
            data = _parse_json_response(full)
        except Exception as e:
            logger.warning(f"Could not parse JSON for kind={payload.kind}: {e}\nRaw: {full[:400]}")
            raise HTTPException(status_code=502, detail="AI returned invalid JSON. Try regenerating.")

        gid = f"gen_{uuid.uuid4().hex[:10]}"
        doc = {
            "generation_id": gid,
            "user_id": user["user_id"],
            "project_id": payload.project_id,
            "kind": payload.kind,
            "label": KIND_LABELS[payload.kind],
            "data": data,
            "raw": full,
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
        await db.generations.insert_one(doc)
        doc.pop("_id", None)
        return doc

    @router.get("/generations")
    async def list_generations(
        project_id: Optional[str] = None,
        kind: Optional[str] = None,
        session_token: Optional[str] = Cookie(default=None),
        authorization: Optional[str] = Header(default=None),
    ):
        user = await _require_user(session_token, authorization)
        q = {"user_id": user["user_id"]}
        if project_id:
            q["project_id"] = project_id
        if kind:
            q["kind"] = kind
        items = await db.generations.find(q, {"_id": 0}).to_list(500)
        items.sort(key=lambda x: x.get("created_at", ""), reverse=True)
        return items

    @router.delete("/generations/{generation_id}")
    async def delete_generation(
        generation_id: str,
        session_token: Optional[str] = Cookie(default=None),
        authorization: Optional[str] = Header(default=None),
    ):
        user = await _require_user(session_token, authorization)
        res = await db.generations.delete_one(
            {"generation_id": generation_id, "user_id": user["user_id"]}
        )
        if res.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Not found")
        return {"ok": True}

    @router.get("/dashboard")
    async def dashboard(
        project_id: Optional[str] = None,
        session_token: Optional[str] = Cookie(default=None),
        authorization: Optional[str] = Header(default=None),
    ):
        """Aggregate latest generations into a dashboard scorecard."""
        user = await _require_user(session_token, authorization)
        if not project_id:
            proj = await db.projects.find_one({"user_id": user["user_id"]}, {"_id": 0})
            if not proj:
                return {"scores": {}, "kpis": [], "latest": []}
            project_id = proj["project_id"]
        else:
            proj = await db.projects.find_one(
                {"project_id": project_id, "user_id": user["user_id"]}, {"_id": 0}
            )
            if not proj:
                raise HTTPException(status_code=404, detail="Project not found")

        gens = await db.generations.find(
            {"user_id": user["user_id"], "project_id": project_id}, {"_id": 0}
        ).to_list(500)
        gens.sort(key=lambda x: x.get("created_at", ""), reverse=True)

        latest_by_kind = {}
        for g in gens:
            if g["kind"] not in latest_by_kind:
                latest_by_kind[g["kind"]] = g

        def _score(kind, *paths, default=None):
            g = latest_by_kind.get(kind)
            if not g:
                return default
            cur = g.get("data") or {}
            for p in paths:
                if cur is None:
                    return default
                cur = cur.get(p) if isinstance(cur, dict) else None
            return cur if isinstance(cur, (int, float)) else default

        scores = {
            "business_health": _score("swot", "scores", "overall"),
            "vc_score":        _score("vc_score", "overall_score"),
            "marketing":       _score("marketing_plan", "scores", "overall"),
            "brand":           _score("brand_strategy", "score"),
            "pitch":           _score("pitch_deck", "score"),
        }
        defined = [v for v in scores.values() if isinstance(v, (int, float))]
        scores["overall_ai"] = round(sum(defined) / len(defined), 1) if defined else None

        return {
            "project": proj,
            "scores": scores,
            "counts": {
                "generations": len(gens),
                "unique_tools": len(latest_by_kind),
            },
            "latest": [
                {"kind": k, "label": v.get("label"), "created_at": v.get("created_at"),
                 "generation_id": v.get("generation_id")}
                for k, v in latest_by_kind.items()
            ],
        }

    return router
