"""Conversations & AI-chat workspace endpoints."""
import os
import uuid
import json
import re
import logging
import asyncio
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, Cookie, Header
from pydantic import BaseModel
from typing import Optional, List

from gemini_client import LlmChat, UserMessage, TextDelta, StreamDone, AiProviderError

logger = logging.getLogger(__name__)
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")

# System prompt for the AI Co-Founder chat
COFOUNDER_PROMPT = (
    "You are the dedicated AI Assistant inside StartupOS (STUDLYF AI).\n\n"
    "Your purpose is to help founders, students, agencies, incubators, mentors and investors build, validate, grow, market, and fund their startups with accurate, professional, and actionable advice.\n\n"
    "This assistant is NOT a general-purpose chatbot. It is a startup advisor, product strategist, venture capitalist, growth marketer, UX consultant, technical architect, and fundraising mentor.\n\n"
    "--- UNIVERSAL AI ASSISTANT CAPABILITY (HIGHEST PRIORITY) ---\n"
    "You must be capable of answering ANY type of question the user asks, including:\n"
    "* Startup & Business (validation, launch, traction, pricing, hiring, expansion)\n"
    "* Product (MVP features, onboarding, retention, roadmap, UX/UI improvements)\n"
    "* Technical & Coding (writing React/Next.js/HTML/JS, debugging, database/SQL optimization, APIs, typescript, system design, recursion, algorithms)\n"
    "* AI (building chatbots, models, RAG, agents, prompt engineering, fine-tuning)\n"
    "* Marketing & SEO (LinkedIn, Twitter, Product Hunt, campaigns, content ideas)\n"
    "* Design (UI/UX, color palettes, typography, dashboard improvements)\n"
    "* Finance & Legal (runway, CAC, LTV, burn rate, unit economics, Privacy policy, incorporation, ESOP, cap tables)\n"
    "* Career & Learning (resume reviews, portfolio advice, explaining tech/business/finance concepts)\n"
    "* General Knowledge (science, math, history, technology, geography, economics, productivity, writing, public speaking)\n\n"
    "If the user's question is unrelated to their startup, answer it normally with the same high quality as a world-class general AI assistant. Seamlessly switch between startup advisor and general AI assistant without requiring the user to change modes.\n\n"
    "--- STARTUP CONTEXT PRIORITY ---\n"
    "Whenever a question relates to the user's startup, you MUST prioritize using the startup details stored in the workspace. This includes:\n"
    "* Startup Name, Industry, Problem Statement, Solution, Target Audience, Business Model, Country, Stage, Competitors, Features, Revenue Model, Founder Notes, Strategy Data, Marketing Data, and Funding Data.\n"
    "Never ignore this context. Never answer as if you know nothing. Customized strategies/advice specifically for that startup.\n\n"
    "--- NEVER SHOW DEFAULT RESPONSES ---\n"
    "Never reply with generic excuses like 'I don't know', 'I need more information', 'I'm an AI language model', or 'I cannot answer'. Instead, infer intelligently using the available startup context. If some information is missing, state your assumption clearly and continue (e.g., 'Based on your AI SaaS startup targeting Indian SMBs, here is the recommended strategy...').\n\n"
    "--- NEVER RETURN RAW JSON ---\n"
    "You must NEVER return raw JSON, arrays, API responses, or internal structured objects in your responses. If backend APIs return JSON, convert it into polished, beautiful markdown before displaying (use headings, bullet points, tables, cards/borders, and numbered lists). The user should only see readable, human-friendly content.\n\n"
    "--- TONE & QUALITY ---\n"
    "Every response should feel like advice from a Y Combinator Partner, Sequoia Capital, Andreessen Horowitz, or McKinsey/BCG/Bain consultant. Avoid generic startup platitudes. Give actionable recommendations, explain 'WHY' and 'HOW', and provide concrete examples.\n"
    "Tone: Professional, Founder-friendly, Investor-grade, Actionable, Confident, Clear, Concise, and Helpful."
)


class ConversationCreate(BaseModel):
    title: Optional[str] = "New chat"


class ConversationUpdate(BaseModel):
    title: str


