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
import { Colors, Fonts, Radius, Spacing, MaxContentWidth } from "@/constants/theme";

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
type NGOFilter = (typeof filters)[number];

export default function NGOsPage() {
  const router = useRouter();

  const [ngos, setNgos] = useState<NGO[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<NGOFilter>("All");
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

  const pendingCount = ngos.filter(
    (ngo) => getStatus(ngo) === NGO_STATUS.PENDING,
  ).length;

  const approvedCount = ngos.filter(
    (ngo) => getStatus(ngo) === NGO_STATUS.APPROVED,
  ).length;

  const rejectedCount = ngos.filter(
    (ngo) => getStatus(ngo) === NGO_STATUS.REJECTED,
  ).length;

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
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* Page heading */}
      <View style={styles.pageHeader}>
        <View style={styles.pageHeadingGroup}>
          <Text style={styles.eyebrow}>SERVD / ADMINISTRATION</Text>
          <Text style={styles.heading}>NGO management</Text>
          <Text style={styles.description}>
            Review organisations, track verification status, and manage
            NGO registrations.
          </Text>
        </View>

        <Pressable
          onPress={loadNGOs}
          style={styles.refreshButton}
          accessibilityRole="button"
          accessibilityLabel="Refresh NGO list"
          disabled={loading}
        >
          <FontAwesome5
            name="sync-alt"
            size={15}
            color={colors.primary}
            iconStyle="solid"
          />
        </Pressable>
      </View>

      {/* Overview statistics */}
      <View style={styles.summarySection}>
        <View style={styles.sectionHeadingRow}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <Text style={styles.mutedText}>
            {ngos.length} registered
          </Text>
        </View>

        <View style={styles.summaryRow}>
          <Summary
            label="Pending"
            value={pendingCount}
            color={colors.primary}
            icon="clock"
            onPress={() => setFilter("Pending")}
            active={filter === "Pending"}
          />
          <Summary
            label="Approved"
            value={approvedCount}
            color={colors.secondary}
            icon="check-circle"
            onPress={() => setFilter("Approved")}
            active={filter === "Approved"}
          />
          <Summary
            label="Rejected"
            value={rejectedCount}
            color="#996000"
            icon="times-circle"
            onPress={() => setFilter("Rejected")}
            active={filter === "Rejected"}
          />
        </View>
      </View>

      {/* Search */}
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
          placeholder="Search NGOs, registration numbers..."
          placeholderTextColor={colors.textSecondary}
          style={styles.searchInput}
          autoCapitalize="none"
          returnKeyType="search"
        />

        {search.length > 0 && (
          <Pressable
            onPress={() => setSearch("")}
            accessibilityRole="button"
            accessibilityLabel="Clear search"
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

      {/* Status filters */}
      <View style={styles.filterSection}>
        <Text style={styles.filterHeading}>Filter by status</Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filters}
        >
          {filters.map((item) => {
            const selected = filter === item;

            const count =
              item === "All"
                ? ngos.length
                : item === "Pending"
                  ? pendingCount
                  : item === "Approved"
                    ? approvedCount
                    : rejectedCount;

            return (
              <Pressable
                key={item}
                onPress={() => setFilter(item)}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                style={({ pressed }) => [
                  styles.filter,
                  selected && styles.filterActive,
                  pressed && styles.filterPressed,
                ]}
              >
                <Text
                  style={[
                    styles.filterText,
                    selected && styles.filterTextActive,
                  ]}
                >
                  {item}
                </Text>

                <View
                  style={[
                    styles.filterCount,
                    selected && styles.filterCountActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.filterCountText,
                      selected && styles.filterCountTextActive,
                    ]}
                  >
                    {count}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Organisation list */}
      <View style={styles.resultsHeader}>
        <View style={styles.resultsHeading}>
          <Text style={styles.sectionTitle}>Organisations</Text>
          <Text style={styles.resultsDescription}>
            NGO registrations and verification details
          </Text>
        </View>

        {!loading && !error && (
          <Text style={styles.resultCount}>
            {filteredNGOs.length}{" "}
            {filteredNGOs.length === 1 ? "result" : "results"}
          </Text>
        )}
      </View>

      {loading ? (
        <View style={styles.stateContainer}>
          <ActivityIndicator color={colors.primary} size="large" />
          <Text style={styles.stateText}>Loading organisations...</Text>
        </View>
      ) : error ? (
        <Pressable
          onPress={loadNGOs}
          style={styles.stateContainer}
          accessibilityRole="button"
        >
          <FontAwesome5
            name="exclamation-circle"
            size={26}
            color={colors.error}
            iconStyle="solid"
          />
          <Text style={styles.error}>{error}</Text>
          <Text style={styles.retry}>Tap to retry</Text>
        </Pressable>
      ) : filteredNGOs.length === 0 ? (
        <View style={styles.stateContainer}>
          <FontAwesome5
            name="search"
            size={25}
            color={colors.textSecondary}
            iconStyle="solid"
          />
          <Text style={styles.emptyTitle}>No NGOs found</Text>
          <Text style={styles.stateText}>
            {search.trim() || filter !== "All"
              ? "Try another search or change the status filter."
              : "Registered organisations will appear here."}
          </Text>

          {(search.trim() !== "" || filter !== "All") && (
            <Pressable
              onPress={() => {
                setSearch("");
                setFilter("All");
              }}
              style={styles.clearFiltersButton}
            >
              <Text style={styles.clearFiltersText}>
                Clear filters
              </Text>
            </Pressable>
          )}
        </View>
      ) : (
        <View style={styles.ngoList}>
          {filteredNGOs.map((ngo) => {
            const status = getStatus(ngo);
            const formattedStatus =
              status.charAt(0).toUpperCase() + status.slice(1);

            return (
              <Pressable
                key={ngo.id}
                onPress={() =>
                  router.push(`/admin/ngos/${ngo.id}` as never)
                }
                style={styles.ngoCard}
                accessibilityRole="button"
                accessibilityLabel={`View ${getName(ngo)}`}
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
                    {ngo.contactInfo ||
                      "No contact information provided"}
                  </Text>

                  <Text style={styles.ngoNumber}>
                    {getNumber(ngo) || "No registration number"}
                  </Text>

                  <View
                    style={[styles.statusBadge, statusStyle(status)]}
                  >
                    <View
                      style={[
                        styles.statusDot,
                        status === NGO_STATUS.APPROVED
                          ? styles.approvedDot
                          : status === NGO_STATUS.REJECTED
                            ? styles.rejectedDot
                            : styles.pendingDot,
                      ]}
                    />
                    <Text style={styles.statusText}>
                      {formattedStatus}
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
          })}
        </View>
      )}
    </ScrollView>
  );
}

type SummaryIcon = "clock" | "check-circle" | "times-circle";

function Summary({
  label,
  value,
  color,
  icon,
  onPress,
  active,
}: {
  label: string;
  value: number;
  color: string;
  icon: SummaryIcon;
  onPress: () => void;
  active: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.summaryCard,
        active && styles.summaryCardActive,
      ]}
      accessibilityRole="button"
      accessibilityLabel={`${label}: ${value}. Filter NGOs by ${label.toLowerCase()}`}
    >
      <View style={styles.summaryTopRow}>
        <View
          style={[
            styles.summaryIcon,
            { backgroundColor: `${color}15` },
          ]}
        >
          <FontAwesome5
            name={icon}
            size={14}
            color={color}
            iconStyle="solid"
          />
        </View>

        <Text style={[styles.summaryValue, { color }]}>
          {value}
        </Text>
      </View>

      <Text style={styles.summaryLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  content: {
    flexGrow: 1,
    width: "100%",
    maxWidth: MaxContentWidth,
    alignSelf: "center",
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.six,
    gap: Spacing.three,
    backgroundColor: "#FFFFFF",
  },

  // Page heading
  pageHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: Spacing.three,
  },
  pageHeadingGroup: {
    flex: 1,
    gap: Spacing.one,
  },
  eyebrow: {
    fontFamily: Fonts.body,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.4,
    color: colors.secondary,
  },
  heading: {
    fontFamily: Fonts.heading,
    fontSize: 28,
    fontWeight: "700",
    color: colors.text,
  },
  description: {
    fontFamily: Fonts.body,
    fontSize: 13,
    lineHeight: 20,
    color: colors.textSecondary,
  },
  refreshButton: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.backgroundElement,
    borderRadius: Radius.md,
  },

  // Overview
  summarySection: {
    gap: Spacing.two,
    padding: Spacing.three,
    backgroundColor: colors.background,
    borderRadius: Radius.lg,
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
  mutedText: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: colors.textSecondary,
  },
  summaryRow: {
    flexDirection: "row",
    gap: Spacing.two,
  },
  summaryCard: {
    flex: 1,
    minWidth: 0,
    padding: Spacing.two,
    gap: Spacing.two,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: colors.backgroundElement,
    borderRadius: Radius.md,
  },
  summaryCardActive: {
    borderColor: colors.primary,
    borderWidth: 1.5,
  },
  summaryTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: Spacing.one,
  },
  summaryIcon: {
    width: 30,
    height: 30,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
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
  },

  /* Search — match the Donations screen */
searchBox: {
  minHeight: 46,
  flexDirection: "row",
  alignItems: "center",
  gap: 10,
  paddingHorizontal: 14,
  backgroundColor: "#FFFFFF",
  borderWidth: 1,
  borderColor: colors.backgroundElement,
  borderRadius: Radius.md,
},
searchInput: {
  flex: 1,
  minWidth: 0,
  paddingVertical: 10,
  fontFamily: Fonts.body,
  fontSize: 13,
  color: colors.text,
},
clearSearch: {
  padding: 4,
},

/* Status filters */
filterSection: {
  gap: 8,
},
filterHeading: {
  fontFamily: Fonts.body,
  fontSize: 12,
  fontWeight: "700",
  color: colors.text,
},
filters: {
  flexDirection: "row",
  flexWrap: "wrap",
  gap: 7,
},
filter: {
  flexDirection: "row",
  alignItems: "center",
  gap: 6,
  paddingHorizontal: 10,
  paddingVertical: 7,
  backgroundColor: "#FFFFFF",
  borderWidth: 1,
  borderColor: colors.backgroundElement,
  borderRadius: 20,
},
filterActive: {
  backgroundColor: colors.primary,
  borderColor: colors.primary,
},
filterPressed: {
  opacity: 0.75,
},
filterText: {
  fontFamily: Fonts.body,
  fontSize: 11,
  color: colors.textSecondary,
},
filterTextActive: {
  fontWeight: "700",
  color: "#FFFFFF",
},
filterCount: {
  minWidth: 18,
  height: 18,
  paddingHorizontal: 4,
  borderRadius: 9,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: colors.backgroundElement,
},
filterCountActive: {
  backgroundColor: "rgba(255,255,255,0.22)",
},
filterCountText: {
  fontFamily: Fonts.body,
  fontSize: 10,
  fontWeight: "700",
  color: colors.textSecondary,
},
filterCountTextActive: {
  color: "#FFFFFF",
},

  // Organisation list
  resultsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.two,
  },
  resultsHeading: {
    flex: 1,
  },
  resultsDescription: {
    marginTop: Spacing.half,
    fontFamily: Fonts.body,
    fontSize: 12,
    color: colors.textSecondary,
  },
  resultCount: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: colors.textSecondary,
  },
  ngoList: {
    gap: Spacing.two,
  },
  ngoCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
    padding: Spacing.three,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.backgroundElement,
    borderRadius: Radius.lg,
  },
  ngoIcon: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    backgroundColor: "#E9F4F1",
    alignItems: "center",
    justifyContent: "center",
  },
  ngoInfo: {
    flex: 1,
    gap: Spacing.half,
  },
  ngoName: {
    fontFamily: Fonts.body,
    fontSize: 14,
    fontWeight: "700",
    color: colors.text,
  },
  ngoEmail: {
    fontFamily: Fonts.body,
    fontSize: 12,
    lineHeight: 17,
    color: colors.textSecondary,
  },
  ngoNumber: {
    fontFamily: Fonts.body,
    fontSize: 11,
    color: colors.textSecondary,
  },

  // Verification badges
  statusBadge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.one,
    paddingHorizontal: Spacing.two,
    paddingVertical: 4,
    borderRadius: Radius.sm,
    marginTop: Spacing.one,
  },
  pending: {
    backgroundColor: "#FCEDEA",
  },
  approved: {
    backgroundColor: "#E9F4F1",
  },
  rejected: {
    backgroundColor: "#FFF1DA",
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  pendingDot: {
    backgroundColor: colors.primary,
  },
  approvedDot: {
    backgroundColor: colors.secondary,
  },
  rejectedDot: {
    backgroundColor: "#996000",
  },
  statusText: {
    fontFamily: Fonts.body,
    fontSize: 11,
    fontWeight: "700",
    color: colors.text,
  },

  // Loading, error and empty states
  stateContainer: {
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.two,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.five,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.backgroundElement,
    borderRadius: Radius.lg,
  },
  stateText: {
    fontFamily: Fonts.body,
    fontSize: 13,
    lineHeight: 19,
    color: colors.textSecondary,
    textAlign: "center",
  },
  emptyTitle: {
    fontFamily: Fonts.heading,
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
  },
  error: {
    fontFamily: Fonts.body,
    fontSize: 13,
    lineHeight: 19,
    color: colors.error,
    textAlign: "center",
  },
  retry: {
    fontFamily: Fonts.body,
    fontSize: 13,
    fontWeight: "700",
    color: colors.primary,
  },
  clearFiltersButton: {
    marginTop: Spacing.one,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Radius.md,
    backgroundColor: colors.backgroundElement,
  },
  clearFiltersText: {
    fontFamily: Fonts.body,
    fontSize: 12,
    fontWeight: "700",
    color: colors.text,
  },
});