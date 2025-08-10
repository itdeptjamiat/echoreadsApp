import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

interface LoadingSpinnerProps {
  message?: string;
  size?: 'small' | 'medium' | 'large';
  type?: 'default' | 'pulse' | 'wave' | 'dots';
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = 'Loading...',
  size = 'medium',
  type = 'default'
}) => {
  const spinValue = useRef(new Animated.Value(0)).current;
  const scaleValue = useRef(new Animated.Value(0.8)).current;
  const opacityValue = useRef(new Animated.Value(0)).current;
  const pulseValue = useRef(new Animated.Value(1)).current;
  const waveValues = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;
  const dotValues = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;

  useEffect(() => {
    // Fade in animation
    const fadeAnimation = Animated.timing(opacityValue, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    });

    fadeAnimation.start();

    if (type === 'default') {
      // Spin animation
      const spinAnimation = Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        })
      );

      // Scale animation
      const scaleAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(scaleValue, {
            toValue: 1.1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(scaleValue, {
            toValue: 0.9,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );

      spinAnimation.start();
      scaleAnimation.start();

      return () => {
        spinAnimation.stop();
        scaleAnimation.stop();
      };
    } else if (type === 'pulse') {
      // Pulse animation
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseValue, {
            toValue: 1.2,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(pulseValue, {
            toValue: 0.8,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      );

      pulseAnimation.start();

      return () => {
        pulseAnimation.stop();
      };
    } else if (type === 'wave') {
      // Wave animation
      const waveAnimations = waveValues.map((value, index) =>
        Animated.loop(
          Animated.sequence([
            Animated.timing(value, {
              toValue: 1,
              duration: 600,
              delay: index * 200,
              useNativeDriver: true,
            }),
            Animated.timing(value, {
              toValue: 0,
              duration: 600,
              useNativeDriver: true,
            }),
          ])
        )
      );

      waveAnimations.forEach(animation => animation.start());

      return () => {
        waveAnimations.forEach(animation => animation.stop());
      };
    } else if (type === 'dots') {
      // Dots animation
      const dotAnimations = dotValues.map((value, index) =>
        Animated.loop(
          Animated.sequence([
            Animated.timing(value, {
              toValue: 1,
              duration: 400,
              delay: index * 200,
              useNativeDriver: true,
            }),
            Animated.timing(value, {
              toValue: 0,
              duration: 400,
              useNativeDriver: true,
            }),
          ])
        )
      );

      dotAnimations.forEach(animation => animation.start());

      return () => {
        dotAnimations.forEach(animation => animation.stop());
      };
    }
  }, [type]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const getSize = () => {
    switch (size) {
      case 'small':
        return Math.max(60, width * 0.15);
      case 'large':
        return Math.max(120, width * 0.3);
      default:
        return Math.max(80, width * 0.2);
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'small':
        return Math.max(24, width * 0.06);
      case 'large':
        return Math.max(48, width * 0.12);
      default:
        return Math.max(32, width * 0.08);
    }
  };

  const getFontSize = () => {
    switch (size) {
      case 'small':
        return Math.max(14, width * 0.035);
      case 'large':
        return Math.max(20, width * 0.05);
      default:
        return Math.max(16, width * 0.04);
    }
  };

  const renderDefaultSpinner = () => (
    <Animated.View
      style={[
        styles.spinner,
        {
          width: getSize(),
          height: getSize(),
          opacity: opacityValue,
          transform: [
            { scale: scaleValue },
            { rotate: spin }
          ]
        }
      ]}
    >
      <LinearGradient
        colors={['#f59e0b', '#fbbf24', '#f59e0b']}
        style={[styles.gradientSpinner, { width: getSize(), height: getSize() }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.iconContainer}>
          <Ionicons
            name="book"
            size={getIconSize()}
            color="#0a0a0a"
          />
        </View>
      </LinearGradient>
    </Animated.View>
  );

  const renderPulseSpinner = () => (
    <Animated.View
      style={[
        styles.pulseContainer,
        {
          opacity: opacityValue,
          transform: [{ scale: pulseValue }]
        }
      ]}
    >
      <View style={[styles.pulseCircle, { width: getSize(), height: getSize() }]}>
        <Ionicons
          name="book"
          size={getIconSize()}
          color="#f59e0b"
        />
      </View>
    </Animated.View>
  );

  const renderWaveSpinner = () => (
    <Animated.View
      style={[
        styles.waveContainer,
        { opacity: opacityValue }
      ]}
    >
      {waveValues.map((value, index) => (
        <Animated.View
          key={index}
          style={[
            styles.waveBar,
            {
              opacity: value,
              transform: [{ scaleY: value }]
            }
          ]}
        />
      ))}
    </Animated.View>
  );

  const renderDotsSpinner = () => (
    <Animated.View
      style={[
        styles.dotsContainer,
        { opacity: opacityValue }
      ]}
    >
      {dotValues.map((value, index) => (
        <Animated.View
          key={index}
          style={[
            styles.dot,
            {
              opacity: value,
              transform: [{ scale: value }]
            }
          ]}
        />
      ))}
    </Animated.View>
  );

  const renderSpinner = () => {
    switch (type) {
      case 'pulse':
        return renderPulseSpinner();
      case 'wave':
        return renderWaveSpinner();
      case 'dots':
        return renderDotsSpinner();
      default:
        return renderDefaultSpinner();
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['rgba(0,0,0,0.8)', 'rgba(0,0,0,0.9)']}
        style={styles.overlay}
      />

      <Animated.View
        style={[
          styles.loaderContainer,
          {
            opacity: opacityValue,
          }
        ]}
      >
        {renderSpinner()}

        <Text style={[styles.message, { fontSize: getFontSize() }]}>
          {message}
        </Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  loaderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Math.max(32, width * 0.08),
    borderRadius: 20,
    backgroundColor: 'rgba(45, 45, 45, 0.95)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  spinner: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Math.max(16, height * 0.02),
  },
  gradientSpinner: {
    borderRadius: Math.max(40, width * 0.1),
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Math.max(16, height * 0.02),
  },
  pulseCircle: {
    borderRadius: Math.max(40, width * 0.1),
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#f59e0b',
  },
  waveContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Math.max(16, height * 0.02),
  },
  waveBar: {
    width: 4,
    height: 40,
    backgroundColor: '#f59e0b',
    marginHorizontal: 2,
    borderRadius: 2,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Math.max(16, height * 0.02),
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#f59e0b',
    marginHorizontal: 4,
  },
  message: {
    color: '#ffffff',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: Math.max(16, height * 0.02),
  },
});

export default LoadingSpinner; 