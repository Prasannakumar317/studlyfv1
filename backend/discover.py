"""Discover endpoints — curated Indian startups, incubators, VC firms, and news.
No API keys required. Caches in-memory for 1 hour.
"""
import os
import time
import json
import logging
import re
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, Query
from startup_data import get_or_generate_profile

logger = logging.getLogger(__name__)

# 1 hour cache
CACHE_TTL = 60 * 60
_cache: dict = {}


def _get_cached(key: str):
    v = _cache.get(key)
    if not v:
        return None
    if time.time() - v["t"] > CACHE_TTL:
        return None
    return v["data"]


def _set_cached(key: str, data):
    _cache[key] = {"t": time.time(), "data": data}


# Curated Indian industry list
INDUSTRIES = [
    {"slug": "fintech",         "name": "Fintech"},
    {"slug": "ecommerce",       "name": "E-commerce"},
    {"slug": "edtech",          "name": "Edtech"},
    {"slug": "saas",            "name": "SaaS"},
    {"slug": "logistics",       "name": "Logistics"},
    {"slug": "healthcare",      "name": "HealthTech"},
    {"slug": "consumer",        "name": "FoodTech & Consumer"},
    {"slug": "mobility",        "name": "Mobility"},
    {"slug": "ai-ml",           "name": "AI Startups"},
    {"slug": "enterprise",      "name": "Enterprise SaaS"},
    {"slug": "cybersecurity",   "name": "Cyber Security"},
    {"slug": "dev-tools",       "name": "Developer Tools"},
    {"slug": "agritech",        "name": "Agritech"},
    {"slug": "climatetech",     "name": "Climate Tech"},
    {"slug": "biotech",         "name": "Biotech"},
    {"slug": "deeptech",        "name": "Deep Tech"},
]

# Curated Indian Incubators / Accelerators
INCUBATORS = [
    {"name": "Startup India Hub", "domain": "startupindia.gov.in", "description": "Government of India's flagship initiative to support and foster startup growth.", "industry": "Government Hub", "location": "New Delhi, India", "founded_year": 2016},
    {"name": "CIIE.CO (IIM Ahmedabad)", "domain": "ciie.co", "description": "The Innovation Continuum at IIM Ahmedabad, backing fearless entrepreneurs.", "industry": "Academic Incubator", "location": "Ahmedabad, India", "founded_year": 2002},
    {"name": "IIT Madras Incubation Cell", "domain": "incubation.iitm.ac.in", "description": "India's leading deep-tech incubator at IIT Madras.", "industry": "Deep-Tech Incubator", "location": "Chennai, India", "founded_year": 2013},
    {"name": "T-Hub Hyderabad", "domain": "t-hub.co", "description": "World's largest technology startup incubator and ecosystem enabler.", "industry": "Tech Incubator", "location": "Hyderabad, India", "founded_year": 2015},
    {"name": "Indian Angel Network", "domain": "indianangelnetwork.com", "description": "India's first and largest angel investor group backing early-stage startups.", "industry": "Angel Network", "location": "New Delhi, India", "founded_year": 2006},
    {"name": "NSRCEL (IIM Bangalore)", "domain": "nsrcel.org", "description": "Incubator at IIM Bangalore fostering entrepreneurial ideas.", "industry": "Academic Incubator", "location": "Bengaluru, India", "founded_year": 2000}
]

