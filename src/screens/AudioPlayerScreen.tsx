import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
  Animated,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import * as Speech from 'expo-speech';
import { useAlert } from '../context/AlertContext';
import { Magazine } from '../services/api';

const { width, height } = Dimensions.get('window');

type RootStackParamList = {
  AudioPlayer: { 
    magazineId: string; 
    magazineData: Magazine;
    content: string;
  };
};

type AudioPlayerRouteProp = RouteProp<RootStackParamList, 'AudioPlayer'>;

const AudioPlayerScreen: React.FC = () => {
  const route = useRoute<AudioPlayerRouteProp>();
  const navigation = useNavigation();
  const { showSuccess, showError } = useAlert();
  const { magazineId, magazineData, content } = route.params;

  // Audio state
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [audioSpeed, setAudioSpeed] = useState(1.0);
  const [audioVoice, setAudioVoice] = useState('en-US');
  const [audioProgress, setAudioProgress] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);

  // Animations
  const progressAnimation = useRef(new Animated.Value(0)).current;
  const pulseAnimation = useRef(new Animated.Value(1)).current;

  // Parse content into sentences for better control
  const sentences = content
    .replace(/[#*]/g, '')
    .split(/[.!?]+/)
    .filter(sentence => sentence.trim().length > 0)
    .map(sentence => sentence.trim());

  useEffect(() => {
    setTotalDuration(sentences.length);
    setCurrentText(sentences[0] || '');
    
    // Start pulse animation
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnimation, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnimation, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();

    return () => {
      pulse.stop();
      if (isPlaying) {
        Speech.stop();
      }
    };
  }, []);

  // Update progress animation
  useEffect(() => {
    Animated.timing(progressAnimation, {
      toValue: audioProgress,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [audioProgress]);

  const startAudio = async () => {
    try {
      if (isPaused) {
        // Resume from current position
        await Speech.speak(sentences.slice(currentSentenceIndex).join('. '), {
          language: audioVoice,
          pitch: 1.0,
          rate: audioSpeed,
          onStart: () => {
            setIsPlaying(true);
            setIsPaused(false);
            showSuccess('Audio Resumed', 'Continuing from where you left off');
          },
          onDone: () => {
            setIsPlaying(false);
            setIsPaused(false);
            setCurrentSentenceIndex(0);
            setAudioProgress(100);
            showSuccess('Audio Completed', 'Finished reading the entire content');
          },
          onError: (error) => {
            setIsPlaying(false);
            setIsPaused(false);
            showError('Audio Error', 'Failed to play audio: ' + error);
          },
        });
      } else {
        // Start from beginning
        setCurrentSentenceIndex(0);
        setAudioProgress(0);
        setCurrentTime(0);
        
        await Speech.speak(content.replace(/[#*]/g, '').trim(), {
          language: audioVoice,
          pitch: 1.0,
          rate: audioSpeed,
          onStart: () => {
            setIsPlaying(true);
            setIsPaused(false);
            showSuccess('Audio Started', 'Reading aloud has begun');
          },
          onDone: () => {
            setIsPlaying(false);
            setIsPaused(false);
            setCurrentSentenceIndex(0);
            setAudioProgress(100);
            showSuccess('Audio Completed', 'Finished reading the entire content');
          },
          onError: (error) => {
            setIsPlaying(false);
            setIsPaused(false);
            showError('Audio Error', 'Failed to play audio: ' + error);
          },
        });
      }
    } catch (error) {
      showError('Audio Failed', 'Failed to start audio: ' + error);
    }
  };

  const pauseAudio = async () => {
    try {
      await Speech.stop();
      setIsPlaying(false);
      setIsPaused(true);
      showSuccess('Audio Paused', 'Audio playback paused');
    } catch (error) {
      showError('Pause Failed', 'Failed to pause audio: ' + error);
    }
  };

  const stopAudio = async () => {
    try {
      await Speech.stop();
      setIsPlaying(false);
      setIsPaused(false);
      setCurrentSentenceIndex(0);
      setAudioProgress(0);
      setCurrentTime(0);
      showSuccess('Audio Stopped', 'Audio playback stopped');
    } catch (error) {
      showError('Stop Failed', 'Failed to stop audio: ' + error);
    }
  };

  const seekToPosition = (position: number) => {
    const newIndex = Math.floor((position / 100) * sentences.length);
    setCurrentSentenceIndex(newIndex);
    setCurrentTime(newIndex);
    setAudioProgress(position);
    
    if (isPlaying) {
      // Restart audio from new position
      Speech.stop();
      setTimeout(() => {
        const remainingText = sentences.slice(newIndex).join('. ');
        Speech.speak(remainingText, {
          language: audioVoice,
          pitch: 1.0,
          rate: audioSpeed,
          onStart: () => setIsPlaying(true),
          onDone: () => {
            setIsPlaying(false);
            setAudioProgress(100);
          },
        });
      }, 100);
    }
  };

  const changeSpeed = (newSpeed: number) => {
    setAudioSpeed(newSpeed);
    if (isPlaying) {
      // Restart with new speed
      Speech.stop();
      setTimeout(() => startAudio(), 100);
    }
  };

  const changeVoice = (newVoice: string) => {
    setAudioVoice(newVoice);
    if (isPlaying) {
      // Restart with new voice
      Speech.stop();
      setTimeout(() => startAudio(), 100);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getCurrentSentence = () => {
    if (currentSentenceIndex < sentences.length) {
      return sentences[currentSentenceIndex];
    }
    return 'Audio completed';
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0a0a0a" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        
        <View style={styles.headerCenter}>
          <Text style={styles.magazineTitle} numberOfLines={1}>
            {magazineData.name}
          </Text>
          <Text style={styles.audioSubtitle}>
            Audio Player
          </Text>
        </View>
        
        <TouchableOpacity style={styles.settingsButton}>
          <Ionicons name="settings-outline" size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Current Text Display */}
        <View style={styles.currentTextContainer}>
          <Text style={styles.currentTextLabel}>Currently Reading:</Text>
          <Text style={styles.currentText}>
            {getCurrentSentence()}
          </Text>
        </View>

        {/* Progress Section */}
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Progress</Text>
            <Text style={styles.progressText}>
              {currentTime} / {totalDuration} sentences
            </Text>
          </View>
          
          <View style={styles.progressBar}>
            <Animated.View 
              style={[
                styles.progressFill,
                { width: progressAnimation.interpolate({
                  inputRange: [0, 100],
                  outputRange: ['0%', '100%'],
                })}
              ]} 
            />
          </View>
          
          <View style={styles.seekButtons}>
            {[0, 25, 50, 75, 100].map((position) => (
              <TouchableOpacity
                key={position}
                style={styles.seekButton}
                onPress={() => seekToPosition(position)}
              >
                <Text style={styles.seekButtonText}>{position}%</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Main Audio Controls */}
        <View style={styles.audioControls}>
          <View style={styles.mainControls}>
            <TouchableOpacity 
              style={styles.controlButton}
              onPress={stopAudio}
            >
              <Ionicons name="stop" size={24} color="#ffffff" />
            </TouchableOpacity>
            
            {!isPlaying ? (
              <TouchableOpacity 
                style={[styles.playButton, { transform: [{ scale: pulseAnimation }] }]}
                onPress={startAudio}
              >
                <Ionicons 
                  name={isPaused ? "play" : "play"} 
                  size={40} 
                  color="#ffffff" 
                />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity 
                style={styles.pauseButton}
                onPress={pauseAudio}
              >
                <Ionicons name="pause" size={40} color="#ffffff" />
              </TouchableOpacity>
            )}
            
            <TouchableOpacity 
              style={styles.controlButton}
              onPress={() => seekToPosition(Math.min(audioProgress + 10, 100))}
            >
              <Ionicons name="play-forward" size={24} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Speed Controls */}
        <View style={styles.controlSection}>
          <Text style={styles.sectionTitle}>Playback Speed</Text>
          <View style={styles.speedControls}>
            {[0.5, 0.75, 1.0, 1.25, 1.5, 2.0].map((speed) => (
              <TouchableOpacity
                key={speed}
                style={[
                  styles.speedButton,
                  { backgroundColor: audioSpeed === speed ? '#f59e0b' : '#2a2a2a' }
                ]}
                onPress={() => changeSpeed(speed)}
              >
                <Text style={[
                  styles.speedButtonText,
                  { color: audioSpeed === speed ? '#ffffff' : '#ffffff' }
                ]}>
                  {speed}x
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Voice Controls */}
        <View style={styles.controlSection}>
          <Text style={styles.sectionTitle}>Voice Selection</Text>
          <View style={styles.voiceControls}>
            {[
              { code: 'en-US', name: 'US English', flag: '🇺🇸' },
              { code: 'en-GB', name: 'UK English', flag: '🇬🇧' },
              { code: 'en-AU', name: 'Australian', flag: '🇦🇺' },
              { code: 'es-ES', name: 'Spanish', flag: '🇪🇸' },
              { code: 'fr-FR', name: 'French', flag: '🇫🇷' },
              { code: 'de-DE', name: 'German', flag: '🇩🇪' }
            ].map((voice) => (
              <TouchableOpacity
                key={voice.code}
                style={[
                  styles.voiceButton,
                  { backgroundColor: audioVoice === voice.code ? '#f59e0b' : '#2a2a2a' }
                ]}
                onPress={() => changeVoice(voice.code)}
              >
                <Text style={styles.voiceFlag}>{voice.flag}</Text>
                <Text style={[
                  styles.voiceButtonText,
                  { color: audioVoice === voice.code ? '#ffffff' : '#ffffff' }
                ]}>
                  {voice.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Audio Stats */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Audio Statistics</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{sentences.length}</Text>
              <Text style={styles.statLabel}>Total Sentences</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{Math.round(audioProgress)}%</Text>
              <Text style={styles.statLabel}>Completion</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{audioSpeed}x</Text>
              <Text style={styles.statLabel}>Current Speed</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {isPlaying ? 'Playing' : isPaused ? 'Paused' : 'Stopped'}
              </Text>
              <Text style={styles.statLabel}>Status</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#1a1a1a',
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#2a2a2a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 16,
  },
  magazineTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
  },
  audioSubtitle: {
    fontSize: 12,
    color: '#a3a3a3',
    marginTop: 2,
  },
  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#2a2a2a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  currentTextContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
    marginBottom: 24,
  },
  currentTextLabel: {
    fontSize: 14,
    color: '#a3a3a3',
    marginBottom: 8,
  },
  currentText: {
    fontSize: 16,
    color: '#ffffff',
    lineHeight: 24,
    textAlign: 'justify',
  },
  progressSection: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  progressLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  progressText: {
    fontSize: 14,
    color: '#a3a3a3',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#2a2a2a',
    borderRadius: 4,
    marginBottom: 16,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#f59e0b',
    borderRadius: 4,
  },
  seekButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  seekButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
  },
  seekButtonText: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '500',
  },
  audioControls: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
  },
  mainControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  controlButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2a2a2a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f59e0b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pauseButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f59e0b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlSection: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 16,
  },
  speedControls: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  speedButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    minWidth: 60,
    alignItems: 'center',
  },
  speedButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  voiceControls: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  voiceButton: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    minWidth: 100,
    alignItems: 'center',
  },
  voiceFlag: {
    fontSize: 20,
    marginBottom: 4,
  },
  voiceButtonText: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  statsSection: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    marginBottom: 40,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  statItem: {
    flex: 1,
    minWidth: 80,
    alignItems: 'center',
    paddingVertical: 16,
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#f59e0b',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#a3a3a3',
    textAlign: 'center',
  },
});

export default AudioPlayerScreen; 