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
         * Useful for confirming that Firestore
         * is returning the expected documents.
         * This can be removed before final submission.
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

        /**
         * Provide visible feedback instead of
         * allowing the application to fail silently.
         */
        Alert.alert(
          "Loading Error",
          "Available donations could not be loaded. Please try again."
        );

      } finally {
        setLoading(false);
      }
    }, []);

  /**
   * Refresh the Firestore data whenever
   * this screen becomes active.
   *
   * Examples:
   *
   * Reserved -> donation disappears.
   * Cancelled reservation -> donation reappears.
   * Firestore changed to Available -> donation appears.
   */
  useFocusEffect(
    useCallback(() => {
      loadDonations();
    }, [loadDonations])
  );

  /**
   * Show loading feedback while Firestore
   * data is being retrieved.
   */
  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator
          size="large"
          color={COLORS.primaryTeal}
        />

        <Text style={styles.loadingText}>
          Loading available donations...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Screen heading */}
      <Text style={styles.heading}>
        Available Donations
      </Text>

      {donations.length === 0 ? (
        /**
         * Friendly empty state.
         *
         * This is also useful for the
         * Deliverable 5 edge-case test.
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
           * item.id represents the actual
           * Firestore document ID.
           */
          keyExtractor={(item) =>
            item.id
          }

          showsVerticalScrollIndicator={
            false
          }

          renderItem={({ item }) => (
            <View style={styles.card}>
              {/* Food Name */}
              <Text style={styles.title}>
                {item.foodName}
              </Text>

              {/* Donation Category */}
              <Text style={styles.text}>
                Category:{" "}
                {item.category}
              </Text>

              {/* Quantity Available */}
              <Text style={styles.text}>
                Quantity:{" "}
                {item.quantity}
              </Text>

              {/* Collection Location */}
              <Text style={styles.text}>
                Location:{" "}
                {item.collectionLocation}
              </Text>

              {/* Current Donation Status */}
              <Text style={styles.status}>
                Status:{" "}
                {item.status}
              </Text>

              {/**
               * Pass the selected donation's
               * information to Donation Details.
               *
               * documentId:
               * Actual Firestore document ID,
               * e.g. "Donation Test 4".
               *
               * donationId:
               * Servd business identifier,
               * e.g. "DON04".
               */}
              <TouchableOpacity
                style={styles.button}
                onPress={() =>
                  router.push({
                    pathname:
                      "/donation-details",

                    params: {
                      documentId:
                        item.id,

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
  );
}

/**
 * Styles follow the Servd design system:
 *
 * Lora:
 * Major headings
 *
 * DM Sans:
 * Body text, cards and buttons
 */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:
      COLORS.offWhite,
    padding: SPACING.lg,
  },

  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor:
      COLORS.offWhite,
    padding: SPACING.lg,
  },

  heading: {
    ...TYPOGRAPHY.headingLarge,
    color:
      COLORS.primaryTeal,
    marginBottom:
      SPACING.lg,
  },

  card: {
    backgroundColor:
      COLORS.white,

    padding:
      SPACING.lg,

    borderRadius: 12,

    marginBottom:
      SPACING.md,
  },

  title: {
    ...TYPOGRAPHY.headingSmall,

    color:
      COLORS.primaryGreen,

    marginBottom:
      SPACING.sm,
  },

  text: {
    ...TYPOGRAPHY.body,

    color:
      COLORS.black,

    marginBottom:
      SPACING.xs,
  },

  status: {
    ...TYPOGRAPHY.body,

    color:
      COLORS.primaryGreen,

    fontWeight: "bold",

    marginTop:
      SPACING.xs,
  },

  button: {
    backgroundColor:
      COLORS.primaryTeal,

    padding:
      SPACING.md,

    borderRadius: 10,

    marginTop:
      SPACING.md,
  },

  buttonText: {
    ...TYPOGRAPHY.button,

    color:
      COLORS.white,

    textAlign: "center",
  },

  loadingText: {
    ...TYPOGRAPHY.body,

    color:
      COLORS.black,

    marginTop:
      SPACING.md,
  },

  emptyContainer: {
    backgroundColor:
      COLORS.white,

    padding:
      SPACING.lg,

    borderRadius: 12,

    alignItems: "center",
  },

  emptyTitle: {
    ...TYPOGRAPHY.headingSmall,

    color:
      COLORS.primaryTeal,

    marginBottom:
      SPACING.sm,
  },

  emptyText: {
    ...TYPOGRAPHY.body,

    color:
      COLORS.black,

    textAlign: "center",
  },
});