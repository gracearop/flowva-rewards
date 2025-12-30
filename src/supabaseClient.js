// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js'

// 1. Get the URL and Key from the environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// 2. Throw an error if they are missing (helps debug setup issues immediately)
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase URL or Key. Check your .env file.')
}

// 3. Export the initialized client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)