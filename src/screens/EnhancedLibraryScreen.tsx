import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  FlatList,
  Image,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';
import { Magazine } from '../services/api';
import { useLibrary } from '../context/LibraryContext';
import LoadingSpinner from '../components/LoadingSpinner';
import MagazineCard from '../components/MagazineCard';

const { width, height } = Dimensions.get('window');

type LibraryNavigationProp = StackNavigationProp<RootStackParamList>;

const EnhancedLibraryScreen: React.FC = () => {
  const navigation = useNavigation<LibraryNavigationProp>();
  const { 
    downloadedMagazines, 
    bookmarkedMagazines, 
    isLoading,
    removeDownloadedMagazine,
    removeBookmark,
    refreshLibraryStats,
    libraryStats
  } = useLibrary();
  
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'downloaded' | 'bookmarked'>('downloaded');

  useEffect(() => {
    refreshLibraryStats();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    refreshLibraryStats();
    setRefreshing(false);
  };

  const handleMagazinePress = (magazine: Magazine) => {
    navigation.navigate('MagazineDetail', {
      magazineId: magazine._id,
      magazineData: magazine,
    });
  };

  const handleRemoveDownload = async (magazineId: string) => {
    try {
      await removeDownloadedMagazine(magazineId);
    } catch (error) {
      console.error('Error removing downloaded magazine:', error);
    }
  };

  const handleRemoveBookmark = async (magazine: Magazine) => {
    try {
      await removeBookmark(magazine);
    } catch (error) {
      console.error('Error removing bookmark:', error);
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>My Library</Text>
      <Text style={styles.headerSubtitle}>Your downloaded and bookmarked content</Text>
      
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{libraryStats.totalDownloaded}</Text>
          <Text style={styles.statLabel}>Downloaded</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{bookmarkedMagazines.length}</Text>
          <Text style={styles.statLabel}>Bookmarked</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{Math.round(libraryStats.totalSize / 1024 / 1024)}</Text>
          <Text style={styles.statLabel}>MB Used</Text>
        </View>
      </View>
    </View>
  );

  const renderTabs = () => (
    <View style={styles.tabsContainer}>
      <TouchableOpacity
        style={[styles.tab, activeTab === 'downloaded' && styles.activeTab]}
        onPress={() => setActiveTab('downloaded')}
      >
        <Ionicons 
          name="download" 
          size={20} 
          color={activeTab === 'downloaded' ? '#f59e0b' : '#a3a3a3'} 
        />
        <Text style={[styles.tabText, activeTab === 'downloaded' && styles.activeTabText]}>
          Downloaded ({downloadedMagazines.length})
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.tab, activeTab === 'bookmarked' && styles.activeTab]}
        onPress={() => setActiveTab('bookmarked')}
      >
        <Ionicons 
          name="bookmark" 
          size={20} 
          color={activeTab === 'bookmarked' ? '#f59e0b' : '#a3a3a3'} 
        />
        <Text style={[styles.tabText, activeTab === 'bookmarked' && styles.activeTabText]}>
          Bookmarked ({bookmarkedMagazines.length})
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderDownloadedMagazines = () => {
    if (downloadedMagazines.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Ionicons name="download-outline" size={64} color="#666" />
          <Text style={styles.emptyStateTitle}>No Downloads Yet</Text>
          <Text style={styles.emptyStateText}>
            Download magazines to read them offline
          </Text>
          <TouchableOpacity
            style={styles.browseButton}
            onPress={() => navigation.navigate('Main')}
          >
            <Text style={styles.browseButtonText}>Browse Magazines</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <FlatList
        data={downloadedMagazines}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.magazineItem}>
            <MagazineCard
              magazine={{
                _id: item.id,
                name: item.magazineData.name,
                category: item.magazineData.category,
                type: item.magazineData.type,
                image: item.magazineData.image,
                downloads: item.magazineData.downloads,
                rating: item.magazineData.rating,
                description: item.magazineData.description,
                magzineType: item.magazineData.magzineType,
                createdAt: item.downloadDate.toISOString(),
              }}
              onPress={() => handleMagazinePress(item.magazineData)}
            />
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => handleRemoveDownload(item.id)}
            >
              <Ionicons name="trash-outline" size={20} color="#ef4444" />
            </TouchableOpacity>
          </View>
        )}
        numColumns={2}
        columnWrapperStyle={styles.magazineRow}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.magazineGrid}
      />
    );
  };

  const renderBookmarkedMagazines = () => {
    if (bookmarkedMagazines.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Ionicons name="bookmark-outline" size={64} color="#666" />
          <Text style={styles.emptyStateTitle}>No Bookmarks Yet</Text>
          <Text style={styles.emptyStateText}>
            Bookmark magazines to find them easily later
          </Text>
          <TouchableOpacity
            style={styles.browseButton}
            onPress={() => navigation.navigate('Main')}
          >
            <Text style={styles.browseButtonText}>Browse Magazines</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <FlatList
        data={bookmarkedMagazines}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.magazineItem}>
            <MagazineCard
              magazine={item}
              onPress={() => handleMagazinePress(item)}
            />
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => handleRemoveBookmark(item)}
            >
              <Ionicons name="bookmark" size={20} color="#f59e0b" />
            </TouchableOpacity>
          </View>
        )}
        numColumns={2}
        columnWrapperStyle={styles.magazineRow}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.magazineGrid}
      />
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner message="Loading library..." size="large" type="pulse" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
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
        
        {activeTab === 'downloaded' ? renderDownloadedMagazines() : renderBookmarkedMagazines()}
      </ScrollView>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0a0a0a',
  },
  header: {
    padding: 20,
    paddingBottom: 30,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#a3a3a3',
    marginBottom: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#f59e0b',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#a3a3a3',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#2a2a2a',
    marginHorizontal: 10,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 4,
    borderRadius: 12,
    backgroundColor: '#1a1a1a',
  },
  activeTab: {
    backgroundColor: '#f59e0b',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#a3a3a3',
    marginLeft: 8,
  },
  activeTabText: {
    color: '#000000',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    marginTop: 40,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#a3a3a3',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  browseButton: {
    backgroundColor: '#f59e0b',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  browseButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
  },
  magazineItem: {
    position: 'relative',
    marginBottom: 16,
  },
  magazineRow: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  magazineGrid: {
    paddingHorizontal: 8,
  },
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
});

export default EnhancedLibraryScreen; 