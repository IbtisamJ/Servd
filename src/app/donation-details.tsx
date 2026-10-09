/**
 * Donation Details Screen
 *
 * Displays information for the donation selected
 * on the Available Donations screen.
 *
 * An NGO can also reserve an available donation.
 */

import {
  useState,
} from "react";

import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import {
  router,
  useLocalSearchParams,
} from "expo-router";

import {
  reserveDonationForNGO,
} from "../services/reservationService";

import {
  COLORS,
  SPACING,
  TYPOGRAPHY,
} from "../theme";

export default function DonationDetails() {
  /**
   * Donation information received through
   * Expo Router from Available Donations.
   */
  const {
    documentId,
    donationId,
    foodName,
    category,
    description,
    quantity,
    collectionLocation,
    status,
  } = useLocalSearchParams<{
    documentId: string;
    donationId: string;
    foodName: string;
    category: string;
    description: string;
    quantity: string;
    collectionLocation: string;
    status: string;
  }>();

  // Prevents multiple button presses while
  // the Firestore operation is running.
  const [isReserving, setIsReserving] =
    useState(false);

  /**
   * Reserves the selected donation.
   *
   * A Reservation document is created and
   * the corresponding Donation becomes Reserved.
   */
  const handleReserveDonation =
    async () => {
      if (!documentId || !donationId) {
        Alert.alert(
          "Reservation Error",
          "Donation information is incomplete."
        );

        return;
      }

      if (status !== "Available") {
        Alert.alert(
          "Unavailable Donation",
          "This donation is no longer available for reservation."
        );

        return;
      }

      try {
        setIsReserving(true);

        /**
         * Temporary NGO identifier for development.
         *
         * Replace this with the authenticated NGO's
         * identifier when the team integrates
         * authentication/user profiles.
         */
        const ngoId = "NGO001";

        await reserveDonationForNGO(
          documentId,
          donationId,
          ngoId,
          foodName ?? "",
          collectionLocation ?? ""
        );

        Alert.alert(
          "Reservation Successful",
          `${foodName} has been reserved successfully.`,
          [
            {
              text: "View Reservations",
              onPress: () =>
                router.replace(
                  "/my-reservations"
                ),
            },
          ]
        );
      } catch (error) {
        console.error(
          "Reservation error:",
          error
        );

        const message =
          error instanceof Error
            ? error.message
            : "The reservation could not be completed.";

        Alert.alert(
          "Reservation Failed",
          message
        );
      } finally {
        setIsReserving(false);
      }
    };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>
        Donation Details
      </Text>

      {/* Selected donation information */}
      <View style={styles.card}>
        <Text style={styles.label}>
          Food Name
        </Text>
        <Text style={styles.value}>
          {foodName}
        </Text>

        <Text style={styles.label}>
          Category
        </Text>
        <Text style={styles.value}>
          {category}
        </Text>

        <Text style={styles.label}>
          Description
        </Text>
        <Text style={styles.value}>
          {description}
        </Text>

        <Text style={styles.label}>
          Quantity
        </Text>
        <Text style={styles.value}>
          {quantity}
        </Text>

        <Text style={styles.label}>
          Collection Location
        </Text>
        <Text style={styles.value}>
          {collectionLocation}
        </Text>

        <Text style={styles.label}>
          Donation ID
        </Text>
        <Text style={styles.value}>
          {donationId}
        </Text>

        <Text style={styles.label}>
          Status
        </Text>
        <Text style={styles.status}>
          {status}
        </Text>
      </View>

      {/* Reservation action */}
      <TouchableOpacity
        style={[
          styles.button,
          isReserving &&
            styles.disabledButton,
        ]}
        disabled={isReserving}
        onPress={handleReserveDonation}
      >
        {isReserving ? (
          <ActivityIndicator
            color={COLORS.white}
          />
        ) : (
          <Text style={styles.buttonText}>
            Reserve Donation
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.offWhite,
    padding: SPACING.lg,
  },

  heading: {
    ...TYPOGRAPHY.headingLarge,
    color: COLORS.primaryTeal,
    marginBottom: SPACING.lg,
  },

  card: {
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: 12,
  },

  label: {
    ...TYPOGRAPHY.body,
    fontWeight: "bold",
    marginTop: 12,
  },

  value: {
    ...TYPOGRAPHY.body,
    marginTop: 4,
  },

  status: {
    ...TYPOGRAPHY.body,
    color: COLORS.primaryGreen,
    marginTop: 4,
  },

  button: {
    backgroundColor:
      COLORS.primaryTeal,
    padding: SPACING.md,
    borderRadius: 10,
    marginTop: SPACING.lg,
    minHeight: 52,
    justifyContent: "center",
  },

  disabledButton: {
    opacity: 0.65,
  },

  buttonText: {
    ...TYPOGRAPHY.button,
    color: COLORS.white,
    textAlign: "center",
  },
});