# Curated Indian VC Firms
VC_FIRMS = [
    {"name": "Peak XV Partners", "domain": "peakxv.com", "description": "Leading venture capital firm (formerly Sequoia India & SEA) backing exceptional founders.", "industry": "Venture Capital", "location": "Bengaluru, India", "founded_year": 2006},
    {"name": "Blume Ventures", "domain": "blume.vc", "description": "Early-stage tech-focused venture capital firm backing ambitious startups.", "industry": "Venture Capital", "location": "Mumbai, India", "founded_year": 2010},
    {"name": "Elevation Capital", "domain": "elevationcapital.com", "description": "Early-stage VC backing consumer, SaaS, and fintech founders.", "industry": "Venture Capital", "location": "Gurugram, India", "founded_year": 2002},
    {"name": "Matrix Partners India", "domain": "matrixpartners.in", "description": "Early-stage VC backing consumer, enterprise and fintech startups.", "industry": "Venture Capital", "location": "Bengaluru, India", "founded_year": 2006},
    {"name": "Kalaari Capital", "domain": "kalaari.com", "description": "Early-stage technology-focused venture capital firm.", "industry": "Venture Capital", "location": "Bengaluru, India", "founded_year": 2006},
    {"name": "Accel India", "domain": "accel.com", "description": "Partnering with exceptional founders from inception to growth.", "industry": "Venture Capital", "location": "Bengaluru, India", "founded_year": 2008},
    {"name": "Nexus Venture Partners", "domain": "nexusvp.com", "description": "Pioneering product-first venture capital investing in India and US.", "industry": "Venture Capital", "location": "Mumbai, India", "founded_year": 2006},
    {"name": "Chiratae Ventures", "domain": "chiratae.com", "description": "Leading tech-focused venture capital firm in India.", "industry": "Venture Capital", "location": "Bengaluru, India", "founded_year": 2006}
]

