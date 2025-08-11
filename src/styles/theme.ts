import { responsive } from './responsive';
import { Platform, Dimensions } from 'react-native';
import { responsiveHeight, responsiveWidth } from './responsive';

export const colors = {
  // Primary colors
  primary: '#f59e0b',
  primaryLight: '#fbbf24',
  primaryDark: '#d97706',
  
  // Background colors
  background: '#0a0a0a',
  surface: '#1a1a1a',
  surfaceLight: '#2a2a2a',
  surfaceLighter: '#3a3a3a',
  
  // Text colors
  text: '#ffffff',
  textSecondary: '#e5e5e5',
  textTertiary: '#a3a3a3',
  textDisabled: '#6b7280',
  
  // Accent colors
  accent: '#3b82f6',
  accentLight: '#60a5fa',
  accentDark: '#1d4ed8',
  
  // Status colors
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#06b6d4',
  
  // Category colors
  category: {
    newspapers: '#3b82f6',
    transport: '#1e40af',
    animals: '#ec4899',
    art: '#059669',
    boats: '#7c3aed',
    business: '#dc2626',
    cars: '#0ea5e9',
    entertainment: '#1e40af',
    comics: '#f59e0b',
    craft: '#0891b2',
    food: '#f97316',
    gardening: '#16a34a',
    health: '#e11d48',
    history: '#8b5cf6',
    home: '#059669',
    music: '#f59e0b',
    science: '#0ea5e9',
    sports: '#dc2626',
    travel: '#0891b2',
    womens: '#ec4899',
  },
  
  // Gradient colors
  gradients: {
    primary: ['#f59e0b', '#fbbf24'],
    secondary: ['#3b82f6', '#60a5fa'],
    dark: ['#1a1a1a', '#2a2a2a'],
    surface: ['#2a2a2a', '#1a1a1a'],
  },
};

export const typography = {
  // Font families
  fontFamily: {
    regular: Platform.OS === 'ios' ? 'SF Pro Display' : 'Roboto',
    medium: Platform.OS === 'ios' ? 'SF Pro Display' : 'Roboto',
    bold: Platform.OS === 'ios' ? 'SF Pro Display' : 'Roboto',
    light: Platform.OS === 'ios' ? 'SF Pro Display' : 'Roboto',
  },
  
  // Font sizes
  fontSize: {
    xs: responsive.small,
    sm: responsive.caption,
    base: responsive.body,
    lg: responsive.h6,
    xl: responsive.h5,
    '2xl': responsive.h4,
    '3xl': responsive.h3,
    '4xl': responsive.h2,
    '5xl': responsive.h1,
  },
  
  // Font weights
  fontWeight: {
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },
  
  // Line heights
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
  
  // Letter spacing
  letterSpacing: {
    tight: -0.5,
    normal: 0,
    wide: 0.5,
    wider: 1,
  },
};

export const spacing = {
  // Base spacing units
  xs: responsive.xs,
  sm: responsive.sm,
  md: responsive.md,
  lg: responsive.lg,
  xl: responsive.xl,
  xxl: responsive.xxl,
  
  // Component-specific spacing
  component: {
    padding: responsive.md,
    margin: responsive.md,
    gap: responsive.sm,
  },
  
  // Layout spacing
  layout: {
    screen: responsive.md,
    section: responsive.lg,
    card: responsive.md,
    button: responsive.sm,
  },
};

export const borderRadius = {
  // Base border radius
  xs: responsive.borderRadius.xs,
  sm: responsive.borderRadius.sm,
  md: responsive.borderRadius.md,
  lg: responsive.borderRadius.lg,
  xl: responsive.borderRadius.xl,
  xxl: responsive.borderRadius.xxl,
  full: 9999,
  
  // Component-specific border radius
  component: {
    button: responsive.borderRadius.md,
    card: responsive.borderRadius.lg,
    input: responsive.borderRadius.md,
    modal: responsive.borderRadius.xl,
  },
};

export const shadows = {
  // Elevation shadows
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.25,
    shadowRadius: 25,
    elevation: 12,
  },
};

export const transitions = {
  // Animation durations
  duration: {
    fast: 150,
    normal: 300,
    slow: 500,
  },
  
  // Animation easing
  easing: {
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
  },
};

export const layout = {
  // Screen dimensions
  screen: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  
  // Breakpoints
  breakpoints: {
    xs: 320,
    sm: 375,
    md: 414,
    lg: 768,
    xl: 1024,
  },
  
  // Grid system
  grid: {
    columns: 12,
    gutter: responsive.md,
    margin: responsive.md,
  },
  
  // Component dimensions
  component: {
    button: {
      height: responsiveHeight(6),
      minWidth: responsiveWidth(20),
    },
    input: {
      height: responsiveHeight(6),
      minWidth: responsiveWidth(60),
    },
    card: {
      minHeight: responsiveHeight(20),
    },
  },
};

// Theme object
export const theme = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  transitions,
  layout,
  
  // Utility functions
  utils: {
    // Color utilities
    getCategoryColor: (category: string) => {
      const normalizedCategory = category.toLowerCase().replace(/\s+/g, '');
      return colors.category[normalizedCategory as keyof typeof colors.category] || colors.primary;
    },
    
    // Spacing utilities
    getSpacing: (size: keyof typeof spacing) => spacing[size],
    
    // Typography utilities
    getFontSize: (size: keyof typeof typography.fontSize) => typography.fontSize[size],
    getFontWeight: (weight: keyof typeof typography.fontWeight) => typography.fontWeight[weight],
    
    // Shadow utilities
    getShadow: (level: keyof typeof shadows) => shadows[level],
    
    // Border radius utilities
    getBorderRadius: (size: keyof typeof borderRadius) => borderRadius[size],
  },
};

// Type definitions
export type Theme = typeof theme;
export type Colors = typeof colors;
export type Typography = typeof typography;
export type Spacing = typeof spacing;
export type BorderRadius = typeof borderRadius;
export type Shadows = typeof shadows;
export type Transitions = typeof transitions;
export type Layout = typeof layout;

export default theme; 