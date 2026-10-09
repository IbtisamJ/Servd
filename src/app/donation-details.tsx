/**
 * Donation Details Screen
 *
 * Displays detailed information about a
 * selected donation.
 *
 * Allows NGOs to view donation information
 * before reserving the donation.
 */

import {
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
  COLORS,
  SPACING,
  TYPOGRAPHY,
} from "../theme";

export default function DonationDetails() {
  /**
   * Retrieve donation information passed
   * from the Available Donations screen.
   */
  const {
    donationId,
    foodName,
    category,
    description,
    quantity,
    collectionLocation,
    status,
  } = useLocalSearchParams();

  /**
   * Handles reservation action.
   *
   * This is currently a placeholder implementation.
   * Later this can:
   * 1. Create a reservation document.
   * 2. Update the donation status to Reserved.
   * 3. Navigate to My Reservations.
   */
  const handleReserveDonation = () => {
    Alert.alert(
      "Reservation Successful",
      `${foodName} has been reserved.`
    );

    router.push("/my-reservations");
  };

  return (
    <View style={styles.container}>
      {/* Screen Heading */}
      <Text style={styles.heading}>
        Donation Details
      </Text>

      {/* Donation Information Card */}
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

      {/* Reserve Donation Button */}
      <TouchableOpacity
        style={styles.button}
        onPress={handleReserveDonation}
      >
        <Text style={styles.buttonText}>
          Reserve Donation
        </Text>
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
    backgroundColor: COLORS.primaryTeal,
    padding: SPACING.md,
    borderRadius: 10,
    marginTop: SPACING.lg,
  },

  buttonText: {
    ...TYPOGRAPHY.button,
    color: COLORS.white,
    textAlign: "center",
  },
});