import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  Animated,
  Image,
  FlatList,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';
import { Magazine } from '../services/api';


const { width, height } = Dimensions.get('window');

type ReadingRouteProp = RouteProp<RootStackParamList, 'Reading'>;

const ReadlyStyleReadingScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute<ReadingRouteProp>();
  const { magazineId, magazineData } = route.params;
  
  const [magazine, setMagazine] = useState<Magazine | null>(magazineData || null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomScale, setZoomScale] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [readingProgress, setReadingProgress] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarkPage, setBookmarkPage] = useState(1);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  
  // Magazine pages (in production, these come from your secure API)
  const [magazinePages, setMagazinePages] = useState<string[]>([]);
  
  const flatListRef = useRef<FlatList>(null);
  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (magazine) {
      initializeMagazine();
    }
    
    // Auto-hide controls after 3 seconds
    const hideControlsTimer = setTimeout(() => {
      setShowControls(false);
    }, 3000);
    
    return () => {
      clearTimeout(hideControlsTimer);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [magazine]);

  const initializeMagazine = async () => {
    try {
      setIsLoading(true);
      
      // Simulate loading magazine pages from secure API
      // In production, this would be a secure API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate sample magazine pages (replace with your API)
      const pages = generateMagazinePages();
      setMagazinePages(pages);
      setTotalPages(pages.length);
      
      // Set initial bookmark if exists
      const savedBookmark = await getBookmark();
      if (savedBookmark) {
        setBookmarkPage(savedBookmark);
        setCurrentPage(savedBookmark);
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error initializing magazine:', error);
      setIsLoading(false);
      Alert.alert('Error', 'Failed to load magazine');
    }
  };

  const generateMagazinePages = (): string[] => {
    // This simulates your secure API response
    // In production, these would be pre-processed, watermarked images
    const pages = [];
    for (let i = 1; i <= 15; i++) {
      pages.push(`https://via.placeholder.com/${width}x${height}/1a1a1a/ffffff?text=Magazine+Page+${i}`);
    }
    return pages;
  };

  const getBookmark = async (): Promise<number | null> => {
    // In production, get from secure storage or API
    return null;
  };

  const saveBookmark = async (page: number) => {
    // In production, save to secure storage or API
    setBookmarkPage(page);
    setIsBookmarked(true);
  };

  const showControlsTemporarily = () => {
    setShowControls(true);
    
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setReadingProgress((page / totalPages) * 100);
    
    // Save reading progress
    if (page % 5 === 0) { // Save every 5 pages
      // In production, save to your API
      console.log('Saving reading progress:', page);
    }
  };

  const goToPage = (pageNumber: number) => {
    const index = pageNumber - 1;
    if (index >= 0 && index < magazinePages.length) {
      flatListRef.current?.scrollToIndex({ index, animated: true });
      handlePageChange(pageNumber);
    }
  };

  const goToBookmark = () => {
    if (bookmarkPage > 0) {
      goToPage(bookmarkPage);
    }
  };

  const toggleZoom = () => {
    setIsZoomed(!isZoomed);
    setZoomScale(isZoomed ? 1 : 2);
    
    Animated.spring(scaleAnim, {
      toValue: isZoomed ? 1 : 2,
      useNativeDriver: true,
    }).start();
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const renderHeader = () => (
    <Animated.View 
      style={[
        styles.header,
        { opacity: fadeAnim }
      ]}
    >
      <TouchableOpacity style={styles.backButton} onPress={handleBack}>
        <Ionicons name="arrow-back" size={24} color="#ffffff" />
      </TouchableOpacity>
      
      <View style={styles.headerInfo}>
        <Text style={styles.magazineTitle} numberOfLines={1}>
          {magazine?.name}
        </Text>
        <Text style={styles.magazineSubtitle}>
          {magazine?.category} • {currentPage} of {totalPages}
        </Text>
      </View>
      
      <View style={styles.headerActions}>
        <TouchableOpacity 
          style={[styles.actionButton, isBookmarked && styles.bookmarkedButton]} 
          onPress={() => saveBookmark(currentPage)}
        >
          <Ionicons 
            name={isBookmarked ? "bookmark" : "bookmark-outline"} 
            size={20} 
            color={isBookmarked ? "#f59e0b" : "#ffffff"} 
          />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton} onPress={toggleZoom}>
          <Ionicons 
            name={isZoomed ? "contract" : "expand"} 
            size={20} 
            color="#ffffff" 
          />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  const renderProgressBar = () => (
    <View style={styles.progressContainer}>
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${readingProgress}%` }]} />
      </View>
      <Text style={styles.progressText}>
        {Math.round(readingProgress)}% completed
      </Text>
    </View>
  );

  const renderPageNavigation = () => (
    <View style={styles.pageNavigation}>
      <TouchableOpacity 
        style={[styles.navButton, currentPage === 1 && styles.navButtonDisabled]} 
        onPress={() => goToPage(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <Ionicons name="chevron-back" size={24} color={currentPage === 1 ? "#666666" : "#ffffff"} />
      </TouchableOpacity>
      
      <View style={styles.pageInfo}>
        <Text style={styles.pageNumber}>{currentPage}</Text>
        <Text style={styles.pageSeparator}>/</Text>
        <Text style={styles.totalPages}>{totalPages}</Text>
      </View>
      
      <TouchableOpacity 
        style={[styles.navButton, currentPage === totalPages && styles.navButtonDisabled]} 
        onPress={() => goToPage(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        <Ionicons name="chevron-forward" size={24} color={currentPage === totalPages ? "#666666" : "#ffffff"} />
      </TouchableOpacity>
    </View>
  );

  const renderMagazinePage = ({ item, index }: { item: string; index: number }) => (
    <View style={styles.pageContainer}>
      <Image 
        source={{ uri: item }} 
        style={[
          styles.pageImage,
          isZoomed && { transform: [{ scale: zoomScale }] }
        ]}
        resizeMode="contain"
      />
      
      {/* Page number overlay */}
      <View style={styles.pageOverlay}>
        <Text style={styles.pageOverlayText}>{index + 1}</Text>
      </View>
      
      {/* Reading progress indicator */}
      <View style={styles.pageProgress}>
        <View style={[styles.pageProgressBar, { width: `${((index + 1) / totalPages) * 100}%` }]} />
      </View>
    </View>
  );

  const renderControls = () => (
    <Animated.View 
      style={[
        styles.controls,
        { opacity: fadeAnim }
      ]}
    >
      {renderProgressBar()}
      {renderPageNavigation()}
    </Animated.View>
  );

  const renderLoading = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#f59e0b" />
      <Text style={styles.loadingText}>Loading magazine...</Text>
      <Text style={styles.loadingSubtext}>Streaming content securely</Text>
      
      <View style={styles.loadingProgress}>
        <View style={styles.loadingProgressBar} />
      </View>
    </View>
  );

  const renderMagazine = () => (
    <View style={styles.magazineContainer}>
      <FlatList
        ref={flatListRef}
        data={magazinePages}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(event.nativeEvent.contentOffset.x / width);
          handlePageChange(index + 1);
        }}
        renderItem={renderMagazinePage}
        keyExtractor={(item, index) => index.toString()}
        getItemLayout={(data, index) => ({
          length: width,
          offset: width * index,
          index,
        })}
        onScrollBeginDrag={() => showControlsTemporarily()}
        onScrollEndDrag={() => showControlsTemporarily()}
      />
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#0a0a0a" />
        {renderLoading()}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0a0a0a" />
      
      {showControls && renderHeader()}
      {showControls && renderControls()}
      
      <TouchableOpacity 
        style={styles.contentArea} 
        onPress={showControlsTemporarily}
        activeOpacity={1}
      >
        {renderMagazine()}
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'rgba(26, 26, 26, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
  },
  backButton: {
    padding: 8,
    marginRight: 16,
  },
  headerInfo: {
    flex: 1,
  },
  magazineTitle: {
    fontSize: 18,
    color: '#ffffff',
    fontWeight: '600',
    marginBottom: 4,
  },
  magazineSubtitle: {
    fontSize: 14,
    color: '#a3a3a3',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  bookmarkedButton: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    borderRadius: 6,
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: 'rgba(26, 26, 26, 0.95)',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#2a2a2a',
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#f59e0b',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: '#a3a3a3',
    textAlign: 'center',
  },
  controls: {
    backgroundColor: 'rgba(26, 26, 26, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
  },
  pageNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  navButton: {
    padding: 12,
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    minWidth: 48,
    alignItems: 'center',
  },
  navButtonDisabled: {
    backgroundColor: '#1a1a1a',
  },
  pageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pageNumber: {
    fontSize: 24,
    color: '#ffffff',
    fontWeight: '700',
  },
  pageSeparator: {
    fontSize: 18,
    color: '#a3a3a3',
    marginHorizontal: 8,
  },
  totalPages: {
    fontSize: 18,
    color: '#a3a3a3',
  },
  contentArea: {
    flex: 1,
  },
  magazineContainer: {
    flex: 1,
  },
  pageContainer: {
    width: width,
    height: height,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  pageImage: {
    width: width,
    height: height,
  },
  pageOverlay: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  pageOverlayText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  pageProgress: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  pageProgressBar: {
    height: '100%',
    backgroundColor: '#f59e0b',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000000',
  },
  loadingText: {
    fontSize: 18,
    color: '#ffffff',
    marginTop: 16,
    fontWeight: '600',
  },
  loadingSubtext: {
    fontSize: 14,
    color: '#a3a3a3',
    marginTop: 8,
    marginBottom: 24,
  },
  loadingProgress: {
    width: 200,
    height: 4,
    backgroundColor: '#2a2a2a',
    borderRadius: 2,
  },
  loadingProgressBar: {
    height: '100%',
    backgroundColor: '#f59e0b',
    borderRadius: 2,
    width: '60%',
  },
});

export default ReadlyStyleReadingScreen; 