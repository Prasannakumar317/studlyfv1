"""Workspace endpoints — projects + AI generations (SWOT, Marketing Plan, Pitch Deck)."""
import os
import uuid
import logging
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, Cookie, Header
from pydantic import BaseModel
from typing import Optional, List, Literal

from emergentintegrations.llm.chat import LlmChat, UserMessage, TextDelta, StreamDone

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


GENERATION_PROMPTS = {
    "swot": (
        "Generate a structured SWOT analysis for the startup. "
        "Return strict markdown with headings: ## Strengths, ## Weaknesses, ## Opportunities, ## Threats. "
        "Under each, give 4-5 specific bullet points referencing the project's industry and stage."
    ),
    "business_model_canvas": (
        "Generate a Business Model Canvas as markdown with the 9 sections as ## headings: "
        "Customer Segments, Value Propositions, Channels, Customer Relationships, Revenue Streams, "
        "Key Resources, Key Activities, Key Partnerships, Cost Structure. 3-5 concise bullets per section."
    ),
    "go_to_market": (
        "Generate a Go-to-Market strategy as markdown. Sections: ## Target Market, ## Ideal Customer Profile, "
        "## Customer Personas (2), ## Positioning, ## Messaging Framework, ## Marketing Funnel, "
        "## Sales Funnel, ## Distribution Strategy, ## Retention Strategy. Specific to the startup."
    ),
    "marketing_plan": (
        "Generate a 1-page Marketing Plan as markdown with sections: ## Executive Summary, ## Objectives, "
        "## Target Market, ## Channels, ## Campaign Ideas, ## KPIs, ## Budget (rough %), ## 90-day Timeline."
    ),
    "brand_strategy": (
        "Generate a Brand Strategy as markdown. Sections: ## Brand Story, ## Mission, ## Vision, ## Brand Voice, "
        "## Personality (5 traits), ## Positioning Statement, ## Messaging Framework, ## Tagline Options (5)."
    ),
    "one_minute_pitch": (
        "Write a punchy 60-second spoken pitch (~150-180 words). Include hook, problem, solution, market, "
        "business model, traction or proof, and a confident ask. Return as a single block of prose."
    ),
    "pitch_deck": (
        "Generate a 14-slide investor pitch deck. Return markdown with each slide as a ## heading "
        "(## Slide 1 — Cover, ## Slide 2 — Problem, etc.). Under each slide, write 3-6 bullet points of the "
        "key content. Slides: Cover, Problem, Solution, Market Opportunity, Product, Business Model, "
        "Competition, Go-To-Market, Traction, Financials, Roadmap, Team, Investment Ask, Thank You."
    ),
    "vc_score": (
        "Generate an investor VC score report as markdown. Start with ## Overall Score (X.X / 10). Then "
        "## Market Score, ## Product Score, ## Founder Score, ## Traction Score, ## Financial Score, "
        "## Risk Score — each with a numeric score out of 10 and 2-3 bullets justifying. End with "
        "## Investment Recommendation (Pass / Watch / Invest) and a 2-sentence rationale."
    ),
    "customer_persona": (
        "Generate 2 detailed customer personas as markdown. For each: ## Persona Name, then sub-sections: "
        "Demographics, Psychographics, Pain Points, Goals, Buying Behaviour, Objections, A typical day."
    ),
    "competitor_analysis": (
        "Generate a competitor analysis as markdown. Sections: ## Competitor Matrix (5 competitors with "
        "Strengths/Weaknesses), ## Pricing Comparison, ## Feature Comparison, ## Gap Analysis, "
        "## Opportunity Report. Be specific to the industry."
    ),
}

KIND_LABELS = {
    "swot": "SWOT Analysis",
    "business_model_canvas": "Business Model Canvas",
    "go_to_market": "Go-to-Market Strategy",
    "marketing_plan": "Marketing Plan",
    "brand_strategy": "Brand Strategy",
    "one_minute_pitch": "1-Minute Pitch",
    "pitch_deck": "Pitch Deck",
    "vc_score": "VC Score Report",
    "customer_persona": "Customer Personas",
    "competitor_analysis": "Competitor Analysis",
}


def build_workspace_router(db, get_user_from_request):
    router = APIRouter(prefix="/api/workspace", tags=["workspace"])

    async def _require_user(session_token: str | None, authorization: str | None):
        user = await get_user_from_request(session_token, authorization)
        if not user:
            raise HTTPException(status_code=401, detail="Not authenticated")
        return user

    @router.get("/projects")
    async def list_projects(
        session_token: str | None = Cookie(default=None),
        authorization: str | None = Header(default=None),
    ):
        user = await _require_user(session_token, authorization)
        items = await db.projects.find({"user_id": user["user_id"]}, {"_id": 0}).to_list(200)
        items.sort(key=lambda p: p.get("created_at", ""), reverse=True)
        return items

    @router.post("/projects")
    async def create_project(
        payload: ProjectCreate,
        session_token: str | None = Cookie(default=None),
        authorization: str | None = Header(default=None),
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
        session_token: str | None = Cookie(default=None),
        authorization: str | None = Header(default=None),
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
        session_token: str | None = Cookie(default=None),
        authorization: str | None = Header(default=None),
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
        session_token: str | None = Cookie(default=None),
        authorization: str | None = Header(default=None),
    ):
        user = await _require_user(session_token, authorization)
        project = await db.projects.find_one(
            {"project_id": payload.project_id, "user_id": user["user_id"]}, {"_id": 0}
        )
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")

        prompt_extra = GENERATION_PROMPTS[payload.kind]
        context = (
            f"Project Name: {project.get('name')}\n"
            f"Tagline: {project.get('tagline')}\n"
            f"Industry: {project.get('industry')}\n"
            f"Stage: {project.get('stage')}\n\n"
            f"Task: {prompt_extra}"
        )

        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"gen-{payload.project_id}-{payload.kind}",
            system_message=(
                "You are STUDLYF AI, an expert startup strategist. Generate concise, specific, "
                "high-quality outputs. Always return clean Markdown only — no preamble, no "
                "code fences. Be specific to the startup's industry and stage."
            ),
        ).with_model("gemini", "gemini-3-flash-preview")

        try:
            full = ""
            async for ev in chat.stream_message(UserMessage(text=context)):
                if isinstance(ev, TextDelta):
                    full += ev.content
                elif isinstance(ev, StreamDone):
                    break
        except Exception as e:
            logger.exception("Generation failed")
            raise HTTPException(status_code=500, detail=f"Generation failed: {e}")

        gid = f"gen_{uuid.uuid4().hex[:10]}"
        doc = {
            "generation_id": gid,
            "user_id": user["user_id"],
            "project_id": payload.project_id,
            "kind": payload.kind,
            "label": KIND_LABELS[payload.kind],
            "content": full,
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
        await db.generations.insert_one(doc)
        doc.pop("_id", None)
        return doc

    @router.get("/generations")
    async def list_generations(
        project_id: Optional[str] = None,
        kind: Optional[str] = None,
        session_token: str | None = Cookie(default=None),
        authorization: str | None = Header(default=None),
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
        session_token: str | None = Cookie(default=None),
        authorization: str | None = Header(default=None),
    ):
        user = await _require_user(session_token, authorization)
        res = await db.generations.delete_one(
            {"generation_id": generation_id, "user_id": user["user_id"]}
        )
        if res.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Not found")
        return {"ok": True}

    return router
