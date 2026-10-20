/**
 * Reservation List Screen
 *
 * Retrieves reservation records through the reservation service
 * and displays them for administrator review.
 *
 * Responsibilities:
 * - Loads reservation records from Firestore.
 * - Displays reservation, donation, NGO, and enterprise identifiers.
 * - Displays the reservation's status and creation date.
 * - Supports searching by reservation ID, donation ID, NGO ID,
 *   and enterprise ID.
 * - Filters reservations by active, collected, or cancelled status.
 * - Supports pull-to-refresh.
 * - Handles loading, error, and empty-list states.
 * - Navigates to the selected reservation's detail screen.
 */

import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import FontAwesome5 from "@react-native-vector-icons/fontawesome5";

import { getReservations } from "@/services/reservationService";
import { Colors, Radius, Spacing } from "@/constants/theme";

type Reservation = {
  id: string;
  reservationId?: string;
  donationId?: string;
  ngoId?: string;
  enterpriseId?: string;
  status?: string;
  createdTimestamp?: { seconds?: number };
};

const normalizeStatus = (status?: string) =>
  (status ?? "unknown").toLowerCase();

const formatDate = (timestamp?: { seconds?: number }) => {
  if (!timestamp?.seconds) return "Date unavailable";

  return new Date(timestamp.seconds * 1000).toLocaleDateString();
};

export default function ReservationsScreen() {
  const router = useRouter();

  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadReservations = useCallback(async () => {
    setError("");

    try {
      const data = await getReservations();
      setReservations(data as Reservation[]);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not load reservations.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadReservations();
  }, [loadReservations]);

  const filteredReservations = reservations.filter((item) => {
    const query = search.trim().toLowerCase();
    const status = normalizeStatus(item.status);

    const matchesSearch =
      !query ||
      [
        item.id,
        item.reservationId,
        item.donationId,
        item.ngoId,
        item.enterpriseId,
      ].some((value) => value?.toLowerCase().includes(query));

    const matchesStatus = statusFilter === "all" || status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const filters = ["all", "active", "collected", "cancelled"];

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
        <Text style={styles.muted}>Loading reservations…</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reservations</Text>
      <Text style={styles.subtitle}>
        View and track food donation reservations.
      </Text>

      <TextInput
        value={search}
        onChangeText={setSearch}
        placeholder="Search reservation, NGO or donation ID"
        placeholderTextColor={Colors.light.textSecondary}
        style={styles.search}
        autoCapitalize="none"
      />

      <View style={styles.filters}>
        {filters.map((filter) => {
          const selected = statusFilter === filter;

          return (
            <Text
              key={filter}
              onPress={() => setStatusFilter(filter)}
              style={[styles.filter, selected && styles.filterSelected]}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </Text>
          );
        })}
      </View>

      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
          <Text onPress={loadReservations} style={styles.retry}>
            Try again
          </Text>
        </View>
      ) : null}

      <FlatList
        data={filteredReservations}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              loadReservations();
            }}
          />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <FontAwesome5
              name="clipboard-list"
              size={28}
              color={Colors.light.textSecondary}
              iconStyle="solid"
            />
            <Text style={styles.emptyTitle}>No reservations found</Text>
            <Text style={styles.muted}>
              Reservations will appear here when available.
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const status = normalizeStatus(item.status);

          return (
            <Text
              onPress={() =>
                router.push(`/admin/reservations/${item.id}` as never)
              }
              style={styles.card}
            >
              <Text style={styles.cardTitle}>
                Reservation {item.reservationId ?? item.id}
              </Text>
              {"\n"}
              <Text style={styles.detail}>
                Donation: {item.donationId ?? "—"}
              </Text>
              {"\n"}
              <Text style={styles.detail}>NGO: {item.ngoId ?? "—"}</Text>
              {"\n"}
              <Text style={styles.detail}>
                Enterprise: {item.enterpriseId ?? "—"}
              </Text>
              {"\n"}
              <Text style={styles.detail}>
                Created: {formatDate(item.createdTimestamp)}
              </Text>
              {"\n"}
              <Text
                style={[
                  styles.status,
                  status === "active" && styles.active,
                  status === "collected" && styles.collected,
                  status === "cancelled" && styles.cancelled,
                ]}
              >
                {status.toUpperCase()}
              </Text>
              {"\n"}
              <Text style={styles.openDetails}>View details →</Text>
            </Text>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
    padding: Spacing.three,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.two,
    backgroundColor: Colors.light.background,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: Colors.light.text,
  },
  subtitle: {
    color: Colors.light.textSecondary,
    marginTop: Spacing.one,
    marginBottom: Spacing.three,
  },
  search: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: Radius.md,
    padding: Spacing.three,
    color: Colors.light.text,
  },
  filters: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.two,
    marginVertical: Spacing.three,
  },
  filter: {
    overflow: "hidden",
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Radius.lg,
    backgroundColor: Colors.light.backgroundElement,
    color: Colors.light.text,
    textTransform: "capitalize",
  },
  filterSelected: {
    backgroundColor: Colors.light.primary,
    color: "#FFFFFF",
  },
  list: {
    paddingBottom: Spacing.six,
    gap: Spacing.three,
  },
  card: {
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E8E8E8",
    borderRadius: Radius.lg,
    padding: Spacing.three,
    color: Colors.light.text,
    lineHeight: 26,
  },
  cardTitle: {
    fontWeight: "700",
    color: Colors.light.text,
  },
  detail: {
    color: Colors.light.textSecondary,
  },
  status: {
    fontWeight: "700",
  },
  active: {
    color: "#B7791F",
  },
  collected: {
    color: "#287D45",
  },
  cancelled: {
    color: Colors.light.error,
  },
  openDetails: {
    color: Colors.light.primary,
    fontWeight: "600",
  },
  empty: {
    alignItems: "center",
    padding: Spacing.five,
    gap: Spacing.two,
  },
  emptyTitle: {
    color: Colors.light.text,
    fontSize: 17,
    fontWeight: "700",
  },
  muted: {
    color: Colors.light.textSecondary,
  },
  errorBox: {
    backgroundColor: "#FDECEC",
    padding: Spacing.three,
    borderRadius: Radius.md,
    marginBottom: Spacing.three,
  },
  errorText: {
    color: Colors.light.error,
  },
  retry: {
    color: Colors.light.primary,
    fontWeight: "700",
    marginTop: Spacing.two,
  },
});
