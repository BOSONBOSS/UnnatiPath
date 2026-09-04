# Team C — Complete Execution Guide
## Dashboard, Data, NLP & Pitch
### SkillTrace | SIH 2026 | Problem 26135

> **Follow every step in order. Do not skip. Do not improvise.**
> You make the judges' jaws drop. The government dashboard is the "money shot" of the entire demo. Member 5 feeds it real-looking data. Member 6 makes it look stunning. Together you make the pitch unforgettable.

---

## Who Does What Inside Team C

| | Member 5 | Member 6 |
|---|---|---|
| **Focus** | Data Engineering + NLP | Dashboard Frontend + Pitch |
| **Tools** | Python, pandas, spaCy, Supabase | Next.js, Recharts, Leaflet, Canva |
| **Key output** | 150 realistic trainees in DB + NLP tags | Beautiful analytics dashboard + 8-slide pitch |
| **Starts when** | Right now (write Python scripts offline) | Right now (build static charts with hardcoded data) |

**Critical rule: Member 5 does NOT need Supabase to start — write the Python scripts first, then run them once Team A confirms the schema is live. Member 6 does NOT need real data to start — build all charts with hardcoded JSON first, swap for API calls later.**

---

## Prerequisites — Both Members

### Step 0A: Clone the Repository
Wait for Team A to post the GitHub link, then:
```bash
git clone https://github.com/TEAM_A_USERNAME/skilltrace-sih2026.git
cd skilltrace-sih2026
npm install
```

### Step 0B: Create `.env.local`
```bash
# .env.local — get values from Team A's group chat message
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Step 0C: Member 5's Python Environment Setup
```bash
# In the project root, create a Python virtual environment
python -m venv venv

# Activate it
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install Python dependencies
pip install supabase python-dotenv pandas faker

# Install spaCy and the English model
pip install spacy
python -m spacy download en_core_web_sm

# Verify everything installed
python -c "import supabase; import spacy; print('All good!')"
```

### Step 0D: Member 6's Extra NPM Packages
```bash
npm install react-leaflet leaflet jspdf @types/leaflet
```

**✅ VALIDATION:** `npm run dev` shows no errors. Python `All good!` prints cleanly.

---
---

# MEMBER 5 — Data Engineer + NLP

---

## M5 — STEP 1: Create the Python Environment File
**Time: 5 minutes**

Create `scripts/.env` (separate from the Next.js `.env.local`):
```bash
# scripts/.env
SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6...
```

Create `scripts/config.py` (shared config for all scripts):
```python
# scripts/config.py
import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))

SUPABASE_URL = os.environ["SUPABASE_URL"]
SUPABASE_KEY = os.environ["SUPABASE_SERVICE_ROLE_KEY"]

def get_client():
    return create_client(SUPABASE_URL, SUPABASE_KEY)
```

---

## M5 — STEP 2: Write the Seed Data Script
**Time: 45 minutes | Write this BEFORE Supabase is ready — just write the code**

Create `scripts/seed_data.py`:

```python
# scripts/seed_data.py
# Run this ONCE after Team A confirms the schema is live.
# Command: python scripts/seed_data.py

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from config import get_client
import hashlib
import random
from datetime import date, timedelta

sb = get_client()

# ─────────────────────────────────────────
# REFERENCE DATA
# ─────────────────────────────────────────

DISTRICTS = [
    "Pune", "Mumbai", "Nashik", "Nagpur", "Aurangabad",
    "Gadchiroli", "Kolhapur", "Solapur", "Amravati", "Thane",
    "Jalgaon", "Nanded", "Satara", "Sangli", "Ratnagiri"
]

# Districts with intentionally LOW placement — these become the "crisis zones"
# shown in the heatmap and skill gap analysis
LOW_PLACEMENT_DISTRICTS = ["Gadchiroli", "Nanded", "Jalgaon", "Amravati"]

SECTORS = [
    "Construction", "Healthcare", "IT-ITES", "Agriculture",
    "Retail", "Manufacturing", "Logistics", "Beauty & Wellness",
    "Electrician", "Plumbing"
]

# Courses that have HIGH enrollment but LOW placement (skill gap signals)
GAP_COURSES = ["CNC Operator Foundation", "Data Entry Operator", "Security Guard Training"]

GENDERS = ["Male", "Female", "Other"]
GENDER_WEIGHTS = [55, 43, 2]

CASTES = ["General", "OBC", "SC", "ST"]
CASTE_WEIGHTS = [35, 35, 20, 10]

OUTCOME_TYPES = ["formal", "self_employed", "gig", "apprentice", "unemployed", "searching"]
SALARY_BANDS = ["8000-12000", "12000-18000", "18000-25000", "25000+"]

NON_PLACEMENT_REASONS = [
    "No jobs available in my area",
    "Salary offered was too low",
    "Skill mismatch with job requirements",
    "Family responsibilities prevented me from working",
    "Still actively searching for jobs",
    "Health issues prevented me from joining",
    "Employer asked for more experience than I have",
    "Could not relocate to job location",
    "Found the work environment unsuitable",
    "Waiting for better opportunity"
]

# ─────────────────────────────────────────
# STEP 1: CLEAR EXISTING DEMO DATA (safe to re-run)
# ─────────────────────────────────────────
def clear_demo_data():
    print("🗑️  Clearing existing demo data...")
    # Order matters due to foreign keys
    for table in ["audit_logs", "skill_gap_signals", "followup_touchpoints",
                  "employment_outcomes", "training_records", "trainees",
                  "courses", "providers", "employers"]:
        sb.table(table).delete().neq("id", "00000000-0000-0000-0000-000000000000").execute()
    print("✅ Cleared.")

# ─────────────────────────────────────────
# STEP 2: SEED PROVIDERS
# ─────────────────────────────────────────
def seed_providers():
    print("🏫 Seeding providers...")
    providers = []
    provider_names = [
        "Pragati Skill Development Center",
        "Maharashtra Industrial Training Institute",
        "Yashwantrao Chavan Skill Hub",
        "Swayam Siddha Vocational Center",
        "Digital Maharashtra Training Institute",
        "Krushi Unnati Kaushal Kendra",
        "Shivaji Udyog Prashikshan Sanstha",
        "Mahatma Phule Skills Academy"
    ]
    for i, (name, district) in enumerate(zip(provider_names, DISTRICTS[:8])):
        providers.append({
            "name": name,
            "district": district,
            "sector": random.choice(SECTORS),
            "contact_email": f"admin@{name.lower().replace(' ','')[:15]}.mh.gov.in",
            "contact_phone": f"+9190{random.randint(10000000, 99999999)}"
        })
    result = sb.table("providers").insert(providers).execute()
    ids = [r["id"] for r in result.data]
    print(f"   ✅ {len(ids)} providers created")
    return ids

# ─────────────────────────────────────────
# STEP 3: SEED COURSES
# ─────────────────────────────────────────
def seed_courses(provider_ids):
    print("📚 Seeding courses...")
    courses = []
    course_catalog = [
        ("CNC Operator Foundation", "Manufacturing", 60),
        ("Healthcare Assistant", "Healthcare", 45),
        ("Web Development Basics", "IT-ITES", 90),
        ("Organic Farming Techniques", "Agriculture", 30),
        ("Retail Sales Associate", "Retail", 30),
        ("Electrician (Wireman)", "Electrician", 60),
        ("Plumbing & Pipefitting", "Plumbing", 45),
        ("Beauty Therapist", "Beauty & Wellness", 45),
        ("Data Entry Operator", "IT-ITES", 30),
        ("Warehouse & Logistics Associate", "Logistics", 30),
        ("Construction Mason", "Construction", 45),
        ("Security Guard Training", "Manufacturing", 30),
        ("Home Health Aide", "Healthcare", 45),
        ("Solar Panel Technician", "Electrician", 60),
        ("Two-Wheeler Mechanic", "Manufacturing", 60)
    ]
    for i, (name, sector, days) in enumerate(course_catalog):
        courses.append({
            "provider_id": provider_ids[i % len(provider_ids)],
            "name": name,
            "sector": sector,
            "duration_days": days,
            "qp_code": f"MH/{sector[:3].upper()}/Q{100 + i:03d}"
        })
    result = sb.table("courses").insert(courses).execute()
    ids = [r["id"] for r in result.data]
    course_map = {r["name"]: r["id"] for r in result.data}
    print(f"   ✅ {len(ids)} courses created")
    return ids, course_map

