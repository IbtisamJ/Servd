/**
 * Root Application Layout
 *
 * Provides the main layout shared across the application.
 * Sets up the theme provider and Expo Router's Slot component
 * so that the appropriate screen is displayed based on the
 * current navigation route.
 *
 * Responsibilities:
 * - Provides shared theme context to application screens.
 * - Renders the active route using Expo Router.
 * - Establishes the root structure for application navigation.
 */

import { DarkTheme, DefaultTheme, ThemeProvider, Slot } from "expo-router";
import { useColorScheme } from "react-native";

export default function Layout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Slot />
    </ThemeProvider>
  );
}
