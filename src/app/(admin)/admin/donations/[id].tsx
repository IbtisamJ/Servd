/**
 * Donation Details Screen
 *
 * Retrieves and displays the details of an individual food donation.
 * Uses the donation's Firestore document ID to identify the record
 * and provides access to its stored information and status.
 *
 * Responsibilities:
 * - Loads donation records through the donation service.
 * - Locates and displays the selected donation.
 * - Displays donation details and current status.
 * - Supports the status actions implemented by the screen.
 * - Handles loading and missing-record states.
 * - Provides navigation back to the donation list.
 */

import FontAwesome5 from "@react-native-vector-icons/fontawesome5";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
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

import { getDonations, updateDonation } from "@/services/donationService";
import { Colors, Fonts, Spacing } from "@/constants/theme";

const colors = Colors.light;

type Donation = {
  id?: string;
  donationId?: string;
  foodName?: string;
  enterpriseName?: string;
  enterpriseId?: string;
  quantity?: number | string;
  status?: string;
  collectionLocation?: string;
  description?: string;
  expiryDate?: string;
};

const normalizeStatus = (status?: string) =>
  (status ?? "unknown").toLowerCase();

export default function DonationDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [donation, setDonation] = useState<Donation | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadDonation = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const result = (await getDonations()) as unknown as Donation[];
      const found = result.find(
        (item) => item.id === id || item.donationId === id
      );

      setDonation(found ?? null);

      if (!found) {
        setError("Donation not found.");
      }
    } catch (err) {
      console.error("Failed to load donation:", err);
      setError("Could not load donation details. Check your connection and permissions.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadDonation();
  }, [loadDonation]);

  const changeStatus = (status: "cancelled") => {
    if (!id || !donation || saving) return;

    Alert.alert(
      "Cancel donation?",
      'This will change the donation status to "cancelled".',
      [
        { text: "Keep donation", style: "cancel" },
        {
          text: "Confirm cancellation",
          style: "destructive",
          onPress: async () => {
            setSaving(true);

            try {
              await updateDonation(id, { status } as never);

              setDonation((current) =>
                current ? { ...current, status } : current
              );

              Alert.alert("Updated", "Donation status was updated.");
            } catch (err) {
              console.error("Failed to update donation:", err);
              Alert.alert(
                "Update failed",
                "The donation could not be updated. Check Firestore permissions."
              );
            } finally {
              setSaving(false);
            }
          },
        },
      ]
    );
  };

  function detail(label: string, value?: string | number) {
    return (
      <View style={styles.detail} key={label}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>
          {value !== undefined && value !== "" ? String(value) : "Not provided"}
        </Text>
      </View>
    );
  }

  const status = normalizeStatus(donation?.status);
  const canCancel = status === "available";

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Pressable onPress={() => router.back()} style={styles.back}>
          <FontAwesome5
            name="arrow-left"
            size={14}
            color={colors.primary}
            iconStyle="solid"
          />
          <Text style={styles.backText}>Back to donations</Text>
        </Pressable>

        {loading ? (
          <ActivityIndicator color={colors.primary} style={styles.loader} />
        ) : error ? (
          <View>
            <Text style={styles.error}>{error}</Text>
            <Pressable onPress={loadDonation} style={styles.retry}>
              <Text style={styles.backText}>Tap to retry</Text>
            </Pressable>
          </View>
        ) : donation ? (
          <>
            <View style={styles.hero}>
              <View style={styles.icon}>
                <FontAwesome5
                  name="box"
                  size={26}
                  color={colors.secondary}
                  iconStyle="solid"
                />
              </View>
              <Text style={styles.title}>
                {donation.foodName || "Donation details"}
              </Text>
              <Text style={styles.status}>{status.toUpperCase()}</Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Donation information</Text>
              {detail("Food item", donation.foodName)}
              {detail("Quantity", donation.quantity)}
              {detail("Description", donation.description)}
              {detail("Expiry date", donation.expiryDate)}
              {detail("Collection location", donation.collectionLocation)}
            </View>

            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Donor information</Text>
              {detail("Enterprise", donation.enterpriseName)}
              {detail("Enterprise ID", donation.enterpriseId)}
              {detail("Donation ID", donation.id ?? donation.donationId ?? id)}
            </View>

            {canCancel && (
              <Pressable
                disabled={saving}
                style={styles.cancelButton}
                onPress={() => changeStatus("cancelled")}
              >
                {saving ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <FontAwesome5
                      name="ban"
                      size={15}
                      color="#FFFFFF"
                      iconStyle="solid"
                    />
                    <Text style={styles.cancelText}>Cancel donation</Text>
                  </>
                )}
              </Pressable>
            )}
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: Spacing.three, gap: Spacing.three },
  back: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 8,
  },
  backText: {
    color: colors.primary,
    fontFamily: Fonts.body,
    fontWeight: "600",
  },
  loader: { marginTop: 40 },
  error: { color: colors.error, textAlign: "center", marginTop: 24 },
  retry: { alignItems: "center", padding: Spacing.three },
  hero: { alignItems: "center", paddingVertical: Spacing.three, gap: 10 },
  icon: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: "#E8F3F1",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontFamily: Fonts.heading,
    fontSize: 23,
    fontWeight: "700",
    color: colors.text,
    textAlign: "center",
  },
  status: {
    fontFamily: Fonts.body,
    fontSize: 11,
    fontWeight: "700",
    color: colors.secondary,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#EAE7E1",
    padding: Spacing.three,
    gap: Spacing.three,
  },
  sectionTitle: {
    fontFamily: Fonts.heading,
    fontSize: 17,
    fontWeight: "700",
    color: colors.text,
  },
  detail: { gap: 4 },
  label: { fontFamily: Fonts.body, fontSize: 12, color: colors.textSecondary },
  value: { fontFamily: Fonts.body, fontSize: 14, color: colors.text },
  cancelButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: Spacing.three,
  },
  cancelText: {
    color: "#FFFFFF",
    fontFamily: Fonts.button,
    fontWeight: "700",
  },
});