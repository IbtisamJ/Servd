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
  const verificationStatus =
    NGO_STATUS.APPROVED;

  const statusColor =
    verificationStatus === NGO_STATUS.APPROVED
      ? COLORS.primaryGreen
      : verificationStatus === NGO_STATUS.REJECTED
      ? COLORS.primaryRed
      : COLORS.primaryTeal;

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>
        NGO Verification
      </Text>

      <View style={styles.card}>
        <Text style={styles.label}>
          Verification Status
        </Text>

        <Text
          style={[
            styles.status,
            {
              color: statusColor,
            },
          ]}
        >
          {verificationStatus}
        </Text>

        <Text style={styles.info}>
          Only approved NGOs may reserve
          donations.
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
    borderRadius: 12,
    padding: SPACING.lg,
  },

  label: {
    ...TYPOGRAPHY.body,
    marginBottom: 10,
  },

  status: {
    ...TYPOGRAPHY.headingMedium,
    marginBottom: 16,
  },

  info: {
    ...TYPOGRAPHY.body,
    color: COLORS.black,
  },
});