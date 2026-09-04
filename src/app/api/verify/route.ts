import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

export async function POST(req: Request) {
  try {
    const { token, pf_number, employer_name } = await req.json()
    const supabase = createServiceClient()

    // 1. In a real app, 'token' would securely identify the employer/outcome.
    // For the hackathon, we simulate finding the outcome based on the token context.
    // Assuming token maps to a specific employment_outcome id or we just verify the latest one for demo
    
    // Demo simplification: We verify an outcome directly based on trainee_id if passed, 
    // or just assume we have the outcome ID directly for the demo
    const { outcome_id } = await req.json() // Expecting the frontend to pass outcome_id for demo

    if (!outcome_id) {
        return NextResponse.json({ error: 'Missing outcome ID' }, { status: 400 })
    }

    // 2. Determine verification strength
    // If PF number is provided, we simulate an EPFO verification (strongest)
    // If no PF number, it's just Employer OTP verification
    const verifiedBy = pf_number ? 'epfo' : 'employer'

    const { error } = await supabase
      .from('employment_outcomes')
      .update({
        verified_by: verifiedBy,
        employer_id: null // In full app, we would link or create the employer record here
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
