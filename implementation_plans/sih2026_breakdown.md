# SIH 2026 — Problem 26135: Longitudinal Skilling Outcomes Tracker
**Full Critical Breakdown & Implementation Plan**
*Org: Maharashtra State Innovation Society | Category: Software*

---

## 1. What Is Actually Being Asked

The government currently has **input-side data** (enrollments, attendance, certificates) but **no output-side data** (did the trainee get a job? earn more? stay employed?). They need a system that:

1. Creates a **persistent, consent-based digital identity** for each trainee that survives phone number changes and address moves.
2. **Links** training records ↔ placement records ↔ employment signals (even across different programs with different IDs).
3. **Automates follow-ups** at 1 month, 3 months, 6 months, 1 year post-training.
4. Captures **self-employment, apprenticeship, gig work** — not just formal jobs.
5. **Validates employer data** (don't just take trainees' word for it).
6. Provides **analytics dashboards** for policymakers at cohort / course / provider / district / demographic levels.
7. Identifies **skill gaps and non-placement reasons**.

---

## 2. Critical Problem Analysis — Where Systems Like This Fail

Before designing anything, understand *why* past efforts failed:

| Failure Mode | Real Root Cause | Design Counter-Measure |
|---|---|---|
| Trainee unreachable after training | Changed number, moved city | DigiLocker-linked Aadhaar identity; WhatsApp fallback |
| Self-reported employment unverifiable | No incentive for honesty | Employer-side verification portal + PF/ESIC signal cross-check |
| Multiple programs, different IDs | No unique trainee identifier | Token-based pseudonymous ID tied to Aadhaar hash (privacy-safe) |
| Follow-up fatigue / low response | Surveys too long, no benefit to trainee | 1-question pulse checks; reward with certificate/badge |
| Employer non-participation | Burden too high | Simple OTP-based employer verification, not a full portal |
| Gig/self-employment invisible | Only formal employment counted | Self-declaration + bank transaction signal (UPI) |
| Data silos across departments | Different ministries, different DBs | Federated data model + open API layer |
| Privacy concerns | Aadhaar-linked data leaks | Data stored as hashed pseudonyms; no raw Aadhaar stored |

---

## 3. System Architecture — What You Build

### Core Modules

