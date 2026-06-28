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
    "customer_segments":      [ "bullet", "bullet", ... 3-5 ],
    "value_propositions":     [ ... ],
    "channels":               [ ... ],
    "customer_relationships": [ ... ],
    "revenue_streams":        [ ... ],
    "key_resources":          [ ... ],
    "key_activities":         [ ... ],
    "key_partnerships":       [ ... ],
    "cost_structure":         [ ... ]
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
  "recommendations": [ "3 imperatives" ]
}""",

    "marketing_plan": """{
  "summary": "1-2 sentence summary.",
  "scores": { "overall": 7.4, "brand": 6, "demand": 8, "content": 7, "retention": 6 },
  "objectives": [ "...", "...", "..." ],
  "kpis": [
    { "label": "MQLs / mo",   "value": "1,200" },
    { "label": "CAC",         "value": "$240" },
    { "label": "CAC payback", "value": "8 mo" },
    { "label": "NPS target",  "value": "55" }
  ],
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
  "summary": "1-2 sentence summary.",
  "duration_sec": 60,
  "sections": [
    { "label": "Hook",        "seconds": 6,  "text": "..." },
    { "label": "Problem",     "seconds": 10, "text": "..." },
    { "label": "Solution",    "seconds": 12, "text": "..." },
    { "label": "Market",      "seconds": 8,  "text": "..." },
    { "label": "Business",    "seconds": 8,  "text": "..." },
    { "label": "Traction",    "seconds": 8,  "text": "..." },
    { "label": "Ask",         "seconds": 8,  "text": "..." }
  ],
  "tips": [ "2-3 delivery tips" ]
}""",

    "pitch_deck": """{
  "summary": "1-2 sentence summary.",
  "score": 7.8,
  "slides": [
    { "n": 1,  "title": "Cover",            "subtitle": "...", "bullets": [], "speaker_notes": "..." },
    { "n": 2,  "title": "Problem",          "bullets": ["...","...","..."], "speaker_notes": "..." },
    { "n": 3,  "title": "Solution",         "bullets": [...], "speaker_notes": "..." },
    { "n": 4,  "title": "Market Opportunity","bullets": [...], "metric": { "label":"TAM","value":"$42B" }, "speaker_notes": "..." },
    { "n": 5,  "title": "Product",          "bullets": [...], "speaker_notes": "..." },
    { "n": 6,  "title": "Business Model",   "bullets": [...], "speaker_notes": "..." },
    { "n": 7,  "title": "Competition",      "bullets": [...], "speaker_notes": "..." },
    { "n": 8,  "title": "Go-to-Market",     "bullets": [...], "speaker_notes": "..." },
    { "n": 9,  "title": "Traction",         "bullets": [...], "metric": { "label":"MRR","value":"$24K"}, "speaker_notes": "..." },
    { "n": 10, "title": "Financials",       "bullets": [...], "speaker_notes": "..." },
    { "n": 11, "title": "Roadmap",          "bullets": [...], "speaker_notes": "..." },
    { "n": 12, "title": "Team",             "bullets": [...], "speaker_notes": "..." },
    { "n": 13, "title": "Investment Ask",   "bullets": [...], "metric": { "label":"Raising","value":"$2M"}, "speaker_notes": "..." },
    { "n": 14, "title": "Thank You",        "subtitle": "Contact + next step", "speaker_notes": "..." }
  ],
  "recommendations": [ "3 imperatives to improve the deck" ]
}""",

    "vc_score": """{
  "summary": "1-2 sentence summary.",
  "overall_score": 7.4,
  "recommendation": "WATCH",  // PASS | WATCH | INVEST
  "rationale": "2-sentence reason.",
  "dimensions": [
    { "key": "Market",    "score": 8, "comment": "..." },
    { "key": "Product",   "score": 7, "comment": "..." },
    { "key": "Founder",   "score": 8, "comment": "..." },
    { "key": "Traction",  "score": 5, "comment": "..." },
    { "key": "Financial", "score": 6, "comment": "..." },
    { "key": "Risk",      "score": 4, "comment": "..." }
  ],
  "strengths":   [ "3 bullets" ],
  "concerns":    [ "3 bullets" ],
  "next_questions": [ "3 questions a VC would ask next" ]
}""",

    "customer_persona": """{
  "summary": "1-2 sentence summary.",
  "personas": [
    {
      "name": "Maya Patel",
      "role": "Head of Fleet Ops",
      "age": 34,
      "income": "$120K",
      "location": "Bengaluru",
      "avatar_initial": "M",
      "color": "#6C63FF",
      "goals":      [ "3 goals" ],
      "pains":      [ "3 pain points" ],
      "objections": [ "2 objections" ],
      "buying_behavior": "Short sentence.",
      "channels":   [ { "name": "LinkedIn", "weight": 40 }, { "name": "Email", "weight": 25 }, { "name": "Events","weight":20 },{ "name":"Search","weight":15 } ],
      "interests":  [ { "axis":"Pricing","value":9 },{ "axis":"Reliability","value":8 },{ "axis":"Brand","value":5 },{ "axis":"Innovation","value":7 },{ "axis":"Support","value":8 } ]
    },
    { ...second persona, distinct }
  ],
  "recommendations": [ "3 imperatives" ]
}""",

    "competitor_analysis": """{
  "summary": "1-2 sentence summary.",
  "competitors": [
    { "name": "Acme",    "score": 7.2, "strengths": ["..."], "weaknesses": ["..."], "pricing": "$$",  "market_share": 28 },
    { "name": "Northwind","score": 6.4, "strengths": ["..."], "weaknesses": ["..."], "pricing": "$$$", "market_share": 18 },
    { "name": "Globex",  "score": 5.8, "strengths": ["..."], "weaknesses": ["..."], "pricing": "$",   "market_share": 14 },
    { "name": "Soylent", "score": 5.1, "strengths": ["..."], "weaknesses": ["..."], "pricing": "$$",  "market_share": 9  },
    { "name": "Initech", "score": 4.6, "strengths": ["..."], "weaknesses": ["..."], "pricing": "$$",  "market_share": 6  }
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
    return (
        f"You are STUDLYF AI, an expert startup strategist generating data for an executive dashboard.\n\n"
        f"Project:\n"
        f"- Name: {project.get('name')}\n"
        f"- Tagline: {project.get('tagline')}\n"
        f"- Industry: {project.get('industry')}\n"
        f"- Stage: {project.get('stage')}\n\n"
        f"Task: Generate a {KIND_LABELS[kind]} for this startup. Output a SINGLE JSON object. "
        f"No prose, no markdown fences, no commentary — just the JSON. "
        f"Match this exact schema (replace example values with high-quality, specific content for the startup):\n\n"
        f"{schema}\n\n"
        f"Rules:\n"
        f"- Be specific to the startup's industry and stage. Avoid generic platitudes.\n"
        f"- Numbers must be plausible, not placeholders.\n"
        f"- Return STRICT JSON only — your entire reply must parse with json.loads.\n"
    )
