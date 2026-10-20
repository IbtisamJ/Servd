/**
 * Application Entry Screen
 *
 * Serves as the initial entry point when the application opens.
 * Redirects the user to the login screen so that authentication
 * can take place before accessing protected application areas.
 *
 * Responsibilities:
 * - Handles the initial application route.
 * - Redirects users to the login screen.
 * - Prevents the root route from remaining on an empty screen.
 *
 */

import { Redirect } from "expo-router";

export default function IndexScreen() {
  return <Redirect href="/login" />;
}
