import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
  ScrollView,
  Image,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import { magazinesAPI, UserProfile } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import EditProfileModal from '../components/EditProfileModal';

const { width, height } = Dimensions.get('window');

const ProfileScreen: React.FC = () => {
  const { user: authUser, logout } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    console.log('ProfileScreen useEffect - authUser:', authUser);
    if (authUser?.uid) {
      console.log('Starting to fetch profile for UID:', authUser.uid);
      fetchUserProfile();
    } else {
      console.log('No authUser or uid, setting loading to false');
      setLoading(false);
    }
  }, [authUser?.uid]);

  // Debug useEffect to monitor state changes
  useEffect(() => {
    console.log('ProfileScreen state changed - userProfile:', userProfile, 'loading:', loading, 'error:', error);
  }, [userProfile, loading, error]);

  const fetchUserProfile = async () => {
    if (!authUser?.uid) {
      console.log('No authUser or uid found:', authUser);
      setError('User not authenticated');
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      setUserProfile(null); // Clear previous profile data
      console.log('Fetching profile for UID:', authUser.uid);
      const response = await magazinesAPI.getUserProfile(authUser.uid);
      console.log('Profile response:', response);
      
      if (response && response.user) {
        console.log('Setting user profile:', response.user);
        setUserProfile(response.user);
        setError(null); // Clear any previous errors
      } else {
        console.log('Invalid response structure:', response);
        setError('Failed to fetch user profile - invalid response');
      }
    } catch (err: any) {
      console.error('Error fetching user profile:', err);
      setError(err.message || 'Failed to fetch user profile');
      setUserProfile(null); // Clear profile data on error
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
          onPress: logout,
        },
      ]
    );
  };

  const handleEditProfile = () => {
    setShowEditModal(true);
  };

  const handleProfileUpdated = (updatedProfile: UserProfile) => {
    setUserProfile(updatedProfile);
    setShowEditModal(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const profileMenuItems = [
    {
      id: '1',
      title: 'My Reading List',
      icon: 'bookmark-outline',
      count: 12,
      onPress: () => Alert.alert('Reading List', 'Reading list functionality coming soon!'),
    },
    {
      id: '2',
      title: 'Downloaded Articles',
      icon: 'download-outline',
      count: 5,
      onPress: () => Alert.alert('Downloads', 'Downloads functionality coming soon!'),
    },
    {
      id: '3',
      title: 'Reading History',
      icon: 'time-outline',
      count: 28,
      onPress: () => Alert.alert('History', 'Reading history functionality coming soon!'),
    },
    {
      id: '4',
      title: 'Settings',
      icon: 'settings-outline',
      onPress: () => Alert.alert('Settings', 'Settings functionality coming soon!'),
    },
    {
      id: '5',
      title: 'Help & Support',
      icon: 'help-circle-outline',
      onPress: () => Alert.alert('Help', 'Help & Support functionality coming soon!'),
    },
    {
      id: '6',
      title: 'About',
      icon: 'information-circle-outline',
      onPress: () => Alert.alert('About', 'About functionality coming soon!'),
    },
  ];

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner message="Loading profile..." size="large" type="dots" />
      </View>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#f59e0b" />
          <Text style={styles.errorTitle}>Oops!</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchUserProfile}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!userProfile) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#f59e0b" />
          <Text style={styles.errorTitle}>No Profile Data</Text>
          <Text style={styles.errorText}>Unable to load profile information</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchUserProfile}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Profile</Text>
      <TouchableOpacity style={styles.notificationButton}>
        <Ionicons name="notifications-outline" size={24} color="#f59e0b" />
      </TouchableOpacity>
    </View>
  );

  const renderUserInfo = () => (
    <View style={styles.userInfoCard}>
      <LinearGradient
        colors={['#f59e0b', '#f97316']}
        style={styles.userInfoGradient}
      >
        <View style={styles.avatarContainer}>
          <Image
            source={{ uri: userProfile.profilePic || 'https://via.placeholder.com/120x120/666666/ffffff?text=U' }}
            style={styles.avatar}
          />
          <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
            <Ionicons name="camera" size={16} color="#ffffff" />
          </TouchableOpacity>
        </View>
        
        <Text style={styles.userName}>{userProfile.name}</Text>
        <Text style={styles.userUsername}>@{userProfile.username}</Text>
        
        <View style={styles.userStats}>
          <View style={styles.statItem}>
            <Ionicons name="calendar-outline" size={20} color="#ffffff" />
            <Text style={styles.statValue}>Member since</Text>
            <Text style={styles.statLabel}>{formatDate(userProfile.createdAt)}</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="diamond-outline" size={20} color="#ffffff" />
            <Text style={styles.statValue}>Plan</Text>
            <Text style={styles.statLabel}>{userProfile.plan.toUpperCase()}</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="shield-outline" size={20} color="#ffffff" />
            <Text style={styles.statValue}>Status</Text>
            <Text style={styles.statLabel}>{userProfile.isVerified ? 'Verified' : 'Unverified'}</Text>
          </View>
        </View>

        <View style={styles.userTypeContainer}>
          <View style={[styles.userTypeBadge, userProfile.userType === 'admin' ? styles.adminBadge : styles.userBadge]}>
            <Text style={styles.userTypeText}>{userProfile.userType.toUpperCase()}</Text>
          </View>
        </View>

        {/* Edit Profile Button */}
        <TouchableOpacity style={styles.editProfileButton} onPress={handleEditProfile}>
          <Ionicons name="create-outline" size={20} color="#ffffff" />
          <Text style={styles.editProfileButtonText}>Edit Profile</Text>
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );

  const renderMenuItems = () => (
    <View style={styles.menuContainer}>
      {profileMenuItems.map((item) => (
        <TouchableOpacity key={item.id} style={styles.menuItem} onPress={item.onPress}>
          <View style={styles.menuItemLeft}>
            <Ionicons name={item.icon as any} size={24} color="#f59e0b" />
            <Text style={styles.menuItemTitle}>{item.title}</Text>
          </View>
          <View style={styles.menuItemRight}>
            {item.count && <Text style={styles.menuItemCount}>{item.count}</Text>}
            <Ionicons name="chevron-forward" size={20} color="#666666" />
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderLogoutButton = () => (
    <View style={styles.logoutContainer}>
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={24} color="#ffffff" />
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} key={userProfile ? 'profile-loaded' : 'profile-loading'}>
      {renderHeader()}
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {renderUserInfo()}
        {renderMenuItems()}
        {renderLogoutButton()}
      </ScrollView>
      
      {/* Edit Profile Modal */}
      <EditProfileModal
        visible={showEditModal}
        onClose={() => setShowEditModal(false)}
        userProfile={userProfile}
        onProfileUpdated={handleProfileUpdated}
      />
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
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0a0a0a',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#0a0a0a',
  },
  errorTitle: {
    fontSize: Math.max(24, width * 0.06),
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 10,
  },
  errorText: {
    fontSize: Math.max(16, width * 0.04),
    color: '#a3a3a3',
    textAlign: 'center',
    marginTop: 5,
  },
  retryButton: {
    backgroundColor: '#f59e0b',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 10,
    marginTop: 20,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: Math.max(16, width * 0.04),
    fontWeight: 'bold',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Math.max(20, width * 0.05),
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: Math.max(24, width * 0.06),
    fontWeight: 'bold',
    color: '#ffffff',
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userInfoCard: {
    marginHorizontal: Math.max(20, width * 0.05),
    marginBottom: 24,
    borderRadius: 20,
    overflow: 'hidden', // Ensure gradient covers the border
  },
  userInfoGradient: {
    padding: Math.max(24, width * 0.06),
    borderRadius: 20,
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: Math.max(80, width * 0.2),
    height: Math.max(80, width * 0.2),
    borderRadius: Math.max(40, width * 0.1),
    borderWidth: 3,
    borderColor: '#ffffff',
  },
  editButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#f59e0b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userName: {
    fontSize: Math.max(24, width * 0.06),
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  userUsername: {
    fontSize: Math.max(16, width * 0.04),
    color: '#f59e0b',
    marginBottom: 24,
  },
  userStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 24,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: Math.max(14, width * 0.035),
    color: '#ffffff',
    marginTop: 4,
  },
  statLabel: {
    fontSize: Math.max(12, width * 0.03),
    color: '#a3a3a3',
  },
  userTypeContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
  userTypeBadge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#ffffff',
  },
  userBadge: {
    borderColor: '#f59e0b',
    borderWidth: 1,
  },
  adminBadge: {
    borderColor: '#f59e0b',
    borderWidth: 1,
  },
  userTypeText: {
    fontSize: Math.max(14, width * 0.035),
    color: '#ffffff',
    fontWeight: 'bold',
  },
  menuContainer: {
    marginHorizontal: Math.max(20, width * 0.05),
    marginBottom: 24,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 8,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuItemTitle: {
    fontSize: Math.max(16, width * 0.04),
    color: '#ffffff',
    fontWeight: '500',
    marginLeft: 12,
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemCount: {
    fontSize: Math.max(14, width * 0.035),
    color: '#f59e0b',
    fontWeight: '600',
    marginRight: 8,
  },
  logoutContainer: {
    marginHorizontal: Math.max(20, width * 0.05),
    marginBottom: Math.max(40, height * 0.05),
  },
  logoutButton: {
    backgroundColor: '#dc2626',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  logoutButtonText: {
    fontSize: Math.max(16, width * 0.04),
    color: '#ffffff',
    fontWeight: '600',
    marginLeft: 8,
  },
  scrollView: {
    flex: 1,
  },
  editProfileButton: {
    backgroundColor: '#f59e0b',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    marginTop: 10,
    width: '100%',
  },
  editProfileButtonText: {
    fontSize: Math.max(16, width * 0.04),
    color: '#ffffff',
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default ProfileScreen; 