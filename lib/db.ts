import { supabase } from './supabase'

// ─── 型定義 ───────────────────────────────────────────
export type Profile = {
  id: string
  name: string
  name_initial: string
  rank: string
  next_rank: string
  rank_progress: number
  score: number
  streak: number
}

export type DailyRecord = {
  id: string
  user_id: string
  date: string
  calories: number
  protein: number
  weight: number
  score: number
  meal_count: number
  water_liters: number
  sleep_hours: number
  training_count: number
}

export type ChatMessage = {
  id: string
  user_id: string
  role: 'trainer' | 'user'
  text: string
  created_at: string
}

// ─── ユーザープロフィール取得 ───────────────────────────────────────────
export async function getProfile(): Promise<Profile | null> {
  if (!supabase) return null

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .limit(1)
    .single()

  if (error) {
    console.error('getProfile error:', error.message)
    return null
  }
  return data
}

// ─── 今日の記録を取得 ───────────────────────────────────────────
export async function getTodayRecord(userId: string): Promise<DailyRecord | null> {
  if (!supabase) return null

  const today = new Date().toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('daily_records')
    .select('*')
    .eq('user_id', userId)
    .eq('date', today)
    .limit(1)
    .single()

  if (error) {
    console.error('getTodayRecord error:', error.message)
    return null
  }
  return data
}

// ─── チャット履歴を取得 ───────────────────────────────────────────
export async function getChatMessages(userId: string): Promise<ChatMessage[]> {
  if (!supabase) return []

  const { data, error } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })
    .limit(20)

  if (error) {
    console.error('getChatMessages error:', error.message)
    return []
  }
  return data ?? []
}

// ─── チャットメッセージを保存 ───────────────────────────────────────────
export async function addChatMessage(
  userId: string,
  role: 'trainer' | 'user',
  text: string
): Promise<void> {
  if (!supabase) return

  const { error } = await supabase
    .from('chat_messages')
    .insert({ user_id: userId, role, text })

  if (error) {
    console.error('addChatMessage error:', error.message)
  }
}

// ─── 食事ログの型 ───────────────────────────────────────────
export type MealLog = {
  id: string
  user_id: string
  date: string
  meal_type: string
  foods: string
  total_calories: number
  total_protein: number
  total_carbs: number
  total_fat: number
  image_description: string
  created_at: string
}

// ─── 今日の栄養素合計 ───────────────────────────────────────────
export type TodayNutrition = {
  calories: number
  protein: number
  carbs: number
  fat: number
}

export async function getTodayNutrition(userId: string): Promise<TodayNutrition> {
  const zero = { calories: 0, protein: 0, carbs: 0, fat: 0 }
  if (!supabase) return zero

  const today = new Date().toISOString().split('T')[0]
  const { data, error } = await supabase
    .from('meal_logs')
    .select('total_calories, total_protein, total_carbs, total_fat')
    .eq('user_id', userId)
    .eq('date', today)

  if (error || !data || data.length === 0) return zero

  return data.reduce(
    (acc, row) => ({
      calories: acc.calories + (row.total_calories ?? 0),
      protein:  acc.protein  + (row.total_protein  ?? 0),
      carbs:    acc.carbs    + (row.total_carbs    ?? 0),
      fat:      acc.fat      + (row.total_fat      ?? 0),
    }),
    zero
  )
}

// ─── 食事ログ取得 ───────────────────────────────────────────
export async function getMealLogs(userId: string, date: string): Promise<MealLog[]> {
  if (!supabase) return []

  const { data, error } = await supabase
    .from('meal_logs')
    .select('*')
    .eq('user_id', userId)
    .eq('date', date)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('getMealLogs error:', error.message)
    return []
  }
  return data ?? []
}

// ─── 食事ログ保存 ───────────────────────────────────────────
export async function addMealLog(
  userId: string,
  data: {
    meal_type: string
    foods: string
    total_calories: number
    total_protein: number
    image_description: string
  }
): Promise<void> {
  if (!supabase) return

  const today = new Date().toISOString().split('T')[0]
  const { error } = await supabase
    .from('meal_logs')
    .insert({ user_id: userId, date: today, ...data })

  if (error) {
    console.error('addMealLog error:', error.message)
  }
}

// ─── スコア推移（過去7日）を取得 ───────────────────────────────────────────
export async function getScoreHistory(userId: string): Promise<number[]> {
  if (!supabase) return [58, 63, 70, 67, 75, 78, 82]

  const { data, error } = await supabase
    .from('daily_records')
    .select('score, date')
    .eq('user_id', userId)
    .order('date', { ascending: true })
    .limit(7)

  if (error || !data || data.length === 0) {
    return [58, 63, 70, 67, 75, 78, 82]
  }
  return data.map((r) => r.score)
}
