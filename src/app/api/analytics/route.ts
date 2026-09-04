import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type')
  const supabase = createServiceClient()

  try {
    if (type === 'overview') {
      // For demo speed, returning mocked aggregated stats to match Team C's master plan
      // In production, this would query views like 'cohort_funnel' and 'district_placement_stats'
      return NextResponse.json({
        total_trainees: 150,
        placement_rate: 64.7,
        verified_employment: 42,
        female_pct: 43.2,
        outcomes_breakdown: {
          formal: 52, self_employed: 23, gig: 11, apprentice: 11,
          unemployed: 28, searching: 25
        }
      })
    }
    
    if (type === 'districts') {
      // Simulating a query grouping by district
      return NextResponse.json({
        data: [
          { district: "Pune", placement_rate: 78, total_trainees: 18 },
          { district: "Mumbai", placement_rate: 82, total_trainees: 14 },
          { district: "Gadchiroli", placement_rate: 24, total_trainees: 8 },
          { district: "Nanded", placement_rate: 28, total_trainees: 7 }
        ]
      })
    }

    return NextResponse.json({ error: 'Invalid analytics type requested' }, { status: 400 })

  } catch (err) {
    return NextResponse.json({ error: 'Analytics Error' }, { status: 500 })
  }
}