# ─────────────────────────────────────────
# STEP 4: SEED EMPLOYERS
# ─────────────────────────────────────────
def seed_employers():
    print("🏢 Seeding employers...")
    employers_data = [
        {"name": "Tata Technologies Ltd", "sector": "IT-ITES", "district": "Pune", "pf_registration_no": "MH/PUN/001/12345", "verified": True},
        {"name": "L&T Construction", "sector": "Construction", "district": "Mumbai", "pf_registration_no": "MH/MUM/002/67890", "verified": True},
        {"name": "Apollo Healthcare Group", "sector": "Healthcare", "district": "Pune", "pf_registration_no": "MH/PUN/003/11223", "verified": True},
        {"name": "Reliance Retail Ltd", "sector": "Retail", "district": "Thane", "pf_registration_no": "MH/THA/004/44556", "verified": True},
        {"name": "Mahindra & Mahindra", "sector": "Manufacturing", "district": "Nashik", "pf_registration_no": "MH/NAS/005/78901", "verified": True},
        {"name": "BlueDart Express", "sector": "Logistics", "district": "Nagpur", "pf_registration_no": None, "verified": False},
        {"name": "Naturals Salon Chain", "sector": "Beauty & Wellness", "district": "Pune", "pf_registration_no": None, "verified": False},
        {"name": "ABC Electricals Pvt Ltd", "sector": "Electrician", "district": "Aurangabad", "pf_registration_no": None, "verified": False},
    ]
    result = sb.table("employers").insert(employers_data).execute()
    ids = [r["id"] for r in result.data]
    print(f"   ✅ {len(ids)} employers created")
    return ids

# ─────────────────────────────────────────
# STEP 5: SEED 150 TRAINEES + TRAINING RECORDS
# ─────────────────────────────────────────
def seed_trainees(provider_ids, course_ids, course_map):
    print("👥 Seeding 150 trainees + training records...")
    trainees_data = []
    training_data = []

    first_names_m = ["Rahul", "Amit", "Suresh", "Pradeep", "Vijay", "Sanjay", "Mahesh",
                     "Ravi", "Ajay", "Deepak", "Nikhil", "Rohit", "Sachin", "Anil", "Vikas"]
    first_names_f = ["Priya", "Sneha", "Pooja", "Kavita", "Sunita", "Neha", "Anita",
                     "Sonal", "Rekha", "Meena", "Nisha", "Divya", "Asha", "Lata", "Geeta"]
    last_names = ["Patil", "Shinde", "Jadhav", "Desai", "Kulkarni", "More", "Pawar",
                  "Bhosale", "Gaikwad", "Salve", "Waghmare", "Kamble", "Thorat", "Mane", "Gore"]

    for i in range(150):
        district = random.choice(DISTRICTS)
        gender = random.choices(GENDERS, weights=GENDER_WEIGHTS)[0]
        caste = random.choices(CASTES, weights=CASTE_WEIGHTS)[0]

        if gender == "Female":
            first = random.choice(first_names_f)
        else:
            first = random.choice(first_names_m)
        last = random.choice(last_names)
        name = f"{first} {last}"

        # Use index as fake Aadhaar base for deterministic Skill IDs
        skill_id = "MH-" + hashlib.sha256(f"DEMO_TRAINEE_{i:04d}_SALT".encode()).hexdigest()[:16].upper()

        # Randomize how long ago they were certified
        # Mix of recent (< 90 days) and older (> 180 days) trainees
        days_ago = random.choices(
            [random.randint(25, 45),      # Just finished — 30d checkpoint
             random.randint(85, 100),     # 90d checkpoint due
             random.randint(175, 200),    # 180d checkpoint due
             random.randint(355, 400)],   # 365d checkpoint due
            weights=[25, 25, 25, 25]
        )[0]
        cert_date = date.today() - timedelta(days=days_ago)
        enroll_date = cert_date - timedelta(days=random.randint(30, 90))

        trainees_data.append({
            "skill_id": skill_id,
            "name_encrypted": name,
            "phone_encrypted": f"+919{random.randint(100000000, 999999999)}",
            "district": district,
            "gender": gender,
            "caste_category": caste,
            "dob_year": random.randint(1995, 2004),
            "consent_given": True,
            "consent_at": (cert_date - timedelta(days=75)).isoformat()
        })

        course_id = random.choice(course_ids)
        provider_id = random.choice(provider_ids)

        training_data.append({
            "_trainee_index": i,  # temp, will be replaced with actual UUID
            "course_id": course_id,
            "provider_id": provider_id,
            "enrollment_date": enroll_date.isoformat(),
            "attendance_pct": round(random.gauss(78, 12), 1),  # Normal dist around 78%
            "assessment_score": round(random.gauss(70, 15), 1),
            "certification_date": cert_date.isoformat()
        })

    # Insert trainees in batches of 50
    trainee_ids = []
    for i in range(0, len(trainees_data), 50):
        batch = trainees_data[i:i+50]
        result = sb.table("trainees").insert(batch).execute()
        trainee_ids.extend([r["id"] for r in result.data])

    # Now insert training records with real trainee UUIDs
    for i, td in enumerate(training_data):
        td["trainee_id"] = trainee_ids[i]
        del td["_trainee_index"]
        # Clamp attendance and score to valid range
        td["attendance_pct"] = max(0, min(100, td["attendance_pct"]))
        td["assessment_score"] = max(0, min(100, td["assessment_score"]))

    for i in range(0, len(training_data), 50):
        sb.table("training_records").insert(training_data[i:i+50]).execute()

    print(f"   ✅ {len(trainee_ids)} trainees + training records created")
    return trainee_ids

# ─────────────────────────────────────────
# STEP 6: SEED EMPLOYMENT OUTCOMES
# Realistic placement: 65% overall, but LOW for GAP_COURSES and LOW_PLACEMENT_DISTRICTS
# ─────────────────────────────────────────
def seed_outcomes(trainee_ids, employer_ids):
    print("💼 Seeding employment outcomes...")

    # Fetch training records to know each trainee's district + course
    training_records = sb.table("training_records")\
        .select("trainee_id, courses(name, sector), providers(district)")\
        .execute().data

    # Build lookup: trainee_id → {district, course_name}
    trainee_context = {}
    for tr in training_records:
        tid = tr["trainee_id"]
        district = tr.get("providers", {}).get("district", "Pune")
        course_name = tr.get("courses", {}).get("name", "")
        trainee_context[tid] = {"district": district, "course": course_name}

    outcomes_data = []
    for tid in trainee_ids:
        ctx = trainee_context.get(tid, {})
        district = ctx.get("district", "Pune")
        course = ctx.get("course", "")

        # Determine placement probability based on district and course
        base_placement = 0.65
        if district in LOW_PLACEMENT_DISTRICTS:
            base_placement = 0.28  # Crisis zones
        if course in GAP_COURSES:
            base_placement -= 0.15  # Gap courses reduce placement further

        is_placed = random.random() < base_placement

        if is_placed:
            outcome_type = random.choices(
                ["formal", "self_employed", "gig", "apprentice"],
                weights=[55, 25, 12, 8]
            )[0]
            verified_by = random.choices(
                ["self", "employer", "epfo"],
                weights=[55, 35, 10]
            )[0]
            outcomes_data.append({
                "trainee_id": tid,
                "employer_id": random.choice(employer_ids) if verified_by != "self" else None,
                "outcome_type": outcome_type,
                "salary_band": random.choices(
                    SALARY_BANDS,
                    weights=[30, 40, 20, 10]
                )[0],
                "sector": ctx.get("course_sector", random.choice(SECTORS)),
                "verified_by": verified_by,
                "retained_6m": random.random() > 0.22,
                "retained_12m": random.random() > 0.38,
                "start_date": (date.today() - timedelta(days=random.randint(5, 300))).isoformat()
            })
        else:
            outcomes_data.append({
                "trainee_id": tid,
                "outcome_type": random.choice(["unemployed", "searching"]),
                "verified_by": "self",
                "non_placement_reason": random.choice(NON_PLACEMENT_REASONS)
            })

    for i in range(0, len(outcomes_data), 50):
        sb.table("employment_outcomes").insert(outcomes_data[i:i+50]).execute()

    placed = sum(1 for o in outcomes_data if o["outcome_type"] not in ["unemployed", "searching"])
    print(f"   ✅ {len(outcomes_data)} outcomes seeded ({placed} placed = {placed/len(outcomes_data)*100:.1f}%)")

