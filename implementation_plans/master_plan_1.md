# SkillTrace — SIH 2026 Master Build Plan
### Problem 26135 | Maharashtra State Innovation Society
**The single source of truth for the entire team. Finalized.**

---

## The North Star (What Winning Looks Like)

When judges evaluate our project, they run it through this mental checklist:

| Judge's Question | Our Answer |
|---|---|
| Does it solve the actual problem? | Yes — longitudinal tracking, not just enrollment |
| Is it technically sound? | Yes — privacy-first, multi-signal verification |
| Can it scale in the real world? | Yes — built on government-grade APIs |
| Is it feasible to deploy? | Yes — works on 2G, no app install, Aadhaar-safe |
| Is the team credible? | Yes — they know the failure modes and have mitigated them |

**Every decision in this plan is made in service of these 5 questions.**

---

## Team Structure & Ownership

Split your team of 6 into these exact roles:

| # | Role | Owns | Skills Needed |
|---|---|---|---|
| P1 | **Backend + DB Lead** | Supabase schema, API routes, Edge Functions | Python or JS, SQL |
| P2 | **Frontend Lead (Trainee + Employer)** | Mobile-first PWA pages, check-in forms | Next.js, Tailwind |
| P3 | **Frontend Lead (Dashboard)** | Charts, heatmap, cohort tracker | Next.js, Recharts, Leaflet |
| P4 | **Integration + DevOps** | Twilio SMS, Supabase cron, Vercel deploy | APIs, ENV config |
| P5 | **Data + NLP** | Seed data, spaCy analysis, mock signals | Python, pandas |
| P6 | **UI/UX + Pitch** | Figma prototype, slide deck, demo script | Design, communication |

> P1 and P4 work together most closely. P2 and P3 are parallel tracks. P5 feeds data to P3. P6 mirrors what everyone builds.

---

## The Final Tech Stack (Locked, No Debate)

```
Frontend   →  Next.js 14 (App Router) + Tailwind CSS + shadcn/ui
Database   →  Supabase (PostgreSQL + Auth + Edge Functions + pg_cron)
Charts     →  Recharts (line, bar, pie, area)
Map        →  react-leaflet + OpenStreetMap tiles (free, no API key)
SMS        →  Twilio Free Trial (real SMS for demo)
Hosting    →  Vercel (Frontend) + Supabase (Backend)
NLP        →  Python + spaCy (run locally, write results to Supabase)
PDF Export →  jsPDF (client-side, free)
Icons      →  Lucide React (built into shadcn)
```

**Total infrastructure cost: ₹0**

---

## The 4 User Journeys (What We Are Building)

### Journey 1 — Trainee Flow
```
Training Center enrolls trainee → Supabase generates Skill ID
→ Trainee gets WhatsApp link → Opens consent form on phone
→ Signs digitally → Profile activated
→ [30 days later] Gets SMS with unique check-in link
→ Clicks link → Answers 3 questions → Gets badge
→ [90/180/365 days] Same, progressively deeper questions
→ Profile shows full 1-year journey
```

### Journey 2 — Employer Flow
```
Trainee reports employment → System sends employer an OTP-SMS link
→ Employer clicks link (no login) → Verifies hire with OTP
→ Employment record flagged as "Employer-Verified"
→ System checks PF number validity (mocked EPFO call)
→ Trainee gets "Verified Employed" badge on profile
```

### Journey 3 — Training Provider Flow
```
Provider admin logs in → Sees their trainee list
→ Adds new trainee → Logs attendance + scores
→ Marks certification date (triggers follow-up scheduler)
→ Sees their placement rate vs. state average
→ Views their "Accountability Score" (gamification)
```

### Journey 4 — Govt Officer Flow
```
District Officer logs in → Sees only their district's data (RLS)
→ Views skill gap heatmap → Clicks on Pune district
→ Sees which courses have 80%+ placement, which have 20%
→ Drills into a provider → Sees their cohort over 12 months
→ Exports a PDF report for the minister meeting
```

---

