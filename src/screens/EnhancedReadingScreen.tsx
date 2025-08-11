import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  StatusBar,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  Image,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';
import { Magazine } from '../services/api';
import { WebView } from 'react-native-webview';

const { width, height } = Dimensions.get('window');

type ReadingRouteProp = RouteProp<RootStackParamList, 'Reading'>;

const EnhancedReadingScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute<ReadingRouteProp>();
  const { magazineId, magazineData } = route.params;
  
  const [magazine, setMagazine] = useState<Magazine | null>(magazineData || null);
  const [pdfUrl, setPdfUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isWebViewLoading, setIsWebViewLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [fontSize, setFontSize] = useState(16);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [readingMode, setReadingMode] = useState<'webview' | 'images'>('webview');
  const [imagePages, setImagePages] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const webViewRef = useRef<WebView>(null);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (magazine) {
      initializeReading();
    }
  }, [magazine]);

  const initializeReading = async () => {
    try {
      setIsLoading(true);
      
      if (magazine?.file) {
        setPdfUrl(magazine.file);
        
        // Generate sample image pages for fallback mode
        // In production, these would come from your secure API
        generateSampleImagePages();
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error initializing reading:', error);
      setIsLoading(false);
      Alert.alert('Error', 'Failed to load the magazine');
    }
  };

  const generateSampleImagePages = () => {
    // This is a demo - in production, you'd get these from your secure API
    // These would be pre-processed, watermarked images of magazine pages
    const samplePages = [
      magazine?.image || 'https://via.placeholder.com/400x600/1a1a1a/ffffff?text=Page+1',
      'https://via.placeholder.com/400x600/2a2a2a/ffffff?text=Page+2',
      'https://via.placeholder.com/400x600/3a3a3a/ffffff?text=Page+3',
      'https://via.placeholder.com/400x600/4a4a4a/ffffff?text=Page+4',
      'https://via.placeholder.com/400x600/5a5a5a/ffffff?text=Page+5',
    ];
    setImagePages(samplePages);
    setTotalPages(samplePages.length);
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const increaseFontSize = () => {
    setFontSize(Math.min(fontSize + 2, 24));
  };

  const decreaseFontSize = () => {
    setFontSize(Math.max(fontSize - 2, 12));
  };

  const switchReadingMode = () => {
    setReadingMode(readingMode === 'webview' ? 'images' : 'webview');
  };

  const goToNextPage = () => {
    if (currentImageIndex < imagePages.length - 1) {
      const nextIndex = currentImageIndex + 1;
      setCurrentImageIndex(nextIndex);
      setCurrentPage(nextIndex + 1);
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
    }
  };

  const goToPreviousPage = () => {
    if (currentImageIndex > 0) {
      const prevIndex = currentImageIndex - 1;
      setCurrentImageIndex(prevIndex);
      setCurrentPage(prevIndex + 1);
      flatListRef.current?.scrollToIndex({ index: prevIndex, animated: true });
    }
  };

  const goToPage = (pageNumber: number) => {
    const index = pageNumber - 1;
    if (index >= 0 && index < imagePages.length) {
      setCurrentImageIndex(index);
      setCurrentPage(pageNumber);
      flatListRef.current?.scrollToIndex({ index, animated: true });
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity style={styles.backButton} onPress={handleBack}>
        <Ionicons name="arrow-back" size={24} color="#ffffff" />
      </TouchableOpacity>
      
      <View style={styles.headerInfo}>
        <Text style={styles.magazineTitle} numberOfLines={1}>
          {magazine?.name}
        </Text>
        <Text style={styles.magazineSubtitle}>
          Page {currentPage} of {totalPages} • {magazine?.category}
        </Text>
      </View>
      
      <View style={styles.headerActions}>
        <TouchableOpacity style={styles.actionButton} onPress={switchReadingMode}>
          <Ionicons 
            name={readingMode === 'webview' ? 'images-outline' : 'document-outline'} 
            size={20} 
            color="#ffffff" 
          />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton} onPress={toggleFullscreen}>
          <Ionicons 
            name={isFullscreen ? 'contract' : 'expand'} 
            size={20} 
            color="#ffffff" 
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderControls = () => (
    <View style={styles.controls}>
      <TouchableOpacity style={styles.controlButton} onPress={decreaseFontSize}>
        <Ionicons name="remove" size={20} color="#ffffff" />
      </TouchableOpacity>
      
      <Text style={styles.fontSizeText}>{fontSize}px</Text>
      
      <TouchableOpacity style={styles.controlButton} onPress={increaseFontSize}>
        <Ionicons name="add" size={20} color="#ffffff" />
      </TouchableOpacity>
      
      <View style={styles.separator} />
      
      <View style={styles.pageControls}>
        <TouchableOpacity 
          style={[styles.pageButton, currentPage === 1 && styles.pageButtonDisabled]} 
          onPress={goToPreviousPage}
          disabled={currentPage === 1}
        >
          <Ionicons name="chevron-back" size={20} color={currentPage === 1 ? "#666666" : "#ffffff"} />
        </TouchableOpacity>
        
        <Text style={styles.pageText}>
          {currentPage} / {totalPages}
        </Text>
        
        <TouchableOpacity 
          style={[styles.pageButton, currentPage === totalPages && styles.pageButtonDisabled]} 
          onPress={goToNextPage}
          disabled={currentPage === totalPages}
        >
          <Ionicons name="chevron-forward" size={20} color={currentPage === totalPages ? "#666666" : "#ffffff"} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderWebViewReader = () => {
    if (!pdfUrl) {
      return (
        <View style={styles.errorContainer}>
          <Ionicons name="document-outline" size={64} color="#a3a3a3" />
          <Text style={styles.errorTitle}>No PDF Available</Text>
          <Text style={styles.errorText}>
            This magazine doesn't have a PDF file available for reading.
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.webViewContainer}>
        {isWebViewLoading && (
          <View style={styles.webViewLoading}>
            <ActivityIndicator size="large" color="#f59e0b" />
            <Text style={styles.webViewLoadingText}>Loading magazine...</Text>
            <Text style={styles.webViewLoadingSubtext}>Secure in-app rendering</Text>
          </View>
        )}
        
        <WebView
          ref={webViewRef}
          source={{ uri: pdfUrl }}
          style={styles.webView}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          onLoadStart={() => setIsWebViewLoading(true)}
          onLoadEnd={() => setIsWebViewLoading(false)}
          onError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            console.error('WebView error:', nativeEvent);
            Alert.alert('Error', 'Failed to load PDF. Switching to image mode.');
            setReadingMode('images');
          }}
          onHttpError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            console.error('WebView HTTP error:', nativeEvent);
          }}
          allowsInlineMediaPlayback={true}
          mediaPlaybackRequiresUserAction={false}
          onMessage={(event) => {
            console.log('WebView message:', event.nativeEvent.data);
          }}
          injectedJavaScript={`
            // Secure PDF viewing - disable downloads and external links
            document.addEventListener('click', function(e) {
              if (e.target.tagName === 'A' && e.target.href) {
                e.preventDefault();
                return false;
              }
            });
            
            // Disable right-click context menu
            document.addEventListener('contextmenu', function(e) {
              e.preventDefault();
              return false;
            });
            
            // Disable text selection for security
            document.addEventListener('selectstart', function(e) {
              e.preventDefault();
              return false;
            });
            
            true;
          `}
        />
      </View>
    );
  };

  const renderImageReader = () => {
    if (imagePages.length === 0) {
      return (
        <View style={styles.errorContainer}>
          <Ionicons name="images-outline" size={64} color="#a3a3a3" />
          <Text style={styles.errorTitle}>No Pages Available</Text>
          <Text style={styles.errorText}>
            Image pages are not available for this magazine.
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.imageReaderContainer}>
        <FlatList
          ref={flatListRef}
          data={imagePages}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(event) => {
            const index = Math.round(event.nativeEvent.contentOffset.x / width);
            setCurrentImageIndex(index);
            setCurrentPage(index + 1);
          }}
          renderItem={({ item, index }) => (
            <View style={styles.imagePageContainer}>
              <Image 
                source={{ uri: item }} 
                style={styles.imagePage}
                resizeMode="contain"
              />
              <View style={styles.pageOverlay}>
                <Text style={styles.pageNumber}>{index + 1}</Text>
              </View>
            </View>
          )}
          keyExtractor={(item, index) => index.toString()}
          getItemLayout={(data, index) => ({
            length: width,
            offset: width * index,
            index,
          })}
        />
      </View>
    );
  };

  const renderReader = () => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#f59e0b" />
          <Text style={styles.loadingText}>Preparing secure reading...</Text>
          <Text style={styles.loadingSubtext}>No files will be downloaded</Text>
        </View>
      );
    }

    return readingMode === 'webview' ? renderWebViewReader() : renderImageReader();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0a0a0a" />
      
      {!isFullscreen && renderHeader()}
      {!isFullscreen && renderControls()}
      
      <View style={styles.content}>
        {renderReader()}
      </View>
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
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#1a1a1a',
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
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#1a1a1a',
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
  },
  controlButton: {
    padding: 8,
    marginRight: 8,
  },
  fontSizeText: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '500',
    marginHorizontal: 16,
    minWidth: 40,
    textAlign: 'center',
  },
  separator: {
    width: 1,
    height: 24,
    backgroundColor: '#2a2a2a',
    marginHorizontal: 16,
  },
  pageControls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16,
  },
  pageButton: {
    padding: 8,
    backgroundColor: '#2a2a2a',
    borderRadius: 6,
  },
  pageButtonDisabled: {
    backgroundColor: '#1a1a1a',
  },
  pageText: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '500',
    marginHorizontal: 16,
    minWidth: 60,
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  errorTitle: {
    fontSize: 20,
    color: '#ffffff',
    fontWeight: '600',
    marginTop: 24,
    marginBottom: 12,
  },
  errorText: {
    fontSize: 16,
    color: '#a3a3a3',
    textAlign: 'center',
    lineHeight: 24,
  },
  webViewContainer: {
    flex: 1,
    position: 'relative',
  },
  webView: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  webViewLoading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    zIndex: 1,
  },
  webViewLoadingText: {
    fontSize: 18,
    color: '#333333',
    marginTop: 16,
    fontWeight: '600',
  },
  webViewLoadingSubtext: {
    fontSize: 14,
    color: '#666666',
    marginTop: 8,
  },
  imageReaderContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  imagePageContainer: {
    width: width,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  imagePage: {
    width: width,
    height: '100%',
  },
  pageOverlay: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  pageNumber: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default EnhancedReadingScreen; 