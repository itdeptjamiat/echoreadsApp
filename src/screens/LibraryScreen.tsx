import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NavigationProps } from '../types';
import Header from '../components/Header';
import MagazineCard from '../components/MagazineCard';
import SearchBar from '../components/SearchBar';

const LibraryScreen: React.FC<NavigationProps> = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('bookmarks');
  const [searchQuery, setSearchQuery] = useState('');

  const savedMagazines = [
    {
      id: '1',
      title: 'The Future of AI in 2024',
      coverImage: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400',
      category: 'Technology',
      readTime: 8,
      isBookmarked: true,
      readProgress: 75,
    },
    {
      id: '2',
      title: 'Sustainable Business Practices',
      coverImage: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=400',
      category: 'Business',
      readTime: 6,
      isBookmarked: true,
      readProgress: 100,
    },
    {
      id: '3',
      title: 'Quantum Computing Breakthrough',
      coverImage: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400',
      category: 'Science',
      readTime: 10,
      isBookmarked: true,
      readProgress: 30,
    },
  ];

  const downloadedMagazines = [
    {
      id: '4',
      title: 'Mental Health in Digital Age',
      coverImage: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400',
      category: 'Health',
      readTime: 7,
      isBookmarked: true,
      downloadSize: '12.5 MB',
    },
    {
      id: '5',
      title: 'Art Movements of 2024',
      coverImage: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400',
      category: 'Culture',
      readTime: 5,
      isBookmarked: true,
      downloadSize: '8.2 MB',
    },
  ];

  const readingLists = [
    {
      id: '1',
      name: 'Tech Deep Dive',
      magazineCount: 12,
      color: '#f59e0b',
      icon: 'laptop-outline',
      lastUpdated: '2 hours ago',
    },
    {
      id: '2',
      name: 'Business Strategy',
      magazineCount: 8,
      color: '#f59e0b',
      icon: 'briefcase-outline',
      lastUpdated: '1 day ago',
    },
    {
      id: '3',
      name: 'Science & Research',
      magazineCount: 15,
      color: '#f59e0b',
      icon: 'flask-outline',
      lastUpdated: '3 days ago',
    },
    {
      id: '4',
      name: 'Personal Growth',
      magazineCount: 6,
      color: '#f59e0b',
      icon: 'person-outline',
      lastUpdated: '1 week ago',
    },
  ];

  const handleMagazinePress = (magazineId: string) => {
    Alert.alert('Magazine', `Opening magazine ${magazineId}`);
  };

  const handleBookmarkPress = (magazineId: string) => {
    Alert.alert('Bookmark', `Removing from bookmarks: ${magazineId}`);
  };

  const handleSearch = () => {
    Alert.alert('Search', `Searching library for: ${searchQuery}`);
  };

  const renderMagazineItem = ({ item }: { item: any }) => (
    <View className="bg-dark-card rounded-2xl mb-4 overflow-hidden">
      <View className="flex-row p-4">
        <Image
          source={{ uri: item.coverImage }}
          className="w-20 h-20 rounded-xl mr-4"
          resizeMode="cover"
        />
        <View className="flex-1">
          <View className="flex-row items-center mb-2">
            <View className="px-2 py-1 rounded-full bg-gold-500 mr-2">
              <Text className="text-dark-primary text-xs font-semibold">
                {item.category}
              </Text>
            </View>
            <TouchableOpacity onPress={() => handleBookmarkPress(item.id)}>
              <Ionicons name="bookmark" size={16} color="#f59e0b" />
            </TouchableOpacity>
          </View>
          
          <Text className="text-text-primary text-base font-bold mb-2 font-serif">
            {item.title}
          </Text>
          
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <Ionicons name="time-outline" size={14} color="#a3a3a3" />
              <Text className="text-text-tertiary text-sm ml-1">
                {item.readTime} min read
              </Text>
            </View>
            
            {item.readProgress && (
              <View className="flex-row items-center">
                <View className="w-16 h-1 bg-dark-secondary rounded-full mr-2">
                  <View 
                    className="h-1 bg-gold-500 rounded-full"
                    style={{ width: `${item.readProgress}%` }}
                  />
                </View>
                <Text className="text-text-tertiary text-xs">
                  {item.readProgress}%
                </Text>
              </View>
            )}
            
            {item.downloadSize && (
              <Text className="text-text-tertiary text-xs">
                {item.downloadSize}
              </Text>
            )}
          </View>
        </View>
      </View>
    </View>
  );

  const renderReadingList = ({ item }: { item: any }) => (
    <TouchableOpacity className="bg-dark-card rounded-2xl p-4 mb-4">
      <View className="flex-row items-center">
        <View
          className="w-12 h-12 rounded-full items-center justify-center mr-4"
          style={{ backgroundColor: `${item.color}20` }}
        >
          <Ionicons name={item.icon as any} size={24} color={item.color} />
        </View>
        <View className="flex-1">
          <Text className="text-text-primary text-base font-bold mb-1">
            {item.name}
          </Text>
          <Text className="text-text-tertiary text-sm mb-1">
            {item.magazineCount} magazines
          </Text>
          <Text className="text-text-muted text-xs">
            Updated {item.lastUpdated}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#a3a3a3" />
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-dark-primary">
      {/* Header */}
      <Header
        title="My Library"
        rightAction={{
          icon: 'add-outline',
          onPress: () => Alert.alert('Add', 'Add new reading list'),
        }}
      />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Search Bar */}
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSearch={handleSearch}
          placeholder="Search your library..."
        />

        {/* Tab Navigation */}
        <View className="px-4 mb-6">
          <View className="flex-row bg-dark-secondary rounded-2xl p-1">
            <TouchableOpacity
              className={`flex-1 py-3 px-4 rounded-xl ${
                activeTab === 'bookmarks' ? 'bg-dark-card' : ''
              }`}
              onPress={() => setActiveTab('bookmarks')}
            >
              <Text
                className={`text-center font-semibold ${
                  activeTab === 'bookmarks' ? 'text-gold-500' : 'text-text-tertiary'
                }`}
              >
                Bookmarks
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`flex-1 py-3 px-4 rounded-xl ${
                activeTab === 'downloads' ? 'bg-dark-card' : ''
              }`}
              onPress={() => setActiveTab('downloads')}
            >
              <Text
                className={`text-center font-semibold ${
                  activeTab === 'downloads' ? 'text-gold-500' : 'text-text-tertiary'
                }`}
              >
                Downloads
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`flex-1 py-3 px-4 rounded-xl ${
                activeTab === 'lists' ? 'bg-dark-card' : ''
              }`}
              onPress={() => setActiveTab('lists')}
            >
              <Text
                className={`text-center font-semibold ${
                  activeTab === 'lists' ? 'text-gold-500' : 'text-text-tertiary'
                }`}
              >
                Lists
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Content */}
        <View className="px-4 pb-6">
          {activeTab === 'bookmarks' && (
            <View>
              <Text className="text-text-primary text-lg font-bold mb-4">
                Saved Magazines ({savedMagazines.length})
              </Text>
              {savedMagazines.map((magazine) => (
                <TouchableOpacity
                  key={magazine.id}
                  onPress={() => handleMagazinePress(magazine.id)}
                >
                  {renderMagazineItem({ item: magazine })}
                </TouchableOpacity>
              ))}
            </View>
          )}

          {activeTab === 'downloads' && (
            <View>
              <Text className="text-text-primary text-lg font-bold mb-4">
                Downloaded ({downloadedMagazines.length})
              </Text>
              {downloadedMagazines.map((magazine) => (
                <TouchableOpacity
                  key={magazine.id}
                  onPress={() => handleMagazinePress(magazine.id)}
                >
                  {renderMagazineItem({ item: magazine })}
                </TouchableOpacity>
              ))}
            </View>
          )}

          {activeTab === 'lists' && (
            <View>
              <Text className="text-text-primary text-lg font-bold mb-4">
                Reading Lists ({readingLists.length})
              </Text>
              {readingLists.map((list) => (
                <TouchableOpacity
                  key={list.id}
                  onPress={() => Alert.alert('List', `Opening ${list.name}`)}
                >
                  {renderReadingList({ item: list })}
                </TouchableOpacity>
              ))}
              
              {/* Create New List */}
              <TouchableOpacity className="bg-dark-card rounded-2xl p-4 mt-4 border-2 border-dashed border-gold-500/30 items-center">
                <Ionicons name="add-circle-outline" size={32} color="#f59e0b" />
                <Text className="text-gold-500 text-base font-semibold mt-2">
                  Create New List
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default LibraryScreen; 