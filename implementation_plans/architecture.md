# SkillTrace — Full Architecture & Pipeline

---

## Tech Stack (Final, Simple)

| Layer | Tool | Why Simple |
|---|---|---|
| **Frontend** | Next.js 14 (App Router) | One framework for all 3 portals |
| **Styling** | Tailwind CSS + shadcn/ui | Copy-paste components, looks professional |
| **Database** | Supabase (PostgreSQL) | No setup. Auth + DB + API in 5 min |
| **Follow-up Messaging** | Supabase Edge Functions + Twilio | Cron triggers → SMS, free tier |
| **NLP (Gap Analysis)** | Python script (spaCy) → Supabase | Run once, write results to DB |
| **Charts** | Recharts | Works directly in React, free |
| **Maps** | Leaflet.js + react-leaflet | District heatmap, free |
| **Hosting** | Vercel (Frontend) + Supabase (Backend) | Both free tier, deploy in minutes |

**No Docker. No Celery. No separate backend server. Everything is Supabase + Next.js.**

---

## System Architecture Diagram

```mermaid
graph TB
    subgraph Users["👥 User Groups"]
        T["📱 Trainee\n(Mobile PWA)"]
        TP["🏫 Training Provider\n(Web Portal)"]
        EM["🏢 Employer\n(Web Link / OTP)"]
        GO["🏛️ Govt Officer\n(Dashboard)"]
    end

    subgraph Frontend["⚛️ Next.js App — Vercel"]
        PW["Trainee PWA\n/trainee/*"]
        PP["Provider Portal\n/provider/*"]
        EP["Employer Verify\n/verify/*"]
        DA["Analytics Dashboard\n/dashboard/*"]
    end

    subgraph Supabase["🗄️ Supabase (Backend)"]
        AUTH["Auth\n(OTP / Magic Link)"]
        DB["PostgreSQL DB"]
        ST["Storage\n(Consent PDFs)"]
        EF["Edge Functions\n(Serverless)"]
        RT["Realtime\n(Live Dashboard)"]
    end

    subgraph ExternalSignals["🔗 External Signals (Mocked for Demo)"]
        TW["Twilio\n(SMS / IVR)"]
        DL["DigiLocker API\n(Identity Recovery)"]
        EPFO["EPFO / NCS\n(Employment Verification)"]
        WA["WhatsApp\nCloud API"]
    end

    subgraph FollowUpEngine["⏱️ Follow-up Engine"]
        CRON["Supabase\nScheduled Cron\n(pg_cron)"]
        SCHED["30d / 90d / 180d / 365d\nCheckpoints"]
    end

    T --> PW
    TP --> PP
    EM --> EP
    GO --> DA

    PW --> AUTH
    PP --> AUTH
    EP --> AUTH
    DA --> AUTH

    PW --> DB
    PP --> DB
    EP --> DB
    DA --> DB
    DA --> RT

    AUTH --> DB
    EF --> TW
    EF --> WA
    CRON --> SCHED
    SCHED --> EF
    EF --> DB

    DB -.->|"Integration-Ready"| EPFO
    DB -.->|"Integration-Ready"| DL

    style Supabase fill:#3ECF8E,color:#000
    style Frontend fill:#0070F3,color:#fff
    style FollowUpEngine fill:#FF6B35,color:#fff
    style ExternalSignals fill:#888,color:#fff
```

---

## Data Flow Pipeline (End-to-End)

```mermaid
flowchart TD
    A(["🎓 Trainee Enrolls\nat Training Center"]) --> B["Provider logs trainee\nin Provider Portal"]
    B --> C["System generates\nSkill ID\nSHA256 hash of Aadhaar+Salt"]
    C --> D["Consent form sent\nvia WhatsApp / SMS link"]
    D --> E{"Trainee\nsigns consent?"}
    E -->|No| F["Reminder sent\nafter 3 days\nMax 3 attempts"]
    E -->|Yes| G["Trainee profile\nactivated in DB"]
    F --> E

    G --> H["Training in Progress\nAttendance + Assessment\nlogged by Provider"]
    H --> I(["✅ Certification Date\nRecorded"])

    I --> J["pg_cron schedules\nfollow-up jobs"]

    J --> K["T+30 Days\nWhatsApp / SMS"]
    K --> L{"Response\nReceived?"}
    L -->|Yes| M["Record outcome:\nEmployed / Unemployed\nSelf-employed / Searching"]
    L -->|No| N["Escalate:\nSMS → IVR Call → Field Flag"]
    N --> L

    M --> O["T+90 Days\nSame cascade"]
    O --> P["T+180 Days\nDeeper survey\n(salary, retention, relevance)"]
    P --> Q["T+365 Days\nFull livelihood assessment"]

    Q --> R["Employment Outcome Record\nFinal in DB"]

    R --> S["Employer Verification\nOTP link sent to employer"]
    S --> T{"Employer\nconfirms?"}
    T -->|Yes| U["✅ Verified Badge\non Trainee Profile"]
    T -->|No| V["EPFO API Check\nMocked for Demo"]
    V --> U

    U --> W["NLP Engine\nspaCy tags non-placement\nreasons from survey text"]
    W --> X["Analytics Aggregation\nin PostgreSQL views"]
    X --> Y(["📊 Govt Dashboard\nProvider Scores\nDistrict Heatmaps\nSkill Gaps\nEquity Metrics"])

    style A fill:#4CAF50,color:#fff
    style I fill:#4CAF50,color:#fff
    style Y fill:#0070F3,color:#fff
    style U fill:#4CAF50,color:#fff
```

