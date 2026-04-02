import { useState } from 'react';
import { Header } from './components/Header';
import { VoiceInput } from './components/VoiceInput';
import { AIResponse } from './components/AIResponse';
import { ReminderList } from './components/ReminderList';
import { CheckIn } from './components/CheckIn';
import { Toast } from './components/Toast';
import { useVoice } from './hooks/useVoice';
import { useToast } from './hooks/useToast';
import { parseIntent, ParsedResponse } from './lib/featherless';
import { speak } from './lib/speech';
import {
  loadReminders,
  addReminder,
  deleteReminder,
  Reminder,
} from './lib/storage';
import styles from './App.module.css';

const CAREGIVER_EMAIL = import.meta.env.VITE_CAREGIVER_EMAIL ?? 'caregiver@example.com';

export default function App() {
  const [aiData, setAiData] = useState<ParsedResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [reminders, setReminders] = useState<Reminder[]>(loadReminders);

  const voice = useVoice();
  const toast = useToast();

  const handleSubmit = async (text: string) => {
    if (!text.trim() || loading) return;
    setLoading(true);
    setAiData(null);
    voice.setTranscript(text);

    try {
      const result = await parseIntent(text);
      setAiData(result);
      speak(result.response);

      if (result.intent === 'reminder' && result.reminder) {
        setReminders((prev) =>
          addReminder(prev, result.reminder!.text, result.reminder!.time)
        );
        toast.show(`✅ Reminder set: ${result.reminder.text}`);
      }

      if (result.intent === 'emergency') {
        triggerEmergency();
      }
    } catch (err) {
      console.error('[EchoCare] API error:', err);
      toast.show('⚠️ Connection error — check your API key in .env');
      setAiData({
        intent: 'general',
        response:
          'Sorry, I had trouble connecting. Please check your internet connection and API key.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleMic = () => {
    voice.toggleListen((finalText) => {
      handleSubmit(finalText);
    });
  };

  const triggerEmergency = () => {
    toast.show('🚨 Help alert sent to caregiver!');
    speak('Sending a help alert to your caregiver right now. Stay calm, help is on the way.');
    // Opens the user's email client pre-filled — works in any browser, no backend needed.
    const subject = encodeURIComponent('EchoCare EMERGENCY Alert');
    const body = encodeURIComponent(
      `This is an automated emergency alert from EchoCare.\n\nThe user has requested immediate assistance.\n\nPlease check on them right away.\n\nSent at: ${new Date().toLocaleString()}`
    );
    window.open(`mailto:${CAREGIVER_EMAIL}?subject=${subject}&body=${body}`);
  };

  const handleSafe = () => {
    toast.show('✅ Safe check-in sent!');
    speak("Great! I've let your caregiver know you're safe.");
    const subject = encodeURIComponent('EchoCare Safe Check-In');
    const body = encodeURIComponent(
      `This is a safe check-in from EchoCare.\n\nThe user is doing well and wanted to let you know.\n\nSent at: ${new Date().toLocaleString()}`
    );
    window.open(`mailto:${CAREGIVER_EMAIL}?subject=${subject}&body=${body}`);
  };

  const handleDeleteReminder = (id: number) => {
    setReminders((prev) => deleteReminder(prev, id));
    toast.show('Reminder removed');
  };

  return (
    <div className={styles.app}>
      <Header />

      <main className={styles.main}>
        <VoiceInput
          voiceState={voice.state}
          transcript={voice.transcript}
          supported={voice.supported}
          onToggleMic={handleToggleMic}
          onSubmit={handleSubmit}
          loading={loading}
        />

        <AIResponse data={aiData} loading={loading} />

        <div className={styles.grid}>
          <ReminderList reminders={reminders} onDelete={handleDeleteReminder} />
          <CheckIn
            onEmergency={triggerEmergency}
            onSafe={handleSafe}
            caregiverEmail={CAREGIVER_EMAIL}
          />
        </div>
      </main>

      <Toast message={toast.message} visible={toast.visible} />
    </div>
  );
}
