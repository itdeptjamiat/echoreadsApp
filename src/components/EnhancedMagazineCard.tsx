import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

interface EnhancedMagazineCardProps {
  id: string;
  title: string;
  category: string;
  coverImage: string;
  downloads: number;
  rating: number;
  readTime?: number;
  isBookmarked?: boolean;
  isDownloaded?: boolean;
  readProgress?: number;
  onPress: () => void;
  onBookmarkPress?: () => void;
  onDownloadPress?: () => void;
  isDownloading?: boolean;
}

const EnhancedMagazineCard: React.FC<EnhancedMagazineCardProps> = ({
  id,
  title,
  category,
  coverImage,
  downloads,
  rating,
  readTime = 5,
  isBookmarked = false,
  isDownloaded = false,
  readProgress = 0,
  onPress,
  onBookmarkPress,
  onDownloadPress,
  isDownloading = false,
}) => {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;
  const opacityAnim = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0.8,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      <TouchableOpacity
        style={styles.card}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        {/* Cover Image */}
        <View style={styles.coverContainer}>
          <Image source={{ uri: coverImage }} style={styles.coverImage} />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.8)']}
            style={styles.coverOverlay}
          />
          
          {/* Floating Action Buttons */}
          <View style={styles.floatingActions}>
            {onBookmarkPress && (
              <TouchableOpacity
                style={styles.floatingButton}
                onPress={onBookmarkPress}
              >
                <Ionicons
                  name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
                  size={16}
                  color={isBookmarked ? '#f59e0b' : '#ffffff'}
                />
              </TouchableOpacity>
            )}
            
            {onDownloadPress && (
              <TouchableOpacity
                style={styles.floatingButton}
                onPress={onDownloadPress}
                disabled={isDownloading}
              >
                {isDownloading ? (
                  <View style={styles.downloadingSpinner}>
                    <Ionicons name="sync" size={16} color="#f59e0b" />
                  </View>
                ) : (
                  <Ionicons
                    name={isDownloaded ? 'checkmark-circle' : 'download-outline'}
                    size={16}
                    color={isDownloaded ? '#10b981' : '#ffffff'}
                  />
                )}
              </TouchableOpacity>
            )}
          </View>

          {/* Category Badge */}
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{category}</Text>
          </View>

          {/* Progress Indicator */}
          {readProgress > 0 && (
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${readProgress}%` },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>{Math.round(readProgress)}%</Text>
            </View>
          )}
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.title} numberOfLines={2}>
            {title}
          </Text>
          
          {/* Stats Row */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Ionicons name="download-outline" size={12} color="#f59e0b" />
              <Text style={styles.statText}>{formatNumber(downloads)}</Text>
            </View>
            
            <View style={styles.statItem}>
              <Ionicons name="star" size={12} color="#f59e0b" />
              <Text style={styles.statText}>{rating}/5</Text>
            </View>
            
            <View style={styles.statItem}>
              <Ionicons name="time-outline" size={12} color="#f59e0b" />
              <Text style={styles.statText}>{readTime}m</Text>
            </View>
          </View>

          {/* Status Indicators */}
          <View style={styles.statusContainer}>
            {isDownloaded && (
              <View style={styles.statusBadge}>
                <Ionicons name="checkmark-circle" size={12} color="#10b981" />
                <Text style={styles.statusText}>Downloaded</Text>
              </View>
            )}
            
            {readProgress > 0 && readProgress < 100 && (
              <View style={styles.statusBadge}>
                <Ionicons name="book-outline" size={12} color="#f59e0b" />
                <Text style={styles.statusText}>In Progress</Text>
              </View>
            )}
            
            {readProgress === 100 && (
              <View style={styles.statusBadge}>
                <Ionicons name="checkmark-done-circle" size={12} color="#10b981" />
                <Text style={styles.statusText}>Completed</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 8,
    marginVertical: 8,
  },
  card: {
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  coverContainer: {
    position: 'relative',
    height: 200,
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  coverOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  floatingActions: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    gap: 8,
  },
  floatingButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  downloadingSpinner: {
    transform: [{ rotate: '0deg' }],
  },
  categoryBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(245, 158, 11, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 10,
    color: '#ffffff',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  progressContainer: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#f59e0b',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 10,
    color: '#ffffff',
    fontWeight: '600',
    minWidth: 30,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 12,
    lineHeight: 20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: '#a3a3a3',
    fontWeight: '500',
  },
  statusContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  statusText: {
    fontSize: 10,
    color: '#10b981',
    fontWeight: '600',
  },
});

export default EnhancedMagazineCard; 