```
┌──────────────────────────────────────────────────────────────────┐
│                     SKILL TRACKER PLATFORM                       │
│                                                                  │
│  ┌────────────┐  ┌──────────────┐  ┌──────────────────────────┐ │
│  │  Trainee   │  │   Training   │  │   Employer / Placement   │ │
│  │  Identity  │  │   Provider   │  │       Portal             │ │
│  │  Module    │  │   Portal     │  │                          │ │
│  └────────────┘  └──────────────┘  └──────────────────────────┘ │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │              Longitudinal Follow-Up Engine                  │ │
│  │   (Scheduled SMS/WhatsApp + IVR fallback + field agent)    │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌─────────────────────────┐  ┌─────────────────────────────┐  │
│  │   Signal Integration    │  │    Analytics & Policy       │  │
│  │   (EPFO, ESIC, UPI,    │  │    Dashboard                │  │
│  │    DigiLocker, NCS)     │  │                             │  │
│  └─────────────────────────┘  └─────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 4. Module-by-Module Breakdown

### Module 1 — Trainee Identity & Consent Management
**The most critical module. Everything else fails without this.**

- At enrollment, trainee gets a **Skill ID** = `SHA-256(Aadhaar + salt)` — a pseudonymous token.
- No raw Aadhaar stored anywhere. Ever.
- Trainee fills a **Digital Consent Form** (stored as signed PDF) agreeing to:
  - Follow-up contacts for 1 year
  - Employer verification requests
  - Anonymous data use for policy
- Trainee gets a **Progressive Web App (PWA)** profile page — no app install needed.
- Profile includes: training taken, certifications, placement status, skill badges.
- **Identity recovery**: if phone changes, trainee re-authenticates via OTP to their Aadhaar-linked DigiLocker email/phone.

### Module 2 — Training Provider Portal
- Training centers log: enrollment, attendance %, assessment scores, certification date.
- Auto-generates Skill ID for each trainee at enrollment.
- API connectors for existing LMS systems (if they have one).
- Bulk upload via CSV for low-tech centers.
- Provider accountability score visible to provider (gamification).

### Module 3 — Longitudinal Follow-Up Engine *(most innovative part)*
**This is what makes or breaks the system.**

Follow-up schedule post-training completion:
| Checkpoint | Method | Questions |
|---|---|---|
| T+30 days | WhatsApp/SMS | "Are you employed? Y/N" |
| T+90 days | WhatsApp/SMS + IVR | Job type, sector, salary range |
| T+180 days | WhatsApp + field agent for no-response | Retention, wage change, relevance of training |
| T+365 days | Full survey (web form) | Full livelihood assessment |

**Non-response fallback chain:**
1. WhatsApp (day 1)
2. SMS (day 3)
3. IVR phone call (day 7) — recorded voice survey in Marathi/Hindi
4. Field agent flag (day 14) — for human follow-up

**Incentive layer (critical for response rate):**
- Completing 30-day check-in → unlocks shareable digital certificate with QR
- Completing 90-day check-in → LinkedIn-style skill badge
- Completing 1-year → Priority referral for next government scheme

### Module 4 — Employer Verification Portal
**Lightweight by design — employers hate filling forms.**

- Employer receives an OTP-based verification request: *"Did [Trainee Name] join you on [Date]? Reply YES/NO."*
- Simple web form for additional details (designation, salary band, still employed).
- Bulk verification API for large employers (IT parks, factories).
- **Cross-validation**: PF registration number check via EPFO's public API to verify employer legitimacy.

### Module 5 — External Signal Integration
*This is what separates a great system from a mediocre one.*

| Signal Source | What It Tells You | Integration Method |
|---|---|---|
| **EPFO/ESIC** | Formal employment confirmation | Government API (available via NIC/Umang) |
| **NCS Portal** (National Career Service) | Job applications, placement events | API or data-sharing MOU |
| **DigiLocker** | Pull training certificates, mark sheets | DigiLocker Issuer/Requester API (free) |
| **UPI transaction patterns** | Proxy for self-employment income | Aggregated signal via bank APIs (opt-in) |
| **PM Vishwakarma / PMEGP** | Self-employment scheme enrollment | Cross-department data sharing |

> ⚠️ **Reality Check**: EPFO/NCS APIs require government MOU for production use. For the hackathon, simulate these with mock APIs and clearly label them as "integration-ready."

### Module 6 — Analytics & Policy Dashboard
For District Collectors, Department Officials, Programme Managers.

**Views available:**
- **Provider Scorecard**: placement rate, salary achieved, retention by course
- **Cohort Tracker**: follow a batch of 200 trainees over time
- **Skill Gap Heatmap**: which skills have high training but low placement?
- **Non-placement Reason Analysis**: NLP tags on open-text responses (job not in location, salary too low, personal reasons, skill mismatch)
- **Demographic Equity**: placement rates by gender, caste category, district
- **ROI Calculator**: government spend per successful placement + wage gain

---

## 5. Tech Stack — 100% Free & Open Source

### Backend
| Layer | Technology | Why |
|---|---|---|
| API Server | **FastAPI** (Python) | Fast, async, auto docs, free |
| Database | **PostgreSQL** | Robust, free, handles relational data perfectly |
| Caching | **Redis** | Fast lookups, session management, free |
| Task Queue | **Celery + Redis** | Scheduled follow-up jobs, async processing |
| ORM | **SQLAlchemy** | Pythonic, battle-tested |
| Auth | **JWT + bcrypt** | Stateless auth, free |
| File Storage | **MinIO** (S3-compatible) | Self-hosted object store, free |

### Frontend
| Layer | Technology | Why |
|---|---|---|
| Web App | **Next.js 14** (React) | SSR, PWA support, free |
| UI Library | **shadcn/ui + Tailwind CSS** | Beautiful, accessible, free |
| Charts | **Recharts / Apache ECharts** | Powerful analytics charts, free |
| Maps | **Leaflet.js + OpenStreetMap** | District heatmaps, free |
| State | **Zustand** | Lightweight, free |
| Forms | **React Hook Form + Zod** | Validation, free |

### Mobile (Trainee PWA)
- **Next.js PWA** — installable on Android without Play Store, works offline
- **Service Workers** — for offline form caching (field areas with poor connectivity)

### Messaging / Follow-up
| Channel | Tool | Cost |
|---|---|---|
| WhatsApp | **WhatsApp Cloud API** (Meta) | Free tier: 1000 conv/month |
| SMS | **Twilio Free Tier** OR mock it | Free tier exists |
| IVR | **Twilio Voice** OR **Asterisk** (self-hosted) | Asterisk is free |
| Email | **Resend** (free tier) | 3000 emails/month free |

### NLP for Gap Analysis
| Task | Tool | Why |
|---|---|---|
| Survey response tagging | **spaCy** (Python) | Free, runs locally |
| Skill gap extraction | **HuggingFace transformers** (free models) | No API cost |
| Report generation | **WeasyPrint** / **ReportLab** | PDF generation, free |

### Infrastructure (for demo/deployment)
| Layer | Tool | Why |
|---|---|---|
| Containerization | **Docker + Docker Compose** | Free, reproducible |
| Reverse Proxy | **Nginx** | Free |
| Hosting | **Railway.app** / **Render.com** free tier | For demo |
| CI/CD | **GitHub Actions** | Free for public repos |
| Monitoring | **Grafana + Prometheus** | Free, open source |

---

## 6. Data Model (Simplified)

```
Trainee
  ├── skill_id (pseudonymous hash)
  ├── consent_record (signed, timestamped)
  ├── contact_info (encrypted)
  └── identity_recovery_token

