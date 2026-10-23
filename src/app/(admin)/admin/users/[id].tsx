/**
 * User Details and Account Management Screen
 *
 * Retrieves a selected user's profile from Firestore and displays
 * identifying information, role, and account status.
 * Allows authorised administrators to suspend or reactivate
 * eligible accounts.
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
import { ACCOUNT_STATUS, COLLECTIONS, ROLES } from "@/constants/roles";
import { Colors, Radius, Spacing } from "@/constants/theme";
import { useAuth } from "@/hooks/useAuth";

type AdminUser = {
  userId: string;
  name: string;
  email: string;
  role: string;
  accountStatus: string;
};

type IconName = React.ComponentProps<typeof FontAwesome5>["name"];

const colors = Colors.light;

export default function AdminUserDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { role: currentRole, loading: authLoading } = useAuth();

  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Load the selected user record from Firestore.
  const loadUser = async () => {
    if (!id || Array.isArray(id)) {
      setUser(null);
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
      setUser(null);
      setError("Unable to load this user. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Check administrator access before loading account details.
  useEffect(() => {
    if (authLoading) return;

    if (currentRole !== ROLES.ADMIN) {
      setUser(null);
      setError("You must be an admin to view this page.");
      setLoading(false);
      return;
    }

    void loadUser();
  }, [id, currentRole, authLoading]);

  // Confirm and apply account suspension or reactivation.
  const toggleAccountStatus = () => {
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
                  : previous,
              );

              Alert.alert(
                "Account updated",
                `The account has been ${
                  isActive ? "suspended" : "reactivated"
                }.`,
              );
            } catch (err) {
              console.error("Failed to update account status:", err);

              Alert.alert(
                "Update failed",
                "The account status could not be changed. Check your permissions and connection.",
              );
            } finally {
              setSaving(false);
            }
          },
        },
      ],
    );
  };

  // Convert stored role values into readable labels.
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

  // Match status labels and styling to the account's current state.
  const getStatusColors = (status: string) => {
    if (status === ACCOUNT_STATUS.ACTIVE) {
      return {
        backgroundColor: "#DDF0E8",
        color: "#216E43",
        icon: "check-circle" as IconName,
        label: "Active",
      };
    }

    if (status === ACCOUNT_STATUS.SUSPENDED) {
      return {
        backgroundColor: "#F6DEDA",
        color: "#A12B24",
        icon: "ban" as IconName,
        label: "Suspended",
      };
    }

    return {
      backgroundColor: "#E8E8E8",
      color: colors.textSecondary,
      icon: "info-circle" as IconName,
      label: status,
    };
  };

  if (authLoading || loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.secondary} />
        <Text style={styles.mutedText}>Loading user details...</Text>
      </View>
    );
  }

  if (error || !user) {
    return (
      <View style={styles.screen}>
        <View style={styles.errorContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            accessibilityRole="button"
          >
            <FontAwesome5
              name="arrow-left"
              size={15}
              color={colors.text}
              iconStyle="solid"
            />
            <Text style={styles.backText}>Back to users</Text>
          </TouchableOpacity>

          <View style={styles.messageCard}>
            <View style={styles.errorIconCircle}>
              <FontAwesome5
                name="exclamation-circle"
                size={25}
                color={colors.error}
                iconStyle="solid"
              />
            </View>

            <Text style={styles.messageTitle}>Unable to display user</Text>

            <Text style={styles.messageText}>
              {error || "This user could not be found."}
            </Text>

            {currentRole === ROLES.ADMIN && (
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => void loadUser()}
                accessibilityRole="button"
              >
                <FontAwesome5
                  name="redo"
                  size={14}
                  color="#FFFFFF"
                  iconStyle="solid"
                />
                <Text style={styles.secondaryButtonText}>Try again</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    );
  }

  const statusStyle = getStatusColors(user.accountStatus);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
        accessibilityRole="button"
        accessibilityLabel="Back to users"
      >
        <FontAwesome5
          name="arrow-left"
          size={15}
          color={colors.text}
          iconStyle="solid"
        />
        <Text style={styles.backText}>Back to users</Text>
      </TouchableOpacity>

      <View style={styles.pageHeader}>
        <Text style={styles.eyebrow}>SERVD / ADMINISTRATION</Text>
        <Text style={styles.heading}>User details</Text>
        <Text style={styles.subtitle}>View and manage this account.</Text>
      </View>

      {/* Profile summary */}
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <FontAwesome5
            name="user"
            size={27}
            color={colors.secondary}
            iconStyle="solid"
          />
        </View>

        <Text style={styles.userName}>{user.name}</Text>
        <Text style={styles.userEmail}>{user.email}</Text>

        <View style={styles.roleBadge}>
          <Text style={styles.roleBadgeText}>{getRoleLabel(user.role)}</Text>
        </View>

        <View
          style={[
            styles.statusBadge,
            { backgroundColor: statusStyle.backgroundColor },
          ]}
        >
          <FontAwesome5
            name="filter"
            size={12}
            color={colors.primary}
            iconStyle="solid"
          />
          <Text style={[styles.statusText, { color: statusStyle.color }]}>
            {statusStyle.label}
          </Text>
        </View>
      </View>

      {/* Account information */}
      <SectionCard
        icon="address-card"
        title="Account information"
        description="The identifying details associated with this account."
      >
        <DetailRow label="Full name" value={user.name} />
        <DetailRow label="Email address" value={user.email} />
        <DetailRow label="Account role" value={getRoleLabel(user.role)} />
        <DetailRow label="Account status" value={user.accountStatus} last />
      </SectionCard>

      {/* User record */}
      <SectionCard
        icon="fingerprint"
        title="User record"
        description="Use this identifier when referencing this user."
      >
        <Text style={styles.detailLabel}>User ID</Text>
        <View style={styles.idContainer}>
          <Text selectable style={styles.idValue}>
            {user.userId}
          </Text>
          <FontAwesome5
            name="check-circle"
            size={15}
            color={colors.secondary}
            iconStyle="solid"
          />
        </View>
      </SectionCard>

      {/* Account management */}
      {user.role !== ROLES.ADMIN && (
        <View style={styles.actionCard}>
          <View style={styles.sectionHeadingRow}>
            <View style={styles.sectionIcon}>
              <FontAwesome5
                name="shield-alt"
                size={17}
                color={colors.secondary}
                iconStyle="solid"
              />
            </View>
            <View style={styles.sectionHeadingText}>
              <Text style={styles.sectionTitle}>Account management</Text>
              <Text style={styles.sectionDescription}>
                Manage this user's access to Servd.
              </Text>
            </View>
          </View>

          <View style={styles.actionNotice}>
            <FontAwesome5
              name="info-circle"
              size={15}
              color={colors.textSecondary}
              iconStyle="solid"
            />
            <Text style={styles.actionDescription}>
              {isActive
                ? "Suspending this account prevents normal account access."
                : "Reactivating this account restores normal account access."}
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.actionButton,
              isActive ? styles.suspendButton : styles.reactivateButton,
              saving && styles.disabledButton,
            ]}
            onPress={toggleAccountStatus}
            disabled={saving}
            accessibilityRole="button"
            accessibilityLabel={
              isActive ? "Suspend account" : "Reactivate account"
            }
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

          <Text style={styles.actionFootnote}>
            Administrator accounts cannot be suspended from this screen.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

