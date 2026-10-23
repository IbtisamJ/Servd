
import FontAwesome5 from "@react-native-vector-icons/fontawesome5";
import { router } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import { auth, db } from "@/config/firebase";
import { COLLECTIONS } from "@/constants/roles";
import { Colors, Fonts, Radius, Spacing } from "@/constants/theme";

const colors = Colors.light;

type Donation = {
  id: string;
  foodName?: string;
  category?: string;
  description?: string;
  quantity?: number;
  collectionLocation?: string;
  collectionDeadline?: unknown;
  expiryDate?: unknown;
  status?: string;
  createdTimestamp?: unknown;
};

type Filter = "all" | "available" | "reserved" | "collected";

const filters: { label: string; value: Filter }[] = [
  { label: "All", value: "all" },
  { label: "Available", value: "available" },
  { label: "Reserved", value: "reserved" },
  { label: "Collected", value: "collected" },
];

function formatDate(value: unknown): string {
  if (!value) return "Date unavailable";

  let date: Date;

  if (
    typeof value === "object" &&
    value !== null &&
    "toDate" in value &&
    typeof value.toDate === "function"
  ) {
    date = value.toDate();
  } else if (value instanceof Date) {
    date = value;
  } else if (typeof value === "string" || typeof value === "number") {
    date = new Date(value);
  } else {
    return "Date unavailable";
  }

  if (Number.isNaN(date.getTime())) return "Date unavailable";

  return date.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function statusColors(status?: string) {
  switch (status?.toLowerCase()) {
    case "available":
      return { background: "#E8F4F1", text: "#087F6A" };
    case "reserved":
      return { background: "#FFF3DF", text: "#946000" };
    case "collected":
      return { background: "#F0F3E8", text: "#718C3E" };
    case "expired":
    case "cancelled":
      return { background: "#FCECEB", text: "#B42318" };
    default:
      return { background: "#EEF0F3", text: "#596273" };
  }
}

export default function EnterpriseDonationsScreen() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let stopDonations: (() => void) | undefined;

    const stopAuth = onAuthStateChanged(auth, (user) => {
      stopDonations?.();
      stopDonations = undefined;

      if (!user) {
        setDonations([]);
        setLoading(false);
        router.replace("/Login" as never);
        return;
      }

      setLoading(true);
      setError("");

      const donationsQuery = query(
        collection(db, COLLECTIONS.DONATIONS),
        where("enterpriseId", "==", user.uid),
      );

      stopDonations = onSnapshot(
        donationsQuery,
        (snapshot) => {
          const records = snapshot.docs.map((item) => ({
            ...item.data(),
            id: item.id,
          })) as Donation[];

          records.sort((a, b) => {
            const getTime = (value: unknown) => {
              if (
                typeof value === "object" &&
                value !== null &&
                "toDate" in value &&
                typeof value.toDate === "function"
              ) {
                return value.toDate().getTime();
              }

              return 0;
            };

            return (
              getTime(b.createdTimestamp) -
              getTime(a.createdTimestamp)
            );
          });

          setDonations(records);
          setLoading(false);
        },
        (err) => {
          console.error("Error loading donations:", err);
          setError("We couldn't load your donations. Please try again.");
          setLoading(false);
        },
      );
    });

    return () => {
      stopAuth();
      stopDonations?.();
    };
  }, []);

  const visibleDonations = donations.filter((donation) => {
    if (filter === "all") return true;
    return donation.status?.toLowerCase() === filter;
  });

  const goTo = (path: string) => router.push(path as never);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.workspace}>
            <View style={styles.header}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Back to dashboard"
                onPress={() => router.replace("/enterprises" as never)}
                style={styles.backButton}
              >
                <FontAwesome5
                  name="arrow-left"
                  size={16}
                  color={colors.text}
                  iconStyle="solid"
                />
              </Pressable>

              <View style={styles.headerCopy}>
                <Text style={styles.eyebrow}>YOUR ENTERPRISE</Text>
                <Text style={styles.heading}>Donations</Text>
              </View>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Create donation"
                onPress={() => goTo("/enterprises/donations/create")}
                style={styles.addButton}
              >
                <FontAwesome5
                  name="plus"
                  size={17}
                  color="#FFFFFF"
                  iconStyle="solid"
                />
              </Pressable>
            </View>

            <Text style={styles.subtitle}>
              Manage your food listings and keep track of their status.
            </Text>

            <View style={styles.summaryCard}>
              <View style={styles.summaryIcon}>
                <FontAwesome5
                  name="box-open"
                  size={22}
                  color={colors.secondary}
                  iconStyle="solid"
                />
              </View>
              <View style={styles.summaryCopy}>
                <Text style={styles.summaryLabel}>Total donations</Text>
                <Text style={styles.summaryValue}>
                  {loading ? "—" : donations.length}
                </Text>
              </View>
              <Text style={styles.summaryNote}>Your listings</Text>
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.sectionTitle}>Your listings</Text>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filterRow}
              >
                {filters.map((item) => {
                  const active = filter === item.value;

                  return (
                    <Pressable
                      key={item.value}
                      onPress={() => setFilter(item.value)}
                      style={[
                        styles.filterButton,
                        active && styles.filterButtonActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.filterText,
                          active && styles.filterTextActive,
                        ]}
                      >
                        {item.label}
                        {item.value === "all"
                          ? ` (${donations.length})`
                          : ` (${
                              donations.filter(
                                (donation) =>
                                  donation.status?.toLowerCase() ===
                                  item.value,
                              ).length
                            })`}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>

            {loading ? (
              <View style={styles.feedbackCard}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.feedbackText}>
                  Loading your donations...
                </Text>
              </View>
            ) : error ? (
              <View style={styles.feedbackCard}>
                <FontAwesome5
                  name="exclamation-circle"
                  size={24}
                  color={colors.error}
                  iconStyle="solid"
                />
                <Text style={styles.feedbackText}>{error}</Text>
              </View>
            ) : visibleDonations.length === 0 ? (
              <View style={styles.emptyCard}>
                <View style={styles.emptyIcon}>
                  <FontAwesome5
                    name="box-open"
                    size={27}
                    color={colors.secondary}
                    iconStyle="solid"
                  />
                </View>
                <Text style={styles.emptyTitle}>
                  {donations.length === 0
                    ? "No donations yet"
                    : "No donations in this category"}
                </Text>
                <Text style={styles.emptyText}>
                  {donations.length === 0
                    ? "Your food listings will appear here after you create your first donation."
                    : "Try another filter to see your other listings."}
                </Text>

                {donations.length === 0 ? (
                  <Pressable
                    onPress={() =>
                      goTo("/enterprises/donations/create")
                    }
                    style={styles.primaryButton}
                  >
                    <Text style={styles.primaryButtonText}>
                      Create a donation
                    </Text>
                  </Pressable>
                ) : null}
              </View>
            ) : (
              <View style={styles.list}>
                {visibleDonations.map((donation) => {
                  const badge = statusColors(donation.status);

                  return (
                    <Pressable
                      key={donation.id}
                      onPress={() =>
                        goTo(`/enterprises/donations/${donation.id}`)
                      }
                      style={({ pressed }) => [
                        styles.donationCard,
                        pressed && styles.pressed,
                      ]}
                    >
                      <View style={styles.foodIcon}>
                        <FontAwesome5
                          name="utensils"
                          size={19}
                          color={colors.secondary}
                          iconStyle="solid"
                        />
                      </View>

                      <View style={styles.donationContent}>
                        <View style={styles.donationTop}>
                          <Text
                            style={styles.foodName}
                            numberOfLines={2}
                          >
                            {donation.foodName || "Untitled donation"}
                          </Text>

                          <View
                            style={[
                              styles.statusBadge,
                              { backgroundColor: badge.background },
                            ]}
                          >
                            <Text
                              style={[
                                styles.statusText,
                                { color: badge.text },
                              ]}
                            >
                              {donation.status || "Unknown"}
                            </Text>
                          </View>
                        </View>

                        <Text style={styles.category}>
                          {donation.category || "Food donation"}
                          {donation.quantity != null
                            ? ` · Quantity: ${donation.quantity}`
                            : ""}
                        </Text>

                        {donation.description ? (
                          <Text
                            style={styles.description}
                            numberOfLines={2}
                          >
                            {donation.description}
                          </Text>
                        ) : null}

                        {donation.collectionLocation ? (
                          <View style={styles.metaRow}>
                            <FontAwesome5
                              name="map-marker-alt"
                              size={12}
                              color={colors.textSecondary}
                              iconStyle="solid"
                            />
                            <Text
                              style={styles.metaText}
                              numberOfLines={1}
                            >
                              {donation.collectionLocation}
                            </Text>
                          </View>
                        ) : null}

                        <View style={styles.metaRow}>
                          <FontAwesome5
                            name="calendar-alt"
                            size={12}
                            color={colors.textSecondary}
                            iconStyle="solid"
                          />
                          <Text style={styles.metaText}>
                            Collection deadline:{" "}
                            {formatDate(donation.collectionDeadline)}
                          </Text>
                        </View>

                        <View style={styles.cardFooter}>
                          <Text style={styles.detailsText}>
                            View details
                          </Text>
                          <FontAwesome5
                            name="arrow-right"
                            size={12}
                            color={colors.primary}
                            iconStyle="solid"
                          />
                        </View>
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            )}
          </View>
        </ScrollView>

        {/* Bottom navigation */}
        <View style={styles.bottomNav}>
          <Pressable
            style={styles.navItem}
            accessibilityRole="button"
            accessibilityLabel="Dashboard"
            onPress={() => router.replace("/enterprises" as never)}
          >
            <FontAwesome5
              name="home"
              size={19}
              color={colors.textSecondary}
              iconStyle="solid"
            />
            <Text style={styles.navLabel}>Home</Text>
          </Pressable>

          <Pressable
            style={styles.navItem}
            accessibilityRole="button"
            accessibilityLabel="Donations"
            onPress={() => router.replace("/enterprises/donations" as never)}
          >
            <FontAwesome5
              name="box-open"
              size={19}
              color={colors.primary}
              iconStyle="solid"
            />
            <Text style={[styles.navLabel, styles.navLabelActive]}>
              Donations
            </Text>
          </Pressable>

          <Pressable
            style={styles.navItem}
            accessibilityRole="button"
            accessibilityLabel="Notifications"
            onPress={() => goTo("/notifications")}
          >
            <FontAwesome5
              name="bell"
              size={19}
              color={colors.textSecondary}
              iconStyle="solid"
            />
            <Text style={styles.navLabel}>Alerts</Text>
          </Pressable>

          <Pressable
            style={styles.navItem}
            accessibilityRole="button"
            accessibilityLabel="Create donation"
            onPress={() => goTo("/enterprises/donations/create")}
          >
            <View style={styles.addNavButton}>
              <FontAwesome5
                name="plus"
                size={18}
                color="#FFFFFF"
                iconStyle="solid"
              />
            </View>
            <Text style={styles.navLabel}>Add food</Text>
          </Pressable>

          <Pressable
            style={styles.navItem}
            accessibilityRole="button"
            accessibilityLabel="Reservations"
            onPress={() => goTo("/enterprises/reservations")}
          >
            <FontAwesome5
              name="clipboard-list"
              size={19}
              color={colors.textSecondary}
              iconStyle="solid"
            />
            <Text style={styles.navLabel}>Collections</Text>
          </Pressable>

          <Pressable
            style={styles.navItem}
            accessibilityRole="button"
            accessibilityLabel="Profile"
            onPress={() => goTo("/enterprises/profile")}
          >
            <FontAwesome5
              name="user-circle"
              size={19}
              color={colors.textSecondary}
              iconStyle="solid"
            />
            <Text style={styles.navLabel}>Profile</Text>
          </Pressable>
        </View>
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
    paddingBottom: Spacing.five,
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
  backButton: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Radius.md,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: colors.backgroundElement,
  },
  headerCopy: {
    flex: 1,
    gap: 3,
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
    fontSize: 27,
    color: colors.text,
  },
  addButton: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Radius.md,
    backgroundColor: colors.primary,
  },
  subtitle: {
    fontFamily: Fonts.body,
    fontSize: 13,
    lineHeight: 20,
    color: colors.textSecondary,
  },
  summaryCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: Radius.lg,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: colors.backgroundElement,
  },
  summaryIcon: {
    width: 48,
    height: 48,
    borderRadius: Radius.md,
    backgroundColor: "#E8F4F1",
    alignItems: "center",
    justifyContent: "center",
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
    fontSize: 26,
    color: colors.text,
  },
  summaryNote: {
    fontFamily: Fonts.body,
    fontSize: 10,
    color: colors.textSecondary,
  },
  filterSection: {
    gap: Spacing.three,
  },
  sectionTitle: {
    fontFamily: Fonts.heading,
    fontSize: 20,
    color: colors.text,
  },
  filterRow: {
    gap: Spacing.two,
    paddingVertical: 2,
  },
  filterButton: {
    paddingHorizontal: 15,
    paddingVertical: 9,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: colors.backgroundElement,
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
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
  feedbackCard: {
    minHeight: 170,
    padding: Spacing.four,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.three,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: colors.backgroundElement,
    borderRadius: Radius.lg,
  },
  feedbackText: {
    fontFamily: Fonts.body,
    fontSize: 13,
    textAlign: "center",
    color: colors.textSecondary,
  },
  emptyCard: {
    alignItems: "center",
    padding: Spacing.four,
    gap: Spacing.three,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: colors.backgroundElement,
    backgroundColor: "#FFFFFF",
  },
  emptyIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E8F4F1",
  },
  emptyTitle: {
    fontFamily: Fonts.heading,
    fontSize: 19,
    color: colors.text,
    textAlign: "center",
  },
  emptyText: {
    fontFamily: Fonts.body,
    fontSize: 12,
    lineHeight: 19,
    color: colors.textSecondary,
    textAlign: "center",
  },
  primaryButton: {
    marginTop: Spacing.one,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    backgroundColor: colors.primary,
    borderRadius: Radius.md,
  },
  primaryButtonText: {
    fontFamily: Fonts.button,
    fontSize: 12,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  list: {
    gap: Spacing.three,
  },
  donationCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: colors.backgroundElement,
    backgroundColor: "#FFFFFF",
  },
  foodIcon: {
    width: 43,
    height: 43,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Radius.md,
    backgroundColor: "#E8F4F1",
  },
  donationContent: {
    flex: 1,
    minWidth: 0,
    gap: Spacing.two,
  },
  donationTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.two,
  },
  foodName: {
    flex: 1,
    fontFamily: Fonts.button,
    fontSize: 14,
    fontWeight: "700",
    color: colors.text,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: Radius.sm,
  },
  statusText: {
    fontFamily: Fonts.button,
    fontSize: 9,
    fontWeight: "700",
    textTransform: "capitalize",
  },
  category: {
    fontFamily: Fonts.body,
    fontSize: 11,
    color: colors.secondary,
  },
  description: {
    fontFamily: Fonts.body,
    fontSize: 12,
    lineHeight: 18,
    color: colors.textSecondary,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  metaText: {
    flex: 1,
    fontFamily: Fonts.body,
    fontSize: 10,
    color: colors.textSecondary,
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: Spacing.two,
    marginTop: Spacing.one,
    borderTopWidth: 1,
    borderTopColor: colors.backgroundElement,
  },
  detailsText: {
    fontFamily: Fonts.button,
    fontSize: 11,
    fontWeight: "700",
    color: colors.primary,
  },
  bottomNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingTop: 9,
    paddingBottom: 8,
    paddingHorizontal: 2,
    borderTopWidth: 1,
    borderTopColor: colors.backgroundElement,
    backgroundColor: colors.background,
  },
  navItem: {
    flex: 1,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },
  navLabel: {
    fontFamily: Fonts.body,
    fontSize: 8,
    color: colors.textSecondary,
  },
  navLabelActive: {
    fontWeight: "700",
    color: colors.primary,
  },
  addNavButton: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 17,
    backgroundColor: colors.primary,
  },
  pressed: {
    opacity: 0.72,
  },
});