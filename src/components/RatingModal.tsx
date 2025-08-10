import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useAlert } from '../context/AlertContext';
import { magazinesAPI, RatingRequest } from '../services/api';
import LoadingSpinner from './LoadingSpinner';

const { width, height } = Dimensions.get('window');

interface RatingModalProps {
  visible: boolean;
  onClose: () => void;
  magazineId: string;
  magazineName: string;
  magazineMid?: number;
  onRatingSubmitted?: () => void;
}

const RatingModal: React.FC<RatingModalProps> = ({
  visible,
  onClose,
  magazineId,
  magazineName,
  magazineMid,
  onRatingSubmitted,
}) => {
  const { user } = useAuth();
  const { showError, showSuccess } = useAlert();
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleStarPress = (starRating: number) => {
    setRating(starRating);
  };

  const handleSubmit = async () => {
    if (!user) {
      showError('Error', 'Please login to submit a rating');
      return;
    }

    if (rating === 0) {
      showError('Error', 'Please select a rating');
      return;
    }

    if (review.trim().length < 10) {
      showError('Error', 'Please write a review with at least 10 characters');
      return;
    }

    setSubmitting(true);
    try {
      // Ensure we have a valid mid value
      const midValue = magazineMid || parseInt(magazineId);
      if (!midValue || isNaN(midValue)) {
        showError('Error', 'Invalid magazine ID');
        return;
      }

      const ratingData: RatingRequest = {
        mid: midValue,
        rating: rating,
        review: review.trim(),
        userId: user.uid,
      };

      const response = await magazinesAPI.rateMagazine(ratingData);
      
      if (response.success) {
        showSuccess('Success', 'Thank you for your rating!');
        onClose();
        onRatingSubmitted?.();
      } else {
        showError('Error', response.message || 'Failed to submit rating');
      }
    } catch (error: any) {
      showError('Error', error.message || 'Failed to submit rating');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!submitting) {
      setRating(0);
      setReview('');
      onClose();
    }
  };

  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <TouchableOpacity
          key={i}
          style={styles.starButton}
          onPress={() => handleStarPress(i)}
          disabled={submitting}
        >
          <Ionicons
            name={i <= rating ? 'star' : 'star-outline'}
            size={32}
            color={i <= rating ? '#f59e0b' : '#666666'}
          />
        </TouchableOpacity>
      );
    }
    return stars;
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Rate this Magazine</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleClose}
              disabled={submitting}
            >
              <Ionicons name="close" size={24} color="#ffffff" />
            </TouchableOpacity>
          </View>

          {/* Magazine Info */}
          <View style={styles.magazineInfo}>
            <Text style={styles.magazineName}>{magazineName}</Text>
          </View>

          {/* Rating Stars */}
          <View style={styles.ratingContainer}>
            <Text style={styles.ratingLabel}>Your Rating</Text>
            <View style={styles.starsContainer}>
              {renderStars()}
            </View>
            <Text style={styles.ratingText}>
              {rating > 0 ? `${rating} out of 5 stars` : 'Tap to rate'}
            </Text>
          </View>

          {/* Review Input */}
          <View style={styles.reviewContainer}>
            <Text style={styles.reviewLabel}>Your Review</Text>
            <TextInput
              style={styles.reviewInput}
              placeholder="Share your thoughts about this magazine..."
              placeholderTextColor="#666666"
              value={review}
              onChangeText={setReview}
              multiline
              numberOfLines={4}
              maxLength={500}
              editable={!submitting}
            />
            <Text style={styles.characterCount}>
              {review.length}/500 characters
            </Text>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              (!rating || review.trim().length < 10 || submitting) && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={!rating || review.trim().length < 10 || submitting}
          >
            {submitting ? (
              <LoadingSpinner message="Submitting..." size="small" type="pulse" />
            ) : (
              <Text style={styles.submitButtonText}>Submit Rating</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: Math.min(width * 0.9, 400),
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    padding: Math.max(24, width * 0.06),
    maxHeight: height * 0.8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: Math.max(20, width * 0.05),
    fontWeight: 'bold',
    color: '#ffffff',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  magazineInfo: {
    marginBottom: 24,
  },
  magazineName: {
    fontSize: Math.max(16, width * 0.04),
    color: '#f59e0b',
    fontWeight: '600',
    textAlign: 'center',
  },
  ratingContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  ratingLabel: {
    fontSize: Math.max(16, width * 0.04),
    color: '#ffffff',
    fontWeight: '600',
    marginBottom: 12,
  },
  starsContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  starButton: {
    marginHorizontal: 4,
  },
  ratingText: {
    fontSize: Math.max(14, width * 0.035),
    color: '#a3a3a3',
  },
  reviewContainer: {
    marginBottom: 24,
  },
  reviewLabel: {
    fontSize: Math.max(16, width * 0.04),
    color: '#ffffff',
    fontWeight: '600',
    marginBottom: 12,
  },
  reviewInput: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 16,
    fontSize: Math.max(16, width * 0.04),
    color: '#ffffff',
    textAlignVertical: 'top',
    minHeight: 100,
    borderWidth: 1,
    borderColor: '#3a3a3a',
  },
  characterCount: {
    fontSize: Math.max(12, width * 0.03),
    color: '#666666',
    textAlign: 'right',
    marginTop: 8,
  },
  submitButton: {
    backgroundColor: '#f59e0b',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#666666',
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: Math.max(16, width * 0.04),
    fontWeight: '600',
  },
});

export default RatingModal; 