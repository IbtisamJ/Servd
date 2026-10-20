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
} from "react-native";

import { Colors, Fonts, Radius, Spacing } from "@/constants/theme";
import {
  getPendingNGOs,
  manageDonationRecords,
  manageReservationRecords,
  manageUsers,
} from "@/services/adminService";

const colors = Colors.light;

type DashboardRecord = {
  id: string;
  [key: string]: any;
};

type DashboardStat = {
  label: string;
  value: string;
  icon: string;
  color: string;
};

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

function formatDate(value: any): string {
  const timestamp = getTimestamp(value);

  if (!timestamp) return "Date unavailable";

  return new Date(timestamp).toLocaleDateString();
}

export default function AdminDashboard() {
  const router = useRouter();

  const [pendingNGOs, setPendingNGOs] = useState<DashboardRecord[]>([]);
  const [donations, setDonations] = useState<DashboardRecord[]>([]);
  const [stats, setStats] = useState<DashboardStat[]>([
    { label: "Pending NGOs", value: "—", icon: "users", color: "#C62828" },
    { label: "Active Donations", value: "—", icon: "box", color: "#008080" },
    { label: "Reservations", value: "—", icon: "calendar-alt", color: "#7C9C44" },
    { label: "Total Users", value: "—", icon: "user-friends", color: "#6B63A8" },
  ]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const goTo = (path: string) => router.push(path as never);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [ngoResult, donationResult, reservationResult, userResult] =
        await Promise.all([
          getPendingNGOs(),
          manageDonationRecords(),
          manageReservationRecords(),
          manageUsers(),
        ]);

      if (!ngoResult.success) {
        throw new Error(ngoResult.error || "Could not load pending NGOs.");
      }

      if (!donationResult.success) {
        throw new Error(donationResult.error || "Could not load donations.");
      }

      if (!reservationResult.success) {
        throw new Error(
          reservationResult.error || "Could not load reservations."
        );
      }

      if (!userResult.success) {
        throw new Error(userResult.error || "Could not load users.");
      }

      const ngoRecords = (ngoResult.data || []) as DashboardRecord[];
      const donationRecords = (donationResult.data || []) as DashboardRecord[];
      const reservationRecords = (reservationResult.data ||
        []) as DashboardRecord[];
      const userRecords = (userResult.data || []) as DashboardRecord[];

      const activeDonations = donationRecords.filter((donation) => {
        const status = String(donation.status || "").toLowerCase();
        return status === "available" || status === "reserved";
      });

      const activeReservations = reservationRecords.filter(
        (reservation) =>
          String(reservation.status || "").toLowerCase() === "active"
      );

      const recentDonationRecords = [...donationRecords]
        .sort(
          (a, b) =>
            getTimestamp(b.createdTimestamp || b.createdAt) -
            getTimestamp(a.createdTimestamp || a.createdAt)
        )
        .slice(0, 3);

      setPendingNGOs(ngoRecords.slice(0, 3));
      setDonations(recentDonationRecords);

      setStats([
        {
          label: "Pending NGOs",
          value: String(ngoRecords.length),
          icon: "users",
          color: "#C62828",
        },
        {
          label: "Active Donations",
          value: String(activeDonations.length),
          icon: "box",
          color: "#008080",
        },
        {
          label: "Reservations",
          value: String(activeReservations.length),
          icon: "calendar-alt",
          color: "#7C9C44",
        },
        {
          label: "Total Users",
          value: String(userRecords.length),
          icon: "user-friends",
          color: "#6B63A8",
        },
      ]);
    } catch (err) {
      console.error("Error loading admin dashboard:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while loading the dashboard."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.intro}>
        <Text style={styles.heading}>Dashboard overview</Text>
        <Text style={styles.description}>
          Here’s what’s happening across Servd today.
        </Text>
      </View>

      {loading ? (
        <View style={styles.messageContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.messageText}>Loading dashboard data...</Text>
        </View>
      ) : error ? (
        <View style={styles.messageContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable style={styles.retryButton} onPress={loadDashboard}>
            <Text style={styles.retryText}>Try again</Text>
          </Pressable>
        </View>
      ) : (
        <>
          <View style={styles.statsGrid}>
            {stats.map((stat) => (
              <View key={stat.label} style={styles.statCard}>
                <View
                  style={[
                    styles.statIcon,
                    { backgroundColor: `${stat.color}18` },
                  ]}
                >
                  <FontAwesome5
                    name={stat.icon as any}
                    size={18}
                    color={stat.color}
                    iconStyle="solid"
                  />
                </View>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Pending NGO approvals</Text>
            <Pressable onPress={() => goTo("/admin/ngos")}>
              <Text style={styles.link}>View all</Text>
            </Pressable>
          </View>

          <View style={styles.card}>
            {pendingNGOs.length === 0 ? (
              <Text style={styles.emptyText}>No pending NGO applications.</Text>
            ) : (
              pendingNGOs.map((ngo, index) => (
                <View key={ngo.id}>
                  {index > 0 && <View style={styles.divider} />}
                  <Pressable
                    style={styles.listRow}
                    onPress={() => goTo(`/admin/ngos/${ngo.id}`)}
                  >
                    <View style={styles.listIcon}>
                      <FontAwesome5
                        name="building"
                        size={17}
                        color={colors.secondary}
                      />
                    </View>
                    <View style={styles.rowText}>
                      <Text style={styles.rowTitle}>
                        {ngo.organisationName || "Unnamed NGO"}
                      </Text>
                      <Text style={styles.rowSubtitle}>
                        Submitted: {formatDate(ngo.createdAt)}
                      </Text>
                    </View>
                    <FontAwesome5
                      name="chevron-right"
                      size={13}
                      color={colors.textSecondary}
                      iconStyle="solid"
                    />
                  </Pressable>
                </View>
              ))
            )}
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent donations</Text>
            <Pressable onPress={() => goTo("/admin/donations")}>
              <Text style={styles.link}>View all</Text>
            </Pressable>
          </View>

          <View style={styles.card}>
            {donations.length === 0 ? (
              <Text style={styles.emptyText}>No donations found.</Text>
            ) : (
              donations.map((donation, index) => {
                const status = String(
                  donation.status || "unknown"
                ).toLowerCase();

                const isAvailable = status === "available";

                return (
                  <View key={donation.id}>
                    {index > 0 && <View style={styles.divider} />}
                    <Pressable
                      style={styles.listRow}
                      onPress={() =>
                        goTo(`/admin/donations/${donation.id}`)
                      }
                    >
                      <View style={styles.rowText}>
                        <Text style={styles.rowTitle}>
                          {donation.foodName || "Unnamed donation"}
                        </Text>
                        <Text style={styles.rowSubtitle}>
                          {donation.enterpriseId
                            ? `Enterprise ID: ${donation.enterpriseId}`
                            : "Enterprise not specified"}
                        </Text>
                      </View>
                      <View
                        style={[
                          styles.status,
                          isAvailable ? styles.available : styles.reserved,
                        ]}
                      >
                        <Text
                          style={[
                            styles.statusText,
                            isAvailable
                              ? styles.availableText
                              : styles.reservedText,
                          ]}
                        >
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </Text>
                      </View>
                    </Pressable>
                  </View>
                );
              })
            )}
          </View>

          <Text style={styles.sectionTitle}>Quick actions</Text>
          <View style={styles.actions}>
            <Pressable
              style={styles.actionButton}
              onPress={() => goTo("/admin/ngos")}
            >
              <FontAwesome5
                name="user-check"
                size={17}
                color={colors.primary}
                iconStyle="solid"
              />
              <Text style={styles.actionText}>Review NGOs</Text>
            </Pressable>
            <Pressable
              style={styles.actionButton}
              onPress={() => goTo("/admin/users")}
            >
              <FontAwesome5
                name="users-cog"
                size={17}
                color={colors.primary}
                iconStyle="solid"
              />
              <Text style={styles.actionText}>Manage users</Text>
            </Pressable>
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: {
    padding: Spacing.three,
    paddingBottom: Spacing.six,
    gap: Spacing.three,
  },
  intro: { marginBottom: Spacing.one },
  heading: {
    fontFamily: Fonts.heading,
    fontSize: 26,
    fontWeight: "700",
    color: colors.text,
  },
  description: {
    fontFamily: Fonts.body,
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: Spacing.one,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.two,
  },
  statCard: {
    flexGrow: 1,
    flexBasis: 140,
    minWidth: 135,
    padding: Spacing.three,
    backgroundColor: "#FFFFFF",
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: "#EAE7E1",
  },
  statIcon: {
    width: 38,
    height: 38,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.two,
  },
  statValue: {
    fontFamily: Fonts.heading,
    fontSize: 27,
    fontWeight: "700",
    color: colors.text,
  },
  statLabel: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 3,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: Spacing.two,
  },
  sectionTitle: {
    fontFamily: Fonts.heading,
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
  },
  link: {
    fontFamily: Fonts.body,
    fontSize: 13,
    fontWeight: "700",
    color: colors.primary,
  },
  card: {
    paddingHorizontal: Spacing.three,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#EAE7E1",
    borderRadius: Radius.lg,
  },
  listRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    paddingVertical: Spacing.three,
  },
  listIcon: {
    width: 38,
    height: 38,
    borderRadius: Radius.md,
    backgroundColor: "#E9F4F1",
    alignItems: "center",
    justifyContent: "center",
  },
  rowText: { flex: 1 },
  rowTitle: {
    fontFamily: Fonts.body,
    fontSize: 14,
    fontWeight: "700",
    color: colors.text,
  },
  rowSubtitle: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  divider: { height: 1, backgroundColor: "#F0EDE8" },
  status: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    borderRadius: Radius.sm,
  },
  available: { backgroundColor: "#E9F4F1" },
  reserved: { backgroundColor: "#FFF1DA" },
  statusText: { fontFamily: Fonts.body, fontSize: 11, fontWeight: "700" },
  availableText: { color: "#087F6A" },
  reservedText: { color: "#996000" },
  actions: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.two },
  actionButton: {
    flexGrow: 1,
    flexBasis: 150,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    padding: Spacing.three,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#EAE7E1",
    borderRadius: Radius.md,
  },
  actionText: {
    fontFamily: Fonts.body,
    fontSize: 13,
    fontWeight: "700",
    color: colors.text,
  },
  messageContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.four,
    gap: Spacing.two,
  },
  messageText: {
    fontFamily: Fonts.body,
    fontSize: 14,
    color: colors.textSecondary,
  },
  errorText: {
    fontFamily: Fonts.body,
    fontSize: 14,
    color: "#C62828",
    textAlign: "center",
  },
  retryButton: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Radius.md,
    backgroundColor: colors.primary,
  },
  retryText: {
    fontFamily: Fonts.body,
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  emptyText: {
    paddingVertical: Spacing.three,
    fontFamily: Fonts.body,
    fontSize: 13,
    color: colors.textSecondary,
  },
});