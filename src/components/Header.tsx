import styles from './Header.module.css';

export const Header = () => (
  <header className={styles.header}>
    <div className={styles.logo}>
      <div className={styles.logoDot}>🩺</div>
      <span className={styles.logoText}>
        <em>Echo</em>Care
      </span>
    </div>
    <span className={styles.badge}>Voice-First AI</span>
  </header>
);