# Curated Indian Startups (ONLY India-based / founded)
CURATED_STARTUPS = [
    # Fintech
    {
        "name": "Razorpay",
        "domain": "razorpay.com",
        "industry": "Fintech",
        "location": "Bengaluru, India",
        "description": "Leading payments solution for Indian businesses to accept, process and disburse payments.",
        "founded_year": 2014,
        "stage": "Series G (Unicorn)",
        "funding": "$800M",
        "tags": ["Fintech", "Unicorn", "Trending", "Fast Growing"]
    },
    {
        "name": "CRED",
        "domain": "cred.club",
        "industry": "Fintech",
        "location": "Bengaluru, India",
        "description": "Premium members-only platform rewarding credit card bill payments with exclusive perks.",
        "founded_year": 2018,
        "stage": "Series F (Unicorn)",
        "funding": "$800M",
        "tags": ["Fintech", "Unicorn", "Fast Growing", "Trending"]
    },
    {
        "name": "Zerodha",
        "domain": "zerodha.com",
        "industry": "Fintech",
        "location": "Bengaluru, India",
        "description": "India's largest stock broker by active clients, offering low-cost brokerage and investment platforms.",
        "founded_year": 2010,
        "stage": "Bootstrapped (Unicorn)",
        "funding": "N/A",
        "tags": ["Fintech", "Unicorn", "Trending"]
    },
    {
        "name": "Groww",
        "domain": "groww.in",
        "industry": "Fintech",
        "location": "Bengaluru, India",
        "description": "User-friendly investment platform offering direct mutual funds, stocks, ETFs, and wealth management.",
        "founded_year": 2016,
        "stage": "Series E (Unicorn)",
        "funding": "$390M",
        "tags": ["Fintech", "Unicorn", "Fast Growing"]
    },
    {
        "name": "PhonePe",
        "domain": "phonepe.com",
        "industry": "Fintech",
        "location": "Bengaluru, India",
        "description": "Leading UPI and digital payments platform offering recharges, utility bills, and insurance.",
        "founded_year": 2015,
        "stage": "Late Stage (Unicorn)",
        "funding": "$1.2B",
        "tags": ["Fintech", "Unicorn", "Trending"]
    },
    {
        "name": "BharatPe",
        "domain": "bharatpe.com",
        "industry": "Fintech",
        "location": "New Delhi, India",
        "description": "Empowers small merchants with unified QR codes, merchant loans, and digital ledger solutions.",
        "founded_year": 2018,
        "stage": "Series E (Unicorn)",
        "funding": "$650M",
        "tags": ["Fintech", "Unicorn", "Recently Funded"]
    },

    # E-commerce
    {
        "name": "Flipkart",
        "domain": "flipkart.com",
        "industry": "E-commerce",
        "location": "Bengaluru, India",
        "description": "India's premier e-commerce marketplace offering mobile phones, electronics, fashion, and home goods.",
        "founded_year": 2007,
        "stage": "Acquired (Walmart)",
        "funding": "$3.6B",
        "tags": ["E-commerce", "Unicorn", "Trending"]
    },
    {
        "name": "Meesho",
        "domain": "meesho.com",
        "industry": "E-commerce",
        "location": "Bengaluru, India",
        "description": "Social commerce platform enabling small businesses and individuals to resell fashion and lifestyle items.",
        "founded_year": 2015,
        "stage": "Series F (Unicorn)",
        "funding": "$1.1B",
        "tags": ["E-commerce", "Unicorn", "Recently Funded"]
    },
    {
        "name": "Myntra",
        "domain": "myntra.com",
        "industry": "E-commerce",
        "location": "Bengaluru, India",
        "description": "India's leading fashion, footwear, accessories, and lifestyle e-commerce portal.",
        "founded_year": 2007,
        "stage": "Acquired (Flipkart)",
        "funding": "$340M",
        "tags": ["E-commerce", "Unicorn"]
    },
    {
        "name": "Snapdeal",
        "domain": "snapdeal.com",
        "industry": "E-commerce",
        "location": "New Delhi, India",
        "description": "Value-focused e-commerce marketplace offering quality daily essentials and merchandise at scale.",
        "founded_year": 2010,
        "stage": "Late Stage",
        "funding": "$1.8B",
        "tags": ["E-commerce"]
    },

    # EdTech
    {
        "name": "Physics Wallah",
        "domain": "pw.live",
        "industry": "Edtech",
        "location": "Noida, India",
        "description": "Affordable online learning platform offering top-tier test preparation for JEE, NEET, and board exams.",
        "founded_year": 2016,
        "stage": "Series A (Unicorn)",
        "funding": "$100M",
        "tags": ["Edtech", "Unicorn", "Fast Growing", "Recently Funded"]
    },
    {
        "name": "Unacademy",
        "domain": "unacademy.com",
        "industry": "Edtech",
        "location": "Bengaluru, India",
        "description": "Educational platform providing live classes, test prep, and structured courses with expert educators.",
        "founded_year": 2015,
        "stage": "Series H (Unicorn)",
        "funding": "$800M",
        "tags": ["Edtech", "Unicorn"]
    },
    {
        "name": "Vedantu",
        "domain": "vedantu.com",
        "industry": "Edtech",
        "location": "Bengaluru, India",
        "description": "Live interactive online tutoring platform providing learning solutions for K-12 students.",
        "founded_year": 2011,
        "stage": "Series E (Unicorn)",
        "funding": "$300M",
        "tags": ["Edtech", "Unicorn"]
    },

    # SaaS
    {
        "name": "Freshworks",
        "domain": "freshworks.com",
        "industry": "SaaS",
        "location": "Chennai, India",
        "description": "Cloud-based customer support software, IT service desk management, and CRM solution suite.",
        "founded_year": 2010,
        "stage": "IPO (NASDAQ: FRSH)",
        "funding": "$480M",
        "tags": ["SaaS", "Unicorn", "Trending"]
    },
    {
        "name": "Zoho",
        "domain": "zoho.com",
        "industry": "SaaS",
        "location": "Chennai, India",
        "description": "Comprehensive suite of online business, productivity, collaboration, and enterprise software tools.",
        "founded_year": 1996,
        "stage": "Bootstrapped",
        "funding": "N/A",
        "tags": ["SaaS", "Trending"]
    },
    {
        "name": "Postman",
        "domain": "postman.com",
        "industry": "SaaS",
        "location": "Bengaluru, India",
        "description": "Leading collaboration platform for building, mocking, testing, and managing APIs worldwide.",
        "founded_year": 2014,
        "stage": "Series D (Unicorn)",
        "funding": "$430M",
        "tags": ["SaaS", "Unicorn", "Fast Growing"]
    },
    {
        "name": "Chargebee",
        "domain": "chargebee.com",
        "industry": "SaaS",
        "location": "Chennai, India",
        "description": "Subscription billing and revenue operations engine facilitating scale for global SaaS businesses.",
        "founded_year": 2011,
        "stage": "Series H (Unicorn)",
        "funding": "$470M",
        "tags": ["SaaS", "Unicorn"]
    },
    {
        "name": "BrowserStack",
        "domain": "browserstack.com",
        "industry": "SaaS",
        "location": "Mumbai, India",
        "description": "Cloud-based testing platform allowing developers to test web and mobile apps on real devices.",
        "founded_year": 2011,
        "stage": "Series B (Unicorn)",
        "funding": "$200M",
        "tags": ["SaaS", "Unicorn"]
    },

    # Logistics
    {
        "name": "Delhivery",
        "domain": "delhivery.com",
        "industry": "Logistics",
        "location": "Gurugram, India",
        "description": "Leading supply chain and logistics services provider offering shipping, sorting, and freight handling.",
        "founded_year": 2011,
        "stage": "IPO (NSE: DELHIVERY)",
        "funding": "$1.4B",
        "tags": ["Logistics", "Unicorn"]
    },
    {
        "name": "Porter",
        "domain": "porter.in",
        "industry": "Logistics",
        "location": "Bengaluru, India",
        "description": "On-demand intra-city mini truck booking and logistics solutions platform for business parcels.",
        "founded_year": 2014,
        "stage": "Series E (Unicorn)",
        "funding": "$150M",
        "tags": ["Logistics", "Unicorn", "Recently Funded"]
    },

    # HealthTech
    {
        "name": "Practo",
        "domain": "practo.com",
        "industry": "Healthcare",
        "location": "Bengaluru, India",
        "description": "Leading digital healthcare service offering remote consultations, online bookings, and medical histories.",
        "founded_year": 2008,
        "stage": "Series D",
        "funding": "$230M",
        "tags": ["Healthcare"]
    },
    {
        "name": "PharmEasy",
        "domain": "pharmeasy.in",
        "industry": "Healthcare",
        "location": "Mumbai, India",
        "description": "Digital platform enabling online medicine purchases, diagnostic test bookings, and healthcare delivery.",
        "founded_year": 2015,
        "stage": "Late Stage (Unicorn)",
        "funding": "$1.2B",
        "tags": ["Healthcare", "Unicorn"]
    },
    {
        "name": "1mg",
        "domain": "1mg.com",
        "industry": "Healthcare",
        "location": "Gurugram, India",
        "description": "Online pharmacy, generic medicine reference guide, and diagnostics test provider (Tata Group).",
        "founded_year": 2015,
        "stage": "Acquired (Tata Group)",
        "funding": "$230M",
        "tags": ["Healthcare", "Unicorn"]
    },

    # FoodTech & Consumer
    {
        "name": "Swiggy",
        "domain": "swiggy.com",
        "industry": "Consumer",
        "location": "Bengaluru, India",
        "description": "Hyperlocal on-demand food delivery and instant grocery convenience portal.",
        "founded_year": 2014,
        "stage": "IPO (NSE: SWIGGY)",
        "funding": "$1.5B",
        "tags": ["Consumer", "Unicorn", "Trending"]
    },
    {
        "name": "Zomato",
        "domain": "zomato.com",
        "industry": "Consumer",
        "location": "Gurugram, India",
        "description": "Restaurant directory guide, food ordering platform, and hyper-local delivery service provider.",
        "founded_year": 2008,
        "stage": "IPO (NSE: ZOMATO)",
        "funding": "$2.1B",
        "tags": ["Consumer", "Unicorn", "Trending"]
    },

    # Mobility
    {
        "name": "Ola",
        "domain": "olacabs.com",
        "industry": "Consumer",
        "location": "Bengaluru, India",
        "description": "Cab booking aggregator, ride-hailing services, and electric vehicle fleet network operations.",
        "founded_year": 2010,
        "stage": "Late Stage (Unicorn)",
        "funding": "$3.8B",
        "tags": ["Consumer", "Unicorn", "Fast Growing"]
    },

    # AI Startups
    {
        "name": "Sarvam AI",
        "domain": "sarvam.ai",
        "industry": "AI/ML",
        "location": "Bengaluru, India",
        "description": "AI research lab developing customizable LLMs and localized conversational agents for Indian languages.",
        "founded_year": 2023,
        "stage": "Series A",
        "funding": "$41M",
        "tags": ["AI/ML", "Recently Funded", "AI Startups"]
    },
    {
        "name": "Krutrim",
        "domain": "olakrutrim.com",
        "industry": "AI/ML",
        "location": "Bengaluru, India",
        "description": "India's own AI system trained on Indian languages and cultural context for general assistant queries.",
        "founded_year": 2023,
        "stage": "Series A (Unicorn)",
        "funding": "$50M",
        "tags": ["AI/ML", "Unicorn", "Recently Funded", "AI Startups"]
    },
    {
        "name": "Yellow.ai",
        "domain": "yellow.ai",
        "industry": "AI/ML",
        "location": "Bengaluru, India",
        "description": "Conversational customer experience platform powered by generative AI support agents.",
        "founded_year": 2016,
        "stage": "Series C",
        "funding": "$102M",
        "tags": ["AI/ML", "AI Startups", "Fast Growing"]
    },

    # Enterprise
    {
        "name": "Darwinbox",
        "domain": "darwinbox.com",
        "industry": "Enterprise",
        "location": "Hyderabad, India",
        "description": "Cloud-based human capital management (HCM) tool optimizing HR workflows for enterprise firms.",
        "founded_year": 2015,
        "stage": "Series D (Unicorn)",
        "funding": "$110M",
        "tags": ["Enterprise", "Unicorn"]
    },
    # Quick Commerce & Consumer & Mobility
    {
        "name": "Zepto",
        "domain": "zeptonow.com",
        "industry": "E-commerce",
        "location": "Mumbai, India",
        "description": "India's fastest-growing quick-commerce platform delivering groceries in under 10 minutes.",
        "founded_year": 2021,
        "stage": "Series F (Unicorn)",
        "funding": "$560M",
        "tags": ["E-commerce", "Unicorn", "Fast Growing"]
    },
    {
        "name": "boAt",
        "domain": "boat-lifestyle.com",
        "industry": "Consumer",
        "location": "Delhi, India",
        "description": "India's leading consumer electronics brand specializing in premium audio wearables and smartwatches.",
        "founded_year": 2016,
        "stage": "Series C",
        "funding": "$177M",
        "tags": ["Consumer", "Trending", "Fast Growing"]
    },
    {
        "name": "Ather Energy",
        "domain": "atherenergy.com",
        "industry": "Mobility",
        "location": "Bengaluru, India",
        "description": "Designing and manufacturing premium smart electric scooters and expanding public fast-charging grids.",
        "founded_year": 2013,
        "stage": "Late Stage (Unicorn)",
        "funding": "$450M",
        "tags": ["Mobility", "Unicorn", "Fast Growing"]
    },
    {
        "name": "Apna",
        "domain": "apna.co",
        "industry": "SaaS",
        "location": "Bengaluru, India",
        "description": "Professional networking and jobs platform for India's rising blue and grey collar workforce.",
        "founded_year": 2019,
        "stage": "Series C (Unicorn)",
        "funding": "$190M",
        "tags": ["SaaS", "Unicorn", "Trending"]
    },
    {
        "name": "Slice",
        "domain": "sliceit.com",
        "industry": "Fintech",
        "location": "Bengaluru, India",
        "description": "Consumer fintech startup building a smart financial network for India's youth.",
        "founded_year": 2016,
        "stage": "Series C (Unicorn)",
        "funding": "$340M",
        "tags": ["Fintech", "Unicorn", "Fast Growing"]
    },
    {
        "name": "Jar",
        "domain": "myjar.app",
        "industry": "Fintech",
        "location": "Bengaluru, India",
        "description": "Fintech app helping Indian consumers build a daily gold savings habit from spare change.",
        "founded_year": 2021,
        "stage": "Series B",
        "funding": "$58M",
        "tags": ["Fintech", "Recently Funded"]
    }
]

