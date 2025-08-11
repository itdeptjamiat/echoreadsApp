import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface HeaderProps {
  title: string;
  showBack?: boolean;
  rightAction?: {
    icon: string;
    onPress: () => void;
  };
  onBackPress?: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  title, 
  showBack = false, 
  rightAction,
  onBackPress 
}) => {
  return (
    <View style={styles.header}>
      <View style={styles.leftSection}>
        {showBack && (
          <TouchableOpacity style={styles.backButton} onPress={onBackPress}>
            <Ionicons name="arrow-back" size={24} color="#f59e0b" />
          </TouchableOpacity>
        )}
      </View>
      
      <Text style={styles.title}>{title}</Text>
      
      <View style={styles.rightSection}>
        {rightAction && (
          <TouchableOpacity style={styles.actionButton} onPress={rightAction.onPress}>
            <Ionicons name={rightAction.icon as any} size={24} color="#f59e0b" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#0a0a0a',
  },
  leftSection: {
    flex: 1,
    alignItems: 'flex-start',
  },
  rightSection: {
    flex: 1,
    alignItems: 'flex-end',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    flex: 2,
    textAlign: 'center',
  },
});

export default Header; 