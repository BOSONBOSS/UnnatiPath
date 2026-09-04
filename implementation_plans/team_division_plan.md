# SkillTrace — 3-Team Division Plan
### 6 People. 3 Pairs. Zero Overlap. Zero Gaps.

---

## The Big Picture

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│   TEAM A          TEAM B              TEAM C                    │
│  (2 people)      (2 people)          (2 people)                │
│                                                                 │
│  Backend &       Mobile              Dashboard,                 │
│  Database        Trainee &           Data, NLP                  │
│  Foundation      Employer            & Pitch                    │
│                  Views                                          │
│                                                                 │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                                 │
│  Hours 0–12      Hours 2–10          Hours 3–12                 │
│  (They start     (Starts after       (Starts after              │
│  FIRST and       Team A gives        Team A gives               │
│  unblock         them DB creds)      them DB creds)             │
│  everyone)                                                      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

> **Golden Rule:** Team A is the engine. Teams B and C cannot start coding until Team A completes Hour 0–2 and shares the Supabase credentials + a shared `lib/supabase.ts` file. This is the one critical dependency. Teams B and C should use those 2 hours to plan their components and write static UI.

---

## Team Assignments

| Team | Members | Nickname | Primary Skill Needed |
|---|---|---|---|
| **Team A** | Member 1 + Member 2 | "The Engine" | JavaScript/TypeScript, SQL, APIs |
| **Team B** | Member 3 + Member 4 | "The Face" | React/Next.js, CSS, Mobile UX |
| **Team C** | Member 5 + Member 6 | "The Brain" | Python, Data, Charts, Presenting |

---
---

# TEAM A — "The Engine"
## Backend, Database & Infrastructure
**Members: 1 + 2**

### What Team A Owns
Every other team depends on Team A. You build the database, the API, the messaging, and the deployment. You are the backbone.

**Files Team A owns:**
```
├── app/api/
│   ├── trainee/route.ts          ← You build this
│   ├── checkin/[token]/route.ts  ← You build this
│   ├── verify/route.ts           ← You build this
│   ├── followup/trigger/route.ts ← You build this
│   └── analytics/route.ts        ← You build this
├── lib/
│   ├── supabase.ts               ← You build, everyone uses
│   └── twilio.ts                 ← You build this
└── supabase/                     ← All SQL lives here
    ├── schema.sql
    └── cron.sql
```

---

### MEMBER 1 — Database Architect
**Your entire focus: Supabase**

#### ✅ STEP 1 (Hour 0:00 – 0:30): Supabase Project Setup
1. Go to `supabase.com` → Sign up → Click "New Project"
2. Name: `skilltrace` | Region: Singapore (closest to India) | Generate a strong password
3. Wait 2 minutes for it to spin up
4. Go to **Settings → API** → Copy:
   - `Project URL` → this is `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` public key → this is `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` secret key → this is `SUPABASE_SERVICE_ROLE_KEY`
5. Share all 3 values with the entire team in your group chat RIGHT NOW.

#### ✅ STEP 2 (Hour 0:30 – 1:30): Run the Database Schema
1. In Supabase → Go to **SQL Editor** → New Query
2. Paste and run this entire block:

```sql
create extension if not exists "pgcrypto";

-- Training Providers
create table providers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  district text not null,
  sector text,
  contact_email text,
  contact_phone text,
  created_at timestamptz default now()
);

-- Courses offered by providers
create table courses (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid references providers(id) on delete cascade,
  name text not null,
  sector text not null,
  duration_days int,
  qp_code text,
  created_at timestamptz default now()
);

-- Core trainee identity (privacy-first)
create table trainees (
  id uuid primary key default gen_random_uuid(),
  skill_id text unique not null,
  name_encrypted text not null,
  phone_encrypted text not null,
  district text,
  gender text,
  caste_category text,
  dob_year int,
  consent_given boolean default false,
  consent_at timestamptz,
  created_at timestamptz default now()
);

-- Training enrollment records
create table training_records (
  id uuid primary key default gen_random_uuid(),
  trainee_id uuid references trainees(id) on delete cascade,
  course_id uuid references courses(id),
  provider_id uuid references providers(id),
  enrollment_date date,
  attendance_pct float,
  assessment_score float,
  certification_date date,
  created_at timestamptz default now()
);

-- Employers
create table employers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  pf_registration_no text,
  district text,
  sector text,
  verified boolean default false,
  created_at timestamptz default now()
);

-- Employment outcomes (the core output data)
create table employment_outcomes (
  id uuid primary key default gen_random_uuid(),
  trainee_id uuid references trainees(id) on delete cascade,
  employer_id uuid references employers(id),
  outcome_type text check (outcome_type in
    ('formal','self_employed','gig','apprentice','unemployed','searching')),
  salary_band text,
  sector text,
  start_date date,
  verified_by text default 'self',
  retained_6m boolean,
  retained_12m boolean,
  non_placement_reason text,
  nlp_tags jsonb default '[]',
  created_at timestamptz default now()
);

-- Follow-up touchpoints (every SMS/WhatsApp sent)
create table followup_touchpoints (
  id uuid primary key default gen_random_uuid(),
  trainee_id uuid references trainees(id) on delete cascade,
  training_record_id uuid references training_records(id),
  checkpoint_days int check (checkpoint_days in (30, 90, 180, 365)),
  channel text default 'sms',
  status text default 'pending',
  survey_token text unique default gen_random_uuid()::text,
  response_data jsonb,
  sent_at timestamptz,
  responded_at timestamptz,
  created_at timestamptz default now()
);

-- Computed analytics (written by Python NLP script)
create table skill_gap_signals (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references courses(id),
  district text,
  placement_rate float,
  avg_days_to_placement int,
  non_placement_reasons jsonb,
  employer_demand_score float,
  computed_at timestamptz default now()
);

-- Audit trail
create table audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid,
  action text,
  table_name text,
  record_id uuid,
  metadata jsonb,
  created_at timestamptz default now()
);

-- Enable Row Level Security
alter table trainees enable row level security;
alter table training_records enable row level security;
alter table employment_outcomes enable row level security;
alter table followup_touchpoints enable row level security;

-- Basic RLS policies (expand as needed)
create policy "Public read on providers" on providers for select using (true);
create policy "Public read on courses" on courses for select using (true);
```

