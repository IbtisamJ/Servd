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

import { Colors, Fonts, Radius, Spacing } from "@/constants/theme";
import {
  getReservations,
  updateReservationStatus,
} from "@/services/reservationService";

const colors = Colors.light;

type IconName = React.ComponentProps<typeof FontAwesome5>["name"];

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

type ReservationStatusStyle = {
  backgroundColor: string;
  color: string;
  icon: IconName;
};

// Standardises status values so comparisons remain consistent.
const normalizeStatus = (status?: string) =>
  (status ?? "unknown").toLowerCase();

// Converts Firestore timestamps into readable dates.
const formatDate = (timestamp?: { seconds?: number }) =>
  timestamp?.seconds
    ? new Date(timestamp.seconds * 1000).toLocaleString()
    : "Not available";

// Returns the colours and icon associated with each reservation status.
const getStatusStyle = (status: string): ReservationStatusStyle => {
  switch (status) {
    case "active":
      return {
        backgroundColor: "#DDF0EE",
        color: colors.secondary,
        icon: "clock",
      };
    case "collected":
      return {
        backgroundColor: "#E6ECD9",
        color: colors.accent,
        icon: "check-circle",
      };
    case "cancelled":
      return {
        backgroundColor: "#F6DEDA",
        color: colors.error,
        icon: "times-circle",
      };
    default:
      return {
        backgroundColor: colors.backgroundSelected,
        color: colors.textSecondary,
        icon: "info-circle",
      };
  }
};

export default function ReservationDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Loads the selected reservation and handles missing IDs or failed requests.
  const loadReservation = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      if (!id) {
        setReservation(null);
        setError("Reservation ID is missing.");
        return;
      }

      const reservations = (await getReservations()) as Reservation[];

      const found = reservations.find(
        (item) => item.id === id || item.reservationId === id,
      );

      setReservation(found ?? null);

      if (!found) {
        setError("Reservation not found.");
      }
    } catch (err) {
      console.error("Failed to load reservation:", err);
      setReservation(null);
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

  // Confirms status changes before updating the reservation and its donation.
  const changeStatus = (nextStatus: "collected" | "cancelled") => {
    if (saving || !reservation) return;

    if (!reservation.donationId) {
      Alert.alert("Unable to update", "The donation ID is missing.");
      return;
    }

    Alert.alert(
      nextStatus === "collected" ? "Mark as collected?" : "Cancel reservation?",
      nextStatus === "collected"
        ? "Confirm that the donation has been collected."
        : "This will cancel the reservation and make the donation available again.",
      [
        { text: "Keep reservation", style: "cancel" },
        {
          text: "Confirm",
          style: nextStatus === "cancelled" ? "destructive" : "default",
          onPress: async () => {
            setSaving(true);

            try {
              const result = await updateReservationStatus(
                reservation.id,
                reservation.donationId!,
                nextStatus,
              );

              if (!result.success) {
                Alert.alert(
                  "Update failed",
                  result.error ?? "Please try again.",
                );
                return;
              }

              await loadReservation();

              Alert.alert("Updated", `Reservation marked ${nextStatus}.`);
            } catch (err) {
              console.error("Failed to update reservation:", err);
              Alert.alert(
                "Update failed",
                err instanceof Error ? err.message : "Please try again.",
              );
            } finally {
              setSaving(false);
            }
          },
        },
      ],
    );
  };

  // Reusable layout for displaying a reservation field.
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

  // Groups related reservation details into a card with a heading.
  function SectionCard({
    title,
    icon,
    children,
  }: {
    title: string;
    icon: any;
    children: React.ReactNode;
  }) {
    return (
      <View style={styles.card}>
        <View style={styles.sectionHeading}>
          <View style={styles.sectionIcon}>
            <FontAwesome5
              name={icon}
              size={15}
              color={colors.primary}
              iconStyle="solid"
            />
          </View>
          <Text style={styles.sectionTitle}>{title}</Text>
        </View>
        {children}
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator size="large" color={colors.secondary} />
        <Text style={styles.muted}>Loading reservation details...</Text>
      </View>
    );
  }

  if (!reservation) {
    return (
      <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
        <View style={styles.container}>
          <Pressable style={styles.back} onPress={() => router.back()}>
            <FontAwesome5
              name="arrow-left"
              size={14}
              color={colors.textSecondary}
              iconStyle="solid"
            />
            <Text style={styles.backText}>Back to reservations</Text>
          </Pressable>

          <View style={styles.stateCard}>
            <View style={styles.errorIcon}>
              <FontAwesome5
                name="exclamation-circle"
                size={22}
                color={colors.error}
                iconStyle="solid"
              />
            </View>

            <Text style={styles.stateTitle}>Unable to load reservation</Text>
            <Text style={styles.error}>
              {error || "Reservation not found."}
            </Text>

            <Pressable style={styles.primaryButton} onPress={loadReservation}>
              <FontAwesome5
                name="redo"
                size={13}
                color="#FFFFFF"
                iconStyle="solid"
              />
              <Text style={styles.buttonText}>Try again</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    );
  }

  const status = normalizeStatus(reservation.status);
  const statusStyle = getStatusStyle(status);
  const canUpdate = status === "active";

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.container}>
        <Pressable
          style={styles.back}
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Back to reservations"
        >
          <FontAwesome5
            name="arrow-left"
            size={14}
            color={colors.textSecondary}
            iconStyle="solid"
          />
          <Text style={styles.backText}>Back to reservations</Text>
        </Pressable>

        <View style={styles.hero}>
          <View style={styles.heroTop}>
            <View style={styles.avatar}>
              <FontAwesome5
                name="calendar-check"
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
                size={12}
                color={colors.primary}
                iconStyle="solid"
              />
              <Text style={[styles.statusText, { color: statusStyle.color }]}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Text>
            </View>
          </View>

          <Text style={styles.eyebrow}>SERVD / ADMINISTRATION</Text>
          <Text style={styles.title}>Reservation details</Text>
          <Text style={styles.subtitle}>
            Review the reservation, associated organisations, and collection
            status.
          </Text>

          <View style={styles.idRow}>
            <Text style={styles.idLabel}>RESERVATION ID</Text>
            <Text style={styles.idValue} selectable>
              {reservation.reservationId ?? reservation.id}
            </Text>
          </View>
        </View>

        <SectionCard title="Reservation information" icon="clipboard-list">
          {detail(
            "Reservation ID",
            reservation.reservationId ?? reservation.id,
          )}
          {detail("Current status", status.toUpperCase())}
          {detail("Created", formatDate(reservation.createdTimestamp))}
          {detail("Last updated", formatDate(reservation.updatedTimestamp))}
        </SectionCard>

        <SectionCard title="Related records" icon="link">
          {detail("Donation ID", reservation.donationId)}
          {detail("NGO ID", reservation.ngoId)}
          {detail("Enterprise ID", reservation.enterpriseId)}
        </SectionCard>

        <SectionCard title="Collection management" icon="hand-holding-heart">
          {canUpdate ? (
            <>
              <View style={styles.notice}>
                <FontAwesome5
                  name="info-circle"
                  size={15}
                  color={colors.secondary}
                  iconStyle="solid"
                />
                <Text style={styles.noticeText}>
                  Mark the reservation as collected once the donation has been
                  handed over, or cancel it if the collection will not take
                  place.
                </Text>
              </View>

              <Pressable
                style={[styles.collectButton, saving && styles.disabledButton]}
                onPress={() => changeStatus("collected")}
                disabled={saving}
                accessibilityRole="button"
              >
                {saving ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <FontAwesome5
                    name="check"
                    size={14}
                    color="#FFFFFF"
                    iconStyle="solid"
                  />
                )}
                <Text style={styles.buttonText}>
                  {saving ? "Updating..." : "Mark as collected"}
                </Text>
              </Pressable>

              <Pressable
                style={[styles.cancelButton, saving && styles.disabledButton]}
                onPress={() => changeStatus("cancelled")}
                disabled={saving}
                accessibilityRole="button"
              >
                <FontAwesome5
                  name="times"
                  size={14}
                  color={colors.error}
                  iconStyle="solid"
                />
                <Text style={styles.cancelButtonText}>Cancel reservation</Text>
              </Pressable>
            </>
          ) : (
            <View style={styles.notice}>
              <FontAwesome5
                name="lock"
                size={15}
                color={colors.textSecondary}
                iconStyle="solid"
              />
              <Text style={styles.noticeText}>
                This reservation is no longer active, so its status cannot be
                changed here.
              </Text>
            </View>
          )}
        </SectionCard>
      </View>
    </ScrollView>
  );
}