---

## UML Component Diagram

```mermaid
graph LR
    subgraph Client["Client Layer (Browser)"]
        C1["TraineePWA\nComponent"]
        C2["ProviderPortal\nComponent"]
        C3["EmployerVerify\nComponent"]
        C4["GovtDashboard\nComponent"]
    end

    subgraph NextJS["Next.js API Layer (Vercel)"]
        R1["/api/trainee\nGET POST PATCH"]
        R2["/api/provider\nGET POST"]
        R3["/api/verify\nPOST (OTP)"]
        R4["/api/analytics\nGET (Views)"]
        R5["/api/webhook\nTwilio callback"]
    end

    subgraph SupabaseDB["Supabase (Database Layer)"]
        T1[("trainees")]
        T2[("training_records")]
        T3[("followup_touchpoints")]
        T4[("employment_outcomes")]
        T5[("employers")]
        T6[("skill_gap_signals")]
        T7[("audit_logs")]
    end

    subgraph SupabaseFunc["Supabase (Function Layer)"]
        EF1["send-followup\nEdge Function"]
        EF2["verify-employer\nEdge Function"]
        EF3["generate-skillid\nEdge Function"]
        CR1["pg_cron\nScheduler"]
    end

    subgraph External["External Services"]
        EX1["Twilio\nSMS + IVR"]
        EX2["WhatsApp\nCloud API"]
        EX3["DigiLocker\nAPI (mocked)"]
        EX4["EPFO\nAPI (mocked)"]
    end

    C1 --> R1
    C2 --> R2
    C3 --> R3
    C4 --> R4
    EX1 --> R5

    R1 --> T1
    R1 --> T2
    R2 --> T2
    R2 --> T5
    R3 --> T5
    R3 --> T4
    R4 --> T6
    R4 --> T4
    R5 --> T3

    CR1 -->|"triggers every day"| EF1
    EF1 --> T3
    EF1 --> EX1
    EF1 --> EX2
    EF2 --> EX3
    EF2 --> EX4
    EF3 --> T1

    T1 --> T7
    T4 --> T7

    style SupabaseDB fill:#3ECF8E,color:#000
    style SupabaseFunc fill:#3ECF8E,color:#000
    style External fill:#888,color:#fff
```

---

## Database Schema (Supabase PostgreSQL)

```mermaid
erDiagram
    TRAINEES {
        uuid id PK
        text skill_id UK "SHA256 hash"
        text phone_encrypted
        text name_encrypted
        text district
        text gender
        text caste_category
        boolean consent_given
        timestamp consent_at
        timestamp created_at
    }

    PROVIDERS {
        uuid id PK
        text name
        text district
        text contact_email
        float placement_rate
        int total_trainees
    }

    COURSES {
        uuid id PK
        uuid provider_id FK
        text name
        text sector
        int duration_days
        text qp_code "Qualification Pack"
    }

    TRAINING_RECORDS {
        uuid id PK
        uuid trainee_id FK
        uuid course_id FK
        date enrollment_date
        float attendance_pct
        float assessment_score
        date certification_date
    }

    FOLLOWUP_TOUCHPOINTS {
        uuid id PK
        uuid trainee_id FK
        int checkpoint_days "30/90/180/365"
        text channel "whatsapp/sms/ivr/field"
        text status "sent/delivered/responded/bounced"
        jsonb response_data
        timestamp sent_at
        timestamp responded_at
    }

    EMPLOYMENT_OUTCOMES {
        uuid id PK
        uuid trainee_id FK
        uuid employer_id FK
        text outcome_type "formal/self/gig/apprentice/unemployed"
        text salary_band
        text sector
        date start_date
        text verified_by "self/employer/epfo"
        boolean retained_6m
        boolean retained_12m
        text non_placement_reason
        text nlp_tags "JSON array"
    }

    EMPLOYERS {
        uuid id PK
        text name
        text pf_registration_no
        text district
        text sector
        boolean verified
    }

    SKILL_GAP_SIGNALS {
        uuid id PK
        uuid course_id FK
        text district
        float placement_rate
        int avg_days_to_placement
        jsonb non_placement_reasons
        float employer_demand_score
        date computed_at
    }

    AUDIT_LOGS {
        uuid id PK
        uuid actor_id
        text action
        text table_name
        uuid record_id
        timestamp created_at
    }

    TRAINEES ||--o{ TRAINING_RECORDS : "enrolled in"
    COURSES ||--o{ TRAINING_RECORDS : "has"
    PROVIDERS ||--o{ COURSES : "offers"
    TRAINEES ||--o{ FOLLOWUP_TOUCHPOINTS : "receives"
    TRAINEES ||--o{ EMPLOYMENT_OUTCOMES : "has"
    EMPLOYERS ||--o{ EMPLOYMENT_OUTCOMES : "employs"
    COURSES ||--o{ SKILL_GAP_SIGNALS : "generates"
```

