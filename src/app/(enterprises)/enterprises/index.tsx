import FontAwesome5 from "@react-native-vector-icons/fontawesome5";
import { router } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
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

import { BrandHeader } from "@/components/enterprise";
import { auth, db } from "@/config/firebase";
import { COLLECTIONS } from "@/constants/roles";
import { Colors, Fonts, Radius, Spacing } from "@/constants/theme";

const colors = Colors.light;

// Fields used to display each donation.
type DonationRecord = {
  id: string;
  foodName?: string;
  category?: string;
  quantity?: number;
  status?: string;
  createdTimestamp?: { toDate?: () => Date } | Date | string;
};

// Converts Firestore timestamps and other date formats into readable dates.
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

// Converts supported timestamp formats into milliseconds for sorting.
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

// Selects a status badge colour based on the donation's current status.
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

// Gets the first usable name from the user's profile.
function getUserName(
  profile: Record<string, unknown> | undefined,
  authDisplayName?: string | null,
): string {
  const candidates = [
    profile?.name,
    profile?.fullName,
    profile?.displayName,
    profile?.firstName,
    authDisplayName,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim()) {
      return candidate.trim();
    }
  }

  return "";
}

export default function EnterpriseDashboard() {
  const [enterpriseName, setEnterpriseName] = useState("");
  const [userName, setUserName] = useState("");
  const [donations, setDonations] = useState<DonationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  // Loads the user's profile and listens for donation changes in real time.
  useEffect(() => {
    let unsubscribeDonations: (() => void) | undefined;
    let cancelled = false;
    let activeUid: string | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      // Stop listening to the previous user's donations if the account changes.
      unsubscribeDonations?.();
      unsubscribeDonations = undefined;
      activeUid = user?.uid ?? null;

      if (!user) {
        setEnterpriseName("");
        setUserName("");
        setDonations([]);
        setError("");
        setLoading(false);
        router.replace("/Login" as never);
        return;
      }

      const uid = user.uid;
      let profileLoaded = false;
      let donationsLoaded = false;

      setLoading(true);
      setError("");
      setDonations([]);

      const finishLoadingIfReady = () => {
        if (
          !cancelled &&
          activeUid === uid &&
          profileLoaded &&
          donationsLoaded
        ) {
          setLoading(false);
        }
      };

      // Fetch the enterprise profile and the general user profile.
      const loadProfiles = async () => {
        try {
          const [enterpriseSnapshot, userSnapshot] = await Promise.all([
            getDoc(doc(db, COLLECTIONS.ENTERPRISES, uid)),
            getDoc(doc(db, COLLECTIONS.USERS, uid)),
          ]);

          if (cancelled || activeUid !== uid) return;

          const enterpriseData = enterpriseSnapshot.exists()
            ? enterpriseSnapshot.data()
            : {};

          const userData = userSnapshot.exists()
            ? userSnapshot.data()
            : undefined;

          setEnterpriseName(
            typeof enterpriseData.enterpriseName === "string"
              ? enterpriseData.enterpriseName
              : "",
          );

          setUserName(getUserName(userData, user.displayName));

          profileLoaded = true;
          finishLoadingIfReady();
        } catch (err) {
          console.error("Error loading enterprise profile:", err);

          if (!cancelled && activeUid === uid) {
            // Still use the Firebase Authentication name if the profile
            // document could not be loaded.
            setUserName(user.displayName ?? "");
            setError("We couldn't load your dashboard. Please try again.");
            setLoading(false);
          }
        }
      };

      void loadProfiles();

      // Listen for all donation changes belonging to this enterprise.
      const donationsQuery = query(
        collection(db, COLLECTIONS.DONATIONS),
        where("enterpriseId", "==", uid),
      );

      unsubscribeDonations = onSnapshot(
        donationsQuery,
        (snapshot) => {
          if (cancelled || activeUid !== uid) return;

          const records: DonationRecord[] = snapshot.docs.map(
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
          setError("");
          donationsLoaded = true;
          finishLoadingIfReady();
        },
        (err) => {
          console.error("Error listening to enterprise donations:", err);

          if (!cancelled && activeUid === uid) {
            setError("We couldn't load your dashboard. Please try again.");
            setLoading(false);
          }
        },
      );
    });

    return () => {
      cancelled = true;
      unsubscribeDonations?.();
      unsubscribeAuth();
    };
  }, [refreshKey]);

  // Centralises navigation to the dashboard's other enterprise screens.
  const goTo = (path: string) => {
    router.push(path as never);
  };

  // Donation totals update automatically when Firestore records change.
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
    <View style={styles.screen}>
      <BrandHeader
        role="ENTERPRISE"
        actionLabel="Notifications"
        onActionPress={() => goTo("/notifications")}
      />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.workspace}>
          {/* Personalised welcome section */}
          <View style={styles.welcomeSection}>
            <Text style={styles.eyebrow}>ENTERPRISE DASHBOARD</Text>

            <Text style={styles.heading}>
              Welcome back{userName ? "," : "."}
            </Text>

            {userName ? <Text style={styles.userName}>{userName}.</Text> : null}

            {enterpriseName ? (
              <Text style={styles.enterpriseName}>{enterpriseName}</Text>
            ) : null}

            <Text style={styles.subtitle}>
              Make a difference with every donation. Manage your surplus food
              and help get good food to the people who need it.
            </Text>
          </View>

          {/* Create donation call to action */}

          <Pressable
            accessibilityRole="button"
            onPress={() => goTo("/enterprises/donations/create")}
            style={({ pressed }) => [
              styles.featureCard,
              pressed && styles.cardPressed,
            ]}
          >
            {/* Decorative circles in the background */}
            <View pointerEvents="none" style={styles.circleLarge} />
            <View pointerEvents="none" style={styles.circleSmall} />

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
              <Text style={styles.featureActionText}>Create a donation</Text>
              <FontAwesome5
                name="arrow-right"
                size={13}
                color="#FFFFFF"
                iconStyle="solid"
              />
            </View>
          </Pressable>

          {/* Donation summary and records */}
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
                  onPress={() => setRefreshKey((key) => key + 1)}
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
                    <Text style={styles.statValue}>{donations.length}</Text>
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
                      <Text style={styles.sectionTitle}>Recent donations</Text>
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
                        <Text style={styles.emptyTitle}>No donations yet</Text>
                        <Text style={styles.emptyDescription}>
                          Your food listings will appear here once you create
                          your first donation.
                        </Text>
                      </View>
                    ) : (
                      donations.slice(0, 3).map((donation, index) => {
                        const statusStyle = getStatusColor(donation.status);

                        return (
                          <View key={donation.id}>
                            {index > 0 ? <View style={styles.divider} /> : null}

                            <Pressable
                              accessibilityRole="button"
                              onPress={() =>
                                goTo(`/enterprises/donations/${donation.id}`)
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

                {/* Enterprise shortcuts */}
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
                      <Text style={styles.actionTitle}>Enterprise profile</Text>
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

          {/* Personalised footer */}
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
            {userName ? (
              <Text style={styles.footerName}>{userName}</Text>
            ) : null}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flexGrow: 1,
    paddingBottom: Spacing.four,
  },
  workspace: {
    width: "100%",
    maxWidth: 900,
    alignSelf: "center",
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.four,
  },
  welcomeSection: {
    marginBottom: Spacing.four,
  },
  eyebrow: {
    fontFamily: Fonts.body,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.3,
    color: colors.textSecondary,
    marginBottom: Spacing.two,
  },
  heading: {
    fontFamily: Fonts.heading,
    fontSize: 27,
    fontWeight: "700",
    color: colors.text,
  },
  userName: {
    fontFamily: Fonts.heading,
    fontSize: 27,
    fontWeight: "700",
    color: colors.primary,
    marginTop: 2,
  },
  enterpriseName: {
    fontFamily: Fonts.body,
    fontSize: 15,
    fontWeight: "600",
    color: colors.textSecondary,
    marginTop: Spacing.one,
  },
  subtitle: {
    fontFamily: Fonts.body,
    fontSize: 14,
    lineHeight: 21,
    color: colors.textSecondary,
    marginTop: Spacing.two,
  },

  featureCard: {
    padding: Spacing.four,
    marginBottom: Spacing.four,
    borderRadius: Radius.lg,
    backgroundColor: colors.primary,
    overflow: "hidden",
    position: "relative",
  },

  circleLarge: {
    position: "absolute",
    width: 230,
    height: 230,
    borderRadius: 115,
    backgroundColor: "#FFFFFF",
    opacity: 0.1,
    top: -115,
    right: -65,
  },
  circleSmall: {
    position: "absolute",
    width: 135,
    height: 135,
    borderRadius: 68,
    backgroundColor: "#FFB5AA",
    opacity: 0.22,
    bottom: -85,
    right: 35,
  },
  featureIcon: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Radius.md,
    backgroundColor: "rgba(255,255,255,0.18)",
    marginBottom: Spacing.three,
  },
  featureEyebrow: {
    fontFamily: Fonts.body,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.3,
    color: "#FFFFFF",
    opacity: 0.85,
    marginBottom: Spacing.one,
  },
  featureTitle: {
    fontFamily: Fonts.heading,
    fontSize: 25,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  featureDescription: {
    fontFamily: Fonts.body,
    fontSize: 14,
    lineHeight: 21,
    color: "#FFFFFF",
    opacity: 0.9,
    marginTop: Spacing.two,
  },
  featureAction: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: Spacing.two,
    marginTop: Spacing.four,
  },
  featureActionText: {
    fontFamily: Fonts.button,
    fontSize: 13,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  section: {
    marginBottom: Spacing.four,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.two,
    marginBottom: Spacing.three,
  },
  sectionTitle: {
    fontFamily: Fonts.heading,
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
  },
  sectionCaption: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 3,
  },
  feedbackCard: {
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.two,
    padding: Spacing.four,
    backgroundColor: "#FFFFFF",
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: "#E8E5DF",
  },
  feedbackText: {
    fontFamily: Fonts.body,
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
    color: colors.textSecondary,
  },
  retryButton: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Radius.md,
    backgroundColor: colors.backgroundElement,
    marginTop: Spacing.one,
  },
  retryText: {
    fontFamily: Fonts.button,
    fontSize: 13,
    fontWeight: "700",
    color: colors.primary,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.two,
    marginBottom: Spacing.four,
  },
  statCard: {
    flexGrow: 1,
    flexBasis: "46%",
    minWidth: 130,
    padding: Spacing.three,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E8E5DF",
    borderRadius: Radius.lg,
  },
  statIcon: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Radius.md,
    marginBottom: Spacing.two,
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
    backgroundColor: "#EFEDFA",
  },
  statValue: {
    fontFamily: Fonts.heading,
    fontSize: 25,
    fontWeight: "700",
    color: colors.text,
  },
  statLabel: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 3,
  },
  viewAllButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.one,
    paddingVertical: Spacing.two,
    paddingLeft: Spacing.two,
  },
  viewAllText: {
    fontFamily: Fonts.button,
    fontSize: 12,
    fontWeight: "700",
    color: colors.primary,
  },
  donationsCard: {
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E8E5DF",
    borderRadius: Radius.lg,
  },
  emptyState: {
    alignItems: "center",
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.five,
    gap: Spacing.two,
  },
  emptyTitle: {
    fontFamily: Fonts.heading,
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
  },
  emptyDescription: {
    fontFamily: Fonts.body,
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
    color: colors.textSecondary,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#E8E5DF",
    marginHorizontal: Spacing.three,
  },
  donationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
  },
  donationIcon: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Radius.md,
    backgroundColor: "#E8F4F1",
  },
  donationCopy: {
    flex: 1,
    minWidth: 0,
  },
  donationName: {
    fontFamily: Fonts.body,
    fontSize: 14,
    fontWeight: "700",
    color: colors.text,
  },
  donationMeta: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 3,
  },
  donationDate: {
    fontFamily: Fonts.body,
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 3,
  },
  statusBadge: {
    alignSelf: "center",
    paddingHorizontal: Spacing.two,
    paddingVertical: 5,
    borderRadius: Radius.sm,
  },
  statusText: {
    fontFamily: Fonts.body,
    fontSize: 10,
    fontWeight: "700",
    textTransform: "capitalize",
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
    padding: Spacing.three,
    marginTop: Spacing.two,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E8E5DF",
    borderRadius: Radius.lg,
  },
  actionIcon: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Radius.md,
  },
  actionCopy: {
    flex: 1,
  },
  actionTitle: {
    fontFamily: Fonts.body,
    fontSize: 14,
    fontWeight: "700",
    color: colors.text,
  },
  actionDescription: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 3,
  },
  cardPressed: {
    opacity: 0.72,
  },
  footer: {
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.two,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.four,
  },
  footerText: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: "center",
  },
  footerName: {
    fontFamily: Fonts.heading,
    fontSize: 15,
    fontWeight: "700",
    color: colors.primary,
    textAlign: "center",
  },
});
