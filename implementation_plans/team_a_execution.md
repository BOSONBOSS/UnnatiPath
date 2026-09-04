# Team A — Complete Execution Guide
## Backend, Database, API & Deployment
### SkillTrace | SIH 2026 | Problem 26135

> **This is your single source of truth. Follow every step in order. Do not skip. Do not improvise.**
> At the end of this document, the entire backend is live on Vercel and Supabase, and both Team B and Team C can build against it.

---

## Who Does What Inside Team A

| | Member 1 | Member 2 |
|---|---|---|
| **Focus** | Supabase (Database + Auth + Cron) | Next.js (Project + APIs + Deploy) |
| **Works on** | Supabase dashboard + SQL | VS Code + Terminal |
| **Primary output** | Live database with all tables | Live API on Vercel |
| **Starts when** | Right now | Right now (in parallel) |

**You work in parallel from the start. The only sync point is at Step 3, when Member 2 needs the Supabase credentials from Member 1.**

---

## Prerequisites Checklist
**Both members do this on their own laptop before anything else.**

Open a terminal and run each check:

```bash
# Check Node.js (need v18+)
node --version
# If missing: go to https://nodejs.org → download LTS → install

# Check npm
npm --version
# Comes with Node. Should show 9+

# Check git
git --version
# If missing: https://git-scm.com/downloads

# Check Python (for Team C's seed script — Member 1 installs this)
python --version
# If missing: https://python.org → download 3.11+
```

If any of these fail, install before continuing. Do NOT move forward until all 4 pass.

---
---

# MEMBER 1 — Supabase (Database Lead)

---

## M1 — STEP 1: Create Supabase Project
**Time: 15 minutes | Blocker: Everyone waits for this**

1. Go to **https://supabase.com**
2. Click **"Start your project"** → Sign up with GitHub
3. Click **"New Project"**
4. Fill in:
   - **Organization:** Create new → name it `skilltrace-sih`
   - **Project name:** `skilltrace`
   - **Database Password:** Generate a strong one → **SAVE IT IN YOUR NOTES**
   - **Region:** `Southeast Asia (Singapore)` — closest to India
