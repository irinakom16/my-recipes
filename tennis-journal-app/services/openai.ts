import { JournalEntry } from '../types/journal';

const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY;

export async function generateDailyInsight(entry: JournalEntry) {
  const prompt = `
You are an elite tennis coach.
Analyze this tennis journal entry.
Respond in Russian.

Entry:\n${JSON.stringify(entry, null, 2)}
`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4.1-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a professional tennis coach and sports psychologist.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
    }),
  });

  const data = await response.json();

  return data?.choices?.[0]?.message?.content || '';
}
