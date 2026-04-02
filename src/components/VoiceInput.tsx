import { useState, useRef } from 'react';
import { VoiceState } from '../hooks/useVoice';
import styles from './VoiceInput.module.css';

interface Props {
  voiceState: VoiceState;
  transcript: string;
  supported: boolean;
  onToggleMic: () => void;
  onSubmit: (text: string) => void;
  loading: boolean;
}

export const VoiceInput = ({
  voiceState,
  transcript,
  supported,
  onToggleMic,
  onSubmit,
  loading,
}: Props) => {
  const [typed, setTyped] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    const val = typed.trim();
    if (!val || loading) return;
    setTyped('');
    onSubmit(val);
  };

  const isListening = voiceState === 'listening';

  const placeholder =
    voiceState === 'listening'
      ? 'Listening… speak now'
      : voiceState === 'processing'
      ? 'Processing…'
      : transcript || 'Say something like "Remind me to take my blue pill at 7 PM"';

  return (
    <div className={styles.card}>
      <p className={styles.label}>Speak or type a command</p>

      {/* Waveform */}
      <div className={`${styles.waveform} ${isListening ? styles.active : ''}`}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className={styles.bar}
            style={{ animationDelay: `${i * 0.08}s` }}
          />
        ))}
      </div>

      {/* Mic button */}
      {supported && (
        <button
          className={`${styles.micBtn} ${isListening ? styles.listening : ''}`}
          onClick={onToggleMic}
          aria-label={isListening ? 'Stop listening' : 'Start listening'}
          disabled={loading}
        >
          {isListening ? '🔴' : '🎙️'}
        </button>
      )}

      {/* Transcript display */}
      <div className={`${styles.transcriptBox} ${!transcript ? styles.placeholder : ''}`}>
        {placeholder}
      </div>

      {/* Text input */}
      <div className={styles.inputRow}>
        <input
          ref={inputRef}
          className={styles.input}
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder='Or type here… e.g. "Remind me to drink water at noon"'
          disabled={loading}
        />
        <button
          className={styles.sendBtn}
          onClick={handleSend}
          disabled={loading || !typed.trim()}
        >
          {loading ? '…' : 'Send'}
        </button>
      </div>

      {/* Quick commands */}
      <div className={styles.quickRow}>
        {[
          ['💊', 'Remind me to take my heart medication at 8 AM'],
          ['📖', 'What does hypertension mean in simple words?'],
          ['💧', 'Remind me to drink water every 2 hours'],
          ['⚕️', 'Is it safe to take aspirin with warfarin?'],
        ].map(([icon, cmd]) => (
          <button
            key={cmd}
            className={styles.quickBtn}
            onClick={() => onSubmit(cmd)}
            disabled={loading}
          >
            {icon} {cmd.length > 36 ? cmd.slice(0, 35) + '…' : cmd}
          </button>
        ))}
      </div>
    </div>
  );
};