5. Click **"Create new project"**
6. Wait ~2 minutes for it to spin up (you'll see a progress screen)

### Get Your Credentials
Once the project loads:
1. Click **Settings** (gear icon in left sidebar) → **API**
2. Copy these 3 values and **immediately paste them into the team group chat:**

```
NEXT_PUBLIC_SUPABASE_URL = https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6...
SUPABASE_SERVICE_ROLE_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6...  ← KEEP SECRET
```

> ⚠️ The `SERVICE_ROLE_KEY` bypasses all security. Never put it in frontend code or GitHub. Only used in server-side API routes.

**POST ALL 3 IN GROUP CHAT RIGHT NOW. This unblocks Member 2 and both other teams.**

---

## M1 — STEP 2: Enable Authentication
**Time: 5 minutes**

In the Supabase dashboard:
1. Click **Authentication** in the left sidebar
2. Click **Providers**
3. Find **Phone** → Toggle it **ON**
4. Under "SMS Provider" select **Twilio** (we'll fill credentials later after Member 2 sets up Twilio)
5. For now, just enable it and leave the fields blank
6. Click **Save**

Also enable **Email**:
1. Still in Providers → Find **Email** → Make sure it's **ON**
2. Under Email, enable **"Confirm email"** = OFF (for faster hackathon demo — no email verification step)
3. Click **Save**

---

## M1 — STEP 3: Run the Full Database Schema
**Time: 20 minutes | This is your most critical task**

1. In Supabase dashboard → Click **SQL Editor** (left sidebar, looks like `</>`)
2. Click **"+ New query"**
3. Copy the ENTIRE block below and paste it in — then click **"Run"** (green button)

```sql
-- ============================================
-- SKILLTRACE DATABASE SCHEMA
-- Run this entire block in Supabase SQL Editor
-- ============================================

-- Enable UUID generation extension
create extension if not exists "pgcrypto";

-- ============================================
-- TABLE 1: PROVIDERS (Training Centers)
-- ============================================
create table providers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  district text not null,
  sector text,
  contact_email text,
  contact_phone text,
  accountability_score float default 0,
  created_at timestamptz default now()
);

-- ============================================
-- TABLE 2: COURSES
-- ============================================
create table courses (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid references providers(id) on delete cascade,
  name text not null,
  sector text not null,
  duration_days int,
  qp_code text,
  created_at timestamptz default now()
);

-- ============================================
-- TABLE 3: TRAINEES (Core identity — privacy first)
-- ============================================
create table trainees (
  id uuid primary key default gen_random_uuid(),
  skill_id text unique not null,       -- SHA256 hash of Aadhaar+salt
  name_encrypted text not null,        -- In prod: AES-256 encrypted
  phone_encrypted text not null,       -- In prod: AES-256 encrypted
  district text,
  gender text check (gender in ('Male', 'Female', 'Other')),
  caste_category text check (caste_category in ('SC', 'ST', 'OBC', 'General')),
  dob_year int,                        -- Year only, not full DOB
  consent_given boolean default false,
  consent_at timestamptz,
  created_at timestamptz default now()
);

-- ============================================
-- TABLE 4: TRAINING RECORDS
-- ============================================
create table training_records (
  id uuid primary key default gen_random_uuid(),
  trainee_id uuid references trainees(id) on delete cascade,
  course_id uuid references courses(id),
  provider_id uuid references providers(id),
  enrollment_date date,
  attendance_pct float check (attendance_pct between 0 and 100),
  assessment_score float check (assessment_score between 0 and 100),
  certification_date date,             -- When set, triggers follow-up scheduling
  created_at timestamptz default now()
);

-- ============================================
-- TABLE 5: EMPLOYERS
-- ============================================
create table employers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  pf_registration_no text,            -- For EPFO cross-check
  district text,
  sector text,
  verified boolean default false,
  created_at timestamptz default now()
);

-- ============================================
-- TABLE 6: EMPLOYMENT OUTCOMES (Core output data)
-- ============================================
create table employment_outcomes (
  id uuid primary key default gen_random_uuid(),
  trainee_id uuid references trainees(id) on delete cascade,
  employer_id uuid references employers(id),
  outcome_type text check (outcome_type in (
    'formal', 'self_employed', 'gig', 'apprentice', 'unemployed', 'searching'
  )),
  salary_band text,                   -- e.g., '12000-18000'
  sector text,
  start_date date,
  verified_by text default 'self' check (verified_by in ('self', 'employer', 'epfo')),
  retained_6m boolean,
  retained_12m boolean,
  non_placement_reason text,          -- Free text answer from survey
  nlp_tags jsonb default '[]',        -- e.g., ["location_mismatch","salary_too_low"]
  created_at timestamptz default now()
);

-- ============================================
-- TABLE 7: FOLLOW-UP TOUCHPOINTS
-- Every SMS/WhatsApp sent is logged here
-- ============================================
create table followup_touchpoints (
  id uuid primary key default gen_random_uuid(),
  trainee_id uuid references trainees(id) on delete cascade,
  training_record_id uuid references training_records(id),
  checkpoint_days int check (checkpoint_days in (30, 90, 180, 365)),
  channel text default 'sms' check (channel in ('sms', 'whatsapp', 'ivr', 'field')),
  status text default 'pending' check (status in (
    'pending', 'sent', 'delivered', 'responded', 'bounced', 'escalated'
  )),
  survey_token text unique default gen_random_uuid()::text,  -- One-time link token
  response_data jsonb,                -- Full JSON response from the survey
  sent_at timestamptz,
  responded_at timestamptz,
  expires_at timestamptz default (now() + interval '30 days'),
  created_at timestamptz default now()
);

-- ============================================
-- TABLE 8: SKILL GAP SIGNALS
-- Written by Python NLP script (Team C)
-- ============================================
create table skill_gap_signals (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references courses(id),
  district text,
  placement_rate float,
  avg_days_to_placement int,
  non_placement_reasons jsonb,        -- Aggregated tag counts
  employer_demand_score float,
  computed_at timestamptz default now()
);

-- ============================================
-- TABLE 9: AUDIT LOGS
-- ============================================
create table audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid,                      -- Who performed the action
  action text not null,               -- e.g., 'trainee.create', 'outcome.update'
  table_name text,
  record_id uuid,
  metadata jsonb,
  ip_address text,
  created_at timestamptz default now()
);

-- ============================================
-- INDEXES (for query performance)
-- ============================================
create index idx_trainees_skill_id on trainees(skill_id);
create index idx_trainees_district on trainees(district);
create index idx_training_records_trainee on training_records(trainee_id);
create index idx_training_records_cert_date on training_records(certification_date);
create index idx_followup_token on followup_touchpoints(survey_token);
create index idx_followup_status on followup_touchpoints(status);
create index idx_outcomes_trainee on employment_outcomes(trainee_id);
create index idx_outcomes_type on employment_outcomes(outcome_type);
create index idx_audit_created on audit_logs(created_at);

-- ============================================
-- ROW LEVEL SECURITY (Privacy enforcement)
-- ============================================
alter table trainees enable row level security;
alter table training_records enable row level security;
alter table employment_outcomes enable row level security;
alter table followup_touchpoints enable row level security;
alter table providers enable row level security;
alter table courses enable row level security;
alter table employers enable row level security;

-- Public can read providers and courses (for display)
create policy "Anyone can read providers"
  on providers for select using (true);

create policy "Anyone can read courses"
  on courses for select using (true);

-- Service role bypasses all RLS (used in API routes with service key)
-- This is the default Supabase behavior — no extra policy needed for service role

-- ============================================
-- DATABASE VIEWS (For analytics dashboard)
-- ============================================

-- Placement rate by district
create or replace view district_placement_stats as
select
  t.district,
  count(distinct t.id) as total_trainees,
  count(distinct case when eo.outcome_type in ('formal','self_employed','gig','apprentice')
    then t.id end) as placed_trainees,
  round(
    count(distinct case when eo.outcome_type in ('formal','self_employed','gig','apprentice')
      then t.id end)::numeric / nullif(count(distinct t.id), 0) * 100, 1
  ) as placement_rate
from trainees t
left join employment_outcomes eo on eo.trainee_id = t.id
group by t.district;

-- Provider accountability scores
create or replace view provider_stats as
select
  p.id,
  p.name,
  p.district,
  count(distinct tr.trainee_id) as total_trainees,
  round(avg(tr.attendance_pct), 1) as avg_attendance,
  round(avg(tr.assessment_score), 1) as avg_score,
  count(distinct case when eo.outcome_type in ('formal','self_employed','gig','apprentice')
    then tr.trainee_id end) as placed_count,
  round(
    count(distinct case when eo.outcome_type in ('formal','self_employed','gig','apprentice')
      then tr.trainee_id end)::numeric / nullif(count(distinct tr.trainee_id), 0) * 100, 1
  ) as placement_rate,
  round(
    count(distinct case when eo.verified_by in ('employer','epfo')
      then tr.trainee_id end)::numeric / nullif(count(distinct tr.trainee_id), 0) * 100, 1
  ) as verified_rate
from providers p
left join training_records tr on tr.provider_id = p.id
left join employment_outcomes eo on eo.trainee_id = tr.trainee_id
group by p.id, p.name, p.district;

-- Cohort funnel data
create or replace view cohort_funnel as
select
  count(*) as enrolled,
  count(case when tr.certification_date is not null then 1 end) as certified,
  count(distinct case when ft.checkpoint_days = 30 and ft.status = 'responded'
    then ft.trainee_id end) as responded_30d,
  count(distinct case when eo.outcome_type in ('formal','self_employed','gig','apprentice')
    then eo.trainee_id end) as placed,
  count(distinct case when eo.retained_6m = true then eo.trainee_id end) as retained_6m,
  count(distinct case when eo.retained_12m = true then eo.trainee_id end) as retained_12m
from training_records tr
left join followup_touchpoints ft on ft.training_record_id = tr.id
left join employment_outcomes eo on eo.trainee_id = tr.trainee_id;
```

4. After running: you should see **"Success. No rows returned"** at the bottom.
5. Click **Table Editor** in the left sidebar — you should see all 9 tables listed.

**✅ VALIDATION:** Go to Table Editor → click `trainees` → it should show an empty table with all the right columns.

---

## M1 — STEP 4: Set Up Supabase pg_cron (Follow-up Scheduler)
**Time: 10 minutes**

This enables the automated daily follow-up job.

In SQL Editor → New Query → paste and run:

```sql
-- Enable the pg_cron extension
create extension if not exists pg_cron;

-- Schedule the daily follow-up dispatcher
-- Runs every day at 3:30 AM UTC = 9:00 AM IST
select cron.schedule(
  'daily-followup-dispatcher',    -- Job name (unique)
  '30 3 * * *',                   -- Cron: 3:30 AM UTC daily
  $$
    -- Find trainees due for a follow-up touchpoint today
    -- and insert a 'pending' touchpoint if not already created
    insert into followup_touchpoints
      (trainee_id, training_record_id, checkpoint_days, status, sent_at)
    select
      tr.trainee_id,
      tr.id,
      d.checkpoint,
      'pending',
      now()
    from training_records tr
    cross join (
      values (30), (90), (180), (365)
    ) as d(checkpoint)
    where
      -- Certification date was exactly N days ago
      tr.certification_date = current_date - (d.checkpoint || ' days')::interval
      -- Don't create duplicate touchpoints
      and not exists (
        select 1 from followup_touchpoints ft
        where ft.training_record_id = tr.id
          and ft.checkpoint_days = d.checkpoint
      );
  $$
);

-- Verify it was created
select * from cron.job;
```

You should see a row with `jobname = 'daily-followup-dispatcher'`.

> **For the demo:** You won't wait for 9 AM to demonstrate follow-ups. Member 2's `/api/followup/trigger` route will manually trigger an SMS on demand. The cron handles production.

---

## M1 — STEP 5: Create Supabase Edge Function (SMS Dispatcher)
**Time: 20 minutes**

This function reads all `pending` touchpoints and sends SMS via Twilio. It's called by the cron job and by the manual trigger API.

In Supabase dashboard → **Edge Functions** → **New Function** → Name: `send-followup`

Paste this code:

```typescript
// Supabase Edge Function: send-followup
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const twilioSid = Deno.env.get('TWILIO_ACCOUNT_SID')!
const twilioToken = Deno.env.get('TWILIO_AUTH_TOKEN')!
const twilioPhone = Deno.env.get('TWILIO_PHONE_NUMBER')!
const appUrl = Deno.env.get('APP_URL')!

const supabase = createClient(supabaseUrl, supabaseKey)

Deno.serve(async () => {
  // Fetch all pending touchpoints
  const { data: pending } = await supabase
    .from('followup_touchpoints')
    .select('*, trainees(phone_encrypted, name_encrypted)')
    .eq('status', 'pending')
    .limit(100)

  if (!pending || pending.length === 0) {
    return new Response(JSON.stringify({ sent: 0 }), { status: 200 })
  }

  let sent = 0
  for (const touchpoint of pending) {
    const phone = touchpoint.trainees?.phone_encrypted
    const name = touchpoint.trainees?.name_encrypted
    if (!phone) continue

    const surveyUrl = `${appUrl}/trainee/checkin/${touchpoint.survey_token}`
    const message = `SkillTrace: Hi ${name}! It's been ${touchpoint.checkpoint_days} days since your course. Update your employment status and earn a badge: ${surveyUrl} (Reply STOP to opt out)`

    // Send SMS via Twilio
    const encoded = btoa(`${twilioSid}:${twilioToken}`)
    const smsRes = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${encoded}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({ To: phone, From: twilioPhone, Body: message })
      }
    )

    if (smsRes.ok) {
      // Update touchpoint status to 'sent'
      await supabase
        .from('followup_touchpoints')
        .update({ status: 'sent', sent_at: new Date().toISOString() })
        .eq('id', touchpoint.id)
      sent++
    }
  }

  return new Response(JSON.stringify({ sent }), { status: 200 })
})
```

Click **Deploy**. The function URL will look like:
`https://xxxx.supabase.co/functions/v1/send-followup`

