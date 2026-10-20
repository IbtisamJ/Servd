/**
 * Enterprise List Screen
 *
 * Retrieves registered food enterprise documents from Firestore
 * and displays them in the administrator interface.
 *
 * Responsibilities:
 * - Loads enterprise records from Firestore.
 * - Displays available enterprise information.
 * - Handles loading and error states where implemented.
 * - Allows administrators to select an enterprise for more information.
 * - Navigates to the selected enterprise's detail screen.
 */

import FontAwesome5 from "@react-native-vector-icons/fontawesome5";
import { useRouter } from "expo-router";
import { collection, getDocs } from "firebase/firestore";
import { useCallback, useEffect, useMemo, useState } from "react";
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

import { db } from "@/config/firebase";
import { COLLECTIONS } from "@/constants/roles";
import { Colors, Fonts, Radius, Spacing, MaxContentWidth } from "@/constants/theme";

const colors = Colors.light;

type Enterprise = {
  id: string;
  enterpriseName?: string;
  contactInformation?: string;
  registrationNumber?: string;
  userID?: string;
  createdTimestamp?:
    | {
        toDate?: () => Date;
      }
    | string;
};

export default function EnterprisesScreen() {
  const router = useRouter();

  const [enterprises, setEnterprises] = useState<Enterprise[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadEnterprises = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const snapshot = await getDocs(collection(db, COLLECTIONS.ENTERPRISES));

      setEnterprises(
        snapshot.docs.map((document) => ({
          id: document.id,
          ...document.data(),
        })) as Enterprise[],
      );
    } catch (err) {
      console.error("Error loading enterprises:", err);
      setError(
        "Unable to load enterprises. Check your connection and permissions.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEnterprises();
  }, [loadEnterprises]);

  const filteredEnterprises = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return enterprises;

    return enterprises.filter((enterprise) =>
      [
        enterprise.enterpriseName ?? "",
        enterprise.contactInformation ?? "",
        enterprise.registrationNumber ?? "",
        enterprise.userID ?? "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [enterprises, search]);

  const renderEnterprise = ({ item }: { item: Enterprise }) => (
    <Pressable
      onPress={() => router.push(`/admin/enterprises/${item.id}` as never)}
      style={({ pressed }) => [
        styles.enterpriseCard,
        pressed && styles.enterpriseCardPressed,
      ]}
      accessibilityRole="button"
      accessibilityLabel={`View ${item.enterpriseName || "unnamed enterprise"}`}
    >
      <View style={styles.enterpriseIcon}>
        <FontAwesome5
          name="store"
          size={18}
          color={colors.secondary}
          iconStyle="solid"
        />
      </View>

      <View style={styles.enterpriseDetails}>
        <Text style={styles.enterpriseName}>
          {item.enterpriseName || "Unnamed enterprise"}
        </Text>

        <Text style={styles.enterpriseContact}>
          {item.contactInformation || "No contact information provided"}
        </Text>

        {item.registrationNumber ? (
          <Text style={styles.enterprisePhone}>
            Registration: {item.registrationNumber}
          </Text>
        ) : null}
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
    <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
      <FlatList
        data={loading || error ? [] : filteredEnterprises}
        keyExtractor={(item) => item.id}
        renderItem={renderEnterprise}
        style={styles.screen}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        ItemSeparatorComponent={() => <View style={styles.listSeparator} />}
        ListHeaderComponent={
          <View style={styles.pageContent}>
            {/* Page heading */}
            <View style={styles.pageHeader}>
              <View style={styles.pageHeadingGroup}>
                <Text style={styles.eyebrow}>SERVD / ADMINISTRATION</Text>

                <Text style={styles.heading}>Food enterprises</Text>

                <Text style={styles.description}>
                  View registered food enterprises and manage their registration
                  details.
                </Text>
              </View>

              <Pressable
                onPress={loadEnterprises}
                disabled={loading}
                style={({ pressed }) => [
                  styles.refreshButton,
                  pressed && styles.pressed,
                  loading && styles.disabled,
                ]}
                accessibilityRole="button"
                accessibilityLabel="Refresh enterprise list"
              >
                <FontAwesome5
                  name="sync-alt"
                  size={15}
                  color={colors.primary}
                  iconStyle="solid"
                />
              </Pressable>
            </View>

            {/* Overview */}
            <View style={styles.overview}>
              <View style={styles.overviewHeader}>
                <Text style={styles.sectionTitle}>Overview</Text>
                <Text style={styles.mutedText}>All registrations</Text>
              </View>

              <View style={styles.overviewCard}>
                <View style={styles.overviewIcon}>
                  <FontAwesome5
                    name="store"
                    size={16}
                    color={colors.secondary}
                    iconStyle="solid"
                  />
                </View>

                <View style={styles.overviewDetails}>
                  <Text style={styles.overviewValue}>{enterprises.length}</Text>
                  <Text style={styles.overviewLabel}>
                    Registered enterprises
                  </Text>
                </View>
              </View>
            </View>

            {/* Search */}
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
                placeholder="Search enterprises, contacts, email..."
                placeholderTextColor={colors.textSecondary}
                style={styles.searchInput}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="search"
                accessibilityLabel="Search food enterprises"
              />

              {search.length > 0 ? (
                <Pressable
                  onPress={() => setSearch("")}
                  style={styles.clearSearch}
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel="Clear search"
                >
                  <FontAwesome5
                    name="times-circle"
                    size={15}
                    color={colors.textSecondary}
                    iconStyle="solid"
                  />
                </Pressable>
              ) : null}
            </View>

            {/* List heading */}
            <View style={styles.resultsHeader}>
              <View style={styles.resultsHeadingGroup}>
                <Text style={styles.sectionTitle}>Enterprises</Text>
                <Text style={styles.resultsDescription}>
                  Registered food businesses and contact details
                </Text>
              </View>

              {!loading && !error ? (
                <Text style={styles.resultCount}>
                  {filteredEnterprises.length}{" "}
                  {filteredEnterprises.length === 1 ? "result" : "results"}
                </Text>
              ) : null}
            </View>

            {/* Loading state */}
            {loading ? (
              <View style={styles.stateContainer}>
                <ActivityIndicator color={colors.primary} size="large" />
                <Text style={styles.stateText}>Loading enterprises...</Text>
              </View>
            ) : null}

            {/* Error state */}
            {!loading && error ? (
              <Pressable
                onPress={loadEnterprises}
                style={styles.stateContainer}
                accessibilityRole="button"
                accessibilityLabel="Retry loading enterprises"
              >
                <FontAwesome5
                  name="exclamation-circle"
                  size={26}
                  color={colors.error}
                  iconStyle="solid"
                />
                <Text style={styles.errorText}>{error}</Text>
                <Text style={styles.retryText}>Tap to retry</Text>
              </Pressable>
            ) : null}

            {/* Empty state */}
            {!loading && !error && filteredEnterprises.length === 0 ? (
              <View style={styles.stateContainer}>
                <FontAwesome5
                  name={search.trim() ? "search" : "store"}
                  size={25}
                  color={colors.textSecondary}
                  iconStyle="solid"
                />

                <Text style={styles.emptyTitle}>
                  {search.trim()
                    ? "No enterprises found"
                    : "No enterprises registered"}
                </Text>

                <Text style={styles.stateText}>
                  {search.trim()
                    ? "Try another search term."
                    : "Registered food enterprises will appear here."}
                </Text>

                {search.trim() ? (
                  <Pressable
                    onPress={() => setSearch("")}
                    style={({ pressed }) => [
                      styles.clearSearchButton,
                      pressed && styles.pressed,
                    ]}
                  >
                    <Text style={styles.clearSearchButtonText}>
                      Clear search
                    </Text>
                  </Pressable>
                ) : null}
              </View>
            ) : null}
          </View>
        }
        ListEmptyComponent={null}
        ListFooterComponent={<View style={styles.listFooter} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
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
    backgroundColor: "#FFFFFF",
  },
  pageContent: {
    gap: Spacing.three,
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
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: colors.backgroundElement,
    borderRadius: Radius.md,
  },
  pressed: {
    opacity: 0.75,
  },
  disabled: {
    opacity: 0.5,
  },

  // Overview
  overview: {
    gap: Spacing.two,
    padding: Spacing.three,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.backgroundElement,
    borderRadius: Radius.lg,
  },
  overviewHeader: {
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
  overviewCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
    padding: Spacing.three,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: colors.backgroundElement,
    borderRadius: Radius.md,
  },
  overviewIcon: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Radius.md,
    backgroundColor: "#E9F4F1",
  },
  overviewDetails: {
    flex: 1,
    gap: Spacing.half,
  },
  overviewValue: {
    fontFamily: Fonts.heading,
    fontSize: 24,
    fontWeight: "700",
    color: colors.text,
  },
  overviewLabel: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: colors.textSecondary,
  },

  // Search
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

  // Results 
  resultsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.two,
  },
  resultsHeadingGroup: {
    flex: 1,
    gap: Spacing.one
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
  listSeparator: {
    height: Spacing.two,
  },
  listFooter: {
    height: Spacing.four,
  },
  enterpriseCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
    padding: Spacing.three,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.backgroundElement,
    borderRadius: Radius.lg,
  },
  enterpriseCardPressed: {
    opacity: 0.78,
    backgroundColor: colors.backgroundElement,
  },
  enterpriseIcon: {
    width: 44,
    height: 44,
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Radius.md,
    backgroundColor: "#E9F4F1",
  },
  enterpriseDetails: {
    flex: 1,
    minWidth: 0,
    gap: Spacing.half,
  },
  enterpriseName: {
    fontFamily: Fonts.body,
    fontSize: 14,
    fontWeight: "700",
    color: colors.text,
  },
  enterpriseContact: {
    fontFamily: Fonts.body,
    fontSize: 12,
    lineHeight: 17,
    color: colors.textSecondary,
  },
  enterprisePhone: {
    fontFamily: Fonts.body,
    fontSize: 11,
    color: colors.textSecondary,
  },

  // Loading, error, and empty states
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
  errorText: {
    fontFamily: Fonts.body,
    fontSize: 13,
    lineHeight: 19,
    color: colors.error,
    textAlign: "center",
  },
  retryText: {
    fontFamily: Fonts.body,
    fontSize: 13,
    fontWeight: "700",
    color: colors.primary,
  },
  emptyTitle: {
    fontFamily: Fonts.heading,
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
    textAlign: "center",
  },
  clearSearchButton: {
    marginTop: Spacing.one,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Radius.md,
    backgroundColor: colors.backgroundElement,
  },
  clearSearchButtonText: {
    fontFamily: Fonts.body,
    fontSize: 12,
    fontWeight: "700",
    color: colors.text,
  },
});