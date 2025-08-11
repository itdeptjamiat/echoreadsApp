import { Dimensions, Platform, StatusBar } from 'react-native';

const { width, height } = Dimensions.get('window');

// Design base dimensions (based on iPhone 12 Pro)
const baseWidth = 390;
const baseHeight = 844;

// Responsive scaling functions
export const scale = (size: number) => (width / baseWidth) * size;
export const verticalScale = (size: number) => (height / baseHeight) * size;
export const moderateScale = (size: number, factor = 0.5) => size + (scale(size) - size) * factor;

// Responsive font sizes
export const responsiveFontSize = (size: number) => {
  const scaledSize = scale(size);
  return Math.max(Math.min(scaledSize, size * 1.5), size * 0.8);
};

// Responsive spacing
export const responsiveSpacing = (size: number) => {
  const scaledSize = scale(size);
  return Math.max(Math.min(scaledSize, size * 1.3), size * 0.7);
};

// Responsive dimensions
export const responsiveWidth = (percentage: number) => (width * percentage) / 100;
export const responsiveHeight = (percentage: number) => (height * percentage) / 100;

// Device type detection
export const isSmallDevice = width < 375;
export const isMediumDevice = width >= 375 && width < 414;
export const isLargeDevice = width >= 414;
export const isTablet = width >= 768;

// Platform-specific values
export const platformValue = {
  ios: (iosValue: any, androidValue: any) => Platform.OS === 'ios' ? iosValue : androidValue,
  android: (androidValue: any, iosValue: any) => Platform.OS === 'android' ? androidValue : iosValue,
};

// Safe area helpers
export const getStatusBarHeight = () => {
  if (Platform.OS === 'ios') {
    return StatusBar.currentHeight || 0;
  }
  return 0;
};

// Responsive breakpoints
export const breakpoints = {
  xs: 320,
  sm: 375,
  md: 414,
  lg: 768,
  xl: 1024,
};

// Responsive utilities
export const responsive = {
  // Font sizes
  h1: responsiveFontSize(32),
  h2: responsiveFontSize(28),
  h3: responsiveFontSize(24),
  h4: responsiveFontSize(20),
  h5: responsiveFontSize(18),
  h6: responsiveFontSize(16),
  body: responsiveFontSize(14),
  caption: responsiveFontSize(12),
  small: responsiveFontSize(10),

  // Spacing
  xs: responsiveSpacing(4),
  sm: responsiveSpacing(8),
  md: responsiveSpacing(16),
  lg: responsiveSpacing(24),
  xl: responsiveSpacing(32),
  xxl: responsiveSpacing(48),

  // Margins and paddings
  margin: {
    xs: responsiveSpacing(4),
    sm: responsiveSpacing(8),
    md: responsiveSpacing(16),
    lg: responsiveSpacing(24),
    xl: responsiveSpacing(32),
    xxl: responsiveSpacing(48),
  },

  padding: {
    xs: responsiveSpacing(4),
    sm: responsiveSpacing(8),
    md: responsiveSpacing(16),
    lg: responsiveSpacing(24),
    xl: responsiveSpacing(32),
    xxl: responsiveSpacing(48),
  },

  // Border radius
  borderRadius: {
    xs: responsiveSpacing(4),
    sm: responsiveSpacing(8),
    md: responsiveSpacing(12),
    lg: responsiveSpacing(16),
    xl: responsiveSpacing(20),
    xxl: responsiveSpacing(24),
  },

  // Icon sizes
  icon: {
    xs: responsiveSpacing(16),
    sm: responsiveSpacing(20),
    md: responsiveSpacing(24),
    lg: responsiveSpacing(32),
    xl: responsiveSpacing(40),
    xxl: responsiveSpacing(48),
  },
};

// Media query helpers
export const mediaQuery = {
  minWidth: (breakpoint: keyof typeof breakpoints) => width >= breakpoints[breakpoint],
  maxWidth: (breakpoint: keyof typeof breakpoints) => width < breakpoints[breakpoint],
  between: (min: keyof typeof breakpoints, max: keyof typeof breakpoints) => 
    width >= breakpoints[min] && width < breakpoints[max],
};

// Responsive style generator
export const createResponsiveStyle = (styles: any) => {
  return Object.keys(styles).reduce((acc, key) => {
    const value = styles[key];
    
    if (typeof value === 'number') {
      // Auto-scale numbers
      acc[key] = scale(value);
    } else if (typeof value === 'object' && value !== null) {
      // Recursively process nested objects
      acc[key] = createResponsiveStyle(value);
    } else {
      // Keep other values as-is
      acc[key] = value;
    }
    
    return acc;
  }, {} as any);
};

// Responsive text style generator
export const createResponsiveTextStyle = (baseSize: number, options: {
  minSize?: number;
  maxSize?: number;
  lineHeight?: number;
  fontWeight?: string;
} = {}) => {
  const { minSize = baseSize * 0.8, maxSize = baseSize * 1.5, lineHeight, fontWeight } = options;
  
  const fontSize = Math.max(minSize, Math.min(maxSize, responsiveFontSize(baseSize)));
  
  return {
    fontSize,
    lineHeight: lineHeight ? lineHeight * (fontSize / baseSize) : undefined,
    fontWeight,
  };
};

// Responsive spacing style generator
export const createResponsiveSpacingStyle = (baseSpacing: number, options: {
  minSpacing?: number;
  maxSpacing?: number;
} = {}) => {
  const { minSpacing = baseSpacing * 0.7, maxSpacing = baseSpacing * 1.3 } = options;
  
  const spacing = Math.max(minSpacing, Math.min(maxSpacing, responsiveSpacing(baseSpacing)));
  
  return {
    margin: spacing,
    padding: spacing,
  };
};

export default responsive; 