---

## M1 — STEP 6: Set Supabase Environment Variables
**Time: 5 minutes**

In Supabase → **Project Settings** → **Edge Functions** → **Environment Variables**

Add these (get values from Member 2 once Twilio is set up):
```
TWILIO_ACCOUNT_SID    = ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN     = your_twilio_auth_token
TWILIO_PHONE_NUMBER   = +1xxxxxxxxxx
APP_URL               = https://your-app.vercel.app   ← update after Member 2 deploys
```

---

## M1 — STEP 7: Verify Everything in Supabase
**Time: 5 minutes**

Go through this checklist in the Supabase dashboard:

- [ ] **Table Editor:** All 9 tables visible (trainees, providers, courses, training_records, employers, employment_outcomes, followup_touchpoints, skill_gap_signals, audit_logs)
- [ ] **SQL Editor:** Run `select * from cron.job;` → see the daily scheduler row
- [ ] **Authentication → Providers:** Email = ON, Phone = ON
- [ ] **Edge Functions:** `send-followup` function shows as Deployed
- [ ] **Settings → API:** All 3 keys copied and shared with team

**Member 1's work is now complete. Your database is live.**

---
---

# MEMBER 2 — Next.js & API Routes

---

## M2 — STEP 1: Initialize the Next.js Project
**Time: 15 minutes**

Open your terminal (VS Code terminal is fine):

```bash
# Navigate to where you want the project
cd Desktop

# Create the Next.js app (answer prompts as shown)
npx create-next-app@latest skilltrace

# Prompts — answer exactly like this:
# ✔ Would you like to use TypeScript? → Yes
# ✔ Would you like to use ESLint? → Yes
# ✔ Would you like to use Tailwind CSS? → Yes
# ✔ Would you like to use `src/` directory? → No
# ✔ Would you like to use App Router? → Yes
# ✔ Would you like to customize the default import alias? → No

cd skilltrace
```

Install all dependencies in one command:

```bash
npm install \
  @supabase/supabase-js \
  @supabase/ssr \
  twilio \
  recharts \
  react-leaflet \
  leaflet \
  jspdf \
  canvas-confetti \
  lucide-react \
  clsx \
  tailwind-merge \
  class-variance-authority \
  @radix-ui/react-slot \
  @radix-ui/react-radio-group \
  @radix-ui/react-label \
  @radix-ui/react-dialog \
  @radix-ui/react-checkbox

npm install -D @types/leaflet @types/canvas-confetti
```

