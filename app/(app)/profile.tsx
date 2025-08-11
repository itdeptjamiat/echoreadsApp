import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../src/redux/store';
import { logoutUser, selectUser } from '../../src/redux/slices/authSlice';
import { useTheme } from '../../src/hooks/useTheme';

export default function ProfileScreen() {
  const theme = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector(selectUser);

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.scrollView}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Profile
        </Text>
        
        <View style={[styles.profileCard, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.profileName, { color: theme.colors.text }]}>
            {user?.name || 'User'}
          </Text>
          <Text style={[styles.profileEmail, { color: theme.colors.textSecondary }]}>
            {user?.email || 'user@example.com'}
          </Text>
          <Text style={[styles.profileUsername, { color: theme.colors.textTertiary }]}>
            @{user?.username || 'username'}
          </Text>
        </View>

        <View style={styles.menuSection}>
          <TouchableOpacity style={[styles.menuItem, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.menuItemText, { color: theme.colors.text }]}>
              Edit Profile
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.menuItem, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.menuItemText, { color: theme.colors.text }]}>
              Settings
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.menuItem, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.menuItemText, { color: theme.colors.text }]}>
              Help & Support
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.logoutButton, { backgroundColor: theme.colors.error }]}
          onPress={handleLogout}
        >
          <Text style={[styles.logoutButtonText, { color: theme.colors.text }]}>
            Logout
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  profileCard: {
    padding: 24,
    borderRadius: 16,
    marginBottom: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  profileEmail: {
    fontSize: 16,
    marginBottom: 4,
  },
  profileUsername: {
    fontSize: 14,
  },
  menuSection: {
    marginBottom: 24,
  },
  menuItem: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2.22,
    elevation: 3,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '500',
  },
  logoutButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
}); 