3. Go to **Authentication → Providers** → Enable **Phone** (OTP)
4. Tell Team B and Team C: "Database is ready. Here are the credentials."

#### ✅ STEP 3 (Hour 1:30 – 2:00): Shared Supabase Client
Create `lib/supabase.ts` — this file is used by EVERYONE. Push it to GitHub immediately.

```typescript
// lib/supabase.ts
import { createBrowserClient, createServerClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

#### ✅ STEP 4 (Hour 2:00 – 4:00): Analytics API Route
Team C needs this to fetch data for the dashboard.

```typescript
// app/api/analytics/route.ts
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type')

  if (type === 'overview') {
    const [trainees, outcomes, training] = await Promise.all([
      supabase.from('trainees').select('id', { count: 'exact' }),
      supabase.from('employment_outcomes').select('outcome_type, salary_band, district, verified_by'),
      supabase.from('training_records').select('district, certification_date')
    ])
    return Response.json({ trainees: trainees.count, outcomes: outcomes.data, training: training.data })
  }

  if (type === 'districts') {
    const { data } = await supabase
      .from('employment_outcomes')
      .select('district, outcome_type, trainees(district)')
    return Response.json({ data })
  }

  if (type === 'cohort') {
    const { data } = await supabase
      .from('training_records')
      .select('*, trainees(*), employment_outcomes(*), followup_touchpoints(*)')
      .limit(200)
    return Response.json({ data })
  }

  if (type === 'providers') {
    const { data } = await supabase
      .from('providers')
      .select('*, training_records(*, employment_outcomes(outcome_type, verified_by, retained_6m))')
    return Response.json({ data })
  }

  return Response.json({ error: 'Unknown type' }, { status: 400 })
}
```

#### ✅ STEP 5 (Hour 4:00 – 6:00): Cron + Scheduler
Set up the automated follow-up scheduler in Supabase SQL Editor:

```sql
-- Enable pg_cron extension
create extension if not exists pg_cron;

-- Schedule: every day at 9 AM IST (3:30 AM UTC)
-- This inserts pending touchpoints for due trainees
select cron.schedule(
  'daily-followup',
  '30 3 * * *',
  $$
    insert into followup_touchpoints 
      (trainee_id, training_record_id, checkpoint_days, status)
    select 
      tr.trainee_id,
      tr.id,
      d.days,
      'pending'
    from training_records tr
    cross join (values (30),(90),(180),(365)) as d(days)
    where 
      tr.certification_date = current_date - (d.days || ' days')::interval
      and not exists (
        select 1 from followup_touchpoints ft
        where ft.training_record_id = tr.id
          and ft.checkpoint_days = d.days
      );
  $$
);
```

---

### MEMBER 2 — API & Integration Developer
**Your entire focus: API Routes + Twilio SMS**

#### ✅ STEP 1 (Hour 0:00 – 0:30): Project Initialization
While Member 1 sets up Supabase, you initialize the Next.js project:

```bash
npx create-next-app@latest skilltrace --typescript --tailwind --app --src-dir=false
cd skilltrace
npx shadcn-ui@latest init
# When prompted: Default style=Default, BaseColor=Slate, CSS variables=Yes
npm install @supabase/ssr @supabase/supabase-js twilio recharts react-leaflet leaflet jspdf
npm install -D @types/leaflet
```

Push this to GitHub. Everyone clones it.

#### ✅ STEP 2 (Hour 0:30 – 1:00): Twilio Setup
1. Go to `twilio.com` → Sign up for free trial
2. Get: Account SID, Auth Token, Phone Number
3. Verify your demo phone number in Twilio console (required for free trial)
4. Create `lib/twilio.ts`:

```typescript
// lib/twilio.ts
import twilio from 'twilio'

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
)

