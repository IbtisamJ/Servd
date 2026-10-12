/**
 * NGO Dashboard Screen
 *
 * Displays:
 * - Verification status
 * - Navigation to available donations
 * - Navigation to reservations
 * - Navigation to NGO verification details
 */

import {
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

export default function NGODashboard() {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>
        NGO Dashboard
      </Text>

      {/* NGO Verification Status */}
      <View style={styles.card}>
        <Text style={styles.label}>
          Verification Status
        </Text>

        <Text style={styles.value}>
          Approved
        </Text>
      </View>

      {/* Browse available donations */}
      <TouchableOpacity
        style={styles.button}
        onPress={() =>
          router.push("/available-donations")
        }
      >
        <Text style={styles.buttonText}>
          Browse Donations
        </Text>
      </TouchableOpacity>

      {/* View reservations */}
      <TouchableOpacity
        style={styles.button}
        onPress={() =>
          router.push("/my-reservations")
        }
      >
        <Text style={styles.buttonText}>
          View Reservations
        </Text>
      </TouchableOpacity>

      {/* View NGO verification details */}
      <TouchableOpacity
        style={styles.button}
        onPress={() =>
          router.push("/ngo-verification")
        }
      >
        <Text style={styles.buttonText}>
          NGO Verification
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: SPACING.lg,
    backgroundColor: COLORS.offWhite,
  },

  heading: {
    ...TYPOGRAPHY.headingLarge,
    color: COLORS.primaryTeal,
    marginBottom: SPACING.lg,
  },

  card: {
    backgroundColor: COLORS.beige,
    padding: SPACING.md,
    borderRadius: 12,
    marginBottom: SPACING.lg,
  },

  label: {
    ...TYPOGRAPHY.body,
  },

  value: {
    ...TYPOGRAPHY.headingSmall,
    color: COLORS.primaryGreen,
  },

  button: {
    backgroundColor: COLORS.primaryTeal,
    padding: SPACING.md,
    borderRadius: 10,
    marginBottom: SPACING.md,
  },

  buttonText: {
    ...TYPOGRAPHY.button,
    textAlign: "center",
    color: COLORS.white,
  },
});