Initialize shadcn/ui:

```bash
npx shadcn@latest init

# Prompts — answer like this:
# Which style would you like to use? → Default
# Which color would you like to use as base color? → Slate
# Would you like to use CSS variables? → Yes
```

Install the shadcn components you need:
```bash
npx shadcn@latest add button card input label badge dialog radio-group checkbox table progress
```

**✅ VALIDATION:** Run `npm run dev` → open `http://localhost:3000` → you should see the default Next.js page.

---

## M2 — STEP 2: Create GitHub Repository & Push
**Time: 10 minutes**

```bash
# Initialize git
git init
git add .
git commit -m "Initial commit: Next.js + shadcn setup"

# Go to github.com → New repository
# Name: skilltrace-sih2026
# Private: Yes
# Don't add README (we already have one)
# Copy the remote URL and run:

git remote add origin https://github.com/YOUR_USERNAME/skilltrace-sih2026.git
git branch -M main
git push -u origin main
```

Invite all team members as collaborators:
GitHub → Your repo → Settings → Collaborators → Add by email/username

---

## M2 — STEP 3: Create .env.local
**Time: 5 minutes**

Create `.env.local` in the root of the project (same level as `package.json`):

```bash
# .env.local — DO NOT COMMIT THIS FILE
# Get these values from Member 1's group chat message

NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6...

# These are SECRET — server-side only, never in frontend code
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6...
AADHAAR_SALT=skilltrace_sih2026_maharashtra_salt_v1

# Twilio — set up in M2 Step 4
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_PHONE_NUMBER=+1xxxxxxxxxx

# App URL — update after Vercel deployment
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Verify `.gitignore` already has `.env.local` listed (Next.js adds it by default):
```bash
cat .gitignore | grep env
# Should show: .env.local
```

---

## M2 — STEP 4: Set Up Twilio
**Time: 10 minutes**

1. Go to **https://www.twilio.com** → Sign Up (free)
2. Verify your email → Verify your phone number
3. On the dashboard, copy:
   - **Account SID** → paste into `.env.local` as `TWILIO_ACCOUNT_SID`
   - **Auth Token** → paste into `.env.local` as `TWILIO_AUTH_TOKEN`
4. Click **Get a Trial Phone Number** → Accept the number shown
   - Copy this number → paste into `.env.local` as `TWILIO_PHONE_NUMBER`
5. **Add verified numbers** (Twilio free trial can only send to verified numbers):
   - In Twilio Console → **Verified Caller IDs** → Add your demo phone number
   - Add your demo phone number to this list so you can receive the demo SMS

> ⚠️ The free trial adds "Sent from your Twilio trial account" to every SMS. That is fine for the demo. Judges won't care.

**Share your Twilio credentials with Member 1** so they can add them to Supabase Edge Function environment variables.

---

## M2 — STEP 5: Build the Supabase Client Library
**Time: 5 minutes**

Create `lib/supabase.ts`:

```typescript
// lib/supabase.ts
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// Browser client (for frontend code)
export function createClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// Server client with service role (for API routes only — bypasses RLS)
export function createServiceClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}
```

Create `lib/utils.ts` (needed by shadcn):
```typescript
// lib/utils.ts
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

**Push both files to GitHub immediately** so Team B and C can use the Supabase client.

---

## M2 — STEP 6: Build the Project Folder Structure
**Time: 10 minutes**

Create all the folders and empty placeholder files so Team B and C can start working:

```bash
# Create all app routes
mkdir -p app/trainee/onboard
mkdir -p app/trainee/profile
mkdir -p app/trainee/checkin
mkdir -p app/verify
mkdir -p app/provider/dashboard
mkdir -p app/provider/trainees
mkdir -p app/provider/enroll
mkdir -p app/dashboard/providers
mkdir -p app/dashboard/districts
mkdir -p app/dashboard/cohorts
mkdir -p app/dashboard/gaps
mkdir -p app/dashboard/equity

# Create all API routes
mkdir -p app/api/trainee
mkdir -p app/api/checkin
mkdir -p app/api/verify
mkdir -p app/api/followup/trigger
mkdir -p app/api/analytics

# Create component folders
mkdir -p components/charts
mkdir -p components/map
mkdir -p components/ui

# Create data folder for GeoJSON
mkdir -p data

# Create scripts folder for Team C
mkdir -p scripts
```

Create placeholder page files (so Team B and C can start editing without errors):
```bash
# Create placeholder pages
echo 'export default function Page() { return <div>Trainee Onboard</div> }' > app/trainee/onboard/page.tsx
echo 'export default function Page() { return <div>Profile</div> }' > "app/trainee/profile/[skillId]/page.tsx"
echo 'export default function Page() { return <div>Checkin</div> }' > "app/trainee/checkin/[token]/page.tsx"
echo 'export default function Page() { return <div>Verify</div> }' > "app/verify/[token]/page.tsx"
echo 'export default function Page() { return <div>Dashboard</div> }' > app/dashboard/page.tsx
```

Push to GitHub:
```bash
git add .
git commit -m "Add folder structure and placeholder pages"
git push
```

**Tell Teams B and C to clone the repo now.**

---

## M2 — STEP 7: Build API Route — POST /api/trainee
**Time: 25 minutes**

This creates a new trainee with a hashed Skill ID. It is the first API Team B will call.

Create `app/api/trainee/route.ts`:

