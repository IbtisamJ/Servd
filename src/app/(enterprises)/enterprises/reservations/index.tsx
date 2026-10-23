import FontAwesome5 from "@react-native-vector-icons/fontawesome5";
import { router } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { BrandHeader } from "@/components/enterprise";
import { auth, db } from "@/config/firebase";
import { COLLECTIONS, RESERVATION_STATUS } from "@/constants/roles";
import { Colors, Fonts, Radius, Spacing } from "@/constants/theme";

const colors = Colors.light;

type Reservation = {
  id: string;
  reservationId?: string;
  enterpriseId?: string;
  donationId?: string;
  donationDocumentId?: string;
  ngoId?: string;
  ngoName?: string;
  organizationName?: string;
  foodName?: string;
  category?: string;
  quantity?: number;
  status?: string;
  createdTimestamp?: unknown;
  reservedAt?: unknown;
  collectionDeadline?: unknown;
  collectionLocation?: string;
};

type FilterType = "all" | "active" | "collected" | "cancelled";

function getDate(value: unknown): Date | null {
  if (!value) return null;

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  if (
    typeof value === "object" &&
    value !== null &&
    "toDate" in value &&
    typeof value.toDate === "function"
  ) {
    const date = value.toDate();

    return date instanceof Date && !Number.isNaN(date.getTime()) ? date : null;
  }

  return null;
}

