/**
 * Provides password reset functionality for Servd:
 * - Sends reset link via Firebase Auth
 * - Displays success/error feedback
 * - Includes loading state and navigation back to Login
 */

import { useRouter } from "expo-router";
import { sendPasswordResetEmail } from "firebase/auth";
import { useState } from "react";
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { auth } from "../config/firebase";
import { Colors } from "../constants/theme";

export default function ResetPassword() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Trigger Firebase password reset email
  const handleResetPassword = async () => {
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail) {
      setError("Please enter your email address.");
      setMessage("");
      return;
    }

    setError("");
    setMessage("");
    setLoading(true);

    try {
      await sendPasswordResetEmail(auth, trimmedEmail);

      // Generic message protects account privacy
      setMessage(
        "If an account exists for this email, you'll receive a password reset link shortly. Please check your inbox and spam folder.",
      );
      setEmail("");
    } catch (err: any) {
      console.error("Password reset error:", err.code ?? err.message);

      // Handle common Firebase Auth errors
      switch (err.code) {
        case "auth/invalid-email":
          setError("Please enter a valid email address.");
          break;

        case "auth/too-many-requests":
          setError("Too many attempts. Please wait a while and try again.");
          break;

        case "auth/network-request-failed":
          setError(
            "Unable to connect. Check your internet connection and try again.",
          );
          break;

        default:
          setError("Something went wrong. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Servd branding */}
      <View style={styles.logoContainer}>
        <Image
          source={require("../../assets/images/Servd_Logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      <Text style={styles.title}>Forgot Password?</Text>

      <Text style={styles.description}>
        Enter the email address linked to your Servd account and we'll send you
        instructions to reset your password.
      </Text>

      <TextInput
        placeholder="Email address"
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        value={email}
        onChangeText={setEmail}
        placeholderTextColor={Colors.light.textSecondary}
        editable={!loading}
        accessibilityLabel="Email address"
      />

      {error ? (
        <Text accessibilityRole="alert" style={styles.error}>
          {error}
        </Text>
      ) : null}

      {message ? (
        <Text accessibilityRole="alert" style={styles.success}>
          {message}
        </Text>
      ) : null}

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleResetPassword}
        disabled={loading}
        accessibilityRole="button"
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>SEND RESET LINK</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.replace("/Login")}
        disabled={loading}
        accessibilityRole="button"
      >
        <Text style={styles.backText}>Back to Login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
    justifyContent: "center",
    paddingHorizontal: 24,
  },

  logoContainer: {
    alignItems: "center",
    marginBottom: 24,
  },

  logo: {
    width: 120,
    height: 120,
  },

  title: {
    fontSize: 24,
    fontWeight: "600",
    textAlign: "center",
    color: Colors.light.text,
    marginBottom: 12,
  },

  description: {
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
    color: Colors.light.textSecondary,
    marginBottom: 28,
  },

  input: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#ddd",
    color: Colors.light.text,
  },

  button: {
    backgroundColor: Colors.light.secondary,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 4,
  },

  buttonDisabled: {
    opacity: 0.7,
  },

  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
  },

  error: {
    color: Colors.light.error,
    textAlign: "center",
    marginBottom: 12,
    fontSize: 13,
  },

  success: {
    color: Colors.light.secondary,
    textAlign: "center",
    marginBottom: 12,
    fontSize: 13,
    lineHeight: 19,
  },

  backButton: {
    alignItems: "center",
    marginTop: 24,
    padding: 8,
  },

  backText: {
    color: Colors.light.secondary,
    fontWeight: "600",
    fontSize: 14,
  },
});
