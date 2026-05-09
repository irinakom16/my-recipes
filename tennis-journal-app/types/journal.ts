export type EntryType = 'training' | 'match' | 'recovery' | 'thoughts';

export type JournalEntry = {
  id: string;
  entryType: EntryType;
  title: string;
  durationMinutes?: number;
  intensity: number;
  energy: number;
  mood: number;
  notes: string;
  createdAt: string;
  training?: TrainingDetails;
  match?: MatchDetails;
  aiInsight?: AIInsight;
};

export type TrainingDetails = {
  serve: number;
  forehand: number;
  backhand: number;
  movement: number;
  tactics: number;
  mentalFocus: number;
  comments?: string;
};

export type MatchDetails = {
  opponent: string;
  surface: string;
  score: string;
  result: 'win' | 'loss' | 'draw' | 'practice';
  strengths: string;
  weaknesses: string;
  lessons: string;
};

export type AIInsight = {
  summary: string;
  whatWentWell: string[];
  needsAttention: string[];
  mentalNote: string;
  nextFocus: string;
  reflectionQuestion: string;
};
