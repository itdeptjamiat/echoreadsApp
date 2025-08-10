import React, { createContext, useContext, useState, ReactNode } from 'react';
import BeautifulAlert from '../components/BeautifulAlert';

interface AlertState {
  visible: boolean;
  title: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface AlertContextType {
  showAlert: (title: string, message: string, type: 'success' | 'error' | 'info') => void;
  showSuccess: (title: string, message: string) => void;
  showError: (title: string, message: string) => void;
  showInfo: (title: string, message: string) => void;
  hideAlert: () => void;
  alertState: AlertState;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
};

interface AlertProviderProps {
  children: ReactNode;
}

export const AlertProvider: React.FC<AlertProviderProps> = ({ children }) => {
  const [alertState, setAlertState] = useState<AlertState>({
    visible: false,
    title: '',
    message: '',
    type: 'info',
  });

  const showAlert = (title: string, message: string, type: 'success' | 'error' | 'info') => {
    setAlertState({
      visible: true,
      title,
      message,
      type,
    });
  };

  const showSuccess = (title: string, message: string) => {
    showAlert(title, message, 'success');
  };

  const showError = (title: string, message: string) => {
    showAlert(title, message, 'error');
  };

  const showInfo = (title: string, message: string) => {
    showAlert(title, message, 'info');
  };

  const hideAlert = () => {
    setAlertState(prev => ({
      ...prev,
      visible: false,
    }));
  };

  const value: AlertContextType = {
    showAlert,
    showSuccess,
    showError,
    showInfo,
    hideAlert,
    alertState,
  };

  return (
    <AlertContext.Provider value={value}>
      {children}
      <BeautifulAlert
        visible={alertState.visible}
        title={alertState.title}
        message={alertState.message}
        type={alertState.type}
        onClose={hideAlert}
      />
    </AlertContext.Provider>
  );
}; 