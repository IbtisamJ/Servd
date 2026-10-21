/**
 * Donation Details Screen
 *
 * Displays the details of an individual food donation.
 *
 * Responsibilities:
 * - Loads donation records through the donation service.
 * - Displays donation, donor, and collection information.
 * - Displays the current donation status.
 * - Supports cancellation of available donations.
 * - Handles loading, error, and missing-record states.
 * - Provides navigation back to the donation list.
 */

import FontAwesome5 from "@react-native-vector-icons/fontawesome5";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  getDonations,
  updateDonation,
} from "@/services/donationService";
import {
  Colors,
  Fonts,
  Spacing,
  Radius,
  MaxContentWidth,
} from "@/constants/theme";

const colors = Colors.light;

type Donation = {
  id?: string;
  donationId?: string;
  foodName?: string;
  enterpriseName?: string;
  enterpriseId?: string;
  quantity?: number | string;
  status?: string;
  collectionLocation?: string;
  description?: string;
  expiryDate?: string;
};

// Standardizes status values so comparisons and styling remain consistent.
const normalizeStatus = (status?: string) =>
  (status ?? "unknown").toLowerCase();

// Capitalizes the status for display in the interface.
const getStatusLabel = (status: string) =>
  status.charAt(0).toUpperCase() + status.slice(1);

// Returns the badge and indicator styles associated with each donation status.
const getStatusStyle = (status: string) => {
  switch (status) {
    case "available":
      return {
        badge: styles.availableBadge,
        dot: styles.availableDot,
      };
    case "reserved":
      return {
        badge: styles.reservedBadge,
        dot: styles.reservedDot,
      };
    case "collected":
      return {
        badge: styles.collectedBadge,
        dot: styles.collectedDot,
      };
    case "cancelled":
    case "expired":
      return {
        badge: styles.inactiveBadge,
        dot: styles.inactiveDot,
      };
    default:
      return {
        badge: styles.unknownBadge,
        dot: styles.unknownDot,
      };
  }
};