// Shared styles keep the layout and appearance consistent across sections.
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  loadingScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.three,
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
    alignSelf: "flex-start",
    gap: Spacing.two,
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
    flex: 1,
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
    lineHeight: 20,
    fontWeight: "600",
    color: colors.text,
  },
  notice: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.two,
    padding: Spacing.three,
    borderRadius: Radius.md,
    backgroundColor: "#E9F4F1",
  },
  noticeText: {
    flex: 1,
    fontFamily: Fonts.body,
    fontSize: 12,
    lineHeight: 18,
    color: colors.text,
  },
  collectButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.two,
    padding: Spacing.three,
    borderRadius: Radius.md,
    backgroundColor: colors.secondary,
  },
  cancelButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.two,
    padding: Spacing.three,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: "#F0C9C4",
    backgroundColor: "#F6DEDA",
  },
  cancelButtonText: {
    fontFamily: Fonts.body,
    fontSize: 14,
    fontWeight: "700",
    color: colors.error,
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonText: {
    fontFamily: Fonts.body,
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  stateCard: {
    alignItems: "center",
    gap: Spacing.three,
    padding: Spacing.five,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: colors.backgroundElement,
    backgroundColor: colors.background,
  },
  errorIcon: {
    width: 48,
    height: 48,
    borderRadius: Radius.lg,
    backgroundColor: "#F6DEDA",
    alignItems: "center",
    justifyContent: "center",
  },
  stateTitle: {
    fontFamily: Fonts.heading,
    fontSize: 19,
    fontWeight: "700",
    color: colors.text,
    textAlign: "center",
  },
  error: {
    fontFamily: Fonts.body,
    fontSize: 13,
    lineHeight: 19,
    color: colors.error,
    textAlign: "center",
  },
  muted: {
    fontFamily: Fonts.body,
    fontSize: 13,
    color: colors.textSecondary,
  },
  primaryButton: {
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