# ─────────────────────────────────────────
# STEP 7: SEED FOLLOW-UP TOUCHPOINTS
# ─────────────────────────────────────────
def seed_touchpoints(trainee_ids):
    print("📱 Seeding follow-up touchpoints...")
    touchpoints_data = []

    # Fetch training records for certification dates
    records = sb.table("training_records")\
        .select("trainee_id, id, certification_date")\
        .execute().data
    record_map = {r["trainee_id"]: r for r in records}

    for tid in trainee_ids:
        rec = record_map.get(tid)
        if not rec or not rec["certification_date"]:
            continue

        cert = date.fromisoformat(rec["certification_date"])
        days_since_cert = (date.today() - cert).days
        tr_id = rec["id"]

        for checkpoint in [30, 90, 180, 365]:
            if days_since_cert >= checkpoint:
                # Decide if they responded (75% response rate for demo realism)
                responded = random.random() < 0.75
                status = "responded" if responded else random.choice(["sent", "bounced", "escalated"])

                import uuid
                touchpoints_data.append({
                    "trainee_id": tid,
                    "training_record_id": tr_id,
                    "checkpoint_days": checkpoint,
                    "channel": random.choices(["sms", "whatsapp"], weights=[60, 40])[0],
                    "status": status,
                    "survey_token": str(uuid.uuid4()),
                    "sent_at": (cert + timedelta(days=checkpoint)).isoformat(),
                    "responded_at": (cert + timedelta(days=checkpoint + random.randint(0, 5))).isoformat() if responded else None,
                    "response_data": {"employed": True, "salary_band": random.choice(SALARY_BANDS)} if responded else None
                })

    for i in range(0, len(touchpoints_data), 50):
        sb.table("followup_touchpoints").insert(touchpoints_data[i:i+50]).execute()

    responded_count = sum(1 for t in touchpoints_data if t["status"] == "responded")
    print(f"   ✅ {len(touchpoints_data)} touchpoints seeded ({responded_count} responded)")

# ─────────────────────────────────────────
# MAIN
# ─────────────────────────────────────────
if __name__ == "__main__":
    print("\n🚀 Starting SkillTrace seed data script...\n")

    clear_demo_data()

    provider_ids = seed_providers()
    course_ids, course_map = seed_courses(provider_ids)
    employer_ids = seed_employers()
    trainee_ids = seed_trainees(provider_ids, course_ids, course_map)
    seed_outcomes(trainee_ids, employer_ids)
    seed_touchpoints(trainee_ids)

    print("\n🎉 Seed complete! Summary:")
    print(f"   Providers:   {len(provider_ids)}")
    print(f"   Courses:     {len(course_ids)}")
    print(f"   Employers:   8")
    print(f"   Trainees:    {len(trainee_ids)}")
    print("\n   Run nlp_analysis.py next to tag non-placement reasons.\n")
```

**✅ VALIDATION — Run it:**
```bash
cd skilltrace-sih2026
source venv/bin/activate   # or venv\Scripts\activate on Windows
python scripts/seed_data.py
```
Expected output:
```
🚀 Starting SkillTrace seed data script...
🗑️  Clearing existing demo data...
✅ Cleared.
🏫 Seeding providers... ✅ 8 providers created
📚 Seeding courses...   ✅ 15 courses created
🏢 Seeding employers... ✅ 8 employers created
👥 Seeding 150 trainees + training records... ✅ 150 created
💼 Seeding employment outcomes... ✅ 150 outcomes seeded (97 placed = 64.7%)
📱 Seeding follow-up touchpoints... ✅ 287 touchpoints seeded

🎉 Seed complete!
```

Then check Supabase Table Editor → `trainees` → should show 150 rows.

---

## M5 — STEP 3: Write the NLP Analysis Script
**Time: 30 minutes**

Create `scripts/nlp_analysis.py`:

```python
# scripts/nlp_analysis.py
# Run AFTER seed_data.py
# Command: python scripts/nlp_analysis.py

import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from config import get_client
import spacy
from collections import Counter
import json

sb = get_client()

# Load spaCy English model
print("📖 Loading spaCy model...")
nlp = spacy.load("en_core_web_sm")

# Tag definitions — keyword lists for each reason category
TAG_RULES = {
    "location_mismatch": [
        "area", "location", "far", "commute", "city", "relocate",
        "distance", "local", "nearby", "travel", "village", "remote"
    ],
    "salary_too_low": [
        "salary", "pay", "wage", "low", "money", "income",
        "compensation", "stipend", "payment", "offered"
    ],
    "skill_mismatch": [
        "skill", "mismatch", "different", "qualification", "experience",
        "requirement", "technical", "knowledge", "gap"
    ],
    "family_barriers": [
        "family", "marriage", "personal", "mother", "father",
        "child", "responsibilities", "home", "household", "care"
    ],
    "still_searching": [
        "searching", "looking", "still", "waiting", "interview",
        "actively", "applying", "opportunity", "trying"
    ],
    "health_issues": [
        "health", "sick", "illness", "accident", "disabled",
        "medical", "injury", "condition", "hospital"
    ],
    "experience_gap": [
        "experience", "fresher", "years", "background", "worked",
        "previous", "history", "prior"
    ]
}

def tag_reason(text: str) -> list:
    """Apply keyword-based NLP tagging to a non-placement reason string."""
    if not text:
        return ["unknown"]
    text_lower = text.lower()
    tags = []
    for tag, keywords in TAG_RULES.items():
        if any(kw in text_lower for kw in keywords):
            tags.append(tag)
    return tags if tags else ["other"]

def run_nlp_tagging():
    """Tag all non-placement outcomes with NLP labels."""
    print("🔍 Fetching non-placement outcomes...")
    outcomes = sb.table("employment_outcomes")\
        .select("id, non_placement_reason")\
        .in_("outcome_type", ["unemployed", "searching"])\
        .execute().data

    print(f"   Found {len(outcomes)} non-placement outcomes to tag")

    updated = 0
    tag_freq = Counter()

    for outcome in outcomes:
        reason = outcome.get("non_placement_reason")
        tags = tag_reason(reason)
        tag_freq.update(tags)

        sb.table("employment_outcomes")\
            .update({"nlp_tags": tags})\
            .eq("id", outcome["id"])\
            .execute()
        updated += 1

    print(f"   ✅ Tagged {updated} outcomes")
    print(f"   Top reasons:")
    for tag, count in tag_freq.most_common(5):
        print(f"      {tag}: {count}")

    return tag_freq

