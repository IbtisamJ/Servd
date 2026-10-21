/**
 * NGO Details Screen
 *
 * Retrieves and displays the details of a selected NGO using its
 * Firestore document ID. Provides administrators with access to the
 * organisation's registration information and verification status.
 *
 * Responsibilities:
 * - Reads the selected NGO document from Firestore.
 * - Displays organisation name, NPO number, contact information,
 *   creation date, and associated user ID where available.
 * - Displays the NGO's verification status.
 * - Handles loading, missing-document, and error states.
 * - Provides navigation back to the NGO list.
 *
 * Note:
 * - Approval and rejection actions must be connected to the
 *   backend workflow before they persist changes to Firestore.
 */

import { FontAwesome5 } from "@react-native-vector-icons/fontawesome5";
import { useLocalSearchParams, useRouter } from "expo-router";
import { doc, getDoc } from "firebase/firestore";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { db } from "@/config/firebase";
import { COLLECTIONS, NGO_STATUS } from "@/constants/roles";
import { Colors, Fonts, Radius, Spacing } from "@/constants/theme";

const colors = Colors.light;

// Defines the available icon names for FontAwesome5.
type IconName = React.ComponentProps<typeof FontAwesome5>["name"];

// Describes the NGO information retrieved from Firestore.
type NGO = {
  contactInfo?: string;
  createdAt?: { toDate?: () => Date } | string;
  npoNumber?: string;
  organisationName?: string;
  userId?: string;
  verificationStatus?: string;
};

// Defines the available application review decisions.
type Decision = "approve" | "reject";

