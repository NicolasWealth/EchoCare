import { useState, useCallback, useRef } from 'react';

interface UseToastReturn {
  message: string;
  visible: boolean;
  show: (msg: string) => void;
}

export const useToast = (): UseToastReturn => {
  const [message, setMessage] = useState('');
  const [visible, setVisible] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback((msg: string) => {
    setMessage(msg);
    setVisible(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setVisible(false), 3000);
  }, []);

  return { message, visible, show };
};