---

## The 4 Portals — What Each Screen Does

### Portal 1: Trainee PWA (`/trainee`)
```
/trainee/onboard        → Consent form + Skill ID generation
/trainee/profile        → Profile page with training history, badges
/trainee/checkin/[id]   → Follow-up survey (link from WhatsApp/SMS)
/trainee/certificate    → Downloadable digital certificate
```

### Portal 2: Provider Portal (`/provider`)
```
/provider/dashboard     → My courses, placement stats, accountability score
/provider/trainees      → List of enrolled trainees + status
/provider/enroll        → Add new trainee (generates Skill ID)
/provider/upload        → Bulk CSV upload
```

### Portal 3: Employer Verify (`/verify`)
```
/verify/[token]         → OTP verification page (no login needed)
                          "Did Rahul Kumar join on 15 Aug? Yes / No"
```

### Portal 4: Govt Dashboard (`/dashboard`)
```
/dashboard              → Overview: state-wide KPIs
/dashboard/providers    → Provider scorecard + ranking
/dashboard/districts    → District heatmap (Leaflet + OpenStreetMap)
/dashboard/cohorts      → Cohort tracker: follow a batch over time
/dashboard/gaps         → Skill gap analysis + NLP tags
/dashboard/equity       → Gender / caste / district equity metrics
/dashboard/reports      → Export PDF reports
```

---

## Follow-up Engine Logic (Supabase pg_cron)

```
Every day at 9:00 AM IST:
  
  1. Query DB: SELECT all training_records 
     WHERE certification_date = TODAY - 30 days   → send 30d touchpoint
     WHERE certification_date = TODAY - 90 days   → send 90d touchpoint
     WHERE certification_date = TODAY - 180 days  → send 180d touchpoint
     WHERE certification_date = TODAY - 365 days  → send 365d touchpoint

  2. For each due trainee:
     a. Check if touchpoint already sent for this checkpoint → skip if yes
     b. Send WhatsApp (attempt 1) → log as 'sent'
     c. If no response in 3 days → send SMS (attempt 2)
     d. If no response in 7 days → trigger IVR call (attempt 3)
     e. If no response in 14 days → flag for field agent

  3. Each unique survey link = /trainee/checkin/[uuid]
     → One-time use, expires in 30 days
     → Pre-fills known info (name, course)
     → 3 questions max per checkpoint
```

---

## Role-Based Access Control (RBAC)

| Role | What They Can See |
|---|---|
| `trainee` | Own profile only |
| `provider_admin` | Their trainees + their courses |
| `employer` | Only verify a specific trainee (via token link) |
| `district_officer` | Analytics for their district only |
| `state_admin` | Full dashboard, all districts, all providers |
| `system_admin` | Full access + audit logs + user management |

Implemented via **Supabase Row Level Security (RLS)** — no extra code needed.

---

## What's Real vs. Mocked for Demo

| Feature | Demo Status | Production Path |
|---|---|---|
| Trainee registration + Skill ID | ✅ Real | Same |
| Consent form saving to DB | ✅ Real | Same |
| Provider trainee enrollment | ✅ Real | Same |
| Follow-up survey form | ✅ Real | Same |
| Employment outcome recording | ✅ Real | Same |
| Analytics dashboard charts | ✅ Real (seeded data) | Live data |
| District heatmap | ✅ Real (seeded data) | Live data |
| SMS via Twilio | ✅ Real (free trial) | Paid Twilio |
| Employer OTP verification | ✅ Real | Same |
| WhatsApp Cloud API | 🟡 Mocked (video demo) | Meta Business approval |
| EPFO employment verification | 🔴 Mocked (spinner + checkmark) | Govt MOU required |
| DigiLocker identity recovery | 🔴 Mocked (button UI only) | NIC API access required |
| IVR phone call (Marathi) | 🔴 Mocked | Twilio Voice + gTTS |
| pg_cron follow-up scheduler | ✅ Real (Supabase built-in) | Same |
