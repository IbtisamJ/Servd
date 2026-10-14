/**
 * Available Donations Screen
 *
 * Displays donations from Firestore that currently
 * have the status "Available".
 *
 * The screen refreshes whenever it receives focus,
 * ensuring reservation, cancellation and manual
 * Firestore updates are reflected immediately.
 */

import {
  useCallback,
  useState,
} from "react";

import {
  ActivityIndicator,
  Alert,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import {
  router,
  useFocusEffect,
} from "expo-router";

import {
  getDonations,
} from "../services/donationService";

import {
  DONATION_STATUS,
} from "../constants/donationStatus";

import {
  COLORS,
  SPACING,
  TYPOGRAPHY,
} from "../theme";

export default function AvailableDonations() {
  /**
   * Stores donations that are currently
   * available for reservation.
   */
  const [donations, setDonations] =
    useState<any[]>([]);

  /**
   * Controls the loading indicator while
   * Firestore data is being retrieved.
   */
  const [loading, setLoading] =
    useState(true);

  /**
   * Retrieves all donation records from Firestore
   * and filters the results so that only donations
   * with an Available status are displayed.
   */
  const loadDonations =
    useCallback(async () => {
      try {
        setLoading(true);

        const data =
          await getDonations();

        /**
         * Temporary development log.
         *
         * Useful while testing Firestore.
         * This can be removed before submission.
         */
        console.log(
          "Donations loaded from Firestore:",
          data
        );

        /**
         * NGOs should only see donations
         * that remain available.
         */
        const availableDonations =
          data.filter(
            (donation: any) =>
              donation.status ===
              DONATION_STATUS.AVAILABLE
          );

        console.log(
          "Available donations:",
          availableDonations
        );

        setDonations(
          availableDonations
        );

      } catch (error) {
        console.error(
          "Error loading donations:",
          error
        );

        Alert.alert(
          "Loading Error",
          "Available donations could not be loaded. Please try again."
        );

      } finally {
        setLoading(false);
      }
    }, []);

  /**
   * Refresh donation data whenever this
   * screen becomes active again.
   *
   * Examples:
   *
   * Available -> Reserved:
   * Donation disappears.
   *
   * Reserved -> Available:
   * Donation reappears.
   */
  useFocusEffect(
    useCallback(() => {
      loadDonations();
    }, [loadDonations])
  );

  /**
   * Loading state.
   */
  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerContainer}>
          <ActivityIndicator
            size="large"
            color={COLORS.primaryTeal}
          />

          <Text style={styles.loadingText}>
            Loading available donations...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>

        {/*
         * Back Button
         *
         * Returns to the previous screen.
         * Normally this will be the NGO Dashboard.
         */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() =>
            router.back()
          }
          activeOpacity={0.7}
        >
          <Text style={styles.backButtonText}>
            ← Back
          </Text>
        </TouchableOpacity>

        {/* Screen heading */}
        <Text style={styles.heading}>
          Available Donations
        </Text>

        {donations.length === 0 ? (
          /**
           * Friendly empty state displayed when
           * there are no Available donations.
           */
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>
              No Donations Available
            </Text>

            <Text style={styles.emptyText}>
              There are currently no available
              donations. Please check again later.
            </Text>
          </View>
        ) : (
          <FlatList
            data={donations}

            /**
             * Actual Firestore document ID
             * provides a unique list key.
             */
            keyExtractor={(item) =>
              item.id
            }

            /**
             * Allows the list to use the remaining
             * available mobile-screen space.
             */
            style={styles.list}

            contentContainerStyle={
              styles.listContent
            }

            showsVerticalScrollIndicator={
              false
            }

            renderItem={({ item }) => (
              <View style={styles.card}>

                {/* Donation food name */}
                <Text style={styles.title}>
                  {item.foodName}
                </Text>

                {/* Donation category */}
                <Text style={styles.text}>
                  Category:{" "}
                  {item.category ||
                    "Not specified"}
                </Text>

                {/* Quantity available */}
                <Text style={styles.text}>
                  Quantity:{" "}
                  {item.quantity ??
                    "Not specified"}
                </Text>

                {/* Collection location */}
                <Text style={styles.text}>
                  Location:{" "}
                  {item.collectionLocation ||
                    "Not specified"}
                </Text>

                {/* Current donation status */}
                <Text style={styles.status}>
                  Status:{" "}
                  {item.status}
                </Text>

                {/**
                 * Opens Donation Details and passes
                 * information about the selected
                 * Firestore donation.
                 */}
                <TouchableOpacity
                  style={styles.button}
                  activeOpacity={0.8}
                  onPress={() =>
                    router.push({
                      pathname:
                        "/donation-details",

                      params: {
                        /**
                         * Actual Firestore
                         * document identifier.
                         */
                        documentId:
                          item.id,

                        /**
                         * Servd logical
                         * donation identifier.
                         */
                        donationId:
                          item.donationId,

                        enterpriseId:
                          item.enterpriseId,

                        foodName:
                          item.foodName,

                        category:
                          item.category,

                        description:
                          item.description,

                        quantity:
                          item.quantity?.toString(),

                        collectionLocation:
                          item.collectionLocation,

                        status:
                          item.status,
                      },
                    })
                  }
                >
                  <Text style={styles.buttonText}>
                    View Details
                  </Text>
                </TouchableOpacity>

              </View>
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

/**
 * Responsive styling for the Available
 * Donations screen.
 *
 * No fixed card or button widths are used,
 * allowing the interface to adapt to
 * different mobile screen sizes.
 */
const styles = StyleSheet.create({
  /**
   * Safe area prevents screen content from
   * sitting underneath system UI areas.
   */
  safeArea: {
    flex: 1,
    backgroundColor:
      COLORS.offWhite,
  },

  /**
   * Main screen container.
   *
   * Horizontal padding gives consistent margins
   * while width remains responsive.
   */
  container: {
    flex: 1,
    width: "100%",
    backgroundColor:
      COLORS.offWhite,

    paddingHorizontal:
      SPACING.lg,

    paddingTop:
      SPACING.sm,
  },

  /**
   * Loading-state layout.
   */
  centerContainer: {
    flex: 1,

    justifyContent:
      "center",

    alignItems:
      "center",

    paddingHorizontal:
      SPACING.lg,
  },

  /**
   * Back navigation.
   */
  backButton: {
    alignSelf:
      "flex-start",

    paddingVertical:
      SPACING.sm,

    paddingRight:
      SPACING.md,

    marginBottom:
      SPACING.xs,
  },

  backButtonText: {
    ...TYPOGRAPHY.body,

    color:
      COLORS.primaryTeal,

    fontWeight:
      "600",
  },

  /**
   * Main page heading.
   */
  heading: {
    ...TYPOGRAPHY.headingLarge,

    color:
      COLORS.primaryTeal,

    marginBottom:
      SPACING.lg,
  },

  /**
   * Allows FlatList to occupy the remaining
   * height of the device.
   */
  list: {
    flex: 1,
    width: "100%",
  },

  /**
   * Bottom padding prevents the final card
   * from sitting against the bottom edge.
   */
  listContent: {
    paddingBottom:
      SPACING.xl,
  },

  /**
   * Donation card.
   *
   * The card uses the available parent width
   * rather than a fixed pixel width.
   */
  card: {
    width: "100%",

    backgroundColor:
      COLORS.white,

    padding:
      SPACING.lg,

    borderRadius: 12,

    marginBottom:
      SPACING.md,

    /**
     * Subtle Android elevation.
     */
    elevation: 2,

    /**
     * iOS shadow properties.
     */
    shadowColor:
      "#000000",

    shadowOffset: {
      width: 0,
      height: 1,
    },

    shadowOpacity:
      0.08,

    shadowRadius:
      3,
  },

  title: {
    ...TYPOGRAPHY.headingSmall,

    color:
      COLORS.primaryGreen,

    marginBottom:
      SPACING.sm,

    /**
     * Helps long food names wrap instead
     * of overflowing the card.
     */
    flexShrink: 1,
  },

  text: {
    ...TYPOGRAPHY.body,

    color:
      COLORS.black,

    marginBottom:
      SPACING.xs,

    flexShrink: 1,
  },

  status: {
    ...TYPOGRAPHY.body,

    color:
      COLORS.primaryGreen,

    fontWeight:
      "bold",

    marginTop:
      SPACING.xs,

    flexShrink: 1,
  },

  /**
   * Responsive full-width action button.
   */
  button: {
    width: "100%",

    minHeight: 48,

    justifyContent:
      "center",

    alignItems:
      "center",

    backgroundColor:
      COLORS.primaryTeal,

    paddingHorizontal:
      SPACING.md,

    paddingVertical:
      SPACING.md,

    borderRadius: 10,

    marginTop:
      SPACING.md,
  },

  buttonText: {
    ...TYPOGRAPHY.button,

    color:
      COLORS.white,

    textAlign:
      "center",
  },

  loadingText: {
    ...TYPOGRAPHY.body,

    color:
      COLORS.black,

    marginTop:
      SPACING.md,

    textAlign:
      "center",
  },

  /**
   * Responsive empty-state card.
   */
  emptyContainer: {
    width: "100%",

    backgroundColor:
      COLORS.white,

    padding:
      SPACING.lg,

    borderRadius: 12,

    alignItems:
      "center",
  },

  emptyTitle: {
    ...TYPOGRAPHY.headingSmall,

    color:
      COLORS.primaryTeal,

    marginBottom:
      SPACING.sm,

    textAlign:
      "center",
  },

  emptyText: {
    ...TYPOGRAPHY.body,

    color:
      COLORS.black,

    textAlign:
      "center",

    flexShrink: 1,
  },
});