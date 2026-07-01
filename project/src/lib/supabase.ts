import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export function getSessionId(): string {
  let id = localStorage.getItem('arkaverse_session')
  if (!id) {
    id = `sess_${Date.now()}_${Math.random().toString(36).slice(2)}`
    localStorage.setItem('arkaverse_session', id)
  }
  return id
}