function formatDate(value: unknown): string {
  const date = getDate(value);

  if (!date) return "Date unavailable";

  return date.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getStatusStyle(status?: string) {
  switch ((status ?? "").toLowerCase()) {
    case RESERVATION_STATUS.ACTIVE:
      return {
        label: "Active",
        backgroundColor: "#FFF0D5",
        color: "#996400",
      };

    case RESERVATION_STATUS.COLLECTED:
      return {
        label: "Collected",
        backgroundColor: "#E5F4E8",
        color: "#287A3D",
      };

    case RESERVATION_STATUS.CANCELLED:
      return {
        label: "Cancelled",
        backgroundColor: "#FCE8E6",
        color: colors.error,
      };

    default:
      return {
        label: status || "Unknown",
        backgroundColor: colors.backgroundElement,
        color: colors.textSecondary,
      };
  }
}

function matchesFilter(reservation: Reservation, filter: FilterType): boolean {
  const status = (reservation.status ?? "").toLowerCase();

  if (filter === "all") return true;
  if (filter === "active") {
    return status === RESERVATION_STATUS.ACTIVE;
  }
  if (filter === "collected") {
    return status === RESERVATION_STATUS.COLLECTED;
  }

  return status === RESERVATION_STATUS.CANCELLED;
}

export default function ReservationsScreen() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(
    auth.currentUser?.uid ?? null,
  );
  const [filter, setFilter] = useState<FilterType>("all");
  const [loadError, setLoadError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUserId(user?.uid ?? null);
      setAuthLoading(false);

      if (!user) {
        router.replace("/Login" as never);
      }
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (authLoading) return;

    if (!userId) {
      setReservations([]);
      setLoading(false);
      setLoadError(false);
      return;
    }

    setLoading(true);
    setLoadError(false);

    const reservationsQuery = query(
      collection(db, COLLECTIONS.RESERVATIONS),
      where("enterpriseId", "==", userId),
    );

    const unsubscribe = onSnapshot(
      reservationsQuery,
      (snapshot) => {
        const results: Reservation[] = snapshot.docs.map((item) => ({
          id: item.id,
          ...(item.data() as Omit<Reservation, "id">),
        }));

        results.sort((a, b) => {
          const dateA =
            getDate(a.createdTimestamp ?? a.reservedAt)?.getTime() ?? 0;
          const dateB =
            getDate(b.createdTimestamp ?? b.reservedAt)?.getTime() ?? 0;

          return dateB - dateA;
        });

        setReservations(results);
        setLoading(false);
        setLoadError(false);
      },
      (error) => {
        console.error("Error loading reservations:", error);
        setLoadError(true);
        setLoading(false);
      },
    );

    return unsubscribe;
  }, [authLoading, userId, retryKey]);

  const filteredReservations = useMemo(
    () => reservations.filter((item) => matchesFilter(item, filter)),
    [reservations, filter],
  );

  const activeCount = reservations.filter(
    (item) => (item.status ?? "").toLowerCase() === RESERVATION_STATUS.ACTIVE,
  ).length;

  const collectedCount = reservations.filter(
    (item) =>
      (item.status ?? "").toLowerCase() === RESERVATION_STATUS.COLLECTED,
  ).length;

  const cancelledCount = reservations.filter(
    (item) =>
      (item.status ?? "").toLowerCase() === RESERVATION_STATUS.CANCELLED,
  ).length;

  const filters: { label: string; value: FilterType }[] = [
    { label: "All", value: "all" },
    { label: "Active", value: "active" },
    { label: "Collected", value: "collected" },
    { label: "Cancelled", value: "cancelled" },
  ];

  const retryLoading = useCallback(() => {
    setRetryKey((current) => current + 1);
  }, []);

  if (authLoading || loading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.helperText}>Loading your reservations...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!userId) {
    return (
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <View style={styles.centered}>
          <Text style={styles.helperText}>Redirecting to sign in...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.screen}>
        <BrandHeader
          role="ENTERPRISE"
          actionLabel="Home"
          onActionPress={() => router.replace("/enterprises" as never)}
        />

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.workspace}>
            <View style={styles.header}>
              <View style={styles.headerCopy}>
                <Text style={styles.eyebrow}>YOUR ENTERPRISE</Text>
                <Text style={styles.heading}>Collections</Text>
                <Text style={styles.subtitle}>
                  Track reservations made for your food donations.
                </Text>
              </View>

              <View style={styles.headerIcon}>
                <FontAwesome5
                  name="clipboard-list"
                  size={22}
                  color="#FFFFFF"
                  iconStyle="solid"
                />
              </View>
            </View>

            <View style={styles.summaryRow}>
              <View style={styles.summaryCard}>
                <View style={styles.summaryIcon}>
                  <FontAwesome5
                    name="calendar-check"
                    size={15}
                    color={colors.secondary}
                    iconStyle="solid"
                  />
                </View>
                <Text style={styles.summaryValue}>{activeCount}</Text>
                <Text style={styles.summaryLabel}>Active</Text>
              </View>

              <View style={styles.summaryCard}>
                <View
                  style={[styles.summaryIcon, { backgroundColor: "#E5F4E8" }]}
                >
                  <FontAwesome5
                    name="check-circle"
                    size={15}
                    color="#287A3D"
                    iconStyle="solid"
                  />
                </View>
                <Text style={styles.summaryValue}>{collectedCount}</Text>
                <Text style={styles.summaryLabel}>Collected</Text>
              </View>

              <View style={styles.summaryCard}>
                <View
                  style={[styles.summaryIcon, { backgroundColor: "#FCE8E6" }]}
                >
                  <FontAwesome5
                    name="times-circle"
                    size={15}
                    color={colors.primary}
                    iconStyle="solid"
                  />
                </View>
                <Text style={styles.summaryValue}>{cancelledCount}</Text>
                <Text style={styles.summaryLabel}>Cancelled</Text>
              </View>
            </View>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Your reservations</Text>
              <Text style={styles.resultCount}>
                {filteredReservations.length}
              </Text>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterRow}
            >
              {filters.map((item) => {
                const selected = filter === item.value;

                return (
                  <Pressable
                    key={item.value}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    onPress={() => setFilter(item.value)}
                    style={[
                      styles.filterButton,
                      selected && styles.filterButtonActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.filterText,
                        selected && styles.filterTextActive,
                      ]}
                    >
                      {item.label}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            {loadError ? (
              <View style={styles.emptyCard}>
                <View style={styles.emptyIcon}>
                  <FontAwesome5
                    name="exclamation-circle"
                    size={25}
                    color={colors.primary}
                    iconStyle="solid"
                  />
                </View>

                <Text style={styles.emptyTitle}>
                  Couldn't load reservations
                </Text>

                <Text style={styles.helperText}>
                  Check your connection and Firestore permissions, then try
                  again.
                </Text>

                <Pressable onPress={retryLoading} style={styles.primaryButton}>
                  <Text style={styles.primaryButtonText}>Try again</Text>
                </Pressable>
              </View>
            ) : filteredReservations.length === 0 ? (
              <View style={styles.emptyCard}>
                <View style={styles.emptyIcon}>
                  <FontAwesome5
                    name="clipboard-list"
                    size={26}
                    color={colors.secondary}
                    iconStyle="solid"
                  />
                </View>

                <Text style={styles.emptyTitle}>
                  {filter === "all"
                    ? "No reservations yet"
                    : `No ${filter} reservations`}
                </Text>

                <Text style={styles.helperText}>
                  {filter === "all"
                    ? "Reservations for your donations will appear here when organisations reserve them."
                    : "Try another filter to see your other reservations."}
                </Text>

                {filter !== "all" ? (
                  <Pressable
                    onPress={() => setFilter("all")}
                    style={styles.secondaryButton}
                  >
                    <Text style={styles.secondaryButtonText}>
                      View all reservations
                    </Text>
                  </Pressable>
                ) : (
                  <Pressable
                    onPress={() =>
                      router.push("/enterprises/donations" as never)
                    }
                    style={styles.primaryButton}
                  >
                    <Text style={styles.primaryButtonText}>View donations</Text>
                  </Pressable>
                )}
              </View>
            ) : (
              <View style={styles.list}>
                {filteredReservations.map((reservation) => {
                  const status = getStatusStyle(reservation.status);

                  const title =
                    reservation.foodName ||
                    (reservation.donationId
                      ? `Donation ${reservation.donationId}`
                      : `Reservation ${reservation.id}`);

                  const organisation =
                    reservation.organizationName ||
                    reservation.ngoName ||
                    (reservation.ngoId
                      ? `Organisation ID: ${reservation.ngoId}`
                      : "Organisation details unavailable");

                  return (
                    <View key={reservation.id} style={styles.reservationCard}>
                      <View style={styles.reservationTop}>
                        <View style={styles.foodIcon}>
                          <FontAwesome5
                            name="utensils"
                            size={18}
                            color={colors.secondary}
                            iconStyle="solid"
                          />
                        </View>

                        <View style={styles.reservationCopy}>
                          <Text
                            style={styles.reservationTitle}
                            numberOfLines={2}
                          >
                            {title}
                          </Text>
                          <Text style={styles.organisation} numberOfLines={2}>
                            {organisation}
                          </Text>
                        </View>

                        <View
                          style={[
                            styles.statusBadge,
                            { backgroundColor: status.backgroundColor },
                          ]}
                        >
                          <Text
                            style={[styles.statusText, { color: status.color }]}
                          >
                            {status.label}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.cardDivider} />

                      {reservation.quantity != null ? (
                        <View style={styles.infoRow}>
                          <FontAwesome5
                            name="boxes"
                            size={13}
                            color={colors.textSecondary}
                            iconStyle="solid"
                          />
                          <Text style={styles.infoText}>
                            Quantity: {reservation.quantity}
                          </Text>
                        </View>
                      ) : null}

                      <View style={styles.infoRow}>
                        <FontAwesome5
                          name="calendar-alt"
                          size={13}
                          color={colors.textSecondary}
                          iconStyle="solid"
                        />
                        <Text style={styles.infoText}>
                          Reserved:{" "}
                          {formatDate(
                            reservation.createdTimestamp ??
                              reservation.reservedAt,
                          )}
                        </Text>
                      </View>

                      {reservation.collectionDeadline ? (
                        <View style={styles.infoRow}>
                          <FontAwesome5
                            name="clock"
                            size={13}
                            color={colors.textSecondary}
                            iconStyle="solid"
                          />
                          <Text style={styles.infoText}>
                            Collection by:{" "}
                            {formatDate(reservation.collectionDeadline)}
                          </Text>
                        </View>
                      ) : null}

                      {reservation.collectionLocation ? (
                        <View style={styles.infoRow}>
                          <FontAwesome5
                            name="map-marker-alt"
                            size={13}
                            color={colors.textSecondary}
                            iconStyle="solid"
                          />
                          <Text style={styles.infoText}>
                            {reservation.collectionLocation}
                          </Text>
                        </View>
                      ) : null}

                      {reservation.donationId ? (
                        <Text style={styles.referenceText}>
                          Reference: {reservation.donationId}
                        </Text>
                      ) : null}
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.four,
  },
  workspace: {
    width: "100%",
    maxWidth: 800,
    alignSelf: "center",
    gap: Spacing.three,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
  },
  headerCopy: {
    flex: 1,
    gap: Spacing.two,
  },
  eyebrow: {
    fontFamily: Fonts.body,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.2,
    color: colors.secondary,
  },
  heading: {
    fontFamily: Fonts.heading,
    fontSize: 26,
    color: colors.text,
  },
  subtitle: {
    fontFamily: Fonts.body,
    fontSize: 12,
    lineHeight: 19,
    color: colors.textSecondary,
  },
  headerIcon: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Radius.md,
    backgroundColor: colors.primary,
  },
  summaryRow: {
    flexDirection: "row",
    gap: Spacing.two,
  },
  summaryCard: {
    flex: 1,
    minHeight: 112,
    alignItems: "flex-start",
    justifyContent: "center",
    padding: Spacing.two,
    gap: 5,
    borderRadius: Radius.lg,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: colors.backgroundElement,
  },
  summaryIcon: {
    width: 30,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Radius.md,
    backgroundColor: "#E8F4F1",
  },
  summaryValue: {
    fontFamily: Fonts.heading,
    fontSize: 21,
    color: colors.text,
  },
  summaryLabel: {
    fontFamily: Fonts.body,
    fontSize: 10,
    color: colors.textSecondary,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: {
    fontFamily: Fonts.heading,
    fontSize: 19,
    color: colors.text,
  },
  resultCount: {
    minWidth: 28,
    textAlign: "center",
    overflow: "hidden",
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: Radius.md,
    backgroundColor: colors.backgroundElement,
    color: colors.text,
    fontFamily: Fonts.button,
    fontSize: 11,
    fontWeight: "700",
  },
  filterRow: {
    gap: Spacing.two,
    paddingBottom: Spacing.one,
  },
  filterButton: {
    paddingHorizontal: Spacing.three,
    paddingVertical: 9,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: colors.backgroundElement,
    backgroundColor: "#FFFFFF",
  },
  filterButtonActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  filterText: {
    fontFamily: Fonts.button,
    fontSize: 11,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  filterTextActive: {
    color: "#FFFFFF",
  },
  list: {
    gap: Spacing.three,
  },
  reservationCard: {
    padding: Spacing.three,
    gap: Spacing.two,
    borderRadius: Radius.lg,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: colors.backgroundElement,
  },
  reservationTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.two,
  },
  foodIcon: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Radius.md,
    backgroundColor: "#E8F4F1",
  },
  reservationCopy: {
    flex: 1,
    gap: 4,
  },
  reservationTitle: {
    fontFamily: Fonts.button,
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 19,
    color: colors.text,
  },
  organisation: {
    fontFamily: Fonts.body,
    fontSize: 10,
    lineHeight: 16,
    color: colors.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: Radius.md,
  },
  statusText: {
    fontFamily: Fonts.button,
    fontSize: 9,
    fontWeight: "700",
  },
  cardDivider: {
    height: 1,
    marginVertical: Spacing.one,
    backgroundColor: colors.backgroundElement,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.two,
  },
  infoText: {
    flex: 1,
    fontFamily: Fonts.body,
    fontSize: 11,
    lineHeight: 17,
    color: colors.textSecondary,
  },
  referenceText: {
    marginTop: Spacing.one,
    fontFamily: Fonts.body,
    fontSize: 9,
    color: colors.textSecondary,
  },
  emptyCard: {
    alignItems: "center",
    padding: Spacing.four,
    gap: Spacing.three,
    borderRadius: Radius.lg,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: colors.backgroundElement,
  },
  emptyIcon: {
    width: 62,
    height: 62,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 31,
    backgroundColor: "#E8F4F1",
  },
  emptyTitle: {
    fontFamily: Fonts.heading,
    fontSize: 19,
    textAlign: "center",
    color: colors.text,
  },
  helperText: {
    fontFamily: Fonts.body,
    fontSize: 12,
    lineHeight: 19,
    textAlign: "center",
    color: colors.textSecondary,
  },
  primaryButton: {
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.four,
    borderRadius: Radius.md,
    backgroundColor: colors.primary,
  },
  primaryButtonText: {
    fontFamily: Fonts.button,
    fontSize: 12,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  secondaryButton: {
    minHeight: 42,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.three,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: colors.backgroundElement,
    backgroundColor: "#FFFFFF",
  },
  secondaryButtonText: {
    fontFamily: Fonts.button,
    fontSize: 11,
    fontWeight: "700",
    color: colors.text,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.four,
    gap: Spacing.three,
    backgroundColor: colors.background,
  },
});
