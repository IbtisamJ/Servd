/**
 * User Details and Account Management Screen
 *
 * Retrieves a selected user's profile from Firestore and
 * displays the account's identifying information, role, and status.
 * Allows authorised administrators to suspend or reactivate eligible
 * accounts by updating the accountStatus field.
 *
 * Responsibilities:
 * - Reads the current authentication role through the auth hook.
 * - Checks the current role before loading the user's details.
 * - Retrieves the selected user document from Firestore.
 * - Displays the user's name, email, role, account status, and ID.
 * - Allows administrators to suspend or reactivate non-admin accounts.
 * - Requests confirmation before changing account status.
 * - Updates accountStatus in Firestore.
 * - Handles loading, permission, missing-record, and update errors.
 */

import FontAwesome5 from "@react-native-vector-icons/fontawesome5";
import { useLocalSearchParams, useRouter } from "expo-router";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { db } from "@/config/firebase";
import { Colors, Radius, Spacing } from "@/constants/theme";
import { ACCOUNT_STATUS, COLLECTIONS, ROLES } from "@/constants/roles";
import { useAuth } from "@/hooks/useAuth";

type AdminUser = {
  userId: string;
  name: string;
  email: string;
  role: string;
  accountStatus: string;
};

export default function AdminUserDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { role: currentRole, loading: authLoading } = useAuth();

  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadUser = async () => {
    if (!id || Array.isArray(id)) {
      setError("Invalid user ID.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const userRef = doc(db, COLLECTIONS.USERS, id);
      const snapshot = await getDoc(userRef);

      if (!snapshot.exists()) {
        setUser(null);
        setError("This user could not be found.");
        return;
      }

      const data = snapshot.data();

      setUser({
        userId: data.userId ?? snapshot.id,
        name: data.name ?? "Unnamed user",
        email: data.email ?? "No email available",
        role: data.role ?? "unknown",
        accountStatus: data.accountStatus ?? "unknown",
      });
    } catch (err) {
      console.error("Failed to load user:", err);
      setError("Unable to load this user. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Load the selected user's Firestore profile.
  useEffect(() => {
    if (!authLoading) {
      if (currentRole !== ROLES.ADMIN) {
        setError("You must be an admin to view this page.");
        setLoading(false);
        return;
      }

      void loadUser();
    }
  }, [id, currentRole, authLoading]);

  // Only change accountStatus. The existing Firestore rules permit admins
  // to update this field without changing the other user permissions.
  const toggleAccountStatus = async () => {
    if (!id || Array.isArray(id) || !user || saving) return;

    if (currentRole !== ROLES.ADMIN) {
      Alert.alert("Access denied", "Only admins can change account status.");
      return;
    }

    const isActive = user.accountStatus === ACCOUNT_STATUS.ACTIVE;
    const nextStatus = isActive
      ? ACCOUNT_STATUS.SUSPENDED
      : ACCOUNT_STATUS.ACTIVE;

    Alert.alert(
      isActive ? "Suspend account?" : "Reactivate account?",
      isActive
        ? "This user will no longer be able to use their account normally."
        : "This user will be able to use their account again.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: isActive ? "Suspend" : "Reactivate",
          style: isActive ? "destructive" : "default",
          onPress: async () => {
            try {
              setSaving(true);

              await updateDoc(doc(db, COLLECTIONS.USERS, id), {
                accountStatus: nextStatus,
              });

              setUser((previous) =>
                previous
                  ? { ...previous, accountStatus: nextStatus }
                  : previous
              );
            } catch (err) {
              console.error("Failed to update account status:", err);
              Alert.alert(
                "Update failed",
                "The account status could not be changed. Check your permissions and connection."
              );
            } finally {
              setSaving(false);
            }
          },
        },
      ]
    );
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case ROLES.ADMIN:
        return "Admin";
      case ROLES.ENTERPRISE:
        return "Food enterprise";
      case ROLES.NGO:
        return "NGO";
      default:
        return "Unknown";
    }
  };

  const isActive = user?.accountStatus === ACCOUNT_STATUS.ACTIVE;

  if (authLoading || loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
        <Text style={styles.mutedText}>Loading user...</Text>
      </View>
    );
  }

  if (error || !user) {
    return (
      <View style={styles.container}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <FontAwesome5 name="arrow-left" size={16} color={Colors.light.text} iconStyle="solid"/>
          <Text style={styles.backText}>Back to users</Text>
        </TouchableOpacity>

        <View style={styles.messageCard}>
          <FontAwesome5
            name="exclamation-circle"
            size={28}
            color={Colors.light.error}
            iconStyle="solid"
          />
          <Text style={styles.messageText}>
            {error || "This user could not be found."}
          </Text>
          <TouchableOpacity style={styles.secondaryButton} onPress={loadUser}>
            <Text style={styles.secondaryButtonText}>Try again</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <FontAwesome5 name="arrow-left" size={16} color={Colors.light.text} iconStyle="solid"/>
        <Text style={styles.backText}>Back to users</Text>
      </TouchableOpacity>

      <Text style={styles.heading}>User details</Text>
      <Text style={styles.subtitle}>View and manage this account.</Text>

      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <FontAwesome5
            name="user"
            size={28}
            color={Colors.light.primary}
          />
        </View>

        <Text style={styles.userName}>{user.name}</Text>
        <Text style={styles.userEmail}>{user.email}</Text>

        <View
          style={[
            styles.statusBadge,
            isActive ? styles.activeBadge : styles.inactiveBadge,
          ]}
        >
          <Text
            style={[
              styles.statusText,
              isActive ? styles.activeText : styles.inactiveText,
            ]}
          >
            {user.accountStatus}
          </Text>
        </View>
      </View>

      <View style={styles.detailsCard}>
        <Text style={styles.sectionTitle}>Account information</Text>

        <DetailRow label="Name" value={user.name} />
        <DetailRow label="Email" value={user.email} />
        <DetailRow label="Role" value={getRoleLabel(user.role)} />
        <DetailRow label="Account status" value={user.accountStatus} />
        <DetailRow label="User ID" value={user.userId} />
      </View>

      {user.role !== ROLES.ADMIN && (
        <View style={styles.actionCard}>
          <Text style={styles.sectionTitle}>Account management</Text>
          <Text style={styles.actionDescription}>
            {isActive
              ? "Suspend this account to prevent normal access."
              : "Reactivate this account to restore normal access."}
          </Text>

          <TouchableOpacity
            style={[
              styles.actionButton,
              isActive ? styles.suspendButton : styles.reactivateButton,
              saving && styles.disabledButton,
            ]}
            onPress={toggleAccountStatus}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <FontAwesome5
                  name={isActive ? "ban" : "check-circle"}
                  size={16}
                  color="#FFFFFF"
                  iconStyle="solid"
                />
                <Text style={styles.actionButtonText}>
                  {isActive ? "Suspend account" : "Reactivate account"}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

// Reusable row for displaying a user field.
function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text selectable style={styles.detailValue}>
        {value}
      </Text>
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
    paddingBottom: Spacing.five,
    gap: Spacing.three,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.light.background,
    gap: Spacing.two,
    padding: Spacing.three,
  },
  mutedText: {
    color: Colors.light.textSecondary,
    fontSize: 14,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: Spacing.two,
    paddingVertical: Spacing.two,
  },
  backText: {
    color: Colors.light.text,
    fontSize: 14,
    fontWeight: "600",
  },
  heading: {
    color: Colors.light.text,
    fontSize: 26,
    fontWeight: "700",
  },
  subtitle: {
    color: Colors.light.textSecondary,
    fontSize: 14,
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
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.light.background,
    marginBottom: Spacing.one,
  },
  userName: {
    color: Colors.light.text,
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
  },
  userEmail: {
    color: Colors.light.textSecondary,
    fontSize: 14,
    textAlign: "center",
  },
  statusBadge: {
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    marginTop: Spacing.one,
  },
  activeBadge: {
    backgroundColor: "#DDEFE4",
  },
  inactiveBadge: {
    backgroundColor: "#F8DEDE",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "capitalize",
  },
  activeText: {
    color: "#216E43",
  },
  inactiveText: {
    color: "#9B2424",
  },
  detailsCard: {
    backgroundColor: Colors.light.backgroundElement,
    borderRadius: Radius.lg,
    padding: Spacing.three,
    gap: Spacing.three,
  },
  sectionTitle: {
    color: Colors.light.text,
    fontSize: 17,
    fontWeight: "700",
  },
  detailRow: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.light.textSecondary,
    paddingBottom: Spacing.two,
    gap: Spacing.one,
  },
  detailLabel: {
    color: Colors.light.textSecondary,
    fontSize: 12,
    fontWeight: "600",
  },
  detailValue: {
    color: Colors.light.text,
    fontSize: 14,
  },
  actionCard: {
    backgroundColor: Colors.light.backgroundElement,
    borderRadius: Radius.lg,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  actionDescription: {
    color: Colors.light.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.two,
    borderRadius: Radius.md,
    padding: Spacing.three,
    marginTop: Spacing.one,
  },
  suspendButton: {
    backgroundColor: Colors.light.error,
  },
  reactivateButton: {
    backgroundColor: Colors.light.secondary,
  },
  disabledButton: {
    opacity: 0.6,
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  messageCard: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.light.backgroundElement,
    borderRadius: Radius.lg,
    padding: Spacing.four,
    gap: Spacing.three,
    marginTop: Spacing.four,
  },
  messageText: {
    color: Colors.light.text,
    textAlign: "center",
    fontSize: 15,
  },
  secondaryButton: {
    backgroundColor: Colors.light.secondary,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
  },
  secondaryButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
});