export default function DonationDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [donation, setDonation] = useState<Donation | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Fetches donations and finds the record matching the route parameter.
  const loadDonation = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const result = (await getDonations()) as unknown as Donation[];

      const found = result.find(
        (item) => item.id === id || item.donationId === id,
      );

      setDonation(found ?? null);

      if (!found) {
        setError("Donation not found.");
      }
    } catch (err) {
      console.error("Failed to load donation:", err);
      setError(
        "Could not load donation details. Check your connection and permissions.",
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  // Reloads the donation whenever the route ID changes.
  useEffect(() => {
    loadDonation();
  }, [loadDonation]);

  // Confirms cancellation before updating the donation status.
  const changeStatus = (status: "cancelled") => {
    if (!id || !donation || saving) return;

    Alert.alert(
      "Cancel donation?",
      'This will change the donation status to "cancelled".',
      [
        {
          text: "Keep donation",
          style: "cancel",
        },
        {
          text: "Confirm cancellation",
          style: "destructive",
          onPress: async () => {
            setSaving(true);

            try {
              await updateDonation(id, { status } as never);

              // Updates the displayed donation after the database update succeeds.
              setDonation((current) =>
                current ? { ...current, status } : current,
              );

              Alert.alert(
                "Updated",
                "Donation status was updated.",
              );
            } catch (err) {
              console.error("Failed to update donation:", err);

              Alert.alert(
                "Update failed",
                "The donation could not be updated. Check Firestore permissions.",
              );
            } finally {
              setSaving(false);
            }
          },
        },
      ],
    );
  };

  // Displays a consistent label and value for each donation detail.
  function detail(
    label: string,
    value?: string | number,
  ) {
    const displayValue =
      value !== undefined && String(value).trim() !== ""
        ? String(value)
        : "Not provided";

    return (
      <View style={styles.detail} key={label}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>{displayValue}</Text>
      </View>
    );
  }

  const status = normalizeStatus(donation?.status);
  const canCancel = status === "available";
  const statusStyle = getStatusStyle(status);

  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [
            styles.backButton,
            pressed && styles.pressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Back to donations"
        >
          <FontAwesome5
            name="arrow-left"
            size={14}
            color={colors.primary}
            iconStyle="solid"
          />
          <Text style={styles.backText}>Back to donations</Text>
        </Pressable>

        {/* Displays a loading indicator while donation data is retrieved. */}
        {loading ? (
          <View style={styles.stateCard}>
            <ActivityIndicator
              size="large"
              color={colors.primary}
            />
            <Text style={styles.stateTitle}>
              Loading donation
            </Text>
            <Text style={styles.stateDescription}>
              Retrieving donation details...
            </Text>
          </View>
        ) : error ? (
          // Shows an error message and allows the user to retry loading.
          <View style={styles.stateCard}>
            <View style={styles.errorIcon}>
              <FontAwesome5
                name="exclamation-circle"
                size={23}
                color={colors.error}
                iconStyle="solid"
              />
            </View>

            <Text style={styles.stateTitle}>
              Unable to load donation
            </Text>

            <Text style={styles.stateDescription}>
              {error}
            </Text>

            <Pressable
              onPress={loadDonation}
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && styles.pressed,
              ]}
              accessibilityRole="button"
            >
              <FontAwesome5
                name="sync-alt"
                size={13}
                color="#FFFFFF"
                iconStyle="solid"
              />
              <Text style={styles.buttonText}>
                Try again
              </Text>
            </Pressable>
          </View>
        ) : donation ? (
          <>
            {/* Displays the donation name and its current status. */}
            <View style={styles.hero}>
              <View style={styles.heroIcon}>
                <FontAwesome5
                  name="box"
                  size={27}
                  color={colors.secondary}
                  iconStyle="solid"
                />
              </View>

              <Text style={styles.eyebrow}>
                SERVD / ADMINISTRATION
              </Text>

              <Text style={styles.heroTitle}>
                {donation.foodName || "Donation details"}
              </Text>

              <View
                style={[
                  styles.statusBadge,
                  statusStyle.badge,
                ]}
              >
                <View
                  style={[
                    styles.statusDot,
                    statusStyle.dot,
                  ]}
                />
                <Text style={styles.statusText}>
                  {getStatusLabel(status)}
                </Text>
              </View>

              <Text style={styles.heroDescription}>
                Food donation details, collection information,
                and donor records.
              </Text>
            </View>

            {/* Shows the donated food and its availability details. */}
            <View style={styles.card}>
              <View style={styles.cardHeading}>
                <View style={styles.cardIcon}>
                  <FontAwesome5
                    name="box-open"
                    size={16}
                    color={colors.secondary}
                    iconStyle="solid"
                  />
                </View>

                <View style={styles.cardHeadingText}>
                  <Text style={styles.sectionTitle}>
                    Donation information
                  </Text>
                  <Text style={styles.sectionDescription}>
                    Food details and availability
                  </Text>
                </View>
              </View>

              {detail("Food item", donation.foodName)}
              {detail("Quantity", donation.quantity)}
              {detail("Description", donation.description)}
              {detail("Expiry date", donation.expiryDate)}
            </View>

            {/* Shows where the donation can be collected. */}
            <View style={styles.card}>
              <View style={styles.cardHeading}>
                <View style={styles.cardIcon}>
                  <FontAwesome5
                    name="map-marker-alt"
                    size={16}
                    color={colors.secondary}
                    iconStyle="solid"
                  />
                </View>

                <View style={styles.cardHeadingText}>
                  <Text style={styles.sectionTitle}>
                    Collection information
                  </Text>
                  <Text style={styles.sectionDescription}>
                    Where the donation can be collected
                  </Text>
                </View>
              </View>

              {detail(
                "Collection location",
                donation.collectionLocation,
              )}
            </View>

            {/* Shows the donor's enterprise and donation identifiers. */}
            <View style={styles.card}>
              <View style={styles.cardHeading}>
                <View style={styles.cardIcon}>
                  <FontAwesome5
                    name="building"
                    size={16}
                    color={colors.secondary}
                    iconStyle="solid"
                  />
                </View>

                <View style={styles.cardHeadingText}>
                  <Text style={styles.sectionTitle}>
                    Donor information
                  </Text>
                  <Text style={styles.sectionDescription}>
                    Enterprise associated with this donation
                  </Text>
                </View>
              </View>

              {detail("Enterprise", donation.enterpriseName)}
              {detail("Enterprise ID", donation.enterpriseId)}
              {detail(
                "Donation ID",
                donation.id ?? donation.donationId ?? id,
              )}
            </View>

            {/* Allows cancellation only while the donation is available. */}
            {canCancel ? (
              <View style={styles.actionsSection}>
                <Text style={styles.sectionTitle}>
                  Donation actions
                </Text>

                <Text style={styles.actionsDescription}>
                  Cancel this donation if it is no longer available.
                </Text>

                <Pressable
                  disabled={saving}
                  style={({ pressed }) => [
                    styles.cancelButton,
                    pressed && !saving && styles.pressed,
                    saving && styles.disabledButton,
                  ]}
                  onPress={() => changeStatus("cancelled")}
                  accessibilityRole="button"
                  accessibilityLabel="Cancel donation"
                >
                  {saving ? (
                    <ActivityIndicator
                      size="small"
                      color="#FFFFFF"
                    />
                  ) : (
                    <>
                      <FontAwesome5
                        name="ban"
                        size={15}
                        color="#FFFFFF"
                        iconStyle="solid"
                      />
                      <Text style={styles.buttonText}>
                        Cancel donation
                      </Text>
                    </>
                  )}
                </Pressable>
              </View>
            ) : null}
          </>
        ) : null}
      </ScrollView>
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
    gap: Spacing.three,
  },

  // Navigation
  backButton: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    paddingVertical: Spacing.two,
    paddingRight: Spacing.two,
  },
  backText: {
    fontFamily: Fonts.body,
    fontWeight: "700",
    fontSize: 13,
    color: colors.primary,
  },
  pressed: {
    opacity: 0.75,
  },

  // Donation hero
  hero: {
    alignItems: "center",
    paddingTop: Spacing.two,
    paddingBottom: Spacing.three,
    gap: Spacing.two,
  },
  heroIcon: {
    width: 68,
    height: 68,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E9F4F1",
    borderRadius: Radius.lg,
    marginBottom: Spacing.one,
  },
  eyebrow: {
    fontFamily: Fonts.body,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.4,
    color: colors.secondary,
    textAlign: "center",
  },
  heroTitle: {
    width: "100%",
    fontFamily: Fonts.heading,
    fontSize: 25,
    lineHeight: 32,
    fontWeight: "700",
    color: colors.text,
    textAlign: "center",
  },
  heroDescription: {
    maxWidth: 320,
    fontFamily: Fonts.body,
    fontSize: 13,
    lineHeight: 20,
    color: colors.textSecondary,
    textAlign: "center",
  },

  // Status badges
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Radius.sm,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  statusText: {
    fontFamily: Fonts.body,
    fontSize: 11,
    fontWeight: "700",
    color: colors.text,
  },
  availableBadge: {
    backgroundColor: "#E6ECD9",
  },
  availableDot: {
    backgroundColor: colors.accent,
  },
  reservedBadge: {
    backgroundColor: "#DDF0EE",
  },
  reservedDot: {
    backgroundColor: colors.secondary,
  },
  collectedBadge: {
    backgroundColor: "#E0E1E6",
  },
  collectedDot: {
    backgroundColor: colors.textSecondary,
  },
  inactiveBadge: {
    backgroundColor: "#F6DEDA",
  },
  inactiveDot: {
    backgroundColor: colors.error,
  },
  unknownBadge: {
    backgroundColor: colors.backgroundSelected,
  },
  unknownDot: {
    backgroundColor: colors.textSecondary,
  },

  // Information cards
  card: {
    padding: Spacing.three,
    gap: Spacing.three,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.backgroundElement,
    borderRadius: Radius.lg,
  },
  cardHeading: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    marginBottom: Spacing.one,
  },
  cardIcon: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E9F4F1",
    borderRadius: Radius.md,
  },
  cardHeadingText: {
    flex: 1,
    gap: Spacing.half,
  },
  sectionTitle: {
    fontFamily: Fonts.heading,
    fontSize: 17,
    lineHeight: 23,
    fontWeight: "700",
    color: colors.text,
  },
  sectionDescription: {
    fontFamily: Fonts.body,
    fontSize: 12,
    lineHeight: 17,
    color: colors.textSecondary,
  },
  detail: {
    gap: Spacing.one,
  },
  detailLabel: {
    fontFamily: Fonts.body,
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.2,
    color: colors.textSecondary,
  },
  detailValue: {
    fontFamily: Fonts.body,
    fontSize: 14,
    lineHeight: 21,
    color: colors.text,
    userSelect: "text",
  },

  // Donation actions
  actionsSection: {
    gap: Spacing.two,
    paddingTop: Spacing.two,
  },
  actionsDescription: {
    fontFamily: Fonts.body,
    fontSize: 12,
    lineHeight: 18,
    color: colors.textSecondary,
    marginBottom: Spacing.one,
  },
  cancelButton: {
    minHeight: 48,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: Spacing.two,
    backgroundColor: colors.primary,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
  },
  disabledButton: {
    opacity: 0.55,
  },
  buttonText: {
    color: "#FFFFFF",
    fontFamily: Fonts.button,
    fontWeight: "700",
    fontSize: 13,
  },

  // Loading and error states
  stateCard: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.five,
    gap: Spacing.two,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.backgroundElement,
    borderRadius: Radius.lg,
    marginTop: Spacing.two,
  },
  errorIcon: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F6DEDA",
    borderRadius: Radius.lg,
    marginBottom: Spacing.one,
  },
  stateTitle: {
    fontFamily: Fonts.heading,
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
    color: colors.text,
  },
  stateDescription: {
    fontFamily: Fonts.body,
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
    color: colors.textSecondary,
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.two,
    marginTop: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Radius.md,
    backgroundColor: colors.primary,
  },
});