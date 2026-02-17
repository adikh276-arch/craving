import { supabase, setUserContext } from './supabase';

export async function upsertUser(userId: number): Promise<void> {
  await setUserContext(userId);
  const { error } = await supabase.from('users').upsert({ id: userId }, { onConflict: 'id' });
  if (error) throw error;
}

import { CravingLog } from '@/types/craving';

export async function saveCravingLog(userId: number, log: CravingLog) {
  await setUserContext(userId);
  const { error } = await supabase
    .from('craving_logs')
    .insert({
      user_id: userId,
      logged_at: log.timestamp,
      intensity: log.intensity,
      factors: log.factors,
      location: log.location,
      mood: log.mood,
      outcome: log.outcome === 'not_acted' ? 'not_acted_on' : 'smoked',
      quantity: log.quantity,
      coping_methods: log.copingMethods || [],
      notes: log.notes
    });
  if (error) throw error;
}

export async function getCravingLogs(userId: number): Promise<CravingLog[]> {
  await setUserContext(userId);
  const { data, error } = await supabase
    .from('craving_logs')
    .select('*')
    .eq('user_id', userId)
    .order('logged_at', { ascending: false });
  if (error) throw error;
  return data.map(d => ({
    id: d.id,
    timestamp: d.logged_at,
    intensity: d.intensity,
    factors: d.factors,
    location: d.location,
    mood: d.mood,
    outcome: d.outcome === 'not_acted_on' ? 'not_acted' : 'smoked',
    quantity: d.quantity,
    copingMethods: d.coping_methods,
    notes: d.notes
  }));
}

export async function deleteCravingLog(userId: number, id: string) {
  await setUserContext(userId);
  const { error } = await supabase
    .from('craving_logs')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);
  if (error) throw error;
}
