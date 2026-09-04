import { createClient } from '@supabase/supabase-js';
import { faker } from '@faker-js/faker';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// Use the credentials from your .env.local
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const DISTRICTS = ['Pune', 'Mumbai', 'Gadchiroli', 'Nanded', 'Jalgaon', 'Amravati', 'Nashik', 'Nagpur'];
const SECTORS = ['Manufacturing', 'IT/ITeS', 'Healthcare', 'Construction', 'Retail'];
const NON_PLACEMENT_REASONS = [
  'No jobs available in my home district',
  'Salary offered was too low to relocate',
  'Family constraints prevent relocation',
  'Skill mismatch with local industry requirements',
  'Health issues'
];

async function seed() {
  console.log('Starting database seed...');
  
  // 1. Generate 150 Fake Trainees
  const trainees = [];
  for(let i=0; i<150; i++) {
    const isCrisisDistrict = ['Gadchiroli', 'Nanded'].includes(faker.helpers.arrayElement(DISTRICTS));
    
    let gender = faker.person.sexType(); // returns 'male' or 'female'
    gender = gender.charAt(0).toUpperCase() + gender.slice(1); // 'Male' or 'Female'

    trainees.push({
      skill_id: `MH-${faker.string.alphanumeric(16).toUpperCase()}`,
      phone_encrypted: faker.phone.number({ style: 'national' }),
      name_encrypted: faker.person.fullName(),
      district: faker.helpers.arrayElement(DISTRICTS),
      gender: gender,
      caste_category: faker.helpers.arrayElement(['General', 'OBC', 'SC', 'ST']),
      dob_year: faker.number.int({ min: 1995, max: 2005 }),
      consent_given: true,
      consent_at: new Date().toISOString()
    });
  }

  console.log('Inserting trainees...');
  const { data: insertedTrainees, error: tErr } = await supabase.from('trainees').insert(trainees).select('id, district');
  if (tErr) {
      console.error(tErr);
      throw tErr;
  }

  console.log('Generating outcomes and touchpoints...');
  const outcomes = [];
  const touchpoints = [];

  for(const trainee of insertedTrainees) {
    // 2. Generate Employment Outcomes (Crisis districts have lower placement rates)
    const isCrisis = ['Gadchiroli', 'Nanded'].includes(trainee.district);
    const isEmployed = faker.number.int({ min: 1, max: 100 }) > (isCrisis ? 70 : 30); // 30% placement in crisis, 70% in normal

    outcomes.push({
      trainee_id: trainee.id,
      outcome_type: isEmployed ? 'formal' : 'searching',
      salary_band: isEmployed ? faker.helpers.arrayElement(['10k-15k', '15k-25k', '25k+']) : null,
      sector: isEmployed ? faker.helpers.arrayElement(SECTORS) : null,
      verified_by: isEmployed ? faker.helpers.arrayElement(['epfo', 'employer', 'self']) : 'self',
      non_placement_reason: isEmployed ? null : faker.helpers.arrayElement(NON_PLACEMENT_REASONS),
      start_date: isEmployed ? faker.date.recent({ days: 180 }).toISOString() : null
    });

    // 3. Generate Touchpoints
    touchpoints.push({
      trainee_id: trainee.id,
      checkpoint_days: faker.helpers.arrayElement([30, 90, 180, 365]),
      channel: 'sms',
      status: 'responded',
      survey_token: faker.string.uuid(),
      sent_at: faker.date.recent({ days: 10 }).toISOString(),
      responded_at: faker.date.recent({ days: 5 }).toISOString(),
    });
  }

  console.log('Inserting outcomes...');
  const { error: oErr } = await supabase.from('employment_outcomes').insert(outcomes);
  if (oErr) {
      console.error(oErr);
      throw oErr;
  }

  console.log('Inserting touchpoints...');
  const { error: tpErr } = await supabase.from('followup_touchpoints').insert(touchpoints);
  if (tpErr) {
      console.error(tpErr);
      throw tpErr;
  }

  console.log('Seeding complete! Database is populated with 150 trainees.');
}

seed().catch(console.error);
