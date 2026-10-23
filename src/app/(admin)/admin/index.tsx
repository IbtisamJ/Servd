/**
 * Admin Dashboard Screen
 *
 * Displays live administrative statistics and recent records retrieved from
 * Firestore through the admin service.
 *
 * Responsibilities:
 * - Display pending NGO, active donation, reservation, and user counts.
 * - Show recent pending NGO applications and donations.
 * - Navigate to the relevant admin management screens.
 * - Handle loading, errors, and retrying data requests.
 */

import FontAwesome5 from "@react-native-vector-icons/fontawesome5";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";

import { Colors, Fonts, Radius, MaxContentWidth } from "@/constants/theme";
import {
  getPendingNGOs,
  manageDonationRecords,
  manageReservationRecords,
  manageUsers,
} from "@/services/adminService";

const colors = Colors.light;

const BORDER_COLOR = "#E8EAED";
const MUTED_BACKGROUND = "#F7F8FA";
const SUBTLE_TEXT = "#667085";
const TEAL_LIGHT = "#E8F4F1";
const RED_LIGHT = "#FCECEB";
const OLIVE_LIGHT = "#F0F3E8";
const PURPLE_LIGHT = "#F0EDFA";

// Defines the structure of dashboard records and statistic cards.
type DashboardRecord = {
  id: string;
  [key: string]: any;
};

type DashboardStat = {
  label: string;
  value: string;
  icon: string;
  color: string;
  iconBackground: string;
};

