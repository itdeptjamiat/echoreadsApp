import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { magazinesAPI, UserProfile } from '../services/api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

const { width, height } = Dimensions.get('window');

const UserProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user: authUser, logout } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authUser?.uid) {
      fetchUserProfile();
    }
  }, [authUser?.uid]);

  const fetchUserProfile = async () => {
    if (!authUser?.uid) return;
    
    try {
      setLoading(true);
      setError(null);
      const response = await magazinesAPI.getUserProfile(authUser.uid);
      if (response.success && response.user) {
        setUserProfile(response.user);
      } else {
        setError('Failed to fetch user profile');
      }
    } catch (err: any) {
      console.error('Error fetching user profile:', err);
      setError(err.message || 'Failed to fetch user profile');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchUserProfile();
    setRefreshing(false);
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            logout();
            navigation.navigate('Login' as never);
          },
        },
      ]
    );
  };

  const handleEditProfile = () => {
    Alert.alert('Edit Profile', 'Edit profile functionality coming soon!');
  };

  const handleChangePassword = () => {
    Alert.alert('Change Password', 'Change password functionality coming soon!');
  };

  const handleSettings = () => {
    Alert.alert('Settings', 'Settings functionality coming soon!');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner message="Loading profile..." size="large" type="dots" />
      </View>
    );
  }

  if (error || !userProfile) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#f59e0b" />
          <Text style={styles.errorTitle}>Oops!</Text>
          <Text style={styles.errorText}>{error || 'Failed to load profile'}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchUserProfile}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity style={styles.settingsButton} onPress={handleSettings}>
          <Ionicons name="settings-outline" size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <LinearGradient
            colors={['#f59e0b', '#f97316']}
            style={styles.profileGradient}
          >
            <View style={styles.profileImageContainer}>
              <Image
                source={{ uri: userProfile.profilePic || 'https://via.placeholder.com/120x120/666666/ffffff?text=U' }}
                style={styles.profileImage}
              />
              <TouchableOpacity style={styles.editImageButton}>
                <Ionicons name="camera" size={16} color="#ffffff" />
              </TouchableOpacity>
            </View>
            <Text style={styles.userName}>{userProfile.name}</Text>
            <Text style={styles.userUsername}>@{userProfile.username}</Text>
            <View style={styles.userTypeContainer}>
              <View style={[styles.userTypeBadge, userProfile.userType === 'admin' ? styles.adminBadge : styles.userBadge]}>
                <Text style={styles.userTypeText}>{userProfile.userType.toUpperCase()}</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Profile Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Ionicons name="calendar-outline" size={24} color="#f59e0b" />
            <Text style={styles.statValue}>Member since</Text>
            <Text style={styles.statLabel}>{formatDate(userProfile.createdAt)}</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="diamond-outline" size={24} color="#f59e0b" />
            <Text style={styles.statValue}>Plan</Text>
            <Text style={styles.statLabel}>{userProfile.plan.toUpperCase()}</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="checkmark-circle-outline" size={24} color="#f59e0b" />
            <Text style={styles.statValue}>Status</Text>
            <Text style={styles.statLabel}>{userProfile.isVerified ? 'Verified' : 'Unverified'}</Text>
          </View>
        </View>

        {/* Profile Information */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Profile Information</Text>
          
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Ionicons name="person-outline" size={20} color="#f59e0b" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Full Name</Text>
                <Text style={styles.infoValue}>{userProfile.name}</Text>
              </View>
            </View>
            
            <View style={styles.infoRow}>
              <Ionicons name="at-outline" size={20} color="#f59e0b" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Username</Text>
                <Text style={styles.infoValue}>@{userProfile.username}</Text>
              </View>
            </View>
            
            <View style={styles.infoRow}>
              <Ionicons name="mail-outline" size={20} color="#f59e0b" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>{userProfile.email}</Text>
              </View>
            </View>
            
            <View style={styles.infoRow}>
              <Ionicons name="id-card-outline" size={20} color="#f59e0b" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>User ID</Text>
                <Text style={styles.infoValue}>{userProfile.uid}</Text>
              </View>
            </View>
            
            <View style={styles.infoRow}>
              <Ionicons name="shield-outline" size={20} color="#f59e0b" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>User Type</Text>
                <View style={styles.badgeContainer}>
                  <View style={[styles.badge, userProfile.userType === 'admin' ? styles.adminBadge : styles.userBadge]}>
                    <Text style={styles.badgeText}>{userProfile.userType.toUpperCase()}</Text>
                  </View>
                </View>
              </View>
            </View>
            
            <View style={styles.infoRow}>
              <Ionicons name="diamond-outline" size={20} color="#f59e0b" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Plan</Text>
                <View style={styles.badgeContainer}>
                  <View style={[styles.badge, userProfile.plan === 'premium' ? styles.premiumBadge : styles.freeBadge]}>
                    <Text style={styles.badgeText}>{userProfile.plan.toUpperCase()}</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Account Actions */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Account Actions</Text>
          
          <View style={styles.actionsCard}>
            <TouchableOpacity style={styles.actionItem} onPress={handleEditProfile}>
              <Ionicons name="create-outline" size={24} color="#f59e0b" />
              <Text style={styles.actionText}>Edit Profile</Text>
              <Ionicons name="chevron-forward" size={20} color="#666666" />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionItem} onPress={handleChangePassword}>
              <Ionicons name="key-outline" size={24} color="#f59e0b" />
              <Text style={styles.actionText}>Change Password</Text>
              <Ionicons name="chevron-forward" size={20} color="#666666" />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionItem} onPress={handleSettings}>
              <Ionicons name="settings-outline" size={24} color="#f59e0b" />
              <Text style={styles.actionText}>Settings</Text>
              <Ionicons name="chevron-forward" size={20} color="#666666" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Logout Section */}
        <View style={styles.logoutSection}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color="#ffffff" />
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: '#a3a3a3',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#f59e0b',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  profileHeader: {
    marginBottom: 24,
  },
  profileGradient: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#ffffff',
  },
  editImageButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#f59e0b',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  userUsername: {
    fontSize: 16,
    color: '#e5e5e5',
    marginBottom: 12,
  },
  userTypeContainer: {
    marginTop: 8,
  },
  userTypeBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  adminBadge: {
    backgroundColor: '#f59e0b',
  },
  userBadge: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#f59e0b',
  },
  userTypeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 24,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 14,
    color: '#a3a3a3',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  infoSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginHorizontal: 20,
    marginBottom: 16,
  },
  infoCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
  },
  infoContent: {
    flex: 1,
    marginLeft: 16,
  },
  infoLabel: {
    fontSize: 14,
    color: '#a3a3a3',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  premiumBadge: {
    backgroundColor: '#f59e0b',
  },
  freeBadge: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#f59e0b',
  },
  badgeText: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '600',
  },
  actionsSection: {
    marginBottom: 24,
  },
  actionsCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    marginHorizontal: 20,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
  },
  actionText: {
    flex: 1,
    fontSize: 16,
    color: '#ffffff',
    marginLeft: 16,
  },
  logoutSection: {
    marginBottom: 32,
  },
  logoutButton: {
    backgroundColor: '#dc2626',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginHorizontal: 20,
  },
  logoutButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default UserProfileScreen; 