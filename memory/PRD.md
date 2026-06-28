# STUDLYF AI — PRD

## Original Problem Statement
Premium SaaS landing page + functional workspace for **STUDLYF AI** — "The Complete AI Business Growth Platform" — helping founders, students, agencies, incubators and investors transform ideas into businesses with AI strategy, marketing, branding and investor tools.

## Architecture
- **Frontend**: React 19 + CRA + TailwindCSS + Framer Motion + shadcn/ui + lucide-react + react-icons + react-markdown + react-router-dom
- **Backend**: FastAPI + Motor (MongoDB), modular routers (auth, workspace, newsletter)
- **AI**: Emergent LLM Key → Gemini 3 Flash via `emergentintegrations`
- **Email**: Resend (test mode — only verified inbox `24r01a67b6@cmrithyderabad.edu.in` actually receives mail)
- **Auth**: Emergent-managed Google OAuth (httpOnly cookie + Bearer fallback)
- **MongoDB collections**: `users`, `user_sessions`, `signups`, `newsletter`, `projects`, `generations`, `status_checks`

## User Personas
1. Founders / Startup teams
2. Students & Pre-Incubators
3. Incubators / Accelerators / Mentors
4. Agencies
5. Investors / VCs

## What's Implemented

### Phase 1 — Landing (2026-06-28)
- Sticky glass Navbar with Login + Get Started (Login routes to Workspace if authenticated)
- Hero with animated AI dashboard mock
- TrustedBy marquee, 12 Features bento, 6 Solutions cards
- 9-step animated Workflow timeline
- 10 AI Agents grid
- Interactive Dashboard preview, animated Metrics counters
- Testimonials carousel, Pricing (monthly/yearly), FAQ accordion
- Blog (3 cards), Newsletter, Footer
- Floating AI chat widget (Gemini 3 Flash via `/api/chat`)
- Signup dialog (Continue with Google + email capture)

### Phase 2 — Auth + Workspace + Modules (2026-06-28)
- **Watch Demo video modal** — animated Framer Motion storyboard (real MP4 swappable via `REACT_APP_DEMO_VIDEO_URL`)
- **Newsletter** persists to MongoDB + sends Resend welcome email (test mode caveat documented)
- **Emergent Google Auth**: `/auth/v1/env/oauth/session-data` exchange → httpOnly cookie + Bearer fallback; AuthCallback at URL fragment `#session_id=`, ProtectedRoute, AuthProvider context
- **Demo project auto-seeded** ("Lumen Labs") on first login
- **Workspace shell** at `/workspace` with sidebar: Projects · Strategy · Marketing · Funding · Documents · Analytics · Settings
- **Projects CRUD** with new-project dialog, switching via global ProjectsProvider + ProjectPicker dropdown
- **Generation modules** — 10 AI tools driven by Gemini 3 Flash, all saving to `db.generations`:
  - Strategy: SWOT, Business Model Canvas, GTM, Customer Personas, Competitor Analysis
  - Marketing: 1-Page Marketing Plan, Brand Strategy, Customer Personas
  - Funding: 1-Min Pitch, Pitch Deck (14 slides), VC Score
- **Output viewer**: Markdown render, Copy + Download .md + Delete
- **Documents** library page with search
- **Analytics** page with counters and per-tool usage bars
- **Settings** page with logout

## Backend Endpoints
- `GET /api/` health
- `POST /api/signup` email capture
- `POST /api/chat` Gemini chat
- `POST /api/auth/session`, `GET /api/auth/me`, `POST /api/auth/logout`
- `GET/POST/PATCH/DELETE /api/workspace/projects`
- `POST /api/workspace/generate`, `GET/DELETE /api/workspace/generations`
- `POST /api/newsletter`

## Verified
- iteration_1: 6/6 backend + 10/10 frontend (Phase 1)
- iteration_2: 19/19 backend + 100% critical frontend flows (Phase 2)

## Backlog
- P1: User uploads real demo MP4 → set `REACT_APP_DEMO_VIDEO_URL` in `frontend/.env`
- P1: Verify a domain in Resend so welcome emails reach all subscribers
- P2: Real PPTX/PDF export for Pitch Deck (currently markdown)
- P2: Team workspaces (invites, roles)
- P2: Pricing → Stripe checkout
- P2: Streaming chat widget (SSE endpoint already exists)
- P2: i18n
