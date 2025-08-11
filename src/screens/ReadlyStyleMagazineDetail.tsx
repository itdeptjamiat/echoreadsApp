import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
  StatusBar,
  Share,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';
import { Magazine } from '../services/api';
import ReadlyAudioPlayer from '../components/ReadlyAudioPlayer';

const { width, height } = Dimensions.get('window');

type MagazineDetailRouteProp = RouteProp<RootStackParamList, 'MagazineDetail'>;

const ReadlyStyleMagazineDetail: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute<MagazineDetailRouteProp>();
  const { magazineId, magazineData } = route.params;
  
  const [magazine, setMagazine] = useState<Magazine | null>(magazineData || null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [audioPosition, setAudioPosition] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showAudioPlayer, setShowAudioPlayer] = useState(false);

  useEffect(() => {
    if (!magazine && magazineId) {
      // Fetch magazine data if not provided
      // You can implement API call here if needed
      console.log('Magazine ID:', magazineId);
    }
  }, [magazineId, magazine]);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    // Add your bookmark logic here
  };

  const handleDownload = () => {
    setIsDownloaded(!isDownloaded);
    // Add your download logic here
  };

  const handleShare = async () => {
    if (magazine) {
      try {
        await Share.share({
          message: `Check out this magazine: ${magazine.name}`,
          title: magazine.name,
        });
      } catch (error) {
        Alert.alert('Error', 'Failed to share magazine');
      }
    }
  };

  const handleRead = () => {
    if (magazine) {
      navigation.navigate('Reading', {
        magazineId: magazine._id,
        magazineData: magazine,
      });
    }
  };

  const handleAudioPlay = () => {
    setShowAudioPlayer(true);
    setIsAudioPlaying(true);
    setAudioDuration(249 * 60); // 249 minutes in seconds
  };

  const handleAudioPause = () => {
    setIsAudioPlaying(false);
  };

  const handleAudioClose = () => {
    setShowAudioPlayer(false);
    setIsAudioPlaying(false);
  };

  if (!magazine) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#0a0a0a" />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading magazine...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0a0a0a" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
            <Ionicons name="share-outline" size={24} color="#ffffff" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton} onPress={handleBookmark}>
            <Ionicons 
              name={isBookmarked ? 'bookmark' : 'bookmark-outline'} 
              size={24} 
              color={isBookmarked ? '#f59e0b' : '#ffffff'} 
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Magazine Cover Section */}
        <View style={styles.coverSection}>
          <Image source={{ uri: magazine.image }} style={styles.coverImage} />
          
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.9)']}
            style={styles.coverOverlay}
          >
            <View style={styles.coverInfo}>
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>{magazine.category}</Text>
              </View>
              
              <Text style={styles.magazineTitle}>{magazine.name}</Text>
              
              <View style={styles.magazineMeta}>
                <View style={styles.metaItem}>
                  <Ionicons name="download-outline" size={16} color="#a3a3a3" />
                  <Text style={styles.metaText}>{magazine.downloads} downloads</Text>
                </View>
                
                <View style={styles.metaItem}>
                  <Ionicons name="star" size={16} color="#f59e0b" />
                  <Text style={styles.metaText}>{magazine.rating.toFixed(1)} rating</Text>
                </View>
                
                {magazine.magzineType && (
                  <View style={styles.metaItem}>
                    <Ionicons name="time-outline" size={16} color="#a3a3a3" />
                    <Text style={styles.metaText}>{magazine.magzineType}</Text>
                  </View>
                )}
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity style={styles.readButton} onPress={handleRead}>
            <Ionicons name="book-outline" size={20} color="#ffffff" />
            <Text style={styles.readButtonText}>Read Now</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.audioButton} onPress={handleAudioPlay}>
            <Ionicons name="play" size={20} color="#ffffff" />
            <Text style={styles.audioButtonText}>Listen</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.downloadButton} onPress={handleDownload}>
            <Ionicons 
              name={isDownloaded ? 'checkmark-circle' : 'download-outline'} 
              size={20} 
              color={isDownloaded ? '#10b981' : '#ffffff'} 
            />
            <Text style={[styles.downloadButtonText, isDownloaded && styles.downloadedText]}>
              {isDownloaded ? 'Downloaded' : 'Download'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Description Section */}
        <View style={styles.descriptionSection}>
          <Text style={styles.sectionTitle}>About This Magazine</Text>
          <Text style={styles.descriptionText}>{magazine.description}</Text>
        </View>

        {/* Details Section */}
        <View style={styles.detailsSection}>
          <Text style={styles.sectionTitle}>Details</Text>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Category</Text>
            <Text style={styles.detailValue}>{magazine.category}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Type</Text>
            <Text style={styles.detailValue}>{magazine.type}</Text>
          </View>
          
          {magazine.magzineType && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Publication</Text>
              <Text style={styles.detailValue}>{magazine.magzineType}</Text>
            </View>
          )}
          
          {magazine.createdAt && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Published</Text>
              <Text style={styles.detailValue}>
                {new Date(magazine.createdAt).toLocaleDateString()}
              </Text>
            </View>
          )}
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Downloads</Text>
            <Text style={styles.detailValue}>{magazine.downloads.toLocaleString()}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Rating</Text>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={16} color="#f59e0b" />
              <Text style={styles.ratingText}>{magazine.rating.toFixed(1)}</Text>
            </View>
          </View>
        </View>

        {/* Related Content */}
        <View style={styles.relatedSection}>
          <Text style={styles.sectionTitle}>You Might Also Like</Text>
          <Text style={styles.relatedSubtext}>Discover more content in this category</Text>
        </View>
      </ScrollView>

      {/* Audio Player */}
      {showAudioPlayer && (
        <ReadlyAudioPlayer
          magazine={magazine}
          isVisible={showAudioPlayer}
          onClose={handleAudioClose}
          onPlay={handleAudioPlay}
          onPause={handleAudioPause}
          onSeek={setAudioPosition}
          onSkipForward={() => setAudioPosition(Math.min(audioPosition + 15, audioDuration))}
          onSkipBackward={() => setAudioPosition(Math.max(audioPosition - 15, 0))}
          onSpeedChange={setPlaybackSpeed}
          isPlaying={isAudioPlaying}
          currentPosition={audioPosition}
          duration={audioDuration}
          playbackSpeed={playbackSpeed}
        />
      )}
    </SafeAreaView>
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    zIndex: 10,
  },
  backButton: {
    padding: 8,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    marginLeft: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  coverSection: {
    position: 'relative',
    height: height * 0.5,
    marginBottom: 24,
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  coverOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    paddingTop: 60,
  },
  coverInfo: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  categoryBadge: {
    backgroundColor: '#f59e0b',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  categoryText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  magazineTitle: {
    fontSize: 28,
    color: '#ffffff',
    fontWeight: '700',
    marginBottom: 16,
    lineHeight: 34,
  },
  magazineMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
    marginBottom: 8,
  },
  metaText: {
    fontSize: 14,
    color: '#a3a3a3',
    marginLeft: 6,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 32,
    gap: 12,
  },
  readButton: {
    flex: 2,
    backgroundColor: '#f59e0b',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  readButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  audioButton: {
    flex: 1,
    backgroundColor: '#3b82f6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  audioButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  downloadButton: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#2a2a2a',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  downloadButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  downloadedText: {
    color: '#10b981',
  },
  descriptionSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    color: '#ffffff',
    fontWeight: '600',
    marginBottom: 16,
  },
  descriptionText: {
    fontSize: 16,
    color: '#e5e5e5',
    lineHeight: 24,
  },
  detailsSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
  },
  detailLabel: {
    fontSize: 14,
    color: '#a3a3a3',
  },
  detailValue: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '500',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '500',
    marginLeft: 6,
  },
  relatedSection: {
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  relatedSubtext: {
    fontSize: 14,
    color: '#a3a3a3',
    textAlign: 'center',
    marginTop: 8,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#ffffff',
  },
});

export default ReadlyStyleMagazineDetail; 