## Phase 0 — Project Setup (Hour 0 to 1)
**Owner: P1 + P4**

### Tasks
- [ ] **P4:** Create a GitHub repository, invite all team members with write access
- [ ] **P1:** Create a Supabase project at `supabase.com` (free, takes 2 min)
- [ ] **P4:** Create a Vercel account, connect it to the GitHub repository
- [ ] **P4:** Create a Twilio account, get a free trial phone number and auth token
- [ ] **P4:** Initialize the Next.js project:
  ```bash
  npx create-next-app@latest skilltrace --typescript --tailwind --app
  cd skilltrace
  npx shadcn-ui@latest init
  npm install @supabase/supabase-js recharts react-leaflet leaflet jspdf
  ```
- [ ] **P1:** Copy the entire SQL schema from Phase 1 below into Supabase SQL Editor and run it
- [ ] **P4:** Create a `.env.local` file with all credentials and share it with the team securely (NOT in GitHub):
  ```
  NEXT_PUBLIC_SUPABASE_URL=...
  NEXT_PUBLIC_SUPABASE_ANON_KEY=...
  SUPABASE_SERVICE_ROLE_KEY=...
  TWILIO_ACCOUNT_SID=...
  TWILIO_AUTH_TOKEN=...
  TWILIO_PHONE_NUMBER=...
  ```

---

## Phase 1 — Database Schema (Hour 1 to 2)
**Owner: P1**

Run this entire block in Supabase SQL Editor. This is the backbone of the entire system.

```sql
-- Enable UUID generation
create extension if not exists "pgcrypto";

-- PROVIDERS (Training Centers)
create table providers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  district text not null,
  contact_email text,
  contact_phone text,
  total_trainees int default 0,
  placement_rate float default 0,
  created_at timestamptz default now()
);

-- COURSES
create table courses (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid references providers(id),
  name text not null,
  sector text not null,
  duration_days int,
  qp_code text,
  created_at timestamptz default now()
);

-- TRAINEES (Core identity table)
create table trainees (
  id uuid primary key default gen_random_uuid(),
  skill_id text unique not null,         -- SHA256 hash, generated by Edge Function
  name_encrypted text,                   -- AES encrypted name
  phone_encrypted text,                  -- AES encrypted phone
  district text,
  gender text,
  caste_category text,                   -- SC/ST/OBC/General
  dob_year int,                          -- Birth year only, not full DOB
  consent_given boolean default false,
  consent_at timestamptz,
  created_at timestamptz default now()
);

-- TRAINING RECORDS
create table training_records (
  id uuid primary key default gen_random_uuid(),
  trainee_id uuid references trainees(id),
  course_id uuid references courses(id),
  provider_id uuid references providers(id),
  enrollment_date date,
  attendance_pct float,
  assessment_score float,
  certification_date date,              -- Triggers follow-up scheduler
  created_at timestamptz default now()
);

-- EMPLOYERS
create table employers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  pf_registration_no text,             -- For EPFO mock verification
  district text,
  sector text,
  verified boolean default false,
  created_at timestamptz default now()
);

-- EMPLOYMENT OUTCOMES
create table employment_outcomes (
  id uuid primary key default gen_random_uuid(),
  trainee_id uuid references trainees(id),
  employer_id uuid references employers(id),
  outcome_type text check (outcome_type in ('formal','self_employed','gig','apprentice','unemployed','searching')),
  salary_band text,                    -- e.g., '10000-15000'
  sector text,
  start_date date,
  verified_by text default 'self',     -- self / employer / epfo
  retained_6m boolean,
  retained_12m boolean,
  non_placement_reason text,           -- Free text from survey
  nlp_tags jsonb,                      -- e.g., ["location_mismatch","salary_too_low"]
  created_at timestamptz default now()
);

-- FOLLOW-UP TOUCHPOINTS
create table followup_touchpoints (
  id uuid primary key default gen_random_uuid(),
  trainee_id uuid references trainees(id),
  training_record_id uuid references training_records(id),
  checkpoint_days int check (checkpoint_days in (30, 90, 180, 365)),
  channel text default 'sms',          -- whatsapp / sms / ivr / field
  status text default 'pending',       -- pending / sent / delivered / responded / bounced
  survey_token text unique,            -- One-time-use link token
  response_data jsonb,                 -- Full survey response stored as JSON
  sent_at timestamptz,
  responded_at timestamptz,
  created_at timestamptz default now()
);

-- SKILL GAP SIGNALS (Computed table, written by Python NLP script)
create table skill_gap_signals (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references courses(id),
  district text,
  placement_rate float,
  avg_days_to_placement int,
  non_placement_reasons jsonb,         -- Aggregated NLP tags with counts
  employer_demand_score float,
  computed_at timestamptz default now()
);

-- AUDIT LOGS
create table audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid,
  action text,
  table_name text,
  record_id uuid,
  metadata jsonb,
  created_at timestamptz default now()
);

-- ROW LEVEL SECURITY (Enable for all tables)
alter table trainees enable row level security;
alter table training_records enable row level security;
alter table employment_outcomes enable row level security;
alter table followup_touchpoints enable row level security;

-- Policy: Trainees can only see their own record
create policy "Trainee own data" on trainees
  for select using (auth.uid()::text = id::text);

-- Policy: Provider can see their own trainees
create policy "Provider sees own trainees" on training_records
  for select using (provider_id in (
    select id from providers where contact_email = auth.email()
  ));
```

