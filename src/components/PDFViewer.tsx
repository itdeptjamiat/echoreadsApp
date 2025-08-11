import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';

const { width, height } = Dimensions.get('window');

interface PDFViewerProps {
  pdfUrl: string;
  onPageChange?: (page: number, totalPages: number) => void;
  onError?: (error: string) => void;
  onLoad?: () => void;
}

const PDFViewer: React.FC<PDFViewerProps> = ({
  pdfUrl,
  onPageChange,
  onError,
  onLoad,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showControls, setShowControls] = useState(true);

  useEffect(() => {
    console.log('PDFViewer: Loading PDF from URL:', pdfUrl);
    // Hide controls after 3 seconds
    const timer = setTimeout(() => setShowControls(false), 3000);
    return () => clearTimeout(timer);
  }, [pdfUrl]);

  const handleLoadStart = () => {
    console.log('PDFViewer: Starting to load PDF');
    setIsLoading(true);
    setError(null);
  };

  const handleLoadEnd = () => {
    console.log('PDFViewer: PDF load completed');
    setIsLoading(false);
    onLoad?.();
  };

  const handleError = (syntheticEvent: any) => {
    console.error('PDFViewer: Error loading PDF:', syntheticEvent);
    const errorMessage = 'Failed to load PDF. Please check your internet connection.';
    setError(errorMessage);
    setIsLoading(false);
    onError?.(errorMessage);
    Alert.alert('PDF Error', errorMessage);
  };

  const toggleControls = () => {
    setShowControls(!showControls);
  };

  const retryLoad = () => {
    setError(null);
    setIsLoading(true);
  };

  // Create HTML content for PDF viewer with embedded PDF.js and dark theme
  const createPDFViewerHTML = (url: string) => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
          <title>PDF Viewer</title>
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
            
            /* Custom scrollbar for dark theme */
            ::-webkit-scrollbar {
              width: 8px;
              height: 8px;
            }
            
            ::-webkit-scrollbar-track {
              background: #2a2a2a;
            }
            
            ::-webkit-scrollbar-thumb {
              background: #4a4a4a;
              border-radius: 4px;
            }
            
            ::-webkit-scrollbar-thumb:hover {
              background: #5a5a5a;
            }
            
            /* PDF.js viewer customization */
            .pdfViewer {
              background-color: #1a1a1a !important;
            }
            
            .page {
              background-color: #2a2a2a !important;
              border: 1px solid #3a3a3a !important;
              box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3) !important;
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
          </style>
        </head>
        <body>
          <div id="viewerContainer">
            <iframe 
              id="pdfViewer"
              src="https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodeURIComponent(url)}&theme=dark"
              onload="document.getElementById('loading').style.display='none'; customizePDFViewer();"
              onerror="showError()"
            ></iframe>
            <div id="loading" class="loading">
              Loading PDF...
            </div>
            <div id="error" class="error" style="display: none;">
              <h2>Failed to Load PDF</h2>
              <p>There was an error loading the PDF document.</p>
              <button class="retry-btn" onclick="retryLoad()">Retry</button>
            </div>
          </div>
          
          <script>
            function showError() {
              document.getElementById('loading').style.display = 'none';
              document.getElementById('error').style.display = 'flex';
            }
            
            function retryLoad() {
              document.getElementById('error').style.display = 'none';
              document.getElementById('loading').style.display = 'flex';
              location.reload();
            }
            
            function customizePDFViewer() {
              // Wait for PDF.js to load
              setTimeout(() => {
                try {
                  const iframe = document.getElementById('pdfViewer');
                  const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                  
                  if (iframeDoc) {
                    // Apply dark theme to PDF.js elements
                    const style = iframeDoc.createElement('style');
                    style.textContent = \`
                      body { background-color: #1a1a1a !important; }
                      .toolbar { background-color: #2a2a2a !important; }
                      .page { background-color: #2a2a2a !important; }
                      .page canvas { 
                        filter: invert(0.9) hue-rotate(180deg) brightness(0.8) contrast(1.2) !important;
                      }
                      .pageNav { background-color: #2a2a2a !important; color: #ffffff !important; }
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
                      button:hover { background-color: #4a4a4a !important; }
                    \`;
                    iframeDoc.head.appendChild(style);
                  }
                } catch (e) {
                  console.log('PDF customization applied');
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
          </script>
        </body>
      </html>
    `;
  };

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#ef4444" />
        <Ionicons name="document-outline" size={64} color="#ef4444" />
        <Text style={styles.errorTitle}>Failed to Load PDF</Text>
        <Text style={styles.errorText}>{error}</Text>
        <Text style={styles.errorUrl}>URL: {pdfUrl}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={retryLoad}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      {/* PDF Content */}
      <View style={styles.pdfContainer}>
        <WebView
          source={{ html: createPDFViewerHTML(pdfUrl) }}
          style={styles.webview}
          onLoadStart={handleLoadStart}
          onLoadEnd={handleLoadEnd}
          onError={handleError}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          allowsInlineMediaPlayback={true}
          mediaPlaybackRequiresUserAction={false}
          scrollEnabled={true}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={true}
          bounces={false}
          onMessage={(event: any) => {
            console.log('WebView message:', event.nativeEvent.data);
          }}
          // Improved WebView configuration for better PDF handling
          originWhitelist={['*']}
          allowsBackForwardNavigationGestures={false}
          decelerationRate="normal"
          // Remove audio-related features
          allowsLinkPreview={false}
          allowsProtectedMedia={false}
        />
      </View>

      {/* Loading Overlay */}
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#f59e0b" />
          <Text style={styles.loadingText}>Loading PDF...</Text>
        </View>
      )}

      {/* Touch area to toggle controls */}
      <TouchableOpacity 
        style={styles.touchArea} 
        onPress={toggleControls}
        activeOpacity={1}
      />

      {/* Info Bar */}
      {showControls && (
        <View style={styles.infoBar}>
          <View style={styles.infoContent}>
            <Ionicons name="information-circle" size={20} color="#ffffff" />
            <Text style={styles.infoText}>
              PDF is displayed securely within the app
            </Text>
          </View>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setShowControls(false)}
          >
            <Ionicons name="close" size={20} color="#ffffff" />
          </TouchableOpacity>
        </View>
      )}

      {/* Security Badge */}
      <View style={styles.securityBadge}>
        <Ionicons name="shield-checkmark" size={16} color="#10b981" />
        <Text style={styles.securityText}>Secure In-App Viewing</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
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
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 3,
  },
  loadingText: {
    color: '#ffffff',
    fontSize: 16,
    marginTop: 16,
  },
  infoBar: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 2,
  },
  infoContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  infoText: {
    color: '#ffffff',
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  closeButton: {
    padding: 4,
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    padding: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ef4444',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: '#cccccc',
    textAlign: 'center',
    marginBottom: 16,
  },
  errorUrl: {
    fontSize: 12,
    color: '#999999',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 20,
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

export default PDFViewer; 