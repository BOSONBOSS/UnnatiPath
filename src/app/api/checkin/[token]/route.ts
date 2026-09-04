import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

export async function GET(req: Request, { params }: { params: { token: string } }) {
  const supabase = createServiceClient()
  
  // 1. Find the touchpoint by token
  const { data: touchpoint, error } = await supabase
    .from('followup_touchpoints')
    .select('id, status, checkpoint_days, trainees(name_encrypted)')
    .eq('survey_token', params.token)
    .single()

  if (error || !touchpoint) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 404 })
  }

  if (touchpoint.status === 'responded') {
    return NextResponse.json({ already_done: true })
  }

  return NextResponse.json({
    checkpoint_days: touchpoint.checkpoint_days,
    trainee_name: touchpoint.trainees?.name_encrypted?.split(' ')[0] || 'there'
  })
}

export async function POST(req: Request, { params }: { params: { token: string } }) {
  try {
    const body = await req.json()
    const { employed, employer_name, salary_band, sector, reason } = body
    const supabase = createServiceClient()

    // 1. Get touchpoint details
    const { data: touchpoint } = await supabase
      .from('followup_touchpoints')
      .select('id, trainee_id, checkpoint_days, status')
      .eq('survey_token', params.token)
      .single()

    if (!touchpoint || touchpoint.status === 'responded') {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 })
    }

    const outcomeType = employed ? 'formal' : 'searching'

    // 2. Upsert Employment Outcome
    await supabase.from('employment_outcomes').upsert({
      trainee_id: touchpoint.trainee_id,
      outcome_type: outcomeType,
      salary_band: employed ? salary_band : null,
      sector: employed ? sector : null,
      non_placement_reason: !employed ? reason : null,
      verified_by: 'self',
      start_date: new Date().toISOString()
    }, { onConflict: 'trainee_id' })

    // 3. Mark touchpoint as responded
    await supabase.from('followup_touchpoints').update({
      status: 'responded',
      responded_at: new Date().toISOString(),
      response_data: body
    }).eq('id', touchpoint.id)

    // Determine badge to award
    const badgeMap: Record<number, string> = {
      30: 'starter',
      90: 'milestone_reporter',
      180: 'career_achiever',
      365: 'annual_champion'
    }

    return NextResponse.json({ 
      success: true, 
      badge: badgeMap[touchpoint.checkpoint_days] || 'starter',
      outcome_type: outcomeType 
    })

  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
