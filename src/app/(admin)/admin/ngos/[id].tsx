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

import FontAwesome5 from "@react-native-vector-icons/fontawesome5";
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

type NGO = {
  contactInfo?: string;
  createdAt?: { toDate?: () => Date } | string;
  npoNumber?: string;
  organisationName?: string;
  userId?: string;
  verificationStatus?: string;
};

export default function NGOProfilePage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [ngo, setNgo] = useState<NGO | null>(null);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadNGO = useCallback(async () => {
    if (!id) {
      setError("NGO ID is missing.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const snapshot = await getDoc(doc(db, COLLECTIONS.NGOS, id));

      if (!snapshot.exists()) {
        setNgo(null);
        setError("NGO not found.");
        return;
      }

      setNgo(snapshot.data() as NGO);
    } catch (err) {
      console.error("Failed to load NGO:", err);
      setError(
        "Unable to load NGO details. Check your connection and permissions.",
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadNGO();
  }, [loadNGO]);

  const name = ngo?.organisationName || "Unnamed NGO";
  const registrationNumber = ngo?.npoNumber;
  const status = (
    ngo?.verificationStatus || NGO_STATUS.PENDING
  ).toLowerCase();

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

  const confirmDecision = (decision: "approve" | "reject") => {
    if (decision === "reject" && !reason.trim()) {
      Alert.alert(
        "Reason required",
        "Please provide a reason for rejecting this application.",
      );
      return;
    }

    Alert.alert(
      `${decision === "approve" ? "Approve" : "Reject"} NGO`,
      `${decision === "approve" ? "Approve" : "Reject"} ${name}? This action is not connected yet.`,
      [{ text: "OK" }],
    );
  };

  function detail(label: string, value?: string) {
    return (
      <View style={styles.detail} key={label}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>{value || "Not provided"}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Pressable style={styles.back} onPress={() => router.back()}>
        <FontAwesome5
          name="arrow-left"
          size={14}
          color={colors.textSecondary}
          iconStyle="solid"
        />
        <Text style={styles.backText}>Back to NGOs</Text>
      </Pressable>

      {loading ? (
        <ActivityIndicator color={colors.primary} style={styles.loader} />
      ) : error ? (
        <Pressable onPress={loadNGO} style={styles.message}>
          <Text style={styles.error}>{error}</Text>
          <Text style={styles.backText}>Tap to retry</Text>
        </Pressable>
      ) : ngo ? (
        <>
          <View style={styles.headingRow}>
            <View style={styles.avatar}>
              <FontAwesome5
                name="building"
                size={24}
                color={colors.secondary}
                iconStyle="solid"
              />
            </View>

            <View style={styles.headingInfo}>
              <Text style={styles.title}>{name}</Text>
              <Text style={styles.subtitle}>Application ID: {id}</Text>
            </View>

            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Text>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Organisation details</Text>
            {detail("Registered name", name)}
            {detail("NPO registration number", registrationNumber)}
            {detail("Application submitted", submitted)}
            {detail("User ID", ngo.userId)}
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Contact information</Text>
            {detail("Contact information", ngo.contactInfo)}
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Review application</Text>
            <Text style={styles.fieldLabel}>
              Reason for rejection (required to reject)
            </Text>

            <TextInput
              value={reason}
              onChangeText={setReason}
              placeholder="Explain why this application is being rejected..."
              placeholderTextColor={colors.textSecondary}
              multiline
              textAlignVertical="top"
              style={styles.reasonInput}
            />

            <Pressable
              style={styles.approveButton}
              onPress={() => confirmDecision("approve")}
            >
              <FontAwesome5
                name="check"
                size={15}
                color="#FFFFFF"
                iconStyle="solid"
              />
              <Text style={styles.buttonText}>Approve NGO</Text>
            </Pressable>

            <Pressable
              style={styles.rejectButton}
              onPress={() => confirmDecision("reject")}
            >
              <FontAwesome5
                name="times"
                size={15}
                color="#FFFFFF"
                iconStyle="solid"
              />
              <Text style={styles.buttonText}>Reject application</Text>
            </Pressable>

            <Text style={styles.note}>
              Approval and rejection are not connected yet.
            </Text>
          </View>
        </>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: {
    padding: Spacing.three,
    paddingBottom: Spacing.six,
    gap: Spacing.three,
  },
  back: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    alignSelf: "flex-start",
  },
  backText: {
    fontFamily: Fonts.body,
    fontSize: 13,
    color: colors.textSecondary,
  },
  headingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
    flexWrap: "wrap",
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: Radius.lg,
    backgroundColor: "#E9F4F1",
    alignItems: "center",
    justifyContent: "center",
  },
  headingInfo: { flex: 1, minWidth: 150 },
  title: {
    fontFamily: Fonts.heading,
    fontSize: 24,
    fontWeight: "700",
    color: colors.text,
  },
  subtitle: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  statusBadge: {
    backgroundColor: "#FCEDEA",
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Radius.md,
  },
  statusText: {
    fontFamily: Fonts.body,
    fontSize: 12,
    fontWeight: "700",
    color: colors.primary,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#EAE7E1",
    borderRadius: Radius.lg,
    padding: Spacing.three,
    gap: Spacing.three,
  },
  sectionTitle: {
    fontFamily: Fonts.heading,
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
  },
  detail: { gap: 4 },
  detailLabel: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: colors.textSecondary,
  },
  detailValue: {
    fontFamily: Fonts.body,
    fontSize: 14,
    color: colors.text,
    fontWeight: "600",
  },
  fieldLabel: {
    fontFamily: Fonts.body,
    fontSize: 13,
    color: colors.text,
  },
  reasonInput: {
    minHeight: 100,
    borderWidth: 1,
    borderColor: "#EAE7E1",
    borderRadius: Radius.md,
    padding: Spacing.three,
    fontFamily: Fonts.body,
    fontSize: 14,
    color: colors.text,
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
  note: {
    fontFamily: Fonts.body,
    fontSize: 12,
    lineHeight: 18,
    color: colors.textSecondary,
  },
  loader: { marginTop: 40 },
  message: {
    alignItems: "center",
    padding: Spacing.four,
    gap: Spacing.two,
  },
  error: {
    fontFamily: Fonts.body,
    color: colors.error,
    textAlign: "center",
  },
});