// ── Speech-to-Text ────────────────────────────────────────────────────────────

export const isSpeechSupported = (): boolean =>
  'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;

type SpeechCallbacks = {
  onInterim: (text: string) => void;
  onFinal: (text: string) => void;
  onError: (msg: string) => void;
  onEnd: () => void;
};

let recognition: SpeechRecognition | null = null;

export const startListening = (cb: SpeechCallbacks): void => {
  if (!isSpeechSupported()) {
    cb.onError('Speech recognition is not supported in this browser.');
    return;
  }

  const SR =
    (window as Window & { SpeechRecognition?: typeof SpeechRecognition; webkitSpeechRecognition?: typeof SpeechRecognition })
      .SpeechRecognition ??
    (window as Window & { webkitSpeechRecognition?: typeof SpeechRecognition })
      .webkitSpeechRecognition!;

  recognition = new SR();
  recognition.continuous = false;
  recognition.interimResults = true;
  recognition.lang = 'en-US';

  recognition.onresult = (e) => {
    let interim = '';
    let final = '';
    for (let i = e.resultIndex; i < e.results.length; i++) {
      const t = e.results[i][0].transcript;
      if (e.results[i].isFinal) final += t;
      else interim += t;
    }
    if (interim) cb.onInterim(interim);
    if (final) cb.onFinal(final);
  };

  recognition.onerror = (e) => {
    if (e.error !== 'no-speech' && e.error !== 'aborted') {
      cb.onError(`Mic error: ${e.error}`);
    }
    cb.onEnd();
  };

  recognition.onend = () => cb.onEnd();

  recognition.start();
};

export const stopListening = (): void => {
  recognition?.stop();
  recognition = null;
};

// ── Text-to-Speech ────────────────────────────────────────────────────────────

export const speak = (text: string, rate = 0.85, pitch = 1): void => {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.rate = rate;
  utter.pitch = pitch;
  window.speechSynthesis.speak(utter);
};

export const stopSpeaking = (): void => {
  window.speechSynthesis?.cancel();
};
