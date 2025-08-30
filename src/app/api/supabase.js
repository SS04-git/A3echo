// api/supabase.js
import { createClient } from '@supabase/supabase-js'

// Using Next.js environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Debug logging
console.log('Environment check:')
console.log('- Supabase URL:', supabaseUrl ? 'Loaded' : 'Not loaded')
console.log('- Supabase Key:', supabaseAnonKey ? 'Loaded' : 'Not loaded')
console.log('- All env vars:', Object.keys(process.env).filter(key => key.startsWith('NEXT_PUBLIC_')))

// Create the client
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials in environment variables')
  console.error('Make sure your .env file contains:')
  console.error('NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co')
  console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key')
  throw new Error('Missing Supabase credentials. Check your .env file.')
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)
export default supabase

export const createUserProfile = async (user, username) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .insert([{ id: user.id, username }])
    
    if (error) throw error
    return { data, error: null }
  } catch (error) {
    return { data: null, error }
  }
}