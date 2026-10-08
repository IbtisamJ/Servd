/**
 * Donation Details Screen
 *
 * Displays detailed donation information
 * and allows an NGO to reserve a donation.
 */

import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { router } from "expo-router";

import {
  COLORS,
  SPACING,
  TYPOGRAPHY,
} from "../theme";

export default function DonationDetails() {
  const donation = {
    foodName: "Fresh Bread",
    category: "Bakery",
    description:
      "Fresh bread available for collection.",
    quantity: 20,
    collectionLocation: "Grassy Park",
    status: "Available",
  };

  const handleReserveDonation = () => {
    Alert.alert(
      "Success",
      "Donation reserved successfully."
    );

    router.push("/my-reservations");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>
        Donation Details
      </Text>

      <View style={styles.card}>
        <Text style={styles.label}>
          Food Name
        </Text>
        <Text style={styles.value}>
          {donation.foodName}
        </Text>

        <Text style={styles.label}>
          Category
        </Text>
        <Text style={styles.value}>
          {donation.category}
        </Text>

        <Text style={styles.label}>
          Description
        </Text>
        <Text style={styles.value}>
          {donation.description}
        </Text>

        <Text style={styles.label}>
          Quantity
        </Text>
        <Text style={styles.value}>
          {donation.quantity}
        </Text>

        <Text style={styles.label}>
          Collection Location
        </Text>
        <Text style={styles.value}>
          {donation.collectionLocation}
        </Text>

        <Text style={styles.label}>
          Status
        </Text>
        <Text style={styles.status}>
          {donation.status}
        </Text>
      </View>

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
    marginTop: 10,
  },

  value: {
    ...TYPOGRAPHY.body,
  },

  status: {
    ...TYPOGRAPHY.body,
    color: COLORS.primaryGreen,
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