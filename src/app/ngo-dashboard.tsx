import { router } from "expo-router";
import {
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

export default function NGODashboard() {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>
        NGO Dashboard
      </Text>

      <View style={styles.card}>
        <Text style={styles.label}>
          Verification Status
        </Text>

        <Text style={styles.value}>
          Approved
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>
          Available Donations
        </Text>

        <Text style={styles.value}>
          0
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>
          My Reservations
        </Text>

        <Text style={styles.value}>
          0
        </Text>
      </View>

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
    borderRadius: 10,
    marginBottom: SPACING.md,
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
    marginTop: SPACING.md,
  },

  buttonText: {
    color: COLORS.white,
    textAlign: "center",
    ...TYPOGRAPHY.button,
  },
});