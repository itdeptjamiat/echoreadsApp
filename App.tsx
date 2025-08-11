import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet, Dimensions, ActivityIndicator, Text, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './src/context/AuthContext';
import { AlertProvider } from './src/context/AlertContext';
import { LibraryProvider } from './src/context/LibraryContext';
import LoginScreen from './src/screens/LoginScreen';
import SignupScreen from './src/screens/SignupScreen';
import EnhancedHomeScreen from './src/screens/EnhancedHomeScreen';
import EnhancedCategoriesScreen from './src/screens/EnhancedCategoriesScreen';
import EnhancedLibraryScreen from './src/screens/EnhancedLibraryScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import ReadlyStyleMagazineDetail from './src/screens/ReadlyStyleMagazineDetail';
import ReadlyStyleReadingScreen from './src/screens/ReadlyStyleReadingScreen';
import AudioPlayerScreen from './src/screens/AudioPlayerScreen';
import { Magazine } from './src/services/api';

export type RootStackParamList = {
  Login: undefined;
  Signup: undefined;
  Main: undefined;
  MagazineDetail: { magazineId: string; magazineData?: Magazine };
  Reading: { magazineId: string; magazineData: Magazine; content?: string };
  AudioPlayer: { magazineId: string; magazineData: Magazine; content: string };
};

const Stack = createStackNavigator<RootStackParamList>();

// Loading component
const LoadingScreen = () => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color="#f59e0b" />
  </View>
);

// Main app component with auth logic
const AppContent = () => {
  const { user, isLoading } = useAuth();
  const [navigationReady, setNavigationReady] = useState(false);

  console.log('AppContent - user:', user, 'isLoading:', isLoading, 'navigationReady:', navigationReady);

  useEffect(() => {
    // Restore navigation state when app starts
    const restoreNavigationState = async () => {
      try {
        const savedState = await AsyncStorage.getItem('navigation_state');
        if (savedState) {
          console.log('Restored navigation state:', savedState);
          // Force navigation state restoration
          setTimeout(() => {
            setNavigationReady(true);
          }, 50);
        } else {
          setNavigationReady(true);
        }
      } catch (error) {
        console.error('Error restoring navigation state:', error);
        setNavigationReady(true);
      }
    };

    if (user && !isLoading) {
      restoreNavigationState();
    } else if (!isLoading) {
      setNavigationReady(true);
    }
  }, [user, isLoading]);

  if (isLoading || !navigationReady) {
    return <LoadingScreen />;
  }

  // Ensure we always render the main navigator when authenticated
  if (user) {
    return (
      <View style={styles.navigationContainer}>
        <NavigationContainer
          onStateChange={(state) => {
            // Persist navigation state
            if (state) {
              AsyncStorage.setItem('navigation_state', JSON.stringify(state));
              // Ensure the main screen is always active
              if (state.routes && state.routes.length > 0) {
                const mainRoute = state.routes.find(route => route.name === 'Main');
                if (mainRoute) {
                  console.log('Main route is active, navbar should be visible');
                }
              }
            }
          }}
          onReady={() => {
            console.log('Navigation container is ready');
            // Force a re-render to ensure the navbar is visible
            setTimeout(() => {
              setNavigationReady(true);
            }, 100);
          }}
        >
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Main" component={MainNavigator} />
            <Stack.Screen name="MagazineDetail" component={ReadlyStyleMagazineDetail} />
            <Stack.Screen name="Reading" component={ReadlyStyleReadingScreen} />
            <Stack.Screen name="AudioPlayer" component={AudioPlayerScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </View>
    );
  }

  // Auth screens
  return (
    <View style={styles.mainContainer}>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Signup" component={SignupScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </View>
  );
};

// Main app wrapper with providers
export default function App() {
  return (
    <View style={styles.appContainer}>
      <SafeAreaProvider>
        <AlertProvider>
          <LibraryProvider>
            <AuthProvider>
              <AppContent />
            </AuthProvider>
          </LibraryProvider>
        </AlertProvider>
      </SafeAreaProvider>
    </View>
  );
}

// Main Navigator for authenticated users
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { AuthProvider } from './src/context/AuthContext';

const Tab = createBottomTabNavigator();

function MainNavigator() {
  const [isReady, setIsReady] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    // Ensure the tab navigator is properly initialized
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Add a fallback to ensure the tab navigator is always rendered
  useEffect(() => {
    // Force re-render after a short delay to ensure proper initialization
    const forceRenderTimer = setTimeout(() => {
      setIsReady(true);
    }, 200);

    return () => clearTimeout(forceRenderTimer);
  }, []);

  // Error boundary for navigation issues
  if (hasError) {
    return (
      <View style={styles.mainNavigatorContainer}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Navigation Error</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => {
              setHasError(false);
              setIsReady(true);
            }}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (!isReady) {
    return (
      <View style={styles.mainNavigatorContainer}>
        <View style={styles.loadingTabContainer}>
          <ActivityIndicator size="large" color="#f59e0b" />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.mainNavigatorContainer}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName: keyof typeof Ionicons.glyphMap;

            if (route.name === 'Home') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'Explore') {
              iconName = focused ? 'search' : 'search-outline';
            } else if (route.name === 'My Library') {
              iconName = focused ? 'library' : 'library-outline';
            } else if (route.name === 'Profile') {
              iconName = focused ? 'person' : 'person-outline';
            } else {
              iconName = 'help-outline';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#f59e0b',
          tabBarInactiveTintColor: '#a3a3a3',
          tabBarStyle: {
            backgroundColor: '#1a1a1a',
            borderTopColor: '#2a2a2a',
            borderTopWidth: 1,
            paddingBottom: Platform.OS === 'ios' ? 8 : 8,
            paddingTop: 8,
            height: Platform.OS === 'ios' ? 88 : 60,
            paddingHorizontal: 10,
            minHeight: Platform.OS === 'ios' ? 88 : 60,
            maxHeight: Platform.OS === 'ios' ? 88 : 60,
          },
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: '600',
            marginTop: 2,
            minHeight: 12,
          },
          tabBarIconStyle: {
            marginTop: 4,
            minHeight: 24,
            minWidth: 24,
          },
          headerShown: false,
        })}
      >
        <Tab.Screen name="Home" component={EnhancedHomeScreen} />
        <Tab.Screen name="Explore" component={EnhancedCategoriesScreen} />
        <Tab.Screen name="My Library" component={EnhancedLibraryScreen} />
        <Tab.Screen name="Profile" component={ProfileScreen} />
      </Tab.Navigator>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0a0a0a',
  },
  mainContainer: {
    flex: 1,
    minHeight: '100%',
    height: '100%',
    backgroundColor: '#0a0a0a',
    maxHeight: '100%',
  },
  appContainer: {
    flex: 1,
    backgroundColor: '#0a0a0a', // Set a background color for the app container
    height: '100%',
    minHeight: '100%',
    maxHeight: '100%',
  },
  navigationContainer: {
    flex: 1,
    height: '100%',
    minHeight: '100%',
    maxHeight: '100%',
  },
  mainNavigatorContainer: {
    flex: 1,
    minHeight: '100%',
    height: '100%',
    backgroundColor: '#0a0a0a',
  },
  loadingTabContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0a0a0a',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0a0a0a',
  },
  errorText: {
    color: '#f59e0b',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#f59e0b',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#0a0a0a',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
