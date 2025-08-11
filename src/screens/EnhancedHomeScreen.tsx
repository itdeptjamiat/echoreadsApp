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
import { RootStackParamList } from '../../App';
import { magazinesAPI, Magazine } from '../services/api';
import ReadlyStyleMagazineCard from '../components/ReadlyStyleMagazineCard';
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
  
  const flatListRef = useRef<FlatList>(null);
  const autoScrollTimer = useRef<NodeJS.Timeout>();

  useEffect(() => {
    fetchMagazines();
    return () => {
      if (autoScrollTimer.current) {
        clearInterval(autoScrollTimer.current);
      }
    };
  }, []);

  // Auto-scroll temporarily disabled to prevent errors
  /*
  useEffect(() => {
    if (magazines.length > 0) {
      startAutoScroll();
    }
  }, [magazines]);
  */

  const fetchMagazines = async () => {
    try {
      setLoading(true);
      const response = await magazinesAPI.getMagazines();
      if (response.success && response.data && response.data.length > 0) {
        console.log('Fetched magazines:', response.data.length);
        setMagazines(response.data);
      } else {
        console.log('API response not successful or empty:', response);
        // Fallback to sample data if API fails
        const sampleMagazines = [
          {
            _id: '1',
            name: 'National Geographic Traveller',
            category: 'Travel',
            type: 'magazine',
            image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=600&fit=crop',
            downloads: 1250,
            rating: 4.8,
            description: 'Explore the world through stunning photography and compelling stories.',
            magzineType: 'Monthly',
            createdAt: new Date().toISOString(),
          },
          {
            _id: '2',
            name: 'Tech Weekly',
            category: 'Technology',
            type: 'magazine',
            image: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=600&fit=crop',
            downloads: 890,
            rating: 4.5,
            description: 'Latest technology trends and innovations.',
            magzineType: 'Weekly',
            createdAt: new Date().toISOString(),
          },
          {
            _id: '3',
            name: 'Business Insights',
            category: 'Business',
            type: 'magazine',
            image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=600&fit=crop',
            downloads: 2100,
            rating: 4.7,
            description: 'Strategic business analysis and market trends.',
            magzineType: 'Monthly',
            createdAt: new Date().toISOString(),
          }
        ];
        setMagazines(sampleMagazines);
      }
    } catch (error) {
      console.error('Error fetching magazines:', error);
      // Fallback to sample data on error
      const sampleMagazines = [
        {
          _id: '1',
          name: 'National Geographic Traveller',
          category: 'Travel',
          type: 'magazine',
          image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=600&fit=crop',
          downloads: 1250,
          rating: 4.8,
          description: 'Explore the world through stunning photography and compelling stories.',
          magzineType: 'Monthly',
          createdAt: new Date().toISOString(),
        },
        {
          _id: '2',
          name: 'Tech Weekly',
          category: 'Technology',
          type: 'magazine',
          image: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=600&fit=crop',
          downloads: 890,
          rating: 4.5,
          description: 'Latest technology trends and innovations.',
          magzineType: 'Weekly',
          createdAt: new Date().toISOString(),
        },
        {
          _id: '3',
          name: 'Business Insights',
          category: 'Business',
          type: 'magazine',
          image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=600&fit=crop',
          downloads: 2100,
          rating: 4.7,
          description: 'Strategic business analysis and market trends.',
          magzineType: 'Monthly',
          createdAt: new Date().toISOString(),
        }
      ];
      setMagazines(sampleMagazines);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchMagazines();
    setRefreshing(false);
  };

  const startAutoScroll = () => {
    // Temporarily disabled auto-scroll to prevent errors
    console.log('Auto-scroll disabled to prevent errors');
    /*
    autoScrollTimer.current = setInterval(() => {
      if (magazines.length > 0 && flatListRef.current) {
        // Only scroll if we have featured magazines to show
        const featuredMagazines = getFilteredMagazines().slice(0, 5);
        if (featuredMagazines.length > 0) {
          const currentIndex = Math.floor(Math.random() * featuredMagazines.length);
          // Use scrollToOffset instead of scrollToIndex to avoid range errors
          const offset = currentIndex * (width * 0.85 + 16); // card width + margin
          flatListRef.current.scrollToOffset({
            offset: offset,
            animated: true,
          });
        }
      }
    }, 5000);
    */
  };

  const getFilteredMagazines = () => {
    console.log('Getting filtered magazines. Total:', magazines.length, 'Active tab:', activeTab);
    
    if (activeTab === 'all') {
      console.log('Returning all magazines:', magazines.length);
      return magazines; // Show all magazines by default
    }
    
    const filtered = magazines.filter(magazine => {
      // More flexible filtering based on available data
      const magazineType = magazine.type?.toLowerCase() || '';
      const magazineCategory = magazine.category?.toLowerCase() || '';
      const magazineName = magazine.name?.toLowerCase() || '';
      
      console.log('Filtering magazine:', magazine.name, 'Type:', magazineType, 'Category:', magazineCategory);
      
      switch (activeTab) {
        case 'magazines':
          return magazineType.includes('magazine') || 
                 magazineCategory.includes('magazine') ||
                 magazineName.includes('magazine');
        case 'articles':
          return magazineType.includes('article') || 
                 magazineCategory.includes('article') ||
                 magazineName.includes('article');
        case 'digests':
          return magazineType.includes('digest') || 
                 magazineCategory.includes('digest') ||
                 magazineName.includes('digest');
        default:
          return true;
      }
    });
    
    console.log('Filtered result:', filtered.length);
    return filtered;
  };

  const handleMagazinePress = (magazine: Magazine) => {
    navigation.navigate('MagazineDetail', { 
      magazineId: magazine._id, 
      magazineData: magazine 
    });
  };

  const handleAudioPlay = (magazine: Magazine) => {
    setCurrentAudioMagazine(magazine);
    setIsAudioPlaying(true);
    setAudioDuration(249 * 60); // 249 minutes in seconds
    setAudioPosition(0);
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
                colors={['transparent', 'rgba(0,0,0,0.95)']}
                style={styles.featuredOverlay}
              >
                <View style={styles.featuredContent}>
                  <View style={styles.featuredHeader}>
                    <View style={styles.featuredTypeBadge}>
                      <Text style={styles.featuredTypeText}>
                        {item.type === 'free' ? 'FREE' : 'PRO'}
                      </Text>
                    </View>
                    
                    <TouchableOpacity 
                      style={styles.audioButton}
                      onPress={() => {
                        setCurrentAudioMagazine(item);
                        handleAudioPlay(item);
                      }}
                    >
                      <Ionicons name="play" size={20} color="#ffffff" />
                    </TouchableOpacity>
                  </View>
                  
                  <View style={styles.featuredInfo}>
                    <Text style={styles.featuredCategory}>{item.category}</Text>
                    <Text style={styles.featuredTitle} numberOfLines={2}>
                      {item.name}
                    </Text>
                    <Text style={styles.featuredDescription} numberOfLines={2}>
                      {item.description}
                    </Text>
                    
                    <View style={styles.featuredMeta}>
                      <View style={styles.featuredMetaItem}>
                        <Ionicons name="download-outline" size={16} color="#a3a3a3" />
                        <Text style={styles.featuredMetaText}>{item.downloads}</Text>
                      </View>
                      
                      <View style={styles.featuredMetaItem}>
                        <Ionicons name="star" size={16} color="#f59e0b" />
                        <Text style={styles.featuredMetaText}>{item.rating.toFixed(1)}</Text>
                      </View>
                      
                      <View style={styles.featuredMetaItem}>
                        <Ionicons name="time-outline" size={16} color="#a3a3a3" />
                        <Text style={styles.featuredMetaText}>{item.magzineType}</Text>
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
          onScrollToIndexFailed={() => {
            // Handle scroll failures gracefully
            console.log('Scroll to index failed, continuing...');
          }}
        />
      </View>
    );
  };

  const renderMagazineGrid = () => {
    const filteredMagazines = getFilteredMagazines();
    const gridMagazines = filteredMagazines.slice(5);

    if (gridMagazines.length === 0) return null;

    return (
      <View style={styles.gridContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>All Content</Text>
          <TouchableOpacity>
            <Text style={styles.viewAllText}>View all</Text>
          </TouchableOpacity>
        </View>
        
        <FlatList
          data={gridMagazines}
          renderItem={({ item, index }) => (
            <View style={styles.gridItem}>
              <TouchableOpacity 
                style={styles.gridCard}
                onPress={() => handleMagazinePress(item)}
                activeOpacity={0.8}
              >
                <Image source={{ uri: item.image }} style={styles.gridImage} />
                
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.9)']}
                  style={styles.gridOverlay}
                >
                  <View style={styles.gridContent}>
                    <View style={styles.gridHeader}>
                      <View style={styles.typeBadge}>
                        <Text style={styles.typeText}>
                          {item.type === 'free' ? 'FREE' : 'PRO'}
                        </Text>
                      </View>
                    </View>
                    
                    <View style={styles.gridInfo}>
                      <Text style={styles.gridTitle} numberOfLines={2}>
                        {item.name}
                      </Text>
                      
                      <Text style={styles.gridSubtitle} numberOfLines={1}>
                        {item.description}
                      </Text>
                      
                      <View style={styles.gridMeta}>
                        <View style={styles.metaItem}>
                          <Ionicons name="download-outline" size={14} color="#a3a3a3" />
                          <Text style={styles.metaText}>{item.downloads}</Text>
                        </View>
                        
                        <View style={styles.metaItem}>
                          <Ionicons name="star" size={14} color="#f59e0b" />
                          <Text style={styles.metaText}>{item.rating.toFixed(1)}</Text>
                        </View>
                        
                        <View style={styles.metaItem}>
                          <Ionicons name="time-outline" size={14} color="#a3a3a3" />
                          <Text style={styles.metaText}>{item.magzineType}</Text>
                        </View>
                      </View>
                    </View>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}
          keyExtractor={(item) => item._id}
          numColumns={2}
          columnWrapperStyle={styles.gridRow}
          showsVerticalScrollIndicator={false}
          scrollEnabled={false}
        />
      </View>
    );
  };



  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0a0a0a" />
      
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#f59e0b"
            colors={['#f59e0b']}
          />
        }
      >
        {renderHeader()}
        {renderTabs()}
        {renderFeaturedCarousel()}
        {renderMagazineGrid()}
      </ScrollView>

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
  scrollView: {
    flex: 1,
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
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: Math.max(20, Math.min(width * 0.05, 24)),
    color: '#ffffff',
    fontWeight: '600',
    marginBottom: 20,
    paddingHorizontal: Math.max(20, width * 0.05),
  },
  loadingContainer: {
    height: 300,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    fontSize: Math.max(16, Math.min(width * 0.04, 18)),
    color: '#a3a3a3',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: Math.max(12, Math.min(width * 0.03, 14)),
    color: '#a3a3a3',
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

});

export default EnhancedHomeScreen; 