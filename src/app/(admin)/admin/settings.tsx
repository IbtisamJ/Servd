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
import { Colors, Radius, Spacing } from "@/constants/theme";
import { ROLES } from "@/constants/roles";
import { useAuth } from "@/hooks/useAuth";

export default function AdminSettingsScreen() {
  const router = useRouter();
  const { user, profile, role, loading } = useAuth();

  const [signingOut, setSigningOut] = useState(false);

  // Sign out through Firebase Authentication.
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

              // Replace the current screen so Back does not return to settings.
              router.replace("/login" as never);
            } catch (error) {
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

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
        <Text style={styles.secondaryText}>Loading settings...</Text>
      </View>
    );
  }

  // Prevent non-admin accounts from using the admin settings screen.
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
          onPress={() => router.replace("/login" as never)}
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

// Reusable row for account settings information.
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