**After running this:** Go to Supabase → Authentication → Providers → Enable Email (Magic Link / OTP). This is your entire auth system, no code needed.

---

## Phase 2 — Seed Data (Hour 2 to 3)
**Owner: P5**

Do not demo an empty app. Write this Python script and run it once to populate realistic Maharashtra data.

```python
# seed_data.py — Run once: python seed_data.py
import os
from supabase import create_client
import hashlib, random, json
from datetime import date, timedelta

url = os.environ["SUPABASE_URL"]
key = os.environ["SUPABASE_SERVICE_ROLE_KEY"]
sb = create_client(url, key)

districts = ["Pune", "Mumbai", "Nashik", "Nagpur", "Aurangabad", 
             "Kolhapur", "Gadchiroli", "Solapur", "Amravati", "Thane"]
sectors = ["Construction", "Healthcare", "IT-ITES", "Agriculture", "Retail", 
           "Manufacturing", "Logistics", "Beauty & Wellness", "Plumbing", "Electrician"]
genders = ["Male", "Female", "Other"]
categories = ["SC", "ST", "OBC", "General"]

# Insert 5 Providers
providers = [
  {"name": f"Skill Center {d}", "district": d, "contact_email": f"admin@{d.lower()}.skills.mh"}
  for d in random.sample(districts, 5)
]
sb.table("providers").insert(providers).execute()
provider_ids = [r["id"] for r in sb.table("providers").select("id").execute().data]

# Insert 10 Courses
courses = []
for i, sector in enumerate(sectors):
  courses.append({
    "provider_id": random.choice(provider_ids),
    "name": f"{sector} Foundation Course",
    "sector": sector,
    "duration_days": random.choice([30, 45, 60, 90]),
    "qp_code": f"MH/{sector[:3].upper()}/Q001"
  })
sb.table("courses").insert(courses).execute()
course_ids = [r["id"] for r in sb.table("courses").select("id").execute().data]

# Insert 100 Trainees + Training Records
trainees_data = []
training_records_data = []
for i in range(100):
  district = random.choice(districts)
  phone = f"+919{random.randint(100000000,999999999)}"
  skill_id = hashlib.sha256(f"DEMO{i}SALT".encode()).hexdigest()[:20].upper()
  
  trainees_data.append({
    "skill_id": f"MH-{skill_id}",
    "name_encrypted": f"Trainee_{i:03d}",     # In prod: AES encrypted
    "phone_encrypted": phone,                  # In prod: AES encrypted
    "district": district,
    "gender": random.choice(genders),
    "caste_category": random.choice(categories),
    "dob_year": random.randint(1995, 2004),
    "consent_given": True,
    "consent_at": (date.today() - timedelta(days=random.randint(30, 400))).isoformat()
  })

trainee_ids = [r["id"] for r in sb.table("trainees").insert(trainees_data).execute().data]

for tid in trainee_ids:
  cert_date = date.today() - timedelta(days=random.randint(30, 400))
  training_records_data.append({
    "trainee_id": tid,
    "course_id": random.choice(course_ids),
    "provider_id": random.choice(provider_ids),
    "enrollment_date": (cert_date - timedelta(days=60)).isoformat(),
    "attendance_pct": round(random.uniform(65, 100), 1),
    "assessment_score": round(random.uniform(50, 100), 1),
    "certification_date": cert_date.isoformat()
  })

sb.table("training_records").insert(training_records_data).execute()

# Insert Employment Outcomes for ~65% of trainees (realistic placement rate)
outcome_types = ["formal","self_employed","gig","unemployed","searching"]
for i, tid in enumerate(trainee_ids):
  if random.random() < 0.65:
    sb.table("employment_outcomes").insert({
      "trainee_id": tid,
      "outcome_type": random.choice(["formal","self_employed","gig"]),
      "salary_band": random.choice(["8000-12000","12000-18000","18000-25000","25000+"]),
      "sector": random.choice(sectors),
      "verified_by": random.choice(["self","employer","epfo"]),
      "retained_6m": random.random() > 0.3,
      "non_placement_reason": None
    }).execute()
  else:
    reasons = ["No jobs in my area", "Salary too low", "Family responsibilities",
               "Skill mismatch with job requirements", "Still searching"]
    sb.table("employment_outcomes").insert({
      "trainee_id": tid,
      "outcome_type": random.choice(["unemployed","searching"]),
      "non_placement_reason": random.choice(reasons)
    }).execute()

print("✅ Seed complete: 5 providers, 10 courses, 100 trainees, outcomes seeded")
```

