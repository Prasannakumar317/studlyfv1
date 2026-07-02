"""Schemas + prompts for visual AI outputs.
Each generation kind asks Gemini to return STRICT JSON matching a known schema.
Frontend renders this JSON into charts/KPIs/cards — not raw text.
"""

# Each entry: a Python dict describing the EXPECTED JSON shape (used inside the prompt)
# plus an optional `markdown_summary` field requested for fallback display.

KIND_LABELS = {
    "swot": "SWOT Analysis",
    "business_model_canvas": "Business Model Canvas",
    "go_to_market": "Go-to-Market Strategy",
    "marketing_plan": "1-Page Marketing Plan",
    "brand_strategy": "Brand Strategy",
    "one_minute_pitch": "1-Minute Pitch",
    "pitch_deck": "Pitch Deck",
    "vc_score": "VC Score Report",
    "customer_persona": "Customer Personas",
    "competitor_analysis": "Competitor Analysis",
}

# Canonical schema documents in prompt form — described as JSON examples.
SCHEMAS = {
    "swot": """{
  "summary": "1-2 sentence executive summary.",
  "scores": {
    "overall": 7.2,           // 0-10 strategic health
    "internal": 7.5,          // strengths vs weaknesses
    "external": 6.8           // opportunities vs threats
  },
  "strengths":     [ { "title": "...", "detail": "...", "score": 8 }, ... 5 items ],
  "weaknesses":    [ { "title": "...", "detail": "...", "score": 6 }, ... 5 items ],
  "opportunities": [ { "title": "...", "detail": "...", "score": 7 }, ... 5 items ],
  "threats":       [ { "title": "...", "detail": "...", "score": 5 }, ... 5 items ],
  "radar": [
    { "axis": "Team",       "value": 7 },
    { "axis": "Product",    "value": 8 },
    { "axis": "Market",     "value": 6 },
    { "axis": "Traction",   "value": 5 },
    { "axis": "Finance",    "value": 6 },
    { "axis": "Brand",      "value": 7 }
  ],
  "recommendations": [ "Top 3 action items as crisp imperatives." ]
}""",

    "business_model_canvas": """{
  "summary": "1-2 sentence executive summary.",
  "cells": {
    "customer_segments":      [ "bullet 1", "bullet 2", ... 5-10 items ],
    "value_propositions":     [ "bullet 1", "bullet 2", ... 5-10 items ],
    "channels":               [ "bullet 1", "bullet 2", ... 5-10 items ],
    "customer_relationships": [ "bullet 1", "bullet 2", ... 5-10 items ],
    "revenue_streams":        [ "bullet 1", "bullet 2", ... 5-10 items ],
    "key_resources":          [ "bullet 1", "bullet 2", ... 5-10 items ],
    "key_activities":         [ "bullet 1", "bullet 2", ... 5-10 items ],
    "key_partnerships":       [ "bullet 1", "bullet 2", ... 5-10 items ],
    "cost_structure":         [ "bullet 1", "bullet 2", ... 5-10 items ]
  },
  "kpis": [
    { "label": "Target ARPU",        "value": "$420 / yr" },
    { "label": "Gross margin",       "value": "62%" },
    { "label": "Primary channel",    "value": "Self-serve web" }
  ],
  "recommendations": [ "3 bullets" ]
}""",

    "go_to_market": """{
  "summary": "1-2 sentence summary.",
  "kpis": [
    { "label": "TAM",  "value": "$42B" },
    { "label": "SAM",  "value": "$5.6B" },
    { "label": "SOM",  "value": "$210M" },
    { "label": "CAC payback", "value": "9 mo" }
  ],
  "icp": { "title": "...", "industries": ["..."], "company_size": "...", "geo": "...", "buyer_role": "..." },
  "segments": [
    { "name": "Mid-market fleets", "share": 45 },
    { "name": "EV prosumers",      "share": 30 },
    { "name": "Charge-point operators", "share": 25 }
  ],
  "funnel": [
    { "stage": "Awareness",     "value": 100000 },
    { "stage": "Consideration", "value": 24000  },
    { "stage": "Trial",         "value": 4200   },
    { "stage": "Paid",          "value": 860    },
    { "stage": "Expansion",     "value": 240    }
  ],
  "positioning": "One-sentence positioning statement.",
  "messaging": [ { "pillar": "...", "line": "..." }, ... 4 items ],
  "channels": [ { "name": "Content + SEO", "priority": "high", "cac_estimate": "$120" }, ... 4 items ],
  "primary_acquisition_channels": [
    { "name": "Organic Search (SEO)", "details": "Content hub focused on fleet manager problems.", "priority": "High" },
    ... 3-5 items
  ],
  "launch_strategy": {
    "strategy": "Launch plan description.",
    "milestones": ["milestone 1", "milestone 2", "milestone 3"]
  },
  "roadmap_90_day": [
    { "phase": "Days 1-30", "focus": "Launch readiness & beta group feedback.", "actions": ["Set up landing page", "Onboard first 10 beta users"] },
    { "phase": "Days 31-60", "focus": "Refine core UX & kick off paid ads.", "actions": ["Optimize onboarding flow", "Launch targeted search campaigns"] },
    { "phase": "Days 61-90", "focus": "Scale organic loops & referral systems.", "actions": ["Deploy developer API docs", "Activate referral program"] }
  ],
  "customer_acquisition_funnel": [
    { "stage": "Awareness", "value": 150000, "description": "SEO blog posts & tech newsletter sponsorships" },
    { "stage": "Consideration", "value": 35000, "description": "Interactive sandbox demos & documentation reads" },
    { "stage": "Trial", "value": 8500, "description": "Free tier project creations" },
    { "stage": "Paid", "value": 1800, "description": "Upgrade to Pro tier subscriptions" },
    { "stage": "Expansion", "value": 450, "description": "Seat additions & high-volume API expansions" }
  ],
  "partnerships": [
    { "partner_type": "Cloud Hyperscalers", "value_prop": "Co-sell options & credits integration" }
  ],
  "community_strategy": {
    "platform": "Discord & GitHub",
    "engagement_plan": "Monthly developer office hours & community-driven pull request reviews."
  },
  "referral_strategy": {
    "mechanism": "Developer-to-Developer double-sided credit loop.",
    "incentives": "$50 API credits for both referrer and referee upon first paid bill."
  },
  "pricing_strategy": {
    "strategy": "Value-based pricing aligning usage with API calls.",
    "tiers": ["Free Sandbox", "Pro ($29/mo)", "Enterprise SLA usage volume rates"]
  },
  "growth_loops": [
    { "loop_type": "Organic referral loop", "mechanism": "Viral share links generated inside workspace during setup." }
  ],
  "recommendations": [ "3 imperatives" ]
}""",

    "marketing_plan": """{
  "summary": "1-2 sentence summary.",
  "scores": { "overall": 7.4, "brand": 6, "demand": 8, "content": 7, "retention": 6 },
  "positioning_statement": "The absolute developer-first platform designed to accelerate EV fleet scaling.",
  "messaging_pillars": [
    { "pillar": "Developer Speed", "core_message": "Build and ship EV charging apps in hours, not weeks." }
  ],
  "seo_strategy": {
    "keywords": ["EV fleet management", "charging marketplace APIs"],
    "pillar_pages": ["The Ultimate Guide to Scaling EV Fleet Charging Infrastructure"]
  },
  "content_strategy": {
    "frequency": "2 technical blog posts per week",
    "formats": ["Case studies", "Integration tutorials", "Developer sandbox walkthroughs"]
  },
  "social_media_strategy": {
    "platforms": ["LinkedIn & Twitter/X"],
    "content_themes": ["Developer achievements", "Product velocity updates", "Startup founder advice"]
  },
  "paid_ads_strategy": {
    "channels": ["LinkedIn Conversions", "Google Search Ads"],
    "budget_allocation": "60% Google Search, 40% LinkedIn Ads"
  },
  "email_strategy": {
    "newsletter_frequency": "Bi-weekly developer digest",
    "drip_campaigns": ["Welcome & Quickstart drip", "Free-to-Pro conversion sequence"]
  },
  "influencer_strategy": {
    "target_profiles": ["Developer advocates", "SaaS startup influencers"],
    "engagement_model": "Co-created integration video tutorials & custom sandbox templates"
  },
  "launch_campaign_ideas": [
    { "campaign_name": "Developer Beta Invite", "channel": "Product Hunt + Hacker News" }
  ],
  "marketing_calendar_30_day": [
    { "week": 1, "campaign": "Developer Beta Launch", "channel": "Product Hunt" },
    { "week": 2, "campaign": "Tech Onboarding Webinar", "channel": "Zoom Webinar" },
    { "week": 3, "campaign": "Pillar Content Release", "channel": "SEO Blog" },
    { "week": 4, "campaign": "Retargeting Ads Kickoff", "channel": "Google Display" }
  ],
  "weekly_goals": [
    "Week 1: 500 waitlist signups",
    "Week 2: 100 sandbox projects created",
    "Week 3: 50 active daily active builders",
    "Week 4: 10 upgrade conversions"
  ],
  "kpis": [
    { "label": "MQLs / mo",   "value": "1,200" },
    { "label": "CAC",         "value": "$240" },
    { "label": "CAC payback", "value": "8 mo" },
    { "label": "NPS target",  "value": "55" }
  ],
  "recommended_tools": ["HubSpot CRM", "Google Analytics 4", "Klaviyo Email", "Ahrefs for SEO"],
  "channels": [
    { "name": "Content + SEO",       "budget_pct": 25 },
    { "name": "Paid social",         "budget_pct": 20 },
    { "name": "Lifecycle email",     "budget_pct": 15 },
    { "name": "Partnerships",        "budget_pct": 15 },
    { "name": "Events / community",  "budget_pct": 15 },
    { "name": "PR / brand",          "budget_pct": 10 }
  ],
  "audience": [
    { "label": "SMB founders",   "value": 45 },
    { "label": "Enterprise ops", "value": 30 },
    { "label": "Investors / VCs","value": 15 },
    { "label": "Mentors / agencies","value": 10 }
  ],
  "calendar": [
    { "week": 1,  "campaign": "Launch teaser",  "channel": "Content + Social" },
    { "week": 4,  "campaign": "Investor webinar","channel": "Events" },
    { "week": 8,  "campaign": "Case study drop", "channel": "Email" },
    { "week": 12, "campaign": "Brand campaign",  "channel": "PR" }
  ],
  "recommendations": [ "3 imperatives" ]
}""",

    "brand_strategy": """{
  "summary": "1-2 sentence summary.",
  "score": 7.6,
  "story": "2-3 sentence brand story.",
  "mission": "...",
  "vision": "...",
  "positioning": "...",
  "personality": [
    { "trait": "Confident",  "value": 8 },
    { "trait": "Friendly",   "value": 7 },
    { "trait": "Bold",       "value": 6 },
    { "trait": "Trustworthy","value": 9 },
    { "trait": "Modern",     "value": 8 },
    { "trait": "Playful",    "value": 5 }
  ],
  "voice":  [ { "do": "...", "dont": "..." }, ... 4 items ],
  "taglines": [ "5 tagline options" ],
  "palette": [
    { "name": "Brand Indigo", "hex": "#6C63FF" },
    { "name": "Spark Pink",   "hex": "#FF4D94" },
    { "name": "Energy Orange","hex": "#FF7A18" },
    { "name": "Trust Blue",   "hex": "#3FA9F5" },
    { "name": "Growth Green", "hex": "#2ECC71" }
  ],
  "typography": { "heading": "Outfit", "body": "Plus Jakarta Sans" },
  "recommendations": [ "3 imperatives" ]
}""",

    "one_minute_pitch": """{
  "summary": "1-2 sentence executive summary.",
  "duration_sec": 60,
  "sections": [
    { "label": "Hook",        "seconds": 6,  "text": "..." },
    { "label": "Problem",     "seconds": 10, "text": "..." },
    { "label": "Solution",    "seconds": 12, "text": "..." },
    { "label": "Market Opportunity", "seconds": 8, "text": "..." },
    { "label": "Traction",    "seconds": 8,  "text": "..." },
    { "label": "Business Model", "seconds": 8, "text": "..." },
    { "label": "Why Now",     "seconds": 8,  "text": "..." },
    { "label": "Closing Ask", "seconds": 8,  "text": "..." }
  ],
  "tips": [ "2-3 delivery tips" ]
}""",

    "pitch_deck": """{
  "summary": "1-2 sentence summary.",
  "score": 7.8,
  "slides": [
    { "n": 1,  "title": "Cover",            "subtitle": "...", "bullets": ["Founded in 2026", "A developer-first startup OS platform"], "speaker_notes": "..." },
    { "n": 2,  "title": "Problem",          "bullets": ["...","...","..."], "speaker_notes": "..." },
    { "n": 3,  "title": "Solution",         "bullets": [...], "speaker_notes": "..." },
    { "n": 4,  "title": "Product Demo",     "bullets": [...], "speaker_notes": "..." },
    { "n": 5,  "title": "Market Size",      "bullets": [...], "metric": { "label":"TAM","value":"$15B" }, "speaker_notes": "..." },
    { "n": 6,  "title": "Business Model",   "bullets": [...], "speaker_notes": "..." },
    { "n": 7,  "title": "Traction",         "bullets": [...], "metric": { "label":"Developers","value":"5K+"}, "speaker_notes": "..." },
    { "n": 8,  "title": "Competition",      "bullets": [...], "speaker_notes": "..." },
    { "n": 9,  "title": "Go-To-Market",     "bullets": [...], "speaker_notes": "..." },
    { "n": 10, "title": "Financial Projections", "bullets": [...], "speaker_notes": "..." },
    { "n": 11, "title": "Team",             "bullets": [...], "speaker_notes": "..." },
    { "n": 12, "title": "Ask",              "bullets": [...], "metric": { "label":"Raising","value":"$500K"}, "speaker_notes": "..." }
  ],
  "recommendations": [ "3 imperatives to improve the deck" ]
}""",

    "vc_score": """{
  "summary": "1-2 sentence summary.",
  "overall_score": 7.4,
  "recommendation": "WATCH",  // PASS | WATCH | INVEST
  "rationale": "2-sentence reason.",
  "dimensions": [
    { "key": "Market Size", "score": 8, "comment": "..." },
    { "key": "Team Strength", "score": 9, "comment": "..." },
    { "key": "Defensibility", "score": 8, "comment": "..." },
    { "key": "Traction", "score": 7, "comment": "..." },
    { "key": "Scalability", "score": 9, "comment": "..." },
    { "key": "Revenue Potential", "score": 8, "comment": "..." },
    { "key": "Competition Risk", "score": 6, "comment": "..." },
    { "key": "Timing", "score": 9, "comment": "..." },
    { "key": "Overall Fundability", "score": 8.5, "comment": "..." }
  ],
  "strengths":   [ "3 bullets" ],
  "concerns":    [ "3 bullets" ],
  "risks":       [ "3 bullets/risks" ],
  "next_questions": [ "3 questions a VC would ask next" ],
  "recommendations": [ "3 recommendations for the founder" ]
}""",

    "customer_persona": """{
  "summary": "1-2 sentence summary.",
  "personas": [
    {
      "name": "Rohit Sharma",
      "age_range": "28-32",
      "age": 29,
      "occupation": "Product Manager",
      "role": "Product Manager",
      "location": "Bengaluru, India",
      "income_level": "₹22 LPA",
      "income": "₹22 LPA",
      "avatar_initial": "R",
      "color": "#6C63FF",
      "goals": [ "3 goals" ],
      "pain_points": [ "3 pain points" ],
      "pains": [ "3 pain points" ],
      "buying_triggers": "What triggers buying behavior.",
      "buying_behavior": "What triggers buying behavior.",
      "preferred_channels": [ { "name": "LinkedIn", "weight": 50 } ],
      "channels": [ { "name": "LinkedIn", "weight": 50 } ],
      "objections": [ "3 objections" ],
      "favorite_products": [ "Favorite products/tools" ],
      "quote": "A realistic customer quote.",
      "interests": [ { "axis": "Pricing", "value": 8 }, { "axis": "Reliability", "value": 9 }, { "axis": "Brand", "value": 6 }, { "axis": "Innovation", "value": 8 }, { "axis": "Support", "value": 9 } ]
    },
    { ...second persona, distinct },
    { ...third persona, distinct }
  ],
  "recommendations": [ "3 imperatives" ]
}""",

    "competitor_analysis": """{
  "summary": "1-2 sentence summary.",
  "competitors": [
    { "name": "Razorpay Payments (Direct)", "score": 8.0, "strengths": ["..."], "weaknesses": ["..."], "pricing": "$$",  "market_share": 35 },
    ... exactly 8 items (5 direct + 3 indirect)
  ],
  "direct_competitors": [
    {
      "name": "Razorpay Payments",
      "website": "https://razorpay.com",
      "positioning": "Their core market position.",
      "strengths": ["strength 1", "strength 2"],
      "weaknesses": ["weakness 1", "weakness 2"],
      "pricing_model": "Freemium / Subscription / Usage-based",
      "differentiation_opportunity": "How we can beat them."
    },
    ... exactly 5 items
  ],
  "indirect_competitors": [
    {
      "name": "Firebase",
      "website": "https://firebase.google.com",
      "positioning": "Their core market position.",
      "strengths": ["strength 1", "strength 2"],
      "weaknesses": ["weakness 1", "weakness 2"],
      "pricing_model": "Usage scale tiers",
      "differentiation_opportunity": "How we can beat them."
    },
    ... exactly 3 items
  ],
  "features": [
    { "name": "Feature A", "us": true,  "acme": true,  "northwind": false, "globex": true,  "soylent": false, "initech": false },
    { "name": "Feature B", "us": true,  "acme": false, "northwind": true,  "globex": false, "soylent": true,  "initech": false },
    { "name": "Feature C", "us": true,  "acme": true,  "northwind": true,  "globex": false, "soylent": false, "initech": true  },
    { "name": "Feature D", "us": true,  "acme": false, "northwind": false, "globex": true,  "soylent": false, "initech": false }
  ],
  "gaps":          [ "3 gaps to exploit" ],
  "opportunities": [ "3 opportunities" ],
  "recommendations": [ "3 imperatives" ]
}""",
}