```typescript
// app/api/trainee/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      aadhaar_raw,      // Raw Aadhaar number — NEVER STORED
      phone,
      name,
      district,
      gender,
      caste_category,
      dob_year
    } = body

    // Validate required fields
    if (!aadhaar_raw || !phone || !name || !district) {
      return NextResponse.json(
        { error: 'Missing required fields: aadhaar_raw, phone, name, district' },
        { status: 400 }
      )
    }

    // Hash Aadhaar number — this is the core privacy mechanism
    const salt = process.env.AADHAAR_SALT || 'default_salt'
    const skill_id = 'MH-' + crypto
      .createHash('sha256')
      .update(String(aadhaar_raw) + salt)
      .digest('hex')
      .slice(0, 16)
      .toUpperCase()

    const supabase = createServiceClient()

    // Check if trainee already exists (prevents duplicate registration)
    const { data: existing } = await supabase
      .from('trainees')
      .select('skill_id')
      .eq('skill_id', skill_id)
      .single()

    if (existing) {
      return NextResponse.json(
        { error: 'Trainee already registered', skill_id: existing.skill_id },
        { status: 409 }
      )
    }

    // Insert trainee
    const { data, error } = await supabase
      .from('trainees')
      .insert({
        skill_id,
        name_encrypted: name,         // TODO prod: AES-256 encrypt
        phone_encrypted: phone,       // TODO prod: AES-256 encrypt
        district,
        gender,
        caste_category,
        dob_year: dob_year ? parseInt(dob_year) : null,
        consent_given: true,
        consent_at: new Date().toISOString()
      })
      .select('id, skill_id, district, gender, created_at')
      .single()

    if (error) {
      console.error('Insert error:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Log to audit trail
    await supabase.from('audit_logs').insert({
      action: 'trainee.create',
      table_name: 'trainees',
      record_id: data.id,
      metadata: { district, gender, caste_category }
    })

    return NextResponse.json({
      success: true,
      skill_id: data.skill_id,
      id: data.id
    }, { status: 201 })

  } catch (err) {
    console.error('Trainee creation error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET /api/trainee?skill_id=MH-XXXXXX  — fetch trainee profile
export async function GET(request: NextRequest) {
  const skill_id = request.nextUrl.searchParams.get('skill_id')
  if (!skill_id) return NextResponse.json({ error: 'skill_id required' }, { status: 400 })

  const supabase = createServiceClient()

  const { data, error } = await supabase
    .from('trainees')
    .select(`
      id, skill_id, district, gender, caste_category, dob_year,
      consent_given, consent_at, created_at,
      training_records (
        id, enrollment_date, attendance_pct, assessment_score, certification_date,
        courses ( name, sector, duration_days ),
        providers ( name, district )
      ),
      employment_outcomes (
        outcome_type, salary_band, sector, verified_by,
        retained_6m, retained_12m, start_date
      ),
      followup_touchpoints (
        checkpoint_days, status, responded_at
      )
    `)
    .eq('skill_id', skill_id)
    .single()

  if (error || !data) return NextResponse.json({ error: 'Trainee not found' }, { status: 404 })
  return NextResponse.json({ data })
}
```

**✅ TEST THIS NOW:**
```bash
# Start dev server
npm run dev

# In a new terminal, test the POST:
curl -X POST http://localhost:3000/api/trainee \
  -H "Content-Type: application/json" \
  -d '{"aadhaar_raw":"123456789012","phone":"+919876543210","name":"Rahul Kumar","district":"Pune","gender":"Male","caste_category":"OBC","dob_year":"2000"}'

# Expected response:
# {"success":true,"skill_id":"MH-XXXXXXXXXXXXXXXXXX","id":"uuid-here"}
```

Check Supabase Table Editor → `trainees` table → you should see the new row.

---

## M2 — STEP 8: Build API Route — GET/POST /api/checkin/[token]
**Time: 20 minutes**

Create `app/api/checkin/[token]/route.ts`:

