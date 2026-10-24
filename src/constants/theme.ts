import '@/global.css';
import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#333333',
    background: '#FFF8F0',        // Off-White
    backgroundElement: '#F0E6D2', // Warm Beige
    backgroundSelected: '#E0E1E6',
    textSecondary: '#60646C',
    primary: '#C62828',           // Red
    secondary: '#008080',         // Teal
    accent: '#7C9C44',            // Olive Green
    error: '#C62828',
  },
  dark: {
    text: '#ffffff',
    background: '#000000',
    backgroundElement: '#212225',
    backgroundSelected: '#2E3135',
    textSecondary: '#B0B4BA',
    primary: '#C62828',
    secondary: '#008080',
    accent: '#7C9C44',
    error: '#C62828',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = {
  heading: 'Lora',
  body: 'DM Sans',
  button: 'DM Sans',
  card: 'DM Sans',
  navigation: 'DM Sans',
};

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const Radius = {
  sm: 4,
  md: 8,
  lg: 12,
};

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;