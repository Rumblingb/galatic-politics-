import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export type Profile = {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  is_pro: boolean;
  created_at: string;
};

export type RosterRow = {
  id: string;
  user_id: string;
  politician_ids: string[];
  captain_id: string | null;
  dismissed_ids: string[];
  total_score: number;
  season: string;
  updated_at: string;
};

export async function getOrCreateProfile(userId: string, displayName?: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .upsert({ id: userId, display_name: displayName ?? null }, { onConflict: 'id' })
    .select()
    .single();

  if (error) {
    console.error('Profile upsert error:', error.message);
    return null;
  }
  return data as Profile;
}

export async function loadRoster(userId: string): Promise<RosterRow | null> {
  const { data, error } = await supabase
    .from('rosters')
    .select('*')
    .eq('user_id', userId)
    .eq('season', 'S1-2026')
    .maybeSingle();

  if (error) {
    console.error('Load roster error:', error.message);
    return null;
  }
  return data as RosterRow | null;
}

export async function saveRoster(userId: string, payload: Omit<RosterRow, 'id' | 'user_id' | 'updated_at'>) {
  const { error } = await supabase
    .from('rosters')
    .upsert({ user_id: userId, ...payload }, { onConflict: 'user_id,season' });

  if (error) {
    console.error('Save roster error:', error.message);
  }
}

export async function getLeaderboard(limit = 20) {
  const { data, error } = await supabase
    .from('leaderboard')
    .select('display_name, total_score, rank')
    .limit(limit);

  if (error) {
    console.error('Leaderboard error:', error.message);
    return [];
  }
  return data ?? [];
}
