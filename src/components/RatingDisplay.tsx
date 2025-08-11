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
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { magazinesAPI, MagazineRatingsResponse, Review } from '../services/api';
import LoadingSpinner from './LoadingSpinner';

const { width, height } = Dimensions.get('window');

interface RatingDisplayProps {
  magazineId: string;
  magazineName: string;
  magazineMid?: number;
  onRatingSubmitted?: () => void;
}

const RatingDisplay: React.FC<RatingDisplayProps> = ({
  magazineId,
  magazineName,
  magazineMid,
  onRatingSubmitted,
}) => {
  const [ratingsData, setRatingsData] = useState<MagazineRatingsResponse['data'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (magazineMid) {
      fetchRatings();
    }
  }, [magazineMid]);

  const fetchRatings = async () => {
    if (!magazineMid) return;
    
    try {
      setLoading(true);
      setError(null);
      const response = await magazinesAPI.getMagazineRatings(magazineMid);
      if (response.success && response.data) {
        setRatingsData(response.data);
      } else {
        setError('Failed to fetch ratings');
      }
    } catch (err: any) {
      console.error('Error fetching ratings:', err);
      setError(err.message || 'Failed to fetch ratings');
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number, size: number = 16) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i <= rating ? 'star' : 'star-outline'}
          size={size}
          color={i <= rating ? '#f59e0b' : '#666666'}
          style={{ marginRight: 2 }}
        />
      );
    }
    return stars;
  };

  const renderRatingStats = () => {
    if (!ratingsData?.ratingStats) return null;

    const stats = ratingsData.ratingStats;
    const totalReviews = ratingsData.totalReviews;

    return (
      <View style={styles.statsContainer}>
        <Text style={styles.statsTitle}>Rating Distribution</Text>
        {[5, 4, 3, 2, 1].map((rating) => {
          const count = stats[rating.toString() as keyof typeof stats] || 0;
          const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
          
          return (
            <View key={rating} style={styles.statRow}>
              <View style={styles.statLabel}>
                <Text style={styles.statRating}>{rating}</Text>
                <Ionicons name="star" size={12} color="#f59e0b" />
              </View>
              <View style={styles.statBarContainer}>
                <View style={[styles.statBar, { width: `${percentage}%` }]} />
              </View>
              <Text style={styles.statCount}>{count}</Text>
            </View>
          );
        })}
      </View>
    );
  };

  const renderReview = ({ item }: { item: Review }) => (
    <View style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <Image
          source={{ uri: item.userProfilePic || 'https://via.placeholder.com/40x40/666666/ffffff?text=U' }}
          style={styles.userAvatar}
        />
        <View style={styles.reviewInfo}>
          <Text style={styles.username}>{item.username}</Text>
          <View style={styles.reviewMeta}>
            {renderStars(item.rating, 14)}
            <Text style={styles.reviewTime}>
              {new Date(item.time).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </Text>
          </View>
        </View>
      </View>
      <Text style={styles.reviewText}>{item.review}</Text>
    </View>
  );

  const renderAverageRating = () => {
    if (!ratingsData) return null;

    return (
      <View style={styles.averageRatingContainer}>
        <View style={styles.averageRatingContent}>
          <Text style={styles.averageRatingValue}>{ratingsData.averageRating.toFixed(1)}</Text>
          <View style={styles.averageStars}>
            {renderStars(Math.round(ratingsData.averageRating), 20)}
          </View>
          <Text style={styles.totalReviews}>
            {ratingsData.totalReviews} {ratingsData.totalReviews === 1 ? 'review' : 'reviews'}
          </Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner message="Loading ratings..." size="small" type="dots" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={32} color="#f59e0b" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchRatings}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!ratingsData) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="star-outline" size={48} color="#666666" />
        <Text style={styles.emptyText}>No ratings yet</Text>
        <Text style={styles.emptySubtext}>Be the first to rate this magazine!</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Average Rating Section */}
      {renderAverageRating()}

      {/* Rating Stats */}
      {renderRatingStats()}

      {/* Reviews Section */}
      <View style={styles.reviewsSection}>
        <Text style={styles.reviewsTitle}>
          Reviews ({ratingsData.reviews.length})
        </Text>
        {ratingsData.reviews.length > 0 ? (
          <FlatList
            data={ratingsData.reviews}
            renderItem={renderReview}
            keyExtractor={(item, index) => `${item.userId}-${index}`}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View style={styles.noReviewsContainer}>
            <Ionicons name="chatbubble-outline" size={32} color="#666666" />
            <Text style={styles.noReviewsText}>No reviews yet</Text>
          </View>
        )}
      </View>
    </ScrollView>
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
    paddingVertical: 40,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  errorText: {
    color: '#f59e0b',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 16,
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubtext: {
    color: '#666666',
    fontSize: 14,
    marginTop: 8,
  },
  averageRatingContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 20,
    marginVertical: 16,
  },
  averageRatingContent: {
    alignItems: 'center',
  },
  averageRatingValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#f59e0b',
    marginBottom: 8,
  },
  averageStars: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  totalReviews: {
    color: '#a3a3a3',
    fontSize: 16,
  },
  statsContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 16,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 40,
  },
  statRating: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    marginRight: 4,
  },
  statBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: '#2a2a2a',
    borderRadius: 4,
    marginHorizontal: 12,
    overflow: 'hidden',
  },
  statBar: {
    height: '100%',
    backgroundColor: '#f59e0b',
    borderRadius: 4,
  },
  statCount: {
    color: '#a3a3a3',
    fontSize: 14,
    width: 30,
    textAlign: 'right',
  },
  reviewsSection: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 16,
  },
  reviewsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
  },
  reviewCard: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  reviewInfo: {
    flex: 1,
  },
  username: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  reviewMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewTime: {
    color: '#666666',
    fontSize: 12,
    marginLeft: 8,
  },
  reviewText: {
    color: '#e5e5e5',
    fontSize: 14,
    lineHeight: 20,
  },
  noReviewsContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  noReviewsText: {
    color: '#666666',
    fontSize: 16,
    marginTop: 8,
  },
});

export default RatingDisplay; 