/**
 * Placeholder Login Screen
 *
 * Handles user authentication using Firebase Authentication.
 * Collects the user's login credentials, submits the sign-in
 * request, and navigates authenticated users to the admin area
 * when appropriate.
 *
 * Responsibilities:
 * - Collects and validates login information.
 * - Authenticates users through Firebase.
 * - Handles authentication errors and unsuccessful login attempts.
 * - Navigates users after successful authentication.
 *
 * Related Routes:
 * - /(admin)/admin
 */

import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { signInWithEmailAndPassword } from "firebase/auth";
import { Redirect, useRouter } from "expo-router";

import { auth } from "@/config/firebase";
import { Colors, Radius, Spacing } from "@/constants/theme";
import { useAuth } from "@/hooks/useAuth";

export default function LoginScreen() {
  const router = useRouter();
  const { user, profile, role, loading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [signingIn, setSigningIn] = useState(false);

  // If an admin is already signed in, go straight to the admin dashboard.
  if (!loading && user && profile && role === "admin") {
    return <Redirect href="/(admin)/admin" />;
  }

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert("Missing details", "Enter your email and password.");
      return;
    }

    try {
      setSigningIn(true);
      await signInWithEmailAndPassword(auth, email.trim(), password);

      // useAuth listens for the profile and the admin layout handles access.
      // If your admin dashboard route differs, update the redirect above.
      router.replace("/(admin)/admin");
    } catch (error) {
      console.error("Login failed:", error);
      Alert.alert(
        "Login failed",
        "Check your email and password, and make sure this account exists in Firebase Authentication."
      );
    } finally {
      setSigningIn(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>Servd</Text>
      <Text style={styles.heading}>Welcome back</Text>
      <Text style={styles.subtitle}>Temporary login for testing.</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor={Colors.light.textSecondary}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor={Colors.light.textSecondary}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoCapitalize="none"
      />

      <TouchableOpacity
        style={[styles.button, signingIn && styles.disabledButton]}
        onPress={handleLogin}
        disabled={signingIn}
      >
        {signingIn ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.buttonText}>Sign in</Text>
        )}
      </TouchableOpacity>

      {loading && (
        <Text style={styles.loadingText}>Checking your session...</Text>
      )}

      <Text style={styles.note}>
        Temporary screen — remove it after testing.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: Colors.light.background,
    padding: Spacing.four,
    gap: Spacing.three,
  },
  logo: {
    color: Colors.light.primary,
    fontSize: 36,
    fontWeight: "800",
    textAlign: "center",
  },
  heading: {
    color: Colors.light.text,
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
  },
  subtitle: {
    color: Colors.light.textSecondary,
    fontSize: 14,
    textAlign: "center",
    marginBottom: Spacing.two,
  },
  input: {
    backgroundColor: Colors.light.backgroundElement,
    color: Colors.light.text,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    fontSize: 16,
  },
  button: {
    backgroundColor: Colors.light.primary,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.three,
    minHeight: 50,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  disabledButton: {
    opacity: 0.6,
  },
  loadingText: {
    color: Colors.light.textSecondary,
    textAlign: "center",
  },
  note: {
    color: Colors.light.textSecondary,
    fontSize: 12,
    textAlign: "center",
    marginTop: Spacing.two,
  },
});