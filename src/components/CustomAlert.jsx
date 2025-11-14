import { useEffect } from 'react';
import styles from '../styles/CustomAlert.module.css';

function CustomAlert({ message, onClose, type = 'info' }) {
  useEffect(() => {
    // Auto-close after 5 seconds
    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={`${styles.alertBox} ${styles[type]}`} onClick={(e) => e.stopPropagation()}>
        <div className={styles.iconContainer}>
          {type === 'error' && <span className={styles.icon}>⚠️</span>}
          {type === 'success' && <span className={styles.icon}>✓</span>}
          {type === 'info' && <span className={styles.icon}>ℹ️</span>}
        </div>
        <div className={styles.content}>
          <p className={styles.message}>{message}</p>
        </div>
        <button className={styles.closeButton} onClick={onClose}>
          ✕
        </button>
      </div>
    </div>
  );
}

export default CustomAlert;
