/**
 * Admin Dashboard Screen
 *
 * Provides the main overview of the administrator section.
 * Acts as the starting point for managing registered users,
 * NGOs, food donations, enterprises, and reservations.
 *
 * Responsibilities:
 * - Displays the admin dashboard overview.
 * - Provides navigation to management sections.
 * - Gives administrators access to the main application workflows.
 *
 */

import FontAwesome5 from "@react-native-vector-icons/fontawesome5";
import { useRouter } from "expo-router";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
} from "react-native";

import { Colors, Fonts, Radius, Spacing } from "@/constants/theme";

const colors = Colors.light;

const stats = [
  { label: "Pending NGOs", value: "12", icon: "users", color: "#C62828" },
  { label: "Active Donations", value: "28", icon: "box", color: "#008080" },
  { label: "Reservations", value: "16", icon: "calendar-alt", color: "#7C9C44" },
  { label: "Total Users", value: "143", icon: "user-friends", color: "#6B63A8" },
] as const;

const pendingNGOs = [
  { name: "Hope Community Kitchen", date: "Submitted today" },
  { name: "Green Plate Foundation", date: "Submitted yesterday" },
  { name: "Community Care Network", date: "Submitted 2 days ago" },
];

const recentDonations = [
  { name: "Fresh vegetables", enterprise: "City Market", status: "Available" },
  { name: "Bakery surplus", enterprise: "Daily Bread Bakery", status: "Reserved" },
  { name: "Packaged meals", enterprise: "Good Foods Co.", status: "Available" },
];

export default function AdminDashboard() {
  const router = useRouter();

  const goTo = (path: string) => router.push(path as never);

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

      <View style={styles.statsGrid}>
        {stats.map((stat) => (
          <View key={stat.label} style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: `${stat.color}18` }]}>
              <FontAwesome5 name={stat.icon} size={18} color={stat.color} iconStyle="solid"/>
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
        {pendingNGOs.map((ngo, index) => (
          <View key={ngo.name}>
            {index > 0 && <View style={styles.divider} />}
            <View style={styles.listRow}>
              <View style={styles.listIcon}>
                <FontAwesome5 name="building" size={17} color={colors.secondary} />
              </View>
              <View style={styles.rowText}>
                <Text style={styles.rowTitle}>{ngo.name}</Text>
                <Text style={styles.rowSubtitle}>{ngo.date}</Text>
              </View>
              <FontAwesome5 name="chevron-right" size={13} color={colors.textSecondary} iconStyle="solid" />
            </View>
          </View>
        ))}
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent donations</Text>
        <Pressable onPress={() => goTo("/admin/donations")}>
          <Text style={styles.link}>View all</Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        {recentDonations.map((donation, index) => (
          <View key={donation.name}>
            {index > 0 && <View style={styles.divider} />}
            <View style={styles.listRow}>
              <View style={styles.rowText}>
                <Text style={styles.rowTitle}>{donation.name}</Text>
                <Text style={styles.rowSubtitle}>{donation.enterprise}</Text>
              </View>
              <View
                style={[
                  styles.status,
                  donation.status === "Available"
                    ? styles.available
                    : styles.reserved,
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    donation.status === "Available"
                      ? styles.availableText
                      : styles.reservedText,
                  ]}
                >
                  {donation.status}
                </Text>
              </View>
            </View>
          </View>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Quick actions</Text>
      <View style={styles.actions}>
        <Pressable
          style={styles.actionButton}
          onPress={() => goTo("/admin/ngos")}
        >
          <FontAwesome5 name="user-check" size={17} color={colors.primary} iconStyle="solid"/>
          <Text style={styles.actionText}>Review NGOs</Text>
        </Pressable>
        <Pressable
          style={styles.actionButton}
          onPress={() => goTo("/admin/users")}
        >
          <FontAwesome5 name="users-cog" size={17} color={colors.primary} iconStyle="solid"/>
          <Text style={styles.actionText}>Manage users</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: Spacing.three, paddingBottom: Spacing.six, gap: Spacing.three },
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
});