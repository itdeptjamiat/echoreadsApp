import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SearchBarProps {
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  onSearch?: () => void;
  onClear?: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = 'Search...',
  value,
  onChangeText,
  onSearch,
  onClear,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={[styles.container, isFocused && styles.focusedContainer]}>
      <Ionicons name="search" size={20} color={isFocused ? '#f59e0b' : '#a3a3a3'} />
      
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="#a3a3a3"
        value={value}
        onChangeText={onChangeText}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onSubmitEditing={onSearch}
        returnKeyType="search"
      />
      
      {value.length > 0 && (
        <TouchableOpacity onPress={onClear} style={styles.clearButton}>
          <Ionicons name="close-circle" size={20} color="#a3a3a3" />
        </TouchableOpacity>
      )}
      
      {value.length > 0 && onSearch && (
        <TouchableOpacity onPress={onSearch} style={styles.searchButton}>
          <Ionicons name="arrow-forward" size={20} color="#f59e0b" />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  focusedContainer: {
    borderColor: '#f59e0b',
    backgroundColor: '#2a2a2a',
  },
  input: {
    flex: 1,
    marginLeft: 12,
    color: '#ffffff',
    fontSize: 16,
  },
  clearButton: {
    padding: 4,
  },
  searchButton: {
    padding: 4,
    marginLeft: 8,
  },
});

export default SearchBar; 