import { useEffect } from 'react';
import styles from './Toast.module.css';

interface ToastProps {
  message: string;
  visible: boolean;
  onHide: () => void;
}

export default function Toast({ message, visible, onHide }: ToastProps) {
  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(onHide, 2000);
    return () => clearTimeout(timer);
  }, [visible, onHide]);

  if (!visible) return null;

  return (
    <div className={styles.toast}>
      <span className={styles.icon}>✓</span>
      {message}
    </div>
  );
}
