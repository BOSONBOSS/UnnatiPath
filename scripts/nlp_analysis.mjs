import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// Initialize Supabase using environment variables
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL, 
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Dictionary of keywords to detect specific skill gaps and barriers
const REASON_TAGS = {
  "location_mismatch": ["area", "city", "location", "far", "distance", "commute", "relocate", "district"],
  "salary_too_low": ["salary", "pay", "wage", "low", "money", "income", "compensation", "offered"],
  "skill_mismatch": ["skill", "mismatch", "not match", "different", "qualification", "industry", "requirements"],
  "family_barriers": ["family", "marriage", "personal", "mother", "father", "child", "constraints"],
  "still_searching": ["searching", "looking", "still", "waiting", "interview"],
  "health_issues": ["health", "sick", "illness", "accident", "disabled", "issues"]
};

function tagReason(text) {
  if (!text) return [];
  const lowerText = text.toLowerCase();
  const tags = [];
  
  for (const [tag, keywords] of Object.entries(REASON_TAGS)) {
    if (keywords.some(kw => lowerText.includes(kw))) {
      tags.push(tag);
    }
  }
  
  return tags.length > 0 ? tags : ["other"];
}

async function runNLPAnalysis() {
  console.log("Starting NLP Analysis on non-placement reasons...");

  // 1. Fetch outcomes where trainee is not formally employed
  const { data: outcomes, error: fetchErr } = await supabase
    .from('employment_outcomes')
    .select('id, non_placement_reason')
    .in('outcome_type', ['unemployed', 'searching']);

  if (fetchErr) {
    console.error("Error fetching outcomes:", fetchErr);
    process.exit(1);
  }

  console.log(`Found ${outcomes.length} records to analyze.`);

  // 2. Tag each reason and update the database
  let updatedCount = 0;
  for (const outcome of outcomes) {
    if (outcome.non_placement_reason) {
      const tags = tagReason(outcome.non_placement_reason);
      
      const { error: updateErr } = await supabase
        .from('employment_outcomes')
        .update({ nlp_tags: tags })
        .eq('id', outcome.id);
        
      if (updateErr) {
        console.error(`Failed to update record ${outcome.id}:`, updateErr);
      } else {
        updatedCount++;
      }
    }
  }

  console.log(`NLP Analysis complete! Successfully tagged ${updatedCount} records in the database.`);
}

runNLPAnalysis().catch(console.error);
