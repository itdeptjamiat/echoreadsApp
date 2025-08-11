import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Magazine } from '../services/api';

const { width, height } = Dimensions.get('window');

interface ReadlyAudioPlayerProps {
  magazine: Magazine;
  isVisible: boolean;
  onClose: () => void;
  onPlay: () => void;
  onPause: () => void;
  onSeek: (position: number) => void;
  onSkipForward: () => void;
  onSkipBackward: () => void;
  onSpeedChange: (speed: number) => void;
  isPlaying: boolean;
  currentPosition: number;
  duration: number;
  playbackSpeed: number;
  showProgress?: boolean;
}

const ReadlyAudioPlayer: React.FC<ReadlyAudioPlayerProps> = ({
  magazine,
  isVisible,
  onClose,
  onPlay,
  onPause,
  onSeek,
  onSkipForward,
  onSkipBackward,
  onSpeedChange,
  isPlaying,
  currentPosition,
  duration,
  playbackSpeed,
  showProgress = true,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const expandAnim = useRef(new Animated.Value(0)).current;

  const availableSpeeds = [0.5, 0.75, 1, 1.25, 1.5, 2];

  useEffect(() => {
    if (isVisible) {
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isVisible]);

  const toggleExpanded = () => {
    const toValue = isExpanded ? 0 : 1;
    setIsExpanded(!isExpanded);
    
    Animated.timing(expandAnim, {
      toValue,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSeek = (event: any) => {
    if (!showProgress) return;
    
    const { locationX } = event.nativeEvent;
    const progressBarWidth = width - 64; // Account for padding
    const seekPosition = (locationX / progressBarWidth) * duration;
    onSeek(Math.max(0, Math.min(seekPosition, duration)));
  };

  const renderProgressBar = () => {
    if (!showProgress) return null;

    const progress = duration > 0 ? (currentPosition / duration) * 100 : 0;

    return (
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <TouchableOpacity 
            style={styles.progressBarTouchable}
            onPress={handleSeek}
            activeOpacity={0.8}
          >
            <View style={styles.progressBarBackground}>
              <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
            </View>
          </TouchableOpacity>
        </View>
        
        <View style={styles.timeContainer}>
          <Text style={styles.timeText}>{formatTime(currentPosition)}</Text>
          <Text style={styles.timeText}>-{formatTime(duration - currentPosition)}</Text>
        </View>
      </View>
    );
  };

  const renderExpandedControls = () => {
    if (!isExpanded) return null;

    return (
      <Animated.View 
        style={[
          styles.expandedControls,
          {
            height: expandAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 120],
            }),
            opacity: expandAnim,
          },
        ]}
      >
        <View style={styles.speedContainer}>
          <Text style={styles.speedLabel}>Playback Speed</Text>
          <View style={styles.speedButtons}>
            {availableSpeeds.map((speed) => (
              <TouchableOpacity
                key={speed}
                style={[
                  styles.speedButton,
                  playbackSpeed === speed && styles.speedButtonActive,
                ]}
                onPress={() => onSpeedChange(speed)}
              >
                <Text style={[
                  styles.speedButtonText,
                  playbackSpeed === speed && styles.speedButtonTextActive,
                ]}>
                  {speed}x
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Animated.View>
    );
  };

  if (!isVisible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [
            {
              translateY: slideAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [100, 0],
              }),
            },
          ],
        },
      ]}
    >
      <LinearGradient
        colors={['#2a2a2a', '#1a1a1a']}
        style={styles.gradient}
      >
        <View style={styles.mainContent}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={20} color="#fff" />
          </TouchableOpacity>

          <View style={styles.magazineInfo}>
            <View style={styles.coverContainer}>
              <View style={styles.coverPlaceholder}>
                <Ionicons name="book" size={24} color="#f59e0b" />
              </View>
            </View>
            
            <View style={styles.textInfo}>
              <Text style={styles.title} numberOfLines={1}>
                {magazine.name}
              </Text>
              <Text style={styles.subtitle} numberOfLines={1}>
                {magazine.category}
              </Text>
            </View>
          </View>

          <TouchableOpacity 
            style={styles.playPauseButton}
            onPress={isPlaying ? onPause : onPlay}
          >
            <Ionicons 
              name={isPlaying ? 'pause' : 'play'} 
              size={28} 
              color="#000" 
            />
          </TouchableOpacity>
        </View>

        {renderProgressBar()}

        <View style={styles.controls}>
          <TouchableOpacity style={styles.controlButton} onPress={onSkipBackward}>
            <Ionicons name="play-skip-back" size={24} color="#fff" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.controlButton} onPress={onSkipBackward}>
            <Ionicons name="play-back" size={20} color="#fff" />
            <Text style={styles.controlText}>15</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.controlButton} onPress={onSkipForward}>
            <Ionicons name="play-forward" size={20} color="#fff" />
            <Text style={styles.controlText}>15</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.controlButton} onPress={onSkipForward}>
            <Ionicons name="play-skip-forward" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={styles.expandButton}
          onPress={toggleExpanded}
        >
          <Ionicons 
            name={isExpanded ? 'chevron-down' : 'chevron-up'} 
            size={20} 
            color="#a3a3a3" 
          />
        </TouchableOpacity>

        {renderExpandedControls()}
      </LinearGradient>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  gradient: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
  },
  mainContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  closeButton: {
    padding: 8,
    marginRight: 12,
  },
  magazineInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  coverContainer: {
    marginRight: 12,
  },
  coverPlaceholder: {
    width: 40,
    height: 40,
    backgroundColor: '#3a3a3a',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textInfo: {
    flex: 1,
  },
  title: {
    fontSize: Math.max(14, Math.min(width * 0.035, 16)),
    color: '#ffffff',
    fontWeight: '600',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: Math.max(12, Math.min(width * 0.03, 14)),
    color: '#a3a3a3',
  },
  playPauseButton: {
    backgroundColor: '#ffffff',
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressBar: {
    marginBottom: 8,
  },
  progressBarTouchable: {
    height: 4,
  },
  progressBarBackground: {
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#f59e0b',
    borderRadius: 2,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeText: {
    fontSize: Math.max(11, Math.min(width * 0.028, 13)),
    color: '#a3a3a3',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  controlButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  controlText: {
    fontSize: Math.max(10, Math.min(width * 0.025, 12)),
    color: '#a3a3a3',
    marginTop: 2,
  },
  expandButton: {
    alignItems: 'center',
    padding: 8,
  },
  expandedControls: {
    overflow: 'hidden',
  },
  speedContainer: {
    marginTop: 8,
  },
  speedLabel: {
    fontSize: Math.max(12, Math.min(width * 0.03, 14)),
    color: '#a3a3a3',
    marginBottom: 12,
    textAlign: 'center',
  },
  speedButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  speedButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  speedButtonActive: {
    backgroundColor: '#f59e0b',
    borderColor: '#f59e0b',
  },
  speedButtonText: {
    fontSize: Math.max(11, Math.min(width * 0.028, 13)),
    color: '#a3a3a3',
    fontWeight: '500',
  },
  speedButtonTextActive: {
    color: '#000',
    fontWeight: '600',
  },
});

export default ReadlyAudioPlayer; 