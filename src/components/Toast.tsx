import styles from './Toast.module.css';

interface Props {
  message: string;
  visible: boolean;
}

export const Toast = ({ message, visible }: Props) => (
  <div className={`${styles.toast} ${visible ? styles.show : ''}`}>
    {message}
  </div>
);
