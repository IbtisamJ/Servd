import {
    Alert,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import {
    COLORS,
    SPACING,
    TYPOGRAPHY,
} from "../theme";

import {
    createReservation,
} from "../services/reservationService";

import {
    RESERVATION_STATUS,
} from "../constants/reservationStatus";

export default function DonationDetails() {

  const donation = {
    id: "donation123",
    foodName: "Fresh Bread",
    category: "Bakery",
    description:
      "Surplus bread available for collection",
    quantity: 20,
    collectionLocation: "Cape Town",
    collectionDeadline: "2026-10-10",
    expiryDate: "2026-10-12",
    status: "Available",
  };

  const handleReserveDonation =
    async () => {

      try {

        await createReservation({
          donationId:
            donation.id,

          ngoId:
            "ngo123",

          status:
            RESERVATION_STATUS.ACTIVE,

          createdTimestamp:
            new Date(),

          updatedTimestamp:
            new Date(),
        });

        Alert.alert(
          "Success",
          "Donation reserved successfully"
        );

      } catch (error) {

        console.error(error);

        Alert.alert(
          "Error",
          "Unable to reserve donation"
        );

      }

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
          Collection Deadline
        </Text>
        <Text style={styles.value}>
          {donation.collectionDeadline}
        </Text>

        <Text style={styles.label}>
          Expiry Date
        </Text>
        <Text style={styles.value}>
          {donation.expiryDate}
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
        onPress={
          handleReserveDonation
        }
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

    borderRadius: 12,

    padding:
      SPACING.md,
  },

  label: {
    ...TYPOGRAPHY.body,
    fontWeight: "bold",
    marginTop: 10,
  },

  value: {
    ...TYPOGRAPHY.body,
    color:
      COLORS.black,
  },

  status: {
    ...TYPOGRAPHY.body,
    color:
      COLORS.primaryGreen,
  },

  button: {
    backgroundColor:
      COLORS.primaryTeal,

    marginTop:
      SPACING.lg,

    padding:
      SPACING.md,

    borderRadius: 12,
  },

  buttonText: {
    color:
      COLORS.white,

    textAlign:
      "center",

    ...TYPOGRAPHY.button,
  },
});
``