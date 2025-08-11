import React from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './src/redux/store';
import { AuthProvider } from './src/context/AuthContext';
import { LibraryProvider } from './src/context/LibraryContext';
import { AlertProvider } from './src/context/AlertContext';
import { ToastProvider } from './src/context/ToastContext';
import AppNavigator from './src/navigation/AppNavigator';
import ErrorBoundary from './src/components/ErrorBoundary';
import BeautifulToast from './src/components/BeautifulToast';
import { useToast } from './src/context/ToastContext';

const AppContent = () => {
  const { toast, hideToast } = useToast();

  return (
    <>
      <AppNavigator />
      <BeautifulToast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={hideToast}
      />
    </>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <ToastProvider>
            <AlertProvider>
              <AuthProvider>
                <LibraryProvider>
                  <AppContent />
                </LibraryProvider>
              </AuthProvider>
            </AlertProvider>
          </ToastProvider>
        </PersistGate>
      </Provider>
    </ErrorBoundary>
  );
}


