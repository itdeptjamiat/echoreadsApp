import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NavigationProps } from '../types';

const DiscoverScreen: React.FC<NavigationProps> = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const trendingTopics = [
    { id: '1', name: 'AI & Machine Learning', count: '2.3k articles' },
    { id: '2', name: 'Climate Change', count: '1.8k articles' },
    { id: '3', name: 'Space Exploration', count: '1.2k articles' },
    { id: '4', name: 'Mental Health', count: '956 articles' },
    { id: '5', name: 'Cryptocurrency', count: '1.5k articles' },
    { id: '6', name: 'Sustainable Living', count: '892 articles' },
  ];

  const popularPublications = [
    {
      id: '1',
      name: 'Tech Insights',
      followers: '125k',
      imageUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=100',
      category: 'Technology',
    },
    {
      id: '2',
      name: 'Business Weekly',
      followers: '98k',
      imageUrl: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=100',
      category: 'Business',
    },
    {
      id: '3',
      name: 'Science Today',
      followers: '156k',
      imageUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=100',
      category: 'Science',
    },
    {
      id: '4',
      name: 'Health Matters',
      followers: '89k',
      imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=100',
      category: 'Health',
    },
  ];

  const renderTrendingTopic = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={{
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', color: '#1e293b', marginBottom: 4 }}>
            {item.name}
          </Text>
          <Text style={{ color: '#64748b', fontSize: 12 }}>
            {item.count}
          </Text>
        </View>
        <Ionicons name="trending-up" size={20} color="#6366f1" />
      </View>
    </TouchableOpacity>
  );

  const renderPublication = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={{
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Image
          source={{ uri: item.imageUrl }}
          style={{
            width: 50,
            height: 50,
            borderRadius: 25,
            marginRight: 12,
          }}
        />
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', color: '#1e293b', marginBottom: 4 }}>
            {item.name}
          </Text>
          <Text style={{ color: '#64748b', fontSize: 12, marginBottom: 4 }}>
            {item.category}
          </Text>
          <Text style={{ color: '#6366f1', fontSize: 12, fontWeight: '500' }}>
            {item.followers} followers
          </Text>
        </View>
        <TouchableOpacity
          style={{
            backgroundColor: '#f1f5f9',
            borderRadius: 20,
            paddingHorizontal: 16,
            paddingVertical: 8,
          }}
        >
          <Text style={{ color: '#6366f1', fontSize: 12, fontWeight: '600' }}>
            Follow
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <ScrollView style={{ flex: 1 }}>
        {/* Header */}
        <View style={{ paddingHorizontal: 20, paddingVertical: 16, backgroundColor: 'white' }}>
          <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#1e293b', marginBottom: 16 }}>
            Discover
          </Text>
          
          {/* Search Bar */}
          <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#f1f5f9', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12 }}>
            <Ionicons name="search-outline" size={20} color="#64748b" />
            <TextInput
              style={{ flex: 1, marginLeft: 12, color: '#1e293b', fontSize: 16 }}
              placeholder="Search articles, topics, or publications..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color="#64748b" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Trending Topics */}
        <View style={{ paddingHorizontal: 20, paddingVertical: 16 }}>
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#1e293b', marginBottom: 16 }}>
            Trending Topics
          </Text>
          {trendingTopics.map((topic) => renderTrendingTopic({ item: topic }))}
        </View>

        {/* Popular Publications */}
        <View style={{ paddingHorizontal: 20, paddingBottom: 20 }}>
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#1e293b', marginBottom: 16 }}>
            Popular Publications
          </Text>
          {popularPublications.map((publication) => renderPublication({ item: publication }))}
        </View>

        {/* Quick Actions */}
        <View style={{ paddingHorizontal: 20, paddingBottom: 20 }}>
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#1e293b', marginBottom: 16 }}>
            Quick Actions
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            <TouchableOpacity
              style={{
                width: '48%',
                backgroundColor: 'white',
                borderRadius: 12,
                padding: 16,
                alignItems: 'center',
                marginBottom: 12,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 2,
              }}
            >
              <Ionicons name="bookmark-outline" size={24} color="#6366f1" />
              <Text style={{ marginTop: 8, fontSize: 14, fontWeight: '600', color: '#1e293b' }}>
                My Bookmarks
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                width: '48%',
                backgroundColor: 'white',
                borderRadius: 12,
                padding: 16,
                alignItems: 'center',
                marginBottom: 12,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 2,
              }}
            >
              <Ionicons name="time-outline" size={24} color="#6366f1" />
              <Text style={{ marginTop: 8, fontSize: 14, fontWeight: '600', color: '#1e293b' }}>
                Reading History
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                width: '48%',
                backgroundColor: 'white',
                borderRadius: 12,
                padding: 16,
                alignItems: 'center',
                marginBottom: 12,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 2,
              }}
            >
              <Ionicons name="download-outline" size={24} color="#6366f1" />
              <Text style={{ marginTop: 8, fontSize: 14, fontWeight: '600', color: '#1e293b' }}>
                Offline Articles
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                width: '48%',
                backgroundColor: 'white',
                borderRadius: 12,
                padding: 16,
                alignItems: 'center',
                marginBottom: 12,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 2,
              }}
            >
              <Ionicons name="settings-outline" size={24} color="#6366f1" />
              <Text style={{ marginTop: 8, fontSize: 14, fontWeight: '600', color: '#1e293b' }}>
                Preferences
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default DiscoverScreen; 