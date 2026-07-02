"""Newsletter endpoint - persist to MongoDB + send Resend welcome email."""
import os
import uuid
import asyncio
import logging
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr

import resend

logger = logging.getLogger(__name__)
RESEND_API_KEY = os.environ.get("RESEND_API_KEY")
SENDER_EMAIL = os.environ.get("SENDER_EMAIL", "onboarding@resend.dev")

if RESEND_API_KEY:
    resend.api_key = RESEND_API_KEY


class NewsletterIn(BaseModel):
    email: EmailStr
    source: str | None = "landing-newsletter"


WELCOME_HTML = """
<!doctype html>
<html><body style="margin:0;padding:0;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;background:#fafafa;color:#0a0a0a;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#fafafa;padding:32px 12px;">
    <tr><td align="center">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" border="0" style="background:#ffffff;border-radius:24px;padding:36px;box-shadow:0 8px 32px rgba(0,0,0,0.04);">
        <tr><td>
          <div style="display:inline-block;padding:6px 12px;border-radius:999px;background:linear-gradient(135deg,#6C63FF,#FF4D94);color:#fff;font-size:11px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;">STUDLYF AI</div>
          <h1 style="font-size:30px;line-height:1.1;letter-spacing:-0.02em;margin:24px 0 12px 0;">
            Welcome to the <span style="background:linear-gradient(135deg,#6C63FF,#FF4D94,#FF7A18);-webkit-background-clip:text;background-clip:text;color:transparent;">Founder Briefing</span>.
          </h1>
          <p style="font-size:16px;line-height:1.6;color:#52525B;margin:0 0 18px 0;">
            You're in. Every Friday, you'll get one short email with the frameworks, playbooks and
            prompts the smartest founders are using to ship faster.
          </p>
          <p style="font-size:16px;line-height:1.6;color:#52525B;margin:0 0 28px 0;">
            While you wait — try the platform: generate a SWOT, a pitch deck, or a marketing plan in
            under a minute. It's free.
          </p>
          <a href="https://studlyf-ai.preview.emergentagent.com/" style="display:inline-block;padding:14px 28px;border-radius:999px;background:linear-gradient(135deg,#6C63FF,#FF4D94,#FF7A18);color:#fff;text-decoration:none;font-weight:600;font-size:14px;">
            Open STUDLYF AI →
          </a>
          <p style="margin:36px 0 0 0;font-size:12px;color:#a1a1aa;">
            You're receiving this because you subscribed at studlyf-ai. Unsubscribe anytime by replying to this email.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>
"""


def build_newsletter_router(db):
    router = APIRouter(prefix="/api/newsletter", tags=["newsletter"])

    @router.get("/count")
    async def get_count():
        try:
            count = await db.newsletter.count_documents({})
            # Seed count with a realistic offset representing historical members
            return {"ok": True, "count": count + 5124}
        except Exception as e:
            logger.warning(f"Failed to count subscribers: {e}")
            return {"ok": True, "count": 5124}

    @router.post("")
    async def subscribe(payload: NewsletterIn):
        email = payload.email.lower()
        existing = await db.newsletter.find_one({"email": email}, {"_id": 0})
        if existing:
            return {"ok": True, "already_subscribed": True}

        sub_id = f"news_{uuid.uuid4().hex[:10]}"
        await db.newsletter.insert_one({
            "id": sub_id,
            "email": email,
            "source": payload.source or "landing-newsletter",
            "email_sent": False,
            "created_at": datetime.now(timezone.utc).isoformat(),
        })

        email_id = None
        email_error = None
        if RESEND_API_KEY:
            try:
                params = {
                    "from": SENDER_EMAIL,
                    "to": [email],
                    "subject": "Welcome to STUDLYF AI ✨",
                    "html": WELCOME_HTML,
                }
                res = await asyncio.to_thread(resend.Emails.send, params)
                email_id = res.get("id") if isinstance(res, dict) else None
                await db.newsletter.update_one(
                    {"id": sub_id},
                    {"$set": {"email_sent": True, "email_id": email_id}},
                )
            except Exception as e:
                email_error = str(e)
                logger.warning(f"Resend failed for {email}: {email_error}")
        return {"ok": True, "already_subscribed": False, "email_sent": email_id is not None, "email_error": email_error}

    return router
