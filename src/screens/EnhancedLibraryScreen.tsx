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
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { magazinesAPI, Magazine } from '../services/api';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';
import LoadingSpinner from '../components/LoadingSpinner';

const { width, height } = Dimensions.get('window');

type TabType = 'favorites' | 'downloads' | 'recently-read' | 'books';

interface LibraryItem {
  magazine: Magazine;
  isBookmarked: boolean;
  isDownloaded: boolean;
  readProgress: number;
  lastReadDate: Date;
  downloadDate?: Date;
}

const EnhancedLibraryScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [activeTab, setActiveTab] = useState<TabType>('favorites');
  const [libraryItems, setLibraryItems] = useState<LibraryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'new-arrivals' | 'title' | 'category' | 'last-read'>('new-arrivals');
  const [isEditing, setIsEditing] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchLibraryData();
  }, []);

  const fetchLibraryData = async () => {
    try {
      setLoading(true);
      const response = await magazinesAPI.getMagazines();
      if (response.success) {
        // Create sample library items with mock data
        const items: LibraryItem[] = response.data.slice(0, 10).map((magazine, index) => ({
          magazine,
          isBookmarked: Math.random() > 0.5,
          isDownloaded: Math.random() > 0.3,
          readProgress: Math.floor(Math.random() * 100),
          lastReadDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
          downloadDate: Math.random() > 0.3 ? new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) : undefined,
        }));
        setLibraryItems(items);
      }
    } catch (error) {
      console.error('Error fetching library data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredItems = () => {
    let filtered = libraryItems.filter(item => {
      switch (activeTab) {
        case 'favorites':
          return item.isBookmarked;
        case 'downloads':
          return item.isDownloaded;
        case 'recently-read':
          return item.readProgress > 0;
        case 'books':
          return true;
        default:
          return true;
      }
    });

    // Sort items
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'new-arrivals':
          return new Date(b.magazine.createdAt || 0).getTime() - new Date(a.magazine.createdAt || 0).getTime();
        case 'title':
          return a.magazine.name.localeCompare(b.magazine.name);
        case 'category':
          return a.magazine.category.localeCompare(b.magazine.category);
        case 'last-read':
          return b.lastReadDate.getTime() - a.lastReadDate.getTime();
        default:
          return 0;
      }
    });

    return filtered;
  };

  const handleItemPress = (item: LibraryItem) => {
    if (isEditing) {
      const newSelected = new Set(selectedItems);
      if (newSelected.has(item.magazine._id)) {
        newSelected.delete(item.magazine._id);
      } else {
        newSelected.add(item.magazine._id);
      }
      setSelectedItems(newSelected);
    } else {
      navigation.navigate('MagazineDetail', { 
        magazineId: item.magazine._id, 
        magazineData: item.magazine 
      });
    }
  };

  const handleBookmarkToggle = (item: LibraryItem) => {
    const updatedItems = libraryItems.map(libItem => 
      libItem.magazine._id === item.magazine._id 
        ? { ...libItem, isBookmarked: !libItem.isBookmarked }
        : libItem
    );
    setLibraryItems(updatedItems);
  };

  const handleDeleteSelected = () => {
    Alert.alert(
      'Delete Items',
      `Are you sure you want to delete ${selectedItems.size} selected items?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const updatedItems = libraryItems.filter(
              item => !selectedItems.has(item.magazine._id)
            );
            setLibraryItems(updatedItems);
            setSelectedItems(new Set());
            setIsEditing(false);
          },
        },
      ]
    );
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <Text style={styles.title}>My Library</Text>
        <TouchableOpacity style={styles.profileButton}>
          <View style={styles.profileAvatar}>
            <Text style={styles.profileInitial}>H</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderTabs = () => (
    <View style={styles.tabsContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'favorites' && styles.activeTab]}
          onPress={() => setActiveTab('favorites')}
        >
          <Text style={[styles.tabText, activeTab === 'favorites' && styles.activeTabText]}>
            Favorites
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'downloads' && styles.activeTab]}
          onPress={() => setActiveTab('downloads')}
        >
          <Text style={[styles.tabText, activeTab === 'downloads' && styles.activeTabText]}>
            Downloads
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'recently-read' && styles.activeTab]}
          onPress={() => setActiveTab('recently-read')}
        >
          <Text style={[styles.tabText, activeTab === 'recently-read' && styles.activeTabText]}>
            Recently Read
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'books' && styles.activeTab]}
          onPress={() => setActiveTab('books')}
        >
          <Text style={[styles.tabText, activeTab === 'books' && styles.activeTabText]}>
            Books
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );

  const renderSortAndEdit = () => (
    <View style={styles.sortEditContainer}>
      <View style={styles.sortContainer}>
        <Ionicons name="funnel-outline" size={20} color="#a3a3a3" />
        <Text style={styles.sortText}>
          Sort By {sortBy === 'new-arrivals' ? 'New Arrivals' : 
                   sortBy === 'title' ? 'Title' : 
                   sortBy === 'category' ? 'Category' : 'Last Read'}
        </Text>
        <TouchableOpacity 
          style={styles.sortButton}
          onPress={() => {
            const sortOptions = ['new-arrivals', 'title', 'category', 'last-read'];
            const currentIndex = sortOptions.indexOf(sortBy);
            const nextIndex = (currentIndex + 1) % sortOptions.length;
            setSortBy(sortOptions[nextIndex] as any);
          }}
        >
          <Ionicons name="chevron-down" size={16} color="#a3a3a3" />
        </TouchableOpacity>
      </View>
      
      <TouchableOpacity
        style={[styles.editButton, isEditing && styles.editButtonActive]}
        onPress={() => {
          if (isEditing) {
            setSelectedItems(new Set());
          }
          setIsEditing(!isEditing);
        }}
      >
        <Text style={[styles.editButtonText, isEditing && styles.editButtonTextActive]}>
          {isEditing ? 'Done' : 'Edit'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderLibraryItem = ({ item }: { item: LibraryItem }) => {
    const isSelected = selectedItems.has(item.magazine._id);
    
    return (
      <TouchableOpacity
        style={[
          styles.libraryItem,
          isSelected && styles.selectedItem,
        ]}
        onPress={() => handleItemPress(item)}
        onLongPress={() => {
          if (!isEditing) {
            setIsEditing(true);
            setSelectedItems(new Set([item.magazine._id]));
          }
        }}
      >
        {isEditing && (
          <View style={[styles.selectionIndicator, isSelected && styles.selectionIndicatorActive]}>
            <Ionicons 
              name={isSelected ? 'checkmark' : 'ellipse-outline'} 
              size={20} 
              color={isSelected ? '#fff' : '#a3a3a3'} 
            />
          </View>
        )}
        
        <Image source={{ uri: item.magazine.image }} style={styles.itemImage} />
        
        <View style={styles.itemInfo}>
          <Text style={styles.itemTitle} numberOfLines={2}>
            {item.magazine.name}
          </Text>
          
          <Text style={styles.itemCategory}>
            {item.magazine.category}
          </Text>
          
          <View style={styles.itemMeta}>
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={14} color="#a3a3a3" />
              <Text style={styles.metaText}>
                {item.lastReadDate.toLocaleDateString()}
              </Text>
            </View>
            
            {item.readProgress > 0 && (
              <View style={styles.metaItem}>
                <Ionicons name="bookmark-outline" size={14} color="#a3a3a3" />
                <Text style={styles.metaText}>
                  {item.readProgress}% read
                </Text>
              </View>
            )}
          </View>
        </View>
        
        <View style={styles.itemActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleBookmarkToggle(item)}
          >
            <Ionicons 
              name={item.isBookmarked ? 'bookmark' : 'bookmark-outline'} 
              size={20} 
              color={item.isBookmarked ? '#f59e0b' : '#a3a3a3'} 
            />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="ellipsis-vertical" size={20} color="#a3a3a3" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const renderContent = () => {
    const filteredItems = getFilteredItems();
    
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <LoadingSpinner message="Loading your library..." size="large" type="pulse" />
        </View>
      );
    }
    
    if (filteredItems.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Ionicons name="library-outline" size={64} color="#a3a3a3" />
          <Text style={styles.emptyStateTitle}>
            {activeTab === 'favorites' ? 'No favorites yet' :
             activeTab === 'downloads' ? 'No downloads yet' :
             activeTab === 'recently-read' ? 'No reading history' : 'No books yet'}
          </Text>
          <Text style={styles.emptyStateSubtitle}>
            {activeTab === 'favorites' ? 'Start bookmarking magazines you love' :
             activeTab === 'downloads' ? 'Download magazines for offline reading' :
             activeTab === 'recently-read' ? 'Your reading history will appear here' : 'Your books will appear here'}
          </Text>
        </View>
      );
    }
    
    return (
      <FlatList
        data={filteredItems}
        renderItem={renderLibraryItem}
        keyExtractor={(item) => item.magazine._id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    );
  };

  const renderEditActions = () => {
    if (!isEditing) return null;
    
    return (
      <View style={styles.editActions}>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDeleteSelected}
          disabled={selectedItems.size === 0}
        >
          <Ionicons name="trash-outline" size={20} color="#fff" />
          <Text style={styles.deleteButtonText}>
            Delete ({selectedItems.size})
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      {renderTabs()}
      {renderSortAndEdit()}
      {renderContent()}
      {renderEditActions()}
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
    alignItems: 'center',
  },
  title: {
    fontSize: Math.max(28, Math.min(width * 0.07, 32)),
    color: '#ffffff',
    fontWeight: '700',
  },
  profileButton: {
    padding: 8,
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
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginRight: 16,
    borderRadius: 20,
    backgroundColor: 'transparent',
  },
  activeTab: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
  },
  tabText: {
    fontSize: Math.max(14, Math.min(width * 0.035, 16)),
    color: '#a3a3a3',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#f59e0b',
    fontWeight: '600',
  },
  sortEditContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Math.max(20, width * 0.05),
    marginBottom: 24,
  },
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  sortText: {
    fontSize: Math.max(14, Math.min(width * 0.035, 16)),
    color: '#a3a3a3',
    marginLeft: 8,
    marginRight: 8,
  },
  sortButton: {
    padding: 4,
  },
  editButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  editButtonActive: {
    backgroundColor: '#f59e0b',
  },
  editButtonText: {
    fontSize: Math.max(14, Math.min(width * 0.035, 16)),
    color: '#ffffff',
    fontWeight: '600',
  },
  editButtonTextActive: {
    color: '#000',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Math.max(40, width * 0.1),
  },
  emptyStateTitle: {
    fontSize: Math.max(20, Math.min(width * 0.05, 24)),
    color: '#ffffff',
    fontWeight: '600',
    marginTop: 24,
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    fontSize: Math.max(16, Math.min(width * 0.04, 18)),
    color: '#a3a3a3',
    textAlign: 'center',
    lineHeight: Math.max(22, Math.min(width * 0.055, 24)),
  },
  listContent: {
    paddingHorizontal: Math.max(20, width * 0.05),
    paddingBottom: 32,
  },
  libraryItem: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  selectedItem: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderWidth: 2,
    borderColor: '#f59e0b',
  },
  selectionIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  selectionIndicatorActive: {
    backgroundColor: '#f59e0b',
  },
  itemImage: {
    width: Math.max(60, width * 0.15),
    height: Math.max(80, height * 0.1),
    borderRadius: 8,
    marginRight: 16,
  },
  itemInfo: {
    flex: 1,
    marginRight: 16,
  },
  itemTitle: {
    fontSize: Math.max(16, Math.min(width * 0.04, 18)),
    color: '#ffffff',
    fontWeight: '600',
    marginBottom: 6,
    lineHeight: Math.max(20, Math.min(width * 0.05, 22)),
  },
  itemCategory: {
    fontSize: Math.max(12, Math.min(width * 0.03, 14)),
    color: '#f59e0b',
    fontWeight: '500',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  itemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  metaText: {
    fontSize: Math.max(11, Math.min(width * 0.028, 13)),
    color: '#a3a3a3',
    marginLeft: 4,
  },
  itemActions: {
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    marginBottom: 8,
  },
  editActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#1a1a1a',
    paddingHorizontal: Math.max(20, width * 0.05),
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#2a2a2a',
  },
  deleteButton: {
    backgroundColor: '#ef4444',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
  },
  deleteButtonText: {
    color: '#ffffff',
    fontSize: Math.max(16, Math.min(width * 0.04, 18)),
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default EnhancedLibraryScreen; 