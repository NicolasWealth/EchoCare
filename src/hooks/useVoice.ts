import { useState, useCallback } from 'react';
import { startListening, stopListening, isSpeechSupported } from '../lib/speech';

export type VoiceState = 'idle' | 'listening' | 'processing';

interface UseVoiceReturn {
  state: VoiceState;
  transcript: string;
  supported: boolean;
  toggleListen: (onFinal: (text: string) => void) => void;
  setTranscript: (t: string) => void;
}

export const useVoice = (): UseVoiceReturn => {
  const [state, setState] = useState<VoiceState>('idle');
  const [transcript, setTranscript] = useState('');
  const supported = isSpeechSupported();

  const toggleListen = useCallback(
    (onFinal: (text: string) => void) => {
      if (state === 'listening') {
        stopListening();
        setState('idle');
        return;
      }

      setState('listening');
      setTranscript('');

      startListening({
        onInterim: (t) => setTranscript(t),
        onFinal: (t) => {
          setTranscript(t);
          setState('processing');
          onFinal(t);
        },
        onError: (msg) => {
          console.error(msg);
          setState('idle');
        },
        onEnd: () => {
          setState((prev) => (prev === 'listening' ? 'idle' : prev));
        },
      });
    },
    [state]
  );

  return { state, transcript, supported, toggleListen, setTranscript };
};