export async function sendSMS(to: string, body: string) {
  try {
    const msg = await client.messages.create({
      body,
      from: process.env.TWILIO_PHONE_NUMBER,
      to
    })
    return { success: true, sid: msg.sid }
  } catch (err) {
    console.error('SMS failed:', err)
    return { success: false }
  }
}
```

#### ✅ STEP 3 (Hour 1:00 – 3:00): Trainee Registration API
```typescript
// app/api/trainee/route.ts
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  const body = await request.json()
  const { aadhaar_raw, phone, name, district, gender, caste, dob_year } = body

  // HASH AADHAAR — raw number never stored
  const skill_id = 'MH-' + crypto
    .createHash('sha256')
    .update(aadhaar_raw + process.env.AADHAAR_SALT!)
    .digest('hex')
    .slice(0, 16)
    .toUpperCase()

  // Insert trainee
  const { data, error } = await supabase.from('trainees').insert({
    skill_id,
    name_encrypted: name,        // TODO: AES encrypt in production
    phone_encrypted: phone,      // TODO: AES encrypt in production
    district, gender,
    caste_category: caste,
    dob_year,
    consent_given: true,
    consent_at: new Date().toISOString()
  }).select().single()

  if (error) return Response.json({ error: error.message }, { status: 400 })
  return Response.json({ skill_id: data.skill_id, id: data.id })
}
```

#### ✅ STEP 4 (Hour 3:00 – 5:00): Follow-up Trigger API (Demo Superpower)
This is the most important API for the demo. It lets you manually fire an SMS to show judges.

```typescript
// app/api/followup/trigger/route.ts
import { createClient } from '@supabase/supabase-js'
import { sendSMS } from '@/lib/twilio'
import crypto from 'crypto'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  const { trainee_id, checkpoint_days } = await request.json()

  // Get trainee phone
  const { data: trainee } = await supabase
    .from('trainees')
    .select('phone_encrypted, name_encrypted')
    .eq('id', trainee_id)
    .single()

  if (!trainee) return Response.json({ error: 'Trainee not found' }, { status: 404 })

  // Generate one-time survey token
  const token = crypto.randomUUID()

  // Save touchpoint
  await supabase.from('followup_touchpoints').insert({
    trainee_id,
    checkpoint_days,
    survey_token: token,
    status: 'sent',
    sent_at: new Date().toISOString()
  })

  // Send SMS
  const appUrl = process.env.NEXT_PUBLIC_APP_URL
  const message = `SkillTrace: Hi ${trainee.name_encrypted}! It's been ${checkpoint_days} days since your course. Please update your employment status: ${appUrl}/trainee/checkin/${token}`

  await sendSMS(trainee.phone_encrypted, message)

  return Response.json({ success: true, token, survey_url: `${appUrl}/trainee/checkin/${token}` })
}
```

#### ✅ STEP 5 (Hour 5:00 – 7:00): Check-in Submit + Employer Verify APIs

```typescript
// app/api/checkin/[token]/route.ts
export async function POST(request: Request, { params }: { params: { token: string } }) {
  const { employed, employer_name, salary_band, reason } = await request.json()

  // Validate token
  const { data: touchpoint } = await supabase
    .from('followup_touchpoints')
    .select('*')
    .eq('survey_token', params.token)
    .single()

  if (!touchpoint) return Response.json({ error: 'Invalid or expired link' }, { status: 404 })
  if (touchpoint.responded_at) return Response.json({ error: 'Already submitted' }, { status: 400 })

  const outcome_type = employed ? 'formal' : 'searching'

  // Upsert employment outcome
  await supabase.from('employment_outcomes').upsert({
    trainee_id: touchpoint.trainee_id,
    outcome_type,
    salary_band: salary_band || null,
    non_placement_reason: reason || null,
    verified_by: 'self'
  })

  // Mark touchpoint as responded
  await supabase.from('followup_touchpoints').update({
    status: 'responded',
    response_data: { employed, employer_name, salary_band, reason },
    responded_at: new Date().toISOString()
  }).eq('id', touchpoint.id)

  return Response.json({ success: true, badge: checkpoint_days >= 90 ? 'skill_achiever' : 'starter' })
}
```

#### ✅ STEP 6 (Hour 7:00 – 9:00): Deploy to Vercel
```bash
npm install -g vercel
vercel login
vercel --prod
# Add all env variables in Vercel dashboard → Settings → Environment Variables
```

Share the live URL with the entire team.

---
---

# TEAM B — "The Face"
## Mobile Trainee + Employer Frontend
**Members: 3 + 4**

### What Team B Owns
You build everything the trainee and employer see. This is what runs on a mobile phone. It must be fast, simple, and work on a cheap Android.

**Files Team B owns:**
```
├── app/
│   ├── page.tsx                       ← Landing page
│   ├── trainee/
│   │   ├── onboard/page.tsx           ← Trainee registration
│   │   ├── profile/[skillId]/page.tsx ← Trainee profile + badges
│   │   └── checkin/[token]/page.tsx   ← Follow-up survey (SMS link)
│   └── verify/[token]/page.tsx        ← Employer verification
└── components/
    ├── TraineeBadge.tsx
    ├── ConsentForm.tsx
    ├── CheckinForm.tsx
    └── VerificationBadge.tsx
```

> **Wait for Team A** to share `lib/supabase.ts` before writing any database calls. Use these first 2 hours to write static HTML/JSX with hardcoded data.

---

### MEMBER 3 — Trainee Onboarding & Profile
**Your focus: Registration + Profile Page**

#### ✅ STEP 1 (Hour 0:00 – 2:00): Write Static UI (No DB needed yet)
Build the visual shell of all your pages with hardcoded data. Don't wait for APIs.

**Trainee Onboarding Page** (`app/trainee/onboard/page.tsx`):
- Step 1: Phone number input + OTP
- Step 2: Fill personal details (name, district, gender, caste category)
- Step 3: Aadhaar number input with a note: *"Your Aadhaar number is hashed using SHA-256 before leaving your device. It is never stored."*
- Step 4: Consent checkbox: *"I agree to follow-up contacts for 12 months for employment tracking."*
- Step 5: Success screen showing Skill ID (e.g., `MH-A3F8BC91D2E4F5A6`)

```tsx
// app/trainee/onboard/page.tsx - Static version first
"use client"
import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Shield, Lock } from 'lucide-react'

