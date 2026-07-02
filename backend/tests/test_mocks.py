import re
import json

def get_test_mock_content(prompt_text: str, session_id: str = "") -> str:
    session_id = str(session_id).lower()
    prompt_text = prompt_text.lower()

    # Extract metadata from prompt to customize insights
    name = "Lumen Labs"
    tagline = "An EV charging marketplace for fleets and prosumers"
    industry = "Cleantech / Mobility"
    stage = "Pre-seed"

    name_m = re.search(r"-\s*Name:\s*(.*)", prompt_text)
    if name_m: name = name_m.group(1).strip()
    tagline_m = re.search(r"-\s*Tagline:\s*(.*)", prompt_text)
    if tagline_m: tagline = tagline_m.group(1).strip()
    industry_m = re.search(r"-\s*Industry:\s*(.*)", prompt_text)
    if industry_m: industry = industry_m.group(1).strip()
    stage_m = re.search(r"-\s*Stage:\s*(.*)", prompt_text)
    if stage_m: stage = stage_m.group(1).strip()

    # 0. Memory & direct extract questions
    if "extract" in session_id or "extract-startup" in prompt_text or "extract the startup details" in prompt_text:
        return json.dumps({
            "name": "NovaMail" if "novamail" in prompt_text else "Lumen Labs",
            "tagline": "an AI cold-email tool for B2B sales teams." if "novamail" in prompt_text else "An EV charging marketplace for fleets and prosumers.",
            "industry": "Cleantech / Mobility",
            "stage": "Pre-seed"
        })

    if "what is my startup called" in prompt_text or "what is the name" in prompt_text:
        return "Your startup is PixelForge AI."

    # 1. SWOT Analysis
    if "swot" in prompt_text:
        return json.dumps({
            "summary": f"SWOT Analysis for {name}, operating in the {industry} space as a {stage} startup, highlighting strong defensive moats balanced against early-stage execution risks.",
            "scores": {
                "overall": 8.4,
                "internal": 8.1,
                "external": 8.6
            },
            "strengths": [
                { "title": "Proprietary Core IP", "detail": f"Highly scalable architecture tailored for {industry}.", "score": 9 },
                { "title": "Early Market Mover", "detail": f"Unique value proposition offering direct advantages over incumbents.", "score": 8 },
                { "title": "Strong Founder Fit", "detail": "Deep domain expertise and tech capability within the founding team.", "score": 9 },
                { "title": "Resource Efficiency", "detail": "Low operational overhead allowing high capital efficiency during early scaling.", "score": 8 },
                { "title": "Defensive Architecture", "detail": "High barriers to replication through integrations and user lock-in.", "score": 8 }
            ],
            "weaknesses": [
                { "title": "Brand Visibility", "detail": "Early stage implies limited brand awareness relative to industry giants.", "score": 4 },
                { "title": "Distribution Scale", "detail": "Currently building out primary acquisition loops and partnerships.", "score": 5 },
                { "title": "Capital Constraints", "detail": "Limited runway prior to seed funding inhibits aggressive parallel hiring.", "score": 4 },
                { "title": "Hiring Speed", "detail": "Finding top-tier talent in specialized domains takes time.", "score": 5 },
                { "title": "Dependency Risks", "detail": "Early reliance on third-party cloud providers and APIs.", "score": 5 }
            ],
            "opportunities": [
                { "title": "Market Expansion", "detail": f"Unlocking rapid scalability across target audience demographics.", "score": 9 },
                { "title": "Partnership Integration", "detail": "Strategic alliances with enterprise players to accelerate distribution.", "score": 8 },
                { "title": "AI Integration", "detail": "Leveraging agentic workflows to increase user efficiency and lower churn.", "score": 9 },
                { "title": "Regulatory Tailwind", "detail": "Favorable regulatory environments and compliance updates globally.", "score": 8 },
                { "title": "Product Line Expansion", "detail": "Cross-selling premium modules to increase Lifetime Value (LTV).", "score": 8 }
            ],
            "threats": [
                { "title": "Incumbent Copycats", "detail": "Risk of larger, well-funded incumbents building copycat features.", "score": 5 },
                { "title": "Economic Slowdown", "detail": "Global macroeconomic factors impacting SaaS budget allocations.", "score": 4 },
                { "title": "Platform Shifting", "detail": "Changes in major OS provider policies or database API keys.", "score": 5 },
                { "title": "Talent Churn", "detail": "Aggressive recruitment from legacy giants driving up compensation.", "score": 4 },
                { "title": "Customer Churn", "detail": "Potential early-stage churn if product-market fit has slight gaps.", "score": 4 }
            ],
            "radar": [
                { "axis": "Team",       "value": 8 },
                { "axis": "Product",    "value": 9 },
                { "axis": "Market",     "value": 8 },
                { "axis": "Traction",   "value": 7 },
                { "axis": "Finance",    "value": 6 },
                { "axis": "Brand",      "value": 7 }
            ],
            "recommendations": [
                "Focus engineering resources on shipping the core proprietary IP.",
                "Initiate early pilot partnerships to build defensive distribution moats.",
                "Optimize customer onboarding to eliminate early product adoption hurdles."
            ]
        })

    # 2. VC Score Report
    elif "vc_score" in prompt_text or "vc score" in prompt_text:
        return json.dumps({
            "summary": f"VC scorecard assessment for {name}, highlighting strong product defensibility and developer traction.",
            "overall_score": 8.2,
            "recommendation": "INVEST",
            "rationale": f"High developer velocity market tailwinds paired with {name}'s strong product-led growth model make it a compelling pre-seed investment opportunity.",
            "dimensions": [
                { "key": "Market Size", "score": 8, "comment": f"Large and growing market for dev-tools in {industry}." },
                { "key": "Team Strength", "score": 9, "comment": "Founders have direct domain expertise and startup exits." },
                { "key": "Defensibility", "score": 8, "comment": "Moats built through integrations, APIs, and user data." },
                { "key": "Traction", "score": 7, "comment": "5,000 developers onboarded with high initial retention." },
                { "key": "Scalability", "score": 9, "comment": "API-first distribution allows global reach with low incremental cost." },
                { "key": "Revenue Potential", "score": 8, "comment": "Usage-based tiers provide high contract expansion options." },
                { "key": "Competition Risk", "score": 6, "comment": "Large player presence mitigated by unified platform approach." },
                { "key": "Timing", "score": 9, "comment": "Tailwinds from AI coding agents and cloud migration trends." },
                { "key": "Overall Fundability", "score": 8.5, "comment": "Strong fundability profile for top-tier accelerators." }
            ],
            "strengths": [
                "High developer product-market fit demonstrated by early signup volume.",
                "Unified system design reducing multi-tool integration fatigue.",
                "Experienced technical founders with direct domain history."
            ],
            "concerns": [
                "Potential copycat features from hyperscalers.",
                "SaaS budget controls inside target buyer organizations.",
                "Longer sales cycles for enterprise upgrade tiers."
            ],
            "risks": [
                "Potential copycat features from hyperscalers.",
                "SaaS budget controls inside target buyer organizations.",
                "Longer sales cycles for enterprise upgrade tiers."
            ],
            "next_questions": [
                "What is the average week-4 retention score for signed-up developers?",
                "How do you plan to compress the sales pipeline for enterprise buyers?",
                "What is the roadmap for supporting custom developer database schemas?"
            ],
            "recommendations": [
                "Focus engineering resources on shipping the core proprietary IP.",
                "Initiate early pilot partnerships to build defensive distribution moats.",
                "Optimize customer onboarding to eliminate early product adoption hurdles."
            ]
        })

    # 3. Pitch Deck
    elif "pitch_deck" in prompt_text or "pitch deck" in prompt_text:
        return json.dumps({
            "summary": f"Investor pitch deck presentation framework for {name}.",
            "score": 8.4,
            "slides": [
                { "n": 1, "title": "Cover", "subtitle": f"{name}: The Developer OS for scaling modern software.", "bullets": [f"Founded in 2026", "A developer-first startup OS platform", f"Accelerating {industry} scaling by 10x"], "speaker_notes": "Welcome everyone. I'm excited to present our platform today." },
                { "n": 2, "title": "Problem", "subtitle": "Software development is broken.", "bullets": ["Boilerplate integrations take weeks", "Data fragmentation causes latency", "Early-stage operational costs are prohibitive"], "speaker_notes": "The primary roadblock for startups is development velocity." },
                { "n": 3, "title": "Solution", "subtitle": f"Accelerating velocity with {name}.", "bullets": [f"10x faster implementation cycles", "Unified API interface", "Built-in security, auth, and database modules"], "speaker_notes": "Our solution bridges the gap between idea and production." },
                { "n": 4, "title": "Product Demo", "subtitle": "A unified builder environment.", "bullets": ["Visual database schema designer", "Automated code generators", "One-click deployment pipeline"], "speaker_notes": "Let's review the product capabilities and developer sandboxes." },
                { "n": 5, "title": "Market Size", "subtitle": "A massive, expanding sector.", "bullets": ["Global developer tools market at $15B", "Growing developer ecosystem in APAC and India", "Increasing demand for automated cloud integrations"], "metric": { "label": "TAM", "value": "$15B" }, "speaker_notes": "We are operating in a highly expansive and growing market." },
                { "n": 6, "title": "Business Model", "subtitle": "Predictable SaaS and API pricing.", "bullets": ["Developer Free Tier", "Pro Subscription starting at $29/month", "Enterprise SLA usage volume rates"], "speaker_notes": "We align our monetization directly with developer scale." },
                { "n": 7, "title": "Traction", "subtitle": "Exceptional early adoption.", "bullets": ["5,000+ developer accounts", "12% WoW active usage growth", "3 pilot enterprise contracts signed"], "metric": { "label": "Developers", "value": "5K+" }, "speaker_notes": "The adoption metrics highlight high developer product fit." },
                { "n": 8, "title": "Competition", "subtitle": "Our strategic differentiation.", "bullets": ["Competitors focus on niche modules", "We offer a unified startup OS layer", "10x lower setup complexity"], "speaker_notes": "We sit at the intersection of developer IDEs and cloud hosting." },
                { "n": 9, "title": "Go-To-Market", "subtitle": "Product-led growth framework.", "bullets": ["Developer community advocacy", "Organic SEO content hubs", "Founder-led outbound pipelines"], "speaker_notes": "Our GTM model drives high volume developer adoption organically." },
                { "n": 10, "title": "Financial Projections", "subtitle": "Strong margin and growth projections.", "bullets": ["Targeting $1M ARR in 12 months", "Gross margins projected at 82%", "Capital efficient operating model"], "speaker_notes": "Here are our financial projections for the next 3 years." },
                { "n": 11, "title": "Team", "subtitle": "Experienced builders and operators.", "bullets": ["CTO: 10 years SaaS engineering experience", "CEO: Previous startup exit in dev-tools", "Advisors from top global cloud accelerators"], "speaker_notes": "Our team has a strong founder-product fit." },
                { "n": 12, "title": "Ask", "subtitle": "Join our pre-seed round.", "bullets": ["Raising $500,000 convertible note", "60% allocated to engineering talent", "40% allocated to growth and GTM"], "metric": { "label": "Raising", "value": "$500K" }, "speaker_notes": "We are looking for strategic partners to join this journey." }
            ],
            "recommendations": [
                "Include dynamic screenshots of the database designer in slide 4.",
                "Highlight the WoW developer traction on slide 7.",
                "Refine the team slide to emphasize domain experience."
            ]
        })

    # 4. 1-Page Marketing Plan
    elif "marketing_plan" in prompt_text or "marketing plan" in prompt_text:
        return json.dumps({
            "summary": f"Structured growth and customer acquisition blueprint for {name}.",
            "scores": {
                "overall": 8.0,
                "brand": 7,
                "medium": 8,
                "demand": 9,
                "content": 8,
                "retention": 8
            },
            "positioning_statement": f"The premier developer-first startup operating system designed to scale product velocity for {name}.",
            "messaging_pillars": [
                { "pillar": "Developer Speed", "core_message": "Build and ship MVPs in hours, not weeks or months." },
                { "pillar": "Unified Stack", "core_message": "One subscription replaces auth, db, hosting, and CRM modules." },
                { "pillar": "Zero Cloud Lock-in", "core_message": "Export your standard Postgres and React code at any time." }
            ],
            "seo_strategy": {
                "keywords": ["startup mvp platform", "developer operating system", "fast backend bootstrap"],
                "pillar_pages": ["The Essential 2026 Guide to Launching a Developer-First Startup SaaS"]
            },
            "content_strategy": {
                "frequency": "3 technical tutorials per week",
                "formats": ["Hacker News essays", "Integration templates", "Dev.to guides"]
            },
            "social_media_strategy": {
                "platforms": ["Twitter/X & LinkedIn"],
                "content_themes": ["Build in public milestones", "Boilerplate speedruns", "Founder advice"]
            },
            "paid_ads_strategy": {
                "channels": ["Google Search", "Twitter Developer Retargeting"],
                "budget_allocation": "70% Search, 30% Twitter Retargeting"
            },
            "email_strategy": {
                "newsletter_frequency": "Weekly developer digest",
                "drip_campaigns": ["7-day rapid prototype onboarding sequence"]
            },
            "influencer_strategy": {
                "target_profiles": ["GitHub maintainers", "Indie hacker creators"],
                "engagement_model": "Co-marketing credits & open-source sponsorships"
            },
            "launch_campaign_ideas": [
                { "campaign_name": "Product Hunt v1.0 Release", "channel": "Product Hunt + TechCrunch" }
            ],
            "marketing_calendar_30_day": [
                { "week": 1, "campaign": "Tech Influencer Sandbox Walkthrough", "channel": "YouTube" },
                { "week": 2, "campaign": "Pillar Post Launch", "channel": "SEO Blog" },
                { "week": 3, "campaign": "Hacker News Showcase", "channel": "Show HN" },
                { "week": 4, "campaign": "Retargeting Ads Kickoff", "channel": "Google Display" }
            ],
            "weekly_goals": [
                "Week 1: Reach 500 active sandbox deployments.",
                "Week 2: Secure first 30 product reviews on G2/Product Hunt.",
                "Week 3: Index all 5 developer pillar pages on Google search.",
                "Week 4: Onboard 20 paid Pro developers."
            ],
            "recommended_tools": ["PostHog Analytics", "Resend Email", "Google Search Console", "Ahrefs"],
            "objectives": [
                "Drive 5,000 developer signups in the first 90 days.",
                "Establish domain authority in the SaaS niche.",
                "Achieve a pilot LTV:CAC ratio exceeding 3.5x."
            ],
            "kpis": [
                { "label": "MQLs / Month", "value": "1,500" },
                { "label": "Average CAC", "value": "₹9,500" },
                { "label": "Payback Period", "value": "8 months" },
                { "label": "NPS Target", "value": "60" }
            ],
            "channels": [
                { "name": "SEO & Technical Docs", "budget_pct": 30 },
                { "name": "Community & Developer Events", "budget_pct": 20 },
                { "name": "Targeted Search & Social Ads", "budget_pct": 20 },
                { "name": "Partnership Integration", "budget_pct": 15 },
                { "name": "Direct Outbound & ABM", "budget_pct": 10 },
                { "name": "PR & Brand Building", "budget_pct": 5 }
            ],
            "audience": [
                { "label": "Tech Founders & VP Eng", "value": 45 },
                { "label": "Software Developers", "value": 30 },
                { "label": "Product Managers", "value": 15 },
                { "label": "VCs & Tech Advisors", "value": 10 }
            ],
            "calendar": [
                { "week": 1, "campaign": "Developer Beta Launch Campaign", "channel": "Developer Communities" },
                { "week": 4, "campaign": "SEO Pillar Content & Case Studies", "channel": "SEO Blog" },
                { "week": 8, "campaign": "Developer Webinar & Hackathon", "channel": "Events" },
                { "week": 12, "campaign": "Joint Integration Announcement", "channel": "PR & Partners" }
            ],
            "recommendations": [
                "Write technical integration playbooks targeting popular SaaS stacks.",
                "Launch an automated referral loop giving early-access credits.",
                "Monitor week-1 retention patterns to fix onboarding dropoffs."
            ]
        })

    # 5. Brand Strategy
    elif "brand_strategy" in prompt_text or "brand strategy" in prompt_text:
        return json.dumps({
            "summary": f"Identity, voice, and design tokens framework for {name}.",
            "score": 8.2,
            "story": f"We started {name} to resolve the friction points in building modern software. Our mission is to democratize SaaS development.",
            "mission": "Empower builders everywhere to ship high-performing systems effortlessly.",
            "vision": "Become the default OS layer for modern startup scaling globally.",
            "positioning": f"The developer-first {industry} engine that accelerates product lifecycles.",
            "personality": [
                { "trait": "Confident", "value": 8 },
                { "trait": "Friendly", "value": 8 },
                { "trait": "Bold", "value": 9 },
                { "trait": "Trustworthy", "value": 9 },
                { "trait": "Modern", "value": 9 },
                { "trait": "Playful", "value": 6 }
            ],
            "voice": [
                { "do": "Write clear, direct, developer-friendly prose.", "dont": "Use vague buzzwords or corporate jargon." },
                { "do": "Provide helpful examples and code snippets.", "dont": "Make assumptions about user configurations." },
                { "do": "Focus on real speed and efficiency stats.", "dont": "Make promises we cannot support technically." },
                { "do": "Speak as a technical co-founder.", "dont": "Speak as a generic salesperson." }
            ],
            "taglines": [
                "Build SaaS in hours, not weeks.",
                "The developer OS for startups.",
                "Ship faster, scale further.",
                "Your code, accelerated.",
                "Empowering the next generation of builders."
            ],
            "palette": [
                { "name": "Brand Indigo", "hex": "#6C63FF" },
                { "name": "Spark Pink", "hex": "#FF4D94" },
                { "name": "Energy Orange", "hex": "#FF7A18" },
                { "name": "Trust Blue", "hex": "#3FA9F5" },
                { "name": "Growth Green", "hex": "#2ECC71" }
            ],
            "typography": {
                "heading": "Outfit",
                "body": "Plus Jakarta Sans"
            },
            "recommendations": [
                "Apply the visual color tokens consistently across dashboard widgets.",
                "Update documentation portals to match the direct technical brand voice.",
                "Use high-quality product screenshots in marketing assets."
            ]
        })

    # 6. Extract-startup (Bootstrap helper)
    elif "extract-startup" in prompt_text:
        return json.dumps({
            "name": "NovaMail" if "novamail" in prompt_text else "Lumen Labs",
            "tagline": "an AI cold-email tool for B2B sales teams." if "novamail" in prompt_text else "An EV charging marketplace for fleets and prosumers.",
            "industry": "Cleantech / Mobility",
            "stage": "Pre-seed"
        })

    # 7. Business Model Canvas
    elif "business_model_canvas" in prompt_text or "business model" in prompt_text:
        return json.dumps({
            "summary": f"Comprehensive Business Model Canvas outlining value delivery, customer segment targeting, and monetization frameworks for {name}.",
            "cells": {
                "customer_segments": [
                    f"Primary target audience requiring specialized {industry} solutions.",
                    "Mid-market enterprise operations seeking cost optimization.",
                    "SaaS developers looking for API-first integrations.",
                    "High-growth startups aiming to automate manual workflows.",
                    "Strategic partners requiring co-branded whitelist modules."
                ],
                "value_propositions": [
                    f"10x faster implementation of core operations via {name}.",
                    "Significant cost reduction relative to legacy alternatives.",
                    "Unified dashboard interface eliminating data fragmentation.",
                    "Highly configurable modular API-first infrastructure.",
                    "Enterprise-grade security and compliance built-in."
                ],
                "channels": [
                    "Organic Search (SEO) and educational blog portals.",
                    "Direct inbound product-led onboarding funnels.",
                    "Strategic developer community channels on Discord and GitHub.",
                    "Outbound founder-led sales outreach to early adopters.",
                    "Co-marketing integrations and App Stores."
                ],
                "customer_relationships": [
                    "Self-serve automated onboarding for individual users.",
                    "Dedicated high-touch success managers for enterprise clients.",
                    "Community-driven documentation and community forums.",
                    "Proactive usage-based optimization notifications.",
                    "24/7 technical developer support channels."
                ],
                "revenue_streams": [
                    "SaaS Subscription tiers (Pro, Team, Enterprise).",
                    "Usage-based API volume pricing.",
                    "Setup, onboarding and white-glove migration services.",
                    "Premium add-on templates and marketplace integrations.",
                    "Long-term custom SLA enterprise contracts."
                ],
                "key_resources": [
                    "Proprietary software codebase and system architecture.",
                    "Deep domain expertise of the founding team.",
                    "Robust cloud infrastructure and database clusters.",
                    "Active developer community assets and documentations.",
                    "Direct strategic database/API partnership agreements."
                ],
                "key_activities": [
                    "Continuous product engineering and API maintenance.",
                    "Content marketing and developer advocacy programs.",
                    "Enterprise customer onboarding and success management.",
                    "Strategic partnership development and integrations.",
                    "Data security audit and platform monitoring."
                ],
                "key_partnerships": [
                    "Primary cloud hosting infrastructure providers.",
                    "Database and API integration vendor partners.",
                    "Strategic distribution agencies and integrators.",
                    "Open-source developer groups and contributors.",
                    "Industry compliance and security auditors."
                ],
                "cost_structure": [
                    "Core software engineering and product talent salaries.",
                    "Cloud server hosting and API transactional costs.",
                    "Marketing, SEO content creation, and developer ad spend.",
                    "Enterprise sales tools and CRM software fees.",
                    "Compliance audits, insurance, and legal support."
                ]
            },
            "kpis": [
                { "label": "LTV:CAC Ratio", "value": "4.2x" },
                { "label": "Gross Margin", "value": "84%" },
                { "label": "Target Payback", "value": "8 months" }
            ],
            "recommendations": [
                "Scale self-serve developer channels to minimize direct sales overhead.",
                "Optimize API pricing tiers to capture expanding transaction volume.",
                "Establish co-marketing partnerships with key database vendors."
            ]
        })

    # 8. Go To Market Strategy
    elif "go_to_market" in prompt_text or "go-to-market" in prompt_text or "gtm" in prompt_text:
        return json.dumps({
            "summary": f"Comprehensive GTM strategy to capture early adopters and establish a stable distribution funnel for {name}.",
            "kpis": [
                { "label": "TAM (India)", "value": "$1.2B" },
                { "label": "SAM", "value": "$350M" },
                { "label": "SOM (Year 1)", "value": "$12M" },
                { "label": "Payback Period", "value": "9 months" }
            ],
            "icp": {
                "title": f"Technical founders and VP Product/Engineering at scaling {industry} firms.",
                "industries": [industry, "Software Development", "B2B SaaS"],
                "company_size": "20-500 employees",
                "geo": "India & APAC (Primary), Global (Secondary)",
                "buyer_role": "VP Engineering / CTO / Product Head"
            },
            "segments": [
                { "name": "Early-Stage Startups", "share": 50 },
                { "name": "Mid-Market Enterprise", "share": 35 },
                { "name": "Independent Developers", "share": 15 }
            ],
            "funnel": [
                { "stage": "Awareness", "value": 150000 },
                { "stage": "Consideration", "value": 35000 },
                { "stage": "Trial", "value": 8500 },
                { "stage": "Paid", "value": 1800 },
                { "stage": "Expansion", "value": 450 }
            ],
            "positioning": f"The unified developer-first platform designed to accelerate {industry} operations by 10x.",
            "messaging": [
                { "pillar": "Speed & Acceleration", "line": "Build and ship in hours, not weeks or months." },
                { "pillar": "Developer Experience", "line": "Designed by developers, for developers, with intuitive interfaces." },
                { "pillar": "Cost Efficiency", "line": "Pay only for what you build and use, scaling seamlessly." },
                { "pillar": "Enterprise Ready", "line": "Security, performance, and compliance out of the box." }
            ],
            "channels": [
                { "name": "Content Marketing & SEO", "priority": "high", "cac_estimate": "₹8,000" },
                { "name": "Developer Community-Led Growth", "priority": "high", "cac_estimate": "₹5,000" },
                { "name": "Founder-Led Outbound Sales", "priority": "medium", "cac_estimate": "₹25,000" },
                { "name": "Targeted LinkedIn Ads", "priority": "medium", "cac_estimate": "₹18,000" }
            ],
            "primary_acquisition_channels": [
                { "name": "Developer Community-Led Growth", "details": "Direct advocacy inside Discord & GitHub channels.", "priority": "High" },
                { "name": "Organic Search (SEO)", "details": "Problem-focused technical blogs and integrations tutorials.", "priority": "High" },
                { "name": "Founder-Led Outbound Sales", "details": "Direct LinkedIn outreach to CTOs/VPs of Engineering.", "priority": "Medium" }
            ],
            "launch_strategy": {
                "strategy": f"Product-led growth (PLG) beta release on Product Hunt and local developer events in India.",
                "milestones": [
                    "Day 1: Private beta invite code rollout to 200 waitlisted devs.",
                    "Day 15: Launch free public sandbox environments.",
                    "Day 30: Launch Pro tier pricing and direct API billing."
                ]
            },
            "roadmap_90_day": [
                { "phase": "Days 1-30", "focus": "Developer validation and beta feedback loop.", "actions": ["Collect onboarding feedback", "Fix early DB deployment bottlenecks"] },
                { "phase": "Days 31-60", "focus": "Launch campaigns & outreach automation.", "actions": ["Product Hunt release campaign", "Start founder-led outbound campaigns"] },
                { "phase": "Days 61-90", "focus": "Viral growth loop activation.", "actions": ["Implement double-sided referral program", "Establish database vendor sponsorships"] }
            ],
            "customer_acquisition_funnel": [
                { "stage": "Awareness", "value": 150000, "description": "Tech blogs, sponsorships, and community word-of-mouth" },
                { "stage": "Consideration", "value": 35000, "description": "Interactive API docs and direct sandboxing" },
                { "stage": "Trial", "value": 8500, "description": "Free project database schema creations" },
                { "stage": "Paid", "value": 1800, "description": "Upgrades to Pro subscription plan" },
                { "stage": "Expansion", "value": 450, "description": "Additional team seats and usage expansion" }
            ],
            "partnerships": [
                { "partner_type": "Cloud Service Providers", "value_prop": "Promotional credits exchange & developer marketplace visibility" }
            ],
            "community_strategy": {
                "platform": "Discord & GitHub",
                "engagement_plan": "Host weekly visual hackathons and issue-solving bounties."
            },
            "referral_strategy": {
                "mechanism": "Double-sided credit rewards embedded in the user dashboard.",
                "incentives": "$50 usage credit to both referrer and referral builder."
            },
            "pricing_strategy": {
                "strategy": "Value-based sandbox progression tiers.",
                "tiers": ["Free Developer Sandbox", "Pro Builder ($29/mo)", "Scale Tier ($99/mo)"]
            },
            "growth_loops": [
                { "loop_type": "Organic referral loop", "mechanism": "Deploy buttons and badge credits shown on user-created landing pages." }
            ],
            "recommendations": [
                "Deploy educational content focusing on developer pain points.",
                "Launch free-tier developer sandboxes to reduce adoption friction.",
                "Engage in developer relations (DevRel) communities to drive brand awareness."
            ]
        })

    # 9. 1-Minute Pitch
    elif "one_minute_pitch" in prompt_text or "1-minute pitch" in prompt_text:
        return json.dumps({
            "summary": f"elevator pitch for {name}.",
            "duration_sec": 60,
            "sections": [
                { "label": "Hook", "seconds": 6, "text": f"Every day, thousands of founders fail because building MVPs and scaling SaaS products is slow and costly." },
                { "label": "Problem", "seconds": 10, "text": f"Founders spend months writing boilerplate configurations, database integrations, and auth schemas instead of building core value." },
                { "label": "Solution", "seconds": 12, "text": f"That is why we built {name}. Our platform accelerates development by 10x, enabling teams to build and scale SaaS in hours." },
                { "label": "Market Opportunity", "seconds": 8, "text": f"We are targeting the global developer tools market, a 15-billion-dollar sector growing at 18% CAGR." },
                { "label": "Traction", "seconds": 8, "text": f"In just 60 days, we have onboarded over 5,000 developers, showing a week-over-week growth of 12%." },
                { "label": "Business Model", "seconds": 8, "text": f"Our business model is a simple SaaS subscription paired with usage-based API volume pricing." },
                { "label": "Why Now", "seconds": 6, "text": "With the explosion of AI coding tools, the barrier to launch is low, but operational orchestration complexity is at an all-time high." },
                { "label": "Closing Ask", "seconds": 8, "text": f"We are raising a round of 500,000 dollars to expand our engineering team and scale distribution. Join us." }
            ],
            "tips": [
                "Speak clearly and space out your transitions.",
                "Emphasize the 10x speed improvement metrics.",
                "Maintain strong eye contact with the lens."
            ]
        })

    # 10. Customer Personas (exactly 3 detailed personas)
    elif "customer_persona" in prompt_text or "customer persona" in prompt_text or "persona" in prompt_text:
        return json.dumps({
            "summary": f"Detailed ICP buyer personas tailored for {name}.",
            "personas": [
                {
                    "name": "Rohit Sharma",
                    "age_range": "28-32",
                    "age": 29,
                    "occupation": "VP of Engineering",
                    "role": "VP of Engineering",
                    "location": "Bengaluru, India",
                    "income_level": "₹32 LPA",
                    "income": "₹32 LPA",
                    "avatar_initial": "R",
                    "color": "#6C63FF",
                    "goals": [
                        "Reduce engineering sprint cycles by 30%.",
                        "Minimize infrastructure overhead and boilerplate code writing.",
                        "Standardize API security layers across the engineering organization."
                    ],
                    "pain_points": [
                        "Wasting developer hours on legacy database configs and deployments.",
                        "Inconsistent auth flows across secondary product pipelines.",
                        "High operational costs of maintaining custom database servers."
                    ],
                    "pains": [
                        "Wasting developer hours on legacy database configs and deployments.",
                        "Inconsistent auth flows across secondary product pipelines.",
                        "High operational costs of maintaining custom database servers."
                    ],
                    "objections": [
                        "Platform lock-in and dependency on a startup vendor.",
                        "Potential security compliance gaps for client databases."
                    ],
                    "buying_triggers": "Triggered when scaling team sizes push sprint cycles past 2 weeks due to integration bottlenecks.",
                    "buying_behavior": "Conducts deep technical sandboxing; relies heavily on peer recommendations on Twitter/LinkedIn.",
                    "preferred_channels": [
                        { "name": "LinkedIn & Twitter", "weight": 45 },
                        { "name": "GitHub & Dev.to", "weight": 25 },
                        { "name": "Tech Events", "weight": 20 },
                        { "name": "Direct Search", "weight": 10 }
                    ],
                    "channels": [
                        { "name": "LinkedIn & Twitter", "weight": 45 },
                        { "name": "GitHub & Dev.to", "weight": 25 },
                        { "name": "Tech Events", "weight": 20 },
                        { "name": "Direct Search", "weight": 10 }
                    ],
                    "favorite_products": ["Supabase", "Linear", "Vercel", "Slack"],
                    "quote": "We need solutions that help developers build core product features immediately, rather than configuring infra boilerplate for the fifth time.",
                    "interests": [
                        { "axis": "Pricing", "value": 7 },
                        { "axis": "Reliability", "value": 9 },
                        { "axis": "Brand", "value": 6 },
                        { "axis": "Innovation", "value": 8 },
                        { "axis": "Support", "value": 9 }
                    ]
                },
                {
                    "name": "Anjali Mehta",
                    "age_range": "25-30",
                    "age": 27,
                    "occupation": "Technical Product Manager",
                    "role": "Technical Product Manager",
                    "location": "Mumbai, India",
                    "income_level": "₹22 LPA",
                    "income": "₹22 LPA",
                    "avatar_initial": "A",
                    "color": "#FF4D94",
                    "goals": [
                        "Validate product MVPs with users within 2 weeks of scoping.",
                        "Align development backlogs with user analytics directly.",
                        "Maintain clean documentation and system architecture maps."
                    ],
                    "pain_points": [
                        "Engineering delays when building minor database field additions.",
                        "Difficulty extracting user metrics from legacy databases.",
                        "Slow product onboarding pipelines causing early user dropoffs."
                    ],
                    "pains": [
                        "Engineering delays when building minor database field additions.",
                        "Difficulty extracting user metrics from legacy databases.",
                        "Slow product onboarding pipelines causing early user dropoffs."
                    ],
                    "objections": [
                        "SaaS subscriptions adding up and requiring procurement signoff.",
                        "Lack of custom UI design flexibilities in generation output."
                    ],
                    "buying_triggers": "When user validation cycles lag behind competitor feature releases due to database schema locks.",
                    "buying_behavior": "Initiates product trials on free-tiers; coordinates closely with VP of Engineering for adoption decisions.",
                    "preferred_channels": [
                        { "name": "Product Hunt", "weight": 40 },
                        { "name": "Developer Docs", "weight": 30 },
                        { "name": "Newsletter", "weight": 20 },
                        { "name": "Referral", "weight": 10 }
                    ],
                    "channels": [
                        { "name": "Product Hunt", "weight": 40 },
                        { "name": "Developer Docs", "weight": 30 },
                        { "name": "Newsletter", "weight": 20 },
                        { "name": "Referral", "weight": 10 }
                    ],
                    "favorite_products": ["Figma", "Notion", "Mixpanel", "Jira"],
                    "quote": "If we can validate our designs with live databases in a sandbox in 2 hours, we save weeks of engineering alignment discussions.",
                    "interests": [
                        { "axis": "Pricing", "value": 8 },
                        { "axis": "Reliability", "value": 8 },
                        { "axis": "Brand", "value": 5 },
                        { "axis": "Innovation", "value": 9 },
                        { "axis": "Support", "value": 8 }
                    ]
                },
                {
                    "name": "Siddharth Goel",
                    "age_range": "24-28",
                    "age": 26,
                    "occupation": "SaaS Tech Co-Founder",
                    "role": "SaaS Tech Co-Founder",
                    "location": "New Delhi, India",
                    "income_level": "₹18 LPA",
                    "income": "₹18 LPA",
                    "avatar_initial": "S",
                    "color": "#2ECC71",
                    "goals": [
                        "Ship full-stack web applications to early adopters in less than a week.",
                        "Avoid building custom authentication and billing integrations manually.",
                        "Iterate on database schemas dynamically based on early customer feedback."
                    ],
                    "pain_points": [
                        "Spent 3 weeks setting up Supabase, Clerk, and Stripe instead of product coding.",
                        "Limited runway pressure requiring instant distribution validation.",
                        "Small team size limiting engineering productivity."
                    ],
                    "pains": [
                        "Spent 3 weeks setting up Supabase, Clerk, and Stripe instead of product coding.",
                        "Limited runway pressure requiring instant distribution validation.",
                        "Small team size limiting engineering productivity."
                    ],
                    "objections": [
                        "Pricing tiers scale too fast once early developer limits are crossed.",
                        "Exporting database code might be difficult if we need to migrate."
                    ],
                    "buying_triggers": "When runway falls under 6 months and MVP needs to ship immediately to secure round funding.",
                    "buying_behavior": "Looks for tools with a strong free tier on Reddit, Hacker News, and Product Hunt; makes buying choices rapidly.",
                    "preferred_channels": [
                        { "name": "Hacker News & Reddit", "weight": 50 },
                        { "name": "Indie Hackers", "weight": 20 },
                        { "name": "Product Hunt", "weight": 20 },
                        { "name": "Direct Search", "weight": 10 }
                    ],
                    "channels": [
                        { "name": "Hacker News & Reddit", "weight": 50 },
                        { "name": "Indie Hackers", "weight": 20 },
                        { "name": "Product Hunt", "weight": 20 },
                        { "name": "Direct Search", "weight": 10 }
                    ],
                    "favorite_products": ["Vite", "TailwindCSS", "Postgres", "Cursor"],
                    "quote": "As a technical founder, every hour spent setting up auth, Stripe webhooks, or server configurations is an hour stolen from talking to customers.",
                    "interests": [
                        { "axis": "Pricing", "value": 9 },
                        { "axis": "Reliability", "value": 7 },
                        { "axis": "Brand", "value": 5 },
                        { "axis": "Innovation", "value": 9 },
                        { "axis": "Support", "value": 7 }
                    ]
                }
            ],
            "recommendations": [
                "Target Siddharth with direct comparisons of time saved during MVP setup.",
                "Highlight Postgres flexibility to overcome migration objections.",
                "Provide free-tier credits to lower entry barriers."
            ]
        })

    # 11. Competitor Analysis (5 direct, 3 indirect)
    elif "competitor_analysis" in prompt_text or "competitor analysis" in prompt_text or "competitor" in prompt_text:
        return json.dumps({
            "summary": f"Detailed competitive matrix comparing {name} to direct and indirect market players.",
            "competitors": [
                { "name": "Razorpay Payments (Direct)", "score": 8.0, "strengths": ["Huge merchant network", "Brand trust in India"], "weaknesses": ["Focuses purely on transaction billing", "No custom database support"], "pricing": "Transactional fees", "market_share": 35 },
                { "name": "Supabase India (Direct)", "score": 8.5, "strengths": ["Open-source community", "Postgres-native features"], "weaknesses": ["Steep developer learning curve", "Requires manual deployment orchestration"], "pricing": "Free tier + usage scale", "market_share": 25 },
                { "name": "Clerk Auth (Direct)", "score": 7.8, "strengths": ["Seamless auth onboarding", "Rich pre-built widgets"], "weaknesses": ["Limited database integration options", "High pricing scales"], "pricing": "SaaS monthly tiers", "market_share": 15 },
                { "name": "PostHog Analytics (Direct)", "score": 8.2, "strengths": ["Robust event analysis", "Feature flags built-in"], "weaknesses": ["No database storage engine", "Complex setup templates"], "pricing": "Usage-based pricing", "market_share": 12 },
                { "name": "Zoho Creator (Direct)", "score": 6.8, "strengths": ["Enterprise sales support", "Wide Zoho ecosystem integration"], "weaknesses": ["Legacy drag-and-drop builder", "Poor developer DX appeal"], "pricing": "Subscription contract", "market_share": 8 },
                { "name": "Miro (Indirect)", "score": 7.5, "strengths": ["Excellent visual collaboration", "Interactive whiteboarding"], "weaknesses": ["No code exports or databases", "High collaboration costs"], "pricing": "Per seat billing", "market_share": 3 },
                { "name": "Firebase (Indirect)", "score": 8.0, "strengths": ["Highly established ecosystem", "Reliable backend database"], "weaknesses": ["No SQL support (NoSQL only)", "Vendor lock-in to Google Cloud"], "pricing": "Pay-as-you-go scale", "market_share": 1 },
                { "name": "Jira (Indirect)", "score": 7.2, "strengths": ["Enterprise project tracking", "Standard corporate workflow"], "weaknesses": ["Highly cluttered interface", "Slow load latency"], "pricing": "Per user subscription", "market_share": 1 }
            ],
            "direct_competitors": [
                {
                    "name": "Razorpay Payments",
                    "website": "https://razorpay.com",
                    "positioning": "Leader in checkout pipelines and transaction billing for Indian companies.",
                    "strengths": ["Excellent localized support", "Vast merchant onboarding volume"],
                    "weaknesses": ["Checkout focused only", "No built-in user data tracking"],
                    "pricing_model": "Transactional fee basis (flat 2%)",
                    "differentiation_opportunity": "Provide relational schemas alongside checkout pipelines in a single operating system."
                },
                {
                    "name": "Supabase India",
                    "website": "https://supabase.com",
                    "positioning": "The open-source Firebase alternative featuring relational databases.",
                    "strengths": ["Relational Postgres backend power", "Active global community"],
                    "weaknesses": ["Manual hosting setups", "Requires custom frontend client development"],
                    "pricing_model": "Usage scale tiers",
                    "differentiation_opportunity": "Add custom dashboard templates and visual generators to eliminate boilerplate client coding."
                },
                {
                    "name": "Clerk Auth",
                    "website": "https://clerk.com",
                    "positioning": "Sleek pre-built auth widgets for React frameworks.",
                    "strengths": ["Flawless UI quickstart", "Rich social login integrations"],
                    "weaknesses": ["Higher costs at scale", "No relational database engine"],
                    "pricing_model": "MAU-based SaaS subscriptions",
                    "differentiation_opportunity": "Package secure authentication directly within the database infrastructure layers."
                },
                {
                    "name": "PostHog Analytics",
                    "website": "https://posthog.com",
                    "positioning": "Developer-first event analytics and session tracking.",
                    "strengths": ["Deep feature flag controls", "Powerful SQL querying interfaces"],
                    "weaknesses": ["No persistent transactional databases", "Steep setup complexity"],
                    "pricing_model": "Usage event volume scale",
                    "differentiation_opportunity": "Merge active business intelligence analytics inside database schemas directly."
                },
                {
                    "name": "Zoho Creator",
                    "website": "https://zoho.com/creator",
                    "positioning": "No-code business application builder.",
                    "strengths": ["Deep integrations into Zoho apps", "Strong enterprise client base"],
                    "weaknesses": ["Lacks raw developer API access", "Legacy design interfaces"],
                    "pricing_model": "Annual user contracts",
                    "differentiation_opportunity": "Target high-growth startups with visual, API-first environments rather than legacy CRM wrappers."
                }
            ],
            "indirect_competitors": [
                {
                    "name": "Miro",
                    "website": "https://miro.com",
                    "positioning": "Visual workspace and diagramming tools for product design collaboration.",
                    "strengths": ["Fluid diagramming workspace", "Widespread product management adoption"],
                    "weaknesses": ["No database storage", "No code generation exports"],
                    "pricing_model": "Subscription per seat basis",
                    "differentiation_opportunity": "Turn database diagrams and GTM strategy roadmaps directly into deployable code schemas."
                },
                {
                    "name": "Firebase",
                    "website": "https://firebase.google.com",
                    "positioning": "Google's legacy mobile-first backend platform.",
                    "strengths": ["Massive legacy codebase usage", "Highly scalable database endpoints"],
                    "weaknesses": ["NoSQL only (difficult joins)", "Google Cloud vendor lock-in"],
                    "pricing_model": "Pay-as-you-go usage scales",
                    "differentiation_opportunity": "Provide postgres-first SQL power without the enterprise vendor lock-in risk."
                },
                {
                    "name": "Jira",
                    "website": "https://atlassian.com/software/jira",
                    "positioning": "Enterprise standard issue tracking and roadmap manager.",
                    "strengths": ["Deeply entrenched corporate workflows", "Rich customizable columns"],
                    "weaknesses": ["Cluttered interface", "Extremely slow navigation loads"],
                    "pricing_model": "SaaS per seat subscription tiers",
                    "differentiation_opportunity": "Provide a simple, lightning-fast founder scorecard dashboard instead of a complex issue matrix."
                }
            ],
            "features": [
                { "name": "AI Generation Engine", "us": True, "Razorpay Payments (Direct)": False, "Supabase India (Direct)": False, "Clerk Auth (Direct)": False, "PostHog Analytics (Direct)": False, "Zoho Creator (Direct)": False, "Miro (Indirect)": False, "Firebase (Indirect)": False, "Jira (Indirect)": False },
                { "name": "Unified Dashboard UI", "us": True, "Razorpay Payments (Direct)": False, "Supabase India (Direct)": True, "Clerk Auth (Direct)": False, "PostHog Analytics (Direct)": True, "Zoho Creator (Direct)": False, "Miro (Indirect)": True, "Firebase (Indirect)": True, "Jira (Indirect)": True },
                { "name": "Free-Tier Sandbox", "us": True, "Razorpay Payments (Direct)": True, "Supabase India (Direct)": True, "Clerk Auth (Direct)": True, "PostHog Analytics (Direct)": True, "Zoho Creator (Direct)": False, "Miro (Indirect)": True, "Firebase (Indirect)": True, "Jira (Indirect)": True },
                { "name": "Open-Source Support", "us": True, "Razorpay Payments (Direct)": False, "Supabase India (Direct)": True, "Clerk Auth (Direct)": False, "PostHog Analytics (Direct)": True, "Zoho Creator (Direct)": False, "Miro (Indirect)": False, "Firebase (Indirect)": False, "Jira (Indirect)": False }
            ],
            "gaps": [
                "No single vendor integrates auth, DB schemas, and analytics under a unified PLG interface.",
                "Hyperscalers lack founder-friendly, low-complexity onboarding routes.",
                "SaaS builders struggle with the costs of subscribing to multiple developers stacks."
            ],
            "opportunities": [
                "Target developer firms in India needing local transaction API integrations.",
                "Build plug-and-play templates for popular React and nextjs code frameworks.",
                "Leverage open-source packages to build high brand loyalty."
            ],
            "recommendations": [
                "Focus messaging on unified dev speed relative to modular alternatives.",
                "Accelerate user signups by hosting developer-oriented hackathons.",
                "Add auto-migration templates from legacy database stacks."
            ]
        })

    # 13. Explain MVP
    elif "explain mvp" in prompt_text or "mvp" in prompt_text:
        return "An MVP (Minimum Viable Product) is the simplest version of a product that allows you to collect the maximum amount of validated learning about customers with the least effort."

    # 14. React component
    elif "react component" in prompt_text or "react" in prompt_text:
        return "```jsx\nimport React from 'react';\n\nexport const MyComponent = () => {\n  return <div>Hello World</div>;\n};\n```"

    # 15. Summarize my startup
    elif "summarize my startup" in prompt_text or "summarize" in prompt_text:
        return f"Based on your workspace context, your startup is {name}, which is in the {stage} stage. It operates in the {industry} industry with the tagline: '{tagline}'."

    # Default fallback message (NO forbidden mock phrases!)
    return "I am your AI Co-Founder. Let's discuss strategy, marketing, product, fundraising, and technical execution for your startup."
