import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Animated,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

interface BeautifulToastProps {
  visible: boolean;
  message: string;
  type: 'success' | 'error' | 'info';
  onHide: () => void;
  duration?: number;
}

const BeautifulToast: React.FC<BeautifulToastProps> = ({
  visible,
  message,
  type,
  onHide,
  duration = 3000,
}) => {
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Show toast
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto hide after duration
      const timer = setTimeout(() => {
        hideToast();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  const hideToast = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onHide();
    });
  };

  const getToastColors = () => {
    switch (type) {
      case 'success':
        return {
          gradient: ['#0a0a0a', '#1a1a1a'] as [string, string],
          backgroundColor: '#1a1a1a',
          icon: 'checkmark-circle',
          iconColor: '#10b981',
          textColor: '#ffffff',
          borderColor: '#10b981',
        };
      case 'error':
        return {
          gradient: ['#0a0a0a', '#1a1a1a'] as [string, string],
          backgroundColor: '#1a1a1a',
          icon: 'close-circle',
          iconColor: '#ef4444',
          textColor: '#ffffff',
          borderColor: '#ef4444',
        };
      case 'info':
        return {
          gradient: ['#0a0a0a', '#1a1a1a'] as [string, string],
          backgroundColor: '#1a1a1a',
          icon: 'information-circle',
          iconColor: '#3b82f6',
          textColor: '#ffffff',
          borderColor: '#3b82f6',
        };
      default:
        return {
          gradient: ['#0a0a0a', '#1a1a1a'] as [string, string],
          backgroundColor: '#1a1a1a',
          icon: 'information-circle',
          iconColor: '#6b7280',
          textColor: '#ffffff',
          borderColor: '#6b7280',
        };
    }
  };

  const colors = getToastColors();

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY }],
          opacity,
        },
      ]}
    >
      <View style={[
        styles.toast, 
        { 
          backgroundColor: colors.backgroundColor,
          borderColor: colors.borderColor,
        }
      ]}>
        <View style={styles.content}>
          <Ionicons
            name={colors.icon as any}
            size={24}
            color={colors.iconColor}
            style={styles.icon}
          />
          <Text style={[styles.message, { color: colors.textColor }]}>{message}</Text>
        </View>
        <TouchableOpacity onPress={hideToast} style={styles.closeButton}>
          <Ionicons name="close" size={20} color={colors.textColor} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    zIndex: 9999,
  },
  toast: {
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 12,
    borderWidth: 2,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 12,
  },
  message: {
    fontSize: Math.max(16, width * 0.04),
    fontWeight: '600',
    flex: 1,
  },
  closeButton: {
    padding: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
});

export default BeautifulToast; 