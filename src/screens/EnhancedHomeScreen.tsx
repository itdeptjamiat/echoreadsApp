import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  FlatList,
  RefreshControl,
  StatusBar,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';
import { Magazine, magazinesAPI } from '../services/api';
import MagazineCard from '../components/MagazineCard';
import EnhancedMagazineCard from '../components/EnhancedMagazineCard';
import ReadlyAudioPlayer from '../components/ReadlyAudioPlayer';
import LoadingSpinner from '../components/LoadingSpinner';

const { width, height } = Dimensions.get('window');

type TabType = 'all' | 'magazines' | 'articles' | 'digests';

const EnhancedHomeScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [magazines, setMagazines] = useState<Magazine[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentAudioMagazine, setCurrentAudioMagazine] = useState<Magazine | null>(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [audioPosition, setAudioPosition] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [autoScrollEnabled, setAutoScrollEnabled] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  
  const flatListRef = useRef<FlatList>(null);
  const autoScrollTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchMagazines();
  }, []);

  // Reset error when tab changes
  useEffect(() => {
    setError(null);
  }, [activeTab]);

  // Auto-advancing slider effect
  useEffect(() => {
    if (autoScrollEnabled && magazines.length > 0 && isInitialized) {
      startAutoScroll();
    }
    
    return () => {
      if (autoScrollTimerRef.current) {
        clearInterval(autoScrollTimerRef.current);
      }
    };
  }, [autoScrollEnabled, magazines, isInitialized]);

  // Reset current slide index when magazines change
  useEffect(() => {
    setCurrentSlideIndex(0);
  }, [magazines]);

  const startAutoScroll = () => {
    if (autoScrollTimerRef.current) {
      clearInterval(autoScrollTimerRef.current);
    }
    
    autoScrollTimerRef.current = setInterval(() => {
      const filteredMagazines = getFilteredMagazines();
      if (filteredMagazines.length > 1 && flatListRef.current) {
        const nextIndex = (currentSlideIndex + 1) % filteredMagazines.length;
        setCurrentSlideIndex(nextIndex);
        
        try {
          flatListRef.current.scrollToIndex({
            index: nextIndex,
            animated: true,
          });
        } catch (error) {
          console.log('Auto-scroll error, using scrollToOffset instead:', error);
          // Fallback to scrollToOffset if scrollToIndex fails
          const offset = nextIndex * (width * 0.85 + 16);
          flatListRef.current.scrollToOffset({
            offset: offset,
            animated: true,
          });
        }
      }
    }, 3000); // Change slide every 3 seconds
  };

  const stopAutoScroll = () => {
    if (autoScrollTimerRef.current) {
      clearInterval(autoScrollTimerRef.current);
      autoScrollTimerRef.current = null;
    }
  };

  const fetchMagazines = async () => {
    try {
      setLoading(true);
      console.log('Fetching magazines from API...');
      
      const response = await magazinesAPI.getMagazines();
      console.log('API Response:', response);
      
      if (response.success && response.data && response.data.length > 0) {
        console.log('Successfully fetched magazines:', response.data.length);
        setMagazines(response.data);
        setIsInitialized(true); // Set initialized to true after successful fetch
      } else {
        console.log('API response not successful or empty:', response);
        // Fallback to sample data if API fails
        const fallbackMagazines: Magazine[] = [
          {
            _id: '1',
            name: 'National Geographic Traveller',
            category: 'Travel',
            type: 'free', // Match API structure
            image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=600&fit=crop',
            downloads: 1250,
            rating: 4.8,
            description: 'Explore the world through stunning photography and compelling stories.',
            magzineType: 'magzine', // Match API typo
            createdAt: new Date().toISOString(),
          },
          {
            _id: '2',
            name: 'Tech Weekly',
            category: 'Technology',
            type: 'pro', // Match API structure
            image: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=600&fit=crop',
            downloads: 890,
            rating: 4.5,
            description: 'Latest technology trends and innovations.',
            magzineType: 'magzine', // Match API typo
            createdAt: new Date().toISOString(),
          },
          {
            _id: '3',
            name: 'AI in Healthcare Article',
            category: 'Technology',
            type: 'article',
            image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=600&fit=crop',
            downloads: 450,
            rating: 4.9,
            description: 'How artificial intelligence is revolutionizing medical diagnosis and treatment.',
            magzineType: 'article',
            createdAt: new Date().toISOString(),
          },
          {
            _id: '4',
            name: 'Weekly News Digest',
            category: 'News',
            type: 'digest',
            image: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400&h=600&fit=crop',
            downloads: 1500,
            rating: 4.3,
            description: 'A comprehensive summary of the week\'s most important news.',
            magzineType: 'digest',
            createdAt: new Date().toISOString(),
          },
        ];
        setMagazines(fallbackMagazines);
        setIsInitialized(true); // Set initialized to true even with fallback
      }
    } catch (error) {
      console.error('Error fetching magazines:', error);
      setError('Failed to load magazines. Please try again.');
      // Fallback to sample data on error
      const fallbackMagazines: Magazine[] = [
        {
          _id: '1',
          name: 'National Geographic Traveller',
          category: 'Travel',
          type: 'free', // Match API structure
          image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=600&fit=crop',
          downloads: 1250,
          rating: 4.8,
          description: 'Explore the world through stunning photography and compelling stories.',
          magzineType: 'magzine', // Match API typo
          createdAt: new Date().toISOString(),
        },
        {
          _id: '2',
          name: 'Tech Weekly',
          category: 'Technology',
          type: 'pro', // Match API structure
          image: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=600&fit=crop',
          downloads: 890,
          rating: 4.5,
          description: 'Latest technology trends and innovations.',
          magzineType: 'magzine', // Match API typo
          createdAt: new Date().toISOString(),
        },
        {
          _id: '3',
          name: 'AI in Healthcare Article',
          category: 'Technology',
          type: 'article',
          image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=600&fit=crop',
          downloads: 450,
          rating: 4.9,
          description: 'How artificial intelligence is revolutionizing medical diagnosis and treatment.',
          magzineType: 'article',
          createdAt: new Date().toISOString(),
        },
        {
          _id: '4',
          name: 'Weekly News Digest',
          category: 'News',
          type: 'digest',
          image: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400&h=600&fit=crop',
          downloads: 1500,
          rating: 4.3,
          description: 'A comprehensive summary of the week\'s most important news.',
          magzineType: 'digest',
          createdAt: new Date().toISOString(),
        },
      ];
      setMagazines(fallbackMagazines);
      setIsInitialized(true); // Set initialized to true even with fallback
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchMagazines();
    setRefreshing(false);
  };

  const getFilteredMagazines = () => {
    if (activeTab === 'all') {
      return magazines;
    }
    
    // More flexible filtering based on type and content
    const filtered = magazines.filter(magazine => {
      const magazineType = magazine.type?.toLowerCase() || '';
      const magazineName = magazine.name?.toLowerCase() || '';
      const magazineCategory = magazine.category?.toLowerCase() || '';
      const magazineMagzineType = magazine.magzineType?.toLowerCase() || '';
      
      console.log(`Filtering magazine: ${magazine.name}`);
      console.log(`  - type: ${magazineType}`);
      console.log(`  - magzineType: ${magazineMagzineType}`);
      console.log(`  - activeTab: ${activeTab}`);
      
      switch (activeTab) {
        case 'magazines':
          // Check multiple conditions for magazines
          const isMagazine = magazineType === 'magazine' || 
                 magazineType === 'pro' || // API returns "pro" for magazines
                 magazineType === 'free' || // API returns "free" for magazines
                 magazineMagzineType === 'magzine' || // API typo: "magzine"
                 magazineMagzineType === 'magazine' ||
                 magazineName.includes('magazine') ||
                 magazineCategory.includes('magazine') ||
                 // If it's not explicitly an article or digest, treat as magazine
                 (magazineType !== 'article' && magazineType !== 'digest' && 
                  magazineMagzineType !== 'article' && magazineMagzineType !== 'digest');
          
          console.log(`  - isMagazine: ${isMagazine}`);
          return isMagazine;
          
        case 'articles':
          const isArticle = magazineType === 'article' || 
                 magazineMagzineType === 'article' ||
                 magazineName.includes('article') ||
                 magazineCategory.includes('article');
          console.log(`  - isArticle: ${isArticle}`);
          return isArticle;
          
        case 'digests':
          const isDigest = magazineType === 'digest' || 
                 magazineMagzineType === 'digest' ||
                 magazineName.includes('digest') ||
                 magazineCategory.includes('digest');
          console.log(`  - isDigest: ${isDigest}`);
          return isDigest;
          
        default:
          return true;
      }
    });
    
    console.log(`Filtered magazines for ${activeTab}:`, filtered.length);
    return filtered;
  };

  const handleMagazinePress = (magazine: Magazine) => {
    navigation.navigate('MagazineDetail', {
      magazineId: magazine._id,
      magazineData: magazine,
    });
  };

  const handleAudioPlay = (magazine: Magazine) => {
    setCurrentAudioMagazine(magazine);
    setIsAudioPlaying(true);
  };

  const handleAudioPause = () => {
    setIsAudioPlaying(false);
  };

  const handleAudioSeek = (position: number) => {
    setAudioPosition(position);
  };

  const handleAudioClose = () => {
    setCurrentAudioMagazine(null);
    setIsAudioPlaying(false);
    setAudioPosition(0);
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeText}>Welcome back!</Text>
          <Text style={styles.subtitleText}>Discover amazing content</Text>
        </View>
        
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.notificationButton}>
            <Ionicons name="notifications-outline" size={24} color="#f59e0b" />
            <View style={styles.notificationBadge} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderTabs = () => (
    <View style={styles.tabsContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'all' && styles.activeTab]}
          onPress={() => setActiveTab('all')}
        >
          <Ionicons 
            name="apps-outline" 
            size={20} 
            color={activeTab === 'all' ? '#f59e0b' : '#a3a3a3'} 
          />
          <Text style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>
            All
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'magazines' && styles.activeTab]}
          onPress={() => setActiveTab('magazines')}
        >
          <Ionicons 
            name="book-outline" 
            size={20} 
            color={activeTab === 'magazines' ? '#f59e0b' : '#a3a3a3'} 
          />
          <Text style={[styles.tabText, activeTab === 'magazines' && styles.activeTabText]}>
            Magazines
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'articles' && styles.activeTab]}
          onPress={() => setActiveTab('articles')}
        >
          <Ionicons 
            name="document-text-outline" 
            size={20} 
            color={activeTab === 'articles' ? '#f59e0b' : '#a3a3a3'} 
          />
          <Text style={[styles.tabText, activeTab === 'articles' && styles.activeTabText]}>
            Articles
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'digests' && styles.activeTab]}
          onPress={() => setActiveTab('digests')}
        >
          <Ionicons 
            name="newspaper-outline" 
            size={20} 
            color={activeTab === 'digests' ? '#f59e0b' : '#a3a3a3'} 
          />
          <Text style={[styles.tabText, activeTab === 'digests' && styles.activeTabText]}>
            Digests
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );

  const renderFeaturedCarousel = () => {
    const filteredMagazines = getFilteredMagazines();
    const featuredMagazines = filteredMagazines.slice(0, 5);

    if (loading) {
      return (
        <View style={styles.carouselContainer}>
          <Text style={styles.sectionTitle}>Featured Content</Text>
          <View style={styles.loadingContainer}>
            <LoadingSpinner message="Loading content..." size="large" type="pulse" />
          </View>
        </View>
      );
    }

    if (filteredMagazines.length === 0) {
      return (
        <View style={styles.carouselContainer}>
          <Text style={styles.sectionTitle}>Featured Content</Text>
          <View style={styles.emptyState}>
            <Ionicons name="book-outline" size={48} color="#a3a3a3" />
            <Text style={styles.emptyStateText}>No content available</Text>
            <Text style={styles.emptyStateSubtext}>Pull down to refresh</Text>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.carouselContainer}>
        <Text style={styles.sectionTitle}>Featured Content</Text>
        <FlatList
          ref={flatListRef}
          data={featuredMagazines}
          renderItem={({ item, index }) => (
            <TouchableOpacity 
              style={styles.featuredCard}
              onPress={() => handleMagazinePress(item)}
              activeOpacity={0.9}
            >
              <Image source={{ uri: item.image }} style={styles.featuredImage} />
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.8)']}
                style={styles.featuredOverlay}
              >
                <View style={styles.featuredContent}>
                  <View style={styles.featuredHeader}>
                    <View style={styles.featuredTypeBadge}>
                      <Text style={styles.featuredTypeText}>{item.type.toUpperCase()}</Text>
                    </View>
                    <TouchableOpacity 
                      style={styles.audioButton}
                      onPress={() => handleAudioPlay(item)}
                    >
                      <Ionicons name="play" size={20} color="#ffffff" />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.featuredInfo}>
                    <Text style={styles.featuredCategory}>{item.category}</Text>
                    <Text style={styles.featuredTitle} numberOfLines={2}>{item.name}</Text>
                    <Text style={styles.featuredDescription} numberOfLines={2}>{item.description}</Text>
                    <View style={styles.featuredMeta}>
                      <View style={styles.featuredMetaItem}>
                        <Ionicons name="download-outline" size={16} color="#a3a3a3" />
                        <Text style={styles.featuredMetaText}>{item.downloads}</Text>
                      </View>
                      <View style={styles.featuredMetaItem}>
                        <Ionicons name="star" size={16} color="#fbbf24" />
                        <Text style={styles.featuredMetaText}>{item.rating}</Text>
                      </View>
                    </View>
                  </View>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item._id}
          horizontal
          showsHorizontalScrollIndicator={false}
          pagingEnabled
          snapToInterval={width * 0.85 + 16}
          decelerationRate="fast"
          contentContainerStyle={styles.carouselContent}
          onScrollBeginDrag={() => stopAutoScroll()}
          onScrollEndDrag={() => startAutoScroll()}
          onMomentumScrollEnd={(event) => {
            try {
              const newIndex = Math.round(event.nativeEvent.contentOffset.x / (width * 0.85 + 16));
              const filteredMagazines = getFilteredMagazines();
              if (newIndex >= 0 && newIndex < filteredMagazines.length) {
                setCurrentSlideIndex(newIndex);
              }
            } catch (error) {
              console.log('Error calculating slide index:', error);
            }
          }}
          onScrollToIndexFailed={() => {
            console.log('Scroll to index failed, continuing...');
          }}
        />
        
        {/* Slide Indicators */}
        {featuredMagazines.length > 1 && (
          <View style={styles.slideIndicators}>
            {featuredMagazines.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.slideIndicator,
                  index === currentSlideIndex && styles.activeSlideIndicator
                ]}
              />
            ))}
          </View>
        )}
      </View>
    );
  };

  const renderMagazineGrid = () => {
    const filteredMagazines = getFilteredMagazines();
    
    if (filteredMagazines.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Ionicons name="newspaper-outline" size={64} color="#666" />
          <Text style={styles.emptyStateText}>No {activeTab} available</Text>
        </View>
      );
    }

    return (
      <FlatList
        ref={flatListRef}
        data={filteredMagazines}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.magazineCard}
            onPress={() => handleMagazinePress(item)}
          >
            <MagazineCard
              magazine={item}
              onPress={() => handleMagazinePress(item)}
              onAudioPress={() => handleAudioPlay(item)}
            />
          </TouchableOpacity>
        )}
        numColumns={2}
        columnWrapperStyle={styles.magazineRow}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.magazineGrid}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    );
  };



  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0a0a0a" />
      
      {renderHeader()}
      {renderTabs()}
      
      {error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color="#ef4444" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchMagazines}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={[{ key: 'content' }]}
          renderItem={() => (
            <>
              {renderFeaturedCarousel()}
              {renderMagazineGrid()}
            </>
          )}
          keyExtractor={() => 'content'}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#f59e0b"
              colors={['#f59e0b']}
            />
          }
          ListFooterComponent={<View style={{ height: 100 }} />}
        />
      )}

      {currentAudioMagazine && (
        <ReadlyAudioPlayer
          magazine={currentAudioMagazine}
          isVisible={!!currentAudioMagazine}
          onClose={handleAudioClose}
          onPlay={() => setIsAudioPlaying(true)}
          onPause={handleAudioPause}
          onSeek={handleAudioSeek}
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
    paddingHorizontal: Math.max(20, width * 0.05),
    paddingTop: 16,
    paddingBottom: 24,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  welcomeSection: {
    flex: 1,
  },
  welcomeText: {
    fontSize: Math.max(24, Math.min(width * 0.06, 28)),
    color: '#ffffff',
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitleText: {
    fontSize: Math.max(14, Math.min(width * 0.035, 16)),
    color: '#a3a3a3',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationButton: {
    padding: 8,
    marginRight: 12,
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444',
  },
  profileButton: {
    padding: 4,
  },
  profileAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInitial: {
    fontSize: Math.max(16, Math.min(width * 0.04, 18)),
    color: '#ffffff',
    fontWeight: '600',
  },
  tabsContainer: {
    paddingHorizontal: Math.max(20, width * 0.05),
    marginBottom: 24,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginRight: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  activeTab: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
  },
  tabText: {
    fontSize: Math.max(14, Math.min(width * 0.035, 16)),
    color: '#a3a3a3',
    fontWeight: '500',
    marginLeft: 8,
  },
  activeTabText: {
    color: '#f59e0b',
    fontWeight: '600',
  },
  carouselContainer: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    fontSize: 18,
    color: '#a3a3a3',
    textAlign: 'center',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
  },
  carouselContent: {
    paddingHorizontal: Math.max(20, width * 0.05),
  },
  gridContainer: {
    paddingHorizontal: Math.max(20, width * 0.05),
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  viewAllText: {
    fontSize: Math.max(14, Math.min(width * 0.035, 16)),
    color: '#f59e0b',
    fontWeight: '600',
  },
  gridRow: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  gridItem: {
    width: (width - 48) / 2,
  },
  gridCard: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  gridImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  gridOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 12,
    padding: 16,
    justifyContent: 'flex-end',
  },
  gridContent: {
    flex: 1,
  },
  gridHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  typeBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  typeText: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '600',
  },
  gridInfo: {
    flex: 1,
  },
  gridTitle: {
    fontSize: 18,
    color: '#ffffff',
    fontWeight: '700',
    marginBottom: 4,
  },
  gridSubtitle: {
    fontSize: 14,
    color: '#a3a3a3',
    marginBottom: 8,
  },
  gridMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 12,
    color: '#a3a3a3',
    marginLeft: 4,
  },
  // Featured carousel styles
  featuredCard: {
    width: width * 0.85,
    height: height * 0.4,
    borderRadius: 16,
    overflow: 'hidden',
    marginRight: 16,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  featuredImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  featuredOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    padding: 20,
    justifyContent: 'space-between',
  },
  featuredContent: {
    flex: 1,
  },
  featuredHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  featuredTypeBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.9)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  featuredTypeText: {
    fontSize: 12,
    color: '#000000',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  audioButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  featuredInfo: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  featuredCategory: {
    fontSize: 14,
    color: '#f59e0b',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  featuredTitle: {
    fontSize: 24,
    color: '#ffffff',
    fontWeight: '700',
    marginBottom: 8,
    lineHeight: 28,
  },
  featuredDescription: {
    fontSize: 16,
    color: '#e5e5e5',
    marginBottom: 16,
    lineHeight: 20,
  },
  featuredMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  featuredMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featuredMetaText: {
    fontSize: 14,
    color: '#a3a3a3',
    marginLeft: 6,
  },
  magazineCard: {
    width: (width - 24) / 2, // Adjust for margin
    marginBottom: 16,
  },
  magazineRow: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  magazineGrid: {
    paddingHorizontal: 8, // Adjust for margin
  },
  slideIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  slideIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 4,
  },
  activeSlideIndicator: {
    backgroundColor: '#f59e0b',
    width: 12,
  },
  errorContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ef4444',
  },
  errorText: {
    fontSize: 18,
    color: '#ef4444',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#f59e0b',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#f59e0b',
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },

});

export default EnhancedHomeScreen; 