def build_prompt(kind: str, project: dict) -> str:
    schema = SCHEMAS[kind]
    # Gracefully default null/undefined workspace data fields to avoid crashing (STEP 4)
    p_name = project.get("name") or "My Startup"
    p_tagline = project.get("tagline") or ""
    p_industry = project.get("industry") or ""
    p_stage = project.get("stage") or "Idea"
    p_problem = project.get("problem") or ""
    p_solution = project.get("solution") or ""
    p_market = project.get("market") or ""
    p_competitors = project.get("competitors") or ""
    p_personas = project.get("customer personas") or ""
    p_strategy = project.get("strategy") or ""
    p_marketing = project.get("marketing") or ""
    p_funding = project.get("funding") or ""

    return (
        f"You are STUDLYF AI, an expert startup strategist generating data for an executive dashboard.\n\n"
        f"Project:\n"
        f"- Name: {p_name}\n"
        f"- Tagline: {p_tagline}\n"
        f"- Industry: {p_industry}\n"
        f"- Stage: {p_stage}\n"
        f"- Problem: {p_problem}\n"
        f"- Solution: {p_solution}\n"
        f"- Target Market: {p_market}\n"
        f"- Competitors: {p_competitors}\n"
        f"- Customer Personas: {p_personas}\n"
        f"- Strategy notes: {p_strategy}\n"
        f"- Marketing notes: {p_marketing}\n"
        f"- Funding details: {p_funding}\n\n"
        f"Task: Generate a {KIND_LABELS[kind]} for this startup. Output a SINGLE JSON object. "
        f"No prose, no markdown fences, no commentary — just the JSON. "
        f"Match this exact schema (replace example values with high-quality, specific content for the startup):\n\n"
        f"{schema}\n\n"
        f"Rules:\n"
        f"- Be specific to the startup's industry and stage. Avoid generic platitudes.\n"
        f"- Numbers must be plausible, not placeholders.\n"
        f"- Return STRICT JSON only — your entire reply must parse with json.loads.\n"
    )
