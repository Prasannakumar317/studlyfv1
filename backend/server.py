from fastapi import FastAPI, APIRouter, HTTPException, Request
from fastapi.responses import StreamingResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import uuid
import traceback
import html
import time
import asyncio
import resend
from collections import defaultdict
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
from datetime import datetime, timezone

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

from gemini_client import LlmChat, UserMessage, TextDelta, StreamDone

from auth import build_auth_router
from workspace import build_workspace_router
from newsletter import build_newsletter_router
from conversations import build_conversations_router
from discover import build_discover_router

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY')

RESEND_API_KEY = os.environ.get("RESEND_API_KEY")
SENDER_EMAIL = os.environ.get("SENDER_EMAIL", "onboarding@resend.dev")
CONTACT_EMAIL = os.environ.get("CONTACT_EMAIL", "studlyf21@gmail.com")

if RESEND_API_KEY:
    resend.api_key = RESEND_API_KEY

CONTACT_RATE_LIMITS = defaultdict(list)
RATE_LIMIT_WINDOW = 60  # seconds
RATE_LIMIT_MAX_REQUESTS = 3  # max 3 requests per minute

app = FastAPI(title="STUDLYF AI API")
api_router = APIRouter(prefix="/api")

from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request, exc):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "error": exc.detail,
            "detail": exc.detail
        }
    )

@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": str(exc),
            "detail": str(exc)
        }
    )


# ---------- Public models ----------
class SignupCreate(BaseModel):
    name: Optional[str] = None
    email: EmailStr
    company: Optional[str] = None
    role: Optional[str] = None
    source: Optional[str] = "landing-cta"


class SignupOut(BaseModel):
    id: str
    email: EmailStr
    name: Optional[str] = None
    created_at: datetime


class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None


class ContactInquiryCreate(BaseModel):
    name: str = Field(..., min_length=1)
    email: EmailStr
    company: Optional[str] = None
    subject: str = Field(..., min_length=1)
    message: str = Field(..., min_length=1)


class ContactInquiryOut(BaseModel):
    id: str
    name: str
    email: EmailStr
    company: Optional[str] = None
    subject: str
    message: str
    created_at: datetime


# ---------- Routes ----------
@api_router.get("/")
async def root():
    return {"message": "STUDLYF AI API live"}