---

## Phase 3 — Frontend: Trainee + Employer Views (Hours 3 to 7)
**Owner: P2**

### Folder Structure for Next.js
```
skilltrace/
├── app/
│   ├── layout.tsx                    # Root layout
│   ├── page.tsx                      # Landing page (public)
│   │
│   ├── trainee/
│   │   ├── onboard/page.tsx          # Consent + Skill ID display
│   │   ├── profile/[skillId]/page.tsx # Trainee profile + badge wall
│   │   └── checkin/[token]/page.tsx  # Follow-up survey (SMS link target)
│   │
│   ├── provider/
│   │   ├── login/page.tsx
│   │   ├── dashboard/page.tsx
│   │   ├── trainees/page.tsx         # Trainee list + enroll
│   │   └── enroll/page.tsx           # Add new trainee form
│   │
│   ├── verify/
│   │   └── [token]/page.tsx          # Employer OTP verification
│   │
│   ├── dashboard/
│   │   ├── page.tsx                  # State overview KPIs
│   │   ├── providers/page.tsx        # Provider leaderboard
│   │   ├── districts/page.tsx        # Heatmap
│   │   ├── cohorts/page.tsx          # Cohort tracker
│   │   ├── gaps/page.tsx             # Skill gap analysis
│   │   └── equity/page.tsx           # Demographic breakdown
│   │
│   └── api/
│       ├── trainee/route.ts          # POST: Create trainee
│       ├── checkin/[token]/route.ts  # POST: Submit survey response
│       ├── verify/route.ts           # POST: Employer verification
│       ├── followup/trigger/route.ts # POST: Manual trigger for demo
│       └── analytics/route.ts        # GET: Dashboard data
│
├── components/
│   ├── ui/                           # shadcn components (auto-generated)
│   ├── charts/
│   │   ├── PlacementChart.tsx
│   │   ├── CohortTimeline.tsx
│   │   ├── SectorPieChart.tsx
│   │   └── EquityBarChart.tsx
│   ├── map/
│   │   └── DistrictHeatmap.tsx
│   ├── TraineeBadge.tsx
│   ├── ProviderScorecard.tsx
│   └── VerificationBadge.tsx
│
├── lib/
│   ├── supabase.ts                   # Supabase client
│   ├── skillid.ts                    # Skill ID generator
│   └── utils.ts                      # shadcn utils
│
└── .env.local                        # Secrets (NOT in GitHub)
```

