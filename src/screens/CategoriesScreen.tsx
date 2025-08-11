import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
  FlatList,
  TextInput,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { magazinesAPI, Magazine } from '../services/api';
import { RootStackParamList } from '../../App';
import LoadingSpinner from '../components/LoadingSpinner';

const { width, height } = Dimensions.get('window');

type CategoriesNavigationProp = StackNavigationProp<RootStackParamList>;

interface CategoryData {
  name: string;
  count: number;
  magazines: Magazine[];
  icon: string;
  color: string;
  gradient: [string, string];
  description: string;
}

const CategoriesScreen: React.FC = () => {
  const navigation = useNavigation<CategoriesNavigationProp>();
  const [magazines, setMagazines] = useState<Magazine[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    fetchMagazines();
    animateIn();
  }, []);

  useEffect(() => {
    if (magazines.length > 0) {
      organizeMagazinesByCategory();
    }
  }, [magazines]);

  const animateIn = () => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  };

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

  const organizeMagazinesByCategory = () => {
    const categoryMap = new Map<string, Magazine[]>();
    
    magazines.forEach(magazine => {
      const category = magazine.category;
      if (!categoryMap.has(category)) {
        categoryMap.set(category, []);
      }
      categoryMap.get(category)!.push(magazine);
    });

    const categoryData: CategoryData[] = Array.from(categoryMap.entries()).map(([name, magazines]) => {
      const categoryConfig = getCategoryConfig(name);
      return {
        name,
        count: magazines.length,
        magazines,
        icon: categoryConfig.icon,
        color: categoryConfig.color,
        gradient: categoryConfig.gradient,
        description: categoryConfig.description,
      };
    });

    setCategories(categoryData);
  };

  const getCategoryConfig = (categoryName: string) => {
    const configs: { [key: string]: { icon: string; color: string; gradient: [string, string]; description: string } } = {
      'Technology': { 
        icon: 'hardware-chip', 
        color: '#f59e0b', 
        gradient: ['#1e293b', '#334155'],
        description: 'Latest tech trends and innovations'
      },
      'Arts': { 
        icon: 'color-palette', 
        color: '#f59e0b', 
        gradient: ['#581c87', '#7c3aed'],
        description: 'Creative expressions and artistic works'
      },
      'Environment': { 
        icon: 'leaf', 
        color: '#f59e0b', 
        gradient: ['#064e3b', '#047857'],
        description: 'Environmental awareness and sustainability'
      },
      'Business': { 
        icon: 'trending-up', 
        color: '#f59e0b', 
        gradient: ['#1e293b', '#334155'],
        description: 'Business insights and strategies'
      },
      'Science': { 
        icon: 'flask', 
        color: '#f59e0b', 
        gradient: ['#1e1b4b', '#3730a3'],
        description: 'Scientific discoveries and research'
      },
      'Health': { 
        icon: 'fitness', 
        color: '#f59e0b', 
        gradient: ['#7c2d12', '#dc2626'],
        description: 'Health and wellness guidance'
      },
      'Education': { 
        icon: 'library', 
        color: '#f59e0b', 
        gradient: ['#1e293b', '#334155'],
        description: 'Educational content and learning'
      },
      'Sports': { 
        icon: 'basketball', 
        color: '#f59e0b', 
        gradient: ['#7c2d12', '#dc2626'],
        description: 'Sports news and athletic content'
      },
      'Politics': { 
        icon: 'people-circle', 
        color: '#f59e0b', 
        gradient: ['#1e293b', '#334155'],
        description: 'Political analysis and current affairs'
      },
      'Entertainment': { 
        icon: 'film', 
        color: '#f59e0b', 
        gradient: ['#581c87', '#7c3aed'],
        description: 'Entertainment and media content'
      },
      'Lifestyle': { 
        icon: 'heart', 
        color: '#f59e0b', 
        gradient: ['#7c2d12', '#dc2626'],
        description: 'Lifestyle tips and personal development'
      },
      'Finance': { 
        icon: 'wallet', 
        color: '#f59e0b', 
        gradient: ['#064e3b', '#047857'],
        description: 'Financial advice and market insights'
      },
      'Travel': { 
        icon: 'airplane', 
        color: '#f59e0b', 
        gradient: ['#1e1b4b', '#3730a3'],
        description: 'Travel guides and destination stories'
      },
      'Food': { 
        icon: 'restaurant', 
        color: '#f59e0b', 
        gradient: ['#7c2d12', '#dc2626'],
        description: 'Culinary arts and food culture'
      },
      'Fashion': { 
        icon: 'shirt', 
        color: '#f59e0b', 
        gradient: ['#581c87', '#7c3aed'],
        description: 'Fashion trends and style guides'
      },
    };

    return configs[categoryName] || { 
      icon: 'book', 
      color: '#f59e0b', 
      gradient: ['#1a1a1a', '#2a2a2a'],
      description: 'General content and articles'
    };
  };

  const filteredCategories = categories.filter(category => {
    if (selectedCategory && category.name !== selectedCategory) {
      return false;
    }
    if (searchQuery) {
      return category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
             category.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
             category.magazines.some(mag => mag.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    return true;
  });

  // Filter magazines for search when no category is selected
  const filteredMagazines = magazines.filter(magazine => {
    if (searchQuery) {
      return magazine.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
             magazine.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
             magazine.description.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  // When "All Categories" is selected, show all magazines with category names
  const shouldShowAllMagazines = !selectedCategory;

  const renderCategoryHeader = () => (
    <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
      <Text style={styles.headerTitle}>Categories</Text>
      <Text style={styles.headerSubtitle}>Discover magazines organized by topics</Text>
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{categories.length}</Text>
          <Text style={styles.statLabel}>Categories</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{magazines.length}</Text>
          <Text style={styles.statLabel}>Magazines</Text>
        </View>
      </View>
    </Animated.View>
  );

  const renderSearchBar = () => (
    <Animated.View style={[styles.searchContainer, { opacity: fadeAnim }]}>
      <View style={styles.searchBar}>
        <Ionicons name="search" size={Math.max(18, width * 0.045)} color="#a3a3a3" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search magazines..."
          placeholderTextColor="#a3a3a3"
          value={searchQuery}
          onChangeText={setSearchQuery}
          returnKeyType="search"
          autoCapitalize="none"
          autoCorrect={false}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
            <Ionicons name="close-circle" size={Math.max(18, width * 0.045)} color="#a3a3a3" />
          </TouchableOpacity>
        )}
      </View>
      {searchQuery.length > 0 && (
        <View style={styles.searchInfo}>
          <Text style={styles.searchInfoText}>
            {filteredMagazines.length} magazines found
          </Text>
        </View>
      )}
    </Animated.View>
  );

  const renderCategoryFilter = () => (
    <Animated.ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      style={[styles.filterContainer, { opacity: fadeAnim }]}
      contentContainerStyle={styles.filterContent}
    >
      <TouchableOpacity
        style={[styles.filterChip, styles.allCategoriesChip, !selectedCategory && styles.activeFilterChip]}
        onPress={() => setSelectedCategory(null)}
      >
        <Ionicons 
          name="grid-outline" 
          size={14} 
          color={!selectedCategory ? '#f59e0b' : '#a3a3a3'} 
        />
        <Text style={[styles.filterChipText, !selectedCategory && styles.activeFilterChipText]}>
          All Categories
        </Text>
      </TouchableOpacity>
      {categories.map(category => (
        <TouchableOpacity
          key={category.name}
          style={[styles.filterChip, selectedCategory === category.name && styles.activeFilterChip]}
          onPress={() => setSelectedCategory(category.name)}
        >
          <Ionicons 
            name={category.icon as any} 
            size={14} 
            color={selectedCategory === category.name ? '#f59e0b' : '#a3a3a3'} 
          />
          <Text style={[styles.filterChipText, selectedCategory === category.name && styles.activeFilterChipText]}>
            {category.name}
          </Text>
        </TouchableOpacity>
      ))}
    </Animated.ScrollView>
  );

  const renderCategoryCard = ({ item, index }: { item: CategoryData; index: number }) => (
    <Animated.View 
      style={[
        styles.categoryCard,
        { 
          opacity: fadeAnim,
          transform: [{ translateY: fadeAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [50, 0]
          })}]
        }
      ]}
    >
      <LinearGradient
        colors={item.gradient}
        style={styles.categoryHeader}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.categoryIconContainer}>
          <Ionicons name={item.icon as any} size={24} color="#f59e0b" />
        </View>
        <View style={styles.categoryInfo}>
          <Text style={styles.categoryName}>{item.name}</Text>
          <Text style={styles.categoryDescription}>{item.description}</Text>
          <View style={styles.categoryMeta}>
            <View style={styles.categoryCount}>
              <Ionicons name="book-outline" size={12} color="#f59e0b" />
              <Text style={styles.categoryCountText}>{item.count} magazines</Text>
            </View>
            <View style={styles.categoryType}>
              <Text style={styles.categoryTypeText}>Category</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity style={styles.categoryArrow}>
          <Ionicons name="chevron-forward" size={18} color="#f59e0b" />
        </TouchableOpacity>
      </LinearGradient>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.magazinesScroll}
        contentContainerStyle={styles.magazinesContent}
      >
        {item.magazines.map(magazine => (
          <TouchableOpacity
            key={magazine._id}
            style={styles.magazineItem}
            onPress={() => navigation.navigate('MagazineDetail', { 
              magazineId: magazine._id, 
              magazineData: magazine 
            })}
          >
            <Image source={{ uri: magazine.image }} style={styles.magazineImage} />
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.9)']}
              style={styles.magazineOverlay}
            >
              <View style={styles.magazineInfo}>
                <View style={styles.magazineHeader}>
                  <Text style={styles.magazineCategory}>{magazine.category}</Text>
                  <View style={[styles.typeBadge, magazine.type === 'pro' && styles.proBadge]}>
                    <Text style={styles.typeText}>{magazine.type.toUpperCase()}</Text>
                  </View>
                </View>
                <Text style={styles.magazineName} numberOfLines={2}>{magazine.name}</Text>
                <View style={styles.magazineMeta}>
                  <View style={styles.downloadInfo}>
                    <Ionicons name="download-outline" size={10} color="#ffffff" />
                    <Text style={styles.downloadCount}>{magazine.downloads.toLocaleString()}</Text>
                  </View>
                  <View style={styles.ratingInfo}>
                    <Ionicons name="star" size={10} color="#f59e0b" />
                    <Text style={styles.ratingText}>{magazine.rating}/5</Text>
                  </View>
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </Animated.View>
  );

  const renderAllMagazinesSection = () => (
    <Animated.View 
      style={[
        styles.categoryCard,
        { 
          opacity: fadeAnim,
          transform: [{ translateY: fadeAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [50, 0]
          })}]
        }
      ]}
    >
      <View style={styles.categoryHeader}>
        <View style={styles.categoryIconContainer}>
          <Ionicons name="grid" size={28} color="#f59e0b" />
        </View>
        <View style={styles.categoryInfo}>
          <Text style={styles.categoryName}>
            {searchQuery ? `Search Results for "${searchQuery}"` : 'All Magazines'}
          </Text>
          <Text style={styles.categoryDescription}>
            {searchQuery ? `Found ${filteredMagazines.length} magazines` : 'Browse all available magazines'}
          </Text>
          <View style={styles.categoryMeta}>
            <View style={styles.categoryCount}>
              <Ionicons name="book-outline" size={14} color="#f59e0b" />
              <Text style={styles.categoryCountText}>{filteredMagazines.length} magazines</Text>
            </View>
            <View style={styles.categoryType}>
              <Text style={styles.categoryTypeText}>All Categories</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity style={styles.categoryArrow}>
          <Ionicons name="chevron-forward" size={20} color="#f59e0b" />
        </TouchableOpacity>
      </View>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.magazinesScroll}
        contentContainerStyle={styles.magazinesContent}
      >
        {filteredMagazines.map(magazine => (
          <TouchableOpacity
            key={magazine._id}
            style={styles.magazineItem}
            onPress={() => navigation.navigate('MagazineDetail', { 
              magazineId: magazine._id, 
              magazineData: magazine 
            })}
          >
            <Image source={{ uri: magazine.image }} style={styles.magazineImage} />
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.8)']}
              style={styles.magazineOverlay}
            >
              <View style={styles.magazineInfo}>
                <View style={styles.magazineHeader}>
                  <Text style={styles.magazineCategory}>{magazine.category}</Text>
                  <View style={[styles.typeBadge, magazine.type === 'pro' && styles.proBadge]}>
                    <Text style={styles.typeText}>{magazine.type.toUpperCase()}</Text>
                  </View>
                </View>
                <Text style={styles.magazineName} numberOfLines={2}>{magazine.name}</Text>
                <View style={styles.magazineMeta}>
                  <View style={styles.downloadInfo}>
                    <Ionicons name="download-outline" size={12} color="#ffffff" />
                    <Text style={styles.downloadCount}>{magazine.downloads}</Text>
                  </View>
                  <View style={styles.ratingInfo}>
                    <Ionicons name="star" size={12} color="#f59e0b" />
                    <Text style={styles.ratingText}>{magazine.rating}/5</Text>
                  </View>
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </Animated.View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner message="Loading categories..." size="large" type="pulse" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {renderCategoryHeader()}
      {renderSearchBar()}
      {renderCategoryFilter()}
      
      {!selectedCategory ? (
        renderAllMagazinesSection()
      ) : (
        <FlatList
          data={filteredCategories}
          renderItem={renderCategoryCard}
          keyExtractor={(item) => item.name}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={() => (
            <Animated.View style={[styles.emptyContainer, { opacity: fadeAnim }]}>
              <Ionicons name="folder-open-outline" size={64} color="#a3a3a3" />
              <Text style={styles.emptyTitle}>No categories found</Text>
              <Text style={styles.emptyText}>
                {searchQuery ? 'Try adjusting your search terms' : 'No magazines available'}
              </Text>
            </Animated.View>
          )}
        />
      )}
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
  header: {
    paddingHorizontal: Math.max(20, width * 0.05),
    paddingTop: Math.max(20, height * 0.025),
    paddingBottom: Math.max(16, height * 0.02),
  },
  headerTitle: {
    fontSize: Math.max(32, width * 0.08),
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: Math.max(18, width * 0.045),
    color: '#a3a3a3',
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: Math.max(16, width * 0.04),
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: Math.max(24, width * 0.06),
    fontWeight: 'bold',
    color: '#f59e0b',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: Math.max(14, width * 0.035),
    color: '#a3a3a3',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#2a2a2a',
  },
  searchContainer: {
    paddingHorizontal: Math.max(20, width * 0.05),
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: Math.max(12, width * 0.03),
    paddingHorizontal: Math.max(16, width * 0.04),
    paddingVertical: Math.max(12, height * 0.015),
    borderWidth: 1,
    borderColor: '#2a2a2a',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    color: '#ffffff',
    fontSize: Math.max(16, width * 0.04),
  },
  clearButton: {
    padding: 8,
  },
  searchInfo: {
    paddingHorizontal: Math.max(20, width * 0.05),
    marginTop: 8,
  },
  searchInfoText: {
    fontSize: Math.max(14, width * 0.035),
    color: '#a3a3a3',
  },
  filterContainer: {
    marginBottom: 20,
    minHeight: 44,
    maxHeight: 44,
    height: 44,
  },
  filterContent: {
    paddingHorizontal: Math.max(20, width * 0.05),
    alignItems: 'center',
    height: 44,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Math.max(10, width * 0.025),
    paddingVertical: Math.max(8, height * 0.01),
    borderRadius: Math.max(16, width * 0.04),
    backgroundColor: '#2a2a2a',
    marginRight: Math.max(8, width * 0.02),
    borderWidth: 1,
    borderColor: '#3a3a3a',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
    minHeight: 36,
    maxHeight: 36,
    height: 36,
    minWidth: 80,
    maxWidth: 120,
  },
  activeFilterChip: {
    backgroundColor: 'rgba(245, 158, 11, 0.3)',
    borderColor: '#f59e0b',
    borderWidth: 2,
  },
  allCategoriesChip: {
    minWidth: 100,
    maxWidth: 100,
  },
  filterChipText: {
    fontSize: Math.max(12, width * 0.03),
    color: '#e5e5e5',
    fontWeight: '600',
    marginLeft: 6,
    minHeight: 16,
    textAlign: 'center',
  },
  activeFilterChipText: {
    color: '#f59e0b',
    fontWeight: '700',
  },
  listContent: {
    paddingBottom: 32,
  },
  categoryCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: Math.max(16, width * 0.04),
    marginHorizontal: Math.max(16, width * 0.04),
    marginBottom: Math.max(16, height * 0.02),
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Math.max(16, width * 0.04),
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  categoryIconContainer: {
    width: Math.max(48, width * 0.12),
    height: Math.max(48, width * 0.12),
    borderRadius: Math.max(24, width * 0.06),
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Math.max(12, width * 0.03),
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: Math.max(20, width * 0.05),
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  categoryDescription: {
    fontSize: Math.max(14, width * 0.035),
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
  },
  categoryMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categoryCount: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryCountText: {
    fontSize: Math.max(12, width * 0.03),
    color: '#ffffff',
    marginLeft: 4,
  },
  categoryType: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryTypeText: {
    fontSize: Math.max(10, width * 0.025),
    color: '#ffffff',
    fontWeight: '600',
  },
  categoryArrow: {
    padding: 8,
  },
  magazinesScroll: {
    marginHorizontal: -Math.max(20, width * 0.05),
  },
  magazinesContent: {
    paddingHorizontal: Math.max(20, width * 0.05),
  },
  magazineItem: {
    width: Math.max(140, width * 0.35),
    height: Math.max(180, height * 0.22),
    marginRight: Math.max(10, width * 0.025),
    borderRadius: Math.max(12, width * 0.03),
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
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
    height: '60%',
    justifyContent: 'flex-end',
    padding: 12,
  },
  magazineInfo: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  magazineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  magazineCategory: {
    fontSize: Math.max(10, width * 0.025),
    color: '#f59e0b',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  magazineName: {
    fontSize: Math.max(14, width * 0.035),
    color: '#ffffff',
    fontWeight: '600',
    marginBottom: 8,
  },
  magazineMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  typeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  proBadge: {
    backgroundColor: '#f59e0b',
  },
  typeText: {
    fontSize: Math.max(10, width * 0.025),
    color: '#ffffff',
    fontWeight: '600',
  },
  downloadInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  downloadCount: {
    fontSize: Math.max(10, width * 0.025),
    color: '#ffffff',
    marginLeft: 4,
  },
  ratingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: Math.max(10, width * 0.025),
    color: '#f59e0b',
    marginLeft: 4,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: Math.max(20, width * 0.05),
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: Math.max(16, width * 0.04),
    color: '#a3a3a3',
    textAlign: 'center',
  },
});

export default CategoriesScreen; 