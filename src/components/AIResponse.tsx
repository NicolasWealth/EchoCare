import { ParsedResponse } from '../lib/featherless';
import styles from './AIResponse.module.css';

interface Props {
  data: ParsedResponse | null;
  loading: boolean;
}

const INTENT_META: Record<ParsedResponse['intent'], { label: string; cls: string }> = {
  reminder: { label: 'Reminder set', cls: styles.badgeReminder },
  emergency: { label: 'Emergency', cls: styles.badgeEmergency },
  question: { label: 'Health info', cls: styles.badgeQuestion },
  general: { label: 'General', cls: styles.badgeGeneral },
};

export const AIResponse = ({ data, loading }: Props) => {
  if (!loading && !data) return null;

  return (
    <div className={styles.card}>
      <div className={styles.top}>
        <span className={styles.label}>EchoCare AI</span>
        {data && (
          <span className={`${styles.badge} ${INTENT_META[data.intent].cls}`}>
            {INTENT_META[data.intent].label}
          </span>
        )}
      </div>

      {loading ? (
        <div className={styles.dots}>
          <span /><span /><span />
        </div>
      ) : (
        <p className={styles.text}>{data?.response}</p>
      )}
    </div>
  );
};