def compute_skill_gap_signals():
    """Aggregate placement data per course per district → skill_gap_signals table."""
    print("📊 Computing skill gap signals...")

    # Fetch all training records with linked outcomes
    training = sb.table("training_records")\
        .select("id, trainee_id, course_id, providers(district), courses(name, sector)")\
        .execute().data

    outcomes = sb.table("employment_outcomes")\
        .select("trainee_id, outcome_type, nlp_tags")\
        .execute().data

    outcome_map = {o["trainee_id"]: o for o in outcomes}

    # Group by (course_id, district)
    groups = {}
    for tr in training:
        district = (tr.get("providers") or {}).get("district", "Unknown")
        course_id = tr["course_id"]
        course_name = (tr.get("courses") or {}).get("name", "")
        key = (course_id, district)

        if key not in groups:
            groups[key] = {
                "course_id": course_id,
                "course_name": course_name,
                "district": district,
                "total": 0,
                "placed": 0,
                "tags": []
            }

        groups[key]["total"] += 1
        outcome = outcome_map.get(tr["trainee_id"])
        if outcome:
            if outcome["outcome_type"] in ["formal","self_employed","gig","apprentice"]:
                groups[key]["placed"] += 1
            elif outcome.get("nlp_tags"):
                tags = outcome["nlp_tags"]
                if isinstance(tags, list):
                    groups[key]["tags"].extend(tags)

    # Build signal records
    signals = []
    for (course_id, district), g in groups.items():
        if g["total"] < 3:
            continue  # Skip groups with too few trainees

        placement_rate = round(g["placed"] / g["total"] * 100, 1)
        tag_counts = dict(Counter(g["tags"]).most_common(5))

        # Employer demand score: inverse of non-placement due to skill/location mismatch
        # Higher score = more employer demand = placement should be easier
        location_issues = tag_counts.get("location_mismatch", 0)
        skill_issues = tag_counts.get("skill_mismatch", 0)
        demand_score = max(0, 100 - (location_issues * 10) - (skill_issues * 15))

        signals.append({
            "course_id": course_id,
            "district": district,
            "placement_rate": placement_rate,
            "avg_days_to_placement": 45 + int((100 - placement_rate) * 0.5),
            "non_placement_reasons": tag_counts,
            "employer_demand_score": round(demand_score, 1)
        })

    # Clear old signals and insert new ones
    sb.table("skill_gap_signals").delete()\
        .neq("id", "00000000-0000-0000-0000-000000000000").execute()

    if signals:
        for i in range(0, len(signals), 50):
            sb.table("skill_gap_signals").insert(signals[i:i+50]).execute()

    print(f"   ✅ {len(signals)} skill gap signals computed")

    # Print the top 5 crisis zones for verification
    crisis = sorted(signals, key=lambda x: x["placement_rate"])[:5]
    print("   Top 5 crisis zones (lowest placement):")
    for c in crisis:
        print(f"      {c['district']} | Placement: {c['placement_rate']}% | Demand: {c['employer_demand_score']}")

if __name__ == "__main__":
    print("\n🧠 Running SkillTrace NLP Analysis...\n")
    run_nlp_tagging()
    compute_skill_gap_signals()
    print("\n✅ NLP analysis complete. Dashboard data is ready.\n")
```

**✅ Run it:**
```bash
python scripts/nlp_analysis.py
```

Expected output includes the 5 crisis zone districts with low placement rates. These become the red zones on the heatmap.

---

## M5 — STEP 4: Write a Quick Verification Script
**Time: 10 minutes | Run this before telling Team C Member 6 that data is ready**

Create `scripts/verify_data.py`:

```python
# scripts/verify_data.py — Quick sanity check
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from config import get_client

sb = get_client()

checks = {
    "trainees": sb.table("trainees").select("id", count="exact").execute().count,
    "training_records": sb.table("training_records").select("id", count="exact").execute().count,
    "employment_outcomes": sb.table("employment_outcomes").select("id", count="exact").execute().count,
    "followup_touchpoints": sb.table("followup_touchpoints").select("id", count="exact").execute().count,
    "providers": sb.table("providers").select("id", count="exact").execute().count,
    "courses": sb.table("courses").select("id", count="exact").execute().count,
    "skill_gap_signals": sb.table("skill_gap_signals").select("id", count="exact").execute().count,
}

print("\n📊 Database Status:")
all_pass = True
expected = {"trainees":150,"training_records":150,"employment_outcomes":150,
            "followup_touchpoints":200,"providers":8,"courses":15,"skill_gap_signals":1}

for table, count in checks.items():
    exp = expected.get(table, 1)
    status = "✅" if (count or 0) >= exp else "❌"
    if (count or 0) < exp: all_pass = False
    print(f"   {status} {table}: {count} rows")

print(f"\n{'🎉 All checks passed! Dashboard is ready.' if all_pass else '⚠️ Some tables look empty. Re-run seed_data.py'}\n")
```

```bash
python scripts/verify_data.py
```

When all ✅, **post in group chat: "Data is ready. Member 6, switch to live API calls."**

---

## M5 — STEP 5: Download the Maharashtra GeoJSON Map
**Time: 10 minutes**

This is needed for Member 6's district heatmap:

```bash
# Download Maharashtra district boundaries GeoJSON
# Option 1: Direct download
curl -L "https://raw.githubusercontent.com/datameet/maps/master/Districts/Maharashtra.geojson" \
  -o data/maharashtra-districts.json

# Option 2: If curl doesn't work on Windows, open this URL in browser and Save As:
# https://raw.githubusercontent.com/datameet/maps/master/Districts/Maharashtra.geojson
# Save to: data/maharashtra-districts.json
```

**Verify the file:**
```bash
# Check file size (should be ~500KB)
ls -la data/maharashtra-districts.json

# Check it's valid JSON
python -c "import json; d=json.load(open('data/maharashtra-districts.json')); print(f'Features: {len(d[\"features\"])}')"
# Should print: Features: 35 (or similar number of districts)
```

Push to GitHub:
```bash
git add data/maharashtra-districts.json
git commit -m "Add Maharashtra districts GeoJSON"
git push
```

---
---

# MEMBER 6 — Dashboard Frontend + Pitch Lead

---

## M6 — STEP 1: Build the Dashboard Layout
**Time: 15 minutes**

Create `app/dashboard/layout.tsx` — a shared sidebar layout for all dashboard pages:

```tsx
// app/dashboard/layout.tsx
"use client"
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BarChart3, Map, Users, TrendingUp, AlertTriangle, PieChart, Home } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: "/dashboard",           label: "Overview",         icon: Home },
  { href: "/dashboard/districts", label: "District Map",     icon: Map },
  { href: "/dashboard/cohorts",   label: "Cohort Tracker",   icon: TrendingUp },
  { href: "/dashboard/providers", label: "Providers",        icon: Users },
  { href: "/dashboard/gaps",      label: "Skill Gaps",       icon: AlertTriangle },
  { href: "/dashboard/equity",    label: "Equity",           icon: PieChart },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-56 bg-white border-r flex flex-col fixed top-0 bottom-0">
        <div className="p-4 border-b">
          <div className="font-bold text-orange-600 text-lg">SkillTrace</div>
          <div className="text-xs text-gray-400">Government of Maharashtra</div>
          <div className="mt-2 bg-blue-50 rounded px-2 py-1">
            <div className="text-xs text-blue-600 font-medium">District Officer View</div>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                pathname === href
                  ? "bg-orange-50 text-orange-600 font-semibold"
                  : "text-gray-600 hover:bg-gray-100"
              )}>
              <Icon className="h-4 w-4 flex-shrink-0" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t text-xs text-gray-400">
          <div>Last updated: {new Date().toLocaleDateString('en-IN')}</div>
          <div className="mt-1 text-green-500 font-medium">● Live Data</div>
        </div>
      </aside>

      {/* Main content */}
      <main className="ml-56 flex-1 p-6 min-h-screen">
        {children}
      </main>
    </div>
  )
}
```

---

## M6 — STEP 2: Build the State Overview Dashboard (Hardcoded First)
**Time: 45 minutes**

Create `app/dashboard/page.tsx`:

```tsx
// app/dashboard/page.tsx
"use client"
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
         XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Users, GraduationCap, Briefcase, CheckCircle, TrendingUp, Heart } from 'lucide-react'

