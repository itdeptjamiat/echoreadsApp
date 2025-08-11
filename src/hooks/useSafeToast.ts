import { useContext } from 'react';
import { ToastContext } from '../context/ToastContext';

// Safe toast hook that provides fallback functions if ToastContext is not available
export const useSafeToast = () => {
  try {
    const context = useContext(ToastContext);
    if (context) {
      return context;
    }
  } catch (error) {
    // ToastContext not available
  }

  // Fallback functions
  return {
    showToast: (message: string, type: 'success' | 'error' | 'info') => {
      console.log(`${type.toUpperCase()}: ${message}`);
    },
    hideToast: () => {
      // No-op for fallback
    },
    toast: {
      visible: false,
      message: '',
      type: 'info' as 'success' | 'error' | 'info',
    },
  };
}; 