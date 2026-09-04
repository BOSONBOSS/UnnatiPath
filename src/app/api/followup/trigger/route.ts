import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import twilio from 'twilio'
import crypto from 'crypto'

export async function POST(req: Request) {
  try {
    const { trainee_id, checkpoint_days = 90, target_phone } = await req.json()
    const supabase = createServiceClient()

    // 1. Fetch Trainee Details
    let traineeQuery = supabase
      .from('trainees')
      .select('id, phone_encrypted, name_encrypted');
      
    if (trainee_id !== 'demo-id') {
      traineeQuery = traineeQuery.eq('id', trainee_id);
    } else {
      // Demo mode: just grab the first trainee in the DB
      traineeQuery = traineeQuery.limit(1);
    }
    
    const { data } = await traineeQuery;
    const trainee = data?.[0];

    if (!trainee) return NextResponse.json({ error: 'Trainee not found (did you run the seed script?)' }, { status: 404 })

    // 2. Generate a secure random token for the survey link
    const surveyToken = crypto.randomUUID()
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const surveyLink = `${appUrl}/trainee/checkin/${surveyToken}`

    // 3. Save touchpoint to database as 'sent'
    await supabase.from('followup_touchpoints').insert({
      trainee_id: trainee.id,
      checkpoint_days,
      channel: 'sms',
      status: 'sent',
      survey_token: surveyToken,
      sent_at: new Date().toISOString()
    })

    // 4. Send SMS via Twilio
    const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
    const firstName = trainee.name_encrypted.split(' ')[0]

    // Use the explicitly provided phone number for the hackathon demo, 
    // otherwise fallback to the DB (which will likely fail Twilio validation if it's a fake number)
    const phoneToSendTo = target_phone || trainee.phone_encrypted;

    const message = await twilioClient.messages.create({
      body: `Hi ${firstName}! It's been ${checkpoint_days} days since your course. Please update your employment status to help improve Maharashtra's skilling programs: ${surveyLink}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneToSendTo
    })

    return NextResponse.json({ success: true, messageId: message.sid, link: surveyLink })

  } catch (err: any) {
    console.error('Trigger error:', err)
    return NextResponse.json({ error: err.message || 'Failed to trigger follow-up' }, { status: 500 })
  }
}