### Key Components to Build (P2's Tasks)

**Task 2.1 — Trainee Check-in Page** (`/trainee/checkin/[token]`)
This is the most important page. It is what every trainee sees when they click the SMS link.
- Verify the token exists in `followup_touchpoints` table and is not expired
- Show a 3-question form based on `checkpoint_days` (30d = simple yes/no; 90d = add salary; 180d = add retention)
- On submit: write to `followup_touchpoints.response_data` and update `employment_outcomes`
- On success: show an animated badge being "unlocked" (use shadcn `Dialog` component)

**Task 2.2 — Trainee Onboarding Page** (`/trainee/onboard`)
- Phone number input → Supabase OTP → Profile setup form
- Aadhaar number field → Hash it client-side before sending to server (CRITICAL for privacy pitch)
- Consent checkbox with legal text
- Show generated Skill ID on success (e.g., `MH-A3F8BC91...`)

**Task 2.3 — Employer Verification Page** (`/verify/[token]`)
- Load employer's name and trainee name from the token
- "Did [Trainee] join your company on [Date]?" → YES / NO buttons
- YES flow: Enter OTP received on phone → Confirm → Show green success screen
- NO flow: Short reason selector → Submit → Show acknowledgment screen

---

## Phase 4 — Frontend: Government Dashboard (Hours 4 to 8, Parallel to Phase 3)
**Owner: P3 + P5 for data**

### Key Dashboard Components

**Task 3.1 — State KPI Overview** (`/dashboard`)
Build 6 metric cards at the top using shadcn `Card`:
- Total Trainees Enrolled
- Certified This Year
- Placement Rate (state average)
- Verified Employment (employer/EPFO confirmed)
- Avg. Salary Band
- Female Participation %

**Task 3.2 — District Heatmap** (`/dashboard/districts`)

```tsx
// components/map/DistrictHeatmap.tsx
"use client"
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet'
import maharashtraGeoJson from '@/data/maharashtra-districts.json'

// Color scale based on placement_rate
const getColor = (rate: number) => {
  if (rate > 75) return '#1a7c3f'  // Dark green
  if (rate > 60) return '#52b788'  // Light green
  if (rate > 45) return '#f4a261'  // Orange
  return '#e63946'                  // Red (needs intervention)
}

export default function DistrictHeatmap({ data }) {
  const style = (feature) => ({
    fillColor: getColor(data[feature.properties.NAME_2]?.placement_rate || 0),
    weight: 1, color: 'white', fillOpacity: 0.8
  })
  // Add tooltips showing placement rate on hover
  return (
    <MapContainer center={[19.7515, 75.7139]} zoom={6.5} style={{height: '500px'}}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <GeoJSON data={maharashtraGeoJson} style={style} onEachFeature={...} />
    </MapContainer>
  )
}
```

> Download Maharashtra districts GeoJSON from: `https://github.com/datameet/maps/tree/master/Districts` (free, open license)

**Task 3.3 — Cohort Timeline** (`/dashboard/cohorts`)
This is the "longitudinal" part that makes the judges say "wow."
- X-axis: Time (Enrollment → 30d → 90d → 180d → 365d)
- Y-axis: % of cohort (Enrolled → Certified → Placed → Retained at 6m → Retained at 12m)
- Shows the "dropout funnel" visually — where people fall off
- Use Recharts `AreaChart` with multiple series

**Task 3.4 — Skill Gap Analysis** (`/dashboard/gaps`)
- Bubble chart: X=Enrollment count, Y=Placement rate, Size=Employer demand score
- Courses in the bottom-right quadrant (high enrollment, low placement) = the crisis zones
- Table below the chart showing top reasons for non-placement (from NLP tags)
- Actionable: "3,200 trainees in CNC operator course in Pune have only 22% placement. Top reason: No manufacturing units hiring in Pune district."

