/**
 * Admin Users List Screen
 *
 * Displays registered users for administrator review.
 * Supports searching, role filtering, pull-to-refresh,
 * and navigation to individual user details.
 */

import FontAwesome5 from "@react-native-vector-icons/fontawesome5";
import { useRouter } from "expo-router";
import { collection, getDocs } from "firebase/firestore";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { db } from "@/config/firebase";
import {
  Colors,
  Fonts,
  MaxContentWidth,
  Radius,
  Spacing,
} from "@/constants/theme";
import { COLLECTIONS, ROLES } from "@/constants/roles";

const colors = Colors.light;

type AdminUser = {
  id: string;
  userId?: string;
  name?: string;
  email?: string;
  role?: string;
  accountStatus?: string;
};

type RoleFilter = "all" | "enterprise" | "ngo" | "admin";

const FILTERS: { label: string; value: RoleFilter }[] = [
  { label: "All users", value: "all" },
  { label: "Enterprises", value: "enterprise" },
  { label: "NGOs", value: "ngo" },
  { label: "Admins", value: "admin" },
];

export default function AdminUsersScreen() {
  const router = useRouter();

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");

  // Fetch users and sort them alphabetically by name.
  const fetchUsers = useCallback(async () => {
    try {
      setError(null);

      const snapshot = await getDocs(collection(db, COLLECTIONS.USERS));

      const fetchedUsers: AdminUser[] = snapshot.docs.map((document) => {
        const data = document.data();

        return {
          id: document.id,
          userId: data.userId,
          name: data.name,
          email: data.email,
          role: data.role,
          accountStatus: data.accountStatus,
        };
      });

      fetchedUsers.sort((a, b) => (a.name || "").localeCompare(b.name || ""));

      setUsers(fetchedUsers);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Unable to load users. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void fetchUsers();
  }, [fetchUsers]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    void fetchUsers();
  }, [fetchUsers]);

  // Calculate totals for the overview cards and role filters.
  const roleCounts = useMemo(
    () => ({
      all: users.length,
      enterprise: users.filter((user) => user.role === ROLES.ENTERPRISE).length,
      ngo: users.filter((user) => user.role === ROLES.NGO).length,
      admin: users.filter((user) => user.role === ROLES.ADMIN).length,
    }),
    [users],
  );

  // Apply the selected role and search query.
  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return users.filter((user) => {
      const matchesRole = roleFilter === "all" || user.role === roleFilter;

      const matchesSearch =
        !query ||
        (user.name || "").toLowerCase().includes(query) ||
        (user.email || "").toLowerCase().includes(query) ||
        user.id.toLowerCase().includes(query) ||
        (user.userId || "").toLowerCase().includes(query);

      return matchesRole && matchesSearch;
    });
  }, [users, roleFilter, search]);

  const getRoleLabel = (role?: string) => {
    switch (role) {
      case ROLES.ENTERPRISE:
        return "Enterprise";
      case ROLES.NGO:
        return "NGO";
      case ROLES.ADMIN:
        return "Admin";
      default:
        return role || "Unknown";
    }
  };

  const getStatusLabel = (status?: string) => {
    if (!status) return "Unknown";

    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const getStatusColor = (status?: string) =>
    status === "active" ? colors.accent : colors.error;

  // Render a user card that opens the corresponding detail screen.
  const renderUser = (item: AdminUser) => (
    <Pressable
      key={item.id}
      style={({ pressed }) => [
        styles.userCard,
        pressed && styles.userCardPressed,
      ]}
      onPress={() => router.push(`/admin/users/${item.id}`)}
      accessibilityRole="button"
      accessibilityLabel={`View ${item.name || "user"} details`}
    >
      <View style={styles.userIconContainer}>
        <FontAwesome5
          name="user"
          size={18}
          color={colors.primary}
          iconStyle="solid"
        />
      </View>

      <View style={styles.userInfo}>
        <Text style={styles.userName} numberOfLines={1}>
          {item.name || "Unnamed user"}
        </Text>

        <Text style={styles.userEmail} numberOfLines={1}>
          {item.email || "No email provided"}
        </Text>

        <View style={styles.userMeta}>
          <View style={styles.roleBadge}>
            <Text style={styles.roleBadgeText}>{getRoleLabel(item.role)}</Text>
          </View>

          <View style={styles.statusContainer}>
            <View
              style={[
                styles.statusDot,
                { backgroundColor: getStatusColor(item.accountStatus) },
              ]}
            />
            <Text style={styles.statusText}>
              {getStatusLabel(item.accountStatus)}
            </Text>
          </View>
        </View>

        <Text style={styles.userId} numberOfLines={1}>
          ID: {item.userId || item.id}
        </Text>
      </View>

      <FontAwesome5
        name="chevron-right"
        size={13}
        color={colors.textSecondary}
        iconStyle="solid"
      />
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={[]}>
      <ScrollView
        style={styles.page}
        contentContainerStyle={styles.pageContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          <View style={styles.pageHeader}>
            <Text style={styles.eyebrow}>SERVD / MANAGEMENT</Text>
            <Text style={styles.heading}>Users</Text>
            <Text style={styles.subtitle}>
              Manage registered enterprises, NGOs, and administrators.
            </Text>
          </View>

          {/* User totals grouped by role */}
          <View style={styles.overviewSection}>
            <View style={styles.sectionHeadingRow}>
              <Text style={styles.sectionTitle}>Overview</Text>
              <Text style={styles.registeredCount}>
                {users.length} registered
              </Text>
            </View>

            <View style={styles.overviewGrid}>
              <View style={styles.overviewCard}>
                <View style={styles.overviewCardTop}>
                  <View
                    style={[
                      styles.overviewIconContainer,
                      styles.totalIconContainer,
                    ]}
                  >
                    <FontAwesome5
                      name="users"
                      size={15}
                      color={colors.primary}
                      iconStyle="solid"
                    />
                  </View>
                  <Text
                    style={[styles.overviewCount, { color: colors.primary }]}
                  >
                    {roleCounts.all}
                  </Text>
                </View>
                <Text style={styles.overviewLabel}>Total users</Text>
              </View>

              <View style={styles.overviewCard}>
                <View style={styles.overviewCardTop}>
                  <View
                    style={[
                      styles.overviewIconContainer,
                      styles.enterpriseIconContainer,
                    ]}
                  >
                    <FontAwesome5
                      name="building"
                      size={15}
                      color={colors.secondary}
                      iconStyle="solid"
                    />
                  </View>
                  <Text
                    style={[styles.overviewCount, { color: colors.secondary }]}
                  >
                    {roleCounts.enterprise}
                  </Text>
                </View>
                <Text style={styles.overviewLabel}>Enterprises</Text>
              </View>

              <View style={styles.overviewCard}>
                <View style={styles.overviewCardTop}>
                  <View
                    style={[
                      styles.overviewIconContainer,
                      styles.ngoIconContainer,
                    ]}
                  >
                    <FontAwesome5
                      name="hand-holding-heart"
                      size={15}
                      color={colors.accent}
                      iconStyle="solid"
                    />
                  </View>
                  <Text
                    style={[styles.overviewCount, { color: colors.accent }]}
                  >
                    {roleCounts.ngo}
                  </Text>
                </View>
                <Text style={styles.overviewLabel}>NGOs</Text>
              </View>

              <View style={styles.overviewCard}>
                <View style={styles.overviewCardTop}>
                  <View
                    style={[
                      styles.overviewIconContainer,
                      styles.adminIconContainer,
                    ]}
                  >
                    <FontAwesome5
                      name="user-shield"
                      size={15}
                      color={colors.textSecondary}
                      iconStyle="solid"
                    />
                  </View>
                  <Text style={[styles.overviewCount, { color: colors.text }]}>
                    {roleCounts.admin}
                  </Text>
                </View>
                <Text style={styles.overviewLabel}>Admins</Text>
              </View>
            </View>
          </View>

          {/* Search users by name, email, or identifier */}
          <View style={styles.searchContainer}>
            <FontAwesome5
              name="search"
              size={15}
              color={colors.textSecondary}
              iconStyle="solid"
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search name, email, or ID..."
              placeholderTextColor={colors.textSecondary}
              value={search}
              onChangeText={setSearch}
              autoCapitalize="none"
              autoCorrect={false}
              accessibilityLabel="Search users"
            />
            {search.length > 0 && (
              <Pressable
                onPress={() => setSearch("")}
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

          {/* Filter the list by account role */}
          <View style={styles.filterHeader}>
            <Text style={styles.filterHeading}>FILTER BY ROLE</Text>
            <Text style={styles.filterCount}>{filteredUsers.length} users</Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterList}
          >
            {FILTERS.map((filter) => {
              const active = roleFilter === filter.value;

              return (
                <Pressable
                  key={filter.value}
                  onPress={() => setRoleFilter(filter.value)}
                  style={({ pressed }) => [
                    styles.filterPill,
                    active && styles.filterPillActive,
                    pressed && styles.filterPillPressed,
                  ]}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                >
                  <Text
                    style={[
                      styles.filterPillText,
                      active && styles.filterPillTextActive,
                    ]}
                  >
                    {filter.label}
                  </Text>
                  <Text
                    style={[
                      styles.filterPillCount,
                      active && styles.filterPillCountActive,
                    ]}
                  >
                    {roleCounts[filter.value]}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {/* Loading, error, empty, and populated list states */}
          <View style={styles.userList}>
            {loading ? (
              <View style={styles.stateContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.stateText}>Loading users...</Text>
              </View>
            ) : error ? (
              <View style={styles.stateContainer}>
                <FontAwesome5
                  name="exclamation-circle"
                  size={25}
                  color={colors.error}
                  iconStyle="solid"
                />
                <Text style={styles.stateText}>{error}</Text>
                <Pressable
                  style={styles.retryButton}
                  onPress={() => {
                    setLoading(true);
                    void fetchUsers();
                  }}
                >
                  <Text style={styles.retryButtonText}>Try again</Text>
                </Pressable>
              </View>
            ) : filteredUsers.length === 0 ? (
              <View style={styles.stateContainer}>
                <FontAwesome5
                  name="users"
                  size={25}
                  color={colors.textSecondary}
                  iconStyle="solid"
                />
                <Text style={styles.stateTitle}>No users found</Text>
                <Text style={styles.stateText}>
                  {search
                    ? "Try adjusting your search."
                    : "There are no users in this category yet."}
                </Text>
              </View>
            ) : (
              filteredUsers.map(renderUser)
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Shared layout, typography, filter, and user-card styles.
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  page: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  pageContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.six,
  },
  content: {
    width: "100%",
    maxWidth: MaxContentWidth,
    alignSelf: "center",
  },
  pageHeader: {
    marginBottom: Spacing.four,
  },
  eyebrow: {
    fontFamily: Fonts.body,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.4,
    color: colors.secondary,
    marginBottom: Spacing.one,
  },
  heading: {
    fontFamily: Fonts.heading,
    fontSize: 30,
    fontWeight: "700",
    color: colors.text,
    marginBottom: Spacing.one,
  },
  subtitle: {
    fontFamily: Fonts.body,
    fontSize: 14,
    lineHeight: 21,
    color: colors.textSecondary,
  },

  /* Overview cards */
  overviewSection: {
    backgroundColor: colors.background,
    padding: Spacing.three,
    borderRadius: Radius.lg,
    marginBottom: Spacing.three,
    gap: Spacing.two,
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
  registeredCount: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: colors.textSecondary,
  },
  overviewGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.two,
  },
  overviewCard: {
    flexBasis: "47%",
    flexGrow: 1,
    minWidth: 0,
    padding: Spacing.two,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: colors.backgroundElement,
    borderRadius: Radius.md,
    gap: Spacing.two,
  },
  overviewCardTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.two,
  },
  overviewIconContainer: {
    width: 34,
    height: 34,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  totalIconContainer: {
    backgroundColor: "#FBE9E7",
  },
  enterpriseIconContainer: {
    backgroundColor: "#E0F2F1",
  },
  ngoIconContainer: {
    backgroundColor: "#EDF3E5",
  },
  adminIconContainer: {
    backgroundColor: colors.backgroundSelected,
  },
  overviewCount: {
    fontFamily: Fonts.heading,
    fontSize: 24,
    fontWeight: "700",
  },
  overviewLabel: {
    fontFamily: Fonts.body,
    fontSize: 12,
    fontWeight: "600",
    color: colors.textSecondary,
  },

  /* Search input */
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: colors.backgroundElement,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.three,
    minHeight: 48,
    marginBottom: Spacing.three,
  },
  searchInput: {
    flex: 1,
    fontFamily: Fonts.body,
    fontSize: 14,
    color: colors.text,
    paddingVertical: Spacing.two,
    outlineStyle: "none",
  } as any,

  /* Role filters */
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
  filterCount: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: colors.textSecondary,
  },
  filterList: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    paddingBottom: Spacing.three,
  },
  filterPill: {
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
  filterPillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterPillPressed: {
    opacity: 0.78,
  },
  filterPillText: {
    fontFamily: Fonts.body,
    fontSize: 12,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  filterPillTextActive: {
    color: "#FFFFFF",
  },
  filterPillCount: {
    fontFamily: Fonts.body,
    fontSize: 11,
    fontWeight: "700",
    color: colors.textSecondary,
  },
  filterPillCountActive: {
    color: "#FFFFFF",
  },

  /* User cards */
  userList: {
    gap: Spacing.two,
  },
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
    padding: Spacing.three,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.backgroundElement,
    borderRadius: Radius.lg,
  },
  userCardPressed: {
    opacity: 0.75,
  },
  userIconContainer: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    backgroundColor: "#FBE9E7",
    alignItems: "center",
    justifyContent: "center",
  },
  userInfo: {
    flex: 1,
    gap: Spacing.one,
  },
  userName: {
    fontFamily: Fonts.body,
    fontSize: 14,
    fontWeight: "700",
    color: colors.text,
  },
  userEmail: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: colors.textSecondary,
  },
  userMeta: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: Spacing.two,
    marginTop: Spacing.one,
  },
  roleBadge: {
    backgroundColor: "#E0F2F1",
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
  },
  roleBadgeText: {
    fontFamily: Fonts.body,
    fontSize: 10,
    fontWeight: "700",
    color: colors.secondary,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.one,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 999,
  },
  statusText: {
    fontFamily: Fonts.body,
    fontSize: 11,
    color: colors.textSecondary,
  },
  userId: {
    fontFamily: Fonts.body,
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: Spacing.one,
  },

  /* Loading, error, and empty states */
  stateContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.six,
    paddingHorizontal: Spacing.four,
    gap: Spacing.two,
  },
  stateTitle: {
    fontFamily: Fonts.heading,
    fontSize: 17,
    fontWeight: "700",
    color: colors.text,
  },
  stateText: {
    fontFamily: Fonts.body,
    fontSize: 13,
    lineHeight: 19,
    color: colors.textSecondary,
    textAlign: "center",
  },
  retryButton: {
    marginTop: Spacing.two,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    backgroundColor: colors.primary,
    borderRadius: 999,
  },
  retryButtonText: {
    fontFamily: Fonts.body,
    fontSize: 13,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
