/**
 * Admin Settings Screen
 *
 * Provides the settings area for the administrator section.
 * Intended to contain administrative preferences and account-related
 * options supported by the application.
 *
 * Responsibilities:
 * - Displays available administrator settings.
 * - Provides access to supported account or application options.
 */

import FontAwesome5 from "@react-native-vector-icons/fontawesome5";
import { useRouter } from "expo-router";
import { signOut } from "firebase/auth";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { auth } from "@/config/firebase";
import { ROLES } from "@/constants/roles";
import { Colors, Radius, Spacing } from "@/constants/theme";
import { useAuth } from "@/hooks/useAuth";

export default function AdminSettingsScreen() {
  const router = useRouter();
  const { user, profile, role, loading } = useAuth();

  // Tracks whether the sign-out process is in progress.
  const [signingOut, setSigningOut] = useState(false);

  // Confirms the admin's choice before signing out of Firebase Authentication.
  const handleSignOut = () => {
    Alert.alert(
      "Sign out?",
      "Are you sure you want to sign out of the admin account?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Sign out",
          style: "destructive",
          onPress: async () => {
            try {
              setSigningOut(true);
              await signOut(auth);

              // Redirects to login and prevents returning to settings using Back.
              router.replace("/Login" as never);
            } catch (error) {
              // Displays an error message if signing out fails.
              console.error("Failed to sign out:", error);
              Alert.alert(
                "Sign out failed",
                "Please check your connection and try again."
              );
            } finally {
              setSigningOut(false);
            }
          },
        },
      ]
    );
  };

  // Shows a loading indicator while authentication details are being retrieved.
  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
        <Text style={styles.secondaryText}>Loading settings...</Text>
      </View>
    );
  }

  // Prevents users without a valid admin role and profile from accessing settings.
  if (!user || role !== ROLES.ADMIN || !profile) {
    return (
      <View style={styles.centered}>
        <FontAwesome5
          name="exclamation-circle"
          size={30}
          color={Colors.light.error}
          iconStyle="solid"
        />
        <Text style={styles.messageTitle}>Access unavailable</Text>
        <Text style={styles.secondaryText}>
          An authenticated admin account is required to view these settings.
        </Text>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.replace("/Login" as never)}
        >
          <Text style={styles.primaryButtonText}>Go to login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <Text style={styles.heading}>Settings</Text>
      <Text style={styles.subtitle}>
        Manage your admin account and session.
      </Text>

      {/* Displays the administrator's profile details. */}
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <FontAwesome5
            name="user-shield"
            size={30}
            color={Colors.light.primary}
            iconStyle="solid"
          />
        </View>

        <Text style={styles.name}>{profile.name}</Text>
        <Text style={styles.email}>{profile.email}</Text>

        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>Administrator</Text>
        </View>
      </View>

      {/* Shows the account information retrieved from the user profile. */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account information</Text>

        <SettingsRow
          icon="user"
          label="Name"
          value={profile.name}
        />
        <SettingsRow
          icon="envelope"
          label="Email"
          value={profile.email}
        />
        <SettingsRow
          icon="shield-alt"
          label="Role"
          value="Admin"
        />
        <SettingsRow
          icon="check-circle"
          label="Account status"
          value={profile.accountStatus}
        />
      </View>

      {/* Provides the option to sign out of the current admin session. */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Session</Text>
        <Text style={styles.description}>
          Sign out when you have finished managing Servd.
        </Text>

        <TouchableOpacity
          style={[
            styles.signOutButton,
            signingOut && styles.disabledButton,
          ]}
          onPress={handleSignOut}
          disabled={signingOut}
        >
          {signingOut ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <FontAwesome5
                name="sign-out-alt"
                size={16}
                color="#FFFFFF"
                iconStyle="solid"
              />
              <Text style={styles.signOutText}>Sign out</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <Text style={styles.footer}>Servd Admin</Text>
    </ScrollView>
  );
}

// Reusable row for displaying an account setting with its icon, label, and value.
function SettingsRow({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.settingsRow}>
      <View style={styles.rowIcon}>
        <FontAwesome5
          name={icon as never}
          size={16}
          color={Colors.light.secondary}
        />
      </View>

      <View style={styles.rowContent}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text selectable style={styles.rowValue}>
          {value}
        </Text>
      </View>
    </View>
  );
}

// Defines the styles for the settings screen and its components.
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  content: {
    padding: Spacing.three,
    paddingBottom: Spacing.six,
    gap: Spacing.three,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.light.background,
    padding: Spacing.four,
    gap: Spacing.three,
  },
  heading: {
    fontSize: 26,
    fontWeight: "700",
    color: Colors.light.text,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginTop: -Spacing.two,
  },
  profileCard: {
    alignItems: "center",
    backgroundColor: Colors.light.backgroundElement,
    borderRadius: Radius.lg,
    padding: Spacing.four,
    gap: Spacing.two,
  },
  avatar: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: Colors.light.background,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.one,
  },
  name: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.light.text,
    textAlign: "center",
  },
  email: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    textAlign: "center",
  },
  roleBadge: {
    backgroundColor: "#DDEFE4",
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    marginTop: Spacing.one,
  },
  roleText: {
    color: "#216E43",
    fontSize: 12,
    fontWeight: "700",
  },
  section: {
    backgroundColor: Colors.light.backgroundElement,
    borderRadius: Radius.lg,
    padding: Spacing.three,
    gap: Spacing.three,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: Colors.light.text,
  },
  settingsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.light.background,
  },
  rowContent: {
    flex: 1,
    gap: Spacing.one,
  },
  rowLabel: {
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  rowValue: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.light.text,
  },
  description: {
    color: Colors.light.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  signOutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.two,
    backgroundColor: Colors.light.error,
    borderRadius: Radius.md,
    padding: Spacing.three,
  },
  signOutText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  disabledButton: {
    opacity: 0.6,
  },
  primaryButton: {
    backgroundColor: Colors.light.primary,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  messageTitle: {
    color: Colors.light.text,
    fontSize: 20,
    fontWeight: "700",
  },
  secondaryText: {
    color: Colors.light.textSecondary,
    textAlign: "center",
    fontSize: 14,
    lineHeight: 20,
  },
  footer: {
    color: Colors.light.textSecondary,
    textAlign: "center",
    fontSize: 12,
    marginTop: Spacing.two,
  },
});