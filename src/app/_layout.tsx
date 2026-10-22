import { DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { ServdColors } from '@/constants/servd-theme';

SplashScreen.preventAutoHideAsync();

const ServdNavTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: ServdColors.teal,
    background: ServdColors.background,
    card: ServdColors.background,
    text: ServdColors.text,
    border: ServdColors.border,
  },
};

export default function RootLayout() {
  return (
    <ThemeProvider value={ServdNavTheme}>
      <StatusBar style="dark" />
      <AnimatedSplashOverlay />
      <Stack
        screenOptions={{
          headerTintColor: ServdColors.teal,
          headerTitleStyle: { color: ServdColors.text },
          headerStyle: { backgroundColor: ServdColors.background },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: ServdColors.background },
        }}
      />
    </ThemeProvider>
  );
}
