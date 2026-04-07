import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

const MISSING = !supabaseUrl || !supabaseAnonKey ||
  supabaseUrl === 'https://placeholder.supabase.co'

export const supabaseMissing = MISSING

// Use real values or safe fallbacks that won't throw
export const supabase = createClient(
  MISSING ? 'https://xyzcompany.supabase.co' : supabaseUrl,
  MISSING ? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5emNvbXBhbnkiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYwMDAwMDAwMCwiZXhwIjoxOTAwMDAwMDAwfQ.placeholder' : supabaseAnonKey,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  }
)
