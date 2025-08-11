import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Magazine } from '../services/api';

interface MagazineCardProps {
  magazine: Magazine;
  onPress: () => void;
  onAudioPress?: () => void;
}

const MagazineCard: React.FC<MagazineCardProps> = ({
  magazine,
  onPress,
  onAudioPress,
}) => {
  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'magazine':
        return '#f59e0b';
      case 'article':
        return '#3b82f6';
      case 'digest':
        return '#10b981';
      default:
        return '#f59e0b';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'magazine':
        return 'newspaper-outline';
      case 'article':
        return 'document-text-outline';
      case 'digest':
        return 'library-outline';
      default:
        return 'newspaper-outline';
    }
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Image source={{ uri: magazine.image }} style={styles.cover} />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.8)']}
        style={styles.overlay}
      >
        <View style={styles.typeBadge}>
          <Ionicons 
            name={getTypeIcon(magazine.type) as any} 
            size={12} 
            color="#ffffff" 
          />
          <Text style={[styles.typeText, { color: getTypeColor(magazine.type) }]}>
            {magazine.type.toUpperCase()}
          </Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.category}>{magazine.category}</Text>
          <Text style={styles.title} numberOfLines={2}>{magazine.name}</Text>
          <View style={styles.meta}>
            <View style={styles.metaItem}>
              <Ionicons name="download-outline" size={12} color="#a3a3a3" />
              <Text style={styles.metaText}>{formatNumber(magazine.downloads)}</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="star" size={12} color="#fbbf24" />
              <Text style={styles.metaText}>{magazine.rating}</Text>
            </View>
          </View>
        </View>
      </LinearGradient>
      {onAudioPress && (
        <TouchableOpacity style={styles.audioButton} onPress={onAudioPress}>
          <Ionicons name="play" size={16} color="#ffffff" />
        </TouchableOpacity>
      )}
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
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginBottom: 8,
  },
  typeText: {
    fontSize: 10,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  audioButton: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 12,
    color: '#a3a3a3',
    marginLeft: 4,
  },
});

export default MagazineCard; 