class MessageIn(BaseModel):
    text: str


class BootstrapIn(BaseModel):
    conversation_id: Optional[str] = None
    name: Optional[str] = None
    tagline: Optional[str] = None
    industry: Optional[str] = None
    stage: Optional[str] = None
    kinds: List[str] = ["swot", "go_to_market", "marketing_plan", "brand_strategy", "pitch_deck", "vc_score"]


def _parse_json_response(text: str) -> dict:
    t = text.strip()
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


def build_conversations_router(db, get_user_from_request):
    router = APIRouter(prefix="/api/workspace", tags=["workspace-chat"])

    async def _require_user(session_token, authorization):
        if not session_token and not authorization:
            raise HTTPException(status_code=401, detail="Authentication failed: Session token or JWT Authorization header is missing.")
        user = await get_user_from_request(session_token, authorization)
        if not user:
            raise HTTPException(status_code=401, detail="Authentication failed: Invalid session or JWT token.")
        if not user.get("user_id"):
            raise HTTPException(status_code=401, detail="Authentication failed: User ID not found in token payload.")
        return user

    @router.get("/conversations")
    async def list_conversations(
        session_token: Optional[str] = Cookie(default=None),
        authorization: Optional[str] = Header(default=None),
    ):
        user = await _require_user(session_token, authorization)
        items = await db.conversations.find({"user_id": user["user_id"]}, {"_id": 0, "messages": 0}).to_list(200)
        items.sort(key=lambda c: c.get("updated_at", c.get("created_at", "")), reverse=True)
        return items

    @router.post("/conversations")
    async def create_conversation(
        payload: ConversationCreate,
        session_token: Optional[str] = Cookie(default=None),
        authorization: Optional[str] = Header(default=None),
    ):
        user = await _require_user(session_token, authorization)
        cid = f"conv_{uuid.uuid4().hex[:12]}"
        now = datetime.now(timezone.utc).isoformat()
        doc = {
            "conversation_id": cid,
            "user_id": user["user_id"],
            "title": payload.title or "New chat",
            "messages": [],
            "created_at": now,
            "updated_at": now,
        }
        await db.conversations.insert_one(doc)
        doc.pop("_id", None)
        doc.pop("messages", None)
        return doc

    @router.get("/conversations/{conversation_id}")
    async def get_conversation(
        conversation_id: str,
        session_token: Optional[str] = Cookie(default=None),
        authorization: Optional[str] = Header(default=None),
    ):
        user = await _require_user(session_token, authorization)
        c = await db.conversations.find_one(
            {"conversation_id": conversation_id, "user_id": user["user_id"]}, {"_id": 0}
        )
        if not c:
            raise HTTPException(status_code=404, detail="Not found")
        return c

    @router.patch("/conversations/{conversation_id}")
    async def rename(
        conversation_id: str,
        payload: ConversationUpdate,
        session_token: Optional[str] = Cookie(default=None),
        authorization: Optional[str] = Header(default=None),
    ):
        user = await _require_user(session_token, authorization)
        res = await db.conversations.update_one(
            {"conversation_id": conversation_id, "user_id": user["user_id"]},
            {"$set": {"title": payload.title, "updated_at": datetime.now(timezone.utc).isoformat()}},
        )
        if res.matched_count == 0:
            raise HTTPException(status_code=404, detail="Not found")
        return {"ok": True}

    @router.delete("/conversations/{conversation_id}")
    async def delete_conv(
        conversation_id: str,
        session_token: Optional[str] = Cookie(default=None),
        authorization: Optional[str] = Header(default=None),
    ):
        user = await _require_user(session_token, authorization)
        res = await db.conversations.delete_one(
            {"conversation_id": conversation_id, "user_id": user["user_id"]}
        )
        if res.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Not found")
        return {"ok": True}

    @router.post("/conversations/{conversation_id}/messages")
    async def send_message(
        conversation_id: str,
        payload: MessageIn,
        session_token: Optional[str] = Cookie(default=None),
        authorization: Optional[str] = Header(default=None),
    ):
        start_time = datetime.now(timezone.utc)
        import traceback
        
        try:
            # Step 1: Authentication Check
            user = await _require_user(session_token, authorization)
            print("[OK] User authenticated")
            
            # Step 2: Conversation check
            conv = await db.conversations.find_one(
                {"conversation_id": conversation_id, "user_id": user["user_id"]}, {"_id": 0}
            )
            if not conv:
                raise HTTPException(status_code=404, detail="Conversation not found")
            print("[OK] Workspace loaded")
            
            # Step 3: Fetch and default startup context
            projects = await db.projects.find({"user_id": user["user_id"]}, {"_id": 0}).to_list(10)
            project_context_str = ""
            if projects:
                projects.sort(key=lambda p: p.get("created_at", ""), reverse=True)
                active_project = projects[0]
                
                p_name = active_project.get("name") or "My Startup"
                p_tagline = active_project.get("tagline") or ""
                p_industry = active_project.get("industry") or ""
                p_stage = active_project.get("stage") or "Idea"
                
                project_context_str += (
                    f"Startup Workspace Context:\n"
                    f"- Startup Name: {p_name}\n"
                    f"- Tagline/Problem/Solution: {p_tagline}\n"
                    f"- Industry: {p_industry}\n"
                    f"- Stage: {p_stage}\n"
                )
                
                # Fetch latest generation of each kind for this project
                generations = await db.generations.find({"project_id": active_project["project_id"], "user_id": user["user_id"]}, {"_id": 0}).to_list(100)
                latest_gens = {}
                for gen in generations:
                    kind = gen["kind"]
                    created_at = gen.get("created_at", "")
                    if kind not in latest_gens or created_at > latest_gens[kind].get("created_at", ""):
                        latest_gens[kind] = gen
                
                if latest_gens:
                    project_context_str += "\nWorkspace generated strategies & data:\n"
                    items_to_add = list(latest_gens.items())
                    # Step 6: check token length and summarize context
                    if len(json.dumps(items_to_add)) > 15000:
                        logger.info("Workspace context size is large in chat. Summarizing workspace generations context.")
                        for kind, gen in items_to_add[-4:]:  # Keep only 4 most recent
                            label = gen.get("label", kind)
                            data_str = json.dumps(gen.get("data", {}))
                            project_context_str += f"- {label} ({kind}) data: {data_str[:1200]}... [truncated]\n"
                    else:
                        for kind, gen in items_to_add:
                            label = gen.get("label", kind)
                            data_str = json.dumps(gen.get("data", {}))
                            project_context_str += f"- {label} ({kind}) data: {data_str}\n"
                            
            print("[OK] Startup data loaded")
            
            # Step 4: Prompt generation
            now = datetime.now(timezone.utc).isoformat()
            user_msg = {"role": "user", "text": payload.text, "ts": now}
            
            # Build a transcript of the recent history
            prior = conv.get("messages", [])[-20:]
            transcript_lines = []
            for m in prior:
                who = "User" if m.get("role") == "user" else "Assistant"
                transcript_lines.append(f"{who}: {m.get('text','')}")
            transcript = "\n".join(transcript_lines).strip()
            
            system_with_memory = COFOUNDER_PROMPT
            if project_context_str:
                system_with_memory += f"\n\n{project_context_str}"
            if transcript:
                system_with_memory += (
                    "\n\nConversation memory so far:\n"
                    f"---\n{transcript}\n---"
                )
            
            print("[OK] Prompt generated")
            
            chat = LlmChat(
                api_key=GEMINI_API_KEY,
                session_id=conversation_id,
                system_message=system_with_memory,
            ).with_model("gemini", "gemini-3-flash-preview")
            
            # Step 5: Execute AI streaming call
            print("[OK] AI request started")
            full = ""
            last_error = None
            
            for attempt in range(2):
                try:
                    full = ""
                    async for ev in chat.stream_message(UserMessage(text=payload.text)):
                        if isinstance(ev, TextDelta):
                            full += ev.content
                        elif isinstance(ev, StreamDone):
                            break
                    
                    if not full or not full.strip():
                        raise ValueError("Empty response received from AI provider")
                    
                    last_error = None
                    break
                except Exception as ex:
                    logger.warning(f"AI chat attempt {attempt + 1} failed: {ex}")
                    last_error = ex
            
            if last_error:
                raise last_error
                
            print("[OK] AI response received")
            
            # Step 6: Save message and respond
            ai_msg = {"role": "assistant", "text": full, "ts": datetime.now(timezone.utc).isoformat()}
            
            new_title = conv["title"]
            if new_title == "New chat" and len(conv.get("messages", [])) == 0:
                new_title = (payload.text[:48] + ("…" if len(payload.text) > 48 else ""))
                
            await db.conversations.update_one(
                {"conversation_id": conversation_id},
                {"$push": {"messages": {"$each": [user_msg, ai_msg]}},
                 "$set": {"updated_at": ai_msg["ts"], "title": new_title}},
            )
            
            print("[OK] Response sent")
            return {
                "success": True,
                "message": full,
                "user_message": user_msg,
                "assistant_message": ai_msg,
                "title": new_title
            }
            
        except AiProviderError as ape:
            print("[ERROR] AI Chat failed at provider stage")
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
            print("[ERROR] Chat failed in pipeline")
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
    EXTRACT_PROMPT = (
        "Given the following conversation between a founder and an AI co-founder, extract the "
        "startup details as a SINGLE JSON object — no prose, no fences. Schema:\n"
        '{ "name": str, "tagline": str (one-sentence positioning), "industry": str, '
        '"stage": "Idea"|"Validation"|"Pre-seed"|"Seed"|"Series A"|"Growth" }\n'
        "If a field is unclear, infer the most plausible value. NEVER return null — use a sensible default."
    )

    @router.post("/extract-startup")
    async def extract_startup(
        payload: dict,
        session_token: Optional[str] = Cookie(default=None),
        authorization: Optional[str] = Header(default=None),
    ):
        user = await _require_user(session_token, authorization)
        conversation_id = payload.get("conversation_id")
        conv = await db.conversations.find_one(
            {"conversation_id": conversation_id, "user_id": user["user_id"]}, {"_id": 0}
        )
        if not conv:
            raise HTTPException(status_code=404, detail="Conversation not found")
        transcript = "\n\n".join(
            f"{m['role'].upper()}: {m['text']}" for m in conv.get("messages", [])
        )
        if not transcript.strip():
            raise HTTPException(status_code=400, detail="Conversation is empty")

        chat = LlmChat(
            api_key=GEMINI_API_KEY,
            session_id=f"extract-{conversation_id}",
            system_message="You output ONLY valid JSON. No markdown. No commentary.",
        ).with_model("gemini", "gemini-3-flash-preview")
        full = ""
        try:
            async for ev in chat.stream_message(UserMessage(text=EXTRACT_PROMPT + "\n\nConversation:\n" + transcript[-8000:])):
                if isinstance(ev, TextDelta):
                    full += ev.content
                elif isinstance(ev, StreamDone):
                    break
            data = _parse_json_response(full)
        except Exception as e:
            logger.warning(f"Extract failed: {e}; raw={full[:200]}")
            raise HTTPException(status_code=502, detail="Could not extract startup details. Try giving more context first.")
        return data

    @router.post("/bootstrap")
    async def bootstrap(
        payload: BootstrapIn,
        session_token: Optional[str] = Cookie(default=None),
        authorization: Optional[str] = Header(default=None),
    ):
        """Create a project from chat context. (Generations are run on-demand from the dashboard.)"""
        user = await _require_user(session_token, authorization)
        name = (payload.name or "").strip() or "My Startup"
        pid = f"proj_{uuid.uuid4().hex[:10]}"
        now = datetime.now(timezone.utc).isoformat()
        proj = {
            "project_id": pid,
            "user_id": user["user_id"],
            "name": name,
            "tagline": payload.tagline or "",
            "industry": payload.industry or "",
            "stage": payload.stage or "Idea",
            "created_at": now,
            "is_demo": False,
            "bootstrapped_from": payload.conversation_id,
        }
        await db.projects.insert_one(proj)
        proj.pop("_id", None)
        return {"project": proj}

    return router
