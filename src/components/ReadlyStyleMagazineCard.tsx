import React, { useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
  Animated,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Magazine } from '../services/api';

const { width, height } = Dimensions.get('window');

interface ReadlyStyleMagazineCardProps {
  magazine: Magazine;
  onPress: () => void;
  onBookmarkPress?: () => void;
  onDownloadPress?: () => void;
  onMorePress?: () => void;
  isBookmarked?: boolean;
  isDownloaded?: boolean;
  readProgress?: number;
  showAudioControls?: boolean;
  onAudioPlay?: () => void;
  isAudioPlaying?: boolean;
  variant?: 'featured' | 'grid' | 'list';
}

const ReadlyStyleMagazineCard: React.FC<ReadlyStyleMagazineCardProps> = ({
  magazine,
  onPress,
  onBookmarkPress,
  onDownloadPress,
  onMorePress,
  isBookmarked = false,
  isDownloaded = false,
  readProgress = 0,
  showAudioControls = false,
  onAudioPlay,
  isAudioPlaying = false,
  variant = 'featured',
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

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

  const getCardDimensions = () => {
    switch (variant) {
      case 'featured':
        return {
          width: width * 0.85,
          height: height * 0.4,
          imageHeight: height * 0.35,
        };
      case 'grid':
        return {
          width: (width - 48) / 2,
          height: height * 0.25,
          imageHeight: height * 0.18,
        };
      case 'list':
        return {
          width: width - 32,
          height: height * 0.15,
          imageHeight: height * 0.12,
        };
      default:
        return {
          width: width * 0.85,
          height: height * 0.4,
          imageHeight: height * 0.35,
        };
    }
  };

  const dimensions = getCardDimensions();

  const renderAudioControls = () => {
    if (!showAudioControls) return null;

    return (
      <View style={styles.audioControls}>
        <View style={styles.audioInfo}>
          <Text style={styles.audioTitle}>Listen to the latest issue</Text>
          <Text style={styles.audioDuration}>7 Aug | 249 minutes</Text>
        </View>
        <TouchableOpacity 
          style={styles.playButton}
          onPress={onAudioPlay}
        >
          <Ionicons 
            name={isAudioPlaying ? 'pause' : 'play'} 
            size={24} 
            color="#000" 
          />
        </TouchableOpacity>
      </View>
    );
  };

  const renderProgressBar = () => {
    if (readProgress <= 0) return null;

    return (
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${readProgress}%` }]} />
        </View>
        <Text style={styles.progressText}>{readProgress}% read</Text>
      </View>
    );
  };

  const renderActionButtons = () => {
    if (variant === 'list') return null;

    return (
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.readButton} onPress={onPress}>
          <Ionicons name="book-outline" size={16} color="#fff" />
          <Text style={styles.readButtonText}>Read</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.moreButton} onPress={onMorePress}>
          <Ionicons name="ellipsis-horizontal" size={16} color="#fff" />
          <Text style={styles.moreButtonText}>More</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          width: dimensions.width,
          height: dimensions.height,
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
        activeOpacity={0.9}
      >
        <Image 
          source={{ uri: magazine.image }} 
          style={[styles.magazineImage, { height: dimensions.imageHeight }]} 
          resizeMode="cover"
        />
        
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.9)']}
          style={styles.overlay}
        >
          <View style={styles.content}>
            <View style={styles.header}>
              <View style={styles.categoryContainer}>
                <Text style={styles.category}>{magazine.category}</Text>
                {magazine.type === 'pro' && (
                  <View style={styles.proBadge}>
                    <Text style={styles.proText}>PRO</Text>
                  </View>
                )}
              </View>
              
              <View style={styles.actions}>
                {onBookmarkPress && (
                  <TouchableOpacity 
                    style={styles.iconButton}
                    onPress={onBookmarkPress}
                  >
                    <Ionicons 
                      name={isBookmarked ? 'bookmark' : 'bookmark-outline'} 
                      size={20} 
                      color={isBookmarked ? '#f59e0b' : '#fff'} 
                    />
                  </TouchableOpacity>
                )}
                
                {onDownloadPress && (
                  <TouchableOpacity 
                    style={styles.iconButton}
                    onPress={onDownloadPress}
                  >
                    <Ionicons 
                      name={isDownloaded ? 'checkmark-circle' : 'download-outline'} 
                      size={20} 
                      color={isDownloaded ? '#10b981' : '#fff'} 
                    />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            <View style={styles.magazineInfo}>
              <Text style={styles.title} numberOfLines={variant === 'list' ? 1 : 2}>
                {magazine.name}
              </Text>
              
              {variant !== 'list' && (
                <Text style={styles.description} numberOfLines={2}>
                  {magazine.description}
                </Text>
              )}

              <View style={styles.meta}>
                <View style={styles.metaItem}>
                  <Ionicons name="download-outline" size={14} color="#a3a3a3" />
                  <Text style={styles.metaText}>{formatNumber(magazine.downloads)}</Text>
                </View>
                <View style={styles.metaItem}>
                  <Ionicons name="star" size={14} color="#f59e0b" />
                  <Text style={styles.metaText}>{magazine.rating.toFixed(1)}</Text>
                </View>
                {magazine.magzineType && (
                  <View style={styles.metaItem}>
                    <Ionicons name="time-outline" size={14} color="#a3a3a3" />
                    <Text style={styles.metaText}>{magazine.magzineType}</Text>
                  </View>
                )}
              </View>
            </View>

            {renderProgressBar()}
            {renderActionButtons()}
          </View>
        </LinearGradient>
      </TouchableOpacity>

      {renderAudioControls()}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  card: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#1a1a1a',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  magazineImage: {
    width: '100%',
    borderRadius: 16,
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: 60,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  content: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  category: {
    fontSize: Math.max(12, Math.min(width * 0.03, 14)),
    color: '#f59e0b',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  proBadge: {
    backgroundColor: '#f59e0b',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 8,
  },
  proText: {
    fontSize: Math.max(8, Math.min(width * 0.02, 10)),
    color: '#000',
    fontWeight: '700',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: 8,
    marginLeft: 8,
  },
  magazineInfo: {
    marginBottom: 12,
  },
  title: {
    fontSize: Math.max(16, Math.min(width * 0.04, 20)),
    color: '#ffffff',
    fontWeight: '700',
    marginBottom: 8,
    lineHeight: Math.max(20, Math.min(width * 0.05, 24)),
  },
  description: {
    fontSize: Math.max(12, Math.min(width * 0.03, 14)),
    color: '#e5e5e5',
    marginBottom: 12,
    lineHeight: Math.max(16, Math.min(width * 0.04, 18)),
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 4,
  },
  metaText: {
    fontSize: Math.max(11, Math.min(width * 0.028, 13)),
    color: '#a3a3a3',
    marginLeft: 4,
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#f59e0b',
    borderRadius: 2,
  },
  progressText: {
    fontSize: Math.max(10, Math.min(width * 0.025, 12)),
    color: '#a3a3a3',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  readButton: {
    flex: 1,
    backgroundColor: '#f59e0b',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  readButtonText: {
    color: '#000',
    fontSize: Math.max(12, Math.min(width * 0.03, 14)),
    fontWeight: '600',
    marginLeft: 6,
  },
  moreButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    minWidth: 80,
  },
  moreButtonText: {
    color: '#fff',
    fontSize: Math.max(12, Math.min(width * 0.03, 14)),
    fontWeight: '600',
    marginLeft: 6,
  },
  audioControls: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  audioInfo: {
    flex: 1,
  },
  audioTitle: {
    fontSize: Math.max(14, Math.min(width * 0.035, 16)),
    color: '#ffffff',
    fontWeight: '600',
    marginBottom: 4,
  },
  audioDuration: {
    fontSize: Math.max(12, Math.min(width * 0.03, 14)),
    color: '#a3a3a3',
  },
  playButton: {
    backgroundColor: '#ffffff',
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ReadlyStyleMagazineCard; 