export default function NGOProfilePage() {
  // Retrieves the NGO document ID from the route parameters.
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  // Stores the NGO details, rejection reason, and loading/error states.
  const [ngo, setNgo] = useState<NGO | null>(null);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetches the selected NGO's details from Firestore.
  const loadNGO = useCallback(async () => {
    if (!id) {
      setNgo(null);
      setError("NGO ID is missing.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const snapshot = await getDoc(doc(db, COLLECTIONS.NGOS, id));

      // Handle cases where the requested NGO does not exist.
      if (!snapshot.exists()) {
        setNgo(null);
        setError("NGO not found.");
        return;
      }

      setNgo(snapshot.data() as NGO);
    } catch (err) {
      console.error("Failed to load NGO:", err);
      setNgo(null);
      setError(
        "Unable to load NGO details. Check your connection and permissions.",
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  // Loads the NGO whenever the route ID or loader changes.
  useEffect(() => {
    loadNGO();
  }, [loadNGO]);

  // Prepares display values and fallback text for missing information.
  const name = ngo?.organisationName || "Unnamed NGO";
  const status = (ngo?.verificationStatus || NGO_STATUS.PENDING).toLowerCase();

  // Formats the submission date from either a Firestore timestamp or string.
  const submitted = (() => {
    const value = ngo?.createdAt;

    if (
      value &&
      typeof value === "object" &&
      typeof value.toDate === "function"
    ) {
      return value.toDate().toLocaleDateString();
    }

    if (typeof value === "string") return value;

    return "Not provided";
  })();

  // Returns badge colors and an icon based on the verification status.
  const getStatusStyle = () => {
    switch (status) {
      case "approved":
        return {
          backgroundColor: "#E6ECD9",
          color: colors.accent,
          icon: "check-circle" as IconName,
        };
      case "rejected":
        return {
          backgroundColor: "#F6DEDA",
          color: colors.error,
          icon: "times-circle" as IconName,
        };
      case "pending":
      default:
        return {
          backgroundColor: "#DDF0EE",
          color: colors.secondary,
          icon: "clock" as IconName,
        };
    }
  };

  const statusStyle = getStatusStyle();
  const statusLabel = status.charAt(0).toUpperCase() + status.slice(1);

  /**
   * BACKEND PLACEHOLDER:
   * Replace this handler with the backend approval/rejection service.
   * No changes are currently written to Firestore by these actions.
   */
  const confirmDecision = (decision: Decision) => {
    // Require a rejection reason before continuing with a rejection.
    if (decision === "reject" && !reason.trim()) {
      Alert.alert(
        "Reason required",
        "Please provide a reason for rejecting this application.",
      );
      return;
    }

    // Ask the administrator to confirm the selected decision.
    Alert.alert(
      `${decision === "approve" ? "Approve" : "Reject"} NGO`,
      `${decision === "approve" ? "Approve" : "Reject"} ${name}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Continue",
          style: decision === "reject" ? "destructive" : "default",
          onPress: () => {
            // TODO (backend):
            // await updateNGOVerificationStatus({
            //   ngoId: id,
            //   verificationStatus: decision === "approve"
            //     ? "approved"
            //     : "rejected",
            //   rejectionReason:
            //     decision === "reject" ? reason.trim() : undefined,
            // });
            //
            // After success, call loadNGO() to refresh the details.

            Alert.alert(
              "Not connected yet",
              "This action will be available once the backend handler is integrated.",
            );
          },
        },
      ],
    );
  };

  // Renders a reusable label and value pair for NGO information.
  function detail(label: string, value?: string) {
    return (
      <View style={styles.detail} key={label}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue} selectable>
          {value || "Not provided"}
        </Text>
      </View>
    );
  }

  // Provides a reusable card layout for grouping related details.
  function SectionCard({
    title,
    icon,
    children,
  }: {
    title: string;
    icon: IconName;
    children: React.ReactNode;
  }) {
    return (
      <View style={styles.card}>
        <View style={styles.sectionHeading}>
          <View style={styles.sectionIcon}>
            <FontAwesome5
              name="users"
              size={14}
              color={colors.textSecondary}
              iconStyle="solid"
            />
          </View>
          <Text style={styles.sectionTitle}>{title}</Text>
        </View>
        {children}
      </View>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.container}>
        {/* Returns the administrator to the previous screen. */}
        <Pressable
          style={styles.back}
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Back to NGOs"
        >
          <FontAwesome5
            name="arrow-left"
            size={14}
            color={colors.textSecondary}
            iconStyle="solid"
          />
          <Text style={styles.backText}>Back to NGOs</Text>
        </Pressable>

        {/* Displays loading, error, or NGO details based on the current state. */}
        {loading ? (
          <View style={styles.stateCard}>
            <ActivityIndicator color={colors.secondary} size="large" />
            <Text style={styles.stateText}>Loading NGO details...</Text>
          </View>
        ) : error ? (
          <View style={styles.stateCard}>
            <View style={styles.stateIcon}>
              <FontAwesome5
                name="exclamation-circle"
                size={22}
                color={colors.error}
                iconStyle="solid"
              />
            </View>
            <Text style={styles.stateTitle}>Unable to load NGO</Text>
            <Text style={styles.error}>{error}</Text>

            {/* Allows the administrator to retry loading the NGO. */}
            <Pressable style={styles.retryButton} onPress={loadNGO}>
              <FontAwesome5
                name="redo"
                size={13}
                color="#FFFFFF"
                iconStyle="solid"
              />
              <Text style={styles.buttonText}>Try again</Text>
            </Pressable>
          </View>
        ) : ngo ? (
          <>
            {/* NGO header and verification status. */}
            <View style={styles.hero}>
              <View style={styles.heroTop}>
                <View style={styles.avatar}>
                  <FontAwesome5
                    name="building"
                    size={23}
                    color={colors.secondary}
                  />
                </View>

                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: statusStyle.backgroundColor },
                  ]}
                >
                  <FontAwesome5
                    name="filter"
                    size={14}
                    color={colors.textSecondary}
                    iconStyle="solid"
                  />
                  <Text
                    style={[styles.statusText, { color: statusStyle.color }]}
                  >
                    {statusLabel}
                  </Text>
                </View>
              </View>

              <Text style={styles.eyebrow}>SERVD / ADMINISTRATION</Text>
              <Text style={styles.title}>{name}</Text>
              <Text style={styles.subtitle}>
                Review the organisation's registration and verification
                information.
              </Text>

              {/* Shows the document ID for application reference. */}
              <View style={styles.idRow}>
                <Text style={styles.idLabel}>APPLICATION ID</Text>
                <Text style={styles.idValue} selectable>
                  {id}
                </Text>
              </View>
            </View>

            {/* Displays registration and submission details. */}
            <SectionCard title="Organisation details" icon="building">
              {detail("Registered organisation name", name)}
              {detail("NPO registration number", ngo.npoNumber)}
              {detail("Application submitted", submitted)}
            </SectionCard>

            {/* Displays contact details and the associated user ID. */}
            <SectionCard title="Contact information" icon="address-card">
              {detail("Contact information", ngo.contactInfo)}
              {detail("Associated user ID", ngo.userId)}
            </SectionCard>

            {/* Provides the rejection reason field and review actions. */}
            <SectionCard title="Review application" icon="clipboard-check">
              <View style={styles.reviewNotice}>
                <FontAwesome5
                  name="info-circle"
                  size={15}
                  color={colors.secondary}
                  iconStyle="solid"
                />
                <Text style={styles.reviewNoticeText}>
                  Approval and rejection are placeholders until the backend
                  workflow is connected.
                </Text>
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>
                  Reason for rejection
                  <Text style={styles.required}> *</Text>
                </Text>

                <Text style={styles.fieldHint}>
                  Required when rejecting this application.
                </Text>

                <TextInput
                  value={reason}
                  onChangeText={setReason}
                  placeholder="Explain why this application is being rejected..."
                  placeholderTextColor={colors.textSecondary}
                  multiline
                  textAlignVertical="top"
                  style={styles.reasonInput}
                  accessibilityLabel="Reason for rejection"
                />
              </View>

              {/* Opens the approval confirmation prompt. */}
              <Pressable
                style={styles.approveButton}
                onPress={() => confirmDecision("approve")}
                accessibilityRole="button"
              >
                <FontAwesome5
                  name="check"
                  size={14}
                  color="#FFFFFF"
                  iconStyle="solid"
                />
                <Text style={styles.buttonText}>Approve NGO</Text>
              </Pressable>

              {/* Opens the rejection confirmation prompt. */}
              <Pressable
                style={styles.rejectButton}
                onPress={() => confirmDecision("reject")}
                accessibilityRole="button"
              >
                <FontAwesome5
                  name="times"
                  size={14}
                  color="#FFFFFF"
                  iconStyle="solid"
                />
                <Text style={styles.buttonText}>Reject application</Text>
              </Pressable>
            </SectionCard>
          </>
        ) : null}
      </View>
    </ScrollView>
  );
}

// Defines layout, typography, colors, and spacing for the profile screen.
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  content: {
    padding: Spacing.three,
    paddingBottom: Spacing.six,
    alignItems: "center",
  },
  container: {
    width: "100%",
    maxWidth: 800,
    gap: Spacing.three,
  },
  back: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    alignSelf: "flex-start",
    paddingVertical: Spacing.one,
  },
  backText: {
    fontFamily: Fonts.body,
    fontSize: 13,
    color: colors.textSecondary,
  },
  hero: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.backgroundElement,
    borderRadius: Radius.lg,
    padding: Spacing.four,
    gap: Spacing.two,
  },
  heroTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.two,
    marginBottom: Spacing.two,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: Radius.lg,
    backgroundColor: "#E9F4F1",
    alignItems: "center",
    justifyContent: "center",
  },
  eyebrow: {
    fontFamily: Fonts.body,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    color: colors.secondary,
  },
  title: {
    fontFamily: Fonts.heading,
    fontSize: 26,
    fontWeight: "700",
    lineHeight: 33,
    color: colors.text,
  },
  subtitle: {
    fontFamily: Fonts.body,
    fontSize: 14,
    lineHeight: 21,
    color: colors.textSecondary,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.one,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.two,
    borderRadius: Radius.md,
  },
  statusText: {
    fontFamily: Fonts.body,
    fontSize: 12,
    fontWeight: "700",
  },
  idRow: {
    borderTopWidth: 1,
    borderTopColor: colors.backgroundElement,
    marginTop: Spacing.two,
    paddingTop: Spacing.three,
    gap: Spacing.one,
  },
  idLabel: {
    fontFamily: Fonts.body,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.8,
    color: colors.textSecondary,
  },
  idValue: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: colors.text,
  },
  card: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.backgroundElement,
    borderRadius: Radius.lg,
    padding: Spacing.three,
    gap: Spacing.three,
  },
  sectionHeading: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    marginBottom: Spacing.one,
  },
  sectionIcon: {
    width: 32,
    height: 32,
    borderRadius: Radius.md,
    backgroundColor: "#E9F4F1",
    alignItems: "center",
    justifyContent: "center",
  },
  sectionTitle: {
    fontFamily: Fonts.heading,
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
  },
  detail: {
    gap: Spacing.one,
  },
  detailLabel: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: colors.textSecondary,
  },
  detailValue: {
    fontFamily: Fonts.body,
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
  },
  reviewNotice: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.two,
    padding: Spacing.three,
    borderRadius: Radius.md,
    backgroundColor: "#E9F4F1",
  },
  reviewNoticeText: {
    flex: 1,
    fontFamily: Fonts.body,
    fontSize: 12,
    lineHeight: 18,
    color: colors.text,
  },
  fieldGroup: {
    gap: Spacing.two,
  },
  fieldLabel: {
    fontFamily: Fonts.body,
    fontSize: 13,
    fontWeight: "600",
    color: colors.text,
  },
  required: {
    color: colors.error,
  },
  fieldHint: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: colors.textSecondary,
  },
  reasonInput: {
    minHeight: 110,
    borderWidth: 1,
    borderColor: colors.backgroundElement,
    borderRadius: Radius.md,
    padding: Spacing.three,
    fontFamily: Fonts.body,
    fontSize: 14,
    lineHeight: 20,
    color: colors.text,
    backgroundColor: "#FFFFFF",
  },
  approveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.two,
    padding: Spacing.three,
    borderRadius: Radius.md,
    backgroundColor: colors.secondary,
  },
  rejectButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.two,
    padding: Spacing.three,
    borderRadius: Radius.md,
    backgroundColor: colors.primary,
  },
  buttonText: {
    fontFamily: Fonts.body,
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  stateCard: {
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.three,
    padding: Spacing.five,
    borderRadius: Radius.lg,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.backgroundElement,
  },
  stateIcon: {
    width: 48,
    height: 48,
    borderRadius: Radius.lg,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F6DEDA",
  },
  stateTitle: {
    fontFamily: Fonts.heading,
    fontSize: 19,
    fontWeight: "700",
    color: colors.text,
  },
  stateText: {
    fontFamily: Fonts.body,
    fontSize: 13,
    color: colors.textSecondary,
  },
  error: {
    fontFamily: Fonts.body,
    fontSize: 13,
    lineHeight: 19,
    color: colors.error,
    textAlign: "center",
  },
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.two,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    borderRadius: Radius.md,
    backgroundColor: colors.secondary,
  },
});
