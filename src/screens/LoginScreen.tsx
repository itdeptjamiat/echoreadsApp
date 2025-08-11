import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Dimensions,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NavigationProps } from '../types';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';
import BeautifulAlert from '../components/BeautifulAlert';

const { width, height } = Dimensions.get('window');

const LoginScreen: React.FC<NavigationProps> = ({ navigation }) => {
  const { login, isLoading, error, clearError, user } = useAuth();
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alertState, setAlertState] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'info' as 'success' | 'error' | 'info',
  });

  // Clear error when component mounts
  useEffect(() => {
    clearError();
  }, []);

  // Check if user is already authenticated (should redirect automatically)
  useEffect(() => {
    if (user) {
      // User is already authenticated, will redirect automatically
    }
  }, [user]);

  const validateForm = () => {
    if (!email || !password) {
      showBeautifulAlert('Error', 'Please fill in all fields', 'error');
      return false;
    }
    return true;
  };

  const handleLogin = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await login({ email, password });

      if (result.success) {
        showToast('Login successful! Welcome back to EchoReads', 'success');
        // The AuthContext will handle the navigation automatically
      } else {
        showBeautifulAlert('Error', result.message, 'error');
      }
    } catch (error: any) {
      showBeautifulAlert('Error', error.message || 'An unexpected error occurred', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const showBeautifulAlert = (title: string, message: string, type: 'success' | 'error' | 'info') => {
    setAlertState({
      visible: true,
      title,
      message,
      type,
    });
  };

  const hideAlert = () => {
    setAlertState(prev => ({
      ...prev,
      visible: false,
    }));
  };

  // Don't render the form if user is already authenticated
  if (user) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#0a0a0a', '#1a1a1a', '#2a2a2a']}
          style={styles.backgroundGradient}
        />
        <View style={styles.loadingContainer}>
          <LoadingSpinner 
            message="Redirecting to main app..." 
            size="large" 
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Background Gradient */}
      <LinearGradient
        colors={['#0a0a0a', '#1a1a1a', '#2a2a2a']}
        style={styles.backgroundGradient}
      />

      {/* Loading Spinner */}
      {isSubmitting && (
        <LoadingSpinner 
          message="Signing you in..." 
          size="large" 
        />
      )}

      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.content}>
              {/* Header */}
              <View style={styles.header}>
                <View style={styles.logoContainer}>
                  <Ionicons name="book" size={width * 0.1} color="#0a0a0a" />
                </View>
                <Text style={styles.title}>Welcome Back</Text>
                <Text style={styles.subtitle}>Sign in to your EchoReads account</Text>
              </View>

              {/* Login Form */}
              <View style={styles.formCard}>
                <Text style={styles.formTitle}>
                  Welcome Back
                </Text>

                {/* Email Input */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Email Address</Text>
                  <View style={styles.inputWrapper}>
                    <Ionicons name="mail" size={20} color="#f59e0b" />
                    <TextInput
                      style={styles.textInput}
                      placeholder="Enter your email"
                      placeholderTextColor="#737373"
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      editable={!isSubmitting}
                    />
                  </View>
                </View>

                {/* Password Input */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Password</Text>
                  <View style={styles.inputWrapper}>
                    <Ionicons name="lock-closed" size={20} color="#f59e0b" />
                    <TextInput
                      style={styles.textInput}
                      placeholder="Enter your password"
                      placeholderTextColor="#737373"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPassword}
                      editable={!isSubmitting}
                    />
                    <TouchableOpacity 
                      onPress={() => setShowPassword(!showPassword)}
                      disabled={isSubmitting}
                    >
                      <Ionicons
                        name={showPassword ? 'eye-off' : 'eye'}
                        size={20}
                        color="#f59e0b"
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Login Button */}
                <TouchableOpacity
                  style={[styles.loginButton, isSubmitting && styles.loginButtonDisabled]}
                  onPress={handleLogin}
                  disabled={isSubmitting}
                >
                  <Text style={styles.loginButtonText}>
                    Sign In
                  </Text>
                </TouchableOpacity>

                {/* Forgot Password */}
                <TouchableOpacity style={styles.forgotPassword} disabled={isSubmitting}>
                  <Text style={styles.forgotPasswordText}>
                    Forgot your password?
                  </Text>
                </TouchableOpacity>

                {/* Sign Up Link */}
                <View style={styles.signupContainer}>
                  <Text style={styles.signupText}>Don't have an account? </Text>
                  <TouchableOpacity 
                    onPress={() => navigation.navigate('Signup')}
                    disabled={isSubmitting}
                  >
                    <Text style={styles.signupLink}>Create Account</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>

      {/* Beautiful Alert */}
      <BeautifulAlert
        visible={alertState.visible}
        title={alertState.title}
        message={alertState.message}
        type={alertState.type}
        onClose={hideAlert}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: Math.max(24, width * 0.06),
    paddingTop: Math.max(40, height * 0.05),
    paddingBottom: Math.max(20, height * 0.02),
  },
  header: {
    alignItems: 'center',
    marginBottom: Math.max(48, height * 0.06),
  },
  logoContainer: {
    width: Math.max(80, width * 0.2),
    height: Math.max(80, width * 0.2),
    backgroundColor: '#f59e0b',
    borderRadius: Math.max(40, width * 0.1),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    color: '#ffffff',
    fontSize: Math.max(32, width * 0.08),
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    color: '#e5e5e5',
    fontSize: Math.max(18, width * 0.045),
  },
  formCard: {
    backgroundColor: '#2d2d2d',
    borderRadius: 24,
    padding: Math.max(24, width * 0.06),
  },
  formTitle: {
    color: '#ffffff',
    fontSize: Math.max(24, width * 0.06),
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    color: '#e5e5e5',
    marginBottom: 8,
    fontWeight: '500',
    fontSize: Math.max(14, width * 0.035),
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  textInput: {
    flex: 1,
    marginLeft: 12,
    color: '#ffffff',
    fontSize: Math.max(16, width * 0.04),
  },
  loginButton: {
    backgroundColor: '#f59e0b',
    borderRadius: 12,
    paddingVertical: 16,
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  loginButtonDisabled: {
    backgroundColor: '#a3a3a3',
  },
  loginButtonText: {
    color: '#0a0a0a',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: Math.max(18, width * 0.045),
  },
  forgotPassword: {
    alignItems: 'center',
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: '#f59e0b',
    fontWeight: '500',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  signupText: {
    color: '#e5e5e5',
    fontSize: Math.max(14, width * 0.035),
  },
  signupLink: {
    color: '#f59e0b',
    fontWeight: 'bold',
    fontSize: Math.max(14, width * 0.035),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default LoginScreen; 