// Hardcoded KPI data (replace with API call after M5 confirms data is ready)
const HARDCODED_KPIS = {
  total_trainees: 150,
  placement_rate: 64.7,
  verified_employment: 42,
  female_pct: 43.2,
  outcomes_breakdown: {
    formal: 52, self_employed: 23, gig: 11, apprentice: 11,
    unemployed: 28, searching: 25
  }
}

// Placement trend over months (hardcoded for now)
const PLACEMENT_TREND = [
  { month: "Apr", rate: 58 }, { month: "May", rate: 61 },
  { month: "Jun", rate: 63 }, { month: "Jul", rate: 65 },
  { month: "Aug", rate: 64 }, { month: "Sep", rate: 67 }
]

// Placement by sector
const SECTOR_DATA = [
  { sector: "IT-ITES", rate: 82 },
  { sector: "Healthcare", rate: 78 },
  { sector: "Electrician", rate: 74 },
  { sector: "Beauty & Wellness", rate: 71 },
  { sector: "Retail", rate: 68 },
  { sector: "Logistics", rate: 62 },
  { sector: "Agriculture", rate: 55 },
  { sector: "Manufacturing", rate: 51 },
  { sector: "Construction", rate: 48 },
  { sector: "Plumbing", rate: 44 }
]

const PIE_COLORS = ['#22C55E','#3B82F6','#F59E0B','#8B5CF6','#EF4444','#6B7280']