// Converts different date formats into a timestamp for sorting and display.
function getTimestamp(value: any): number {
  if (!value) return 0;

  if (typeof value.toMillis === "function") {
    return value.toMillis();
  }

  if (typeof value.toDate === "function") {
    return value.toDate().getTime();
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 0 : date.getTime();
}

// Formats a date for display or returns a fallback when it is unavailable.
function formatDate(value: any): string {
  const timestamp = getTimestamp(value);

  if (!timestamp) return "Date unavailable";

  return new Date(timestamp).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// Returns the appropriate background colour, text colour, and label for a status.
function getStatusStyle(status: string) {
  switch (status.toLowerCase()) {
    case "available":
      return {
        background: TEAL_LIGHT,
        text: "#087F6A",
        label: "Available",
      };
    case "reserved":
      return {
        background: "#FFF3DF",
        text: "#946000",
        label: "Reserved",
      };
    case "completed":
      return {
        background: TEAL_LIGHT,
        text: "#087F6A",
        label: "Completed",
      };
    case "cancelled":
    case "canceled":
      return {
        background: RED_LIGHT,
        text: "#B42318",
        label: status.charAt(0).toUpperCase() + status.slice(1),
      };
    default:
      return {
        background: "#EEF0F3",
        text: "#596273",
        label: status.charAt(0).toUpperCase() + status.slice(1),
      };
  }
}

// Reusable section heading with an optional subtitle and action button.
function SectionHeading({
  title,
  subtitle,
  actionLabel,
  onAction,
}: {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionHeadingText}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {subtitle ? (
          <Text style={styles.sectionSubtitle}>{subtitle}</Text>
        ) : null}
      </View>

      {actionLabel && onAction ? (
        <Pressable
          accessibilityRole="button"
          onPress={onAction}
          style={({ pressed }) => [
            styles.viewAllButton,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.link}>{actionLabel}</Text>
          <FontAwesome5
            name="arrow-right"
            size={11}
            color={colors.primary}
            iconStyle="solid"
          />
        </Pressable>
      ) : null}
    </View>
  );
}

// Displays a message and icon when a section has no records to show.
function EmptyState({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <View style={styles.emptyState}>
      <View style={styles.emptyIcon}>
        <FontAwesome5
          name={icon as any}
          size={19}
          color={SUBTLE_TEXT}
          iconStyle="solid"
        />
      </View>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyDescription}>{description}</Text>
    </View>
  );
}

export default function AdminDashboard() {
  const router = useRouter();
  const { width } = useWindowDimensions();

  // Adjusts spacing and card layout according to the screen width.
  const horizontalPadding = width >= 1100 ? 36 : width >= 700 ? 28 : 16;
  const isCompact = width < 520;

  // Stores the dashboard records, summary statistics, and loading/error states.
  const [pendingNGOs, setPendingNGOs] = useState<DashboardRecord[]>([]);
  const [donations, setDonations] = useState<DashboardRecord[]>([]);
  const [stats, setStats] = useState<DashboardStat[]>([
    {
      label: "Pending NGO approvals",
      value: "—",
      icon: "building",
      color: "#C62828",
      iconBackground: RED_LIGHT,
    },
    {
      label: "Active donations",
      value: "—",
      icon: "box",
      color: "#008080",
      iconBackground: TEAL_LIGHT,
    },
    {
      label: "Active reservations",
      value: "—",
      icon: "calendar-alt",
      color: "#718C3E",
      iconBackground: OLIVE_LIGHT,
    },
    {
      label: "Registered users",
      value: "—",
      icon: "users",
      color: "#6B63A8",
      iconBackground: PURPLE_LIGHT,
    },
  ]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Navigates to the selected admin page.
  const goTo = (path: string) => router.push(path as never);

  // Fetches dashboard data and updates the records and summary statistics.
  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      // Requests all four sets of records at the same time.
      const [ngoResult, donationResult, reservationResult, userResult] =
        await Promise.all([
          getPendingNGOs(),
          manageDonationRecords(),
          manageReservationRecords(),
          manageUsers(),
        ]);

      // Stops processing if any service request fails.
      if (!ngoResult.success) {
        throw new Error(ngoResult.error || "Could not load pending NGOs.");
      }

      if (!donationResult.success) {
        throw new Error(donationResult.error || "Could not load donations.");
      }

      if (!reservationResult.success) {
        throw new Error(
          reservationResult.error || "Could not load reservations.",
        );
      }

      if (!userResult.success) {
        throw new Error(userResult.error || "Could not load users.");
      }

      // Uses the returned records or empty arrays when no data is available.
      const ngoRecords = (ngoResult.data || []) as DashboardRecord[];
      const donationRecords = (donationResult.data || []) as DashboardRecord[];
      const reservationRecords = (reservationResult.data ||
        []) as DashboardRecord[];
      const userRecords = (userResult.data || []) as DashboardRecord[];

      // Counts donations that are available or reserved.
      const activeDonations = donationRecords.filter((donation) => {
        const status = String(donation.status || "").toLowerCase();
        return status === "available" || status === "reserved";
      });

      // Counts reservations with an active status.
      const activeReservations = reservationRecords.filter(
        (reservation) =>
          String(reservation.status || "").toLowerCase() === "active",
      );

      // Sorts donations from newest to oldest and keeps the three most recent.
      const recentDonationRecords = [...donationRecords]
        .sort(
          (a, b) =>
            getTimestamp(b.createdTimestamp || b.createdAt) -
            getTimestamp(a.createdTimestamp || a.createdAt),
        )
        .slice(0, 3);

      // Saves the three latest NGO applications and donation records for display.
      setPendingNGOs(ngoRecords.slice(0, 3));
      setDonations(recentDonationRecords);

      // Updates the summary cards with the latest record counts.
      setStats([
        {
          label: "Pending NGO approvals",
          value: String(ngoRecords.length),
          icon: "building",
          color: "#C62828",
          iconBackground: RED_LIGHT,
        },
        {
          label: "Active donations",
          value: String(activeDonations.length),
          icon: "box",
          color: "#008080",
          iconBackground: TEAL_LIGHT,
        },
        {
          label: "Active reservations",
          value: String(activeReservations.length),
          icon: "calendar-alt",
          color: "#718C3E",
          iconBackground: OLIVE_LIGHT,
        },
        {
          label: "Registered users",
          value: String(userRecords.length),
          icon: "users",
          color: "#6B63A8",
          iconBackground: PURPLE_LIGHT,
        },
      ]);
    } catch (err) {
      // Logs the error and displays a message if loading fails.
      console.error("Error loading admin dashboard:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while loading the dashboard.",
      );
    } finally {
      // Stops the loading indicator whether the request succeeds or fails.
      setLoading(false);
    }
  }, []);

  // Loads dashboard data when the screen first opens.
  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[
        styles.content,
        {
          paddingHorizontal: horizontalPadding,
          paddingBottom: width >= 700 ? 48 : 32,
        },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.workspace}>
        <View style={styles.pageHeader}>
          <View style={styles.pageHeadingGroup}>
            <Text style={styles.eyebrow}>SERVD / ADMINISTRATION</Text>
            <Text style={styles.heading}>Dashboard overview</Text>
            <Text style={styles.description}>
              Monitor platform activity and review items requiring attention.
            </Text>
          </View>

          {/* Lets the admin reload dashboard data manually. */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Refresh dashboard"
            onPress={loadDashboard}
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
            {!isCompact ? (
              <Text style={styles.refreshButtonText}>Refresh data</Text>
            ) : null}
          </Pressable>
        </View>

        {/* Displays a loading indicator or error message before showing dashboard data. */}
        {loading ? (
          <View style={styles.feedbackCard}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.feedbackTitle}>Loading dashboard</Text>
            <Text style={styles.feedbackDescription}>
              Retrieving the latest platform records.
            </Text>
          </View>
        ) : error ? (
          <View style={styles.feedbackCard}>
            <View style={styles.errorIcon}>
              <FontAwesome5
                name="exclamation-circle"
                size={21}
                color="#C62828"
                iconStyle="solid"
              />
            </View>
            <Text style={styles.feedbackTitle}>Unable to load dashboard</Text>
            <Text style={styles.feedbackDescription}>{error}</Text>
            <Pressable
              accessibilityRole="button"
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && styles.pressed,
              ]}
              onPress={loadDashboard}
            >
              <FontAwesome5
                name="redo-alt"
                size={13}
                color="#FFFFFF"
                iconStyle="solid"
              />
              <Text style={styles.primaryButtonText}>Try again</Text>
            </Pressable>
          </View>
        ) : (
          <>
            {/* Displays the current totals for the main platform records. */}
            <View style={styles.metricsHeader}>
              <Text style={styles.metricsTitle}>Platform at a glance</Text>
              <Text style={styles.metricsCaption}>Current record totals</Text>
            </View>

            <View style={styles.statsGrid}>
              {stats.map((stat, index) => (
                <View
                  key={stat.label}
                  style={[
                    styles.statCard,
                    {
                      flexBasis:
                        width >= 1100 ? "22%" : width >= 700 ? "45%" : "47%",
                      minWidth: 0,
                    },
                    isCompact && styles.compactStatCard,
                  ]}
                >
                  <View style={styles.statTopRow}>
                    <View
                      style={[
                        styles.statIcon,
                        { backgroundColor: stat.iconBackground },
                      ]}
                    >
                      <FontAwesome5
                        name={stat.icon as any}
                        size={17}
                        color={stat.color}
                        iconStyle="solid"
                      />
                    </View>
                    <View style={styles.statIndex}>
                      <Text style={styles.statIndexText}>0{index + 1}</Text>
                    </View>
                  </View>

                  <Text style={styles.statValue}>{stat.value}</Text>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                </View>
              ))}
            </View>

            <View
              style={[
                styles.mainSections,
                width >= 900 && styles.mainSectionsWide,
              ]}
            >
              {/* Displays the three most recent NGO applications awaiting review. */}
              <View style={[styles.section, styles.mainSectionColumn]}>
                <SectionHeading
                  title="Pending NGO approvals"
                  subtitle="Applications waiting for review"
                  actionLabel="View all"
                  onAction={() => goTo("/admin/ngos")}
                />

                <View style={styles.card}>
                  {pendingNGOs.length === 0 ? (
                    <EmptyState
                      icon="check-circle"
                      title="You're all caught up"
                      description="There are no pending NGO applications to review."
                    />
                  ) : (
                    pendingNGOs.map((ngo, index) => (
                      <View key={ngo.id}>
                        {index > 0 ? <View style={styles.divider} /> : null}

                        <Pressable
                          accessibilityRole="button"
                          onPress={() => goTo(`/admin/ngos/${ngo.id}`)}
                          style={({ pressed }) => [
                            styles.listRow,
                            pressed && styles.rowPressed,
                          ]}
                        >
                          <View style={styles.ngoIcon}>
                            <FontAwesome5
                              name="building"
                              size={16}
                              color={colors.secondary}
                              iconStyle="solid"
                            />
                          </View>

                          <View style={styles.rowText}>
                            <Text style={styles.rowTitle} numberOfLines={1}>
                              {ngo.organisationName || "Unnamed NGO"}
                            </Text>
                            <Text style={styles.rowSubtitle}>
                              Submitted {formatDate(ngo.createdAt)}
                            </Text>
                          </View>

                          <View style={styles.reviewAction}>
                            <Text style={styles.reviewActionText}>Review</Text>
                            <FontAwesome5
                              name="chevron-right"
                              size={10}
                              color={colors.primary}
                              iconStyle="solid"
                            />
                          </View>
                        </Pressable>
                      </View>
                    ))
                  )}
                </View>
              </View>

              {/* Displays the three most recent donations with their current statuses. */}
              <View style={[styles.section, styles.mainSectionColumn]}>
                <SectionHeading
                  title="Recent donations"
                  subtitle="Latest donation records"
                  actionLabel="View all"
                  onAction={() => goTo("/admin/donations")}
                />

                <View style={styles.card}>
                  {donations.length === 0 ? (
                    <EmptyState
                      icon="box-open"
                      title="No donations yet"
                      description="Donation records will appear here when available."
                    />
                  ) : (
                    donations.map((donation, index) => {
                      const status = String(
                        donation.status || "unknown",
                      ).toLowerCase();
                      const statusStyle = getStatusStyle(status);

                      return (
                        <View key={donation.id}>
                          {index > 0 ? <View style={styles.divider} /> : null}

                          <Pressable
                            accessibilityRole="button"
                            onPress={() =>
                              goTo(`/admin/donations/${donation.id}`)
                            }
                            style={({ pressed }) => [
                              styles.listRow,
                              pressed && styles.rowPressed,
                            ]}
                          >
                            <View style={styles.donationIcon}>
                              <FontAwesome5
                                name="box"
                                size={15}
                                color={colors.textSecondary}
                                iconStyle="solid"
                              />
                            </View>

                            <View style={styles.rowText}>
                              <Text style={styles.rowTitle} numberOfLines={1}>
                                {donation.foodName || "Unnamed donation"}
                              </Text>
                              <Text
                                style={styles.rowSubtitle}
                                numberOfLines={1}
                              >
                                {donation.enterpriseId
                                  ? `Enterprise ID: ${donation.enterpriseId}`
                                  : "Enterprise not specified"}
                              </Text>
                            </View>

                            <View
                              style={[
                                styles.status,
                                { backgroundColor: statusStyle.background },
                              ]}
                            >
                              <Text
                                style={[
                                  styles.statusText,
                                  { color: statusStyle.text },
                                ]}
                              >
                                {statusStyle.label}
                              </Text>
                            </View>
                          </Pressable>
                        </View>
                      );
                    })
                  )}
                </View>
              </View>
            </View>

            {/* Provides shortcuts to frequently used admin management pages. */}
            <View style={styles.section}>
              <SectionHeading
                title="Quick actions"
                subtitle="Go directly to a management area"
              />

              <View
                style={[styles.actions, width >= 700 && styles.actionsWide]}
              >
                <Pressable
                  accessibilityRole="button"
                  onPress={() => goTo("/admin/ngos")}
                  style={({ pressed }) => [
                    styles.actionCard,
                    pressed && styles.actionCardPressed,
                  ]}
                >
                  <View
                    style={[
                      styles.actionIcon,
                      { backgroundColor: colors.backgroundElement },
                    ]}
                  >
                    <FontAwesome5
                      name="user-check"
                      size={17}
                      color={colors.primary}
                      iconStyle="solid"
                    />
                  </View>

                  <View style={styles.actionCopy}>
                    <Text style={styles.actionTitle}>Review NGOs</Text>
                    <Text style={styles.actionDescription}>
                      Review applications and approvals
                    </Text>
                  </View>

                  <FontAwesome5
                    name="arrow-right"
                    size={12}
                    color={colors.textSecondary}
                    iconStyle="solid"
                  />
                </Pressable>

                <Pressable
                  accessibilityRole="button"
                  onPress={() => goTo("/admin/users")}
                  style={({ pressed }) => [
                    styles.actionCard,
                    pressed && styles.actionCardPressed,
                  ]}
                >
                  <View
                    style={[
                      styles.actionIcon,
                      { backgroundColor: colors.backgroundElement },
                    ]}
                  >
                    <FontAwesome5
                      name="users-cog"
                      size={17}
                      color={colors.secondary}
                      iconStyle="solid"
                    />
                  </View>

                  <View style={styles.actionCopy}>
                    <Text style={styles.actionTitle}>Manage users</Text>
                    <Text style={styles.actionDescription}>
                      View and manage registered users
                    </Text>
                  </View>

                  <FontAwesome5
                    name="arrow-right"
                    size={12}
                    color={colors.textSecondary}
                    iconStyle="solid"
                  />
                </Pressable>
              </View>
            </View>

            {/* Confirms that the dashboard data has finished loading. */}
            <View style={styles.footer}>
              <View style={styles.footerDot} />
              <Text style={styles.footerText}>
                Dashboard data loaded successfully
              </Text>
            </View>
          </>
        )}
      </View>
    </ScrollView>
  );
}

