import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import crypto from 'crypto'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { aadhaar_raw, phone, name, district, gender, caste_category, dob_year } = body

    if (!aadhaar_raw || !phone || !name || !district) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = createServiceClient()

    // 1. Generate the deterministic Skill ID using Aadhaar hash
    const salt = process.env.AADHAAR_SALT || 'default_dev_salt'
    const hash = crypto.createHash('sha256').update(aadhaar_raw + salt).digest('hex')
    const skillId = `MH-${hash.substring(0, 16).toUpperCase()}`

    // 2. Insert or fetch trainee (if they already registered for another course)
    const { data: existingTrainee } = await supabase
      .from('trainees')
      .select('id, skill_id')
      .eq('skill_id', skillId)
      .single()

    if (existingTrainee) {
      // Return 409 Conflict but include their existing Skill ID so the frontend can still show success
      return NextResponse.json({ 
        error: 'Trainee already registered', 
        skill_id: existingTrainee.skill_id,
        id: existingTrainee.id 
      }, { status: 409 })
    }

    // 3. Create new trainee record
    const { data: newTrainee, error: insertError } = await supabase
      .from('trainees')
      .insert({
        skill_id: skillId,
        phone_encrypted: phone, // In demo, raw phone is stored here to easily test Twilio
        name_encrypted: name,
        district,
        gender,
        caste_category,
        dob_year,
        consent_given: true,
        consent_at: new Date().toISOString()
      })
      .select()
      .single()

    if (insertError) {
      console.error('Insert error:', insertError)
      return NextResponse.json({ error: 'Database error creating trainee' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      skill_id: newTrainee.skill_id,
      id: newTrainee.id 
    }, { status: 201 })

  } catch (err) {
    console.error('API Error:', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