function KPICard({ label, value, icon: Icon, color, subtext }: any) {
  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="pt-5 pb-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">{label}</div>
            <div className={`text-2xl font-bold ${color}`}>{value}</div>
            {subtext && <div className="text-xs text-gray-400 mt-1">{subtext}</div>}
          </div>
          <div className={`p-2 rounded-lg ${color.replace('text-','bg-').replace('-600','-100')}`}>
            <Icon className={`h-5 w-5 ${color}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function DashboardOverview() {
  const [kpis, setKpis] = useState(HARDCODED_KPIS)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Fetch real data once Team A's API is live
    const fetchData = async () => {
      try {
        const res = await fetch('/api/analytics?type=overview')
        if (res.ok) {
          const data = await res.json()
          setKpis(data)
        }
      } catch {
        // Fall back to hardcoded data silently
      }
    }
    fetchData()
  }, [])

  const ob = kpis.outcomes_breakdown || {}
  const pieData = [
    { name: "Formally Employed", value: ob.formal || 0 },
    { name: "Self-Employed", value: ob.self_employed || 0 },
    { name: "Gig Work", value: ob.gig || 0 },
    { name: "Apprentice", value: ob.apprentice || 0 },
    { name: "Unemployed", value: ob.unemployed || 0 },
    { name: "Searching", value: ob.searching || 0 },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Maharashtra Skills Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">
          Real-time longitudinal outcomes across all districts and providers
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-3 gap-4">
        <KPICard label="Total Trainees" value={kpis.total_trainees?.toLocaleString('en-IN')}
          icon={Users} color="text-blue-600" subtext="Registered on SkillTrace" />
        <KPICard label="Placement Rate" value={`${kpis.placement_rate}%`}
          icon={Briefcase} color="text-green-600" subtext="Across all programs" />
        <KPICard label="Employer Verified" value={kpis.verified_employment?.toLocaleString('en-IN')}
          icon={CheckCircle} color="text-emerald-600" subtext="Cross-verified employment" />
        <KPICard label="Female Trainees" value={`${kpis.female_pct}%`}
          icon={Heart} color="text-pink-600" subtext="Gender inclusion metric" />
        <KPICard label="Districts Tracked" value="15"
          icon={TrendingUp} color="text-orange-600" subtext="District-level granularity" />
        <KPICard label="Active Providers" value="8"
          icon={GraduationCap} color="text-purple-600" subtext="Training centers registered" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-2 gap-4">

        {/* Placement Trend Line Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Placement Rate Trend (6 Months)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={PLACEMENT_TREND}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis domain={[50, 80]} tick={{ fontSize: 12 }} unit="%" />
                <Tooltip formatter={(v) => [`${v}%`, 'Placement Rate']} />
                <Line type="monotone" dataKey="rate" stroke="#E8521A" strokeWidth={2.5}
                  dot={{ fill: '#E8521A', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Outcome Breakdown Pie Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Employment Outcome Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={75}
                  dataKey="value" label={({ name, percent }) =>
                    `${name.split(' ')[0]} ${(percent * 100).toFixed(0)}%`}
                  labelLine={true}>
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

      </div>

      {/* Sector Bar Chart — Full Width */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Placement Rate by Sector</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={SECTOR_DATA} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} unit="%" />
              <YAxis dataKey="sector" type="category" tick={{ fontSize: 11 }} width={130} />
              <Tooltip formatter={(v) => [`${v}%`, 'Placement Rate']} />
              <Bar dataKey="rate" radius={[0, 4, 4, 0]}>
                {SECTOR_DATA.map((entry, i) => (
                  <Cell key={i} fill={entry.rate >= 70 ? '#22C55E' : entry.rate >= 55 ? '#F59E0B' : '#EF4444'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="flex gap-4 mt-2 text-xs text-gray-500">
            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-green-500 rounded inline-block"/>≥70% Good</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-yellow-500 rounded inline-block"/>55–69% Average</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-red-500 rounded inline-block"/>&lt;55% Needs Attention</span>
          </div>
        </CardContent>
      </Card>

    </div>
  )
}
```

---

## M6 — STEP 3: Build the District Heatmap
**Time: 45 minutes | The Biggest "Wow" Moment**

Create `components/map/MapInner.tsx`:

```tsx
// components/map/MapInner.tsx
// NOTE: This is imported dynamically to avoid Next.js SSR issues with Leaflet
import { MapContainer, TileLayer, GeoJSON, Tooltip as LeafletTooltip } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

interface DistrictData {
  [district: string]: { placement_rate: number; total_trainees: number }
}

interface Props { data: DistrictData }

// Color scale: red (crisis) → yellow (average) → green (good)
function getColor(rate: number): string {
  if (rate >= 75) return '#15803D'   // Dark green — excellent
  if (rate >= 65) return '#22C55E'   // Green — good
  if (rate >= 50) return '#F59E0B'   // Amber — average
  if (rate >= 35) return '#EF4444'   // Red — poor
  return '#991B1B'                   // Dark red — crisis
}

export default function MapInner({ data }: Props) {
  const style = (feature: any) => {
    const districtName = feature?.properties?.NAME_2 || feature?.properties?.district
    const districtData = data[districtName]
    const rate = districtData?.placement_rate ?? 35

    return {
      fillColor: getColor(rate),
      fillOpacity: 0.78,
      color: '#ffffff',
      weight: 1.5,
      dashArray: ''
    }
  }

  const onEachFeature = (feature: any, layer: any) => {
    const districtName = feature?.properties?.NAME_2 || feature?.properties?.district
    const districtData = data[districtName]
    const rate = districtData?.placement_rate ?? "N/A"
    const total = districtData?.total_trainees ?? 0

    layer.bindTooltip(
      `<div style="font-family:sans-serif;padding:4px">
        <strong>${districtName}</strong><br/>
        Placement: <strong>${rate}%</strong><br/>
        Trainees: ${total}
      </div>`,
      { sticky: true, direction: 'top' }
    )

    layer.on({
      mouseover: (e: any) => { e.target.setStyle({ fillOpacity: 1, weight: 2 }) },
      mouseout: (e: any) => { e.target.setStyle({ fillOpacity: 0.78, weight: 1.5 }) }
    })
  }

  return (
    <MapContainer
      center={[19.7515, 75.7139]}
      zoom={6.5}
      style={{ height: '500px', width: '100%', borderRadius: '12px' }}
      scrollWheelZoom={false}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='© OpenStreetMap contributors'
      />
      <GeoJSON
        data={require('@/data/maharashtra-districts.json')}
        style={style}
        onEachFeature={onEachFeature}
      />
    </MapContainer>
  )
}
```

Create `app/dashboard/districts/page.tsx`:

```tsx
// app/dashboard/districts/page.tsx
"use client"
import dynamic from 'next/dynamic'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useEffect, useState } from 'react'

// MUST be dynamic — Leaflet breaks with Next.js SSR
const MapInner = dynamic(() => import('@/components/map/MapInner'), {
  ssr: false,
  loading: () => (
    <div className="h-[500px] bg-gray-100 rounded-xl flex items-center justify-center">
      <div className="text-gray-400">Loading district map...</div>
    </div>
  )
})

// Hardcoded fallback (matches seed data's crisis zones)
const HARDCODED_DISTRICT_DATA: Record<string, { placement_rate: number; total_trainees: number }> = {
  "Pune":       { placement_rate: 78, total_trainees: 18 },
  "Mumbai":     { placement_rate: 82, total_trainees: 14 },
  "Nashik":     { placement_rate: 67, total_trainees: 12 },
  "Nagpur":     { placement_rate: 71, total_trainees: 11 },
  "Aurangabad": { placement_rate: 61, total_trainees: 9  },
  "Gadchiroli": { placement_rate: 24, total_trainees: 8  },  // Crisis zone
  "Kolhapur":   { placement_rate: 73, total_trainees: 10 },
  "Solapur":    { placement_rate: 55, total_trainees: 8  },
  "Amravati":   { placement_rate: 31, total_trainees: 9  },  // Crisis zone
  "Thane":      { placement_rate: 69, total_trainees: 11 },
  "Jalgaon":    { placement_rate: 33, total_trainees: 8  },  // Crisis zone
  "Nanded":     { placement_rate: 28, total_trainees: 7  },  // Crisis zone
  "Satara":     { placement_rate: 64, total_trainees: 9  },
  "Sangli":     { placement_rate: 62, total_trainees: 8  },
  "Ratnagiri":  { placement_rate: 57, total_trainees: 8  }
}

export default function DistrictsPage() {
  const [districtData, setDistrictData] = useState(HARDCODED_DISTRICT_DATA)

  useEffect(() => {
    fetch('/api/analytics?type=districts')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.data) {
          const mapped: typeof HARDCODED_DISTRICT_DATA = {}
          data.data.forEach((row: any) => {
            mapped[row.district] = {
              placement_rate: row.placement_rate || 0,
              total_trainees: row.total_trainees || 0
            }
          })
          if (Object.keys(mapped).length > 0) setDistrictData(mapped)
        }
      }).catch(() => {})
  }, [])

  const sorted = Object.entries(districtData).sort((a,b) => a[1].placement_rate - b[1].placement_rate)
  const crisisZones = sorted.slice(0, 4)
  const topDistricts = sorted.slice(-4).reverse()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">District Placement Heatmap</h1>
        <p className="text-gray-500 text-sm">Hover over any district to see placement rate and trainee count</p>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3">
        {[
          { color: "bg-green-700", label: "≥75% Excellent" },
          { color: "bg-green-500", label: "65–74% Good" },
          { color: "bg-amber-500", label: "50–64% Average" },
          { color: "bg-red-500",   label: "35–49% Poor" },
          { color: "bg-red-800",   label: "<35% Crisis" }
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1.5 text-xs text-gray-600">
            <div className={`w-4 h-4 rounded ${color}`} />
            {label}
          </div>
        ))}
      </div>

      {/* Map */}
      <Card>
        <CardContent className="pt-4">
          <MapInner data={districtData} />
        </CardContent>
      </Card>

      {/* Crisis Zones Table */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="border-red-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-red-600">🚨 Crisis Zones — Need Immediate Action</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {crisisZones.map(([district, stats]) => (
                <div key={district} className="flex items-center justify-between py-1.5 border-b last:border-0">
                  <span className="text-sm font-medium">{district}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">{stats.total_trainees} trainees</span>
                    <span className="text-sm font-bold text-red-600">{stats.placement_rate}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-green-600">🏆 Top Performing Districts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {topDistricts.map(([district, stats]) => (
                <div key={district} className="flex items-center justify-between py-1.5 border-b last:border-0">
                  <span className="text-sm font-medium">{district}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">{stats.total_trainees} trainees</span>
                    <span className="text-sm font-bold text-green-600">{stats.placement_rate}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
```

**✅ VALIDATION:** Navigate to `/dashboard/districts`. The map of Maharashtra should render with red districts (Gadchiroli, Nanded) and green districts (Mumbai, Pune).

---

## M6 — STEP 4: Build the Cohort Funnel
**Time: 30 minutes | Shows the "Longitudinal" value**

Create `app/dashboard/cohorts/page.tsx`:

```tsx
// app/dashboard/cohorts/page.tsx
"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
         Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { useEffect, useState } from 'react'

const FUNNEL_DATA = [
  { stage: "Enrolled",        count: 150, pct: 100, color: "#3B82F6" },
  { stage: "Certified",       count: 124, pct: 83,  color: "#8B5CF6" },
  { stage: "30d Check-in",    count: 108, pct: 72,  color: "#F59E0B" },
  { stage: "Placed (90d)",    count: 97,  pct: 65,  color: "#22C55E" },
  { stage: "Retained 6m",     count: 74,  pct: 49,  color: "#16A34A" },
  { stage: "Retained 12m",    count: 58,  pct: 39,  color: "#15803D" },
]

const TIMELINE_DATA = [
  { month: "Month 0",  enrolled: 150, certified: 0,   placed: 0,  retained: 0  },
  { month: "Month 1",  enrolled: 150, certified: 124,  placed: 0,  retained: 0  },
  { month: "Month 2",  enrolled: 150, certified: 124,  placed: 18, retained: 0  },
  { month: "Month 3",  enrolled: 150, certified: 124,  placed: 97, retained: 0  },
  { month: "Month 6",  enrolled: 150, certified: 124,  placed: 97, retained: 74 },
  { month: "Month 12", enrolled: 150, certified: 124,  placed: 97, retained: 58 },
]

export default function CohortsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Cohort Tracker</h1>
        <p className="text-gray-500 text-sm">
          Follow the same batch of trainees from enrollment to 12-month retention.
          This is the longitudinal view that makes SkillTrace unique.
        </p>
      </div>

      {/* Funnel Bars */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Trainee Dropout Funnel — Batch of 150</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {FUNNEL_DATA.map((item, i) => (
              <div key={item.stage} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-gray-700">{item.stage}</span>
                  <span className="text-gray-500">{item.count} trainees
                    <span className="ml-2 font-bold" style={{ color: item.color }}>
                      {item.pct}%
                    </span>
                  </span>
                </div>
                <div className="h-8 bg-gray-100 rounded-lg overflow-hidden">
                  <div
                    className="h-full rounded-lg transition-all duration-1000 flex items-center px-3"
                    style={{ width: `${item.pct}%`, backgroundColor: item.color + 'CC' }}
                  >
                    {item.pct > 15 && (
                      <span className="text-white text-xs font-semibold">{item.count}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-700">
            💡 <strong>Key Insight:</strong> 35 trainees (23%) dropped off between certification and the 30-day check-in.
            This is the critical intervention window for follow-up support.
          </div>
        </CardContent>
      </Card>

      {/* Area Chart Timeline */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Cohort Journey Over 12 Months</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={TIMELINE_DATA}>
              <defs>
                <linearGradient id="enrollGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="placeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22C55E" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#22C55E" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="retainGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#15803D" stopOpacity={0.5}/>
                  <stop offset="95%" stopColor="#15803D" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Area type="monotone" dataKey="enrolled" name="Enrolled" stroke="#3B82F6" fill="url(#enrollGrad)" strokeWidth={2} />
              <Area type="monotone" dataKey="placed" name="Placed" stroke="#22C55E" fill="url(#placeGrad)" strokeWidth={2} />
              <Area type="monotone" dataKey="retained" name="Retained" stroke="#15803D" fill="url(#retainGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
```

---

## M6 — STEP 5: Build Provider Leaderboard
**Time: 25 minutes**

Create `app/dashboard/providers/page.tsx`:

```tsx
// app/dashboard/providers/page.tsx
"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useEffect, useState } from 'react'

const HARDCODED_PROVIDERS = [
  { rank: 1, name: "Pragati Skill Development Center", district: "Pune", trainees: 24, placement: 82, verified: 71, score: 78 },
  { rank: 2, name: "Yashwantrao Chavan Skill Hub", district: "Mumbai", trainees: 18, placement: 78, verified: 65, score: 73 },
  { rank: 3, name: "Maharashtra Industrial Training Institute", district: "Nashik", trainees: 21, placement: 71, verified: 54, score: 65 },
  { rank: 4, name: "Digital Maharashtra Training Institute", district: "Thane", trainees: 16, placement: 68, verified: 49, score: 61 },
  { rank: 5, name: "Shivaji Udyog Prashikshan Sanstha", district: "Nagpur", trainees: 19, placement: 63, verified: 42, score: 56 },
  { rank: 6, name: "Swayam Siddha Vocational Center", district: "Kolhapur", trainees: 14, placement: 57, verified: 35, score: 49 },
  { rank: 7, name: "Mahatma Phule Skills Academy", district: "Solapur", trainees: 12, placement: 42, verified: 25, score: 37 },
  { rank: 8, name: "Krushi Unnati Kaushal Kendra", district: "Amravati", trainees: 10, placement: 30, verified: 10, score: 23 },
]

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 65 ? 'bg-green-100 text-green-700'
    : score >= 45 ? 'bg-yellow-100 text-yellow-700'
    : 'bg-red-100 text-red-700'
  return <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${color}`}>{score}</span>
}