// Defines the layout, colours, spacing, and responsive styles for dashboard components.
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  content: {
    flexGrow: 1,
    paddingTop: 28,
  },
  workspace: {
    width: "100%",
    maxWidth: MaxContentWidth,
    alignSelf: "center",
    gap: 28,
  },
  pageHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 16,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: BORDER_COLOR,
  },
  pageHeadingGroup: {
    flex: 1,
    gap: 6,
  },
  eyebrow: {
    fontFamily: Fonts.body,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.5,
    color: colors.secondary,
    marginBottom: 2,
  },
  heading: {
    fontFamily: Fonts.heading,
    fontSize: 29,
    lineHeight: 37,
    fontWeight: "700",
    color: "#20242C",
  },
  description: {
    fontFamily: Fonts.body,
    fontSize: 14,
    lineHeight: 21,
    color: SUBTLE_TEXT,
    maxWidth: 580,
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
  metricsHeader: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    marginBottom: -14,
  },
  metricsTitle: {
    fontFamily: Fonts.body,
    fontSize: 14,
    fontWeight: "700",
    color: "#303641",
  },
  metricsCaption: {
    fontFamily: Fonts.body,
    fontSize: 11,
    color: SUBTLE_TEXT,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  statCard: {
    flexGrow: 1,
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    minHeight: 128,
    justifyContent: "space-between",
    gap: 8,
  },
  compactStatCard: {
    padding: 12,
    minHeight: 116,
  },
  statTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  statIcon: {
    width: 34,
    height: 34,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  statIndex: {
    alignSelf: "flex-start",
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: Radius.sm,
    backgroundColor: MUTED_BACKGROUND,
  },
  statIndexText: {
    fontFamily: Fonts.body,
    fontSize: 10,
    fontWeight: "700",
    color: "#98A0AE",
    letterSpacing: 0.5,
  },
  statValue: {
    fontFamily: Fonts.heading,
    fontSize: 30,
    lineHeight: 36,
    fontWeight: "700",
    color: "#20242C",
    fontVariant: ["tabular-nums"],
  },
  statLabel: {
    fontFamily: Fonts.body,
    fontSize: 12,
    lineHeight: 18,
    color: SUBTLE_TEXT,
  },
  mainSections: {
    width: "100%",
    flexDirection: "column",
    gap: 24,
  },
  mainSectionsWide: {
    flexDirection: "row",
    alignItems: "stretch",
    gap: 24,
  },
  mainSectionColumn: {
    flex: 1,
    minWidth: 0,
  },
  section: {
    gap: 13,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  sectionHeadingText: {
    flex: 1,
    gap: 4,
  },
  sectionTitle: {
    fontFamily: Fonts.heading,
    fontSize: 19,
    lineHeight: 26,
    fontWeight: "700",
    color: "#20242C",
  },
  sectionSubtitle: {
    fontFamily: Fonts.body,
    fontSize: 12,
    lineHeight: 18,
    color: SUBTLE_TEXT,
  },
  viewAllButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 8,
    paddingLeft: 8,
  },
  link: {
    fontFamily: Fonts.body,
    fontSize: 12,
    fontWeight: "700",
    color: colors.primary,
  },
  card: {
    minWidth: 0,
    paddingHorizontal: 16,
    paddingVertical: 4,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.backgroundElement,
    borderRadius: Radius.lg,
    overflow: "hidden",
  },
  listRow: {
    minHeight: 70,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
  },
  rowPressed: {
    opacity: 0.65,
  },
  ngoIcon: {
    width: 42,
    height: 42,
    borderRadius: Radius.md,
    backgroundColor: TEAL_LIGHT,
    alignItems: "center",
    justifyContent: "center",
  },
  donationIcon: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    backgroundColor: MUTED_BACKGROUND,
    alignItems: "center",
    justifyContent: "center",
  },
  rowText: {
    flex: 1,
    minWidth: 0,
    gap: 5,
  },
  rowTitle: {
    fontFamily: Fonts.body,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "700",
    color: "#303641",
  },
  rowSubtitle: {
    fontFamily: Fonts.body,
    fontSize: 11,
    lineHeight: 16,
    color: SUBTLE_TEXT,
  },
  reviewAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingLeft: 4,
  },
  reviewActionText: {
    fontFamily: Fonts.body,
    fontSize: 11,
    fontWeight: "700",
    color: colors.primary,
  },
  divider: {
    height: 1,
    backgroundColor: "#ECEEF1",
  },
  status: {
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  statusText: {
    fontFamily: Fonts.body,
    fontSize: 10,
    fontWeight: "700",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
    paddingVertical: 30,
    gap: 8,
  },
  emptyIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: MUTED_BACKGROUND,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
  },
  emptyTitle: {
    fontFamily: Fonts.body,
    fontSize: 13,
    fontWeight: "700",
    color: "#303641",
    textAlign: "center",
  },
  emptyDescription: {
    fontFamily: Fonts.body,
    fontSize: 12,
    lineHeight: 18,
    color: SUBTLE_TEXT,
    textAlign: "center",
    maxWidth: 340,
  },

  actions: {
    width: "100%",
    flexDirection: "column",
    gap: 12,
  },
  actionsWide: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "stretch",
  },
  actionCard: {
    flex: 1,
    minWidth: 0,
    flexBasis: 250,
    minHeight: 76,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.backgroundElement,
    borderRadius: Radius.lg,
  },
  actionCardPressed: {
    opacity: 0.65,
  },
  actionIcon: {
    width: 36,
    height: 36,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  actionCopy: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  actionTitle: {
    fontFamily: Fonts.body,
    fontSize: 13,
    fontWeight: "700",
    color: "#303641",
  },
  actionDescription: {
    fontFamily: Fonts.body,
    fontSize: 11,
    lineHeight: 16,
    color: SUBTLE_TEXT,
  },
  feedbackCard: {
    minHeight: 270,
    alignItems: "center",
    justifyContent: "center",
    padding: 28,
    gap: 12,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    borderRadius: Radius.lg,
  },
  feedbackTitle: {
    fontFamily: Fonts.heading,
    fontSize: 19,
    fontWeight: "700",
    color: "#20242C",
    textAlign: "center",
  },
  feedbackDescription: {
    fontFamily: Fonts.body,
    fontSize: 13,
    lineHeight: 20,
    color: SUBTLE_TEXT,
    textAlign: "center",
    maxWidth: 480,
  },
  errorIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: RED_LIGHT,
  },
  primaryButton: {
    marginTop: 4,
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: Radius.md,
    backgroundColor: colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
  },
  primaryButtonText: {
    fontFamily: Fonts.body,
    fontSize: 12,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  footer: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 8,
    marginTop: 4,
    paddingTop: 18,
    paddingBottom: 8,
    borderTopWidth: 1,
    borderTopColor: colors.backgroundElement,
  },
  footerDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.accent,
  },
  footerText: {
    fontFamily: Fonts.body,
    fontSize: 10,
    color: "#858D9A",
  },
});
