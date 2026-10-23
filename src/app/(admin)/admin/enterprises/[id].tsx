/**
 * Enterprise Details Screen
 *
 * Retrieves and displays a selected food enterprise's Firestore
 * document using its document ID.
 *
 * Responsibilities:
 * - Loads the selected enterprise document.
 * - Displays the enterprise name, contact name, email, phone number,
 *   and address information where available.
 * - Displays the record's creation date where available.
 * - Handles missing records and loading states.
 * - Provides navigation back to the enterprise list.
 */

import FontAwesome5 from "@react-native-vector-icons/fontawesome5";
import { useLocalSearchParams, useRouter } from "expo-router";
<<<<<<< HEAD
import { doc, getDoc } from "firebase/firestore";
=======
import { deleteDoc, doc, getDoc, updateDoc } from "firebase/firestore";
>>>>>>> main
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { db } from "@/config/firebase";
import { ACCOUNT_STATUS, COLLECTIONS } from "@/constants/roles";
import {
  Colors,
  Fonts,
<<<<<<< HEAD
  Radius,
  Spacing,
  MaxContentWidth,
=======
  MaxContentWidth,
  Radius,
  Spacing,
>>>>>>> main
} from "@/constants/theme";

const colors = Colors.light;

type Enterprise = {
  enterpriseName?: string;

  // Fields displayed in the enterprise list
  contactInformation?: string;
  registrationNumber?: string;
  userID?: string;
  createdTimestamp?: TimestampValue | string;

  // Additional enterprise details
  contactName?: string;
  email?: string;
  phone?: string;
  address?: string;
  businessAddress?: string;
  accountStatus?: string;

  // Legacy field for existing documents
  createdAt?: TimestampValue | string;
};

type TimestampValue = {
  toDate?: () => Date;
};