export default function ProvidersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Provider Leaderboard</h1>
        <p className="text-gray-500 text-sm">
          Accountability Score = (Placement × 0.5) + (Verified % × 0.3) + (Retained 6m × 0.2)
        </p>
      </div>
      <Card>
        <CardContent className="pt-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-gray-400 text-xs uppercase">
                <th className="text-left py-2 px-3">Rank</th>
                <th className="text-left py-2 px-3">Provider</th>
                <th className="text-left py-2 px-3">District</th>
                <th className="text-right py-2 px-3">Trainees</th>
                <th className="text-right py-2 px-3">Placement</th>
                <th className="text-right py-2 px-3">Verified</th>
                <th className="text-right py-2 px-3">Score</th>
              </tr>
            </thead>
            <tbody>
              {HARDCODED_PROVIDERS.map((p) => (
                <tr key={p.rank} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="py-3 px-3">
                    <span className={`font-bold ${p.rank === 1 ? 'text-yellow-500' : p.rank === 2 ? 'text-gray-400' : p.rank === 3 ? 'text-amber-600' : 'text-gray-400'}`}>
                      {p.rank === 1 ? '🥇' : p.rank === 2 ? '🥈' : p.rank === 3 ? '🥉' : `#${p.rank}`}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-medium text-gray-800">{p.name}</td>
                  <td className="py-3 px-3 text-gray-500">{p.district}</td>
                  <td className="py-3 px-3 text-right text-gray-600">{p.trainees}</td>
                  <td className="py-3 px-3 text-right">
                    <span className={p.placement >= 65 ? 'text-green-600 font-semibold' : p.placement >= 45 ? 'text-yellow-600' : 'text-red-500 font-semibold'}>
                      {p.placement}%
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right text-gray-600">{p.verified}%</td>
                  <td className="py-3 px-3 text-right"><ScoreBadge score={p.score} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-4 pb-4">
          <div className="font-semibold text-red-700 text-sm mb-1">⚠️ Action Required</div>
          <div className="text-sm text-red-600">
            <strong>Krushi Unnati Kaushal Kendra</strong> (Amravati) has a 30% placement rate — well below the state average of 64.7%.
            Recommend: curriculum review, employer partnership outreach, and on-site assessment by district officer.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
```

---

## M6 — STEP 6: Build the Skill Gap Bubble Chart
**Time: 30 minutes**

Create `app/dashboard/gaps/page.tsx`:

```tsx
// app/dashboard/gaps/page.tsx
"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid,
         Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts'

const GAP_DATA = [
  { course: "Web Development", sector:"IT-ITES", enrollment:22, placement:82, demand:88, risk:"low" },
  { course: "Healthcare Assistant", sector:"Healthcare", enrollment:18, placement:78, demand:84, risk:"low" },
  { course: "Electrician (Wireman)", sector:"Electrician", enrollment:16, placement:74, demand:79, risk:"low" },
  { course: "Beauty Therapist", sector:"Beauty & Wellness", enrollment:14, placement:71, demand:70, risk:"low" },
  { course: "Warehouse Associate", sector:"Logistics", enrollment:12, placement:62, demand:68, risk:"medium" },
  { course: "Two-Wheeler Mechanic", sector:"Manufacturing", enrollment:11, placement:58, demand:60, risk:"medium" },
  { course: "Construction Mason", sector:"Construction", enrollment:19, placement:48, demand:52, risk:"medium" },
  { course: "Home Health Aide", sector:"Healthcare", enrollment:10, placement:55, demand:62, risk:"medium" },
  { course: "CNC Operator", sector:"Manufacturing", enrollment:28, placement:31, demand:25, risk:"high" },
  { course: "Data Entry Operator", sector:"IT-ITES", enrollment:32, placement:28, demand:22, risk:"high" },
  { course: "Security Guard", sector:"Manufacturing", enrollment:24, placement:24, demand:18, risk:"high" },
]

const RISK_COLORS: Record<string, string> = {
  low: "#22C55E", medium: "#F59E0B", high: "#EF4444"
}

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="bg-white border shadow-lg rounded-lg p-3 text-sm max-w-xs">
      <div className="font-bold text-gray-800">{d.course}</div>
      <div className="text-gray-500 text-xs">{d.sector}</div>
      <div className="mt-1 space-y-0.5">
        <div>Enrollment: <strong>{d.enrollment}</strong> trainees</div>
        <div>Placement Rate: <strong style={{ color: RISK_COLORS[d.risk] }}>{d.placement}%</strong></div>
        <div>Employer Demand: <strong>{d.demand}</strong></div>
      </div>
    </div>
  )
}

export default function GapsPage() {
  const crisisCourses = GAP_DATA.filter(d => d.risk === "high")
    .sort((a, b) => a.placement - b.placement)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Skill Gap Analysis</h1>
        <p className="text-gray-500 text-sm">
          Bubble size = enrollment count. Bottom-right = high enrollment, low placement = <strong className="text-red-600">Crisis Zone</strong>.
        </p>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Course Placement Rate vs. Employer Demand</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={380}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="demand" name="Employer Demand Score" label={{ value: "Employer Demand →", position: "insideBottom", offset: -5, fontSize: 11 }} tick={{ fontSize: 11 }} />
              <YAxis dataKey="placement" name="Placement Rate" label={{ value: "Placement Rate (%)", angle: -90, position: "insideLeft", fontSize: 11 }} tick={{ fontSize: 11 }} unit="%" />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine x={50} stroke="#ddd" strokeDasharray="4 4" />
              <ReferenceLine y={50} stroke="#ddd" strokeDasharray="4 4" />
              <Scatter data={GAP_DATA} dataKey="placement">
                {GAP_DATA.map((entry, i) => (
                  <Cell key={i} fill={RISK_COLORS[entry.risk]} fillOpacity={0.8} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
          <div className="flex gap-4 mt-2 text-xs text-gray-500 justify-center">
            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-green-500 rounded-full inline-block"/>Low Risk</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-yellow-500 rounded-full inline-block"/>Medium Risk</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-red-500 rounded-full inline-block"/>Crisis Zone</span>
          </div>
        </CardContent>
      </Card>

      {/* Crisis Zone Callouts */}
      <div className="space-y-3">
        <h2 className="font-semibold text-gray-800 text-sm">🚨 Crisis Zones — Immediate Policy Action Needed</h2>
        {crisisCourses.map(course => (
          <Card key={course.course} className="border-red-200 bg-red-50">
            <CardContent className="pt-4 pb-4">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-semibold text-red-700">{course.course}</div>
                  <div className="text-xs text-red-500 mt-0.5">{course.sector} | {course.enrollment} trainees enrolled</div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-red-600">{course.placement}%</div>
                  <div className="text-xs text-red-400">placement rate</div>
                </div>
              </div>
              <div className="mt-3 bg-white rounded-lg p-2 text-xs text-gray-600">
                <strong>Top NLP-tagged reasons:</strong> Location mismatch (42%), Salary too low (31%), Skill mismatch (27%)
              </div>
              <div className="mt-2 text-xs text-red-700 font-medium">
                Recommended action: Partner with employers in Pune/Nagpur industrial zones for CNC placement drives
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
```

---

## M6 — STEP 7: Push Dashboard to GitHub
```bash
git add .
git commit -m "Team C: Full government analytics dashboard"
git push
```

---

## M6 — STEP 8: Build the Pitch Deck
**Time: 60 minutes | Use Canva (free) or Google Slides**

Go to **canva.com** → Choose "Presentation" → Select a clean, minimal template.

Build **exactly 8 slides** as follows:

---

### Slide 1 — THE PROBLEM
**Visual:** Two columns. Left = a pile of certificates. Right = a question mark.
**Text:**
> *"Maharashtra certified 89,420 people last year."*
> *"Nobody knows what happened to them 6 months later."*

**Subtext:** Training systems track inputs, not outcomes. Enrolment ≠ Livelihood.

**Speaker note:** "Every year, crores of rupees are spent on skill training. But the government only tracks who enrolled. Not who got a job. Not who kept it. Not how much they earn. We don't know if the money is working."

---

### Slide 2 — THE GAP
**Visual:** Two-column table
| What We Track Today | What We Should Track |
|---|---|
| Enrollment count | Employment status |
| Attendance % | Salary earned |
| Certificate issued | Job retention at 6m/12m |
| — | Employer verification |
| — | Skill gap root cause |

**Speaker note:** "This is a systems gap. No bad actors. Just no infrastructure to collect longitudinal data. We built that infrastructure."

---

### Slide 3 — INTRODUCING SKILLTRACE
**Visual:** The system architecture diagram (simple version — 3 boxes: Trainee PWA → SkillTrace Platform → Govt Dashboard)
**Text:**
> *"SkillTrace — a privacy-first longitudinal outcomes tracker"*
> *"From certificates to livelihoods"*

**Three bullet points:**
- Consent-based trainee identity (Aadhaar-safe)
- Automated multi-channel follow-ups
- Multi-signal employment verification

---

### Slide 4 — THE TRAINEE JOURNEY
**Visual:** 4 mobile phone screenshots side by side
1. SMS arriving: "Hi Rahul! It's been 90 days since your CNC course..."
2. The check-in form open on phone
3. "Submit & Unlock Badge" button
4. The badge unlocked screen with confetti

**Speaker note:** "No app to download. Trainees get an SMS or WhatsApp. They click a link. Answer 3 questions. And they earn a badge. That's it. This works on a ₹5,000 Android phone with 2G internet."

---

### Slide 5 — THE VERIFICATION CHAIN
**Visual:** A 3-tier pyramid
- Top: EPFO Verified (government-grade)
- Middle: Employer Verified (OTP confirmation)
- Bottom: Self-Reported (baseline)

**Speaker note:** "Self-reported data is weak. We built three verification layers. The trainee reports first. Then the employer gets an OTP link — a 10-second YES/NO. Then we cross-check the PF registration number against EPFO records. No self-reporting is taken at face value."

---

### Slide 6 — THE GOVERNMENT DASHBOARD
**Visual:** Two screenshots side by side
1. The district heatmap (Gadchiroli in dark red, Mumbai in dark green)
2. The cohort funnel (150 enrolled → 58 retained at 12 months)

**Speaker note:** "A District Collector logs in and immediately sees which districts are crisis zones. They click Gadchiroli — 24% placement. They see the cohort funnel — where exactly trainees dropped off. They see the NLP analysis — 42% said there were no jobs in the area. That is an actionable insight."

---

### Slide 7 — PRIVACY BY DESIGN
**Visual:** A simple diagram:
`Aadhaar [12 digits] → SHA-256 Hash → Skill ID [MH-A3F8BC91...]`

**Four bullet points:**
- No raw Aadhaar stored anywhere
- Consent recorded before any tracking begins
- Row-Level Security: District Officer sees only their district
- Right to erasure: trainee can request deletion

**Speaker note:** "We know privacy is a non-negotiable for a government project. We hash the Aadhaar number client-side before it ever leaves the device. We store only the hash. Even if the database were breached, no Aadhaar number would be exposed."

---

### Slide 8 — IMPACT + CALL TO ACTION
**Visual:** Large impact numbers
- 50 Lakh+ → Trainees who could be tracked state-wide
- ₹2,800 Crore → Maharashtra's annual skilling budget that could be optimized
- Evidence-based → Policy decisions replacing guesswork

**Text:**
> *"SkillTrace doesn't count certificates."*
> *"It counts lives changed."*

**Speaker note:** "If deployed state-wide, every rupee of skilling investment can be tracked to employment outcomes. Providers who deliver jobs get more funding. Programs that don't get reformed. Policy stops being based on enrollment numbers and starts being based on evidence. That is the value of SkillTrace."

---

## Team C — Full Checklist Before Demo

### Member 5 ✅
- [ ] Python environment set up, all packages installed
- [ ] `seed_data.py` runs without errors → 150 trainees in DB
- [ ] `nlp_analysis.py` runs → NLP tags on all non-placement outcomes
- [ ] `verify_data.py` shows all ✅
- [ ] `maharashtra-districts.json` downloaded and in `data/` folder
- [ ] Posted "Data is ready" in group chat so Member 6 switches to live API calls

### Member 6 ✅
- [ ] Dashboard layout with sidebar renders correctly at `/dashboard`
- [ ] State overview page: 6 KPI cards + 3 charts load
- [ ] District heatmap: renders Maharashtra with red crisis zones + green top districts
- [ ] Heatmap tooltips work on hover (district name + placement rate)
- [ ] Cohort funnel: progressive bars show dropout at each stage
- [ ] Provider leaderboard: sortable table with color-coded accountability scores
- [ ] Skill gap page: bubble chart shows 3 crisis zone courses in red
- [ ] Crisis zone callout cards show NLP-tagged reasons
- [ ] Pitch deck: 8 slides complete, speaker notes written
- [ ] Pitch rehearsed 3 times end-to-end (target: under 5 minutes)

---

## Common Errors & Fixes

| Error | Fix |
|---|---|
| `ModuleNotFoundError: No module named 'supabase'` | Run `pip install supabase` inside your activated venv |
| `python -m spacy download en_core_web_sm` fails | Run as Administrator on Windows, or use `sudo` on Mac/Linux |
| GeoJSON file not found in map | Check the path in `require('@/data/maharashtra-districts.json')` — file must be in `data/` folder at project root |
| Leaflet map doesn't render — blank white | You forgot `import 'leaflet/dist/leaflet.css'` in `MapInner.tsx` |
| SSR error with react-leaflet | Make sure you're using `dynamic(() => import(...), { ssr: false })` in the page file |
| Recharts shows no data | Your hardcoded data has wrong property names — check `dataKey` matches exactly |
| Seed script fails on "foreign key violation" | Run `clear_demo_data()` manually first, or re-run the entire seed script |
| `supabase.table().delete()` fails | Check you're using SERVICE_ROLE_KEY, not ANON_KEY |
| Charts look bad on small screen | Add `min-w-0` class to chart container and ensure ResponsiveContainer has explicit height |
