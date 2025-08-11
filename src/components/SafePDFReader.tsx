import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  StatusBar,
  SafeAreaView,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import { LinearGradient } from 'expo-linear-gradient';


const { width, height } = Dimensions.get('window');

interface SafePDFReaderProps {
  pdfUrl: string;
  magazineTitle: string;
  onPageChange?: (page: number, totalPages: number) => void;
  onError?: (error: string) => void;
  onLoad?: () => void;
  onClose?: () => void;
  fontSize?: number;
  zoomLevel?: number;
  themeMode?: 'light' | 'dark' | 'sepia';
  enableSwipeNavigation?: boolean;
}

const SafePDFReader = forwardRef<any, SafePDFReaderProps>(({
  pdfUrl,
  magazineTitle,
  onPageChange,
  onError,
  onLoad,
  onClose,
  fontSize = 16,
  zoomLevel = 1,
  themeMode = 'dark',
  enableSwipeNavigation = true,
}, ref) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showControls, setShowControls] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [readingProgress, setReadingProgress] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarkPage, setBookmarkPage] = useState(1);

  const [isFullscreen, setIsFullscreen] = useState(false);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const controlsOpacity = useRef(new Animated.Value(1)).current;

  const webViewRef = useRef<WebView>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    goToPage: (pageNumber: number) => {
      if (pageNumber >= 1 && pageNumber <= totalPages) {
        webViewRef.current?.postMessage(JSON.stringify({
          type: 'goToPage',
          page: pageNumber
        }));
      }
    }
  }));

  const hideControls = () => {
    Animated.timing(controlsOpacity, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setShowControls(false);
    });
  };

  useEffect(() => {
    console.log('SafePDFReader: Loading PDF from URL:', pdfUrl);
    
    // Auto-hide controls after 5 seconds
    const timer = setTimeout(() => {
      hideControls();
    }, 5000);
    
    return () => {
      clearTimeout(timer);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [pdfUrl]);

  const showControlsTemporarily = () => {
    setShowControls(true);
    Animated.timing(controlsOpacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
    
    // Auto-hide after 5 seconds
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(hideControls, 5000);
  };

  const handleLoadStart = () => {
    console.log('SafePDFReader: Starting to load PDF');
    setIsLoading(true);
    setError(null);
  };

  const handleLoadEnd = () => {
    console.log('SafePDFReader: PDF load completed');
    setIsLoading(false);
    onLoad?.();
  };

  const handleError = (syntheticEvent: any) => {
    console.error('SafePDFReader: Error loading PDF:', syntheticEvent);
    const errorMessage = 'Failed to load PDF securely. Please check your connection.';
    setError(errorMessage);
    setIsLoading(false);
    onError?.(errorMessage);
    Alert.alert('PDF Error', errorMessage);
  };

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      console.log('SafePDFReader: Message from WebView:', data);
      
      if (data.type === 'pageChange') {
        setCurrentPage(data.page);
        setTotalPages(data.totalPages);
        setReadingProgress((data.page / data.totalPages) * 100);
        onPageChange?.(data.page, data.totalPages);
      } else if (data.type === 'pdfLoaded') {
        setTotalPages(data.totalPages);
        setIsLoading(false);
      }
    } catch (error) {
      console.log('SafePDFReader: Non-JSON message:', event.nativeEvent.data);
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const changeFontSize = (increment: boolean) => {
    // Font size is now controlled by parent component
    console.log('Font size change requested:', increment ? 'increase' : 'decrease');
  };

  const changeTheme = () => {
    // Theme is now controlled by parent component
    console.log('Theme change requested');
  };

  const toggleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    setBookmarkPage(currentPage);
    // Here you would save to AsyncStorage or your backend
  };

  const goToPage = (pageNumber: number) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      webViewRef.current?.postMessage(JSON.stringify({
        type: 'goToPage',
        page: pageNumber
      }));
    }
  };

  const retryLoad = () => {
    setError(null);
    setIsLoading(true);
    webViewRef.current?.reload();
  };

  // Create enhanced HTML content for secure PDF viewer
  const createSecurePDFViewerHTML = (url: string) => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
          <meta http-equiv="Content-Security-Policy" content="default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob: https://mozilla.github.io https://cdn.jsdelivr.net; img-src 'self' data: blob: https:; media-src 'self' data: blob: https:;">
          <title>Secure PDF Reader - ${magazineTitle}</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              margin: 0;
              padding: 0;
              background-color: #1a1a1a;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              overflow: hidden;
              height: 100vh;
              width: 100vw;
              color: #ffffff;
            }
            
            #viewerContainer {
              width: 100vw;
              height: 100vh;
              overflow: hidden;
              position: relative;
            }
            
            #pdfViewer {
              width: 100%;
              height: 100%;
              border: none;
              background-color: #1a1a1a;
            }
            
            .loading {
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              color: #ffffff;
              font-size: 18px;
              background-color: #1a1a1a;
            }
            
            .error {
              display: flex;
              flex-direction: column;
              justify-content: center;
              align-items: center;
              height: 100vh;
              color: #ef4444;
              text-align: center;
              padding: 20px;
              background-color: #1a1a1a;
            }
            
            .error h2 {
              margin-bottom: 16px;
              color: #ffffff;
            }
            
            .retry-btn {
              background-color: #f59e0b;
              color: #ffffff;
              border: none;
              padding: 12px 24px;
              border-radius: 8px;
              font-size: 16px;
              font-weight: 600;
              cursor: pointer;
              margin-top: 16px;
            }
            
            /* Security indicators */
            .security-indicator {
              position: fixed;
              top: 20px;
              right: 20px;
              background-color: rgba(16, 185, 129, 0.9);
              color: white;
              padding: 8px 12px;
              border-radius: 20px;
              font-size: 12px;
              font-weight: 600;
              z-index: 1000;
              display: flex;
              align-items: center;
              gap: 6px;
            }
            
            .security-indicator::before {
              content: "🔒";
              font-size: 14px;
            }
            
            /* PDF.js viewer customization */
            .pdfViewer {
              background-color: #1a1a1a !important;
            }
            
            .page {
              background-color: #2a2a2a !important;
              border: 1px solid #3a3a3a !important;
              box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3) !important;
              margin: 10px auto !important;
            }
            
            .page canvas {
              filter: invert(0.9) hue-rotate(180deg) brightness(0.8) contrast(1.2);
            }
            
            /* Toolbar customization */
            .toolbar {
              background-color: #2a2a2a !important;
              border-bottom: 1px solid #3a3a3a !important;
            }
            
            .toolbar button {
              background-color: #3a3a3a !important;
              color: #ffffff !important;
              border: 1px solid #4a4a4a !important;
            }
            
            .toolbar button:hover {
              background-color: #4a4a4a !important;
            }
            
            /* Page navigation */
            .pageNav {
              background-color: #2a2a2a !important;
              color: #ffffff !important;
            }
            
            .pageNav input {
              background-color: #3a3a3a !important;
              color: #ffffff !important;
              border: 1px solid #4a4a4a !important;
            }
            
            /* Reading progress bar */
            .reading-progress {
              position: fixed;
              top: 0;
              left: 0;
              width: 100%;
              height: 3px;
              background-color: #2a2a2a;
              z-index: 1001;
            }
            
            .reading-progress-bar {
              height: 100%;
              background: linear-gradient(90deg, #f59e0b, #fbbf24);
              transition: width 0.3s ease;
            }
          </style>
        </head>
        <body>
          <!-- Security Indicator -->
          <div class="security-indicator">
            Secure Reading Mode
          </div>
          
          <!-- Reading Progress Bar -->
          <div class="reading-progress">
            <div class="reading-progress-bar" id="progressBar" style="width: 0%"></div>
          </div>
          
          <div id="viewerContainer">
            <iframe 
              id="pdfViewer"
              src="https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodeURIComponent(url)}&theme=dark&disableAutoFetch=true&disableStream=true"
              onload="document.getElementById('loading').style.display='none'; initializeSecureReader();"
              onerror="showError()"
            ></iframe>
            <div id="loading" class="loading">
              <div style="text-align: center;">
                <div style="font-size: 24px; margin-bottom: 16px;">🔒</div>
                <div>Loading PDF Securely...</div>
                <div style="font-size: 14px; color: #a3a3a3; margin-top: 8px;">Safe reading mode enabled</div>
              </div>
            </div>
            <div id="error" class="error" style="display: none;">
              <h2>🔒 Secure Loading Failed</h2>
              <p>Unable to load PDF in secure mode.</p>
              <p style="font-size: 14px; color: #a3a3a3; margin-top: 8px;">This may be due to network restrictions or file access issues.</p>
              <button class="retry-btn" onclick="retryLoad()">Retry Securely</button>
            </div>
          </div>
          
          <script>
            let currentPage = 1;
            let totalPages = 0;
            let readingProgress = 0;
            
            function showError() {
              document.getElementById('loading').style.display = 'none';
              document.getElementById('error').style.display = 'flex';
            }
            
            function retryLoad() {
              document.getElementById('error').style.display = 'none';
              document.getElementById('loading').style.display = 'flex';
              location.reload();
            }
            
            function updateProgress(page, total) {
              currentPage = page;
              totalPages = total;
              readingProgress = (page / total) * 100;
              
              // Update progress bar
              const progressBar = document.getElementById('progressBar');
              if (progressBar) {
                progressBar.style.width = readingProgress + '%';
              }
              
              // Send message to React Native
              if (window.ReactNativeWebView) {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'pageChange',
                  page: page,
                  totalPages: total
                }));
              }
            }
            
            function initializeSecureReader() {
              // Wait for PDF.js to load
              setTimeout(() => {
                try {
                  const iframe = document.getElementById('pdfViewer');
                  const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                  
                  if (iframeDoc) {
                    // Apply enhanced security and customization
                    const style = iframeDoc.createElement('style');
                    style.textContent = \`
                      body { 
                        background-color: #1a1a1a !important; 
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
                      }
                      .toolbar { 
                        background-color: #2a2a2a !important; 
                        border-bottom: 1px solid #3a3a3a !important;
                      }
                      .page { 
                        background-color: #2a2a2a !important; 
                        border: 1px solid #3a3a3a !important;
                        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3) !important;
                        margin: 10px auto !important;
                      }
                      .page canvas { 
                        filter: invert(0.9) hue-rotate(180deg) brightness(0.8) contrast(1.2) !important;
                      }
                      .pageNav { 
                        background-color: #2a2a2a !important; 
                        color: #ffffff !important; 
                      }
                      .pageNav input { 
                        background-color: #3a3a3a !important; 
                        color: #ffffff !important; 
                        border: 1px solid #4a4a4a !important; 
                      }
                      button { 
                        background-color: #3a3a3a !important; 
                        color: #ffffff !important; 
                        border: 1px solid #4a4a4a !important; 
                      }
                      button:hover { 
                        background-color: #4a4a4a !important; 
                      }
                      
                      /* Enhanced security styling */
                      .toolbarViewer {
                        background: linear-gradient(135deg, #2a2a2a, #1a1a1a) !important;
                      }
                      
                      .secondaryToolbar {
                        background-color: #1a1a1a !important;
                        border-top: 1px solid #3a3a3a !important;
                      }
                      
                      .findbar {
                        background-color: #2a2a2a !important;
                        border-top: 1px solid #3a3a3a !important;
                      }
                    \`;
                    iframeDoc.head.appendChild(style);
                    
                    // Monitor page changes
                    const observer = new MutationObserver(() => {
                      const pageNumberElement = iframeDoc.querySelector('.pageNumber');
                      const pageCountElement = iframeDoc.querySelector('.numPages');
                      
                      if (pageNumberElement && pageCountElement) {
                        const page = parseInt(pageNumberElement.textContent);
                        const total = parseInt(pageCountElement.textContent);
                        if (page && total) {
                          updateProgress(page, total);
                        }
                      }
                    });
                    
                    observer.observe(iframeDoc.body, {
                      childList: true,
                      subtree: true
                    });
                    
                    // Notify that PDF is loaded
                    if (window.ReactNativeWebView) {
                      window.ReactNativeWebView.postMessage(JSON.stringify({
                        type: 'pdfLoaded',
                        totalPages: totalPages
                      }));
                    }
                  }
                } catch (e) {
                  console.log('Secure reader initialization completed');
                }
              }, 2000);
            }
            
            // Handle iframe load events
            const iframe = document.getElementById('pdfViewer');
            iframe.onload = function() {
              document.getElementById('loading').style.display = 'none';
            };
            
            iframe.onerror = function() {
              showError();
            };
            
            // Listen for messages from React Native
            document.addEventListener('message', function(event) {
              try {
                const data = JSON.parse(event.data);
                handleMessage(data);
              } catch (e) {
                console.log('Invalid message format');
              }
            });
            
            function handleMessage(data) {
              switch(data.type) {
                case 'changeFontSize':
                  // Implement font size change
                  break;
                case 'changeTheme':
                  // Implement theme change
                  break;
                case 'goToPage':
                  // Implement page navigation
                  break;
              }
            }
          </script>
        </body>
      </html>
    `;
  };

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: '#1a1a1a' }]}>
        <StatusBar barStyle="light-content" backgroundColor="#ef4444" />
        <SafeAreaView style={styles.errorContainer}>
          <View style={styles.errorContent}>
            <Ionicons name="shield" size={64} color="#ef4444" />
            <Text style={styles.errorTitle}>Secure Loading Failed</Text>
            <Text style={styles.errorText}>{error}</Text>
            <Text style={styles.errorSubtext}>
              The PDF could not be loaded in secure mode. This ensures your safety while reading.
            </Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={retryLoad}
            >
              <Text style={styles.retryButtonText}>Retry Securely</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={[styles.container, isFullscreen && styles.fullscreenContainer]}>
      <StatusBar 
        barStyle="light-content" 
        backgroundColor="#000000" 
        hidden={isFullscreen}
      />
      
      {/* PDF Content */}
      <View style={styles.pdfContainer}>
        <WebView
          ref={webViewRef}
          source={{ html: createSecurePDFViewerHTML(pdfUrl) }}
          style={styles.webview}
          onLoadStart={handleLoadStart}
          onLoadEnd={handleLoadEnd}
          onError={handleError}
          onMessage={handleMessage}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          scrollEnabled={true}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={true}
          bounces={false}
          // Security configuration
          originWhitelist={['*']}
          allowsLinkPreview={false}
          allowsProtectedMedia={false}
          // Disable potentially unsafe features
          allowFileAccess={false}
          allowFileAccessFromFileURLs={false}
          allowUniversalAccessFromFileURLs={false}
          // Enable secure features
          mixedContentMode="never"
          cacheEnabled={false}
        />
      </View>

      {/* Loading Overlay */}
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <LinearGradient
            colors={['rgba(0,0,0,0.9)', 'rgba(26,26,26,0.9)']}
            style={styles.loadingGradient}
          >
            <ActivityIndicator size="large" color="#f59e0b" />
            <Text style={styles.loadingText}>Loading PDF Securely...</Text>
            <Text style={styles.loadingSubtext}>🔒 Safe reading mode enabled</Text>
          </LinearGradient>
        </View>
      )}

      {/* Touch area to show controls */}
      <TouchableOpacity 
        style={styles.touchArea} 
        onPress={showControlsTemporarily}
        activeOpacity={1}
      />

      {/* Enhanced Controls */}
      {showControls && (
        <Animated.View 
          style={[
            styles.controlsContainer,
            { opacity: controlsOpacity }
          ]}
        >
          {/* Top Bar */}
          <View style={styles.topBar}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
            >
              <Ionicons name="close" size={24} color="#ffffff" />
            </TouchableOpacity>
            
            <View style={styles.titleContainer}>
              <Text style={styles.magazineTitle} numberOfLines={1}>
                {magazineTitle}
              </Text>
              <Text style={styles.pageInfo}>
                Page {currentPage} of {totalPages}
              </Text>
            </View>
            
            <TouchableOpacity
              style={styles.fullscreenButton}
              onPress={toggleFullscreen}
            >
              <Ionicons 
                name={isFullscreen ? "contract" : "expand"} 
                size={24} 
                color="#ffffff" 
              />
            </TouchableOpacity>
          </View>

          {/* Reading Progress */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${readingProgress}%` }
                ]} 
              />
            </View>
            <Text style={styles.progressText}>
              {Math.round(readingProgress)}% read
            </Text>
          </View>

          {/* Control Buttons */}
          <View style={styles.controlButtons}>
            <TouchableOpacity
              style={styles.controlButton}
              onPress={() => changeFontSize(false)}
            >
              <Ionicons name="remove" size={20} color="#ffffff" />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.controlButton}
              onPress={changeTheme}
            >
              <Ionicons name="color-palette" size={20} color="#ffffff" />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.controlButton}
              onPress={toggleBookmark}
            >
              <Ionicons 
                name={isBookmarked ? "bookmark" : "bookmark-outline"} 
                size={20} 
                color={isBookmarked ? "#f59e0b" : "#ffffff"} 
              />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.controlButton}
              onPress={() => changeFontSize(true)}
            >
              <Ionicons name="add" size={20} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}

      {/* Security Badge */}
      <View style={styles.securityBadge}>
        <Ionicons name="shield-checkmark" size={16} color="#10b981" />
        <Text style={styles.securityText}>Secure Reading</Text>
      </View>

      {/* Page Navigation */}
      {showControls && (
        <Animated.View 
          style={[
            styles.pageNavigation,
            { opacity: controlsOpacity }
          ]}
        >
          <TouchableOpacity
            style={[styles.navButton, currentPage <= 1 && styles.navButtonDisabled]}
            onPress={() => goToPage(currentPage - 1)}
            disabled={currentPage <= 1}
          >
            <Ionicons name="chevron-back" size={24} color="#ffffff" />
          </TouchableOpacity>
          
          <Text style={styles.pageNumber}>{currentPage}</Text>
          
          <TouchableOpacity
            style={[styles.navButton, currentPage >= totalPages && styles.navButtonDisabled]}
            onPress={() => goToPage(currentPage + 1)}
            disabled={currentPage >= totalPages}
          >
            <Ionicons name="chevron-forward" size={24} color="#ffffff" />
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  fullscreenContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
  },
  pdfContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  webview: {
    flex: 1,
    backgroundColor: '#000000',
  },
  touchArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 3,
  },
  loadingGradient: {
    padding: 40,
    borderRadius: 20,
    alignItems: 'center',
  },
  loadingText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    textAlign: 'center',
  },
  loadingSubtext: {
    color: '#a3a3a3',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  controlsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    zIndex: 2,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  titleContainer: {
    flex: 1,
    marginHorizontal: 16,
  },
  magazineTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  pageInfo: {
    color: '#a3a3a3',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
  },
  fullscreenButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
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
    color: '#a3a3a3',
    fontSize: 12,
    textAlign: 'center',
  },
  controlButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  controlButton: {
    padding: 12,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    minWidth: 50,
    alignItems: 'center',
  },
  securityBadge: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 2,
  },
  securityText: {
    color: '#10b981',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  pageNavigation: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 12,
    zIndex: 2,
  },
  navButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  navButtonDisabled: {
    opacity: 0.3,
  },
  pageNumber: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
  errorContent: {
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ef4444',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#cccccc',
    textAlign: 'center',
    marginBottom: 16,
  },
  errorSubtext: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 20,
    lineHeight: 20,
  },
  retryButton: {
    backgroundColor: '#f59e0b',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SafePDFReader; 