export default function EnterpriseDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [enterprise, setEnterprise] = useState<Enterprise | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch the enterprise details using its document ID
  useEffect(() => {
    let active = true;

    async function loadEnterprise() {
      setLoading(true);
      setError("");

      if (!id) {
        setError("Enterprise ID is missing.");
        setLoading(false);
        return;
      }

      try {
        const snapshot = await getDoc(doc(db, COLLECTIONS.ENTERPRISES, id));

        if (!snapshot.exists()) {
          if (active) {
            setError("Enterprise not found.");
          }
          return;
        }

        if (active) {
          setEnterprise(snapshot.data() as Enterprise);
        }
      } catch (err) {
        console.error("Error loading enterprise:", err);

        if (active) {
          setError("Unable to load enterprise details.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadEnterprise();

    return () => {
      active = false;
    };
  }, [id]);

  // Support both current and legacy creation date fields
  const dateValue = enterprise?.createdTimestamp ?? enterprise?.createdAt;

  const createdAt = (() => {
    if (!dateValue) return undefined;

    try {
      const date =
        typeof dateValue === "string"
          ? new Date(dateValue)
          : dateValue.toDate?.();

      if (!date || Number.isNaN(date.getTime())) {
        return typeof dateValue === "string" ? dateValue : undefined;
      }

      return date.toLocaleDateString(undefined, {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return undefined;
    }
  })();

  const status = enterprise?.accountStatus ?? ACCOUNT_STATUS.ACTIVE;
  const isActive = status === ACCOUNT_STATUS.ACTIVE;

  const businessAddress = enterprise?.businessAddress || enterprise?.address;

  // Reuse the same layout for each enterprise detail
  function detail(label: string, value?: string) {
    return (
      <View style={styles.detail} key={label}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>
          {value?.trim() || "Not provided"}
        </Text>
      </View>
    );
  }

<<<<<<< HEAD
  // Placeholder until backend account suspension is implemented
  const handleSuspend = () => {
    Alert.alert(
      "Suspend enterprise?",
      "This will disable the enterprise account.",
=======
  // Toggles the enterprise account status between active and suspended in Firestore.
  const handleSuspend = () => {
    const nextStatus = isActive ? ACCOUNT_STATUS.SUSPENDED : ACCOUNT_STATUS.ACTIVE;
    const actionLabel = isActive ? "suspend" : "activate";

    Alert.alert(
      `${isActive ? "Suspend" : "Activate"} enterprise?`,
      `This will ${actionLabel} the enterprise account.`,
>>>>>>> main
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
<<<<<<< HEAD
          style: "destructive",
          onPress: async () => {
            // TODO: Connect to backend suspension functionality.
            Alert.alert(
              "Backend integration pending",
              "Account suspension has not been implemented yet.",
            );
=======
          style: isActive ? "destructive" : "default",
          onPress: async () => {
            try {
              await updateDoc(doc(db, COLLECTIONS.ENTERPRISES, id), {
                accountStatus: nextStatus,
              });

              setEnterprise((prev) => (prev ? { ...prev, accountStatus: nextStatus } : null));
              Alert.alert("Success", `Enterprise account has been ${isActive ? "suspended" : "activated"}.`);
            } catch (err) {
              console.error("Error updating enterprise status:", err);
              Alert.alert("Error", "Failed to update enterprise status.");
            }
>>>>>>> main
          },
        },
      ],
    );
  };

<<<<<<< HEAD
  // Placeholder until backend account deletion is implemented
  const handleDelete = () => {
    Alert.alert(
      "Delete enterprise?",
      "This will permanently delete the enterprise account.",
=======
  // Permanently deletes the enterprise document from Firestore and returns to the list.
const handleDelete = () => {
    Alert.alert(
      "Delete enterprise?",
      "This will permanently delete the enterprise account from the database.",
>>>>>>> main
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm deletion",
          style: "destructive",
          onPress: async () => {
<<<<<<< HEAD
            // TODO: Connect to backend deletion functionality.
            Alert.alert(
              "Backend integration pending",
              "Account deletion has not been implemented yet.",
            );
=======
            try {
              await deleteDoc(doc(db, COLLECTIONS.ENTERPRISES, id));
              Alert.alert("Success", "Enterprise account has been deleted.");
              router.back();
            } catch (err) {
              console.error("Error deleting enterprise:", err);
              Alert.alert("Error", "Failed to delete enterprise account. Please check your permissions.");
            }
>>>>>>> main
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Back navigation */}
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [
            styles.backButton,
            pressed && styles.pressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Back to enterprises"
        >
          <FontAwesome5
            name="arrow-left"
            size={14}
            color={colors.primary}
            iconStyle="solid"
          />
          <Text style={styles.backText}>Back to enterprises</Text>
        </Pressable>

        {/* Loading and error states */}
        {loading ? (
          <View style={styles.stateCard}>
            <ActivityIndicator color={colors.primary} size="large" />
            <Text style={styles.stateText}>Loading enterprise details...</Text>
          </View>
        ) : error ? (
          <View style={styles.stateCard}>
            <View style={styles.stateIconError}>
              <FontAwesome5
                name="exclamation-circle"
                size={24}
                color={colors.error}
                iconStyle="solid"
              />
            </View>

            <Text style={styles.stateTitle}>Unable to display enterprise</Text>

            <Text style={styles.stateText}>{error}</Text>

            <Pressable
              onPress={() => router.back()}
              style={({ pressed }) => [
                styles.secondaryButton,
                pressed && styles.pressed,
              ]}
              accessibilityRole="button"
            >
              <Text style={styles.secondaryButtonText}>
                Return to enterprises
              </Text>
            </Pressable>
          </View>
        ) : enterprise ? (
          <>
            {/* Enterprise profile and account status */}
            <View style={styles.profile}>
              <View style={styles.profileIcon}>
                <FontAwesome5
                  name="store"
                  size={27}
                  color={colors.secondary}
                  iconStyle="solid"
                />
              </View>

              <Text style={styles.eyebrow}>SERVD / ADMINISTRATION</Text>

              <Text style={styles.profileTitle}>
                {enterprise.enterpriseName || "Unnamed enterprise"}
              </Text>

              <View
                style={[
                  styles.statusBadge,
                  isActive ? styles.activeBadge : styles.suspendedBadge,
                ]}
              >
                <View
                  style={[
                    styles.statusDot,
                    isActive ? styles.activeDot : styles.suspendedDot,
                  ]}
                />
                <Text style={styles.statusText}>
                  {isActive ? "Active account" : "Suspended account"}
                </Text>
              </View>

              <Text style={styles.profileDescription}>
                Enterprise account details and registration information.
              </Text>
            </View>

            {/* Contact details */}
            <View style={styles.card}>
              <View style={styles.cardHeading}>
                <View style={styles.cardIcon}>
                  <FontAwesome5
                    name="address-card"
                    size={16}
                    color={colors.secondary}
                    iconStyle="solid"
                  />
                </View>

                <View style={styles.cardHeadingText}>
                  <Text style={styles.sectionTitle}>Contact information</Text>
                  <Text style={styles.sectionDescription}>
                    How to reach this enterprise
                  </Text>
                </View>
              </View>

              {detail("Contact person", enterprise.contactName)}
              {detail("Contact information", enterprise.contactInformation)}
              {detail("Email address", enterprise.email)}
              {detail("Phone number", enterprise.phone)}
            </View>

            {/* Registration and business details */}
            <View style={styles.card}>
              <View style={styles.cardHeading}>
                <View style={styles.cardIcon}>
                  <FontAwesome5
                    name="building"
                    size={16}
                    color={colors.secondary}
                    iconStyle="solid"
                  />
                </View>

                <View style={styles.cardHeadingText}>
                  <Text style={styles.sectionTitle}>Business information</Text>
                  <Text style={styles.sectionDescription}>
                    Registration and business details
                  </Text>
                </View>
              </View>

              {detail("Enterprise name", enterprise.enterpriseName)}
              {detail("Registration number", enterprise.registrationNumber)}
              {detail("Business address", businessAddress)}
              {detail("Registered on", createdAt)}
            </View>

            {/* Account identifiers and status */}
            <View style={styles.card}>
              <View style={styles.cardHeading}>
                <View style={styles.cardIcon}>
                  <FontAwesome5
                    name="fingerprint"
                    size={16}
                    color={colors.secondary}
                    iconStyle="solid"
                  />
                </View>

                <View style={styles.cardHeadingText}>
                  <Text style={styles.sectionTitle}>Account information</Text>
                  <Text style={styles.sectionDescription}>
                    Identifiers and account status
                  </Text>
                </View>
              </View>

              {detail("Account status", isActive ? "Active" : "Suspended")}
              {detail("User ID", enterprise.userID)}
              {detail("Document ID", id)}
            </View>

            {/* Administrative actions */}
            <View style={styles.actionsSection}>
              <Text style={styles.sectionTitle}>Administrative actions</Text>

              <Text style={styles.actionsDescription}>
                Manage access to this enterprise account.
              </Text>

              <Pressable
                onPress={handleSuspend}
                style={({ pressed }) => [
                  styles.suspendButton,
                  pressed && styles.pressed,
                ]}
                accessibilityRole="button"
                accessibilityLabel="Suspend enterprise account"
              >
                <FontAwesome5
                  name="pause-circle"
                  size={16}
                  color="#FFFFFF"
                  iconStyle="solid"
                />
                <Text style={styles.actionText}>Suspend account</Text>
              </Pressable>

              <Pressable
                onPress={handleDelete}
                style={({ pressed }) => [
                  styles.deleteButton,
                  pressed && styles.pressed,
                ]}
                accessibilityRole="button"
                accessibilityLabel="Delete enterprise account"
              >
                <FontAwesome5
                  name="trash-alt"
                  size={15}
                  color="#FFFFFF"
                  iconStyle="solid"
                />
                <Text style={styles.actionText}>Delete account</Text>
              </Pressable>

              <View style={styles.actionNote}>
                <FontAwesome5
                  name="info-circle"
                  size={13}
                  color={colors.textSecondary}
                  iconStyle="solid"
                />
                <Text style={styles.actionNoteText}>
                  Account management actions require backend integration.
                </Text>
              </View>
            </View>
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  screen: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  content: {
    flexGrow: 1,
    width: "100%",
    maxWidth: MaxContentWidth,
    alignSelf: "center",
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.six,
    gap: Spacing.three,
  },

  // Back navigation
  backButton: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    paddingVertical: Spacing.two,
    paddingRight: Spacing.two,
  },
  backText: {
    fontFamily: Fonts.body,
    fontSize: 13,
    fontWeight: "700",
    color: colors.primary,
  },
  pressed: {
    opacity: 0.75,
  },

  // Profile header
  profile: {
    alignItems: "center",
    paddingTop: Spacing.two,
    paddingBottom: Spacing.three,
    gap: Spacing.two,
  },
  profileIcon: {
    width: 68,
    height: 68,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E9F4F1",
    borderRadius: Radius.lg,
    marginBottom: Spacing.one,
  },
  eyebrow: {
    fontFamily: Fonts.body,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.4,
    color: colors.secondary,
    textAlign: "center",
  },
  profileTitle: {
    width: "100%",
    fontFamily: Fonts.heading,
    fontSize: 25,
    lineHeight: 32,
    fontWeight: "700",
    color: colors.text,
    textAlign: "center",
  },
  profileDescription: {
    maxWidth: 320,
    fontFamily: Fonts.body,
    fontSize: 13,
    lineHeight: 20,
    color: colors.textSecondary,
    textAlign: "center",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Radius.sm,
  },
  activeBadge: {
    backgroundColor: "#E6ECD9",
  },
  suspendedBadge: {
    backgroundColor: "#F6DEDA",
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  activeDot: {
    backgroundColor: colors.accent,
  },
  suspendedDot: {
    backgroundColor: colors.error,
  },
  statusText: {
    fontFamily: Fonts.body,
    fontSize: 11,
    fontWeight: "700",
    color: colors.text,
  },

  // Information cards
  card: {
    padding: Spacing.three,
    gap: Spacing.three,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.backgroundElement,
    borderRadius: Radius.lg,
  },
  cardHeading: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    marginBottom: Spacing.one,
  },
  cardIcon: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E9F4F1",
    borderRadius: Radius.md,
  },
  cardHeadingText: {
    flex: 1,
    gap: Spacing.half,
  },
  sectionTitle: {
    fontFamily: Fonts.heading,
    fontSize: 17,
    lineHeight: 23,
    fontWeight: "700",
    color: colors.text,
  },
  sectionDescription: {
    fontFamily: Fonts.body,
    fontSize: 12,
    lineHeight: 17,
    color: colors.textSecondary,
  },
  detail: {
    gap: Spacing.one,
  },
  detailLabel: {
    fontFamily: Fonts.body,
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.2,
    color: colors.textSecondary,
  },
  detailValue: {
    fontFamily: Fonts.body,
    fontSize: 14,
    lineHeight: 21,
    color: colors.text,
    ...({
      userSelect: "text",
    } as object),
  },

  // Administrative actions
  actionsSection: {
    gap: Spacing.two,
    paddingTop: Spacing.two,
  },
  actionsDescription: {
    fontFamily: Fonts.body,
    fontSize: 12,
    lineHeight: 18,
    color: colors.textSecondary,
    marginBottom: Spacing.one,
  },
  suspendButton: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    backgroundColor: colors.secondary,
    borderRadius: Radius.md,
  },
  deleteButton: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    backgroundColor: colors.error,
    borderRadius: Radius.md,
  },
  actionText: {
    fontFamily: Fonts.button,
    fontSize: 13,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  actionNote: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.two,
    paddingTop: Spacing.one,
  },
  actionNoteText: {
    flex: 1,
    fontFamily: Fonts.body,
    fontSize: 11,
    lineHeight: 17,
    color: colors.textSecondary,
  },

  // Loading and error states
  stateCard: {
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.five,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.backgroundElement,
    borderRadius: Radius.lg,
    marginTop: Spacing.two,
  },
  stateIconError: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F6DEDA",
    borderRadius: Radius.lg,
  },
  stateTitle: {
    fontFamily: Fonts.heading,
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
    textAlign: "center",
  },
  stateText: {
    fontFamily: Fonts.body,
    fontSize: 13,
    lineHeight: 20,
    color: colors.textSecondary,
    textAlign: "center",
  },
  secondaryButton: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: colors.backgroundElement,
    borderRadius: Radius.md,
  },
  secondaryButtonText: {
    fontFamily: Fonts.body,
    fontSize: 12,
    fontWeight: "700",
    color: colors.primary,
  },
});
