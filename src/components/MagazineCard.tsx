import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface MagazineCardProps {
  id: string;
  title: string;
  category: string;
  cover: string;
  articles: number;
  readTime: string;
  isBookmarked: boolean;
  onPress: () => void;
  onBookmarkPress: () => void;
}

const MagazineCard: React.FC<MagazineCardProps> = ({
  title,
  category,
  cover,
  articles,
  readTime,
  isBookmarked,
  onPress,
  onBookmarkPress,
}) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Image source={{ uri: cover }} style={styles.cover} />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.8)']}
        style={styles.overlay}
      >
        <View style={styles.info}>
          <Text style={styles.category}>{category}</Text>
          <Text style={styles.title}>{title}</Text>
          <View style={styles.meta}>
            <Text style={styles.articles}>{articles} articles</Text>
            <Text style={styles.readTime}>{readTime}</Text>
          </View>
        </View>
      </LinearGradient>
      <TouchableOpacity style={styles.bookmarkButton} onPress={onBookmarkPress}>
        <Ionicons
          name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
          size={20}
          color={isBookmarked ? '#f59e0b' : '#ffffff'}
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 160,
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    marginHorizontal: 8,
  },
  cover: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
    justifyContent: 'flex-end',
    padding: 16,
  },
  info: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  category: {
    fontSize: 12,
    color: '#f59e0b',
    fontWeight: '600',
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  meta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  articles: {
    fontSize: 12,
    color: '#e5e5e5',
  },
  readTime: {
    fontSize: 12,
    color: '#a3a3a3',
  },
  bookmarkButton: {
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
});

export default MagazineCard; 