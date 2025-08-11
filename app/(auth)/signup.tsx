import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../src/redux/store';
import { signupUser, selectAuthLoading } from '../../src/redux/slices/authSlice';
import { FormProvider } from '../../src/form/FormProvider';
import { TextField } from '../../src/form/TextField';
import { useTheme } from '../../src/hooks/useTheme';

// Zod schema for form validation
const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type SignupFormData = z.infer<typeof signupSchema>;

export default function SignupScreen() {
  const theme = useTheme();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  
  const isLoading = useSelector(selectAuthLoading);

  const methods = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: '',
      username: '',
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: SignupFormData) => {
    try {
      await dispatch(signupUser(data)).unwrap();
      // Success toast is handled by Redux slice
      router.replace('/(app)');
    } catch (error: any) {
      // Error toast is handled by Redux slice
    }
  };

  const handleLogin = () => {
    router.push('/(auth)/login');
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Create Account
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          Join EchoReads and start reading
        </Text>

        <FormProvider methods={methods}>
          <TextField
            name="name"
            control={methods.control}
            label="Full Name"
            placeholder="Enter your full name"
            autoCapitalize="words"
          />

          <TextField
            name="username"
            control={methods.control}
            label="Username"
            placeholder="Choose a username"
            autoCapitalize="none"
          />

          <TextField
            name="email"
            control={methods.control}
            label="Email"
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <TextField
            name="password"
            control={methods.control}
            label="Password"
            placeholder="Create a password"
            secureTextEntry
          />

          <TouchableOpacity
            style={[
              styles.submitButton,
              { backgroundColor: theme.colors.primary },
              isLoading && styles.submitButtonDisabled,
            ]}
            onPress={methods.handleSubmit(onSubmit)}
            disabled={isLoading}
          >
            <Text style={[styles.submitButtonText, { color: theme.colors.text }]}>
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Text>
          </TouchableOpacity>
        </FormProvider>

        <TouchableOpacity
          style={styles.linkButton}
          onPress={handleLogin}
        >
          <Text style={[styles.linkText, { color: theme.colors.primary }]}>
            Already have an account? Sign in
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    maxWidth: 400,
    alignSelf: 'center',
    width: '100%',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
  },
  submitButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  linkButton: {
    alignItems: 'center',
    marginTop: 24,
  },
  linkText: {
    fontSize: 16,
    textDecorationLine: 'underline',
  },
}); 