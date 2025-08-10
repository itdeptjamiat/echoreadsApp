import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface CategoryTileProps {
  id: string;
  name: string;
  count: number;
  icon: string;
  color: string;
  onPress: () => void;
  isSelected?: boolean;
}

const CategoryTile: React.FC<CategoryTileProps> = ({
  name,
  count,
  icon,
  color,
  onPress,
  isSelected = false,
}) => {
  return (
    <TouchableOpacity 
      style={[styles.tile, isSelected && styles.selectedTile]} 
      onPress={onPress}
    >
      <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon as any} size={24} color={color} />
      </View>
      <Text style={styles.name}>{name}</Text>
      <Text style={styles.count}>{count}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  tile: {
    alignItems: 'center',
    marginHorizontal: 8,
    width: 80,
    paddingVertical: 8,
  },
  selectedTile: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: 12,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  name: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 2,
  },
  count: {
    fontSize: 10,
    color: '#a3a3a3',
  },
});

export default CategoryTile; 