/**
 * Reservation List Screen
 *
 * Retrieves reservation records through the reservation service
 * and displays them for administrator review.
 *
 * Responsibilities:
 * - Loads reservation records from Firestore through the service.
 * - Displays reservation, donation, NGO, and enterprise identifiers.
 * - Displays reservation status and creation date.
 * - Supports searching by reservation ID, donation ID, NGO ID,
 *   and enterprise ID.
 * - Filters reservations by active, collected, or cancelled status.
 * - Displays reservation overview statistics.
 * - Supports pull-to-refresh and manual refresh.
 * - Handles loading, error, and empty-list states.
 * - Navigates to the selected reservation's detail screen.
 */

import FontAwesome5 from "@react-native-vector-icons/fontawesome5";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { getReservations } from "@/services/reservationService";
import {
  Colors,
  Fonts,
  MaxContentWidth,
  Radius,
  Spacing,
} from "@/constants/theme";

const colors = Colors.light;

type Reservation = {
  id: string;
  reservationId?: string;
  donationId?: string;
  ngoId?: string;
  enterpriseId?: string;
  status?: string;
  createdTimestamp?: { seconds?: number; toDate?: () => Date } | Date | string;
};

const filters = ["All", "Active", "Collected", "Cancelled"] as const;

type ReservationFilter = (typeof filters)[number];

type ReservationStatus = "active" | "collected" | "cancelled";

// Normalises status values for consistent filtering and comparison.
const normalizeStatus = (status?: string) =>
  (status ?? "unknown").toLowerCase();

