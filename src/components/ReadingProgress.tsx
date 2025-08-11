import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

interface ReadingProgressProps {
  currentPage: number;
  totalPages: number;
  readingTime: number; // in minutes
  wordsRead: number;
  totalWords: number;
  theme: 'dark' | 'sepia' | 'light';
}

const ReadingProgress: React.FC<ReadingProgressProps> = ({
  currentPage,
  totalPages,
  readingTime,
  wordsRead,
  totalWords,
  theme,
}) => {
  const getThemeColors = () => {
    switch (theme) {
      case 'light':
        return {
          background: '#ffffff',
          text: '#000000',
          secondaryText: '#666666',
          accent: '#f59e0b',
        };
      case 'sepia':
        return {
          background: '#f4ecd8',
          text: '#5c4b37',
          secondaryText: '#8b7355',
          accent: '#d4a574',
        };
      default: // dark
        return {
          background: '#0a0a0a',
          text: '#ffffff',
          secondaryText: '#a3a3a3',
          accent: '#f59e0b',
        };
    }
  };

  const themeColors = getThemeColors();
  const progress = (currentPage / totalPages) * 100;
  const wordsProgress = (wordsRead / totalWords) * 100;

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <View style={styles.progressSection}>
        <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
          Reading Progress
        </Text>
        
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { 
                width: `${progress}%`,
                backgroundColor: themeColors.accent,
              }
            ]} 
          />
        </View>
        
        <Text style={[styles.progressText, { color: themeColors.secondaryText }]}>
          {currentPage} of {totalPages} pages ({Math.round(progress)}%)
        </Text>
      </View>

      <View style={styles.statsSection}>
        <View style={styles.statItem}>
          <Ionicons name="time-outline" size={20} color={themeColors.accent} />
          <Text style={[styles.statValue, { color: themeColors.text }]}>
            {formatTime(readingTime)}
          </Text>
          <Text style={[styles.statLabel, { color: themeColors.secondaryText }]}>
            Reading Time
          </Text>
        </View>

        <View style={styles.statItem}>
          <Ionicons name="text-outline" size={20} color={themeColors.accent} />
          <Text style={[styles.statValue, { color: themeColors.text }]}>
            {Math.round(wordsProgress)}%
          </Text>
          <Text style={[styles.statLabel, { color: themeColors.secondaryText }]}>
            Words Read
          </Text>
        </View>

        <View style={styles.statItem}>
          <Ionicons name="speedometer-outline" size={20} color={themeColors.accent} />
          <Text style={[styles.statValue, { color: themeColors.text }]}>
            {Math.round(wordsRead / readingTime)} wpm
          </Text>
          <Text style={[styles.statLabel, { color: themeColors.secondaryText }]}>
            Reading Speed
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    borderRadius: 12,
    margin: 16,
  },
  progressSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#2a2a2a',
    borderRadius: 3,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 14,
    textAlign: 'center',
  },
  statsSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 4,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
});

export default ReadingProgress; 