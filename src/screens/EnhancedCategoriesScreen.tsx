import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  FlatList,
  ActivityIndicator,
  TextInput,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { magazinesAPI, Magazine } from '../services/api';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';
import LoadingSpinner from '../components/LoadingSpinner';

const { width, height } = Dimensions.get('window');

interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  image?: string;
  magazineCount: number;
}

const EnhancedCategoriesScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [categories, setCategories] = useState<Category[]>([]);
  const [magazines, setMagazines] = useState<Magazine[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Sample categories based on Readly's design
  const sampleCategories: Category[] = [
    { id: '1', name: 'Newspapers', icon: 'newspaper', color: '#3b82f6', magazineCount: 45 },
    { id: '2', name: 'Aeroplanes & Transport', icon: 'airplane', color: '#1e40af', magazineCount: 32 },
    { id: '3', name: 'Animals & Equestrian', icon: 'paw', color: '#ec4899', magazineCount: 28 },
    { id: '4', name: 'Art & Culture', icon: 'color-palette', color: '#059669', magazineCount: 56 },
    { id: '5', name: 'Boats & Watersports', icon: 'boat', color: '#7c3aed', magazineCount: 23 },
    { id: '6', name: 'Business & Finance', icon: 'trending-up', color: '#dc2626', magazineCount: 67 },
    { id: '7', name: 'Cars & Motoring', icon: 'car', color: '#0ea5e9', magazineCount: 41 },
    { id: '8', name: 'Celebrity & Entertainment', icon: 'star', color: '#1e40af', magazineCount: 89 },
    { id: '9', name: 'Comics', icon: 'book', color: '#f59e0b', magazineCount: 34 },
    { id: '10', name: 'Craft & DIY', icon: 'hammer', color: '#0891b2', magazineCount: 27 },
    { id: '11', name: 'Food & Drink', icon: 'restaurant', color: '#f97316', magazineCount: 52 },
    { id: '12', name: 'Gardening', icon: 'leaf', color: '#16a34a', magazineCount: 19 },
    { id: '13', name: 'Health & Fitness', icon: 'fitness', color: '#e11d48', magazineCount: 38 },
    { id: '14', name: 'History', icon: 'library', color: '#8b5cf6', magazineCount: 31 },
    { id: '15', name: 'Home & Garden', icon: 'home', color: '#059669', magazineCount: 44 },
    { id: '16', name: 'Music', icon: 'musical-notes', color: '#f59e0b', magazineCount: 36 },
    { id: '17', name: 'Science & Technology', icon: 'flask', color: '#0ea5e9', magazineCount: 48 },
    { id: '18', name: 'Sports', icon: 'football', color: '#dc2626', magazineCount: 62 },
    { id: '19', name: 'Travel', icon: 'map', color: '#0891b2', magazineCount: 73 },
    { id: '20', name: 'Women\'s Interest', icon: 'heart', color: '#ec4899', magazineCount: 58 },
  ];

  useEffect(() => {
    setCategories(sampleCategories);
    fetchMagazines();
  }, []);

  const fetchMagazines = async () => {
    try {
      setLoading(true);
      const response = await magazinesAPI.getMagazines();
      if (response.success) {
        setMagazines(response.data);
      }
    } catch (error) {
      console.error('Error fetching magazines:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredMagazines = () => {
    let filtered = magazines;
    
    if (selectedCategory) {
      filtered = filtered.filter(mag => mag.category === selectedCategory);
    }
    
    if (searchQuery) {
      filtered = filtered.filter(mag => 
        mag.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mag.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mag.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return filtered;
  };

  const renderCategoryTile = ({ item }: { item: Category }) => (
    <TouchableOpacity
      style={[
        styles.categoryTile,
        selectedCategory === item.name && styles.selectedCategoryTile,
      ]}
      onPress={() => setSelectedCategory(selectedCategory === item.name ? null : item.name)}
    >
      <LinearGradient
        colors={[item.color, `${item.color}80`]}
        style={styles.categoryGradient}
      >
        <View style={styles.categoryContent}>
          <View style={styles.categoryIconContainer}>
            <Ionicons name={item.icon as any} size={32} color="#fff" />
          </View>
          <Text style={styles.categoryName} numberOfLines={2}>
            {item.name}
          </Text>
          <Text style={styles.categoryCount}>
            {item.magazineCount} magazines
          </Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderMagazineCard = ({ item }: { item: Magazine }) => (
    <TouchableOpacity
      style={styles.magazineCard}
      onPress={() => navigation.navigate('MagazineDetail', { 
        magazineId: item._id, 
        magazineData: item 
      })}
    >
      <Image source={{ uri: item.image }} style={styles.magazineImage} />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.9)']}
        style={styles.magazineOverlay}
      >
        <View style={styles.magazineInfo}>
          <Text style={styles.magazineCategory}>{item.category}</Text>
          <Text style={styles.magazineTitle} numberOfLines={2}>
            {item.name}
          </Text>
          <Text style={styles.magazineDescription} numberOfLines={2}>
            {item.description}
          </Text>
          <View style={styles.magazineMeta}>
            <View style={styles.metaItem}>
              <Ionicons name="download-outline" size={14} color="#a3a3a3" />
              <Text style={styles.metaText}>{item.downloads}</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="star" size={14} color="#f59e0b" />
              <Text style={styles.metaText}>{item.rating.toFixed(1)}</Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <Text style={styles.title}>Explore</Text>
        <TouchableOpacity style={styles.profileButton}>
          <View style={styles.profileAvatar}>
            <Text style={styles.profileInitial}>H</Text>
          </View>
        </TouchableOpacity>
      </View>
      
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#a3a3a3" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search titles or content"
            placeholderTextColor="#a3a3a3"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#a3a3a3" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );

  const renderCategoriesSection = () => (
    <View style={styles.categoriesSection}>
      <Text style={styles.sectionTitle}>Categories</Text>
      <FlatList
        data={categories}
        renderItem={renderCategoryTile}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.categoryRow}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.categoriesList}
      />
    </View>
  );

  const renderMagazinesSection = () => {
    const filteredMagazines = getFilteredMagazines();
    
    if (filteredMagazines.length === 0 && (selectedCategory || searchQuery)) {
      return (
        <View style={styles.emptyState}>
          <Ionicons name="search" size={48} color="#a3a3a3" />
          <Text style={styles.emptyStateTitle}>No magazines found</Text>
          <Text style={styles.emptyStateSubtitle}>
            Try adjusting your search or category filter
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.magazinesSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {selectedCategory ? `${selectedCategory} Magazines` : 'All Magazines'}
          </Text>
          {filteredMagazines.length > 0 && (
            <TouchableOpacity>
              <Text style={styles.viewAllText}>View all</Text>
            </TouchableOpacity>
          )}
        </View>
        
        {loading ? (
          <View style={styles.loadingContainer}>
            <LoadingSpinner message="Loading magazines..." size="large" type="pulse" />
          </View>
        ) : (
          <FlatList
            data={filteredMagazines}
            renderItem={renderMagazineCard}
            keyExtractor={(item) => item._id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.magazinesList}
          />
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {renderHeader()}
        {renderCategoriesSection()}
        {renderMagazinesSection()}
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
  scrollContent: {
    paddingBottom: 32,
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
    marginBottom: 24,
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
  searchContainer: {
    marginBottom: 8,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: Math.max(16, Math.min(width * 0.04, 18)),
    color: '#ffffff',
    marginLeft: 12,
    marginRight: 8,
  },
  categoriesSection: {
    paddingHorizontal: Math.max(20, width * 0.05),
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: Math.max(20, Math.min(width * 0.05, 24)),
    color: '#ffffff',
    fontWeight: '600',
    marginBottom: 20,
  },
  categoriesList: {
    paddingBottom: 8,
  },
  categoryRow: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  categoryTile: {
    width: (width - 48) / 2,
    height: Math.max(120, height * 0.15),
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  selectedCategoryTile: {
    borderWidth: 2,
    borderColor: '#f59e0b',
  },
  categoryGradient: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
  },
  categoryContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  categoryIconContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryName: {
    fontSize: Math.max(14, Math.min(width * 0.035, 16)),
    color: '#ffffff',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  categoryCount: {
    fontSize: Math.max(11, Math.min(width * 0.028, 13)),
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  magazinesSection: {
    paddingHorizontal: Math.max(20, width * 0.05),
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
  loadingContainer: {
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  magazinesList: {
    paddingRight: Math.max(20, width * 0.05),
  },
  magazineCard: {
    width: Math.max(200, width * 0.5),
    height: Math.max(250, height * 0.3),
    marginRight: 16,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#1a1a1a',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  magazineImage: {
    width: '100%',
    height: '100%',
  },
  magazineOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingTop: 60,
  },
  magazineInfo: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  magazineCategory: {
    fontSize: Math.max(12, Math.min(width * 0.03, 14)),
    color: '#f59e0b',
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  magazineTitle: {
    fontSize: Math.max(16, Math.min(width * 0.04, 18)),
    color: '#ffffff',
    fontWeight: '700',
    marginBottom: 8,
    lineHeight: Math.max(20, Math.min(width * 0.05, 22)),
  },
  magazineDescription: {
    fontSize: Math.max(12, Math.min(width * 0.03, 14)),
    color: '#e5e5e5',
    marginBottom: 12,
    lineHeight: Math.max(16, Math.min(width * 0.04, 18)),
  },
  magazineMeta: {
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
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: Math.max(18, Math.min(width * 0.045, 20)),
    color: '#ffffff',
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: Math.max(14, Math.min(width * 0.035, 16)),
    color: '#a3a3a3',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});

export default EnhancedCategoriesScreen; 