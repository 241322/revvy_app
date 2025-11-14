import { useState, useCallback } from 'react';
import CustomAlert from '../components/CustomAlert';

export function useCustomAlert() {
  const [alert, setAlert] = useState(null);

  const showAlert = useCallback((message, type = 'info') => {
    setAlert({ message, type });
  }, []);

  const closeAlert = useCallback(() => {
    setAlert(null);
  }, []);

  const AlertComponent = alert ? (
    <CustomAlert
      message={alert.message}
      type={alert.type}
      onClose={closeAlert}
    />
  ) : null;

  return { showAlert, AlertComponent };
}
