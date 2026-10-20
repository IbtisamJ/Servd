/**
 * User List Screen
 *
 * Retrieves registered user profiles from Firestore and
 * displays them for administrator review.
 *
 * Responsibilities:
 * - Loads user documents from Firestore.
 * - Displays each user's name, email, role, and account status.
 * - Supports searching by name, email, and user document ID.
 * - Filters users by enterprise, NGO, and admin role.
 * - Displays the total number of registered users.
 * - Supports pull-to-refresh.
 * - Handles loading, error, and empty-list states.
 * - Navigates to the selected user's detail screen.
 */

import FontAwesome5 from "@react-native-vector-icons/fontawesome5";
import { useRouter } from "expo-router";
import { collection, getDocs } from "firebase/firestore";
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
import { SafeAreaView } from "react-native-safe-area-context";

import { db } from "@/config/firebase";
import { Colors, Radius, Spacing } from "@/constants/theme";
import { COLLECTIONS, ROLES } from "@/constants/roles";

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
  { label: "All", value: "all" },
  { label: "Enterprises", value: "enterprise" },
  { label: "NGOs", value: "ngo" },
  { label: "Admins", value: "admin" },
];

export default function AdminUsersScreen() {
  const router = useRouter();

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadUsers = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError(null);

    try {
      // Admins can read all documents in the users collection.
      const snapshot = await getDocs(collection(db, COLLECTIONS.USERS));

      const result: AdminUser[] = snapshot.docs.map((item) => ({
        id: item.id,
        ...(item.data() as Omit<AdminUser, "id">),
      }));

      result.sort((a, b) => (a.name ?? "").localeCompare(b.name ?? ""));

      setUsers(result);
    } catch (err) {
      console.error("Failed to load users:", err);

      setError(
        err instanceof Error
          ? `Could not load users: ${err.message}`
          : "Could not load users. An unexpected error occurred.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  // Filter the list by role and search across name, email, and user ID.
  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return users.filter((user) => {
      const matchesRole = roleFilter === "all" || user.role === roleFilter;

      const matchesSearch =
        !query ||
        (user.name ?? "").toLowerCase().includes(query) ||
        (user.email ?? "").toLowerCase().includes(query) ||
        user.id.toLowerCase().includes(query);

      return matchesRole && matchesSearch;
    });
  }, [users, search, roleFilter]);

  const getRoleLabel = (role?: string) => {
    switch (role) {
      case ROLES.ENTERPRISE:
        return "Enterprise";
      case ROLES.NGO:
        return "NGO";
      case ROLES.ADMIN:
        return "Admin";
      default:
        return "Unknown role";
    }
  };

  const getStatusColor = (status?: string) => {
    return status === "active" ? "#2E7D32" : Colors.light.error;
  };

  const renderUser = ({ item }: { item: AdminUser }) => (
    <Pressable
      style={styles.userCard}
      onPress={() => router.push(`/admin/users/${item.id}` as never)}
      accessibilityRole="button"
      accessibilityLabel={`View ${item.name ?? "user"} details`}
    >
      <View style={styles.avatar}>
        <FontAwesome5
          name="user"
          size={19}
          color={Colors.light.primary}
          iconStyle="solid"
        />
      </View>

      <View style={styles.userInfo}>
        <Text style={styles.userName} numberOfLines={1}>
          {item.name?.trim() || "Unnamed user"}
        </Text>

        <Text style={styles.userEmail} numberOfLines={1}>
          {item.email || "No email recorded"}
        </Text>

        <View style={styles.metaRow}>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>{getRoleLabel(item.role)}</Text>
          </View>

          <Text
            style={[
              styles.statusText,
              { color: getStatusColor(item.accountStatus) },
            ]}
          >
            {item.accountStatus === "active"
              ? "Active"
              : item.accountStatus === "suspended"
                ? "Suspended"
                : "Unknown status"}
          </Text>
        </View>
      </View>

      <FontAwesome5
        name="chevron-right"
        size={14}
        color={Colors.light.textSecondary}
        iconStyle="solid"
      />
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
      <View style={styles.container}>
        <Text style={styles.heading}>Users</Text>
        <Text style={styles.subtitle}>
          Manage registered enterprises, NGOs, and administrators.
        </Text>

        <View style={styles.summaryCard}>
          <View style={styles.summaryIcon}>
            <FontAwesome5
              name="users"
              size={22}
              color={Colors.light.primary}
              iconStyle="solid"
            />
          </View>

          <View>
            <Text style={styles.summaryLabel}>Registered users</Text>
            <Text style={styles.summaryCount}>{users.length}</Text>
          </View>
        </View>

        <View style={styles.searchContainer}>
          <FontAwesome5
            name="search"
            size={16}
            color={Colors.light.textSecondary}
            iconStyle="solid"
          />

          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search name, email, or ID..."
            placeholderTextColor={Colors.light.textSecondary}
            style={styles.searchInput}
            autoCapitalize="none"
            autoCorrect={false}
            accessibilityLabel="Search users"
          />

          {search.length > 0 && (
            <Pressable onPress={() => setSearch("")}>
              <FontAwesome5
                name="times-circle"
                size={17}
                color={Colors.light.textSecondary}
                iconStyle="solid"
              />
            </Pressable>
          )}
        </View>

        <View style={styles.filterRow}>
          {FILTERS.map((filter) => {
            const selected = roleFilter === filter.value;

            return (
              <Pressable
                key={filter.value}
                onPress={() => setRoleFilter(filter.value)}
                style={[
                  styles.filterButton,
                  selected && styles.filterButtonSelected,
                ]}
              >
                <Text
                  style={[
                    styles.filterText,
                    selected && styles.filterTextSelected,
                  ]}
                >
                  {filter.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {loading ? (
          <View style={styles.centerState}>
            <ActivityIndicator size="large" color={Colors.light.primary} />
            <Text style={styles.stateText}>Loading users...</Text>
          </View>
        ) : error ? (
          <View style={styles.centerState}>
            <FontAwesome5
              name="exclamation-circle"
              size={30}
              color={Colors.light.error}
              iconStyle="solid"
            />
            <Text style={styles.errorText}>{error}</Text>
            <Pressable
              style={styles.retryButton}
              onPress={() => void loadUsers()}
            >
              <Text style={styles.retryText}>Try again</Text>
            </Pressable>
          </View>
        ) : (
          <FlatList
            data={filteredUsers}
            keyExtractor={(item) => item.id}
            renderItem={renderUser}
            contentContainerStyle={
              filteredUsers.length === 0 ? styles.emptyList : styles.listContent
            }
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => void loadUsers(true)}
                tintColor={Colors.light.primary}
              />
            }
            ListEmptyComponent={
              <View style={styles.centerState}>
                <FontAwesome5
                  name="users"
                  size={30}
                  color={Colors.light.textSecondary}
                  iconStyle="solid"
                />
                <Text style={styles.emptyTitle}>No users found</Text>
                <Text style={styles.stateText}>
                  Try a different search or role filter.
                </Text>
              </View>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  container: {
    flex: 1,
    padding: Spacing.three,
  },
  heading: {
    fontSize: 28,
    fontWeight: "700",
    color: Colors.light.text,
    marginBottom: Spacing.one,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: Colors.light.textSecondary,
    marginBottom: Spacing.three,
  },
  summaryCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
    padding: Spacing.three,
    backgroundColor: Colors.light.backgroundElement,
    borderRadius: Radius.lg,
    marginBottom: Spacing.three,
  },
  summaryIcon: {
    width: 48,
    height: 48,
    borderRadius: Radius.md,
    backgroundColor: Colors.light.background,
    alignItems: "center",
    justifyContent: "center",
  },
  summaryLabel: {
    color: Colors.light.textSecondary,
    fontSize: 13,
  },
  summaryCount: {
    color: Colors.light.text,
    fontSize: 24,
    fontWeight: "700",
    marginTop: 2,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    borderWidth: 1,
    borderColor: Colors.light.backgroundElement,
    backgroundColor: "#FFFFFF",
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.three,
    marginBottom: Spacing.three,
    minHeight: 48,
  },
  searchInput: {
    flex: 1,
    color: Colors.light.text,
    fontSize: 14,
    paddingVertical: Spacing.two,
  },
  filterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.two,
    marginBottom: Spacing.three,
  },
  filterButton: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: Radius.md,
    backgroundColor: Colors.light.backgroundElement,
  },
  filterButtonSelected: {
    backgroundColor: Colors.light.primary,
  },
  filterText: {
    color: Colors.light.textSecondary,
    fontSize: 12,
    fontWeight: "600",
  },
  filterTextSelected: {
    color: "#FFFFFF",
  },
  listContent: {
    paddingBottom: Spacing.five,
    gap: Spacing.two,
  },
  emptyList: {
    flexGrow: 1,
    paddingBottom: Spacing.five,
  },
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
    padding: Spacing.three,
    backgroundColor: "#FFFFFF",
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.light.backgroundElement,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.light.backgroundElement,
  },
  userInfo: {
    flex: 1,
    gap: Spacing.one,
  },
  userName: {
    color: Colors.light.text,
    fontSize: 15,
    fontWeight: "700",
  },
  userEmail: {
    color: Colors.light.textSecondary,
    fontSize: 12,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: Spacing.two,
    marginTop: Spacing.one,
  },
  roleBadge: {
    paddingVertical: 3,
    paddingHorizontal: Spacing.two,
    backgroundColor: Colors.light.backgroundElement,
    borderRadius: Radius.sm,
  },
  roleText: {
    color: Colors.light.text,
    fontSize: 11,
    fontWeight: "600",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  centerState: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.four,
    gap: Spacing.two,
  },
  stateText: {
    color: Colors.light.textSecondary,
    fontSize: 13,
    textAlign: "center",
    lineHeight: 19,
  },
  errorText: {
    color: Colors.light.error,
    fontSize: 13,
    textAlign: "center",
    lineHeight: 20,
  },
  emptyTitle: {
    color: Colors.light.text,
    fontSize: 16,
    fontWeight: "700",
  },
  retryButton: {
    marginTop: Spacing.two,
    backgroundColor: Colors.light.primary,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderRadius: Radius.md,
  },
  retryText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
});