# Curated Indian Startup News
CURATED_NEWS = [
    {
        "title": "Krutrim AI secures $50M from Matrix Partners, becoming India's fastest AI unicorn",
        "url": "https://yourstory.com/2024/01/ola-krutrim-ai-unicorn-funding-matrix-partners",
        "source": "YourStory",
        "time": datetime.now(timezone.utc).isoformat(),
        "funding": "$50M",
        "startup": "Krutrim",
        "score": 120
    },
    {
        "title": "Sarvam AI raises $41M Series A led by Lightspeed to build LLM for Indian languages",
        "url": "https://techcrunch.com/2023/12/07/sarvam-ai-raises-41m-from-lightspeed-to-build-generative-ai-for-india/",
        "source": "TechCrunch India",
        "time": datetime.now(timezone.utc).isoformat(),
        "funding": "$41M",
        "startup": "Sarvam AI",
        "score": 95
    },
    {
        "title": "Meesho valuation hits $5B as Softbank and others look to double down on social commerce",
        "url": "https://inc42.com/features/meesho-valuation-rises-to-5b-with-secondary-share-sale/",
        "source": "Inc42",
        "time": datetime.now(timezone.utc).isoformat(),
        "funding": None,
        "startup": "Meesho",
        "score": 110
    },
    {
        "title": "Razorpay rolls out corporate cards and instant payout rails for SaaS founders",
        "url": "https://entrackr.com/2024/02/razorpay-payouts-and-corporate-banking-expansion/",
        "source": "Entrackr",
        "time": datetime.now(timezone.utc).isoformat(),
        "funding": None,
        "startup": "Razorpay",
        "score": 85
    },
    {
        "title": "Delhivery announces fully automated sorting center in Mumbai to boost e-commerce delivery",
        "url": "https://economictimes.indiatimes.com/tech/startups/delhivery-unveils-mumbai-mega-hub/articleshow/107293112.cms",
        "source": "Economic Times",
        "time": datetime.now(timezone.utc).isoformat(),
        "funding": None,
        "startup": "Delhivery",
        "score": 75
    },
    {
        "title": "Physics Wallah plans to invest Rs 120 crore to open offline learning centers across South India",
        "url": "https://moneycontrol.com/news/business/startup/physicswallah-to-invest-rs-120-cr-in-south-expansion-12193839.html",
        "source": "Moneycontrol",
        "time": datetime.now(timezone.utc).isoformat(),
        "funding": "Rs 120 Cr",
        "startup": "Physics Wallah",
        "score": 105
    }
]


