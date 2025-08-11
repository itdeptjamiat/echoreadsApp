import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  StyleSheet,
  Dimensions,
  RefreshControl,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';
import { useLibrary } from '../context/LibraryContext';
import { useAlert } from '../context/AlertContext';
import { Magazine } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import BeautifulAlert from '../components/BeautifulAlert';

const { width, height } = Dimensions.get('window');

type LibraryNavigationProp = StackNavigationProp<RootStackParamList>;

const LibraryScreen: React.FC = () => {
  const navigation = useNavigation<LibraryNavigationProp>();
  const { 
    downloadedMagazines, 
    bookmarkedMagazines,
    readingLists, 
    libraryStats, 
    isLoading,
    isDownloaded,
    downloadMagazine,
    removeDownloadedMagazine,
    createReadingList,
    deleteReadingList,
    isDownloading,
    downloadProgress,
    refreshLibraryStats
  } = useLibrary();
  const { showSuccess, showError } = useAlert();

  const [activeTab, setActiveTab] = useState<'downloads' | 'bookmarks' | 'stats'>('downloads');
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateListModal, setShowCreateListModal] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [newListDescription, setNewListDescription] = useState('');

  useEffect(() => {
    refreshLibraryStats();
  }, [downloadedMagazines]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      refreshLibraryStats();
      // Add any other refresh logic here
    } catch (error) {
      console.error('Error refreshing library:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleMagazinePress = (magazine: Magazine) => {
    navigation.navigate('Reading', {
      magazineId: magazine._id,
      magazineData: magazine,
    });
  };

  const handleDownloadPress = async (magazine: Magazine) => {
    if (isDownloaded(magazine._id)) {
      // Show remove confirmation
      showError('Already Downloaded', 'This magazine is already downloaded. Remove it first to re-download.');
      return;
    }

    try {
      await downloadMagazine(magazine, (progress) => {
        console.log(`Download progress for ${magazine.name}: ${progress.progress}%`);
      });
    } catch (error) {
      console.error('Download error:', error);
    }
  };

  const handleRemoveDownload = async (magazineId: string) => {
    try {
      await removeDownloadedMagazine(magazineId);
    } catch (error) {
      console.error('Remove error:', error);
    }
  };

  const handleCreateList = async () => {
    if (!newListName.trim()) {
      showError('Error', 'Please enter a list name');
      return;
    }

    try {
      await createReadingList(newListName.trim(), newListDescription.trim());
      setNewListName('');
      setNewListDescription('');
      setShowCreateListModal(false);
    } catch (error) {
      console.error('Create list error:', error);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const formatDate = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  const renderDownloadedMagazine = ({ item }: { item: any }) => {
    const isDownloadingItem = isDownloading(item.magazineData._id);
    const progress = downloadProgress.get(item.magazineData._id);

    return (
      <TouchableOpacity 
        style={styles.magazineCard}
        onPress={() => handleMagazinePress(item.magazineData)}
        disabled={isDownloadingItem}
      >
        <Image source={{ uri: item.magazineData.image }} style={styles.magazineCover} />
        
        {isDownloadingItem && progress && (
          <View style={styles.downloadOverlay}>
            <LinearGradient
              colors={['rgba(0,0,0,0.7)', 'rgba(0,0,0,0.9)']}
              style={styles.downloadGradient}
            >
              <LoadingSpinner size="small" />
              <Text style={styles.downloadText}>
                Downloading... {Math.round(progress.progress)}%
              </Text>
            </LinearGradient>
          </View>
        )}

        <View style={styles.magazineInfo}>
          <Text style={styles.magazineTitle} numberOfLines={2}>
            {item.magazineData.name}
          </Text>
          <Text style={styles.magazineCategory}>
            {item.magazineData.category}
          </Text>
          
          <View style={styles.magazineMeta}>
            <View style={styles.metaItem}>
              <Ionicons name="calendar-outline" size={14} color="#a3a3a3" />
              <Text style={styles.metaText}>
                {formatDate(item.downloadDate)}
              </Text>
            </View>
            
            <View style={styles.metaItem}>
              <Ionicons name="document-outline" size={14} color="#a3a3a3" />
              <Text style={styles.metaText}>
                {formatFileSize(item.fileSize)}
              </Text>
            </View>
          </View>

          {item.readProgress > 0 && (
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                  <View 
                  style={[
                    styles.progressFill, 
                    { width: `${item.readProgress}%` }
                  ]} 
                />
              </View>
              <Text style={styles.progressText}>
                {Math.round(item.readProgress)}% read
              </Text>
            </View>
            )}
        </View>

        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => handleRemoveDownload(item.magazineData._id)}
        >
          <Ionicons name="trash-outline" size={20} color="#ef4444" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const renderReadingList = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.listCard}>
      <View style={[styles.listIcon, { backgroundColor: item.color }]}>
        <Ionicons name={item.icon as any} size={24} color="#ffffff" />
        </View>
      
      <View style={styles.listInfo}>
        <Text style={styles.listName}>{item.name}</Text>
        {item.description && (
          <Text style={styles.listDescription} numberOfLines={2}>
            {item.description}
          </Text>
        )}
        <Text style={styles.listMeta}>
          {item.magazineIds.length} magazines • {formatDate(item.updatedAt)}
          </Text>
      </View>

      <TouchableOpacity
        style={styles.listMenuButton}
        onPress={() => deleteReadingList(item.id)}
      >
        <Ionicons name="ellipsis-vertical" size={20} color="#a3a3a3" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderStats = () => (
    <View style={styles.statsContainer}>
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Ionicons name="download-outline" size={32} color="#f59e0b" />
          <Text style={styles.statValue}>{libraryStats.totalDownloaded}</Text>
          <Text style={styles.statLabel}>Downloaded</Text>
        </View>

        <View style={styles.statCard}>
          <Ionicons name="folder-outline" size={32} color="#10b981" />
          <Text style={styles.statValue}>{readingLists.length}</Text>
          <Text style={styles.statLabel}>Reading Lists</Text>
        </View>

        <View style={styles.statCard}>
          <Ionicons name="time-outline" size={32} color="#3b82f6" />
          <Text style={styles.statValue}>{libraryStats.totalReadTime}</Text>
          <Text style={styles.statLabel}>Pages Read</Text>
        </View>

        <View style={styles.statCard}>
          <Ionicons name="hardware-chip-outline" size={32} color="#8b5cf6" />
          <Text style={styles.statValue}>{formatFileSize(libraryStats.totalSize)}</Text>
          <Text style={styles.statLabel}>Storage Used</Text>
        </View>
      </View>

      {libraryStats.lastDownloadDate && (
        <View style={styles.lastDownloadCard}>
          <Ionicons name="calendar-outline" size={20} color="#f59e0b" />
          <Text style={styles.lastDownloadText}>
            Last download: {formatDate(libraryStats.lastDownloadDate)}
          </Text>
        </View>
      )}
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingSpinner message="Loading your library..." size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Library</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setShowCreateListModal(true)}
        >
          <Ionicons name="add" size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>

        {/* Tab Navigation */}
      <View style={styles.tabContainer}>
            <TouchableOpacity
          style={[styles.tabButton, activeTab === 'downloads' && styles.activeTabButton]}
          onPress={() => setActiveTab('downloads')}
        >
          <Ionicons 
            name="download-outline" 
            size={20} 
            color={activeTab === 'downloads' ? '#f59e0b' : '#666666'} 
          />
          <Text style={[styles.tabText, activeTab === 'downloads' && styles.activeTabText]}>
            Downloads ({downloadedMagazines.length})
              </Text>
            </TouchableOpacity>
        
                    <TouchableOpacity
          style={[styles.tabButton, activeTab === 'bookmarks' && styles.activeTabButton]}
          onPress={() => setActiveTab('bookmarks')}
        >
          <Ionicons 
            name="bookmark" 
            size={20} 
            color={activeTab === 'bookmarks' ? '#f59e0b' : '#666666'} 
          />
          <Text style={[styles.tabText, activeTab === 'bookmarks' && styles.activeTabText]}>
            Bookmarks ({bookmarkedMagazines.length})
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'stats' && styles.activeTabButton]}
          onPress={() => setActiveTab('stats')}
        >
          <Ionicons 
            name="analytics-outline" 
            size={20} 
            color={activeTab === 'stats' ? '#f59e0b' : '#666666'} 
          />
          <Text style={[styles.tabText, activeTab === 'stats' && styles.activeTabText]}>
            Stats
              </Text>
            </TouchableOpacity>
        </View>

        {/* Content */}
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {activeTab === 'downloads' && (
          <View style={styles.tabContent}>
            {downloadedMagazines.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="download-outline" size={64} color="#666666" />
                <Text style={styles.emptyTitle}>No Downloads Yet</Text>
                <Text style={styles.emptyText}>
                  Download magazines to read them offline
              </Text>
                <TouchableOpacity
                  style={styles.browseButton}
                  onPress={() => navigation.navigate('Home' as any)}
                >
                  <Text style={styles.browseButtonText}>Browse Magazines</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <FlatList
                data={downloadedMagazines}
                renderItem={renderDownloadedMagazine}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                showsVerticalScrollIndicator={false}
              />
            )}
            </View>
          )}

        {activeTab === 'bookmarks' && (
          <View style={styles.tabContent}>
            {bookmarkedMagazines.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="bookmark-outline" size={64} color="#666666" />
                <Text style={styles.emptyTitle}>No Bookmarks Yet</Text>
                <Text style={styles.emptyText}>
                  Bookmark magazines to find them easily later
              </Text>
                <TouchableOpacity
                  style={styles.browseButton}
                  onPress={() => navigation.navigate('Home' as any)}
                >
                  <Text style={styles.browseButtonText}>Browse Magazines</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <FlatList
                data={bookmarkedMagazines}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.magazineCard}
                    onPress={() => handleMagazinePress(item)}
                  >
                    <Image source={{ uri: item.image }} style={styles.magazineImage} />
                    <View style={styles.magazineInfo}>
                      <Text style={styles.magazineTitle} numberOfLines={2}>
                        {item.name}
                      </Text>
                      <Text style={styles.magazineCategory}>{item.category}</Text>
                      <View style={styles.magazineStats}>
                        <View style={styles.statItem}>
                          <Ionicons name="download-outline" size={14} color="#f59e0b" />
                          <Text style={styles.statText}>{item.downloads.toLocaleString()}</Text>
                        </View>
                        <View style={styles.statItem}>
                          <Ionicons name="star" size={14} color="#f59e0b" />
                          <Text style={styles.statText}>{item.rating}/5</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.magazineActions}>
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => handleMagazinePress(item)}
                      >
                        <Ionicons name="book-outline" size={20} color="#f59e0b" />
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                )}
                keyExtractor={(item) => item._id}
                scrollEnabled={false}
                showsVerticalScrollIndicator={false}
              />
            )}
            </View>
          )}

          

        {activeTab === 'stats' && (
          <View style={styles.tabContent}>
            {renderStats()}
          </View>
        )}
      </ScrollView>

      {/* Create List Modal */}
      {showCreateListModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create Reading List</Text>
              <TouchableOpacity onPress={() => setShowCreateListModal(false)}>
                <Ionicons name="close" size={24} color="#ffffff" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalBody}>
              <Text style={styles.modalLabel}>List Name *</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Enter list name"
                placeholderTextColor="#666666"
                value={newListName}
                onChangeText={setNewListName}
                autoFocus
              />
              
              <Text style={styles.modalLabel}>Description (optional)</Text>
              <TextInput
                style={[styles.modalInput, styles.modalTextArea]}
                placeholder="Enter description"
                placeholderTextColor="#666666"
                value={newListDescription}
                onChangeText={setNewListDescription}
                multiline
                numberOfLines={3}
              />
            </View>
            
            <View style={styles.modalFooter}>
                <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowCreateListModal(false)}
                >
                <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.createButton]}
                onPress={handleCreateList}
              >
                <Text style={styles.createButtonText}>Create List</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
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
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f59e0b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    marginHorizontal: 20,
    marginBottom: 16,
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
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  activeTabText: {
    color: '#ffffff',
  },
  content: {
    flex: 1,
  },
  tabContent: {
    paddingHorizontal: 20,
  },
  magazineCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  magazineCover: {
    width: '100%',
    height: 200,
  },
  downloadOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  downloadGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  downloadText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
  },
  magazineInfo: {
    padding: 16,
  },
  magazineTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  magazineCategory: {
    fontSize: 14,
    color: '#f59e0b',
    fontWeight: '600',
    marginBottom: 12,
  },
  magazineMeta: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  metaText: {
    fontSize: 12,
    color: '#a3a3a3',
    marginLeft: 4,
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#2a2a2a',
    borderRadius: 2,
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#f59e0b',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: '#a3a3a3',
  },
  removeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  listCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  listIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  listInfo: {
    flex: 1,
  },
  listName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  listDescription: {
    fontSize: 14,
    color: '#a3a3a3',
    marginBottom: 4,
  },
  listMeta: {
    fontSize: 12,
    color: '#666666',
  },
  listMenuButton: {
    padding: 8,
  },
  statsContainer: {
    paddingVertical: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    width: (width - 60) / 2,
    marginBottom: 16,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#a3a3a3',
    textAlign: 'center',
  },
  lastDownloadCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  lastDownloadText: {
    fontSize: 14,
    color: '#ffffff',
    marginLeft: 12,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#a3a3a3',
    textAlign: 'center',
    marginBottom: 24,
  },
  browseButton: {
    backgroundColor: '#f59e0b',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  browseButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  modalBody: {
    marginBottom: 24,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 8,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#2a2a2a',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#ffffff',
    backgroundColor: '#0a0a0a',
    marginBottom: 16,
  },
  modalTextArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  createButton: {
    backgroundColor: '#f59e0b',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  magazineImage: {
    width: 80,
    height: 120,
    borderRadius: 8,
    marginRight: 12,
  },
  magazineStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  statText: {
    fontSize: 12,
    color: '#a3a3a3',
    marginLeft: 4,
  },
  magazineActions: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default LibraryScreen; 