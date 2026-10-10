/**
 * NGO Welcome screen:
 * - Shown after registration while verification is pending
 * - Displays application status and next steps
 * - Provides logout functionality with error handling
 */

import { useRouter } from "expo-router";
import { signOut } from "firebase/auth";
import { useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { auth } from "../config/firebase";
import { Colors, Fonts, Radius, Spacing } from "../constants/theme";

export default function NGOWelcome() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setErrorMessage("");
    setLoggingOut(true);

    try {
      await signOut(auth);
      router.replace("/Login");
    } catch {
      setErrorMessage("Unable to log out. Please try again.");
      setLoggingOut(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Image
          source={require("../../assets/images/Servd_Logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />

        <View style={styles.statusBadge}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>APPLICATION IN REVIEW</Text>
        </View>

        <Text style={styles.heading}>You're almost{"\n"}part of Servd.</Text>

        <Text style={styles.description}>
          Thanks for joining us! Your NGO registration is with our administrator
          for verification.
        </Text>

        <View style={styles.infoCard}>
          <View style={styles.infoAccent} />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>What happens next?</Text>
            <Text style={styles.infoDescription}>
              Please allow up to 7 days for verification. Once approved, log in
              again to access your NGO dashboard.
            </Text>
          </View>
        </View>

        {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}

        <TouchableOpacity
          style={[styles.logoutButton, loggingOut && styles.disabledButton]}
          onPress={handleLogout}
          disabled={loggingOut}
          activeOpacity={0.8}
        >
          <Text style={styles.logoutText}>
            {loggingOut ? "Logging out..." : "Log Out"}
          </Text>
        </TouchableOpacity>

        <Text style={styles.footer}>
          Good things happen when we work together.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
    justifyContent: "center",
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
  },
  content: {
    width: "100%",
    maxWidth: 420,
    alignSelf: "center",
    alignItems: "center",
  },
  logo: {
    width: 170,
    height: 90,
    marginBottom: Spacing.five,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.backgroundElement,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    marginBottom: Spacing.three,
    gap: Spacing.two,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.light.accent,
  },
  statusText: {
    fontFamily: Fonts.button,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    color: Colors.light.text,
  },
  heading: {
    fontFamily: Fonts.heading,
    fontSize: 32,
    lineHeight: 40,
    color: Colors.light.text,
    textAlign: "center",
    marginBottom: Spacing.three,
  },
  description: {
    fontFamily: Fonts.body,
    fontSize: 15,
    lineHeight: 23,
    color: Colors.light.textSecondary,
    textAlign: "center",
    marginBottom: Spacing.four,
    maxWidth: 330,
  },
  infoCard: {
    width: "100%",
    flexDirection: "row",
    backgroundColor: Colors.light.backgroundElement,
    borderRadius: Radius.lg,
    overflow: "hidden",
    marginBottom: Spacing.four,
  },
  infoAccent: {
    width: 4,
    backgroundColor: Colors.light.secondary,
  },
  infoContent: {
    flex: 1,
    padding: Spacing.three,
  },
  infoTitle: {
    fontFamily: Fonts.heading,
    fontSize: 17,
    color: Colors.light.text,
    marginBottom: Spacing.two,
  },
  infoDescription: {
    fontFamily: Fonts.body,
    fontSize: 14,
    lineHeight: 22,
    color: Colors.light.textSecondary,
  },
  logoutButton: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.three,
    backgroundColor: Colors.light.primary,
    borderRadius: Radius.md,
  },
  disabledButton: {
    opacity: 0.6,
  },
  logoutText: {
    fontFamily: Fonts.button,
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  error: {
    fontFamily: Fonts.body,
    color: Colors.light.error,
    fontSize: 13,
    textAlign: "center",
    marginBottom: Spacing.three,
  },
  footer: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: Colors.light.textSecondary,
    textAlign: "center",
    marginTop: Spacing.four,
  },
});
