import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI, LoginRequest, SignupRequest } from '../services/api';

interface User {
  _id: string;
  email: string;
  username: string;
  name: string;
  createdAt: string;
  isVerified: boolean;
  jwtToken: string;
  plan: string;
  profilePic: string;
  resetPasswordOtpVerified: boolean;
  uid: number;
  userType: string;
  __v: number;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<{ success: boolean; message: string }>;
  signup: (userData: SignupRequest) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  clearError: () => void;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load stored auth data on app start
  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('auth_token');
      const storedUser = await AsyncStorage.getItem('auth_user');
      
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Error loading stored auth:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const storeAuthData = async (userData: User, authToken: string) => {
    try {
      await AsyncStorage.setItem('auth_token', authToken);
      await AsyncStorage.setItem('auth_user', JSON.stringify(userData));
    } catch (error) {
      console.error('Error storing auth data:', error);
    }
  };

  const clearStoredAuth = async () => {
    try {
      await AsyncStorage.removeItem('auth_token');
      await AsyncStorage.removeItem('auth_user');
    } catch (error) {
      console.error('Error clearing stored auth:', error);
    }
  };

  const login = async (credentials: LoginRequest) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await authAPI.login(credentials);
      console.log('API Response:', response);
      
      // Check if response has user and token (API returns nested user structure)
      if (response.user && response.user.user && response.user.token) {
        console.log('Login successful, setting user:', response.user.user);
        setUser(response.user.user);
        setToken(response.user.token);
        await storeAuthData(response.user.user, response.user.token);
        return { success: true, message: 'Login successful!' };
      } else {
        console.log('Login failed:', response.message);
        setError(response.message);
        return { success: false, message: response.message };
      }
    } catch (error) {
      console.log('Login error:', error);
      const errorMessage = 'An unexpected error occurred during login.';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (userData: SignupRequest) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await authAPI.signup(userData);
      console.log('Signup API Response:', response);
      
      // Check if response has user and token (API returns nested user structure)
      if (response.user && response.user.user && response.user.token) {
        console.log('Signup successful, setting user:', response.user.user);
        setUser(response.user.user);
        setToken(response.user.token);
        await storeAuthData(response.user.user, response.user.token);
        return { success: true, message: 'Account created successfully!' };
      } else {
        console.log('Signup failed:', response.message);
        setError(response.message);
        return { success: false, message: response.message };
      }
    } catch (error) {
      console.log('Signup error:', error);
      const errorMessage = 'An unexpected error occurred during signup.';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setError(null);
    clearStoredAuth();
  };

  const clearError = () => {
    setError(null);
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    login,
    signup,
    logout,
    clearError,
    error,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 