// Supports Firestore timestamps, JavaScript dates, and date strings.
const formatDate = (timestamp?: Reservation["createdTimestamp"]) => {
  if (!timestamp) return "Date unavailable";

  let date: Date;

  if (timestamp instanceof Date) {
    date = timestamp;
  } else if (typeof timestamp === "string") {
    date = new Date(timestamp);
  } else if (typeof timestamp.toDate === "function") {
    date = timestamp.toDate();
  } else if (typeof timestamp.seconds === "number") {
    date = new Date(timestamp.seconds * 1000);
  } else {
    return "Date unavailable";
  }

  if (Number.isNaN(date.getTime())) return "Date unavailable";

  return date.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const getReservationName = (reservation: Reservation) =>
  reservation.reservationId || reservation.id;

export default function ReservationsScreen() {
  const router = useRouter();

  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ReservationFilter>("All");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  // Fetches reservations and resets loading and refresh states when finished.
  const loadReservations = useCallback(async () => {
    setError("");

    try {
      const data = await getReservations();
      setReservations(data as Reservation[]);
    } catch (err) {
      console.error("Failed to load reservations:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load reservations. Check your connection and permissions.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadReservations();
  }, [loadReservations]);

  // Calculates reservation counts for the overview cards.
  const activeCount = useMemo(
    () =>
      reservations.filter((item) => normalizeStatus(item.status) === "active")
        .length,
    [reservations],
  );

  const collectedCount = useMemo(
    () =>
      reservations.filter(
        (item) => normalizeStatus(item.status) === "collected",
      ).length,
    [reservations],
  );

  const cancelledCount = useMemo(
    () =>
      reservations.filter(
        (item) => normalizeStatus(item.status) === "cancelled",
      ).length,
    [reservations],
  );

  // Applies the search query and selected status filter to the list.
  const filteredReservations = useMemo(() => {
    const query = search.trim().toLowerCase();

    return reservations.filter((item) => {
      const matchesSearch =
        !query ||
        [
          item.id,
          item.reservationId,
          item.donationId,
          item.ngoId,
          item.enterpriseId,
        ].some((value) => value?.toLowerCase().includes(query));

      const status = normalizeStatus(item.status);

      const matchesStatus =
        statusFilter === "All" || status === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [reservations, search, statusFilter]);

  const handleRefresh = useCallback(() => {
    if (refreshing) return;

    setRefreshing(true);
    loadReservations();
  }, [loadReservations, refreshing]);

  const handleRetry = useCallback(() => {
    setLoading(true);
    loadReservations();
  }, [loadReservations]);

  const clearFilters = useCallback(() => {
    setSearch("");
    setStatusFilter("All");
  }, []);

  // Returns the correct reservation count for each filter option.
  const getFilterCount = (filter: ReservationFilter) => {
    switch (filter) {
      case "All":
        return reservations.length;
      case "Active":
        return activeCount;
      case "Collected":
        return collectedCount;
      case "Cancelled":
        return cancelledCount;
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.stateText}>Loading reservations...</Text>
      </View>
    );
  }

  return (
    <FlatList
      style={styles.screen}
      contentContainerStyle={styles.content}
      data={filteredReservations}
      keyExtractor={(item) => item.id}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor={colors.primary}
          colors={[colors.primary]}
        />
      }
      ListHeaderComponent={
        <View style={styles.pageContent}>
          <View style={styles.pageHeader}>
            <View style={styles.pageHeadingGroup}>
              <Text style={styles.eyebrow}>SERVD / MANAGEMENT</Text>

              <Text style={styles.heading}>Reservations</Text>

              <Text style={styles.description}>
                Monitor food donation reservations, track collection progress,
                and review reservation activity.
              </Text>
            </View>

            <Pressable
              onPress={handleRefresh}
              style={({ pressed }) => [
                styles.refreshButton,
                pressed && styles.pressed,
                refreshing && styles.refreshButtonDisabled,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Refresh reservations"
              disabled={refreshing}
            >
              <FontAwesome5
                name="sync-alt"
                size={15}
                color={colors.primary}
                iconStyle="solid"
              />
            </Pressable>
          </View>

          <View style={styles.summarySection}>
            <View style={styles.sectionHeadingRow}>
              <Text style={styles.sectionTitle}>Overview</Text>

              <Text style={styles.mutedText}>{reservations.length} total</Text>
            </View>

            <View style={styles.summaryRow}>
              <Summary
                label="Active"
                value={activeCount}
                color={colors.accent}
                icon="clock"
                active={statusFilter === "Active"}
                onPress={() => setStatusFilter("Active")}
              />

              <Summary
                label="Collected"
                value={collectedCount}
                color={colors.secondary}
                icon="check-circle"
                active={statusFilter === "Collected"}
                onPress={() => setStatusFilter("Collected")}
              />

              <Summary
                label="Cancelled"
                value={cancelledCount}
                color={colors.error}
                icon="times-circle"
                active={statusFilter === "Cancelled"}
                onPress={() => setStatusFilter("Cancelled")}
              />
            </View>
          </View>

          <View style={styles.searchBox}>
            <FontAwesome5
              name="search"
              size={15}
              color={colors.textSecondary}
              iconStyle="solid"
            />

            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search reservations, NGOs, donations..."
              placeholderTextColor={colors.textSecondary}
              style={styles.searchInput}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="search"
              accessibilityLabel="Search reservations"
            />

            {search.length > 0 && (
              <Pressable
                onPress={() => setSearch("")}
                style={styles.clearSearchButton}
                accessibilityRole="button"
                accessibilityLabel="Clear search"
                hitSlop={8}
              >
                <FontAwesome5
                  name="times-circle"
                  size={16}
                  color={colors.textSecondary}
                  iconStyle="solid"
                />
              </Pressable>
            )}
          </View>

          <View style={styles.filterSection}>
            <Text style={styles.filterHeading}>Filter by status</Text>

            <View style={styles.filters}>
              {filters.map((filter) => {
                const selected = statusFilter === filter;
                const count = getFilterCount(filter);

                return (
                  <Pressable
                    key={filter}
                    onPress={() => setStatusFilter(filter)}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    accessibilityLabel={`${filter}, ${count} reservations`}
                    style={({ pressed }) => [
                      styles.filter,
                      selected && styles.filterActive,
                      pressed && styles.pressed,
                    ]}
                  >
                    <Text
                      style={[
                        styles.filterText,
                        selected && styles.filterTextActive,
                      ]}
                    >
                      {filter}
                    </Text>

                    <View
                      style={[
                        styles.filterCount,
                        selected && styles.filterCountActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.filterCountText,
                          selected && styles.filterCountTextActive,
                        ]}
                      >
                        {count}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={styles.resultsHeader}>
            <View style={styles.resultsHeading}>
              <Text style={styles.sectionTitle}>Reservation records</Text>

              <Text style={styles.resultsDescription}>
                Reservation details and collection status
              </Text>
            </View>

            <Text style={styles.resultCount}>
              {filteredReservations.length}{" "}
              {filteredReservations.length === 1 ? "result" : "results"}
            </Text>
          </View>

          {error ? (
            <View style={styles.errorBox}>
              <View style={styles.errorIcon}>
                <FontAwesome5
                  name="exclamation-circle"
                  size={20}
                  color={colors.error}
                  iconStyle="solid"
                />
              </View>

              <View style={styles.errorContent}>
                <Text style={styles.errorTitle}>
                  Unable to load reservations
                </Text>

                <Text style={styles.errorText}>{error}</Text>

                <Pressable
                  onPress={handleRetry}
                  style={styles.retryButton}
                  accessibilityRole="button"
                  accessibilityLabel="Retry loading reservations"
                >
                  <Text style={styles.retryText}>Try again</Text>
                  <FontAwesome5
                    name="arrow-right"
                    size={11}
                    color={colors.primary}
                    iconStyle="solid"
                  />
                </Pressable>
              </View>
            </View>
          ) : null}
        </View>
      }
      renderItem={({ item }) => {
        const status = normalizeStatus(item.status);
        const statusLabel = status.charAt(0).toUpperCase() + status.slice(1);

        return (
          <Pressable
            onPress={() =>
              router.push(`/admin/reservations/${item.id}` as never)
            }
            style={({ pressed }) => [
              styles.reservationCard,
              pressed && styles.cardPressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel={`View reservation ${getReservationName(item)}, status ${status}`}
            accessibilityHint="Opens reservation details"
          >
            <View style={styles.cardHeader}>
              <View style={styles.cardHeadingGroup}>
                <View style={styles.reservationIcon}>
                  <FontAwesome5
                    name="clipboard-list"
                    size={17}
                    color={colors.secondary}
                    iconStyle="solid"
                  />
                </View>

                <View style={styles.cardTitleGroup}>
                  <Text style={styles.cardTitle} numberOfLines={2}>
                    Reservation {getReservationName(item)}
                  </Text>

                  <Text style={styles.cardSubtitle}>
                    Created {formatDate(item.createdTimestamp)}
                  </Text>
                </View>
              </View>

              <StatusBadge status={status} label={statusLabel} />
            </View>

            <View style={styles.cardDivider} />

            <View style={styles.detailsGrid}>
              <Detail label="Donation ID" value={item.donationId} icon="box" />

              <Detail label="NGO ID" value={item.ngoId} icon="building" />

              <Detail
                label="Enterprise ID"
                value={item.enterpriseId}
                icon="store"
              />
            </View>

            <View style={styles.cardFooter}>
              <Text style={styles.openDetails}>View details</Text>

              <FontAwesome5
                name="arrow-right"
                size={12}
                color={colors.primary}
                iconStyle="solid"
              />
            </View>
          </Pressable>
        );
      }}
      ItemSeparatorComponent={() => <View style={styles.listSeparator} />}
      ListEmptyComponent={
        <View style={styles.empty}>
          <View style={styles.emptyIcon}>
            <FontAwesome5
              name="clipboard-list"
              size={25}
              color={colors.textSecondary}
              iconStyle="solid"
            />
          </View>

          <Text style={styles.emptyTitle}>
            {error && reservations.length === 0
              ? "Reservations unavailable"
              : "No reservations found"}
          </Text>

          <Text style={styles.stateText}>
            {error && reservations.length === 0
              ? "Check your connection and try loading the records again."
              : search.trim() || statusFilter !== "All"
                ? "Try another search or change the selected status filter."
                : "Reservations will appear here when they become available."}
          </Text>

          {search.trim() !== "" || statusFilter !== "All" ? (
            <Pressable
              onPress={clearFilters}
              style={styles.clearFiltersButton}
              accessibilityRole="button"
            >
              <Text style={styles.clearFiltersText}>Clear filters</Text>
            </Pressable>
          ) : error ? (
            <Pressable
              onPress={handleRetry}
              style={styles.clearFiltersButton}
              accessibilityRole="button"
            >
              <Text style={styles.clearFiltersText}>Try again</Text>
            </Pressable>
          ) : null}
        </View>
      }
    />
  );
}

// Displays a clickable overview card that filters reservations by status.
function Summary({
  label,
  value,
  color,
  icon,
  onPress,
  active,
}: {
  label: string;
  value: number;
  color: string;
  icon: "clock" | "check-circle" | "times-circle";
  onPress: () => void;
  active: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.summaryCard,
        active && styles.summaryCardActive,
        pressed && styles.pressed,
      ]}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      accessibilityLabel={`${label}: ${value}. Filter reservations by ${label.toLowerCase()}`}
    >
      <View style={styles.summaryTopRow}>
        <View style={[styles.summaryIcon, { backgroundColor: `${color}18` }]}>
          <FontAwesome5 name={icon} size={13} color={color} iconStyle="solid" />
        </View>

        <Text style={[styles.summaryValue, { color }]}>{value}</Text>
      </View>

      <Text style={styles.summaryLabel}>{label}</Text>
    </Pressable>
  );
}

// Displays an associated record ID with its corresponding icon.
function Detail({
  label,
  value,
  icon,
}: {
  label: string;
  value?: string;
  icon: "box" | "building" | "store";
}) {
  return (
    <View style={styles.detailItem}>
      <View style={styles.detailIcon}>
        <FontAwesome5
          name={icon}
          size={11}
          color={colors.textSecondary}
          iconStyle="solid"
        />
      </View>

      <View style={styles.detailContent}>
        <Text style={styles.detailLabel}>{label}</Text>

        <Text style={styles.detailValue} numberOfLines={2}>
          {value || "Not available"}
        </Text>
      </View>
    </View>
  );
}

// Selects badge colours based on the reservation's current status.
function StatusBadge({ status, label }: { status: string; label: string }) {
  const statusStyle =
    status === "active"
      ? styles.activeBadge
      : status === "collected"
        ? styles.collectedBadge
        : status === "cancelled"
          ? styles.cancelledBadge
          : styles.unknownBadge;

  const dotStyle =
    status === "active"
      ? styles.activeDot
      : status === "collected"
        ? styles.collectedDot
        : status === "cancelled"
          ? styles.cancelledDot
          : styles.unknownDot;

  return (
    <View style={[styles.statusBadge, statusStyle]}>
      <View style={[styles.statusDot, dotStyle]} />
      <Text style={styles.statusText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
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
  },

  pageContent: {
    gap: Spacing.three,
    paddingBottom: Spacing.three,
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.two,
    backgroundColor: "#FFFFFF",
    padding: Spacing.four,
  },

  stateText: {
    fontFamily: Fonts.body,
    fontSize: 13,
    lineHeight: 19,
    color: colors.textSecondary,
    textAlign: "center",
  },

  // Page heading and refresh button.
  pageHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: Spacing.three,
  },

  pageHeadingGroup: {
    flex: 1,
    gap: Spacing.one,
  },

  eyebrow: {
    fontFamily: Fonts.body,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.4,
    color: colors.secondary,
  },

  heading: {
    fontFamily: Fonts.heading,
    fontSize: 28,
    fontWeight: "700",
    color: colors.text,
  },

  description: {
    fontFamily: Fonts.body,
    fontSize: 13,
    lineHeight: 20,
    color: colors.textSecondary,
  },

  refreshButton: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.backgroundElement,
    borderRadius: Radius.md,
  },

  refreshButtonDisabled: {
    opacity: 0.55,
  },

  pressed: {
    opacity: 0.75,
  },

  // Overview statistics.
  summarySection: {
    gap: Spacing.two,
    padding: Spacing.three,
    backgroundColor: colors.background,
    borderRadius: Radius.lg,
  },

  sectionHeadingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.two,
  },

  sectionTitle: {
    fontFamily: Fonts.heading,
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
  },

  mutedText: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: colors.textSecondary,
  },

  summaryRow: {
    flexDirection: "row",
    gap: Spacing.two,
  },

  summaryCard: {
    flex: 1,
    minWidth: 0,
    padding: Spacing.two,
    gap: Spacing.two,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: colors.backgroundElement,
    borderRadius: Radius.md,
  },

  summaryCardActive: {
    borderColor: colors.primary,
    borderWidth: 1.5,
  },

  summaryTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: Spacing.one,
  },

  summaryIcon: {
    width: 30,
    height: 30,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
  },

  summaryValue: {
    fontFamily: Fonts.heading,
    fontSize: 22,
    fontWeight: "700",
  },

  summaryLabel: {
    fontFamily: Fonts.body,
    fontSize: 11,
    color: colors.textSecondary,
  },

  // Search input.
  searchBox: {
    minHeight: 46,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: colors.backgroundElement,
    borderRadius: Radius.md,
  },

  searchInput: {
    flex: 1,
    minWidth: 0,
    paddingVertical: Spacing.two,
    fontFamily: Fonts.body,
    fontSize: 13,
    color: colors.text,
    outlineStyle: "none",
  } as object,

  clearSearchButton: {
    padding: Spacing.one,
  },

  // Status filter controls.
  filterSection: {
    gap: Spacing.two,
  },

  filterHeading: {
    fontFamily: Fonts.body,
    fontSize: 12,
    fontWeight: "700",
    color: colors.text,
  },

  filters: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 7,
  },

  filter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: colors.backgroundElement,
    borderRadius: 20,
  },

  filterActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },

  filterText: {
    fontFamily: Fonts.body,
    fontSize: 11,
    color: colors.textSecondary,
  },

  filterTextActive: {
    fontWeight: "700",
    color: "#FFFFFF",
  },

  filterCount: {
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.backgroundElement,
  },

  filterCountActive: {
    backgroundColor: "rgba(255,255,255,0.22)",
  },

  filterCountText: {
    fontFamily: Fonts.body,
    fontSize: 10,
    fontWeight: "700",
    color: colors.textSecondary,
  },

  filterCountTextActive: {
    color: "#FFFFFF",
  },

  // Results heading.
  resultsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.two,
  },

  resultsHeading: {
    flex: 1,
  },

  resultsDescription: {
    marginTop: Spacing.half,
    fontFamily: Fonts.body,
    fontSize: 12,
    lineHeight: 18,
    color: colors.textSecondary,
  },

  resultCount: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: colors.textSecondary,
  },

  // Reservation cards.
  listSeparator: {
    height: Spacing.two,
  },

  reservationCard: {
    padding: Spacing.three,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.backgroundElement,
    borderRadius: Radius.lg,
    gap: Spacing.three,
  },

  cardPressed: {
    backgroundColor: colors.background,
    borderColor: colors.secondary,
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: Spacing.two,
  },

  cardHeadingGroup: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.two,
  },

  reservationIcon: {
    width: 42,
    height: 42,
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E9F4F1",
    borderRadius: Radius.md,
  },

  cardTitleGroup: {
    flex: 1,
    minWidth: 0,
    gap: Spacing.one,
  },

  cardTitle: {
    fontFamily: Fonts.body,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "700",
    color: colors.text,
  },

  cardSubtitle: {
    fontFamily: Fonts.body,
    fontSize: 11,
    lineHeight: 16,
    color: colors.textSecondary,
  },

  cardDivider: {
    height: 1,
    backgroundColor: colors.backgroundElement,
  },

  // Related record details.
  detailsGrid: {
    gap: Spacing.three,
  },

  detailItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.two,
  },

  detailIcon: {
    width: 26,
    height: 26,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
    borderRadius: Radius.sm,
  },

  detailContent: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },

  detailLabel: {
    fontFamily: Fonts.body,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.4,
    color: colors.textSecondary,
    textTransform: "uppercase",
  },

  detailValue: {
    fontFamily: Fonts.body,
    fontSize: 12,
    lineHeight: 18,
    color: colors.text,
  },

  // Reservation status badges.
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    flexShrink: 0,
    paddingHorizontal: Spacing.two,
    paddingVertical: 6,
    borderRadius: Radius.sm,
  },

  activeBadge: {
    backgroundColor: "#F0F4E8",
  },

  collectedBadge: {
    backgroundColor: "#E9F4F1",
  },

  cancelledBadge: {
    backgroundColor: "#FCEDEA",
  },

  unknownBadge: {
    backgroundColor: colors.backgroundElement,
  },

  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },

  activeDot: {
    backgroundColor: colors.accent,
  },

  collectedDot: {
    backgroundColor: colors.secondary,
  },

  cancelledDot: {
    backgroundColor: colors.error,
  },

  unknownDot: {
    backgroundColor: colors.textSecondary,
  },

  statusText: {
    fontFamily: Fonts.body,
    fontSize: 10,
    fontWeight: "700",
    color: colors.text,
  },

  // Card footer.
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: Spacing.two,
    paddingTop: Spacing.two,
    borderTopWidth: 1,
    borderTopColor: colors.backgroundElement,
  },

  openDetails: {
    fontFamily: Fonts.body,
    fontSize: 12,
    fontWeight: "700",
    color: colors.primary,
  },

  // Empty list and no-results states.
  empty: {
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.two,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.five,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.backgroundElement,
    borderRadius: Radius.lg,
  },

  emptyIcon: {
    width: 54,
    height: 54,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: Radius.lg,
  },

  emptyTitle: {
    fontFamily: Fonts.heading,
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
    textAlign: "center",
  },

  clearFiltersButton: {
    marginTop: Spacing.one,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    backgroundColor: colors.backgroundElement,
    borderRadius: Radius.md,
  },

  clearFiltersText: {
    fontFamily: Fonts.body,
    fontSize: 12,
    fontWeight: "700",
    color: colors.text,
  },

  // Loading error and retry controls.
  errorBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.two,
    padding: Spacing.three,
    backgroundColor: "#FCEDEA",
    borderWidth: 1,
    borderColor: "#F3D0CB",
    borderRadius: Radius.md,
  },

  errorIcon: {
    paddingTop: 2,
  },

  errorContent: {
    flex: 1,
    gap: Spacing.two,
  },

  errorTitle: {
    fontFamily: Fonts.body,
    fontSize: 13,
    fontWeight: "700",
    color: colors.text,
  },

  errorText: {
    fontFamily: Fonts.body,
    fontSize: 12,
    lineHeight: 18,
    color: colors.error,
  },

  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: Spacing.two,
    paddingVertical: Spacing.one,
  },

  retryText: {
    fontFamily: Fonts.body,
    fontSize: 12,
    fontWeight: "700",
    color: colors.primary,
  },
});
