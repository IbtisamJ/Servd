import FontAwesome5 from "@react-native-vector-icons/fontawesome5";
import { router } from "expo-router";
import { onAuthStateChanged, signOut } from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { useCallback, useEffect, useState } from "react";
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

type DonationRecord = {
  id: string;
  foodName?: string;
  category?: string;
  quantity?: number;
  status?: string;
  createdTimestamp?: { toDate?: () => Date } | Date | string;
};

function formatDate(value: DonationRecord["createdTimestamp"]): string {
  if (!value) return "Date unavailable";

  let date: Date;

  if (
    typeof value === "object" &&
    "toDate" in value &&
    typeof value.toDate === "function"
  ) {
    date = value.toDate();
  } else {
    date = value instanceof Date ? value : new Date(value as string);
  }

  if (Number.isNaN(date.getTime())) return "Date unavailable";

  return date.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getTimestamp(value: DonationRecord["createdTimestamp"]): number {
  if (!value) return 0;

  if (
    typeof value === "object" &&
    "toDate" in value &&
    typeof value.toDate === "function"
  ) {
    return value.toDate().getTime();
  }

  const date = value instanceof Date ? value : new Date(value as string);
  return Number.isNaN(date.getTime()) ? 0 : date.getTime();
}

function getStatusColor(status?: string) {
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

export default function EnterpriseDashboard() {
  const [enterpriseName, setEnterpriseName] = useState("");
  const [donations, setDonations] = useState<DonationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async (uid: string) => {
    setLoading(true);
    setError("");

    try {
      const enterpriseRef = doc(
        db,
        COLLECTIONS.ENTERPRISES,
        uid,
      );

      const donationsQuery = query(
        collection(db, COLLECTIONS.DONATIONS),
        where("enterpriseId", "==", uid),
      );

      const [enterpriseSnapshot, donationSnapshot] = await Promise.all([
        getDoc(enterpriseRef),
        getDocs(donationsQuery),
      ]);

      if (enterpriseSnapshot.exists()) {
        setEnterpriseName(
          enterpriseSnapshot.data().enterpriseName ?? "",
        );
      } else {
        setEnterpriseName("");
      }

      const records: DonationRecord[] = donationSnapshot.docs.map(
        (donationDoc) => ({
          ...donationDoc.data(),
          id: donationDoc.id,
        }),
      );

      records.sort(
        (a, b) =>
          getTimestamp(b.createdTimestamp) -
          getTimestamp(a.createdTimestamp),
      );

      setDonations(records);
    } catch (err) {
      console.error("Error loading enterprise dashboard:", err);
      setError("We couldn't load your dashboard. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        setEnterpriseName("");
        setDonations([]);
        setLoading(false);
        router.replace("/Login" as never);
        return;
      }

      void loadDashboard(user.uid);
    });

    return unsubscribe;
  }, [loadDashboard]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.replace("/Login" as never);
    } catch (err) {
      console.error("Error logging out:", err);
      setError("Unable to log out. Please try again.");
    }
  };

  const goTo = (path: string) => {
    router.push(path as never);
  };

  const availableCount = donations.filter(
    (donation) => donation.status?.toLowerCase() === "available",
  ).length;

  const reservedCount = donations.filter(
    (donation) => donation.status?.toLowerCase() === "reserved",
  ).length;

  const collectedCount = donations.filter(
    (donation) => donation.status?.toLowerCase() === "collected",
  ).length;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.workspace}>
            {/* Header */}
            <View style={styles.topBar}>
              <View>
                <Text style={styles.brandName}>Servd</Text>
                <Text style={styles.eyebrow}>ENTERPRISE DASHBOARD</Text>
              </View>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Log out"
                onPress={handleLogout}
                style={({ pressed }) => [
                  styles.logoutButton,
                  pressed && styles.pressed,
                ]}
              >
                <FontAwesome5
                  name="sign-out-alt"
                  size={15}
                  color={colors.primary}
                  iconStyle="solid"
                />
                <Text style={styles.logoutText}>Log out</Text>
              </Pressable>
            </View>

            {/* Welcome */}
            <View style={styles.welcomeSection}>
              <Text style={styles.heading}>
                Welcome back{enterpriseName ? "," : "."}
              </Text>

              {enterpriseName ? (
                <Text style={styles.enterpriseName}>
                  {enterpriseName}
                </Text>
              ) : null}

              <Text style={styles.subtitle}>
                Make a difference with every donation. Manage your surplus
                food and help get good food to the people who need it.
              </Text>
            </View>

            {/* Create donation feature */}
            <Pressable
              accessibilityRole="button"
              onPress={() => goTo("/enterprises/donations/create")}
              style={({ pressed }) => [
                styles.featureCard,
                pressed && styles.cardPressed,
              ]}
            >
              <View style={styles.featureIcon}>
                <FontAwesome5
                  name="plus"
                  size={20}
                  color="#FFFFFF"
                  iconStyle="solid"
                />
              </View>

              <Text style={styles.featureEyebrow}>MAKE AN IMPACT</Text>
              <Text style={styles.featureTitle}>Share good food.</Text>
              <Text style={styles.featureDescription}>
                List surplus food for local NGOs to discover and collect.
              </Text>

              <View style={styles.featureAction}>
                <Text style={styles.featureActionText}>
                  Create a donation
                </Text>
                <FontAwesome5
                  name="arrow-right"
                  size={13}
                  color="#FFFFFF"
                  iconStyle="solid"
                />
              </View>
            </Pressable>

            {/* Donation statistics */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Your donations</Text>
                <Text style={styles.sectionCaption}>Live records</Text>
              </View>

              {loading ? (
                <View style={styles.feedbackCard}>
                  <ActivityIndicator color={colors.primary} size="large" />
                  <Text style={styles.feedbackText}>
                    Loading your donations...
                  </Text>
                </View>
              ) : error ? (
                <View style={styles.feedbackCard}>
                  <FontAwesome5
                    name="exclamation-circle"
                    size={22}
                    color={colors.error}
                    iconStyle="solid"
                  />
                  <Text style={styles.feedbackText}>{error}</Text>
                  <Pressable
                    onPress={() => {
                      const user = auth.currentUser;
                      if (user) void loadDashboard(user.uid);
                    }}
                    style={styles.retryButton}
                  >
                    <Text style={styles.retryText}>Try again</Text>
                  </Pressable>
                </View>
              ) : (
                <>
                  <View style={styles.statsGrid}>
                    <View style={styles.statCard}>
                      <View style={[styles.statIcon, styles.tealIcon]}>
                        <FontAwesome5
                          name="box-open"
                          size={17}
                          color={colors.secondary}
                          iconStyle="solid"
                        />
                      </View>
                      <Text style={styles.statValue}>
                        {donations.length}
                      </Text>
                      <Text style={styles.statLabel}>Total donations</Text>
                    </View>

                    <View style={styles.statCard}>
                      <View style={[styles.statIcon, styles.oliveIcon]}>
                        <FontAwesome5
                          name="check-circle"
                          size={17}
                          color={colors.accent}
                          iconStyle="solid"
                        />
                      </View>
                      <Text style={styles.statValue}>{availableCount}</Text>
                      <Text style={styles.statLabel}>Available</Text>
                    </View>

                    <View style={styles.statCard}>
                      <View style={[styles.statIcon, styles.amberIcon]}>
                        <FontAwesome5
                          name="clock"
                          size={17}
                          color="#946000"
                          iconStyle="solid"
                        />
                      </View>
                      <Text style={styles.statValue}>{reservedCount}</Text>
                      <Text style={styles.statLabel}>Reserved</Text>
                    </View>

                    <View style={styles.statCard}>
                      <View style={[styles.statIcon, styles.purpleIcon]}>
                        <FontAwesome5
                          name="hand-holding-heart"
                          size={17}
                          color="#6B63A8"
                          iconStyle="solid"
                        />
                      </View>
                      <Text style={styles.statValue}>{collectedCount}</Text>
                      <Text style={styles.statLabel}>Collected</Text>
                    </View>
                  </View>

                  {/* Recent donations */}
                  <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                      <View>
                        <Text style={styles.sectionTitle}>
                          Recent donations
                        </Text>
                        <Text style={styles.sectionCaption}>
                          Your latest food listings
                        </Text>
                      </View>

                      <Pressable
                        onPress={() => goTo("/enterprises/donations")}
                        style={styles.viewAllButton}
                      >
                        <Text style={styles.viewAllText}>View all</Text>
                        <FontAwesome5
                          name="arrow-right"
                          size={11}
                          color={colors.primary}
                          iconStyle="solid"
                        />
                      </Pressable>
                    </View>

                    <View style={styles.donationsCard}>
                      {donations.length === 0 ? (
                        <View style={styles.emptyState}>
                          <FontAwesome5
                            name="box-open"
                            size={25}
                            color={colors.textSecondary}
                            iconStyle="solid"
                          />
                          <Text style={styles.emptyTitle}>
                            No donations yet
                          </Text>
                          <Text style={styles.emptyDescription}>
                            Your food listings will appear here once you
                            create your first donation.
                          </Text>
                        </View>
                      ) : (
                        donations.slice(0, 3).map((donation, index) => {
                          const statusStyle = getStatusColor(donation.status);

                          return (
                            <View key={donation.id}>
                              {index > 0 ? (
                                <View style={styles.divider} />
                              ) : null}

                              <Pressable
                                accessibilityRole="button"
                                onPress={() =>
                                  goTo(
                                    `/enterprises/donations/${donation.id}`,
                                  )
                                }
                                style={({ pressed }) => [
                                  styles.donationRow,
                                  pressed && styles.cardPressed,
                                ]}
                              >
                                <View style={styles.donationIcon}>
                                  <FontAwesome5
                                    name="utensils"
                                    size={16}
                                    color={colors.secondary}
                                    iconStyle="solid"
                                  />
                                </View>

                                <View style={styles.donationCopy}>
                                  <Text
                                    style={styles.donationName}
                                    numberOfLines={1}
                                  >
                                    {donation.foodName || "Untitled donation"}
                                  </Text>

                                  <Text style={styles.donationMeta}>
                                    {donation.category || "Food donation"}
                                    {donation.quantity != null
                                      ? ` · Quantity: ${donation.quantity}`
                                      : ""}
                                  </Text>

                                  <Text style={styles.donationDate}>
                                    Created{" "}
                                    {formatDate(donation.createdTimestamp)}
                                  </Text>
                                </View>

                                <View
                                  style={[
                                    styles.statusBadge,
                                    {
                                      backgroundColor: statusStyle.background,
                                    },
                                  ]}
                                >
                                  <Text
                                    style={[
                                      styles.statusText,
                                      { color: statusStyle.text },
                                    ]}
                                  >
                                    {donation.status || "Unknown"}
                                  </Text>
                                </View>
                              </Pressable>
                            </View>
                          );
                        })
                      )}
                    </View>
                  </View>

                  {/* Account shortcuts */}
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Manage your account</Text>

                    <Pressable
                      style={styles.actionRow}
                      onPress={() => goTo("/enterprises/reservations")}
                    >
                      <View style={[styles.actionIcon, styles.tealIcon]}>
                        <FontAwesome5
                          name="clipboard-list"
                          size={17}
                          color={colors.secondary}
                          iconStyle="solid"
                        />
                      </View>

                      <View style={styles.actionCopy}>
                        <Text style={styles.actionTitle}>Reservations</Text>
                        <Text style={styles.actionDescription}>
                          Keep track of food collections.
                        </Text>
                      </View>

                      <FontAwesome5
                        name="chevron-right"
                        size={12}
                        color={colors.textSecondary}
                        iconStyle="solid"
                      />
                    </Pressable>

                    <Pressable
                      style={styles.actionRow}
                      onPress={() => goTo("/notifications")}
                    >
                      <View style={[styles.actionIcon, styles.oliveIcon]}>
                        <FontAwesome5
                          name="bell"
                          size={17}
                          color={colors.accent}
                          iconStyle="solid"
                        />
                      </View>

                      <View style={styles.actionCopy}>
                        <Text style={styles.actionTitle}>Notifications</Text>
                        <Text style={styles.actionDescription}>
                          Check your latest updates.
                        </Text>
                      </View>

                      <FontAwesome5
                        name="chevron-right"
                        size={12}
                        color={colors.textSecondary}
                        iconStyle="solid"
                      />
                    </Pressable>

                    <Pressable
                      style={styles.actionRow}
                      onPress={() => goTo("/enterprises/profile")}
                    >
                      <View style={[styles.actionIcon, styles.oliveIcon]}>
                        <FontAwesome5
                          name="building"
                          size={17}
                          color={colors.accent}
                          iconStyle="solid"
                        />
                      </View>

                      <View style={styles.actionCopy}>
                        <Text style={styles.actionTitle}>
                          Enterprise profile
                        </Text>
                        <Text style={styles.actionDescription}>
                          View your business details.
                        </Text>
                      </View>

                      <FontAwesome5
                        name="chevron-right"
                        size={12}
                        color={colors.textSecondary}
                        iconStyle="solid"
                      />
                    </Pressable>
                  </View>
                </>
              )}
            </View>

            <View style={styles.footer}>
              <FontAwesome5
                name="heart"
                size={12}
                color={colors.primary}
                iconStyle="solid"
              />
              <Text style={styles.footerText}>
                Good food deserves to be shared.
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Bottom navigation */}
        <View style={styles.bottomNav}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Dashboard"
            style={styles.navItem}
            onPress={() => router.replace("/enterprises" as never)}
          >
            <FontAwesome5
              name="home"
              size={19}
              color={colors.primary}
              iconStyle="solid"
            />
            <Text style={[styles.navLabel, styles.navLabelActive]}>
              Home
            </Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="My donations"
            style={styles.navItem}
            onPress={() => goTo("/enterprises/donations")}
          >
            <FontAwesome5
              name="box-open"
              size={19}
              color={colors.textSecondary}
              iconStyle="solid"
            />
            <Text style={styles.navLabel}>Donations</Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Notifications"
            style={styles.navItem}
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
            accessibilityRole="button"
            accessibilityLabel="Create a donation"
            style={styles.navItem}
            onPress={() => goTo("/enterprises/donations/create")}
          >
            <View style={styles.addNavButton}>
              <FontAwesome5
                name="plus"
                size={19}
                color="#FFFFFF"
                iconStyle="solid"
              />
            </View>
            <Text style={styles.navLabel}>Add food</Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Reservations"
            style={styles.navItem}
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
            accessibilityRole="button"
            accessibilityLabel="Enterprise profile"
            style={styles.navItem}
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
    paddingTop: Spacing.two,
    paddingBottom: Spacing.four,
  },
  workspace: {
    width: "100%",
    maxWidth: 800,
    alignSelf: "center",
    gap: Spacing.four,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  brandName: {
    fontFamily: Fonts.heading,
    fontSize: 25,
    color: colors.text,
  },
  eyebrow: {
    fontFamily: Fonts.body,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.3,
    color: colors.secondary,
    marginTop: 3,
  },
  logoutButton: {
    minHeight: 40,
    paddingHorizontal: 12,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: colors.backgroundElement,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#FFFFFF",
  },
  logoutText: {
    fontFamily: Fonts.button,
    fontSize: 12,
    fontWeight: "700",
    color: colors.primary,
  },
  welcomeSection: {
    gap: Spacing.two,
  },
  heading: {
    fontFamily: Fonts.heading,
    fontSize: 29,
    lineHeight: 36,
    color: colors.text,
  },
  enterpriseName: {
    fontFamily: Fonts.heading,
    fontSize: 23,
    lineHeight: 30,
    color: colors.primary,
  },
  subtitle: {
    fontFamily: Fonts.body,
    fontSize: 13,
    lineHeight: 21,
    color: colors.textSecondary,
    maxWidth: 520,
  },
  featureCard: {
    backgroundColor: colors.primary,
    borderRadius: Radius.lg,
    padding: Spacing.four,
    gap: Spacing.two,
  },
  featureIcon: {
    width: 43,
    height: 43,
    borderRadius: Radius.md,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.one,
  },
  featureEyebrow: {
    fontFamily: Fonts.button,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.4,
    color: "#FFFFFF",
    opacity: 0.85,
  },
  featureTitle: {
    fontFamily: Fonts.heading,
    fontSize: 27,
    lineHeight: 34,
    color: "#FFFFFF",
  },
  featureDescription: {
    fontFamily: Fonts.body,
    fontSize: 13,
    lineHeight: 20,
    color: "#FFFFFF",
    opacity: 0.9,
    maxWidth: 380,
  },
  featureAction: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    marginTop: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    backgroundColor: "rgba(255,255,255,0.18)",
    borderRadius: Radius.md,
  },
  featureActionText: {
    fontFamily: Fonts.button,
    fontSize: 12,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  section: {
    gap: Spacing.three,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.two,
  },
  sectionTitle: {
    fontFamily: Fonts.heading,
    fontSize: 20,
    color: colors.text,
  },
  sectionCaption: {
    fontFamily: Fonts.body,
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 3,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.two,
  },
  statCard: {
    flexGrow: 1,
    flexBasis: "44%",
    minWidth: 0,
    minHeight: 120,
    padding: Spacing.three,
    borderWidth: 1,
    borderColor: colors.backgroundElement,
    borderRadius: Radius.lg,
    backgroundColor: "#FFFFFF",
    justifyContent: "space-between",
    gap: Spacing.two,
  },
  statIcon: {
    width: 35,
    height: 35,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  tealIcon: {
    backgroundColor: "#E8F4F1",
  },
  oliveIcon: {
    backgroundColor: "#F0F3E8",
  },
  amberIcon: {
    backgroundColor: "#FFF3DF",
  },
  purpleIcon: {
    backgroundColor: "#F0EDFA",
  },
  statValue: {
    fontFamily: Fonts.heading,
    fontSize: 27,
    lineHeight: 33,
    color: colors.text,
  },
  statLabel: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: colors.textSecondary,
  },
  donationsCard: {
    borderWidth: 1,
    borderColor: colors.backgroundElement,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.three,
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
  },
  donationRow: {
    minHeight: 82,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    paddingVertical: Spacing.three,
  },
  donationIcon: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    backgroundColor: "#E8F4F1",
    alignItems: "center",
    justifyContent: "center",
  },
  donationCopy: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },
  donationName: {
    fontFamily: Fonts.button,
    fontSize: 13,
    fontWeight: "700",
    color: colors.text,
  },
  donationMeta: {
    fontFamily: Fonts.body,
    fontSize: 11,
    color: colors.textSecondary,
  },
  donationDate: {
    fontFamily: Fonts.body,
    fontSize: 10,
    color: colors.textSecondary,
  },
  statusBadge: {
    borderRadius: Radius.sm,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  statusText: {
    fontFamily: Fonts.button,
    fontSize: 10,
    fontWeight: "700",
    textTransform: "capitalize",
  },
  divider: {
    height: 1,
    backgroundColor: colors.backgroundElement,
  },
  emptyState: {
    paddingVertical: Spacing.five,
    paddingHorizontal: Spacing.three,
    alignItems: "center",
    gap: Spacing.two,
  },
  emptyTitle: {
    fontFamily: Fonts.button,
    fontSize: 14,
    fontWeight: "700",
    color: colors.text,
  },
  emptyDescription: {
    fontFamily: Fonts.body,
    fontSize: 12,
    lineHeight: 19,
    textAlign: "center",
    color: colors.textSecondary,
  },
  viewAllButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingVertical: Spacing.two,
  },
  viewAllText: {
    fontFamily: Fonts.button,
    fontSize: 12,
    fontWeight: "700",
    color: colors.primary,
  },
  actionRow: {
    minHeight: 72,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
    padding: Spacing.three,
    borderWidth: 1,
    borderColor: colors.backgroundElement,
    borderRadius: Radius.lg,
    backgroundColor: "#FFFFFF",
  },
  actionIcon: {
    width: 39,
    height: 39,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  actionCopy: {
    flex: 1,
    gap: 4,
  },
  actionTitle: {
    fontFamily: Fonts.button,
    fontSize: 13,
    fontWeight: "700",
    color: colors.text,
  },
  actionDescription: {
    fontFamily: Fonts.body,
    fontSize: 11,
    color: colors.textSecondary,
  },
  feedbackCard: {
    minHeight: 160,
    padding: Spacing.four,
    borderWidth: 1,
    borderColor: colors.backgroundElement,
    borderRadius: Radius.lg,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.three,
    backgroundColor: "#FFFFFF",
  },
  feedbackText: {
    fontFamily: Fonts.body,
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: "center",
  },
  retryButton: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    backgroundColor: colors.primary,
    borderRadius: Radius.md,
  },
  retryText: {
    fontFamily: Fonts.button,
    fontSize: 12,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.two,
    paddingVertical: Spacing.three,
  },
  footerText: {
    fontFamily: Fonts.body,
    fontSize: 11,
    color: colors.textSecondary,
  },
  bottomNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingTop: 10,
    paddingBottom: 8,
    paddingHorizontal: 2,
    borderTopWidth: 1,
    borderTopColor: colors.backgroundElement,
    backgroundColor: colors.background,
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    minHeight: 48,
  },
  navLabel: {
    fontFamily: Fonts.body,
    fontSize: 8,
    color: colors.textSecondary,
  },
  navLabelActive: {
    color: colors.primary,
    fontWeight: "700",
  },
  addNavButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
  },
  pressed: {
    opacity: 0.7,
  },
  cardPressed: {
    opacity: 0.75,
  },
});