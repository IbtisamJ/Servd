/**
 * Donation List Screen
 *
 * Retrieves food donation records from Firestore and presents
 * them to administrators for monitoring and management.
 *
 * Responsibilities:
 * - Loads donation records through the donation service.
 * - Displays available donation information and current statuses.
 * - Supports the list's implemented search and filtering functions.
 * - Handles loading, error, and empty-list states where implemented.
 * - Navigates to the selected donation's detail screen.
 */
import FontAwesome5 from "@react-native-vector-icons/fontawesome5";
import { Href, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  Colors,
  Fonts,
  MaxContentWidth,
  Radius,
  Spacing,
} from "@/constants/theme";
import { getDonations } from "@/services/donationService";

const colors = Colors.light;
const BORDER_COLOR = "#E8EAED";

type Donation = {
  id?: string;
  donationId?: string;
  foodName?: string;
  enterpriseName?: string;
  quantity?: number | string;
  status?: string;
  collectionLocation?: string;
};

// Normalizes status values for consistent filtering and comparison.
const normalizeStatus = (status?: string) =>
  (status ?? "unknown").toLowerCase().trim();

export default function DonationsScreen() {
  // Expo Router hooks must be called directly in the component body.
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isCompact = width < 520;

  const [donations, setDonations] = useState<Donation[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const statuses = [
    "all",
    "available",
    "reserved",
    "collected",
    "cancelled",
    "expired",
  ];

  // Retrieves donations and ensures every record has a usable ID.
  const loadDonations = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const result = await getDonations();

      setDonations(
        (result as unknown as Donation[]).map((item) => ({
          ...item,
          id: item.id ?? item.donationId,
        })),
      );
    } catch (err) {
      console.error("Failed to load donations:", err);
      setError(
        "Could not load donations. Check your connection and permissions.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDonations();
  }, [loadDonations]);

  // Filters donations by search query and selected status.
  const query = search.trim().toLowerCase();

  const filtered = donations.filter((item) => {
    const status = normalizeStatus(item.status);

    const searchableText = [
      item.foodName,
      item.enterpriseName,
      item.collectionLocation,
      item.id,
      item.donationId,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return (
      searchableText.includes(query) &&
      (filter === "all" || status === filter)
    );
  });

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <ScrollView
        style={styles.pageScroll}
        contentContainerStyle={styles.workspace}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Page heading and donation refresh action */}
        <View style={styles.heading}>
          <View style={styles.headingText}>
            <Text style={styles.eyebrow}>SERVD / MANAGEMENT</Text>
            <Text style={styles.title}>Donations</Text>
            <Text style={styles.subtitle}>
              Manage food donations and monitor their collection status.
            </Text>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Refresh donations"
            onPress={() => void loadDonations()}
            disabled={loading}
            style={({ pressed }) => [
              styles.refreshButton,
              pressed && styles.pressed,
              loading && styles.disabledButton,
            ]}
          >
            <FontAwesome5
              name="sync-alt"
              size={13}
              color={colors.text}
              iconStyle="solid"
            />
            {!isCompact && (
              <Text style={styles.refreshButtonText}>Refresh data</Text>
            )}
          </Pressable>
        </View>

        {/* Donation summary */}
        <View style={styles.summary}>
          <View style={styles.summaryIcon}>
            <FontAwesome5
              name="box"
              size={18}
              color={colors.secondary}
              iconStyle="solid"
            />
          </View>

          <View style={styles.summaryCopy}>
            <Text style={styles.summaryLabel}>All donations</Text>
            <Text style={styles.summaryValue}>{donations.length}</Text>
          </View>

          <Text style={styles.summaryCaption}>
            {filtered.length} matching{" "}
            {filtered.length === 1 ? "record" : "records"}
          </Text>
        </View>

        {/* Search field */}
        <View style={styles.searchBox}>
          <FontAwesome5
            name="search"
            size={14}
            color={colors.textSecondary}
            iconStyle="solid"
          />

          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search food, enterprise, or location..."
            placeholderTextColor={colors.textSecondary}
            style={styles.searchInput}
            autoCapitalize="none"
            returnKeyType="search"
            accessibilityLabel="Search donations"
          />

          {search.length > 0 && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Clear search"
              onPress={() => setSearch("")}
              hitSlop={8}
              style={styles.clearSearch}
            >
              <FontAwesome5
                name="times-circle"
                size={15}
                color={colors.textSecondary}
                iconStyle="solid"
              />
            </Pressable>
          )}
        </View>

        {/* Status filters */}
        <View style={styles.filterSection}>
          <View style={styles.filterHeader}>
            <Text style={styles.filterHeading}>FILTER BY STATUS</Text>
            <Text style={styles.filterResultCount}>
              {filtered.length} donations
            </Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filters}
          >
            {statuses.map((status) => {
              const selected = filter === status;

              const count =
                status === "all"
                  ? donations.length
                  : donations.filter(
                      (item) => normalizeStatus(item.status) === status,
                    ).length;

              return (
                <Pressable
                  key={status}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  onPress={() => setFilter(status)}
                  style={({ pressed }) => [
                    styles.filter,
                    selected && styles.filterActive,
                    pressed && styles.filterPressed,
                  ]}
                >
                  <Text
                    style={[
                      styles.filterText,
                      selected && styles.filterTextActive,
                    ]}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </Text>

                  <Text
                    style={[
                      styles.filterCountText,
                      selected && styles.filterCountTextActive,
                    ]}
                  >
                    {count}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* Donation list */}
        <View style={styles.listSection}>
          <View style={styles.listHeading}>
            <View style={styles.listHeadingCopy}>
              <Text style={styles.listTitle}>Donation records</Text>
              <Text style={styles.listSubtitle}>
                {loading
                  ? "Retrieving the latest records..."
                  : `${filtered.length} ${
                      filtered.length === 1 ? "donation" : "donations"
                    } found`}
              </Text>
            </View>
          </View>

          {loading ? (
            <View style={styles.feedbackCard}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.feedbackTitle}>Loading donations</Text>
              <Text style={styles.feedbackDescription}>
                Retrieving donation records.
              </Text>
            </View>
          ) : error ? (
            <View style={styles.feedbackCard}>
              <View style={styles.errorIcon}>
                <FontAwesome5
                  name="exclamation-circle"
                  size={21}
                  color={colors.error}
                  iconStyle="solid"
                />
              </View>

              <Text style={styles.feedbackTitle}>
                Unable to load donations
              </Text>
              <Text style={styles.feedbackDescription}>{error}</Text>

              <Pressable
                accessibilityRole="button"
                onPress={() => void loadDonations()}
                style={({ pressed }) => [
                  styles.retryButton,
                  pressed && styles.pressed,
                ]}
              >
                <FontAwesome5
                  name="redo-alt"
                  size={12}
                  color="#FFFFFF"
                  iconStyle="solid"
                />
                <Text style={styles.retryButtonText}>Try again</Text>
              </Pressable>
            </View>
          ) : filtered.length === 0 ? (
            <View style={styles.emptyCard}>
              <View style={styles.emptyIcon}>
                <FontAwesome5
                  name="box-open"
                  size={22}
                  color={colors.textSecondary}
                  iconStyle="solid"
                />
              </View>

              <Text style={styles.emptyTitle}>No donations found</Text>
              <Text style={styles.empty}>
                {search || filter !== "all"
                  ? "Try changing your search or selecting a different status filter."
                  : "Donation records will appear here when they become available."}
              </Text>

              {(search || filter !== "all") && (
                <Pressable
                  accessibilityRole="button"
                  onPress={() => {
                    setSearch("");
                    setFilter("all");
                  }}
                  style={({ pressed }) => [
                    styles.clearFiltersButton,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text style={styles.clearFiltersText}>
                    Clear search and filters
                  </Text>
                </Pressable>
              )}
            </View>
          ) : (
            filtered.map((item, index) => {
              const status = normalizeStatus(item.status);
              const statusLabel =
                status.charAt(0).toUpperCase() + status.slice(1);

              const statusStyle =
                status === "available"
                  ? styles.available
                  : status === "reserved"
                    ? styles.reserved
                    : status === "collected"
                      ? styles.collected
                      : status === "cancelled" || status === "expired"
                        ? styles.cancelled
                        : styles.unknownStatus;

              return (
                <Pressable
                  key={item.id ?? String(index)}
                  accessibilityRole="button"
                  accessibilityLabel={`View donation ${
                    item.foodName || "Unnamed donation"
                  }`}
                  accessibilityState={{ disabled: !item.id }}
                  disabled={!item.id}
                  onPress={() => {
                    if (item.id) {
                      router.push(
                        `/admin/donations/${encodeURIComponent(item.id)}` as Href,
                      );
                    }
                  }}
                  style={({ pressed }) => [
                    styles.card,
                    styles.cardScrollItem,
                    pressed && styles.cardPressed,
                    !item.id && styles.disabledButton,
                  ]}
                >
                  <View style={styles.foodIcon}>
                    <FontAwesome5
                      name="box"
                      size={18}
                      color={colors.secondary}
                      iconStyle="solid"
                    />
                  </View>

                  <View style={styles.details}>
                    <Text style={styles.foodName} numberOfLines={2}>
                      {item.foodName || "Unnamed donation"}
                    </Text>

                    <View style={styles.enterpriseLine}>
                      <FontAwesome5
                        name="building"
                        size={11}
                        color={colors.textSecondary}
                        iconStyle="solid"
                      />
                      <Text style={styles.meta} numberOfLines={1}>
                        {item.enterpriseName || "Food enterprise"}
                      </Text>
                    </View>

                    {item.quantity != null && (
                      <View style={styles.metaLine}>
                        <FontAwesome5
                          name="layer-group"
                          size={11}
                          color={colors.textSecondary}
                          iconStyle="solid"
                        />
                        <Text style={styles.meta}>
                          Quantity: {item.quantity}
                        </Text>
                      </View>
                    )}

                    {item.collectionLocation && (
                      <View style={styles.metaLine}>
                        <FontAwesome5
                          name="map-marker-alt"
                          size={11}
                          color={colors.textSecondary}
                          iconStyle="solid"
                        />
                        <Text style={styles.meta} numberOfLines={2}>
                          {item.collectionLocation}
                        </Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.right}>
                    <View style={[styles.status, statusStyle]}>
                      <Text style={styles.statusText}>{statusLabel}</Text>
                    </View>

                    <FontAwesome5
                      name="chevron-right"
                      size={11}
                      color={colors.textSecondary}
                      iconStyle="solid"
                    />
                  </View>
                </Pressable>
              );
            })
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  pageScroll: {
    flex: 1,
  },
  workspace: {
    flexGrow: 1,
    width: "100%",
    maxWidth: MaxContentWidth,
    alignSelf: "center",
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.four,
    gap: Spacing.two,
  },
  cardScrollItem: {
    marginBottom: 10,
  },

  /* Page heading */
  heading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  headingText: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  eyebrow: {
    fontFamily: Fonts.body,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.5,
    color: colors.secondary,
  },
  title: {
    fontFamily: Fonts.heading,
    fontSize: 29,
    lineHeight: 36,
    fontWeight: "700",
    color: colors.text,
  },
  subtitle: {
    fontFamily: Fonts.body,
    fontSize: 13,
    lineHeight: 19,
    color: colors.textSecondary,
  },
  refreshButton: {
    minHeight: 40,
    paddingHorizontal: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    borderRadius: Radius.md,
    backgroundColor: "#FFFFFF",
  },
  refreshButtonText: {
    fontFamily: Fonts.body,
    fontSize: 12,
    fontWeight: "700",
    color: colors.text,
  },
  pressed: {
    opacity: 0.72,
  },
  disabledButton: {
    opacity: 0.5,
  },

  /* Summary strip */
  summary: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: Spacing.two,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.backgroundElement,
    borderRadius: Radius.lg,
  },
  summaryIcon: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.backgroundElement,
  },
  summaryCopy: {
    flex: 1,
    gap: 2,
  },
  summaryLabel: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: colors.textSecondary,
  },
  summaryValue: {
    fontFamily: Fonts.heading,
    fontSize: 22,
    lineHeight: 27,
    fontWeight: "700",
    color: colors.text,
  },
  summaryCaption: {
    maxWidth: 130,
    fontFamily: Fonts.body,
    fontSize: 11,
    lineHeight: 16,
    textAlign: "right",
    color: colors.textSecondary,
  },

  /* Search */
  searchBox: {
    minHeight: 46,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: colors.backgroundElement,
    borderRadius: Radius.md,
  },
  searchInput: {
    flex: 1,
    minWidth: 0,
    paddingVertical: 10,
    fontFamily: Fonts.body,
    fontSize: 13,
    color: colors.text,
  },
  clearSearch: {
    padding: 4,
  },

  /* Status filters */
  filterSection: {
    gap: 0,
  },
  filterHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.two,
  },
  filterHeading: {
    fontFamily: Fonts.body,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    color: colors.textSecondary,
  },
  filterResultCount: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: colors.textSecondary,
  },
  filters: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    paddingBottom: Spacing.three,
  },
  filter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.two,
    minHeight: 38,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.backgroundElement,
    backgroundColor: "#FFFFFF",
  },
  filterActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterPressed: {
    opacity: 0.78,
  },
  filterText: {
    fontFamily: Fonts.body,
    fontSize: 12,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  filterTextActive: {
    color: "#FFFFFF",
  },
  filterCountText: {
    fontFamily: Fonts.body,
    fontSize: 11,
    fontWeight: "700",
    color: colors.textSecondary,
  },
  filterCountTextActive: {
    color: "#FFFFFF",
  },

  /* List heading and scrolling list */
  listSection: {
    gap: Spacing.two,
  },
  listHeading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  listHeadingCopy: {
    gap: 3,
  },
  listTitle: {
    fontFamily: Fonts.heading,
    fontSize: 19,
    lineHeight: 25,
    fontWeight: "700",
    color: colors.text,
  },
  listSubtitle: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: colors.textSecondary,
  },

  /* Donation cards */
  card: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: Spacing.two,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.backgroundElement,
    borderRadius: Radius.lg,
  },
  cardPressed: {
    opacity: 0.78,
    backgroundColor: colors.backgroundElement,
  },
  foodIcon: {
    width: 42,
    height: 42,
    flexShrink: 0,
    borderRadius: Radius.md,
    backgroundColor: colors.backgroundElement,
    alignItems: "center",
    justifyContent: "center",
  },
  details: {
    flex: 1,
    minWidth: 0,
    gap: 6,
  },
  foodName: {
    fontFamily: Fonts.body,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "700",
    color: colors.text,
  },
  enterpriseLine: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  metaLine: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 7,
  },
  meta: {
    flexShrink: 1,
    fontFamily: Fonts.body,
    fontSize: 11,
    lineHeight: 16,
    color: colors.textSecondary,
  },
  right: {
    alignItems: "flex-end",
    justifyContent: "center",
    gap: 10,
    flexShrink: 0,
  },

  /* Status badges */
  status: {
    maxWidth: 110,
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: Radius.sm,
  },
  available: {
    backgroundColor: "#DCEFEA",
  },
  reserved: {
    backgroundColor: "#F0E6D2",
  },
  collected: {
    backgroundColor: "#E6ECD9",
  },
  cancelled: {
    backgroundColor: "#F6DEDA",
  },
  unknownStatus: {
    backgroundColor: colors.backgroundSelected,
  },
  statusText: {
    fontFamily: Fonts.body,
    fontSize: 10,
    fontWeight: "700",
    color: colors.text,
  },

  /* Loading and error states */
  feedbackCard: {
    minHeight: 180,
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.three,
    gap: 10,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.backgroundElement,
    borderRadius: Radius.lg,
  },
  feedbackTitle: {
    fontFamily: Fonts.heading,
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
    color: colors.text,
  },
  feedbackDescription: {
    maxWidth: 340,
    fontFamily: Fonts.body,
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
    color: colors.textSecondary,
  },
  errorIcon: {
    width: 46,
    height: 46,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 23,
    backgroundColor: "#F6DEDA",
  },
  retryButton: {
    marginTop: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 17,
    paddingVertical: 11,
    borderRadius: Radius.md,
    backgroundColor: colors.primary,
  },
  retryButtonText: {
    fontFamily: Fonts.body,
    fontSize: 12,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  /* Empty state */
  emptyCard: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 22,
    paddingVertical: 30,
    gap: 10,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.backgroundElement,
    borderRadius: Radius.lg,
  },
  emptyIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.backgroundElement,
    marginBottom: 2,
  },
  emptyTitle: {
    fontFamily: Fonts.heading,
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
    color: colors.text,
  },
  empty: {
    maxWidth: 340,
    fontFamily: Fonts.body,
    fontSize: 12,
    lineHeight: 19,
    textAlign: "center",
    color: colors.textSecondary,
  },
  clearFiltersButton: {
    marginTop: 4,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: Radius.md,
    backgroundColor: colors.backgroundElement,
  },
  clearFiltersText: {
    fontFamily: Fonts.body,
    fontSize: 12,
    fontWeight: "700",
    color: colors.primary,
  },
});