def _slugify(name: str) -> str:
    return "".join(c if c.isalnum() else "-" for c in name.lower()).strip("-")


def _enrich(item: dict) -> dict:
    """Normalize + add logo URL via Clearbit logo CDN (free, no key)."""
    name = item.get("name") or ""
    domain = item.get("domain") or item.get("website", "").replace("https://", "").replace("http://", "").split("/")[0]
    return {
        "slug": _slugify(name),
        "name": name,
        "description": item.get("description") or item.get("one_liner") or "",
        "industry": item.get("industry") or item.get("industries") or "",
        "location": item.get("location") or item.get("all_locations") or "India",
        "domain": domain or None,
        "logo": f"https://logo.clearbit.com/{domain}" if domain else None,
        "website": (item.get("website") or (f"https://{domain}" if domain else None)),
        "founded_year": item.get("founded_year"),
        "stage": item.get("stage"),
        "funding": item.get("funding"),
        "tags": item.get("tags", [])
    }


def _enrich_with_type(item: dict, t: str) -> dict:
    enriched = _enrich(item)
    enriched["type"] = t
    return enriched


async def _fetch_yc(industry: str | None = None, limit: int = 24):
    """Filter and fetch only from curated Indian startups database (replacing foreign YC hits)."""
    items = []
    for s in CURATED_STARTUPS:
        matches_ind = True
        if industry:
            matches_ind = (
                s["industry"].lower() == industry.lower() or
                industry.lower() in [tag.lower() for tag in s.get("tags", [])] or
                (industry.lower() == "ai" and s["industry"] == "AI/ML") or
                (industry.lower() == "ai-ml" and s["industry"] == "AI/ML")
            )
        if matches_ind:
            items.append(_enrich_with_type(s, "startup"))
    return items[:limit]


