import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

interface BeautifulAlertProps {
  visible: boolean;
  title: string;
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
}

const BeautifulAlert: React.FC<BeautifulAlertProps> = ({
  visible,
  title,
  message,
  type,
  onClose,
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return 'checkmark-circle';
      case 'error':
        return 'close-circle';
      case 'info':
        return 'information-circle';
      default:
        return 'information-circle';
    }
  };

  const getColors = () => {
    switch (type) {
      case 'success':
        return ['#10b981', '#059669'];
      case 'error':
        return ['#ef4444', '#dc2626'];
      case 'info':
        return ['#3b82f6', '#1d4ed8'];
      default:
        return ['#6b7280', '#4b5563'];
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return 'rgba(16, 185, 129, 0.1)';
      case 'error':
        return 'rgba(239, 68, 68, 0.1)';
      case 'info':
        return 'rgba(59, 130, 246, 0.1)';
      default:
        return 'rgba(107, 114, 128, 0.1)';
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <Animated.View
        style={[
          styles.overlay,
          {
            opacity: opacityAnim,
          },
        ]}
      >
        <Animated.View
          style={[
            styles.alertContainer,
            {
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <LinearGradient
            colors={getColors() as [string, string]}
            style={styles.iconContainer}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name={getIcon() as any} size={32} color="#ffffff" />
          </LinearGradient>

          <View style={styles.content}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.message}>{message}</Text>
          </View>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: getBackgroundColor() }]}
            onPress={onClose}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>OK</Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Math.max(20, width * 0.05),
  },
  alertContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    padding: Math.max(24, width * 0.06),
    alignItems: 'center',
    maxWidth: Math.max(300, width * 0.8),
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  iconContainer: {
    width: Math.max(64, width * 0.16),
    height: Math.max(64, width * 0.16),
    borderRadius: Math.max(32, width * 0.08),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Math.max(16, height * 0.02),
  },
  content: {
    alignItems: 'center',
    marginBottom: Math.max(20, height * 0.025),
  },
  title: {
    fontSize: Math.max(20, width * 0.05),
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: Math.max(8, height * 0.01),
    textAlign: 'center',
  },
  message: {
    fontSize: Math.max(16, width * 0.04),
    color: '#e5e5e5',
    textAlign: 'center',
    lineHeight: 22,
  },
  button: {
    paddingHorizontal: Math.max(24, width * 0.06),
    paddingVertical: Math.max(12, height * 0.015),
    borderRadius: 12,
    minWidth: Math.max(100, width * 0.25),
    alignItems: 'center',
  },
  buttonText: {
    fontSize: Math.max(16, width * 0.04),
    fontWeight: '600',
    color: '#ffffff',
  },
});

export default BeautifulAlert; 