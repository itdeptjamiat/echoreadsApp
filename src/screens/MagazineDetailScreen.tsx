import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { magazinesAPI, Magazine } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import RatingModal from '../components/RatingModal';
import RatingDisplay from '../components/RatingDisplay';
import BeautifulAlert from '../components/BeautifulAlert';

const { width, height } = Dimensions.get('window');

type RootStackParamList = {
  MagazineDetail: { magazineId: string; magazineData?: Magazine };
};

type MagazineDetailRouteProp = RouteProp<RootStackParamList, 'MagazineDetail'>;

const MagazineDetailScreen: React.FC = () => {
  const route = useRoute<MagazineDetailRouteProp>();
  const navigation = useNavigation();
  const { magazineId, magazineData } = route.params;

  const [magazine, setMagazine] = useState<Magazine | null>(magazineData || null);
  const [loading, setLoading] = useState(!magazineData);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [reading, setReading] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'ratings'>('details');
  const [alertState, setAlertState] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'info' as 'success' | 'error' | 'info',
  });

  useEffect(() => {
    if (!magazineData) {
      fetchMagazineDetails();
    }
  }, [magazineId, magazineData]);

  const fetchMagazineDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching magazine details for ID:', magazineId);
      
      const response = await magazinesAPI.getMagazineById(magazineId);
      console.log('Magazine detail response:', response);
      
      if (response.success && response.data) {
        setMagazine(response.data);
        console.log('Magazine set successfully:', response.data);
      } else {
        console.error('Invalid response structure:', response);
        setError('Invalid magazine data received');
      }
    } catch (err: any) {
      console.error('Error fetching magazine details:', err);
      setError(err.message || 'Failed to fetch magazine details');
    } finally {
      setLoading(false);
    }
  };

  const showBeautifulAlert = (title: string, message: string, type: 'success' | 'error' | 'info') => {
    setAlertState({
      visible: true,
      title,
      message,
      type,
    });
  };

  const hideAlert = () => {
    setAlertState(prev => ({
      ...prev,
      visible: false,
    }));
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      // Simulate download process
      await new Promise(resolve => setTimeout(resolve, 2000));
      showBeautifulAlert('Success', 'Magazine downloaded successfully!', 'success');
    } catch (error) {
      showBeautifulAlert('Error', 'Failed to download magazine', 'error');
    } finally {
      setDownloading(false);
    }
  };

  const handleRead = async () => {
    setReading(true);
    try {
      // Simulate opening magazine
      await new Promise(resolve => setTimeout(resolve, 1500));
      showBeautifulAlert('Success', 'Opening magazine for reading...', 'success');
    } catch (error) {
      showBeautifulAlert('Error', 'Failed to open magazine', 'error');
    } finally {
      setReading(false);
    }
  };

  const handleRateMagazine = () => {
    setShowRatingModal(true);
  };

  const handleRatingSubmitted = () => {
    // Optionally refresh magazine data to show updated rating
    if (!magazineData) {
      fetchMagazineDetails();
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner message="Loading magazine details..." size="large" type="dots" />
      </View>
    );
  }

  if (error || !magazine) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#f59e0b" />
          <Text style={styles.errorTitle}>Oops!</Text>
          <Text style={styles.errorText}>{error || 'Magazine not found'}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchMagazineDetails}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.retryButton, { marginTop: 12, backgroundColor: '#1a1a1a' }]} 
            onPress={() => console.log('Current magazine ID:', magazineId)}
          >
            <Text style={styles.retryButtonText}>Debug: Log ID</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.shareButton}>
          <Ionicons name="share-outline" size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Magazine Cover */}
        <View style={styles.coverContainer}>
          <Image source={{ uri: magazine.image }} style={styles.coverImage} />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.8)']}
            style={styles.coverOverlay}
          />
          <View style={styles.coverInfo}>
            <View style={styles.typeBadge}>
              <Text style={styles.typeText}>{magazine.type.toUpperCase()}</Text>
            </View>
            <Text style={styles.magazineTitle}>{magazine.name}</Text>
            <Text style={styles.magazineCategory}>{magazine.category}</Text>
          </View>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'details' && styles.activeTabButton]}
            onPress={() => setActiveTab('details')}
          >
            <Ionicons 
              name="information-circle-outline" 
              size={20} 
              color={activeTab === 'details' ? '#f59e0b' : '#666666'} 
            />
            <Text style={[styles.tabText, activeTab === 'details' && styles.activeTabText]}>
              Details
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'ratings' && styles.activeTabButton]}
            onPress={() => setActiveTab('ratings')}
          >
            <Ionicons 
              name="star-outline" 
              size={20} 
              color={activeTab === 'ratings' ? '#f59e0b' : '#666666'} 
            />
            <Text style={[styles.tabText, activeTab === 'ratings' && styles.activeTabText]}>
              Ratings & Reviews
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content based on active tab */}
        {activeTab === 'details' ? (
          <View style={styles.detailsContainer}>
            {/* Stats */}
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Ionicons name="download-outline" size={20} color="#f59e0b" />
                <Text style={styles.statValue}>{magazine.downloads}</Text>
                <Text style={styles.statLabel}>Downloads</Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="star" size={20} color="#f59e0b" />
                <Text style={styles.statValue}>{magazine.rating}/5</Text>
                <Text style={styles.statLabel}>Rating</Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="book-outline" size={20} color="#f59e0b" />
                <Text style={styles.statValue}>{magazine.type}</Text>
                <Text style={styles.statLabel}>Type</Text>
              </View>
            </View>

            {/* Detailed Information */}
            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>Magazine Information</Text>
              
              <View style={styles.infoGrid}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Name:</Text>
                  <Text style={styles.infoValue}>{magazine.name}</Text>
                </View>
                
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Category:</Text>
                  <Text style={styles.infoValue}>{magazine.category}</Text>
                </View>
                
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Type:</Text>
                  <View style={styles.badgeContainer}>
                    <View style={[styles.badge, styles.typeBadge]}>
                      <Text style={styles.badgeText}>{magazine.type.toUpperCase()}</Text>
                    </View>
                  </View>
                </View>
                
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Access:</Text>
                  <View style={styles.badgeContainer}>
                    <View style={[styles.badge, magazine.type === 'pro' ? styles.proBadge : styles.freeBadge]}>
                      <Text style={styles.badgeText}>{magazine.type.toUpperCase()}</Text>
                    </View>
                  </View>
                </View>
                
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Status:</Text>
                  <View style={styles.badgeContainer}>
                    <View style={[styles.badge, styles.activeBadge]}>
                      <Text style={styles.badgeText}>ACTIVE</Text>
                    </View>
                  </View>
                </View>
                
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>File Type:</Text>
                  <Text style={styles.infoValue}>PDF</Text>
                </View>
                
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Created:</Text>
                  <Text style={styles.infoValue}>
                    {magazine.createdAt ? new Date(magazine.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    }) : 'N/A'}
                  </Text>
                </View>
                
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Downloads:</Text>
                  <Text style={styles.infoValue}>{magazine.downloads}</Text>
                </View>
                
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Rating:</Text>
                  <Text style={styles.infoValue}>{magazine.rating}/5</Text>
                </View>
              </View>
            </View>

            {/* Description */}
            <View style={styles.descriptionContainer}>
              <Text style={styles.descriptionTitle}>Description</Text>
              <Text style={styles.descriptionText}>{magazine.description}</Text>
            </View>

            {/* Document Section */}
            <View style={styles.documentSection}>
              <Text style={styles.documentTitle}>Document</Text>
              <View style={styles.documentInfo}>
                <View style={styles.documentMeta}>
                  <Ionicons name="document-outline" size={24} color="#f59e0b" />
                  <View style={styles.documentDetails}>
                    <Text style={styles.documentName}>{magazine.name}.pdf</Text>
                    <Text style={styles.documentSize}>PDF Document</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Features */}
            <View style={styles.featuresContainer}>
              <Text style={styles.featuresTitle}>Features</Text>
              <View style={styles.featureList}>
                <View style={styles.featureItem}>
                  <Ionicons name="checkmark-circle" size={20} color="#f59e0b" />
                  <Text style={styles.featureText}>High-quality content</Text>
                </View>
                <View style={styles.featureItem}>
                  <Ionicons name="checkmark-circle" size={20} color="#f59e0b" />
                  <Text style={styles.featureText}>Offline reading available</Text>
                </View>
                <View style={styles.featureItem}>
                  <Ionicons name="checkmark-circle" size={20} color="#f59e0b" />
                  <Text style={styles.featureText}>Multiple formats supported</Text>
                </View>
                <View style={styles.featureItem}>
                  <Ionicons name="checkmark-circle" size={20} color="#f59e0b" />
                  <Text style={styles.featureText}>Professional content</Text>
                </View>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.ratingsContainer}>
            <RatingDisplay
              magazineId={magazineId}
              magazineName={magazine.name}
              magazineMid={magazine.mid}
              onRatingSubmitted={handleRatingSubmitted}
            />
          </View>
        )}
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionContainer}>
        <TouchableOpacity
          style={[styles.actionButton, styles.downloadButton]}
          onPress={handleDownload}
          disabled={downloading}
        >
          {downloading ? (
            <LoadingSpinner message="Downloading..." size="small" type="pulse" />
          ) : (
            <>
              <Ionicons name="download-outline" size={20} color="#ffffff" />
              <Text style={styles.actionButtonText}>Download</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.readButton]}
          onPress={handleRead}
          disabled={reading}
        >
          {reading ? (
            <LoadingSpinner message="Opening..." size="small" type="wave" />
          ) : (
            <>
              <Ionicons name="book-outline" size={20} color="#ffffff" />
              <Text style={styles.actionButtonText}>Read Now</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.rateButton]}
          onPress={handleRateMagazine}
        >
          <Ionicons name="star-outline" size={20} color="#ffffff" />
          <Text style={styles.actionButtonText}>Rate</Text>
        </TouchableOpacity>
      </View>

      {/* Rating Modal */}
      <RatingModal
        visible={showRatingModal}
        onClose={() => setShowRatingModal(false)}
        magazineId={magazineId}
        magazineName={magazine?.name || ''}
        magazineMid={magazine?.mid}
        onRatingSubmitted={handleRatingSubmitted}
      />

      {/* Beautiful Alert */}
      <BeautifulAlert
        visible={alertState.visible}
        title={alertState.title}
        message={alertState.message}
        type={alertState.type}
        onClose={hideAlert}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorTitle: {
    fontSize: Math.max(24, width * 0.06),
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: Math.max(16, width * 0.04),
    color: '#a3a3a3',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#f59e0b',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: Math.max(16, width * 0.04),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Math.max(20, width * 0.05),
    paddingVertical: Math.max(16, height * 0.02),
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  coverContainer: {
    height: Math.max(300, height * 0.35),
    position: 'relative',
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
    height: '50%',
  },
  coverInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Math.max(20, width * 0.05),
  },
  typeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#f59e0b',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 12,
  },
  typeText: {
    color: '#ffffff',
    fontSize: Math.max(12, width * 0.03),
    fontWeight: '600',
  },
  magazineTitle: {
    fontSize: Math.max(24, width * 0.06),
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  magazineCategory: {
    fontSize: Math.max(16, width * 0.04),
    color: '#e5e5e5',
  },
  detailsContainer: {
    paddingHorizontal: Math.max(20, width * 0.05),
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: Math.max(20, width * 0.05),
    marginBottom: 24,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: Math.max(18, width * 0.045),
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: Math.max(12, width * 0.03),
    color: '#a3a3a3',
  },
  infoSection: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: Math.max(20, width * 0.05),
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: Math.max(18, width * 0.045),
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
  },
  infoGrid: {
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: Math.max(16, width * 0.04),
    color: '#e5e5e5',
    fontWeight: '600',
  },
  infoValue: {
    fontSize: Math.max(16, width * 0.04),
    color: '#ffffff',
    fontWeight: '600',
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  proBadge: {
    backgroundColor: '#f59e0b',
  },
  freeBadge: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#f59e0b',
  },
  activeBadge: {
    backgroundColor: '#10b981',
  },
  badgeText: {
    fontSize: Math.max(12, width * 0.03),
    color: '#ffffff',
    fontWeight: '600',
  },
  descriptionContainer: {
    marginBottom: 24,
  },
  descriptionTitle: {
    fontSize: Math.max(18, width * 0.045),
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: Math.max(16, width * 0.04),
    color: '#e5e5e5',
    lineHeight: 24,
  },
  documentSection: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: Math.max(20, width * 0.05),
    marginBottom: 24,
  },
  documentTitle: {
    fontSize: Math.max(18, width * 0.045),
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
  },
  documentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  documentMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  documentDetails: {
    marginLeft: 12,
  },
  documentName: {
    fontSize: Math.max(16, width * 0.04),
    color: '#ffffff',
    fontWeight: '600',
  },
  documentSize: {
    fontSize: Math.max(14, width * 0.035),
    color: '#a3a3a3',
  },
  featuresContainer: {
    marginBottom: 24,
  },
  featuresTitle: {
    fontSize: Math.max(18, width * 0.045),
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
  },
  featureList: {
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureText: {
    fontSize: Math.max(16, width * 0.04),
    color: '#e5e5e5',
    marginLeft: 12,
  },
  actionContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    paddingHorizontal: Math.max(20, width * 0.05),
    paddingVertical: Math.max(20, height * 0.025),
    backgroundColor: '#0a0a0a',
    borderTopWidth: 1,
    borderTopColor: '#1a1a1a',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Math.max(16, height * 0.02),
    borderRadius: 12,
    marginHorizontal: 8,
  },
  downloadButton: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#f59e0b',
  },
  readButton: {
    backgroundColor: '#f59e0b',
  },
  rateButton: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#f59e0b',
  },
  actionButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: Math.max(16, width * 0.04),
    marginLeft: 8,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    marginHorizontal: 20,
    marginVertical: 16,
    borderRadius: 12,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  activeTabButton: {
    backgroundColor: '#f59e0b',
  },
  tabText: {
    color: '#666666',
    fontSize: Math.max(14, width * 0.035),
    fontWeight: '600',
    marginLeft: 8,
  },
  activeTabText: {
    color: '#ffffff',
  },
  ratingsContainer: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
});

export default MagazineDetailScreen; 