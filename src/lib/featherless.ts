// Anthropic API client for EchoCare
// Get your API key at: https://console.anthropic.com
// Add VITE_ANTHROPIC_API_KEY to your .env file

const API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY ?? '';

const SYSTEM_PROMPT = `You are EchoCare, a compassionate voice-first AI assistant built for elderly users and people with visual impairments. Your mission is to help them manage health reminders, handle emergencies, and understand medical information.

Always respond in PLAIN, SIMPLE language — like explaining to a 10-year-old. No jargon. Short sentences. Warm, reassuring tone.

Respond ONLY with valid raw JSON. No markdown, no code blocks, no preamble. Just the JSON object.

Schema:
{
  "intent": "reminder" | "emergency" | "question" | "general",
  "response": "Your short, warm reply in 1–3 sentences.",
  "reminder": { "text": "what to remind", "time": "human-readable time string" }
}

The "reminder" field is ONLY included when intent is "reminder". Omit it entirely for other intents.

Examples:

User: "Remind me to take my blue pill after dinner"
{"intent":"reminder","response":"Done! I've set a reminder for your blue pill after dinner. I'll make sure you don't forget.","reminder":{"text":"Take blue pill","time":"After dinner"}}

User: "What is hypertension?"
{"intent":"question","response":"Hypertension is just a fancy word for high blood pressure. It means your heart is working a bit too hard. Your doctor can help manage it with medicine or small lifestyle changes."}

User: "I need help, I fell down"
{"intent":"emergency","response":"I'm sending a help alert to your caregiver right now. Stay calm and stay still. Help is on the way."}

User: "Good morning"
{"intent":"general","response":"Good morning! I'm here and ready to help you today. You can ask me to set reminders, answer health questions, or send a check-in to your caregiver."}`;

export interface ParsedResponse {
  intent: 'reminder' | 'emergency' | 'question' | 'general';
  response: string;
  reminder?: { text: string; time: string };
}

export const parseIntent = async (userText: string): Promise<ParsedResponse> => {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 300,
      system: SYSTEM_PROMPT,
      messages: [
        { role: 'user', content: userText },
      ],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Anthropic API error ${res.status}: ${err}`);
  }

  const data = await res.json();
  const raw: string = data.content?.[0]?.text ?? '{}';
  const clean = raw.replace(/```json|```/g, '').trim();
  return JSON.parse(clean) as ParsedResponse;
};