// Reusable card for grouped account details.
function SectionCard({
  icon,
  title,
  description,
  children,
}: {
  icon: any;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.detailsCard}>
      <View style={styles.sectionHeadingRow}>
        <View style={styles.sectionIcon}>
          <FontAwesome5
            name={icon}
            size={16}
            color={colors.primary}
            iconStyle="solid"
          />
        </View>

        <View style={styles.sectionHeadingText}>
          <Text style={styles.sectionTitle}>{title}</Text>
          <Text style={styles.sectionDescription}>{description}</Text>
        </View>
      </View>

      <View style={styles.rowsContainer}>{children}</View>
    </View>
  );
}

// Reusable label and value row for account information.
function DetailRow({
  label,
  value,
  last = false,
}: {
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <View style={[styles.detailRow, last && styles.lastDetailRow]}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text selectable style={styles.detailValue}>
        {value}
      </Text>
    </View>
  );
}

// Shared layout, typography, status, and action styles.
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  content: {
    padding: Spacing.three,
    paddingBottom: Spacing.six,
    gap: Spacing.three,
    maxWidth: 800,
    width: "100%",
    alignSelf: "center",
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    gap: Spacing.two,
    padding: Spacing.three,
  },
  mutedText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  errorContent: {
    padding: Spacing.three,
    gap: Spacing.three,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: Spacing.two,
    paddingVertical: Spacing.two,
  },
  backText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "600",
  },
  pageHeader: {
    gap: Spacing.one,
    marginBottom: Spacing.one,
  },
  eyebrow: {
    color: colors.secondary,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.4,
    marginBottom: Spacing.one,
  },
  heading: {
    color: colors.text,
    fontSize: 28,
    fontWeight: "700",
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 21,
  },
  profileCard: {
    alignItems: "center",
    backgroundColor: colors.background,
    borderRadius: Radius.lg,
    padding: Spacing.four,
    gap: Spacing.two,
  },
  avatar: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#DDF0EE",
    marginBottom: Spacing.one,
  },
  userName: {
    color: colors.text,
    fontSize: 21,
    fontWeight: "700",
    textAlign: "center",
  },
  userEmail: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  roleBadge: {
    backgroundColor: colors.backgroundElement,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    marginTop: Spacing.one,
  },
  roleBadgeText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: "700",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.one,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    marginTop: Spacing.one,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "capitalize",
  },
  detailsCard: {
    backgroundColor: colors.background,
    borderRadius: Radius.lg,
    padding: Spacing.three,
    gap: Spacing.three,
  },
  sectionHeadingRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.two,
  },
  sectionIcon: {
    width: 36,
    height: 36,
    borderRadius: Radius.md,
    backgroundColor: "#DDF0EE",
    alignItems: "center",
    justifyContent: "center",
  },
  sectionHeadingText: {
    flex: 1,
    gap: Spacing.one,
    paddingTop: 1,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700",
  },
  sectionDescription: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
  },
  rowsContainer: {
    gap: Spacing.three,
  },
  detailRow: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.backgroundElement,
    paddingBottom: Spacing.two,
    gap: Spacing.one,
  },
  lastDetailRow: {
    borderBottomWidth: 0,
    paddingBottom: 0,
  },
  detailLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "600",
  },
  detailValue: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 21,
  },
  idContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.two,
    backgroundColor: "#FFFFFF",
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: colors.backgroundElement,
    padding: Spacing.three,
  },
  idValue: {
    flex: 1,
    color: colors.text,
    fontSize: 13,
    lineHeight: 19,
  },
  actionCard: {
    backgroundColor: colors.background,
    borderRadius: Radius.lg,
    padding: Spacing.three,
    gap: Spacing.three,
  },
  actionNotice: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.two,
    backgroundColor: "#FFFFFF",
    borderRadius: Radius.md,
    padding: Spacing.three,
  },
  actionDescription: {
    flex: 1,
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 19,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.two,
    borderRadius: Radius.md,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.four,
    minHeight: 48,
  },
  suspendButton: {
    backgroundColor: colors.error,
  },
  reactivateButton: {
    backgroundColor: colors.secondary,
  },
  disabledButton: {
    opacity: 0.6,
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  actionFootnote: {
    color: colors.textSecondary,
    fontSize: 11,
    lineHeight: 17,
    textAlign: "center",
  },
  messageCard: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
    borderRadius: Radius.lg,
    padding: Spacing.four,
    gap: Spacing.three,
    marginTop: Spacing.four,
  },
  errorIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#F6DEDA",
    alignItems: "center",
    justifyContent: "center",
  },
  messageTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
  },
  messageText: {
    color: colors.textSecondary,
    textAlign: "center",
    fontSize: 14,
    lineHeight: 21,
  },
  secondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.two,
    backgroundColor: colors.secondary,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
  },
  secondaryButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
});
