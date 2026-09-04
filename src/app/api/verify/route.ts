import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

export async function POST(req: Request) {
  try {
    const { token, pf_number, employer_name, outcome_id } = await req.json()
    const supabase = createServiceClient()

    if (!outcome_id) {
      return NextResponse.json({ error: 'Missing outcome ID' }, { status: 400 })
    }

    // Determine verification strength
    // If PF number is provided, we simulate an EPFO verification (strongest)
    // If no PF number, it's just Employer OTP verification
    const verifiedBy = pf_number ? 'epfo' : 'employer'

    const { error } = await supabase
      .from('employment_outcomes')
      .update({
        verified_by: verifiedBy,
        employer_id: null
      })
      .eq('id', outcome_id)

    if (error) {
      return NextResponse.json({ error: 'Database update failed' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      verified_by: verifiedBy 
    })

  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
