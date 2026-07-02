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

from gemini_client import LlmChat, UserMessage, TextDelta, StreamDone, AiProviderError
from schemas import KIND_LABELS, build_prompt, SCHEMAS

logger = logging.getLogger(__name__)
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")


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
        if not session_token and not authorization:
            raise HTTPException(status_code=401, detail="Authentication failed: Session token or JWT Authorization header is missing.")
        user = await get_user_from_request(session_token, authorization)
        if not user:
            raise HTTPException(status_code=401, detail="Authentication failed: Invalid session or JWT token.")
        if not user.get("user_id"):
            raise HTTPException(status_code=401, detail="Authentication failed: User ID not found in token payload.")
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
        start_time = datetime.now(timezone.utc)
        import traceback
        
        try:
            # Step 1: User authentication check
            user = await _require_user(session_token, authorization)
            print("[OK] User authenticated")
            
            # Step 2: Database query check
            project = await db.projects.find_one(
                {"project_id": payload.project_id, "user_id": user["user_id"]}, {"_id": 0}
            )
            if not project:
                raise HTTPException(status_code=404, detail="Project not found")
            print("[OK] Workspace loaded")
            
            # Step 3: Default any null required fields to avoid crashes
            default_project = {
                "name": project.get("name") or "My Startup",
                "tagline": project.get("tagline") or "",
                "industry": project.get("industry") or "",
                "stage": project.get("stage") or "Idea",
                "problem": project.get("problem") or "",
                "solution": project.get("solution") or "",
                "market": project.get("market") or "",
                "competitors": project.get("competitors") or "",
                "customer personas": project.get("customer personas") or "",
                "strategy": project.get("strategy") or "",
                "marketing": project.get("marketing") or "",
                "funding": project.get("funding") or ""
            }
            print("[OK] Startup data loaded")
            
            # Step 4: Prompt generation
            prompt = build_prompt(payload.kind, default_project)
            
            # Check prompt size limits
            if len(prompt) > 24000:
                logger.info("Prompt length is large. Summarizing workspace details context.")
                schema = SCHEMAS[payload.kind]
                prompt = (
                    f"You are STUDLYF AI, an expert startup strategist generating data for an executive dashboard.\n\n"
                    f"Project details (Summarized):\n"
                    f"- Name: {default_project['name']}\n"
                    f"- Tagline: {default_project['tagline']}\n"
                    f"- Industry: {default_project['industry']}\n"
                    f"- Stage: {default_project['stage']}\n"
                    f"- Problem: {default_project['problem'][:1000]}\n"
                    f"- Solution: {default_project['solution'][:1000]}\n\n"
                    f"Task: Generate a {KIND_LABELS[payload.kind]} for this startup. Output a SINGLE JSON object. "
                    f"No prose, no markdown fences, no commentary — just the JSON. "
                    f"Match this exact schema:\n\n{schema}\n\n"
                    f"Rules:\n"
                    f"- Be specific. Return STRICT JSON only.\n"
                )
            print("[OK] Prompt generated")
            
            chat = LlmChat(
                api_key=GEMINI_API_KEY,
                session_id=f"gen-{payload.project_id}-{payload.kind}-{uuid.uuid4().hex[:6]}",
                system_message=(
                    "You are STUDLYF AI. ALWAYS reply with a single valid JSON object only. "
                    "No markdown, no code fences, no commentary."
                ),
            ).with_model("gemini", "gemini-3-flash-preview")
            
            # Step 5: AI generation calls (with JSON parsing validation and automatic retry)
            data = None
            full = ""
            last_error = None
            print("[OK] AI request started")
            
            for attempt in range(3):
                try:
                    full = ""
                    async for ev in chat.stream_message(UserMessage(text=prompt)):
                        if isinstance(ev, TextDelta):
                            full += ev.content
                        elif isinstance(ev, StreamDone):
                            break
                    
                    data = _parse_json_response(full)
                    print("[OK] JSON parsed")
                    last_error = None
                    break  # success!
                except json.JSONDecodeError as jde:
                    logger.warning(f"JSON parse attempt {attempt + 1} failed for kind={payload.kind}: {jde}")
                    last_error = jde
                except Exception as ex:
                    logger.warning(f"AI generation call attempt {attempt + 1} failed for kind={payload.kind}: {ex}")
                    last_error = ex
            
            if last_error:
                raise last_error
                
            print("[OK] AI response received")
            
            # Step 6: Insert document in database
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
            
            print("[OK] Response sent")
            return doc
            
        except AiProviderError as ape:
            print("[ERROR] AI Generation failed at provider stage")
            traceback.print_exc()
            raise HTTPException(
                status_code=502,
                detail={
                    "error": str(ape),
                    "api_status": 502,
                    "provider": ape.provider,
                    "model": ape.model,
                    "provider_status": ape.status_code,
                    "response_time": f"{round((datetime.now(timezone.utc) - start_time).total_seconds(), 2)}s",
                    "request_id": f"req_{uuid.uuid4().hex[:8]}",
                    "raw_response": ape.raw_response
                }
            )
        except Exception as e:
            print("[ERROR] Generation failed in pipeline")
            traceback.print_exc()
            raise HTTPException(
                status_code=502,
                detail={
                    "error": str(e),
                    "api_status": getattr(e, "status_code", 502),
                    "provider": "Unknown",
                    "model": "Unknown",
                    "provider_status": getattr(e, "status_code", 500) if hasattr(e, "status_code") else 500,
                    "response_time": f"{round((datetime.now(timezone.utc) - start_time).total_seconds(), 2)}s",
                    "request_id": f"req_{uuid.uuid4().hex[:8]}"
                }
            )

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
