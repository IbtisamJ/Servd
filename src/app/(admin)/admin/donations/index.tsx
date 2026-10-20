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
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { getDonations } from "@/services/donationService";
import { Colors, Fonts, Spacing } from "@/constants/theme";

const colors = Colors.light;

type Donation = {
  id?: string;
  donationId?: string;
  foodName?: string;
  enterpriseName?: string;
  quantity?: number | string;
  status?: string;
  collectionLocation?: string;
};

const normalizeStatus = (status?: string) =>
  (status ?? "unknown").toLowerCase();

export default function DonationsScreen() {
  const router = useRouter();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
    loadDonations();
  }, [loadDonations]);

  const statuses = [
    "all",
    "available",
    "reserved",
    "collected",
    "cancelled",
    "expired",
  ];

  const filtered = donations.filter((item) => {
    const query = search.trim().toLowerCase();
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
      searchableText.includes(query) && (filter === "all" || status === filter)
    );
  });

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <View style={styles.heading}>
        <View style={styles.headingText}>
          <Text style={styles.title}>Donations</Text>
          <Text style={styles.subtitle}>
            {donations.length} total donations
          </Text>
        </View>

        <Pressable
          onPress={loadDonations}
          style={styles.refresh}
          accessibilityLabel="Refresh donations"
        >
          <FontAwesome5
            name="sync-alt"
            size={15}
            color={colors.primary}
            iconStyle="solid"
          />
        </Pressable>
      </View>

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
          placeholder="Search food or enterprise..."
          placeholderTextColor={colors.textSecondary}
          style={styles.searchInput}
          autoCapitalize="none"
        />
      </View>

      <View style={styles.filters}>
        {statuses.map((status) => (
          <Pressable
            key={status}
            onPress={() => setFilter(status)}
            style={[styles.filter, filter === status && styles.filterActive]}
          >
            <Text
              style={[
                styles.filterText,
                filter === status && styles.filterTextActive,
              ]}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Text>
          </Pressable>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator color={colors.primary} style={styles.loader} />
      ) : error ? (
        <Pressable onPress={loadDonations} style={styles.message}>
          <Text style={styles.error}>{error}</Text>
          <Text style={styles.retry}>Tap to retry</Text>
        </Pressable>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item, index) => item.id ?? String(index)}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text style={styles.empty}>No donations found.</Text>
          }
          renderItem={({ item }) => {
            const status = normalizeStatus(item.status);

            return (
              <Pressable
                style={styles.card}
                onPress={() => {
                  if (item.id) {
                    router.push(`/admin/donations/${item.id}` as Href);
                  }
                }}
              >
                <View style={styles.foodIcon}>
                  <FontAwesome5
                    name="box"
                    size={19}
                    color={colors.secondary}
                    iconStyle="solid"
                  />
                </View>

                <View style={styles.details}>
                  <Text style={styles.foodName}>
                    {item.foodName || "Unnamed donation"}
                  </Text>
                  <Text style={styles.meta}>
                    {item.enterpriseName || "Food enterprise"}
                  </Text>
                  {item.quantity != null && (
                    <Text style={styles.meta}>Quantity: {item.quantity}</Text>
                  )}
                  <Text style={styles.meta}>
                    {item.collectionLocation || "No collection location"}
                  </Text>
                </View>

                <View style={styles.right}>
                  <View
                    style={[
                      styles.status,
                      status === "available" && styles.available,
                      status === "reserved" && styles.reserved,
                      status === "collected" && styles.collected,
                      status === "cancelled" && styles.cancelled,
                      status === "expired" && styles.cancelled,
                    ]}
                  >
                    <Text style={styles.statusText}>
                      {status.toUpperCase()}
                    </Text>
                  </View>

                  <FontAwesome5
                    name="chevron-right"
                    size={12}
                    color={colors.textSecondary}
                    iconStyle="solid"
                  />
                </View>
              </Pressable>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: Spacing.three,
  },
  heading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.three,
  },
  headingText: { flex: 1 },
  title: {
    fontFamily: Fonts.heading,
    fontSize: 22,
    fontWeight: "700",
    color: colors.text,
  },
  subtitle: {
    fontFamily: Fonts.body,
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
  },
  refresh: {
    padding: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#EAE7E1",
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: Spacing.two,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 11,
    color: colors.text,
    fontFamily: Fonts.body,
  },
  filters: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: Spacing.three,
  },
  filter: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#EAE7E1",
  },
  filterActive: {
    backgroundColor: "#FCEDEA",
    borderColor: colors.primary,
  },
  filterText: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: colors.textSecondary,
  },
  filterTextActive: {
    color: colors.primary,
    fontWeight: "700",
  },
  list: {
    gap: Spacing.two,
    paddingBottom: Spacing.four,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: Spacing.three,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#EAE7E1",
    borderRadius: 10,
  },
  foodIcon: {
    width: 42,
    height: 42,
    borderRadius: 9,
    backgroundColor: "#E8F3F1",
    alignItems: "center",
    justifyContent: "center",
  },
  details: {
    flex: 1,
    gap: 4,
  },
  foodName: {
    fontFamily: Fonts.body,
    fontSize: 15,
    fontWeight: "700",
    color: colors.text,
  },
  meta: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: colors.textSecondary,
  },
  right: {
    alignItems: "flex-end",
    gap: 10,
  },
  status: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: "#F0E6D2",
  },
  available: { backgroundColor: "#E8F3F1" },
  reserved: { backgroundColor: "#FFF0D8" },
  collected: { backgroundColor: "#E7F2DE" },
  cancelled: { backgroundColor: "#FDECEC" },
  statusText: {
    fontFamily: Fonts.body,
    fontSize: 10,
    fontWeight: "700",
    color: colors.text,
  },
  loader: { marginTop: 40 },
  message: {
    padding: Spacing.three,
    alignItems: "center",
  },
  error: {
    color: colors.error,
    textAlign: "center",
  },
  retry: {
    color: colors.primary,
    marginTop: 8,
  },
  empty: {
    textAlign: "center",
    color: colors.textSecondary,
    padding: Spacing.four,
  },
});