import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
} from 'react-native-reanimated';
import { useTheme } from '../../hooks/useTheme';

export interface CustomButtonProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
  size?: 'small' | 'medium' | 'large';
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const CustomButton: React.FC<CustomButtonProps> = ({
  title,
  variant = 'primary',
  size = 'medium',
  onPress,
  disabled = false,
  loading = false,
  style,
  textStyle,
}) => {
  const theme = useTheme();
  
  // Animation values
  const scale = useSharedValue(1);
  const pressed = useSharedValue(false);
  
  // Animated styles
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: scale.value },
      ],
    };
  });
  
  // Handle press animations
  const handlePressIn = () => {
    if (!disabled && !loading) {
      scale.value = withSpring(0.95, { damping: 15, stiffness: 100 });
      pressed.value = true;
    }
  };
  
  const handlePressOut = () => {
    if (!disabled && !loading) {
      scale.value = withSpring(1, { damping: 15, stiffness: 100 });
      pressed.value = false;
    }
  };
  
  // Get button styles based on variant and size
  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'row',
    };
    
    // Size styles
    switch (size) {
      case 'small':
        baseStyle.paddingHorizontal = 16;
        baseStyle.paddingVertical = 8;
        baseStyle.minHeight = 36;
        break;
      case 'medium':
        baseStyle.paddingHorizontal = 24;
        baseStyle.paddingVertical = 12;
        baseStyle.minHeight = 48;
        break;
      case 'large':
        baseStyle.paddingHorizontal = 32;
        baseStyle.paddingVertical = 16;
        baseStyle.minHeight = 56;
        break;
    }
    
    // Variant styles
    switch (variant) {
      case 'primary':
        baseStyle.backgroundColor = disabled ? theme.colors.surfaceLight : theme.colors.primary;
        break;
      case 'secondary':
        baseStyle.backgroundColor = disabled ? theme.colors.surfaceLight : theme.colors.primaryLight;
        break;
      case 'ghost':
        baseStyle.backgroundColor = 'transparent';
        break;
      case 'outline':
        baseStyle.backgroundColor = 'transparent';
        baseStyle.borderWidth = 2;
        baseStyle.borderColor = disabled ? theme.colors.surfaceLight : theme.colors.primary;
        break;
    }
    
    return baseStyle;
  };
  
  // Get text styles based on variant and size
  const getTextStyle = (): TextStyle => {
    const baseStyle: TextStyle = {
      fontWeight: '600',
      textAlign: 'center',
    };
    
    // Size styles
    switch (size) {
      case 'small':
        baseStyle.fontSize = 14;
        break;
      case 'medium':
        baseStyle.fontSize = 16;
        break;
      case 'large':
        baseStyle.fontSize = 18;
        break;
    }
    
    // Variant styles
    switch (variant) {
      case 'primary':
        baseStyle.color = disabled ? theme.colors.textTertiary : theme.colors.text;
        break;
      case 'secondary':
        baseStyle.color = disabled ? theme.colors.textTertiary : theme.colors.text;
        break;
      case 'ghost':
        baseStyle.color = disabled ? theme.colors.textTertiary : theme.colors.primary;
        break;
      case 'outline':
        baseStyle.color = disabled ? theme.colors.textTertiary : theme.colors.primary;
        break;
    }
    
    return baseStyle;
  };
  
  return (
    <Animated.View style={[animatedStyle]}>
      <TouchableOpacity
        style={[getButtonStyle(), style]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        activeOpacity={0.8}
      >
        {loading ? (
          <ActivityIndicator 
            size="small" 
            color={variant === 'ghost' ? theme.colors.primary : theme.colors.text} 
          />
        ) : (
          <Text style={[getTextStyle(), textStyle]}>
            {title}
          </Text>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

export default CustomButton; 