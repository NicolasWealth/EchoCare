import styles from './CheckIn.module.css';

interface Props {
  onEmergency: () => void;
  onSafe: () => void;
  caregiverEmail: string;
}

export const CheckIn = ({ onEmergency, onSafe, caregiverEmail }: Props) => (
  <div className={styles.card}>
    <p className={styles.title}>🚨 Check-In</p>

    <button className={styles.emergencyBtn} onClick={onEmergency}>
      <span className={styles.icon}>🆘</span>
      <div className={styles.info}>
        <span className={styles.emergencyTitle}>Send Help Alert</span>
        <span className={styles.sub}>Notifies your caregiver immediately</span>
      </div>
    </button>

    <button className={styles.safeBtn} onClick={onSafe}>
      <span className={styles.safeIcon}>✅</span>
      <span className={styles.safeTitle}>I'm Safe — Check In</span>
    </button>

    <p className={styles.caregiverRow}>
      Caregiver: <span className={styles.caregiverEmail}>{caregiverEmail}</span>
    </p>
  </div>
);
