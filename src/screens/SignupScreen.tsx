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
import LoadingSpinner from '../components/LoadingSpinner';
import BeautifulAlert from '../components/BeautifulAlert';

const { width, height } = Dimensions.get('window');

const SignupScreen: React.FC<NavigationProps> = ({ navigation }) => {
  const { signup, isLoading, error, clearError } = useAuth();
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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

  const validateForm = () => {
    if (!name || !username || !email || !password || !confirmPassword) {
      showBeautifulAlert('Error', 'Please fill in all fields', 'error');
      return false;
    }

    if (password !== confirmPassword) {
      showBeautifulAlert('Error', 'Passwords do not match', 'error');
      return false;
    }

    if (password.length < 6) {
      showBeautifulAlert('Error', 'Password must be at least 6 characters long', 'error');
      return false;
    }

    if (username.length < 3) {
      showBeautifulAlert('Error', 'Username must be at least 3 characters long', 'error');
      return false;
    }

    return true;
  };

  const handleSignup = async () => {
    if (!email || !password || !username || !name) {
      showBeautifulAlert('Error', 'Please fill in all fields', 'error');
      return;
    }

    if (password.length < 6) {
      showBeautifulAlert('Error', 'Password must be at least 6 characters', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await signup({ email, password, username, name });

      if (result.success) {
        showBeautifulAlert('Success', 'Account created successfully! Welcome to EchoReads', 'success');
        // User will be automatically redirected by AuthContext
      } else {
        showBeautifulAlert('Error', result.message, 'error');
      }
    } catch (error) {
      showBeautifulAlert('Error', 'An unexpected error occurred', 'error');
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
          message="Creating your account..." 
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
                <TouchableOpacity 
                  style={styles.backButton}
                  onPress={() => navigation.goBack()}
                  disabled={isSubmitting}
                >
                  <Ionicons name="arrow-back" size={24} color="#f59e0b" />
                </TouchableOpacity>
                
                <View style={styles.logoContainer}>
                  <Ionicons name="book" size={width * 0.1} color="#0a0a0a" />
                </View>
                <Text style={styles.title}>
                  Create Account
                </Text>
                <Text style={styles.subtitle}>
                  Join our community of readers
                </Text>
              </View>

              {/* Signup Form */}
              <View style={styles.formCard}>
                <Text style={styles.formTitle}>
                  Get Started
                </Text>

                {/* Name Input */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Full Name</Text>
                  <View style={styles.inputWrapper}>
                    <Ionicons name="person" size={20} color="#f59e0b" />
                    <TextInput
                      style={styles.textInput}
                      placeholder="Enter your full name"
                      placeholderTextColor="#737373"
                      value={name}
                      onChangeText={setName}
                      autoCapitalize="words"
                      editable={!isSubmitting}
                    />
                  </View>
                </View>

                {/* Username Input */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Username</Text>
                  <View style={styles.inputWrapper}>
                    <Ionicons name="at" size={20} color="#f59e0b" />
                    <TextInput
                      style={styles.textInput}
                      placeholder="Choose a username"
                      placeholderTextColor="#737373"
                      value={username}
                      onChangeText={setUsername}
                      autoCapitalize="none"
                      editable={!isSubmitting}
                    />
                  </View>
                </View>

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
                      placeholder="Create a password"
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

                {/* Confirm Password Input */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Confirm Password</Text>
                  <View style={styles.inputWrapper}>
                    <Ionicons name="lock-closed" size={20} color="#f59e0b" />
                    <TextInput
                      style={styles.textInput}
                      placeholder="Confirm your password"
                      placeholderTextColor="#737373"
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      secureTextEntry={!showConfirmPassword}
                      editable={!isSubmitting}
                    />
                    <TouchableOpacity 
                      onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                      disabled={isSubmitting}
                    >
                      <Ionicons
                        name={showConfirmPassword ? 'eye-off' : 'eye'}
                        size={20}
                        color="#f59e0b"
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Signup Button */}
                <TouchableOpacity
                  style={[styles.signupButton, isSubmitting && styles.signupButtonDisabled]}
                  onPress={handleSignup}
                  disabled={isSubmitting}
                >
                  <Text style={styles.signupButtonText}>
                    Create Account
                  </Text>
                </TouchableOpacity>

                {/* Terms and Conditions */}
                <View style={styles.termsContainer}>
                  <Text style={styles.termsText}>
                    By creating an account, you agree to our{' '}
                    <Text style={styles.termsLink}>Terms of Service</Text>
                    {' '}and{' '}
                    <Text style={styles.termsLink}>Privacy Policy</Text>
                  </Text>
                </View>



                {/* Login Link */}
                <View style={styles.loginContainer}>
                  <Text style={styles.loginText}>Already have an account? </Text>
                  <TouchableOpacity 
                    onPress={() => navigation.navigate('Login')}
                    disabled={isSubmitting}
                  >
                    <Text style={styles.loginLink}>Sign In</Text>
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
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    justifyContent: 'center',
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
  signupButton: {
    backgroundColor: '#f59e0b',
    borderRadius: 12,
    paddingVertical: 16,
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  signupButtonDisabled: {
    backgroundColor: '#a3a3a3',
  },
  signupButtonText: {
    color: '#0a0a0a',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: Math.max(18, width * 0.045),
  },
  termsContainer: {
    marginBottom: 24,
  },
  termsText: {
    color: '#a3a3a3',
    fontSize: Math.max(12, width * 0.03),
    textAlign: 'center',
    lineHeight: 18,
  },
  termsLink: {
    color: '#f59e0b',
    fontWeight: '600',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  loginText: {
    color: '#e5e5e5',
    fontSize: Math.max(14, width * 0.035),
  },
  loginLink: {
    color: '#f59e0b',
    fontWeight: 'bold',
    fontSize: Math.max(14, width * 0.035),
  },
});

export default SignupScreen; 