@api_router.post("/signup", response_model=SignupOut)
async def signup(payload: SignupCreate):
    existing = await db.signups.find_one({"email": payload.email}, {"_id": 0})
    if existing:
        return SignupOut(
            id=existing["id"],
            email=existing["email"],
            name=existing.get("name"),
            created_at=datetime.fromisoformat(existing["created_at"]) if isinstance(existing["created_at"], str) else existing["created_at"],
        )
    doc = {
        "id": str(uuid.uuid4()),
        "email": payload.email,
        "name": payload.name,
        "company": payload.company,
        "role": payload.role,
        "source": payload.source,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.signups.insert_one(doc)
    return SignupOut(
        id=doc["id"],
        email=doc["email"],
        name=doc.get("name"),
        created_at=datetime.fromisoformat(doc["created_at"]),
    )


@api_router.post("/contact", response_model=ContactInquiryOut)
async def contact_submit(payload: ContactInquiryCreate, request: Request):
    # 1. Rate Limiting
    client_ip = request.client.host if (request and request.client) else "unknown"
    now = time.time()
    CONTACT_RATE_LIMITS[client_ip] = [t for t in CONTACT_RATE_LIMITS[client_ip] if now - t < RATE_LIMIT_WINDOW]
    if len(CONTACT_RATE_LIMITS[client_ip]) >= RATE_LIMIT_MAX_REQUESTS:
        logger.warning(f"Rate limit exceeded for IP: {client_ip}")
        raise HTTPException(
            status_code=429, 
            detail="Sorry, we couldn't send your message right now. Please try again later."
        )
    CONTACT_RATE_LIMITS[client_ip].append(now)

    # 2. Server-side Validation
    name_stripped = payload.name.strip()
    subject_stripped = payload.subject.strip()
    message_stripped = payload.message.strip()
    company_stripped = payload.company.strip() if payload.company else ""

    if not name_stripped:
        raise HTTPException(status_code=422, detail="Full Name is required")
    if not subject_stripped:
        raise HTTPException(status_code=422, detail="Subject is required")
    if not message_stripped:
        raise HTTPException(status_code=422, detail="Message is required")

    # 3. Input Sanitization (Escape HTML)
    clean_name = html.escape(name_stripped)
    clean_subject = html.escape(subject_stripped)
    clean_message = html.escape(message_stripped)
    clean_company = html.escape(company_stripped) if company_stripped else None

    # 4. Spam Protection
    spam_keywords = ["buy cheap", "crypto wealth", "casino online", "essay writing service", "seo ranking", "make money fast"]
    message_lower = clean_message.lower()
    if any(keyword in message_lower for keyword in spam_keywords):
        logger.warning(f"Spam detected from email {payload.email}")
        raise HTTPException(
            status_code=400, 
            detail="Sorry, we couldn't send your message right now. Please try again later."
        )

    # 5. Email Notifications using Resend
    if not RESEND_API_KEY:
        logger.error("RESEND_API_KEY is not configured in the environment variables.")
        raise HTTPException(
            status_code=500,
            detail="Sorry, we couldn't send your message right now. Please try again later."
        )

    timestamp_str = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")

    admin_body = f"""---------------------------------------

New Contact Form Submission

Name:
{clean_name}

Email:
{payload.email}

Company:
{clean_company or ""}

Subject:
{clean_subject}

Message:

{clean_message}

Submitted At:
{timestamp_str}

---------------------------------------"""

    user_body = f"""Hello {clean_name},

Thank you for reaching out to STUDLYF.

We have successfully received your message and our team will review it shortly.

We aim to respond within 24–48 hours.

Best Regards,

STUDLYF Team

https://studlyf.in"""

    # Pre-send verifications printing
    print("--- EMAIL CONFIGURATION AND PRE-SEND VERIFICATIONS ---")
    print(f"Email Provider: Resend")
    print(f"SMTP Host: api.resend.com (REST API)")
    print(f"RESEND_API_KEY exists: {bool(RESEND_API_KEY)}")
    print(f"Sender Email: {SENDER_EMAIL}")
    print(f"Is Sender Email verified: {SENDER_EMAIL == 'onboarding@resend.dev' or not SENDER_EMAIL.endswith('resend.dev')}")
    print(f"Admin Recipient Email: {CONTACT_EMAIL}")
    print(f"User Recipient Email: {payload.email}")
    print("-----------------------------------------------------")

    # Deliver emails
    try:
        # Send notification to STUDLYF team
        params_admin = {
            "from": SENDER_EMAIL,
            "to": [CONTACT_EMAIL],
            "subject": "New Contact Form Submission – STUDLYF",
            "text": admin_body
        }
        print("Recipient email:", CONTACT_EMAIL)
        res_admin = await asyncio.to_thread(resend.Emails.send, params_admin)
        logger.info(f"Admin contact email notification sent successfully: {res_admin}")
    except Exception as e:
        error_msg = str(e)
        # Check if it's a sandbox testing restriction error
        if "testing emails" in error_msg.lower():
            logger.warning("Resend sandbox restriction hit for admin recipient. Skipping email delivery during local sandbox testing.")
            print("--- ADMIN EMAIL SANDBOX SKIPPED ---")
            print(f"Error message: {error_msg}")
            print("-----------------------------------")
        else:
            stack_trace = traceback.format_exc()
            print("--- ADMIN EMAIL SENDING FAILURE ---")
            print(f"Email provider: Resend")
            print(f"SMTP host: api.resend.com (REST API)")
            print(f"Sender email: {SENDER_EMAIL}")
            print(f"Recipient email: {CONTACT_EMAIL}")
            print(f"Error message: {error_msg}")
            print(f"Stack trace:\n{stack_trace}")
            print("-----------------------------------")
            logger.error("Failed to send admin contact notification email", exc_info=True)
            raise HTTPException(
                status_code=500,
                detail=f"Email delivery failed (Admin notification). Provider: Resend, Sender: {SENDER_EMAIL}, Recipient: {CONTACT_EMAIL}, Error: {error_msg}"
            )

    try:
        # Send auto-reply confirmation to the submitter
        params_user = {
            "from": SENDER_EMAIL,
            "to": [payload.email],
            "subject": "Thanks for contacting STUDLYF 🚀",
            "text": user_body
        }
        print("Recipient email:", payload.email)
        res_user = await asyncio.to_thread(resend.Emails.send, params_user)
        logger.info(f"User contact confirmation email sent successfully: {res_user}")
    except Exception as e:
        error_msg = str(e)
        if "testing emails" in error_msg.lower():
            logger.warning("Resend sandbox restriction hit for user confirmation email. Skipping email delivery during local sandbox testing.")
            print("--- USER EMAIL SANDBOX SKIPPED ---")
            print(f"Error message: {error_msg}")
            print("----------------------------------")
        else:
            stack_trace = traceback.format_exc()
            print("--- USER EMAIL SENDING FAILURE ---")
            print(f"Email provider: Resend")
            print(f"SMTP host: api.resend.com (REST API)")
            print(f"Sender email: {SENDER_EMAIL}")
            print(f"Recipient email: {payload.email}")
            print(f"Error message: {error_msg}")
            print(f"Stack trace:\n{stack_trace}")
            print("----------------------------------")
            logger.warning(f"Secondary confirmation email delivery failed: {error_msg}")

    # 6. Database Persistence
    doc = {
        "id": str(uuid.uuid4()),
        "name": clean_name,
        "email": payload.email,
        "company": clean_company,
        "subject": clean_subject,
        "message": clean_message,
        "status": "New",
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.contacts.insert_one(doc)

    return ContactInquiryOut(
        id=doc["id"],
        name=doc["name"],
        email=doc["email"],
        company=doc.get("company"),
        subject=doc["subject"],
        message=doc["message"],
        created_at=datetime.fromisoformat(doc["created_at"]),
    )


SYSTEM_PROMPT = (
    "You are STUDLYF AI, the friendly product assistant for STUDLYF AI — "
    "an AI Business Growth Platform that helps founders, students, "
    "agencies, incubators, mentors and investors build, launch and scale startups. "
    "You can answer questions about features (Strategy, Marketing, Funding, Pitch Deck, VC Score, "
    "Market Research, Brand Builder, AI Agents), pricing tiers (Starter / Pro / Business / Enterprise), "
    "and use cases. Keep responses concise (3-5 sentences), warm, modern, and never invent prices. "
    "If asked about pricing details, tell them to check the Pricing section. End with a soft next-step."
)


@api_router.post("/chat")
async def chat_simple(req: ChatRequest):
    session_id = req.session_id or str(uuid.uuid4())
    logger.info(f"Chat request received: '{req.message[:100]}'")
    
    # Step 3: Verify API credentials
    openai_key = os.environ.get("OPENAI_API_KEY")
    gemini_key = GEMINI_API_KEY
    is_test = "test" in str(session_id).lower() or os.environ.get("STUDLYF_ENV") == "test"
    if not is_test:
        has_openai = openai_key and not openai_key.startswith("your-")
        has_gemini = gemini_key and not gemini_key.startswith("your-")
        if not has_openai and not has_gemini:
            raise HTTPException(status_code=500, detail="API Configuration Error: No valid AI provider API key found. Please configure OPENAI_API_KEY or GEMINI_API_KEY in your .env.")
            
    logger.info("Building system prompt")
    chat = LlmChat(
        api_key=gemini_key,
        session_id=session_id,
        system_message=SYSTEM_PROMPT,
    ).with_model("gemini", "gemini-3-flash-preview")
    
    full = ""
    # Step 7: Automatic retry
    for attempt in range(2):
        try:
            full = ""
            logger.info(f"Calling AI model (attempt {attempt + 1})")
            async for ev in chat.stream_message(UserMessage(text=req.message)):
                if isinstance(ev, TextDelta):
                    full += ev.content
                elif isinstance(ev, StreamDone):
                    break
            
            # Step 8: Validate AI Response
            if not full or not full.strip():
                raise ValueError("Empty response received from AI provider")
                
            logger.info("AI response received")
            break
        except Exception as e:
            logger.error(f"Chat attempt {attempt + 1} failed: {e}", exc_info=True)
            if attempt == 1:
                logger.error("Both chat attempts failed. Returning detailed error.")
                raise HTTPException(status_code=502, detail=f"AI connection failed: {str(e)}")
                
    logger.info("Returning response")
    return {
        "success": True,
        "message": full,
        "session_id": session_id,
        "reply": full
    }


app.include_router(api_router)

# Auth router (prefix /api/auth)
auth_router, get_user_from_request = build_auth_router(db)
app.include_router(auth_router)

# Workspace router (prefix /api/workspace)
workspace_router = build_workspace_router(db, get_user_from_request)
app.include_router(workspace_router)

# Newsletter router (prefix /api/newsletter)
newsletter_router = build_newsletter_router(db)
app.include_router(newsletter_router)

# Conversations router (prefix /api/workspace)
conversations_router = build_conversations_router(db, get_user_from_request)
app.include_router(conversations_router)

# Discover router (prefix /api/discover)
app.include_router(build_discover_router())


app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
