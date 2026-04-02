export interface Reminder {
  id: number;
  text: string;
  time: string;
  createdAt: string;
}

const KEY = 'echocare_reminders';

export const loadReminders = (): Reminder[] => {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Reminder[]) : [];
  } catch {
    return [];
  }
};

export const saveReminders = (reminders: Reminder[]): void => {
  localStorage.setItem(KEY, JSON.stringify(reminders));
};

export const addReminder = (reminders: Reminder[], text: string, time: string): Reminder[] => {
  const next: Reminder[] = [
    ...reminders,
    { id: Date.now(), text, time, createdAt: new Date().toLocaleTimeString() },
  ];
  saveReminders(next);
  return next;
};

export const deleteReminder = (reminders: Reminder[], id: number): Reminder[] => {
  const next = reminders.filter((r) => r.id !== id);
  saveReminders(next);
  return next;
};