Training Record
  ├── trainee_id → Trainee
  ├── provider_id → Provider
  ├── course_id → Course
  ├── enrollment_date
  ├── attendance_pct
  ├── assessment_score
  └── certification_date

Follow-up Touchpoint
  ├── trainee_id → Trainee
  ├── checkpoint (30d/90d/180d/365d)
  ├── channel (whatsapp/sms/ivr/field)
  ├── response_status (sent/delivered/responded/bounced)
  └── response_data (JSON)

Employment Outcome
  ├── trainee_id → Trainee
  ├── outcome_type (formal/self/gig/apprentice/unemployed)
  ├── employer_id → Employer (nullable)
  ├── salary_band
  ├── sector
  ├── start_date
  ├── verified_by (self/employer/epfo/field)
  └── retention_at_6m, retention_at_12m

Skill Gap Signal
  ├── course_id → Course
  ├── district
  ├── placement_rate
  ├── avg_time_to_placement
  ├── non_placement_reasons[] (NLP-tagged)
  └── employer_demand_score
```

---

## 7. Privacy & Ethical Design

This is **non-negotiable** for a government project. Judges will ask about this.

1. **No raw Aadhaar storage** — only hashed tokens
2. **Consent first** — no tracking without explicit, recorded consent
3. **Data minimisation** — only collect what's needed for each checkpoint
4. **Purpose limitation** — salary data used only for aggregated analytics, never individual exposure
5. **Right to erasure** — trainee can request deletion from the system
6. **Audit logs** — every data access logged with timestamp + accessor identity
7. **Role-based access** — field agent ≠ district officer ≠ secretary (strict RBAC)
8. **Encryption at rest** — AES-256 for PII fields in the database
9. **HTTPS only** — TLS everywhere
10. **Pseudonymisation** — analytics always work on Skill IDs, never names

---

## 8. What Makes This Win at SIH

### Differentiators vs a Basic CRUD App:

| Feature | Basic App | Your App |
|---|---|---|
| Identity | Phone number only | Pseudonymous Aadhaar hash + recovery |
| Follow-up | Manual reminder emails | Automated multi-channel cascade |
| Verification | Self-reported | Employer OTP + EPFO signal |
| Gig/Self-employment | Not captured | UPI proxy + self-declaration |
| Analytics | Basic counts | Cohort analysis, skill gap NLP, equity metrics |
| Privacy | GDPR checkbox | Full consent framework, data minimization |
| Offline support | None | PWA + service workers for field use |
| Scalability | Single DB | Redis caching, Celery queues, containerized |

### Judge Questions You Must Prepare For:
1. *"How do you handle trainees who change phones?"* → Identity recovery via DigiLocker
2. *"How do you verify employment?"* → Three-tier: self → employer OTP → EPFO signal
3. *"What about privacy/Aadhaar?"* → No raw Aadhaar, only hashed pseudonym + consent
4. *"How is this different from existing portals?"* → Longitudinal tracking + multi-signal verification + NLP gap analysis
5. *"Can it scale to Maharashtra's 50 lakh+ trainees?"* → Celery queues + Redis + PostgreSQL partitioning
6. *"What about rural trainees with no smartphone?"* → IVR in Marathi/Hindi + field agent escalation
7. *"What's the data sharing mechanism?"* → Open REST API + government MOU template provided

---

## 9. Realistic Build Plan for the Hackathon

### Phase 1 — Core (Days 1-2)
- [ ] Trainee registration + consent flow
- [ ] Skill ID generation (hash-based)
- [ ] Training provider portal (basic CRUD)
- [ ] PostgreSQL schema + FastAPI CRUD endpoints

### Phase 2 — Follow-up Engine (Days 2-3)
- [ ] Celery beat scheduler (cron-like jobs)
- [ ] WhatsApp Cloud API integration (free tier)
- [ ] SMS fallback (mock or Twilio free)
- [ ] Survey form (Next.js PWA, offline-capable)

### Phase 3 — Verification & Signals (Days 3-4)
- [ ] Employer OTP verification flow
- [ ] Mock EPFO/NCS API connector (with note: "integration-ready")
- [ ] Self-employment declaration form

### Phase 4 — Analytics (Days 4-5)
- [ ] Provider scorecard dashboard
- [ ] Cohort tracker (timeline view)
- [ ] Skill gap heatmap (district-level, Leaflet map)
- [ ] NLP tagging for non-placement reasons (spaCy)

### Phase 5 — Polish & Demo (Days 5-6)
- [ ] RBAC (trainee / provider / employer / officer / admin roles)
- [ ] Audit log viewer
- [ ] PDF report export
- [ ] Demo data seeded (realistic Maharashtra data)
- [ ] Docker Compose for 1-command deployment

---

## 10. Honest Weaknesses to Acknowledge (Shows Maturity)

A mature team acknowledges limitations. This earns judge respect.

1. **EPFO/NCS API access** requires a government MOU — demo will use mock APIs. Real deployment would require API access agreement.
2. **IVR in Marathi** requires a proper voice recording session — demo can use TTS (gTTS, free).
3. **UPI signal** as self-employment proxy is an approximation — needs RBI/bank partnership for production.
4. **Field agent app** is described but needs a separate mobile build for production — demo shows the concept.
5. **Consent validity** — legal enforceability of digital consent under Indian law (IT Act 2000) needs a legal review for production.

---

## 11. Suggested Team Roles

| Role | Responsibilities |
|---|---|
| Backend Lead | FastAPI + PostgreSQL + Celery |
| Frontend Lead | Next.js + Tailwind + Dashboard |
| DevOps / Infra | Docker, Nginx, deployment |
| Data / ML | spaCy NLP, analytics queries, mock data |
| UI/UX + Presenter | Figma prototype, pitch narrative, judge prep |

---

## 12. One-Line Pitch

> *"SkillTrace — a privacy-first, longitudinal outcomes tracker that transforms Maharashtra's skilling system from counting certificates to measuring lives changed."*

