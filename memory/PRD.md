# STUDLYF AI — PRD

## Vision
Premium AI Business Growth Platform: landing → authenticated workspace where every AI module returns a **visual dashboard** (charts, KPIs, score rings, radar, funnels, pitch-deck slides), never plain text.

## Architecture
- **Frontend**: React 19 + CRA + Tailwind + Framer Motion + shadcn/ui + lucide-react + react-icons + react-router-dom + **Recharts** (charts)
- **Backend**: FastAPI + Motor + modular routers (auth, workspace, newsletter)
- **AI**: Emergent LLM Key → Gemini 3 Flash → **structured JSON outputs** per schema
- **Email**: Resend (test mode for non-verified inboxes)
- **Auth**: Emergent-managed Google OAuth (httpOnly cookie + Bearer fallback)
- **MongoDB**: users, user_sessions, signups, newsletter, projects, generations

## What's Implemented

### Phase 1 — Landing
Sticky glass Navbar, Hero w/ animated dashboard mock, Trusted-by marquee, 12 Features bento, 6 Solutions cards, 9-step Workflow timeline, 10 AI Agents grid, Dashboard preview, animated Metrics, Testimonials, Pricing toggle, FAQ, Blog, Newsletter, Footer, floating Gemini AI chat widget, Signup dialog.

### Phase 2 — Auth + Workspace shell
Watch Demo modal (storyboard until MP4), Newsletter → MongoDB + Resend welcome email, Emergent Google OAuth (AuthCallback, ProtectedRoute, AuthProvider), demo project seeded on first login, workspace shell with sidebar.

### Phase 3 — Visual BI Dashboard ✨
- **Backend** every `/api/workspace/generate` now returns a structured `data` JSON object per kind-specific schema (see `/app/backend/schemas.py`). 502 with clear message on parse fail (retry-safe).
- **`GET /api/workspace/dashboard`** aggregates latest generations into scores (business_health, vc_score, marketing, brand, pitch, overall_ai), counts, and latest-by-kind.
- **Dashboard Home** at `/workspace`: gradient Overall AI Score card, 5 score-ring cards with sparklines, Recent AI outputs, Suggested-next playbook, ProjectPicker. Projects moved to `/workspace/projects`.
- **10 visual renderers** in `GenerationView.jsx`:
  - **SWOT** — score ring + 4-quadrant matrix with scored items + radar
  - **Business Model Canvas** — 9-cell visual grid + KPI cards
  - **GTM** — TAM/SAM/SOM KPIs + segments pie + funnel chart + messaging pillars
  - **Marketing Plan** — score ring + KPIs + channel pie + audience bar + score radar + 90-day timeline
  - **Brand Strategy** — score ring + personality radar wheel + color palette swatches + voice cards + tagline cards
  - **Customer Personas** — persona cards with channels pie + interests radar
  - **Competitor Analysis** — competitor bar + market share pie + feature comparison table
  - **1-Min Pitch** — sectioned timeline with timings
  - **Pitch Deck** — 14-slide thumbnail viewer + Prev/Next + full-screen Present mode + speaker notes + deck score
  - **VC Score** — score ring + INVEST/WATCH/PASS recommendation + dimension cards + radar + strengths/concerns/next-questions
- **Documents page** also uses GenerationView (no markdown anywhere).

## Backend Endpoints
- `GET /api/`, `POST /api/signup`, `POST /api/chat`
- `POST /api/auth/session`, `GET /api/auth/me`, `POST /api/auth/logout`
- `GET/POST/PATCH/DELETE /api/workspace/projects`, `/api/workspace/projects/{id}`
- `POST /api/workspace/generate` (structured JSON), `GET /api/workspace/generations`, `DELETE /api/workspace/generations/{id}`
- `GET /api/workspace/dashboard`
- `POST /api/newsletter`

## Verified
- iteration_1: 6/6 backend + 10/10 frontend (Phase 1)
- iteration_2: 19/19 backend + 100% frontend (Phase 2)
- iteration_3: 22/22 backend + 100% frontend (Phase 3 BI dashboard)

## Backlog
- P1: Real demo MP4 (set `REACT_APP_DEMO_VIDEO_URL`)
- P1: Verify a Resend sending domain to deliver to all subscribers
- P2: Real-time sparklines on Dashboard Home (currently synthetic Math.sin)
- P2: Real PPTX/Google Slides export of Pitch Deck (currently JSON)
- P2: Stripe checkout from Pricing
- P2: Team workspaces (invites/roles), i18n
