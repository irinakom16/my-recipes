import { supabase } from '../lib/supabase';
import { JournalEntry } from '../types/journal';

export async function createJournalEntry(entry: Omit<JournalEntry, 'id' | 'createdAt'>) {
  const { data, error } = await supabase
    .from('journal_entries')
    .insert({
      entry_type: entry.entryType,
      title: entry.title,
      duration_minutes: entry.durationMinutes,
      intensity: entry.intensity,
      energy: entry.energy,
      mood: entry.mood,
      notes: entry.notes,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function getJournalEntries() {
  const { data, error } = await supabase
    .from('journal_entries')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data || [];
}

export async function saveAIInsight(entryId: string, insight: string) {
  const { data, error } = await supabase
    .from('ai_insights')
    .insert({
      entry_id: entryId,
      summary: insight,
      recommendations: insight,
      next_focus: '',
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}