```typescript
// app/api/checkin/[token]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

// GET — validate token and return survey info
export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  const supabase = createServiceClient()

  const { data: touchpoint, error } = await supabase
    .from('followup_touchpoints')
    .select(`
      id, checkpoint_days, status, expires_at,
      trainees ( name_encrypted, district )
    `)
    .eq('survey_token', params.token)
    .single()

  if (error || !touchpoint) {
    return NextResponse.json({ error: 'Invalid survey link' }, { status: 404 })
  }

  // Check if already responded
  if (touchpoint.status === 'responded') {
    return NextResponse.json({ error: 'Survey already completed', already_done: true }, { status: 409 })
  }

  // Check if expired
  if (new Date(touchpoint.expires_at) < new Date()) {
    return NextResponse.json({ error: 'Survey link has expired' }, { status: 410 })
  }

  return NextResponse.json({
    checkpoint_days: touchpoint.checkpoint_days,
    trainee_name: (touchpoint.trainees as any)?.name_encrypted,
    district: (touchpoint.trainees as any)?.district
  })
}

// POST — submit survey response
export async function POST(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const body = await request.json()
    const { employed, employer_name, salary_band, sector, reason } = body

    const supabase = createServiceClient()

    // Validate token
    const { data: touchpoint } = await supabase
      .from('followup_touchpoints')
      .select('id, trainee_id, training_record_id, checkpoint_days, status, expires_at')
      .eq('survey_token', params.token)
      .single()

    if (!touchpoint) {
      return NextResponse.json({ error: 'Invalid or expired link' }, { status: 404 })
    }
    if (touchpoint.status === 'responded') {
      return NextResponse.json({ error: 'Already submitted' }, { status: 400 })
    }
    if (new Date(touchpoint.expires_at) < new Date()) {
      return NextResponse.json({ error: 'Link expired' }, { status: 410 })
    }

    // Determine outcome type
    const outcome_type = employed ? 'formal' : (reason ? 'unemployed' : 'searching')

    // Upsert employment outcome
    const { error: outcomeError } = await supabase
      .from('employment_outcomes')
      .upsert({
        trainee_id: touchpoint.trainee_id,
        outcome_type,
        salary_band: employed ? salary_band : null,
        sector: employed ? sector : null,
        non_placement_reason: !employed ? reason : null,
        verified_by: 'self',
        start_date: employed ? new Date().toISOString().split('T')[0] : null
      }, { onConflict: 'trainee_id' })

    if (outcomeError) {
      console.error('Outcome upsert error:', outcomeError)
    }

    // Mark touchpoint as responded
    await supabase
      .from('followup_touchpoints')
      .update({
        status: 'responded',
        response_data: { employed, employer_name, salary_band, sector, reason },
        responded_at: new Date().toISOString()
      })
      .eq('id', touchpoint.id)

    // Log to audit
    await supabase.from('audit_logs').insert({
      action: 'checkin.submit',
      table_name: 'followup_touchpoints',
      record_id: touchpoint.id,
      metadata: { checkpoint_days: touchpoint.checkpoint_days, outcome_type }
    })

    // Determine badge earned
    const badge = touchpoint.checkpoint_days >= 180 ? 'career_achiever'
      : touchpoint.checkpoint_days >= 90 ? 'milestone_reporter'
      : 'starter'

    return NextResponse.json({ success: true, badge, outcome_type })

  } catch (err) {
    console.error('Checkin error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

---

## M2 — STEP 9: Build API Route — POST /api/followup/trigger
**Time: 20 minutes | This is the demo superpower**

Create `app/api/followup/trigger/route.ts`:

```typescript
// app/api/followup/trigger/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import twilio from 'twilio'

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { trainee_id, checkpoint_days = 90 } = body

    if (!trainee_id) {
      return NextResponse.json({ error: 'trainee_id is required' }, { status: 400 })
    }

    const supabase = createServiceClient()

    // Get trainee details
    const { data: trainee, error: traineeError } = await supabase
      .from('trainees')
      .select('id, name_encrypted, phone_encrypted, skill_id')
      .eq('id', trainee_id)
      .single()

    if (traineeError || !trainee) {
      return NextResponse.json({ error: 'Trainee not found' }, { status: 404 })
    }

    // Get training record
    const { data: trainingRecord } = await supabase
      .from('training_records')
      .select('id')
      .eq('trainee_id', trainee_id)
      .order('certification_date', { ascending: false })
      .limit(1)
      .single()

    // Generate unique survey token
    const crypto = await import('crypto')
    const token = crypto.randomUUID()

    // Create touchpoint record
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 30)

    const { data: touchpoint, error: tpError } = await supabase
      .from('followup_touchpoints')
      .insert({
        trainee_id: trainee.id,
        training_record_id: trainingRecord?.id || null,
        checkpoint_days,
        channel: 'sms',
        status: 'sent',
        survey_token: token,
        sent_at: new Date().toISOString(),
        expires_at: expiresAt.toISOString()
      })
      .select('id')
      .single()

    if (tpError) {
      console.error('Touchpoint error:', tpError)
      return NextResponse.json({ error: 'Failed to create touchpoint' }, { status: 500 })
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const surveyUrl = `${appUrl}/trainee/checkin/${token}`

    // Compose message based on checkpoint
    const messages: Record<number, string> = {
      30: `SkillTrace: Hi ${trainee.name_encrypted}! It's been 30 days since your course completion. Are you working? Update your status & earn your Starter Badge: ${surveyUrl}`,
      90: `SkillTrace: Hi ${trainee.name_encrypted}! 90-day milestone! How is your career going? Share your update & unlock your Milestone Badge: ${surveyUrl}`,
      180: `SkillTrace: Hi ${trainee.name_encrypted}! 6-month check-in time! Your progress helps improve training programs. Please update: ${surveyUrl}`,
      365: `SkillTrace: Hi ${trainee.name_encrypted}! 1 year since your training! Complete your annual review & earn your Career Achiever badge: ${surveyUrl}`
    }

    const smsBody = messages[checkpoint_days] || messages[90]

    // Send SMS via Twilio
    let smsSent = false
    let smsError = null

    try {
      const message = await twilioClient.messages.create({
        body: smsBody,
        from: process.env.TWILIO_PHONE_NUMBER!,
        to: trainee.phone_encrypted    // phone_encrypted stores the actual number in demo
      })
      smsSent = true
      console.log('SMS sent, SID:', message.sid)
    } catch (err: any) {
      smsError = err.message
      console.error('SMS failed:', err.message)

      // Mark as bounced if SMS fails
      await supabase
        .from('followup_touchpoints')
        .update({ status: 'bounced' })
        .eq('id', touchpoint.id)
    }

    return NextResponse.json({
      success: smsSent,
      survey_url: surveyUrl,
      token,
      sms_sent: smsSent,
      sms_error: smsError,
      touchpoint_id: touchpoint.id
    })

  } catch (err) {
    console.error('Trigger error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

**✅ TEST THIS:**
First, insert a test trainee via the previous API. Then:
```bash
curl -X POST http://localhost:3000/api/followup/trigger \
  -H "Content-Type: application/json" \
  -d '{"trainee_id":"UUID-FROM-PREVIOUS-TEST","checkpoint_days":90}'

# Expected: {"success":true,"survey_url":"http://localhost:3000/trainee/checkin/UUID","sms_sent":true}
# Check your phone — the SMS should arrive within 10 seconds
```

---

## M2 — STEP 10: Build API Route — POST /api/verify
**Time: 15 minutes**

Create `app/api/verify/route.ts`:

```typescript
// app/api/verify/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

// GET — load verification page data from token
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token')
  if (!token) return NextResponse.json({ error: 'Token required' }, { status: 400 })

  const supabase = createServiceClient()

  // In a real system, employer tokens would be stored in a separate table
  // For demo, we look up by trainee skill_id passed as token
  const { data: outcome } = await supabase
    .from('employment_outcomes')
    .select(`
      id, outcome_type, verified_by, start_date,
      trainees ( name_encrypted, skill_id, district ),
      employers ( name, sector )
    `)
    .eq('id', token)
    .single()

  if (!outcome) return NextResponse.json({ error: 'Verification link invalid' }, { status: 404 })

  return NextResponse.json({
    trainee_name: (outcome.trainees as any)?.name_encrypted,
    employer_name: (outcome.employers as any)?.name,
    start_date: outcome.start_date,
    already_verified: outcome.verified_by !== 'self'
  })
}

// POST — employer confirms employment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { outcome_id, confirmed, employer_name, pf_number } = body

    const supabase = createServiceClient()

    if (!confirmed) {
      // Employer denied — mark as self-reported only
      return NextResponse.json({ success: true, message: 'Response recorded' })
    }

    // Create or update employer record
    let employer_id = null
    if (employer_name) {
      const { data: employer } = await supabase
        .from('employers')
        .upsert({
          name: employer_name,
          pf_registration_no: pf_number || null,
          verified: !!pf_number
        }, { onConflict: 'name' })
        .select('id')
        .single()
      employer_id = employer?.id
    }

    // Update employment outcome to employer-verified
    await supabase
      .from('employment_outcomes')
      .update({
        verified_by: 'employer',
        employer_id
      })
      .eq('id', outcome_id)

    // Log audit
    await supabase.from('audit_logs').insert({
      action: 'employment.employer_verified',
      table_name: 'employment_outcomes',
      record_id: outcome_id,
      metadata: { employer_name, pf_number }
    })

    // Simulate EPFO verification (mock for demo)
    // In production: call EPFO API with pf_number
    const epfo_verified = pf_number && pf_number.length > 5

    if (epfo_verified) {
      await supabase
        .from('employment_outcomes')
        .update({ verified_by: 'epfo' })
        .eq('id', outcome_id)
    }

    return NextResponse.json({
      success: true,
      verified_by: epfo_verified ? 'epfo' : 'employer',
      epfo_checked: true,    // Always true for demo
      epfo_confirmed: epfo_verified
    })

  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

---

## M2 — STEP 11: Build API Route — GET /api/analytics
**Time: 20 minutes | Team C depends on this**

Create `app/api/analytics/route.ts`:

```typescript
// app/api/analytics/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const type = request.nextUrl.searchParams.get('type')
  const supabase = createServiceClient()

  try {
    switch (type) {

      case 'overview': {
        const [traineesRes, outcomesRes, touchpointsRes] = await Promise.all([
          supabase.from('trainees').select('id, district, gender, caste_category', { count: 'exact' }),
          supabase.from('employment_outcomes').select('outcome_type, verified_by, salary_band'),
          supabase.from('followup_touchpoints').select('checkpoint_days, status')
        ])

        const total = traineesRes.count || 0
        const outcomes = outcomesRes.data || []
        const placed = outcomes.filter(o =>
          ['formal','self_employed','gig','apprentice'].includes(o.outcome_type)
        ).length
        const verified = outcomes.filter(o =>
          ['employer','epfo'].includes(o.verified_by)
        ).length
        const female = (traineesRes.data || []).filter(t => t.gender === 'Female').length

        return NextResponse.json({
          total_trainees: total,
          placement_rate: total > 0 ? Math.round((placed / total) * 1000) / 10 : 0,
          verified_employment: verified,
          female_pct: total > 0 ? Math.round((female / total) * 1000) / 10 : 0,
          outcomes_breakdown: outcomes.reduce((acc: any, o) => {
            acc[o.outcome_type] = (acc[o.outcome_type] || 0) + 1
            return acc
          }, {})
        })
      }

      case 'districts': {
        const { data } = await supabase
          .from('district_placement_stats')
          .select('*')
          .order('placement_rate', { ascending: false })
        return NextResponse.json({ data: data || [] })
      }

      case 'providers': {
        const { data } = await supabase
          .from('provider_stats')
          .select('*')
          .order('placement_rate', { ascending: false })
        return NextResponse.json({ data: data || [] })
      }

      case 'cohort': {
        const { data } = await supabase
          .from('cohort_funnel')
          .select('*')
          .single()
        return NextResponse.json({ data: data || {} })
      }

      case 'gaps': {
        const { data } = await supabase
          .from('skill_gap_signals')
          .select('*, courses(name, sector)')
          .order('placement_rate', { ascending: true })
          .limit(20)
        return NextResponse.json({ data: data || [] })
      }

      case 'equity': {
        const { data } = await supabase
          .from('trainees')
          .select('gender, caste_category, district')
        
        const outcomes = await supabase
          .from('employment_outcomes')
          .select('trainee_id, outcome_type')

        return NextResponse.json({ trainees: data || [], outcomes: outcomes.data || [] })
      }

      default:
        return NextResponse.json({ error: 'Unknown analytics type. Use: overview|districts|providers|cohort|gaps|equity' }, { status: 400 })
    }
  } catch (err) {
    console.error('Analytics error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

**✅ TEST ALL ANALYTICS:**
```bash
curl http://localhost:3000/api/analytics?type=overview
curl http://localhost:3000/api/analytics?type=districts
curl http://localhost:3000/api/analytics?type=providers
curl http://localhost:3000/api/analytics?type=cohort
```

After Team C runs the seed script, all these should return rich data.

---

## M2 — STEP 12: Build the Root Layout + Landing Page
**Time: 15 minutes**

Update `app/layout.tsx`:

```typescript
// app/layout.tsx
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "SkillTrace — Maharashtra Skilling Outcomes",
  description: "Longitudinal employment tracking for Maharashtra's skilling programs",
  manifest: "/manifest.json",      // PWA manifest
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
```

Create a minimal `app/page.tsx` (landing page):

```typescript
// app/page.tsx
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { GraduationCap, BarChart3, Building2, Shield } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <div>
          <div className="font-bold text-xl text-orange-600">SkillTrace</div>
          <div className="text-xs text-gray-500">Government of Maharashtra</div>
        </div>
        <div className="text-xs text-gray-400">SIH 2026 | Problem 26135</div>
      </header>

      {/* Hero */}
      <main className="max-w-4xl mx-auto px-6 py-16 text-center">
        <div className="inline-block bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm mb-6">
          Maharashtra State Skills Department
        </div>
        <h1 className="text-4xl font-bold mb-4 text-gray-900">
          From Certificates to <span className="text-orange-600">Livelihoods</span>
        </h1>
        <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
          SkillTrace tracks what happens after training ends — employment, wages, retention, and growth — creating evidence for better policy.
        </p>

        {/* 4 Entry Points */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/trainee/onboard">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-orange-200">
              <CardContent className="pt-6 text-center space-y-2">
                <GraduationCap className="h-8 w-8 text-orange-500 mx-auto" />
                <div className="font-semibold text-sm">I'm a Trainee</div>
                <div className="text-xs text-gray-500">Register & track your career</div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/provider/dashboard">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-blue-200">
              <CardContent className="pt-6 text-center space-y-2">
                <Building2 className="h-8 w-8 text-blue-500 mx-auto" />
                <div className="font-semibold text-sm">Training Center</div>
                <div className="text-xs text-gray-500">Manage trainees & courses</div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-green-200">
              <CardContent className="pt-6 text-center space-y-2">
                <BarChart3 className="h-8 w-8 text-green-500 mx-auto" />
                <div className="font-semibold text-sm">Govt Dashboard</div>
                <div className="text-xs text-gray-500">Analytics & policy insights</div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/verify/demo">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-purple-200">
              <CardContent className="pt-6 text-center space-y-2">
                <Shield className="h-8 w-8 text-purple-500 mx-auto" />
                <div className="font-semibold text-sm">Employer Verify</div>
                <div className="text-xs text-gray-500">Confirm a hire</div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </main>
    </div>
  )
}
```

---

## M2 — STEP 13: Deploy to Vercel
**Time: 10 minutes**

```bash
# Make sure everything builds without errors first
npm run build
# If there are errors, fix them before continuing

# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login
# Opens browser → authenticate with GitHub

# Deploy
vercel --prod
# Follow prompts:
# Set up and deploy? → Y
# Which scope? → your username
# Link to existing project? → N
# Project name? → skilltrace-sih2026
# Directory? → ./  (just press Enter)
# Override settings? → N
```

After deployment, you'll get a URL like `https://skilltrace-sih2026.vercel.app`

**Add environment variables in Vercel dashboard:**
1. Go to `vercel.com` → your project → **Settings** → **Environment Variables**
2. Add ALL variables from your `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY
   SUPABASE_SERVICE_ROLE_KEY
   AADHAAR_SALT
   TWILIO_ACCOUNT_SID
   TWILIO_AUTH_TOKEN
   TWILIO_PHONE_NUMBER
   NEXT_PUBLIC_APP_URL    → set to your Vercel URL
   ```
3. Click **Redeploy** after adding variables

**Share the live URL in the group chat. This is the moment Teams B and C can start mobile testing.**

Also update the `APP_URL` in Supabase Edge Function environment variables to the Vercel URL.

---

## M2 — STEP 14: End-to-End Test Checklist
**Run this test sequence before telling other teams it's ready**

```bash
# Use your live Vercel URL or localhost:3000

BASE_URL="https://your-app.vercel.app"

# 1. Create a trainee
curl -X POST $BASE_URL/api/trainee \
  -H "Content-Type: application/json" \
  -d '{
    "aadhaar_raw": "999988887777",
    "phone": "+91YOURPHONE",
    "name": "Demo Trainee",
    "district": "Pune",
    "gender": "Male",
    "caste_category": "OBC",
    "dob_year": "2000"
  }'
# ✅ Expected: {"success":true,"skill_id":"MH-XXXXXXXXXXXXXXXX","id":"uuid"}
# ✅ Check: Supabase Table Editor → trainees → new row visible

# 2. Save the id from above
TRAINEE_ID="paste-uuid-here"

# 3. Trigger follow-up SMS
curl -X POST $BASE_URL/api/followup/trigger \
  -H "Content-Type: application/json" \
  -d "{\"trainee_id\":\"$TRAINEE_ID\",\"checkpoint_days\":90}"
# ✅ Expected: {"success":true,"survey_url":"...","sms_sent":true}
# ✅ Check: SMS arrives on your phone

# 4. Extract token from survey_url and test the check-in
TOKEN="paste-token-from-survey_url"
curl $BASE_URL/api/checkin/$TOKEN
# ✅ Expected: {"checkpoint_days":90,"trainee_name":"Demo Trainee","district":"Pune"}

# 5. Submit check-in response
curl -X POST $BASE_URL/api/checkin/$TOKEN \
  -H "Content-Type: application/json" \
  -d '{"employed":true,"salary_band":"12000-18000","sector":"IT-ITES"}'
# ✅ Expected: {"success":true,"badge":"milestone_reporter","outcome_type":"formal"}
# ✅ Check: Supabase → followup_touchpoints → status = "responded"
# ✅ Check: Supabase → employment_outcomes → new row with outcome_type="formal"

# 6. Test analytics (after Team C runs seed script)
curl $BASE_URL/api/analytics?type=overview
curl $BASE_URL/api/analytics?type=districts
curl $BASE_URL/api/analytics?type=cohort
```

---

## Team A — Final Checklist Before Handoff

### Member 1 (Supabase)
- [ ] Supabase project created and live
- [ ] All 9 tables created with correct schema
- [ ] All 3 database views created (district_placement_stats, provider_stats, cohort_funnel)
- [ ] Indexes created
- [ ] RLS enabled on sensitive tables
- [ ] pg_cron scheduler configured
- [ ] Edge Function `send-followup` deployed
- [ ] Auth: Email + Phone OTP enabled
- [ ] All credentials shared in group chat
- [ ] Twilio credentials added to Edge Function env vars

### Member 2 (Next.js + APIs)
- [ ] Next.js project initialized with all dependencies
- [ ] GitHub repo created and all team members have access
- [ ] `.env.local` configured with all secrets
- [ ] Twilio account set up + demo phone number verified
- [ ] `lib/supabase.ts` pushed to GitHub
- [ ] All folder structure created and pushed
- [ ] `/api/trainee` — POST creates trainee, GET fetches profile ✅ tested
- [ ] `/api/checkin/[token]` — GET validates, POST submits ✅ tested
- [ ] `/api/followup/trigger` — POST sends real SMS ✅ tested
- [ ] `/api/verify` — POST confirms employer ✅ tested
- [ ] `/api/analytics` — all 6 types working ✅ tested
- [ ] Landing page live at root URL
- [ ] App deployed to Vercel
- [ ] Live Vercel URL shared in group chat
- [ ] APP_URL updated in Supabase Edge Function

---

## What Happens After Team A Is Done

| Team | What They Now Do |
|---|---|
| **Team B** | Connect their forms to the real API routes. Test on mobile using the Vercel URL. |
| **Team C** | Run `seed_data.py` against the live Supabase DB. Then test analytics dashboard. |
| **Team A** | Support Teams B and C. Fix any API bugs they report. Do not go to sleep. |

---

## Common Errors & Fixes

| Error | Fix |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL is not defined` | Check `.env.local` exists and variables start with `NEXT_PUBLIC_` |
| `relation "trainees" does not exist` | Re-run the SQL schema in Supabase SQL Editor |
| `Twilio error: 21608` | The "To" phone number is not verified in Twilio Console → add it to Verified Caller IDs |
| `Cannot find module '@/lib/supabase'` | Check `tsconfig.json` has `"paths": {"@/*": ["./*"]}` |
| `500 Internal Server Error` | Check Vercel function logs: Vercel Dashboard → your project → Functions tab |
| `RLS policy violation` | You're using anon key in a server route. Switch to `createServiceClient()` |
| `CORS error in browser` | API routes are on the same domain (Next.js). If it's CORS, you're calling a wrong URL |
| `npm run build` fails | Run `npm run dev` first and fix all TypeScript errors before building |
