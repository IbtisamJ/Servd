/**
 * Reservation Details Screen
 *
 * Loads and displays a selected reservation and provides the
 * administrator with its related identifiers, status, and timestamps.
 * Uses the reservation service to update reservation and donation
 * statuses together.
 *
 * Responsibilities:
 * - Loads reservation records and locates the selected reservation.
 * - Displays reservation, donation, NGO, and enterprise IDs.
 * - Displays creation and last-updated timestamps.
 * - Allows active reservations to be marked as collected.
 * - Allows active reservations to be cancelled.
 * - Confirms status changes before submitting them.
 * - Displays update errors and refreshes the record after success.
 * - Prevents further status changes when a reservation is inactive.
 */

import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

import {
  getReservations,
  updateReservationStatus,
} from "@/services/reservationService";
import { Colors, Radius, Spacing } from "@/constants/theme";

type Reservation = {
  id: string;
  reservationId?: string;
  donationId?: string;
  ngoId?: string;
  enterpriseId?: string;
  status?: string;
  createdTimestamp?: { seconds?: number };
  updatedTimestamp?: { seconds?: number };
};

const normalizeStatus = (status?: string) =>
  (status ?? "unknown").toLowerCase();

const formatDate = (timestamp?: { seconds?: number }) =>
  timestamp?.seconds
    ? new Date(timestamp.seconds * 1000).toLocaleString()
    : "Not available";

export default function ReservationDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadReservation = useCallback(async () => {
    try {
      setError("");
      const reservations = (await getReservations()) as Reservation[];
      const found = reservations.find((item) => item.id === id);

      setReservation(found ?? null);

      if (!found) setError("Reservation not found.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not load reservation.",
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadReservation();
  }, [loadReservation]);

  const changeStatus = (status: "collected" | "cancelled") => {
    if (!reservation?.donationId) {
      Alert.alert("Unable to update", "The donation ID is missing.");
      return;
    }

    Alert.alert(
      status === "collected" ? "Mark as collected?" : "Cancel reservation?",
      status === "collected"
        ? "Confirm that the donation has been collected."
        : "This will cancel the reservation and make the donation available again.",
      [
        { text: "Keep reservation", style: "cancel" },
        {
          text: "Confirm",
          onPress: async () => {
            setSaving(true);

            const result = await updateReservationStatus(
              reservation.id,
              reservation.donationId!,
              status,
            );

            setSaving(false);

            if (!result.success) {
              Alert.alert("Update failed", result.error ?? "Please try again.");
              return;
            }

            await loadReservation();
            Alert.alert("Updated", `Reservation marked ${status}.`);
          },
        },
      ],
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
        <Text style={styles.muted}>Loading reservation…</Text>
      </View>
    );
  }

  if (!reservation) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Reservation details</Text>
        <Text style={styles.error}>{error || "Reservation not found."}</Text>
        <Text style={styles.link} onPress={() => router.back()}>
          ← Back to reservations
        </Text>
      </View>
    );
  }

  const status = normalizeStatus(reservation.status);
  const canUpdate = status === "active";

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      <Text style={styles.link} onPress={() => router.back()}>
        ← Back to reservations
      </Text>

      <Text style={styles.title}>Reservation details</Text>
      <Text style={styles.subtitle}>
        Review the reservation and its collection status.
      </Text>

      <View style={styles.card}>
        <Text style={styles.label}>Reservation ID</Text>
        <Text style={styles.value}>
          {reservation.reservationId ?? reservation.id}
        </Text>

        <Text style={styles.label}>Status</Text>
        <Text style={[styles.value, styles.status]}>
          {status.toUpperCase()}
        </Text>

        <Text style={styles.label}>Donation ID</Text>
        <Text style={styles.value}>{reservation.donationId ?? "—"}</Text>

        <Text style={styles.label}>NGO ID</Text>
        <Text style={styles.value}>{reservation.ngoId ?? "—"}</Text>

        <Text style={styles.label}>Enterprise ID</Text>
        <Text style={styles.value}>{reservation.enterpriseId ?? "—"}</Text>

        <Text style={styles.label}>Created</Text>
        <Text style={styles.value}>
          {formatDate(reservation.createdTimestamp)}
        </Text>

        <Text style={styles.label}>Last updated</Text>
        <Text style={styles.value}>
          {formatDate(reservation.updatedTimestamp)}
        </Text>
      </View>

      {canUpdate ? (
        <View style={styles.actions}>
          <Text
            onPress={() => !saving && changeStatus("collected")}
            style={[styles.button, styles.collectButton]}
          >
            {saving ? "Updating…" : "Mark as collected"}
          </Text>

          <Text
            onPress={() => !saving && changeStatus("cancelled")}
            style={[styles.button, styles.cancelButton]}
          >
            Cancel reservation
          </Text>
        </View>
      ) : (
        <Text style={styles.muted}>
          This reservation is no longer active, so its status cannot be changed
          here.
        </Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  container: {
    padding: Spacing.three,
    paddingBottom: Spacing.six,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.two,
    backgroundColor: Colors.light.background,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: Colors.light.text,
    marginTop: Spacing.three,
  },
  subtitle: {
    color: Colors.light.textSecondary,
    marginTop: Spacing.one,
    marginBottom: Spacing.three,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E8E8E8",
    borderRadius: Radius.lg,
    padding: Spacing.three,
  },
  label: {
    color: Colors.light.textSecondary,
    fontSize: 13,
    marginTop: Spacing.three,
  },
  value: {
    color: Colors.light.text,
    fontSize: 16,
    marginTop: Spacing.one,
  },
  status: {
    fontWeight: "700",
  },
  actions: {
    gap: Spacing.two,
    marginTop: Spacing.three,
  },
  button: {
    overflow: "hidden",
    textAlign: "center",
    padding: Spacing.three,
    borderRadius: Radius.md,
    fontWeight: "700",
  },
  collectButton: {
    backgroundColor: Colors.light.secondary,
    color: "#FFFFFF",
  },
  cancelButton: {
    backgroundColor: "#FDECEC",
    color: Colors.light.error,
  },
  link: {
    color: Colors.light.primary,
    fontWeight: "600",
  },
  muted: {
    color: Colors.light.textSecondary,
    marginTop: Spacing.three,
  },
  error: {
    color: Colors.light.error,
    marginTop: Spacing.three,
  },
});
