import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const twilioSid = process.env.TWILIO_ACCOUNT_SID
const twilioToken = process.env.TWILIO_AUTH_TOKEN
const twilioPhone = process.env.TWILIO_PHONE_NUMBER

console.log('--- Config Check ---')
console.log('Supabase URL:', supabaseUrl ? 'Set' : 'Missing')
console.log('Supabase Key:', supabaseKey ? 'Set' : 'Missing')
console.log('Twilio SID:', twilioSid ? 'Set' : 'Missing')
console.log('Twilio Token:', twilioToken ? 'Set' : 'Missing')
console.log('Twilio Phone:', twilioPhone ? 'Set' : 'Missing')

const supabase = createClient(supabaseUrl, supabaseKey)

async function test() {
  console.log('\n--- Database Check ---')
  const { data, error } = await supabase.from('trainees').select('*').limit(1)
  
  if (error) {
    console.error('Supabase Error:', error.message)
  } else if (!data || data.length === 0) {
    console.log('ERROR: No trainees in the database! Did you run seed_data.mjs?')
  } else {
    console.log('Success: Found a trainee in the database.')
    console.log(data[0].id, data[0].name_encrypted, data[0].phone_encrypted)
  }
}

test()
