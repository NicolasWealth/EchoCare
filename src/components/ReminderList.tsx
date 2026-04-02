import { Reminder } from '../lib/storage';
import styles from './ReminderList.module.css';

interface Props {
  reminders: Reminder[];
  onDelete: (id: number) => void;
}

export const ReminderList = ({ reminders, onDelete }: Props) => (
  <div className={styles.card}>
    <p className={styles.title}>🕐 Reminders</p>

    {reminders.length === 0 ? (
      <p className={styles.empty}>No reminders yet — ask me to set one!</p>
    ) : (
      <ul className={styles.list}>
        {reminders.map((r) => (
          <li key={r.id} className={styles.item}>
            <div className={styles.dot} />
            <div className={styles.content}>
              <span className={styles.text}>{r.text}</span>
              <span className={styles.time}>{r.time}</span>
            </div>
            <button
              className={styles.deleteBtn}
              onClick={() => onDelete(r.id)}
              aria-label="Delete reminder"
            >
              ✕
            </button>
          </li>
        ))}
      </ul>
    )}
  </div>
);
