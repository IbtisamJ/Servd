/**
 * NGO Verification Screen
 *
 * Displays the NGO verification status.
 * NGOs must be approved before they can
 * reserve donations.
 */

import {
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  COLORS,
  SPACING,
  TYPOGRAPHY,
} from "../theme";

import {
  NGO_STATUS,
} from "../constants/ngoStatus";

export default function NgoVerification() {
  /**
   * Temporary test status
   */
  const verificationStatus =
    NGO_STATUS.APPROVED;

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>
        NGO Verification
      </Text>

      <View style={styles.card}>
        <Text style={styles.label}>
          Verification Status
        </Text>

        <Text style={styles.status}>
          {verificationStatus}
        </Text>

        <Text style={styles.info}>
          Your organisation has been
          verified and is eligible to
          reserve available donations.
        </Text>
      </View>
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
    padding: SPACING.lg,
    borderRadius: 12,
  },

  label: {
    ...TYPOGRAPHY.body,
    marginBottom: 10,
  },

  status: {
    ...TYPOGRAPHY.headingMedium,
    color: COLORS.primaryGreen,
    marginBottom: SPACING.md,
  },

  info: {
    ...TYPOGRAPHY.body,
    color: COLORS.black,
    lineHeight: 22,
  },
});