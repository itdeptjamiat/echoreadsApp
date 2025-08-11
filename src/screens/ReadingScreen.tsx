import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAlert } from '../context/AlertContext';
import { useLibrary } from '../context/LibraryContext';
import { Magazine } from '../services/api';
import PDFViewer from '../components/PDFViewer';

const { width, height } = Dimensions.get('window');

type RootStackParamList = {
  Reading: { 
    magazineId: string; 
    magazineData: Magazine;
    content?: string;
  };
};

type ReadingRouteProp = RouteProp<RootStackParamList, 'Reading'>;
type ReadingNavigationProp = StackNavigationProp<RootStackParamList, 'Reading'>;

const ReadingScreen: React.FC = () => {
  const route = useRoute<ReadingRouteProp>();
  const navigation = useNavigation<ReadingNavigationProp>();
  const { showSuccess, showError } = useAlert();
  const { toggleBookmark: toggleLibraryBookmark, isBookmarked } = useLibrary();
  const { magazineId, magazineData, content } = route.params;

  // Reading state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [readingProgress, setReadingProgress] = useState(0);
  const [isLoadingPdf, setIsLoadingPdf] = useState(true);
  const [pdfError, setPdfError] = useState<string | null>(null);

  const [fontSize, setFontSize] = useState(16);
  const [lineHeight, setLineHeight] = useState(24);
  const [theme, setTheme] = useState<'dark' | 'sepia' | 'light'>('dark');
  const [showSettings, setShowSettings] = useState(false);

  // Animations
  const settingsSlide = useRef(new Animated.Value(0)).current;

  // Load PDF content from the magazine's PDF URL
  const loadPdfContent = async () => {
    if (!magazineData?.file) {
      setPdfError('No PDF file available for this magazine');
      setIsLoadingPdf(false);
      return;
    }

    try {
      setIsLoadingPdf(true);
      setPdfError(null);
      
      console.log('Loading PDF from URL:', magazineData.file);
      
      // Validate URL format
      try {
        new URL(magazineData.file);
      } catch (urlError) {
        throw new Error('Invalid PDF URL format');
      }
      
      // PDF will be loaded by the PDFViewer component
      setIsLoadingPdf(false);
    } catch (error) {
      console.error('Error loading PDF content:', error);
      setPdfError(error instanceof Error ? error.message : 'Failed to load PDF content. Please try again.');
      setIsLoadingPdf(false);
    }
  };

  // Load reading progress from storage
  const loadReadingProgress = async () => {
    // TODO: Implement reading progress loading from AsyncStorage
    setReadingProgress(0);
  };

  // Save reading progress to storage
  const saveReadingProgress = async () => {
    // TODO: Implement reading progress saving to AsyncStorage
    const progress = totalPages > 0 ? (currentPage / totalPages) * 100 : 0;
    setReadingProgress(progress);
  };

  const toggleBookmark = () => {
    toggleLibraryBookmark(magazineData);
  };

  const toggleSettings = () => {
    if (showSettings) {
      Animated.timing(settingsSlide, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setShowSettings(false));
    } else {
      setShowSettings(true);
      Animated.timing(settingsSlide, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  };

  const changeFontSize = (increment: number) => {
    const newSize = Math.max(12, Math.min(24, fontSize + increment));
    setFontSize(newSize);
    setLineHeight(newSize * 1.5);
  };

  const changeTheme = (newTheme: 'dark' | 'sepia' | 'light') => {
    setTheme(newTheme);
  };

  const getThemeColors = () => {
    switch (theme) {
      case 'sepia':
        return {
          background: '#f4f1eb',
          text: '#2c1810',
          border: '#d4c4a8',
          card: '#e8dfd0',
        };
      case 'light':
        return {
          background: '#ffffff',
          text: '#000000',
          border: '#e0e0e0',
          card: '#f5f5f5',
        };
      default: // dark
        return {
          background: '#0a0a0a',
          text: '#ffffff',
          border: '#2a2a2a',
          card: '#1a1a1a',
        };
    }
  };

  const themeColors = getThemeColors();

  // Use content from route params or fallback
  const displayContent = content || 'Loading content...';

  useEffect(() => {
    // Log magazine data for debugging
    console.log('ReadingScreen: Magazine data:', {
      id: magazineData?._id,
      name: magazineData?.name,
      file: magazineData?.file,
      hasFile: !!magazineData?.file
    });

    loadPdfContent();
    loadReadingProgress();
  }, [magazineData]);

  // Render content with loading states and error handling
  const renderContent = () => {
    if (isLoadingPdf) {
      return (
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: themeColors.text }]}>
            Loading PDF content...
          </Text>
        </View>
      );
    }

    if (pdfError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: '#ef4444' }]}>
            {pdfError}
          </Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={loadPdfContent}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    // Check if we have a PDF file URL
    if (magazineData?.file) {
      return (
        <PDFViewer
          pdfUrl={magazineData.file}
          onPageChange={(page, total) => {
            setCurrentPage(page);
            setTotalPages(total);
            saveReadingProgress();
          }}
          onError={(error) => {
            setPdfError(error);
          }}
          onLoad={() => {
            setIsLoadingPdf(false);
          }}
        />
      );
    }

    // Fallback to text content if no PDF
    return (
      <View style={styles.fallbackContainer}>
        <Ionicons name="document-text-outline" size={64} color={themeColors.text} />
        <Text style={[styles.fallbackTitle, { color: themeColors.text }]}>
          No PDF Available
        </Text>
        <Text style={[styles.fallbackText, { color: themeColors.text }]}>
          This magazine doesn't have a PDF file attached.
        </Text>
        {magazineData?.description && (
          <Text style={[styles.fallbackDescription, { color: themeColors.text }]}>
            {magazineData.description}
          </Text>
        )}
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} />
      
      {/* Header Controls */}
      <View 
        style={[
          styles.header,
          { 
            backgroundColor: themeColors.background,
            borderBottomColor: themeColors.border,
          }
        ]}
      >
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={20} color={themeColors.text} />
        </TouchableOpacity>
        
        <View style={styles.headerCenter}>
          <Text style={[styles.magazineTitle, { color: themeColors.text }]} numberOfLines={1}>
            {magazineData.name}
          </Text>
          <Text style={[styles.pageInfo, { color: themeColors.text }]}>
            Page {currentPage} of {totalPages}
          </Text>
        </View>
        
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerButton} onPress={toggleBookmark}>
            <Ionicons 
              name={isBookmarked(magazineData._id) ? 'bookmark' : 'bookmark-outline'} 
              size={20} 
              color={isBookmarked(magazineData._id) ? '#f59e0b' : themeColors.text} 
            />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.headerButton} 
            onPress={() => setFontSize(prev => Math.min(prev + 2, 24))}
          >
            <Ionicons name="text" size={18} color={themeColors.text} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.headerButton} 
            onPress={() => setFontSize(prev => Math.max(prev - 2, 12))}
          >
            <Ionicons name="remove" size={18} color={themeColors.text} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.headerButton} 
            onPress={() => setTheme(theme === 'dark' ? 'sepia' : theme === 'sepia' ? 'light' : 'dark')}
          >
            <Ionicons name="contrast" size={18} color={themeColors.text} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.headerButton} 
            onPress={toggleSettings}
          >
            <Ionicons name="settings" size={18} color={themeColors.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Reading Content */}
      <View style={styles.contentContainer}>
        {renderContent()}
      </View>

      {/* Progress Bar */}
      <View 
        style={[
          styles.progressContainer,
          { 
            backgroundColor: themeColors.background,
            borderTopColor: themeColors.border,
          }
        ]}
      >
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${readingProgress}%` }
            ]} 
          />
        </View>
        <Text style={[styles.progressText, { color: themeColors.text }]}>
          {Math.round(readingProgress)}% completed
        </Text>
      </View>

      {/* Settings Panel */}
      <Animated.View 
        style={[
          styles.settingsPanel,
          {
            transform: [{
              translateY: settingsSlide.interpolate({
                inputRange: [0, 1],
                outputRange: [height, 0],
              })
            }],
            backgroundColor: themeColors.background,
            borderTopColor: themeColors.border,
          }
        ]}
      >
        <View style={styles.settingsHeader}>
          <Text style={[styles.settingsTitle, { color: themeColors.text }]}>
            Reading Settings
          </Text>
          <TouchableOpacity onPress={toggleSettings}>
            <Ionicons name="close" size={24} color={themeColors.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.settingsSection}>
          <Text style={[styles.settingsLabel, { color: themeColors.text }]}>
            Font Size
          </Text>
          <View style={styles.fontControls}>
            <TouchableOpacity 
              style={[styles.fontButton, { borderColor: themeColors.border }]}
              onPress={() => changeFontSize(-2)}
            >
              <Ionicons name="remove" size={20} color={themeColors.text} />
            </TouchableOpacity>
            <Text style={[styles.fontSizeDisplay, { color: themeColors.text }]}>
              {fontSize}
            </Text>
            <TouchableOpacity 
              style={[styles.fontButton, { borderColor: themeColors.border }]}
              onPress={() => changeFontSize(2)}
            >
              <Ionicons name="add" size={20} color={themeColors.text} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.settingsSection}>
          <Text style={[styles.settingsLabel, { color: themeColors.text }]}>
            Theme
          </Text>
          <View style={styles.themeControls}>
            {(['dark', 'sepia', 'light'] as const).map((themeOption) => (
              <TouchableOpacity
                key={themeOption}
                style={[
                  styles.themeButton,
                  { 
                    borderColor: themeColors.border,
                    backgroundColor: theme === themeOption ? '#f59e0b' : 'transparent'
                  }
                ]}
                onPress={() => changeTheme(themeOption)}
              >
                <Text style={[
                  styles.themeButtonText,
                  { color: theme === themeOption ? '#ffffff' : themeColors.text }
                ]}>
                  {themeOption.charAt(0).toUpperCase() + themeOption.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    zIndex: 1000,
    minHeight: 64,
    maxHeight: 64,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 40,
    minHeight: 40,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 12,
  },
  magazineTitle: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  pageInfo: {
    fontSize: 10,
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
    minWidth: 36,
    minHeight: 36,
  },
  contentContainer: {
    flex: 1,
  },
  heading1: {
    fontWeight: 'bold',
    marginBottom: 12,
    marginTop: 20,
  },
  heading2: {
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 16,
  },
  bodyText: {
    marginBottom: 8,
    textAlign: 'justify',
  },
  progressContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    minHeight: 48,
    maxHeight: 48,
  },
  progressBar: {
    height: 3,
    backgroundColor: '#2a2a2a',
    borderRadius: 1.5,
    marginBottom: 6,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#f59e0b',
    borderRadius: 1.5,
  },
  progressText: {
    fontSize: 10,
    textAlign: 'center',
  },
  settingsPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    paddingHorizontal: 20,
    paddingVertical: 24,
    paddingBottom: 40,
  },
  settingsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  settingsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  settingsSection: {
    marginBottom: 24,
  },
  settingsLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  fontControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fontButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fontSizeDisplay: {
    fontSize: 18,
    fontWeight: '600',
    marginHorizontal: 20,
    minWidth: 30,
    textAlign: 'center',
  },
  themeControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  themeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  themeButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#f59e0b',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  contentText: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'justify',
  },
  fallbackContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  fallbackTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 12,
    textAlign: 'center',
  },
  fallbackText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 24,
  },
  fallbackDescription: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    opacity: 0.8,
  },
});

export default ReadingScreen; 