import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// URLが未設定の場合はnullを返す（モックデータにフォールバック）
export const supabase: SupabaseClient | null =
  supabaseUrl && supabaseUrl.startsWith('http') && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null
