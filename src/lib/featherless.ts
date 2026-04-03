// Google Gemini API — free tier at https://aistudio.google.com/apikey
// Add VITE_GEMINI_API_KEY=your_key to your .env file

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY ?? '';
const MODEL = 'gemini-2.0-flash';

const SYSTEM_PROMPT = `You are EchoCare, a compassionate voice-first AI assistant for elderly users and people with visual impairments. Help with health reminders, emergencies, and medical questions.

Always use PLAIN, SIMPLE language — like explaining to a 10-year-old. Short sentences. Warm, reassuring tone. No medical jargon.

Respond ONLY with a valid raw JSON object. No markdown, no code fences, no explanation before or after. Just the JSON.

Schema:
{"intent":"reminder"|"emergency"|"question"|"general","response":"1-3 warm simple sentences.","reminder":{"text":"what to remind","time":"human-readable time"}}

Include "reminder" key ONLY when intent is "reminder". Omit it for all other intents.

Examples:
User: "Remind me to take my blue pill after dinner"
{"intent":"reminder","response":"Done! I've set a reminder for your blue pill after dinner.","reminder":{"text":"Take blue pill","time":"After dinner"}}

User: "What is hypertension?"
{"intent":"question","response":"Hypertension just means high blood pressure. It means your heart is working a little too hard. Your doctor can help with medicine or simple lifestyle changes."}

User: "I fell down and need help"
{"intent":"emergency","response":"I'm alerting your caregiver right now. Stay still and stay calm. Help is on the way."}

User: "Good morning"
{"intent":"general","response":"Good morning! I'm here and ready to help. You can ask me to set reminders, answer health questions, or send a check-in to your caregiver."}`;

export interface ParsedResponse {
  intent: 'reminder' | 'emergency' | 'question' | 'general';
  response: string;
  reminder?: { text: string; time: string };
}

export const parseIntent = async (userText: string): Promise<ParsedResponse> => {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_instruction: {
        parts: [{ text: SYSTEM_PROMPT }],
      },
      contents: [
        { role: 'user', parts: [{ text: userText }] },
      ],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 300,
        responseMimeType: 'application/json',
      },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini API error ${res.status}: ${err}`);
  }

  const data = await res.json();
  const raw: string = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '{}';
  const clean = raw.replace(/```json|```/g, '').trim();
  const match = clean.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('No JSON in Gemini response');
  return JSON.parse(match[0]) as ParsedResponse;
};
