/**
 * NGO List Screen
 *
 * Retrieves registered NGO records from Cloud Firestore and displays
 * them in the administrator interface. Allows administrators to search
 * for NGOs and filter the list according to verification status.
 *
 * Responsibilities:
 * - Retrieves NGO documents from Firestore.
 * - Displays NGO names, contact information, registration numbers,
 *   and verification statuses where available.
 * - Supports searching by NGO name, registration number,
 *   and contact information.
 * - Filters NGOs by pending, approved, or rejected status.
 * - Displays loading, error, and empty-list states.
 * - Supports refreshing the NGO list.
 * - Navigates to the selected NGO's detail screen.
 */

import FontAwesome5 from "@react-native-vector-icons/fontawesome5";
import { useRouter } from "expo-router";
import { collection, getDocs } from "firebase/firestore";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { db } from "@/config/firebase";
import { COLLECTIONS, NGO_STATUS } from "@/constants/roles";
import { Colors, Fonts, Radius, Spacing } from "@/constants/theme";

const colors = Colors.light;

type NGO = {
  id: string;
  contactInfo?: string;
  createdAt?: { toDate?: () => Date } | string;
  npoNumber?: string;
  organisationName?: string;
  userId?: string;
  verificationStatus?: string;
};

const filters = ["All", "Pending", "Approved", "Rejected"] as const;