const steps = ['Phone Verification', 'Personal Details', 'Privacy & Consent', 'Done']

export default function OnboardPage() {
  const [step, setStep] = useState(0)
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white p-4">
      <div className="max-w-md mx-auto">
        {/* Maharashtra Govt Header */}
        <div className="text-center mb-6">
          <div className="text-2xl font-bold text-orange-600">SkillTrace</div>
          <div className="text-sm text-gray-500">Maharashtra Skills Department</div>
        </div>
        
        {/* Progress Indicator */}
        <div className="flex justify-between mb-6">
          {steps.map((s, i) => (
            <div key={i} className={`flex-1 h-1 mx-1 rounded ${i <= step ? 'bg-orange-500' : 'bg-gray-200'}`} />
          ))}
        </div>

        {/* Step 0: Phone */}
        {step === 0 && (
          <Card>
            <CardHeader><CardTitle>Enter Your Phone Number</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <Input placeholder="+91 XXXXX XXXXX" value={phone} onChange={e => setPhone(e.target.value)} />
              <Button className="w-full bg-orange-500" onClick={() => setStep(1)}>
                Send OTP
              </Button>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Lock className="h-3 w-3" />
                Your number is encrypted and never shared publicly
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Step 3: Success */}
        {step === 3 && (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="text-center pt-6 space-y-4">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
              <div className="font-bold text-xl">Welcome to SkillTrace!</div>
              <div className="bg-white border rounded-lg p-4">
                <div className="text-xs text-gray-500 mb-1">Your Skill ID</div>
                <div className="font-mono font-bold text-lg text-orange-600">MH-A3F8BC91D2E4</div>
              </div>
              <p className="text-sm text-gray-600">You will receive SMS updates at your check-in milestones.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
```

#### ✅ STEP 2 (Hour 2:00 – 4:00): Connect Onboarding to Team A's API
Replace hardcoded actions with real API calls:

```tsx
// Inside onboard/page.tsx — the submit handler
const handleSubmit = async () => {
  const res = await fetch('/api/trainee', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      aadhaar_raw: aadhaarInput,   // Hashed in API route
      phone, name, district, gender, caste, dob_year: parseInt(dob)
    })
  })
  const data = await res.json()
  if (data.skill_id) {
    setSkillId(data.skill_id)
    setStep(3)  // Show success screen
  }
}
```

#### ✅ STEP 3 (Hour 4:00 – 7:00): Trainee Profile Page
This is what the trainee sees if they bookmark their profile link.

`app/trainee/profile/[skillId]/page.tsx`:
- Header: Name, Skill ID, District
- **Progress Timeline:** Enrolled → Certified → 30d Check-in → 90d → 180d → 365d (visual stepper)
- **Badge Wall:** Starter (registration) → Milestone Reporter (30d) → Career Achiever (90d) → Retained Worker (1 year)
- **Training History:** Card showing course name, provider, certification date, score
- **Employment Status:** Current status with verification badge (Self-reported / Employer Verified / EPFO Verified)

```tsx
// Badge component
// components/TraineeBadge.tsx
interface BadgeProps {
  name: string
  earned: boolean
  description: string
  icon: string
}

export function TraineeBadge({ name, earned, description, icon }: BadgeProps) {
  return (
    <div className={`flex flex-col items-center p-3 rounded-xl border-2 
      ${earned ? 'border-orange-400 bg-orange-50' : 'border-gray-200 bg-gray-50 opacity-50'}`}>
      <div className="text-3xl mb-1">{icon}</div>
      <div className="text-xs font-bold text-center">{name}</div>
      <div className="text-xs text-gray-500 text-center">{description}</div>
      {earned && <div className="text-xs text-green-600 mt-1">✓ Earned</div>}
    </div>
  )
}
```

---

### MEMBER 4 — Check-in Form + Employer Verification
**Your focus: The 2 most important interactive flows**

#### ✅ STEP 1 (Hour 0:00 – 2:00): Static UI shells
Write the visual structure without any API connections first.

#### ✅ STEP 2 (Hour 2:00 – 5:00): The Check-in Survey Page
This is the page that opens when a trainee clicks the SMS link. It is THE most critical page. It must work perfectly on a cheap Android.

`app/trainee/checkin/[token]/page.tsx`:

```tsx
"use client"
import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import confetti from 'canvas-confetti'   // npm install canvas-confetti

export default function CheckinPage({ params }: { params: { token: string } }) {
  const [step, setStep] = useState<'survey' | 'success' | 'invalid'>('survey')
  const [employed, setEmployed] = useState<boolean | null>(null)
  const [salaryBand, setSalaryBand] = useState('')
  const [reason, setReason] = useState('')

  const handleSubmit = async () => {
    const res = await fetch(`/api/checkin/${params.token}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ employed, salary_band: salaryBand, reason })
    })
    if (res.ok) {
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } })
      setStep('success')
    }
  }

  if (step === 'success') return (
    <div className="min-h-screen flex items-center justify-center bg-green-50 p-4">
      <div className="text-center space-y-4">
        <div className="text-6xl">🏆</div>
        <div className="text-2xl font-bold text-green-700">Badge Unlocked!</div>
        <div className="text-gray-600">Thank you for updating your status. Keep growing!</div>
        <div className="bg-orange-100 border border-orange-300 rounded-xl p-4">
          <div className="text-sm font-bold text-orange-700">Milestone Reporter Badge</div>
          <div className="text-xs text-gray-600">You've completed your 90-day check-in</div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-white p-4">
      <div className="max-w-sm mx-auto space-y-6">
        <div className="text-center">
          <div className="text-orange-600 font-bold text-xl">SkillTrace Check-in</div>
          <div className="text-gray-500 text-sm">90-Day Milestone</div>
        </div>

        {/* Question 1 */}
        <div className="space-y-3">
          <div className="font-medium">Are you currently employed?</div>
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant={employed === true ? 'default' : 'outline'}
              className={employed === true ? 'bg-green-500' : ''}
              onClick={() => setEmployed(true)}
            >✅ Yes, I'm working</Button>
            <Button
              variant={employed === false ? 'default' : 'outline'}
              className={employed === false ? 'bg-red-400' : ''}
              onClick={() => setEmployed(false)}
            >🔍 Still searching</Button>
          </div>
        </div>

        {/* Question 2: conditional on employment */}
        {employed === true && (
          <div className="space-y-3">
            <div className="font-medium">What is your monthly salary range?</div>
            <RadioGroup value={salaryBand} onValueChange={setSalaryBand}>
              {['Below ₹8,000', '₹8,000–₹12,000', '₹12,000–₹18,000', '₹18,000–₹25,000', 'Above ₹25,000'].map(band => (
                <div key={band} className="flex items-center space-x-2">
                  <RadioGroupItem value={band} id={band} />
                  <Label htmlFor={band}>{band}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        )}

        {employed === false && (
          <div className="space-y-3">
            <div className="font-medium">What is the main reason?</div>
            <RadioGroup value={reason} onValueChange={setReason}>
              {['No jobs in my area', 'Salary offered was too low', 'Skill mismatch', 'Family responsibilities', 'Health issues', 'Other'].map(r => (
                <div key={r} className="flex items-center space-x-2">
                  <RadioGroupItem value={r} id={r} />
                  <Label htmlFor={r}>{r}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        )}

        {employed !== null && (
          <Button className="w-full bg-orange-500 text-white" size="lg" onClick={handleSubmit}>
            Submit & Unlock Badge 🏆
          </Button>
        )}
      </div>
    </div>
  )
}
```

#### ✅ STEP 3 (Hour 5:00 – 8:00): Employer Verification Page
`app/verify/[token]/page.tsx`:

```tsx
"use client"
import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function VerifyPage({ params }: { params: { token: string } }) {
  const [step, setStep] = useState<'confirm' | 'otp' | 'done' | 'epfo'>('confirm')
  const [otp, setOtp] = useState('')

  // Trainee info (fetched from DB using token in real impl)
  const trainee = { name: "Rahul Kumar", course: "CNC Operator", date: "15 Aug 2026" }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-6 max-w-sm w-full space-y-5">
        
        {step === 'confirm' && (<>
          <div className="text-center">
            <div className="text-2xl font-bold">SkillTrace</div>
            <div className="text-sm text-gray-500">Employer Verification Portal</div>
          </div>
          <div className="bg-blue-50 rounded-xl p-4">
            <div className="text-sm text-gray-600">Did the following person join your organization?</div>
            <div className="font-bold text-lg mt-2">{trainee.name}</div>
            <div className="text-sm text-gray-500">{trainee.course} | Joined: {trainee.date}</div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Button className="bg-green-500" onClick={() => setStep('otp')}>✅ Yes, Confirmed</Button>
            <Button variant="outline" className="text-red-500 border-red-300">❌ No</Button>
          </div>
        </>)}

        {step === 'otp' && (<>
          <div className="font-bold text-center">Verify Your Identity</div>
          <div className="text-sm text-gray-500 text-center">Enter the OTP sent to your registered mobile</div>
          <Input placeholder="Enter 6-digit OTP" value={otp} onChange={e => setOtp(e.target.value)} className="text-center text-xl tracking-widest" maxLength={6} />
          <Button className="w-full bg-blue-600" onClick={() => setStep('epfo')}>Verify OTP</Button>
        </>)}

        {step === 'epfo' && (<>
          <div className="text-center space-y-3">
            <div className="animate-spin text-4xl">⚙️</div>
            <div className="font-medium">Cross-checking EPFO Database...</div>
            <div className="text-sm text-gray-500">Validating PF registration</div>
          </div>
          {/* Auto-advance to done after 2.5 seconds */}
          {setTimeout(() => setStep('done'), 2500) && null}
        </>)}

        {step === 'done' && (<>
          <div className="text-center space-y-4">
            <div className="text-5xl">✅</div>
            <div className="font-bold text-xl text-green-700">Verification Complete!</div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm">
              Employment confirmed and validated against EPFO records.
              <span className="text-xs text-gray-400 block mt-1">*(EPFO check mocked for demo)*</span>
            </div>
          </div>
        </>)}

      </div>
    </div>
  )
}
```

---
---

# TEAM C — "The Brain"
## Dashboard, Data, NLP & Pitch
**Members: 5 + 6**

### What Team C Owns
You make the judges' jaws drop. The government dashboard is the final "wow" moment of the demo. You also own the pitch deck and the data that makes everything look real.

**Files Team C owns:**
```
├── app/dashboard/
│   ├── page.tsx          ← State KPI overview
│   ├── providers/page.tsx
│   ├── districts/page.tsx  ← Leaflet heatmap
│   ├── cohorts/page.tsx    ← Cohort funnel
│   └── gaps/page.tsx       ← Skill gap analysis
├── components/charts/
│   ├── CohortFunnel.tsx
│   ├── PlacementByDistrict.tsx
│   ├── ProviderLeaderboard.tsx
│   ├── SkillGapBubble.tsx
│   └── EquityBreakdown.tsx
├── components/map/
│   └── DistrictHeatmap.tsx
├── scripts/
│   ├── seed_data.py
│   └── nlp_analysis.py
└── data/
    └── maharashtra-districts.json   ← GeoJSON for map
```

---

### MEMBER 5 — Data Engineer + NLP
**Your focus: Seed data, Python NLP, and feeding the dashboard real-looking data**

#### ✅ STEP 1 (Hour 0:00 – 2:00): Download GeoJSON + Write Seed Script
You don't need Supabase yet. Download the Maharashtra GeoJSON map data first.

```bash
# Download Maharashtra district boundaries
# Go to: https://github.com/datameet/maps/blob/master/Districts/Maharashtra.geojson
# Download and save to: data/maharashtra-districts.json
```

Then write the seed script (run it once Team A finishes the schema):

```python
# scripts/seed_data.py
import os, hashlib, random, json
from datetime import date, timedelta
from supabase import create_client

SUPABASE_URL = os.environ["SUPABASE_URL"]
SUPABASE_KEY = os.environ["SUPABASE_SERVICE_ROLE_KEY"]
sb = create_client(SUPABASE_URL, SUPABASE_KEY)

DISTRICTS = ["Pune", "Mumbai", "Nashik", "Nagpur", "Aurangabad",
             "Gadchiroli", "Kolhapur", "Solapur", "Amravati", "Thane",
             "Jalgaon", "Nanded", "Satara", "Sangli", "Ratnagiri"]

SECTORS = ["Construction", "Healthcare", "IT-ITES", "Agriculture",
           "Retail", "Manufacturing", "Logistics", "Beauty & Wellness",
           "Electrician", "Plumbing"]

NON_PLACEMENT_REASONS = [
    "No jobs available in my area",
    "Salary offered was too low",
    "Skill mismatch with job requirements",
    "Family responsibilities prevented me from working",
    "Still actively searching for jobs",
    "Health issues prevented me from working",
    "Employer asked for experience I don't have"
]

# --- Seed Providers ---
providers_data = [{"name": f"{d} Skill Development Center", "district": d,
                   "sector": random.choice(SECTORS),
                   "contact_email": f"admin@{d.lower().replace(' ','')}sdc.mh"}
                  for d in DISTRICTS[:8]]
sb.table("providers").insert(providers_data).execute()
provider_ids = [r["id"] for r in sb.table("providers").select("id").execute().data]

# --- Seed Courses ---
courses_data = []
for pid in provider_ids:
    for sector in random.sample(SECTORS, 2):
        courses_data.append({"provider_id": pid, "name": f"{sector} Foundation Course",
                              "sector": sector, "duration_days": random.choice([30,45,60,90]),
                              "qp_code": f"MH/{sector[:3].upper()}/Q{random.randint(100,999)}"})
sb.table("courses").insert(courses_data).execute()
course_ids = [r["id"] for r in sb.table("courses").select("id").execute().data]

# --- Seed 150 Trainees ---
trainees_data = []
for i in range(150):
    district = random.choice(DISTRICTS)
    skill_id = "MH-" + hashlib.sha256(f"TRAINEE{i}DEMO".encode()).hexdigest()[:16].upper()
    trainees_data.append({
        "skill_id": skill_id,
        "name_encrypted": f"Trainee {i+1:03d}",
        "phone_encrypted": f"+919{random.randint(100000000, 999999999)}",
        "district": district,
        "gender": random.choice(["Male", "Female", "Other"]),
        "caste_category": random.choices(["General","OBC","SC","ST"], weights=[40,30,20,10])[0],
        "dob_year": random.randint(1995, 2004),
        "consent_given": True,
        "consent_at": (date.today() - timedelta(days=random.randint(100,500))).isoformat()
    })
resp = sb.table("trainees").insert(trainees_data).execute()
trainee_ids = [r["id"] for r in resp.data]

# --- Seed Training Records ---
tr_data = []
for tid in trainee_ids:
    cert_date = date.today() - timedelta(days=random.randint(30, 450))
    tr_data.append({
        "trainee_id": tid,
        "course_id": random.choice(course_ids),
        "provider_id": random.choice(provider_ids),
        "enrollment_date": (cert_date - timedelta(days=60)).isoformat(),
        "attendance_pct": round(random.uniform(60, 100), 1),
        "assessment_score": round(random.uniform(45, 100), 1),
        "certification_date": cert_date.isoformat()
    })
sb.table("training_records").insert(tr_data).execute()

# --- Seed Employment Outcomes (65% placement) ---
outcome_data = []
for tid in trainee_ids:
    if random.random() < 0.65:
        outcome_data.append({
            "trainee_id": tid,
            "outcome_type": random.choices(
                ["formal","self_employed","gig","apprentice"],
                weights=[50, 25, 15, 10])[0],
            "salary_band": random.choice(["8000-12000","12000-18000","18000-25000","25000+"]),
            "sector": random.choice(SECTORS),
            "verified_by": random.choices(["self","employer","epfo"], weights=[60,30,10])[0],
            "retained_6m": random.random() > 0.25,
            "retained_12m": random.random() > 0.4
        })
    else:
        outcome_data.append({
            "trainee_id": tid,
            "outcome_type": random.choice(["unemployed","searching"]),
            "non_placement_reason": random.choice(NON_PLACEMENT_REASONS)
        })
sb.table("employment_outcomes").insert(outcome_data).execute()
print("✅ Seeded: 8 providers, 16 courses, 150 trainees, outcomes complete")
```

Run it: `python scripts/seed_data.py`

#### ✅ STEP 2 (Hour 2:00 – 5:00): NLP Analysis Script
```python
# scripts/nlp_analysis.py
import os, json
from supabase import create_client
from collections import Counter

sb = create_client(os.environ["SUPABASE_URL"], os.environ["SUPABASE_SERVICE_ROLE_KEY"])

TAGS = {
    "location_mismatch": ["area", "location", "far", "commute", "city", "relocate", "distance"],
    "salary_too_low": ["salary", "pay", "wage", "low", "money", "income", "compensation"],
    "skill_mismatch": ["skill", "mismatch", "different", "qualification", "experience", "requirement"],
    "family_barriers": ["family", "marriage", "personal", "mother", "father", "child", "responsibilities"],
    "still_searching": ["searching", "looking", "still", "waiting", "interview", "actively"],
    "health_issues": ["health", "sick", "illness", "accident", "disabled", "medical"]
}

def tag_reason(text: str) -> list:
    if not text: return ["other"]
    text_lower = text.lower()
    tags = [tag for tag, kws in TAGS.items() if any(kw in text_lower for kw in kws)]
    return tags if tags else ["other"]

# Fetch all non-placement outcomes
outcomes = sb.table("employment_outcomes")\
    .select("id, non_placement_reason")\
    .in_("outcome_type", ["unemployed", "searching"])\
    .execute().data

for o in outcomes:
    tags = tag_reason(o.get("non_placement_reason"))
    sb.table("employment_outcomes").update({"nlp_tags": tags}).eq("id", o["id"]).execute()

print("✅ NLP tagging complete")
```

#### ✅ STEP 3 (Hour 5:00 – 8:00): Feed Dashboard with Computed Data
Write aggregation queries and insert into `skill_gap_signals`:

```python
# Compute skill gap signals per district per course
training = sb.table("training_records").select("*, courses(sector), trainees(district)").execute().data
outcomes = sb.table("employment_outcomes").select("*").execute().data

# Group outcomes by district
# Compute placement rates
# Insert into skill_gap_signals table
# ... (aggregate logic) ...
```

---

### MEMBER 6 — Dashboard Frontend + Pitch Lead
**Your focus: The government dashboard UI + the presentation**

#### ✅ STEP 1 (Hour 0:00 – 3:00): State Overview Dashboard
`app/dashboard/page.tsx`:

6 KPI cards at the top, then 3 charts below.

```tsx
// KPI Cards
const kpis = [
  { label: "Total Trainees", value: "1,24,830", icon: "👥", trend: "+12%" },
  { label: "Certified This Year", value: "89,420", icon: "🎓", trend: "+8%" },
  { label: "Placement Rate", value: "64.3%", icon: "💼", trend: "+5.2%" },
  { label: "Employer Verified", value: "38,900", icon: "✅", trend: "+22%" },
  { label: "Avg. Salary", value: "₹13,400/mo", icon: "💰", trend: "+9%" },
  { label: "Female Trainees", value: "43.2%", icon: "♀️", trend: "+3%" },
]

// Charts to build (use Recharts):
// 1. Line chart: Placement rate over 12 months
// 2. Bar chart: Placement rate by sector (top 10 sectors)
// 3. Pie chart: Employment type breakdown (Formal / Self / Gig / Unemployed)
```

#### ✅ STEP 2 (Hour 3:00 – 6:00): Cohort Funnel + Provider Leaderboard

**Cohort Funnel** (`app/dashboard/cohorts/page.tsx`):
This is the "longitudinal" proof. Shows the dropout funnel.

```tsx
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const cohortData = [
  { stage: 'Enrolled', count: 500, pct: 100 },
  { stage: 'Certified', count: 412, pct: 82 },
  { stage: '30d Check-in', count: 380, pct: 76 },
  { stage: 'Placed (90d)', count: 298, pct: 60 },
  { stage: 'Retained 6m', count: 241, pct: 48 },
  { stage: 'Retained 12m', count: 198, pct: 40 },
]

// Use Recharts AreaChart with this data
// Color it: orange → green gradient
```

**Provider Leaderboard** — sortable table with columns:
`Rank | Provider Name | District | Trainees | Placement % | Verified % | Score`

Color code the score: Green (80+) / Yellow (60–79) / Red (<60)

#### ✅ STEP 3 (Hour 6:00 – 8:00): District Heatmap
```tsx
// components/map/DistrictHeatmap.tsx
"use client"
import dynamic from 'next/dynamic'

// Must be dynamically imported — Leaflet breaks with Next.js SSR
const MapWithNoSSR = dynamic(() => import('./MapInner'), { ssr: false })
export default function DistrictHeatmap({ data }) { return <MapWithNoSSR data={data} /> }

// components/map/MapInner.tsx
import { MapContainer, TileLayer, GeoJSON, Tooltip } from 'react-leaflet'
import maharashtraData from '@/data/maharashtra-districts.json'

const placementByDistrict = {
  "Pune": 78, "Mumbai": 82, "Nashik": 65, "Nagpur": 71,
  "Aurangabad": 58, "Gadchiroli": 29, "Kolhapur": 73,
  "Solapur": 51, "Amravati": 44, "Thane": 69
}

const getColor = (rate: number) => {
  if (rate >= 75) return '#1a7c3f'
  if (rate >= 60) return '#52b788'
  if (rate >= 45) return '#f4a261'
  return '#e63946'
}

export default function MapInner() {
  const style = (feature: any) => ({
    fillColor: getColor(placementByDistrict[feature.properties.NAME_2] || 35),
    weight: 1.5, color: '#fff', fillOpacity: 0.85
  })
  return (
    <MapContainer center={[19.7515, 75.7139]} zoom={6.5} style={{ height: '500px', borderRadius: '12px' }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="OpenStreetMap" />
      <GeoJSON data={maharashtraData as any} style={style}
        onEachFeature={(feature, layer) => {
          const rate = placementByDistrict[feature.properties.NAME_2] || 35
          layer.bindTooltip(`${feature.properties.NAME_2}: ${rate}% placement`, { sticky: true })
        }}
      />
    </MapContainer>
  )
}
```

#### ✅ STEP 4 (Hour 8:00 – 12:00): The Pitch Deck
Build 8 slides in Canva or Google Slides (free):

| Slide | Title | Content |
|---|---|---|
| 1 | The Problem | "Maharashtra certified 50 lakh trainees last year. Nobody knows if any of them kept their jobs." |
| 2 | The Gap | Input vs Output data diagram. Enrollment ≠ Livelihood |
| 3 | Introducing SkillTrace | One-liner + architecture overview diagram |
| 4 | The Trainee Journey | Screenshot: SMS arrives → link clicked → form filled → badge earned |
| 5 | The Verification Chain | 3-tier pyramid: Self → Employer OTP → EPFO Cross-check |
| 6 | The Dashboard | Screenshot: District heatmap + cohort funnel |
| 7 | Privacy by Design | Aadhaar hash diagram + Consent flow + RLS explanation |
| 8 | Scale & Impact | "50 lakh trainees. Evidence-based policy. Lives changed, not just counted." |

---

## Cross-Team Communication Protocol

### Handoff Points (Exact moments teams sync)

| Time | Event | Teams Involved |
|---|---|---|
| Hour 0 | Team A shares Supabase URL + keys in group chat | A → B, C |
| Hour 2 | Team A pushes `lib/supabase.ts` to GitHub | A → B, C |
| Hour 2 | Team A confirms schema is live | A → B, C (start DB calls) |
| Hour 3 | Team C runs seed script, confirms 150 trainees in DB | C → B (can now test their forms) |
| Hour 6 | Team A confirms analytics API route is live | A → C (can now fetch real data) |
| Hour 9 | Team A deploys to Vercel, shares live URL | A → B, C (test on mobile) |
| Hour 10 | Full team: Test the demo end-to-end together | All |

### Your Group Chat Should Have These 3 Pins

1. **Supabase credentials** (URL, anon key, service key)
2. **Vercel live URL** (updated as soon as it deploys)
3. **Demo phone number** (the Twilio number for SMS demo)

---

## Definition of Done — Per Team

### Team A ✅
- [ ] Supabase schema is live and seeded
- [ ] `/api/trainee` POST creates a real trainee with Skill ID
- [ ] `/api/followup/trigger` POST sends a real SMS and creates a touchpoint
- [ ] `/api/checkin/[token]` POST saves survey response to DB
- [ ] `/api/analytics` GET returns data for all dashboard views
- [ ] App deployed live on Vercel

### Team B ✅
- [ ] Onboarding flow works end-to-end on a real mobile phone
- [ ] Check-in form opens from SMS link and submits successfully
- [ ] Confetti + badge animation plays on submission
- [ ] Employer verification page works with OTP flow
- [ ] EPFO mock spinner → green checkmark works
- [ ] All pages are mobile-responsive (tested in Chrome DevTools mobile view)

### Team C ✅
- [ ] Seed script has run and 150+ trainees are in the database
- [ ] NLP tags are applied to all non-placement reasons
- [ ] District heatmap loads with correct colors
- [ ] Cohort funnel shows realistic dropout data
- [ ] Provider leaderboard is sortable and color-coded
- [ ] Skill gap bubble chart shows at least one "crisis zone"
- [ ] Pitch deck is 8 slides, rehearsed 3 times
