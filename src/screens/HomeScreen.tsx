import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
  FlatList,
  ActivityIndicator,
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

type TabType = 'magazines' | 'articles' | 'digests';

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [activeTab, setActiveTab] = useState<TabType>('magazines');
  const [magazines, setMagazines] = useState<Magazine[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  // Filter magazines based on active tab
  const getFilteredMagazines = () => {
    switch (activeTab) {
      case 'magazines':
        return magazines.filter(mag => mag.magzineType === 'magzine');
      case 'articles':
        return magazines.filter(mag => mag.magzineType === 'article');
      case 'digests':
        return magazines.filter(mag => mag.magzineType === 'digest');
      default:
        return magazines;
    }
  };

  const filteredMagazines = getFilteredMagazines();

  // Auto-slide timer
  useEffect(() => {
    const interval = setInterval(() => {
      if (filteredMagazines.length > 0) {
        const nextIndex = (currentSlideIndex + 1) % filteredMagazines.length;
        setCurrentSlideIndex(nextIndex);
        safeScrollToIndex(nextIndex);
      }
    }, 4000); // Change slide every 4 seconds

    return () => clearInterval(interval);
  }, [currentSlideIndex, filteredMagazines.length]);

  // Safe scrollToIndex function
  const safeScrollToIndex = (index: number) => {
    if (filteredMagazines.length > 0 && index >= 0 && index < filteredMagazines.length) {
      flatListRef.current?.scrollToIndex({
        index,
        animated: true,
      });
    }
  };

  // Fetch magazines on component mount
  useEffect(() => {
    fetchMagazines();
  }, []);

  const fetchMagazines = async () => {
    try {
      setLoading(true);
      const response = await magazinesAPI.getMagazines();
      if (response.success) {
        setMagazines(response.data);
        console.log('Available magazine IDs:', response.data.map(mag => ({ id: mag._id, name: mag.name })));
      }
    } catch (error) {
      console.error('Error fetching magazines:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <View>
          <Text style={styles.greeting}>Good morning!</Text>
          <Text style={styles.userName}>Welcome back</Text>
        </View>
        <TouchableOpacity style={styles.notificationButton}>
          <Ionicons name="notifications-outline" size={24} color="#f59e0b" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderTabs = () => (
    <View style={styles.tabsContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'magazines' && styles.activeTab]}
          onPress={() => setActiveTab('magazines')}
        >
          <Ionicons 
            name="book-outline" 
            size={20} 
            color={activeTab === 'magazines' ? '#f59e0b' : '#a3a3a3'} 
          />
          <Text style={[styles.tabText, activeTab === 'magazines' && styles.activeTabText]}>
            Magazines
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'articles' && styles.activeTab]}
          onPress={() => setActiveTab('articles')}
        >
          <Ionicons 
            name="document-text-outline" 
            size={20} 
            color={activeTab === 'articles' ? '#f59e0b' : '#a3a3a3'} 
          />
          <Text style={[styles.tabText, activeTab === 'articles' && styles.activeTabText]}>
            Articles
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'digests' && styles.activeTab]}
          onPress={() => setActiveTab('digests')}
        >
          <Ionicons 
            name="newspaper-outline" 
            size={20} 
            color={activeTab === 'digests' ? '#f59e0b' : '#a3a3a3'} 
          />
          <Text style={[styles.tabText, activeTab === 'digests' && styles.activeTabText]}>
            Digests
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );

  const renderMagazineCard = ({ item, index }: { item: Magazine; index: number }) => (
    <TouchableOpacity 
      style={styles.magazineCard}
      onPress={() => navigation.navigate('MagazineDetail', { magazineId: item._id, magazineData: item })}
    >
      <Image source={{ uri: item.image }} style={styles.magazineImage} />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.8)']}
        style={styles.magazineOverlay}
      >
        <View style={styles.magazineInfo}>
          <View style={styles.magazineHeader}>
            <Text style={styles.magazineCategory}>{item.category}</Text>
            <View style={[styles.typeBadge, item.type === 'pro' && styles.proBadge]}>
              <Text style={styles.typeText}>{item.type.toUpperCase()}</Text>
            </View>
          </View>
          <Text style={styles.magazineTitle}>{item.name}</Text>
          <Text style={styles.magazineDescription} numberOfLines={2}>
            {item.description}
          </Text>
          <View style={styles.magazineMeta}>
            <View style={styles.metaItem}>
              <Ionicons name="download-outline" size={14} color="#a3a3a3" />
              <Text style={styles.metaText}>{item.downloads}</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="star-outline" size={14} color="#a3a3a3" />
              <Text style={styles.metaText}>{item.rating}</Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderCarousel = () => (
    <View style={styles.carouselContainer}>
      <Text style={styles.sectionTitle}>Featured {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</Text>
      {loading ? (
        <View style={styles.loadingContainer}>
          <LoadingSpinner message={`Loading ${activeTab}...`} size="large" type="pulse" />
        </View>
      ) : filteredMagazines.length > 0 ? (
        <FlatList
          ref={flatListRef}
          data={filteredMagazines}
          renderItem={renderMagazineCard}
          keyExtractor={(item) => item._id}
          horizontal
          showsHorizontalScrollIndicator={false}
          pagingEnabled
          snapToInterval={width - 40}
          decelerationRate="fast"
          onMomentumScrollEnd={(event) => {
            const index = Math.round(event.nativeEvent.contentOffset.x / (width - 40));
            setCurrentSlideIndex(index);
          }}
          contentContainerStyle={styles.carouselContent}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="book-outline" size={48} color="#a3a3a3" />
          <Text style={styles.emptyText}>No {activeTab} available</Text>
        </View>
      )}
    </View>
  );

  const renderMagazineGrid = () => (
    <View style={styles.gridContainer}>
      <Text style={styles.sectionTitle}>All {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</Text>
      {loading ? (
        <View style={styles.loadingContainer}>
          <LoadingSpinner message="Loading magazines..." size="large" type="wave" />
        </View>
      ) : (
        <FlatList
          data={filteredMagazines}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.gridCard}
              onPress={() => navigation.navigate('MagazineDetail', { magazineId: item._id, magazineData: item })}
            >
              <Image source={{ uri: item.image }} style={styles.gridImage} />
              <View style={styles.gridInfo}>
                <Text style={styles.gridTitle} numberOfLines={2}>{item.name}</Text>
                <Text style={styles.gridCategory}>{item.category}</Text>
                <View style={styles.gridMeta}>
                  <Text style={styles.gridType}>{item.type}</Text>
                  <Text style={styles.gridDownloads}>{item.downloads} downloads</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item._id}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.gridContent}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Ionicons name="book-outline" size={48} color="#a3a3a3" />
              <Text style={styles.emptyText}>No {activeTab} available</Text>
            </View>
          )}
        />
      )}
    </View>
  );

  // Main content sections
  const sections = [
    { id: 'header', render: renderHeader },
    { id: 'tabs', render: renderTabs },
    { id: 'carousel', render: renderCarousel },
    { id: 'grid', render: renderMagazineGrid },
  ];

  const renderSection = ({ item }: { item: { id: string; render: () => React.ReactElement } }) => {
    return item.render();
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={sections}
        renderItem={renderSection}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.mainContent}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  mainContent: {
    paddingBottom: 32,
  },
  header: {
    paddingHorizontal: Math.max(20, width * 0.05),
    paddingTop: Math.max(20, height * 0.025),
    paddingBottom: Math.max(24, height * 0.03),
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Math.max(20, height * 0.025),
  },
  greeting: {
    fontSize: Math.max(16, width * 0.04),
    color: '#a3a3a3',
  },
  userName: {
    fontSize: Math.max(24, width * 0.06),
    fontWeight: 'bold',
    color: '#ffffff',
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabsContainer: {
    paddingHorizontal: Math.max(20, width * 0.05),
    marginBottom: 24,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginRight: 16,
    borderRadius: 25,
    backgroundColor: '#1a1a1a',
  },
  activeTab: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    borderWidth: 1,
    borderColor: '#f59e0b',
  },
  tabText: {
    marginLeft: 8,
    fontSize: Math.max(14, width * 0.035),
    color: '#a3a3a3',
    fontWeight: '600',
  },
  activeTabText: {
    color: '#f59e0b',
  },
  carouselContainer: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: Math.max(20, width * 0.05),
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
    paddingHorizontal: Math.max(20, width * 0.05),
  },
  loadingContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#a3a3a3',
    marginTop: 8,
    fontSize: Math.max(14, width * 0.035),
  },
  emptyContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#a3a3a3',
    marginTop: 8,
    fontSize: Math.max(14, width * 0.035),
  },
  carouselContent: {
    paddingHorizontal: Math.max(20, width * 0.05),
  },
  magazineCard: {
    width: width - 40,
    height: 200,
    marginRight: 16,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
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
    padding: 16,
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
    fontSize: Math.max(12, width * 0.03),
    color: '#f59e0b',
    fontWeight: '600',
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
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
  magazineTitle: {
    fontSize: Math.max(16, width * 0.04),
    color: '#ffffff',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  magazineDescription: {
    fontSize: Math.max(12, width * 0.03),
    color: '#e5e5e5',
    marginBottom: 12,
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
    fontSize: Math.max(12, width * 0.03),
    color: '#a3a3a3',
    marginLeft: 4,
  },
  gridContainer: {
    paddingHorizontal: Math.max(20, width * 0.05),
  },
  gridContent: {
    paddingBottom: 32,
  },
  gridCard: {
    width: (width - 60) / 2,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    marginBottom: 16,
    marginRight: 16,
    overflow: 'hidden',
  },
  gridImage: {
    width: '100%',
    height: 120,
  },
  gridInfo: {
    padding: 12,
  },
  gridTitle: {
    fontSize: Math.max(14, width * 0.035),
    color: '#ffffff',
    fontWeight: '600',
    marginBottom: 4,
  },
  gridCategory: {
    fontSize: Math.max(12, width * 0.03),
    color: '#f59e0b',
    marginBottom: 8,
  },
  gridMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  gridType: {
    fontSize: Math.max(10, width * 0.025),
    color: '#a3a3a3',
    textTransform: 'uppercase',
  },
  gridDownloads: {
    fontSize: Math.max(10, width * 0.025),
    color: '#a3a3a3',
  },
});

export default HomeScreen; 