export default function NGOsPage() {
  const router = useRouter();

  const [ngos, setNgos] = useState<NGO[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] =
    useState<(typeof filters)[number]>("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadNGOs = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const snapshot = await getDocs(
        collection(db, COLLECTIONS.NGOS),
      );

      setNgos(
        snapshot.docs.map((document) => ({
          id: document.id,
          ...document.data(),
        })) as NGO[],
      );
    } catch (err) {
      console.error("Failed to load NGOs:", err);
      setError(
        "Unable to load NGOs. Check your connection and permissions.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNGOs();
  }, [loadNGOs]);

  const getName = (ngo: NGO) =>
    ngo.organisationName || "Unnamed NGO";

  const getNumber = (ngo: NGO) => ngo.npoNumber || "";

  const getStatus = (ngo: NGO) =>
    (ngo.verificationStatus || NGO_STATUS.PENDING).toLowerCase();

  const filteredNGOs = useMemo(
    () =>
      ngos.filter((ngo) => {
        const searchText = [
          getName(ngo),
          getNumber(ngo),
          ngo.contactInfo ?? "",
        ]
          .join(" ")
          .toLowerCase();

        const matchesSearch = searchText.includes(
          search.trim().toLowerCase(),
        );

        const matchesFilter =
          filter === "All" ||
          getStatus(ngo) === filter.toLowerCase();

        return matchesSearch && matchesFilter;
      }),
    [ngos, search, filter],
  );

  const statusStyle = (status: string) => {
    if (status === NGO_STATUS.APPROVED) return styles.approved;
    if (status === NGO_STATUS.REJECTED) return styles.rejected;
    return styles.pending;
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
    >
      <View style={styles.headingRow}>
        <View style={styles.headingText}>
          <Text style={styles.title}>NGO management</Text>
          <Text style={styles.subtitle}>
            Review organisations and manage their verification status.
          </Text>
        </View>

        <Pressable
          onPress={loadNGOs}
          style={styles.countBadge}
          accessibilityRole="button"
          accessibilityLabel="Refresh NGO list"
        >
          <FontAwesome5
            name="sync-alt"
            size={14}
            color={colors.primary}
            iconStyle="solid"
          />
        </Pressable>
      </View>

      <View style={styles.summaryRow}>
        <Summary
          label="Pending"
          value={
            ngos.filter(
              (ngo) => getStatus(ngo) === NGO_STATUS.PENDING,
            ).length
          }
          color={colors.primary}
        />
        <Summary
          label="Approved"
          value={
            ngos.filter(
              (ngo) => getStatus(ngo) === NGO_STATUS.APPROVED,
            ).length
          }
          color={colors.secondary}
        />
        <Summary
          label="Rejected"
          value={
            ngos.filter(
              (ngo) => getStatus(ngo) === NGO_STATUS.REJECTED,
            ).length
          }
          color="#996000"
        />
      </View>

      <View style={styles.searchBox}>
        <FontAwesome5
          name="search"
          size={15}
          color={colors.textSecondary}
          iconStyle="solid"
        />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search NGOs..."
          placeholderTextColor={colors.textSecondary}
          style={styles.searchInput}
          autoCapitalize="none"
        />
        {search.length > 0 && (
          <Pressable onPress={() => setSearch("")}>
            <FontAwesome5
              name="times-circle"
              size={16}
              color={colors.textSecondary}
              iconStyle="solid"
            />
          </Pressable>
        )}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filters}
      >
        {filters.map((item) => (
          <Pressable
            key={item}
            onPress={() => setFilter(item)}
            style={[
              styles.filterButton,
              filter === item && styles.filterActive,
            ]}
          >
            <Text
              style={[
                styles.filterText,
                filter === item && styles.filterTextActive,
              ]}
            >
              {item}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <View style={styles.resultsHeader}>
        <Text style={styles.sectionTitle}>Organisations</Text>
        <Text style={styles.resultCount}>
          {filteredNGOs.length} results
        </Text>
      </View>

      {loading ? (
        <ActivityIndicator
          color={colors.primary}
          style={styles.loader}
        />
      ) : error ? (
        <Pressable onPress={loadNGOs} style={styles.emptyState}>
          <Text style={styles.error}>{error}</Text>
          <Text style={styles.subtitle}>Tap to retry</Text>
        </Pressable>
      ) : filteredNGOs.length === 0 ? (
        <View style={styles.emptyState}>
          <FontAwesome5
            name="search"
            size={24}
            color={colors.textSecondary}
            iconStyle="solid"
          />
          <Text style={styles.emptyTitle}>No NGOs found</Text>
          <Text style={styles.subtitle}>
            Try another search or filter.
          </Text>
        </View>
      ) : (
        filteredNGOs.map((ngo) => {
          const status = getStatus(ngo);

          return (
            <Pressable
              key={ngo.id}
              onPress={() =>
                router.push(`/admin/ngos/${ngo.id}` as never)
              }
              style={styles.ngoCard}
            >
              <View style={styles.ngoIcon}>
                <FontAwesome5
                  name="building"
                  size={18}
                  color={colors.secondary}
                  iconStyle="solid"
                />
              </View>

              <View style={styles.ngoInfo}>
                <Text style={styles.ngoName}>
                  {getName(ngo)}
                </Text>
                <Text style={styles.ngoEmail}>
                  {ngo.contactInfo || "No contact information provided"}
                </Text>
                <Text style={styles.ngoNumber}>
                  {getNumber(ngo) || "No registration number"}
                </Text>

                <View
                  style={[styles.statusBadge, statusStyle(status)]}
                >
                  <Text style={styles.statusText}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </Text>
                </View>
              </View>

              <FontAwesome5
                name="chevron-right"
                size={13}
                color={colors.textSecondary}
                iconStyle="solid"
              />
            </Pressable>
          );
        })
      )}
    </ScrollView>
  );
}

function Summary({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <View style={styles.summaryCard}>
      <Text style={[styles.summaryValue, { color }]}>{value}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: {
    padding: Spacing.three,
    paddingBottom: Spacing.six,
    gap: Spacing.three,
  },
  headingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
  headingText: { flex: 1 },
  title: {
    fontFamily: Fonts.heading,
    fontSize: 25,
    fontWeight: "700",
    color: colors.text,
  },
  subtitle: {
    fontFamily: Fonts.body,
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
  },
  countBadge: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#EAE7E1",
    padding: Spacing.three,
    borderRadius: Radius.md,
  },
  summaryRow: { flexDirection: "row", gap: Spacing.two },
  summaryCard: {
    flex: 1,
    padding: Spacing.three,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#EAE7E1",
    borderRadius: Radius.md,
  },
  summaryValue: {
    fontFamily: Fonts.heading,
    fontSize: 23,
    fontWeight: "700",
  },
  summaryLabel: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#EAE7E1",
    borderRadius: Radius.md,
  },
  searchInput: {
    flex: 1,
    minHeight: 46,
    fontFamily: Fonts.body,
    fontSize: 14,
    color: colors.text,
  },
  filters: { gap: Spacing.two },
  filterButton: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: "#EAE7E1",
    backgroundColor: "#FFFFFF",
  },
  filterActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterText: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: colors.textSecondary,
  },
  filterTextActive: { color: "#FFFFFF", fontWeight: "700" },
  resultsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: {
    fontFamily: Fonts.heading,
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
  },
  resultCount: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: colors.textSecondary,
  },
  ngoCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
    padding: Spacing.three,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#EAE7E1",
    borderRadius: Radius.lg,
  },
  ngoIcon: {
    width: 42,
    height: 42,
    borderRadius: Radius.md,
    backgroundColor: "#E9F4F1",
    alignItems: "center",
    justifyContent: "center",
  },
  ngoInfo: { flex: 1 },
  ngoName: {
    fontFamily: Fonts.body,
    fontSize: 14,
    fontWeight: "700",
    color: colors.text,
  },
  ngoEmail: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 3,
  },
  ngoNumber: {
    fontFamily: Fonts.body,
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  statusBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: Spacing.two,
    paddingVertical: 3,
    borderRadius: Radius.sm,
    marginTop: Spacing.two,
  },
  pending: { backgroundColor: "#FCEDEA" },
  approved: { backgroundColor: "#E9F4F1" },
  rejected: { backgroundColor: "#FFF1DA" },
  statusText: {
    fontFamily: Fonts.body,
    fontSize: 11,
    fontWeight: "700",
    color: colors.text,
  },
  emptyState: {
    alignItems: "center",
    padding: Spacing.five,
    backgroundColor: "#FFFFFF",
    borderRadius: Radius.lg,
    gap: Spacing.two,
  },
  emptyTitle: {
    fontFamily: Fonts.heading,
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
  },
  error: {
    color: colors.error,
    textAlign: "center",
  },
  loader: { marginTop: 40 },
});