import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
  Image,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../context/AuthContext';
import { magazinesAPI, UpdateUserProfileRequest, UserProfile } from '../services/api';
import LoadingSpinner from './LoadingSpinner';

const { width, height } = Dimensions.get('window');

interface EditProfileModalProps {
  visible: boolean;
  onClose: () => void;
  userProfile: UserProfile | null;
  onProfileUpdated: (updatedProfile: UserProfile) => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({
  visible,
  onClose,
  userProfile,
  onProfileUpdated,
}) => {
  const { user: authUser } = useAuth();
  const [formData, setFormData] = useState<UpdateUserProfileRequest>({});
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    if (userProfile) {
      setFormData({
        name: userProfile.name || '',
        email: userProfile.email || '',
        username: userProfile.username || '',
        profilePic: userProfile.profilePic || '',
      });
      setSelectedImage(userProfile.profilePic || null);
    }
  }, [userProfile]);

  const handleInputChange = (field: keyof UpdateUserProfileRequest, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const pickImage = async () => {
    try {
      // Request permission first
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Sorry, we need camera roll permissions to select a profile picture.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Settings', onPress: () => ImagePicker.requestMediaLibraryPermissionsAsync() }
          ]
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
        setFormData(prev => ({
          ...prev,
          profilePic: result.assets[0].uri,
        }));
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const uploadImageToR2 = async (imageUri: string): Promise<string> => {
    try {
      setUploadingImage(true);
      
      // For now, we'll use the local image URI directly
      // In a production environment, you would implement proper image upload
      console.log('Image upload not implemented - using local URI:', imageUri);
      
      // Return the local URI for now
      // TODO: Implement proper image upload to R2 or other storage service
      return imageUri;
      
      // Commented out R2 upload code since endpoint doesn't exist
      /*
      // Convert image to blob
      const response = await fetch(imageUri);
      if (!response.ok) {
        throw new Error('Failed to fetch image');
      }
      
      const blob = await response.blob();
      
      // Validate blob size (max 10MB)
      if (blob.size > 10 * 1024 * 1024) {
        throw new Error('Image size must be less than 10MB');
      }
      
      // Generate unique filename
      const fileName = `profile-pics/${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
      
      // Get upload URL from R2
      const uploadURLResponse = await magazinesAPI.getR2UploadURL(fileName, 'image/jpeg');
      
      if (!uploadURLResponse.uploadURL) {
        throw new Error('Failed to get upload URL');
      }
      
      // Upload to R2
      const uploadResponse = await fetch(uploadURLResponse.uploadURL, {
        method: 'PUT',
        body: blob,
        headers: {
          'Content-Type': 'image/jpeg',
        },
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload image to R2');
      }

      // Return the public URL
      return `https://pub-b8050509235e4bcca261901d10608e30.r2.dev/${fileName}`;
      */
    } catch (error) {
      console.error('Error uploading image:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to upload image. Please try again.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async () => {
    if (!authUser?.uid || !userProfile) {
      Alert.alert('Error', 'User not authenticated');
      return;
    }

    // Validate form data
    if (!formData.name?.trim()) {
      Alert.alert('Error', 'Name is required');
      return;
    }

    if (!formData.email?.trim()) {
      Alert.alert('Error', 'Email is required');
      return;
    }

    if (!formData.username?.trim()) {
      Alert.alert('Error', 'Username is required');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    // Username validation
    if (formData.username.length < 3) {
      Alert.alert('Error', 'Username must be at least 3 characters long');
      return;
    }

    try {
      setLoading(true);

      let updatedProfilePic = formData.profilePic;

      // Upload image if a new one was selected and it's different from current
      if (selectedImage && selectedImage !== userProfile.profilePic && !selectedImage.startsWith('http')) {
        try {
          updatedProfilePic = await uploadImageToR2(selectedImage);
        } catch (uploadError) {
          console.error('Image upload failed:', uploadError);
          Alert.alert(
            'Image Upload Failed',
            'Failed to upload image. Profile will be updated without the new image.',
            [
              { text: 'Continue without image', onPress: () => {} },
              { text: 'Cancel', style: 'cancel' }
            ]
          );
          return;
        }
      }

      const updateData: UpdateUserProfileRequest = {
        name: formData.name?.trim(),
        email: formData.email?.trim(),
        username: formData.username?.trim(),
        profilePic: updatedProfilePic,
      };

      const response = await magazinesAPI.updateUserProfile(authUser.uid, updateData);

      if (response.success && response.data?.user) {
        onProfileUpdated(response.data.user);
        Alert.alert('Success', 'Profile updated successfully!');
        onClose();
      } else {
        Alert.alert('Error', response.message || 'Failed to update profile');
      }
    } catch (error: any) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset form data to original values
    if (userProfile) {
      setFormData({
        name: userProfile.name || '',
        email: userProfile.email || '',
        username: userProfile.username || '',
        profilePic: userProfile.profilePic || '',
      });
      setSelectedImage(userProfile.profilePic || null);
    }
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleCancel}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleCancel} style={styles.cancelButton}>
            <Ionicons name="close" size={24} color="#666666" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <TouchableOpacity 
            onPress={handleSubmit} 
            style={[styles.saveButton, loading && styles.saveButtonDisabled]}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text style={styles.saveButtonText}>Save</Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Profile Picture Section */}
          <View style={styles.profilePicSection}>
            <View style={styles.profilePicContainer}>
              <Image
                source={{ 
                  uri: selectedImage || userProfile?.profilePic || 'https://via.placeholder.com/120x120/666666/ffffff?text=U' 
                }}
                style={styles.profilePic}
              />
              <TouchableOpacity 
                style={styles.editPicButton} 
                onPress={pickImage}
                disabled={uploadingImage}
              >
                {uploadingImage ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Ionicons name="camera" size={20} color="#ffffff" />
                )}
              </TouchableOpacity>
            </View>
            <Text style={styles.profilePicLabel}>Tap to change profile picture</Text>
          </View>

          {/* Form Fields */}
          <View style={styles.formSection}>
            {/* Name Field */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Name</Text>
              <TextInput
                style={styles.textInput}
                value={formData.name || ''}
                onChangeText={(text) => handleInputChange('name', text)}
                placeholder="Enter your name"
                placeholderTextColor="#666666"
                autoCapitalize="words"
              />
            </View>

            {/* Email Field */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={styles.textInput}
                value={formData.email || ''}
                onChangeText={(text) => handleInputChange('email', text)}
                placeholder="Enter your email"
                placeholderTextColor="#666666"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            {/* Username Field */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Username</Text>
              <TextInput
                style={styles.textInput}
                value={formData.username || ''}
                onChangeText={(text) => handleInputChange('username', text)}
                placeholder="Enter your username"
                placeholderTextColor="#666666"
                autoCapitalize="none"
              />
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Math.max(20, width * 0.05),
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  headerTitle: {
    fontSize: Math.max(18, width * 0.045),
    fontWeight: 'bold',
    color: '#ffffff',
  },
  cancelButton: {
    padding: 8,
  },
  saveButton: {
    backgroundColor: '#f59e0b',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveButtonDisabled: {
    backgroundColor: '#666666',
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: Math.max(14, width * 0.035),
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    paddingHorizontal: Math.max(20, width * 0.05),
  },
  profilePicSection: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  profilePicContainer: {
    position: 'relative',
    marginBottom: 10,
  },
  profilePic: {
    width: Math.max(100, width * 0.25),
    height: Math.max(100, width * 0.25),
    borderRadius: Math.max(50, width * 0.125),
    borderWidth: 3,
    borderColor: '#f59e0b',
  },
  editPicButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#f59e0b',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#0a0a0a',
  },
  profilePicLabel: {
    fontSize: Math.max(14, width * 0.035),
    color: '#666666',
    textAlign: 'center',
  },
  formSection: {
    marginTop: 20,
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: Math.max(16, width * 0.04),
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: Math.max(16, width * 0.04),
    color: '#ffffff',
    borderWidth: 1,
    borderColor: '#333333',
  },
});

export default EditProfileModal; 