**Task 3.5 — Provider Leaderboard** (`/dashboard/providers`)
- Sortable table: Rank, Provider Name, District, Trainees, Placement %, Verified Employment %, Accountability Score
- Accountability Score formula: `(placement_rate * 0.5) + (verified_employment_rate * 0.3) + (retention_6m * 0.2)`
- Color code the score: Green/Yellow/Red
- Click a row → Drill down to that provider's cohort timeline

---

## Phase 5 — Backend: API Routes + Follow-up Engine (Hours 5 to 9)
**Owner: P1 + P4**

### API Routes to Build

**Route 1: `POST /api/trainee`** — Create new trainee
```typescript
// app/api/trainee/route.ts
import { createClient } from '@/lib/supabase'
import crypto from 'crypto'

export async function POST(request: Request) {
  const { aadhaar_raw, phone, name, district, gender, caste, dob_year, consent } = await request.json()
  
  // CRITICAL: Hash Aadhaar before it ever touches the server
  const skill_id = 'MH-' + crypto
    .createHash('sha256')
    .update(aadhaar_raw + process.env.AADHAAR_SALT)
    .digest('hex')
    .substring(0, 16)
    .toUpperCase()
  
  const supabase = createClient()
  const { data, error } = await supabase.from('trainees').insert({
    skill_id,
    name_encrypted: name,    // In prod: encrypt with AES-256
    phone_encrypted: phone,  // In prod: encrypt with AES-256
    district, gender, caste_category: caste, dob_year,
    consent_given: consent,
    consent_at: new Date().toISOString()
  }).select().single()
  
  if (error) return Response.json({ error }, { status: 400 })
  return Response.json({ skill_id: data.skill_id })
}
```

**Route 2: `POST /api/checkin/[token]`** — Submit follow-up survey
- Validate token exists and is not expired
- Write `response_data` JSON to the touchpoint record
- Upsert employment outcome record
- Mark touchpoint as `responded`
- Return success + badge info

**Route 3: `POST /api/verify`** — Employer verification
- Validate OTP (use Supabase Auth OTP)
- Mark employment outcome as `verified_by: 'employer'`
- Log to audit_logs
- Trigger EPFO mock check (returns success after 2 seconds)

**Route 4: `POST /api/followup/trigger`** — Manual trigger for demo
This is your secret weapon for the demo. When the judge says "show me how follow-ups work", click this button to:
1. Pick a trainee from the DB
2. Immediately send them an SMS via Twilio
3. Show the judge the SMS arriving on a phone
4. Click the link → show the check-in form
5. Submit → show the dashboard updating in real-time

```typescript
// app/api/followup/trigger/route.ts
import twilio from 'twilio'

export async function POST(request: Request) {
  const { trainee_id, checkpoint_days } = await request.json()
  
  // Generate one-time token
  const token = crypto.randomUUID()
  
  // Save touchpoint to DB
  // ... supabase insert ...
  
  // Send SMS
  const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  await client.messages.create({
    body: `SkillTrace: It's been ${checkpoint_days} days since your course. How are you doing? Click to update: ${process.env.NEXT_PUBLIC_URL}/trainee/checkin/${token}`,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: trainee_phone  // fetched from DB
  })
  
  return Response.json({ success: true, token })
}
```

### Supabase Cron Job (Follow-up Scheduler)
Go to Supabase → SQL Editor → Run this:
```sql
-- Install pg_cron (one-time setup)
create extension if not exists pg_cron;

