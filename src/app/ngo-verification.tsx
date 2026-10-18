/**
 * NGO Verification Screen
 *
 * Displays the NGO's current verification status.
 *
 * NGOs must be approved before they can
 * reserve available donations.
 *
 * This screen uses a responsive mobile layout
 * so that content remains correctly positioned
 * across different device sizes.
 */

import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import {
  router,
} from "expo-router";

import {
  COLORS,
  SPACING,
  TYPOGRAPHY,
} from "../theme";

import { NGO_STATUS } from "../constants/roles";

export default function NgoVerification() {
  /**
   * Temporary verification status.
   *
   * This will later be replaced with the
   * authenticated NGO's actual Firestore
   * verification status.
   */
  const verificationStatus =
    NGO_STATUS.APPROVED;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={
          styles.container
        }
        showsVerticalScrollIndicator={
          false
        }
      >
        {/*
         * Back navigation.
         *
         * Returns to the screen that opened
         * NGO Verification, normally the
         * NGO Dashboard.
         */}
        <TouchableOpacity
          style={styles.backButton}
          activeOpacity={0.7}
          onPress={() =>
            router.back()
          }
        >
          <Text style={styles.backButtonText}>
            ← Back to Dashboard
          </Text>
        </TouchableOpacity>

        {/* Screen heading */}
        <Text style={styles.heading}>
          NGO Verification
        </Text>

        <Text style={styles.subtitle}>
          View your organisation's current
          verification information.
        </Text>

        {/*
         * Verification status card.
         */}
        <View style={styles.card}>
          <Text style={styles.label}>
            Verification Status
          </Text>

          <Text style={styles.status}>
            {verificationStatus}
          </Text>

          <View style={styles.divider} />

          <Text style={styles.info}>
            Your organisation has been verified
            and is eligible to reserve available
            donations.
          </Text>
        </View>

        {/*
         * Additional explanatory information.
         */}
        <View style={styles.informationCard}>
          <Text style={styles.informationTitle}>
            What does this mean?
          </Text>

          <Text style={styles.informationText}>
            Your NGO account has approval to use
            the donation reservation features
            available in Servd.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/**
 * Responsive NGO Verification styles.
 *
 * No fixed screen or card dimensions are used,
 * allowing the screen to adapt to different
 * mobile device sizes.
 */
const styles = StyleSheet.create({
  /**
   * Keeps the interface inside the
   * device's safe display area.
   */
  safeArea: {
    flex: 1,

    backgroundColor:
      COLORS.offWhite,
  },

  /**
   * Scrollable page container.
   */
  container: {
    flexGrow: 1,

    width: "100%",

    backgroundColor:
      COLORS.offWhite,

    paddingHorizontal:
      SPACING.lg,

    paddingTop:
      SPACING.sm,

    paddingBottom:
      SPACING.xl,
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
      SPACING.xs,

    flexShrink: 1,
  },

  /**
   * Supporting text beneath the heading.
   */
  subtitle: {
    ...TYPOGRAPHY.body,

    color:
      COLORS.black,

    marginBottom:
      SPACING.lg,

    flexShrink: 1,
  },

  /**
   * Main verification card.
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

    elevation: 2,

    shadowColor:
      "#000000",

    shadowOffset: {
      width: 0,
      height: 1,
    },

    shadowOpacity: 0.08,

    shadowRadius: 3,
  },

  label: {
    ...TYPOGRAPHY.body,

    color:
      COLORS.black,

    fontWeight:
      "600",

    marginBottom:
      SPACING.xs,

    flexShrink: 1,
  },

  /**
   * Approved status is emphasised visually.
   */
  status: {
    ...TYPOGRAPHY.headingMedium,

    color:
      COLORS.primaryGreen,

    marginBottom:
      SPACING.md,

    flexShrink: 1,
  },

  /**
   * Separates the status from
   * the explanatory text.
   */
  divider: {
    width: "100%",

    height: 1,

    backgroundColor:
      COLORS.beige,

    marginBottom:
      SPACING.md,
  },

  info: {
    ...TYPOGRAPHY.body,

    color:
      COLORS.black,

    lineHeight: 22,

    flexShrink: 1,
  },

  /**
   * Secondary information card.
   */
  informationCard: {
    width: "100%",

    backgroundColor:
      COLORS.beige,

    padding:
      SPACING.lg,

    borderRadius: 12,
  },

  informationTitle: {
    ...TYPOGRAPHY.headingSmall,

    color:
      COLORS.primaryTeal,

    marginBottom:
      SPACING.sm,

    flexShrink: 1,
  },

  informationText: {
    ...TYPOGRAPHY.body,

    color:
      COLORS.black,

    lineHeight: 22,

    flexShrink: 1,
  },
});
``