import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ToastContextType {
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
  hideToast: () => void;
  toast: {
    visible: boolean;
    message: string;
    type: 'success' | 'error' | 'info';
  };
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export { ToastContext };

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toast, setToast] = useState({
    visible: false,
    message: '',
    type: 'info' as 'success' | 'error' | 'info',
  });

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({
      visible: true,
      message,
      type,
    });
  };

  const hideToast = () => {
    setToast(prev => ({
      ...prev,
      visible: false,
    }));
  };

  const value: ToastContextType = {
    showToast,
    hideToast,
    toast,
  };

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}; 