-- Run every day at 9:00 AM IST (3:30 AM UTC)
select cron.schedule(
  'daily-followup-dispatcher',
  '30 3 * * *',
  $$
  -- Find all training records due for a checkpoint
  insert into followup_touchpoints (trainee_id, training_record_id, checkpoint_days, survey_token, status)
  select 
    tr.trainee_id,
    tr.id,
    days.checkpoint,
    gen_random_uuid()::text,
    'pending'
  from training_records tr
  cross join (values (30), (90), (180), (365)) as days(checkpoint)
  where tr.certification_date = current_date - (days.checkpoint || ' days')::interval
    and not exists (
      select 1 from followup_touchpoints ft 
      where ft.training_record_id = tr.id 
        and ft.checkpoint_days = days.checkpoint
    )
  $$
);
```
Then an Edge Function reads `pending` touchpoints and fires the Twilio SMS.

---

## Phase 6 — NLP Skill Gap Analysis (Hours 7 to 9)
**Owner: P5**

This is what makes the analytics dashboard feel intelligent, not just a pretty chart.

```python
# nlp_analysis.py — Run after seed data, updates skill_gap_signals table
import spacy
from collections import Counter
from supabase import create_client
import os

nlp = spacy.load("en_core_web_sm")

REASON_TAGS = {
    "location": ["area", "city", "location", "far", "distance", "commute", "relocate"],
    "salary": ["salary", "pay", "wage", "low", "money", "income", "compensation"],
    "skill_mismatch": ["skill", "mismatch", "not match", "different", "qualification"],
    "family": ["family", "marriage", "personal", "mother", "father", "child"],
    "searching": ["searching", "looking", "still", "waiting", "interview"],
    "health": ["health", "sick", "illness", "accident", "disabled"]
}

def tag_reason(text: str) -> list[str]:
    if not text: return []
    doc = nlp(text.lower())
    tags = []
    for tag, keywords in REASON_TAGS.items():
        if any(kw in doc.text for kw in keywords):
            tags.append(tag)
    return tags if tags else ["other"]

sb = create_client(os.environ["SUPABASE_URL"], os.environ["SUPABASE_SERVICE_ROLE_KEY"])

# Fetch all outcomes with non-placement reasons
outcomes = sb.table("employment_outcomes")\
    .select("*, training_records(course_id, provider_id)")\
    .in_("outcome_type", ["unemployed", "searching"])\
    .execute().data

# Tag each reason
for outcome in outcomes:
    tags = tag_reason(outcome.get("non_placement_reason"))
    sb.table("employment_outcomes")\
        .update({"nlp_tags": tags})\
        .eq("id", outcome["id"])\
        .execute()