async def _fetch_startup_news(limit: int = 6):
    """Return only curated startup news related to India."""
    return CURATED_NEWS[:limit]


def build_discover_router():
    router = APIRouter(prefix="/api/discover", tags=["discover"])

    @router.get("/startups")
    async def trending(industry: str | None = None, limit: int = 24):
        items = await _fetch_yc(industry, limit=limit)
        return {"items": items, "industry": industry, "cached_for_seconds": CACHE_TTL}

    @router.get("/incubators")
    async def list_incubators(limit: int = 16):
        items = [_enrich_with_type(inc, "incubator") for inc in INCUBATORS[:limit]]
        return {"items": items, "cached_for_seconds": CACHE_TTL}

    @router.get("/vc-firms")
    async def list_vc_firms(limit: int = 16):
        items = [_enrich_with_type(vc, "vc") for vc in VC_FIRMS[:limit]]
        return {"items": items, "cached_for_seconds": CACHE_TTL}

    @router.get("/stories")
    async def stories(limit: int = 6):
        items = await _fetch_startup_news(limit=limit)
        return {"items": items, "source": "Indian Startup News", "cached_for_seconds": CACHE_TTL}

    @router.get("/industries")
    async def industries():
        return {"items": INDUSTRIES}

    @router.get("/search")
    async def search(q: str = Query(..., min_length=1), limit: int = 8):
        ql = q.lower()
        matches = []

        # Startups curated match
        for s in CURATED_STARTUPS:
            if (ql in s["name"].lower() or 
                ql in s["industry"].lower() or 
                ql in s.get("location", "").lower() or 
                ql in s.get("description", "").lower()):
                matches.append(_enrich_with_type(s, "startup"))

        # Incubators curated match
        for inc in INCUBATORS:
            if ql in inc["name"].lower() or ql in inc["description"].lower() or ql in inc["location"].lower():
                matches.append(_enrich_with_type(inc, "incubator"))

        # VC curated match
        for vc in VC_FIRMS:
            if ql in vc["name"].lower() or ql in vc["description"].lower() or ql in vc["location"].lower():
                matches.append(_enrich_with_type(vc, "vc"))

        # Industry match
        for ind in INDUSTRIES:
            if ql in ind["name"].lower() or ql in ind["slug"].lower():
                matches.append({
                    "type": "industry",
                    "slug": ind["slug"],
                    "name": ind["name"],
                    "description": f"Explore {ind['name']} startups",
                    "industry": ind["name"],
                    "location": "",
                    "logo": None,
                    "website": f"/discover?industry={ind['slug']}"
                })

        seen = set()
        merged = []
        for it in matches:
            key = (it["slug"], it.get("type", "startup"))
            if key not in seen:
                seen.add(key)
                merged.append(it)
                if len(merged) >= limit:
                    break

        return {"items": merged, "q": q}

    @router.get("/company/{slug}")
    async def company_detail(slug: str):
        # Check curated startups
        all_curated = [_enrich_with_type(s, "startup") for s in CURATED_STARTUPS]
        for c in all_curated:
            if c["slug"] == slug:
                # Retrieve the rich startup profile details and merge with base attributes
                rich_profile = await get_or_generate_profile(slug)
                if rich_profile:
                    c.update(rich_profile)
                return c

        # Check incubators
        all_inc = [_enrich_with_type(inc, "incubator") for inc in INCUBATORS]
        for c in all_inc:
            if c["slug"] == slug:
                return c

        # Check VC firms
        all_vcs = [_enrich_with_type(vc, "vc") for vc in VC_FIRMS]
        for c in all_vcs:
            if c["slug"] == slug:
                return c

        raise HTTPException(status_code=404, detail="Company not found")

    return router
