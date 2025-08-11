import { useState, useCallback } from 'react';

interface AlertState {
  visible: boolean;
  title: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

export const useBeautifulAlert = () => {
  const [alertState, setAlertState] = useState<AlertState>({
    visible: false,
    title: '',
    message: '',
    type: 'info',
  });

  const showAlert = useCallback((title: string, message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setAlertState({
      visible: true,
      title,
      message,
      type,
    });
  }, []);

  const hideAlert = useCallback(() => {
    setAlertState(prev => ({
      ...prev,
      visible: false,
    }));
  }, []);

  const showSuccess = useCallback((title: string, message: string) => {
    showAlert(title, message, 'success');
  }, [showAlert]);

  const showError = useCallback((title: string, message: string) => {
    showAlert(title, message, 'error');
  }, [showAlert]);

  const showInfo = useCallback((title: string, message: string) => {
    showAlert(title, message, 'info');
  }, [showAlert]);

  return {
    alertState,
    showAlert,
    hideAlert,
    showSuccess,
    showError,
    showInfo,
  };
}; 