# Aggregate into skill_gap_signals
# ... group by course_id, district, compute placement_rate, aggregate tags ...
print("✅ NLP analysis complete, skill_gap_signals table updated")
```

---

## Phase 7 — Polish, Demo Prep & Deploy (Hours 9 to 12)
**Owner: All + P6 leads**

### P4: Deploy Checklist
- [ ] `git push` to GitHub → Vercel auto-deploys frontend
- [ ] Verify all `env` variables are set in Vercel dashboard
- [ ] Test all 4 flows on a real mobile phone (not just desktop)
- [ ] Test SMS delivery to a real phone number
- [ ] Ensure the GeoJSON heatmap loads correctly

### P6: The Demo Script (Practice This Exactly)
The demo must be max 5 minutes. Follow this script precisely:

**Minute 1 — The Problem Statement**
> "Maharashtra trains 50 lakh people a year. But nobody knows what happened to them 6 months later. Providers just report enrollment numbers. We built SkillTrace to answer the question: Did the training actually change their life?"

**Minute 2 — The Trainee Experience**
> *[Switch to mobile view on projector]*
> "When Priya completed her healthcare training in Gadchiroli, the system automatically sent her this WhatsApp message 30 days later."
> *[Show the SMS arriving on a phone. Click the link. Fill the 3-question form. Show the badge unlocking.]*

**Minute 3 — The Employer Verification**
> "Self-reported data is not enough. When Priya said she got a job, SkillTrace automatically sent her employer this verification link."
> *[Show the employer OTP page. Click YES. Show the 'Employer Verified' badge appear on Priya's profile.]*
> "We also simulate a cross-check against EPFO's PF database."
> *[Click the EPFO verify button. Show 2-second spinner. Show green checkmark.]*

**Minute 4 — The Government Dashboard**
> *[Switch to desktop view]*
> "A District Collector in Gadchiroli logs in and sees THIS."
> *[Show the district heatmap — Gadchiroli is red.]*
> "Gadchiroli has 78% enrollment but only 28% placement. Click."
> *[Click Gadchiroli. Show the cohort funnel — 200 enrolled, 60% placed, 40% dropped off.]*
> "The NLP engine analyzed why. 60% of non-placements say 'No jobs in the district.' This is an actionable insight that changes policy."

**Minute 5 — The Impact**
> "We've solved the three critical failures: trainees change phone numbers — we use Aadhaar-hashed IDs for identity recovery. Employers don't report — we made it a 10-second OTP verification. Multiple programs use different IDs — our Skill ID is the universal token. SkillTrace doesn't just count certificates. It counts lives changed."

### P6: Slide Deck Structure (8 Slides)
1. **The Gap** — "We know inputs, not outcomes" (1 powerful statistic)
2. **SkillTrace** — One-liner + architecture overview diagram
3. **The Trainee Journey** — Screenshot of mobile check-in
4. **The Verification Chain** — Self → Employer → EPFO pyramid
5. **The Dashboard** — Screenshot of heatmap + cohort funnel
6. **Privacy First** — Aadhaar hash diagram, consent flow, RLS
7. **Real-World Feasibility** — What's live vs. what needs MOU (shows maturity)
8. **Impact** — "If deployed state-wide: 50 lakh trainees tracked, policy decisions evidence-based"

---

## Risk Assessment & Mitigations

| Risk | Probability | Mitigation |
|---|---|---|
| Twilio SMS doesn't deliver in demo | Medium | Pre-recorded backup video of the SMS flow |
| Leaflet heatmap doesn't load GeoJSON | Low | Fallback: Table view with district data |
| Supabase free tier rate limit | Low | All demo data pre-seeded, minimal live calls |
| "Why not a native app?" judge question | High | Answer: PWA + SMS = no install friction for rural users |
| "How do you handle Aadhaar legally?" question | High | Aadhaar hash script + consent framework + no raw storage |
| "Can it really scale to 50 lakh?" question | Medium | "PostgreSQL at Supabase scales to millions; add partitioning for production" |
| Team member doesn't finish their module | Medium | P6 has screenshots and Figma mockups as fallback for every module |

---

## The 12-Hour Clock

| Time Block | Phase | Who |
|---|---|---|
| Hour 0–1 | Setup: GitHub, Supabase, Vercel, Next.js init | P1, P4 |
| Hour 1–2 | Database schema SQL + Supabase config | P1 |
| Hour 2–3 | Seed data script | P5 |
| Hour 3–5 | Trainee check-in + onboarding pages | P2 |
| Hour 4–7 | Dashboard charts + heatmap | P3 |
| Hour 5–6 | Employer verification page | P2 |
| Hour 6–8 | API routes + follow-up trigger | P1, P4 |
| Hour 7–8 | NLP analysis script | P5 |
| Hour 8–9 | Supabase cron + Twilio SMS integration | P4 |
| Hour 9–10 | Deploy to Vercel + end-to-end testing | P1, P4 |
| Hour 10–11 | Mobile testing + bug fixes | All |
| Hour 11–12 | Demo rehearsal + slide polish | P6, All |

---

## Definition of Done (How You Know You're Ready)

- [ ] A new trainee can be enrolled and a Skill ID is generated
- [ ] A follow-up SMS can be triggered and a real phone receives it
- [ ] Clicking the SMS link opens the check-in form on a mobile browser
- [ ] Submitting the form updates the database
- [ ] An employer can verify a hire via the OTP web link
- [ ] The government dashboard loads with the district heatmap colored correctly
- [ ] The cohort timeline shows a funnel from enrollment to 12-month retention
- [ ] The skill gap bubble chart shows at least one "crisis zone" course
- [ ] The entire demo runs end-to-end in under 5 minutes without errors
- [ ] The app works on a mobile browser in Chrome on Android
