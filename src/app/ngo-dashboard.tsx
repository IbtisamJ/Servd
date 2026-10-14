/**
 * NGO Dashboard Screen
 *
 * Main landing screen for an authenticated
 * and approved NGO user.
 *
 * Provides access to:
 * - Available donations
 * - NGO reservations
 * - NGO verification information
 *
 * The layout is responsive so that it displays
 * correctly across different mobile screen sizes.
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

export default function NGODashboard() {
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
         * Main screen heading.
         *
         * No Back button is displayed because
         * this is the NGO's main landing screen.
         */}
        <Text style={styles.heading}>
          NGO Dashboard
        </Text>

        <Text style={styles.subtitle}>
          Manage donations, reservations and
          your organisation verification.
        </Text>

        {/*
         * Verification Status Card
         *
         * Currently displays Approved because
         * the dashboard is reached after the
         * authentication verification check.
         *
         * This can later be connected directly
         * to the authenticated NGO record.
         */}
        <View style={styles.statusCard}>
          <Text style={styles.label}>
            Verification Status
          </Text>

          <Text style={styles.value}>
            Approved
          </Text>
        </View>

        {/*
         * Section heading for the NGO's
         * main application functions.
         */}
        <Text style={styles.sectionHeading}>
          NGO Services
        </Text>

        {/*
         * Browse Donations
         *
         * Opens the list of Firestore donations
         * whose status is currently Available.
         */}
        <TouchableOpacity
          style={styles.button}
          activeOpacity={0.8}
          onPress={() =>
            router.push(
              "/available-donations"
            )
          }
        >
          <View style={styles.buttonContent}>
            <Text style={styles.buttonTitle}>
              Browse Donations
            </Text>

            <Text style={styles.buttonDescription}>
              View food donations currently
              available for reservation.
            </Text>
          </View>

          <Text style={styles.arrow}>
            ›
          </Text>
        </TouchableOpacity>

        {/*
         * View Reservations
         *
         * Opens reservations associated with
         * the NGO reservation workflow.
         */}
        <TouchableOpacity
          style={styles.button}
          activeOpacity={0.8}
          onPress={() =>
            router.push(
              "/my-reservations"
            )
          }
        >
          <View style={styles.buttonContent}>
            <Text style={styles.buttonTitle}>
              View Reservations
            </Text>

            <Text style={styles.buttonDescription}>
              Track reserved donations and
              collection statuses.
            </Text>
          </View>

          <Text style={styles.arrow}>
            ›
          </Text>
        </TouchableOpacity>

        {/*
         * NGO Verification
         *
         * Opens the NGO verification
         * information screen.
         */}
        <TouchableOpacity
          style={styles.button}
          activeOpacity={0.8}
          onPress={() =>
            router.push(
              "/ngo-verification"
            )
          }
        >
          <View style={styles.buttonContent}>
            <Text style={styles.buttonTitle}>
              NGO Verification
            </Text>

            <Text style={styles.buttonDescription}>
              View your organisation's
              verification information.
            </Text>
          </View>

          <Text style={styles.arrow}>
            ›
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

/**
 * Responsive NGO Dashboard styles.
 *
 * No fixed card widths or heights are used.
 * Components therefore adapt to the available
 * width of the user's mobile device.
 */
const styles = StyleSheet.create({
  /**
   * Prevents the interface from sitting
   * underneath system UI areas.
   */
  safeArea: {
    flex: 1,
    backgroundColor:
      COLORS.offWhite,
  },

  /**
   * Scrollable main container.
   *
   * flexGrow ensures the screen still fills
   * the device when content is short.
   */
  container: {
    flexGrow: 1,

    width: "100%",

    backgroundColor:
      COLORS.offWhite,

    paddingHorizontal:
      SPACING.lg,

    paddingTop:
      SPACING.md,

    paddingBottom:
      SPACING.xl,
  },

  /**
   * Main page heading.
   */
  heading: {
    ...TYPOGRAPHY.headingLarge,

    color:
      COLORS.primaryTeal,

    marginTop:
      SPACING.sm,

    marginBottom:
      SPACING.xs,

    flexShrink: 1,
  },

  /**
   * Supporting introductory text.
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
   * Verification status card.
   *
   * Width adapts automatically to
   * the mobile device.
   */
  statusCard: {
    width: "100%",

    backgroundColor:
      COLORS.beige,

    padding:
      SPACING.lg,

    borderRadius: 12,

    marginBottom:
      SPACING.lg,

    elevation: 2,

    shadowColor:
      "#000000",

    shadowOffset: {
      width: 0,
      height: 1,
    },

    shadowOpacity:
      0.08,

    shadowRadius:
      3,
  },

  label: {
    ...TYPOGRAPHY.body,

    color:
      COLORS.black,

    marginBottom:
      SPACING.xs,

    flexShrink: 1,
  },

  value: {
    ...TYPOGRAPHY.headingSmall,

    color:
      COLORS.primaryGreen,

    flexShrink: 1,
  },

  /**
   * Separates the verification card
   * from the main NGO functions.
   */
  sectionHeading: {
    ...TYPOGRAPHY.headingSmall,

    color:
      COLORS.primaryTeal,

    marginBottom:
      SPACING.md,
  },

  /**
   * Responsive dashboard navigation card.
   *
   * Using width: "100%" avoids fixed-width
   * layout problems on differently sized phones.
   */
  button: {
    width: "100%",

    minHeight: 76,

    flexDirection:
      "row",

    alignItems:
      "center",

    justifyContent:
      "space-between",

    backgroundColor:
      COLORS.primaryTeal,

    paddingHorizontal:
      SPACING.lg,

    paddingVertical:
      SPACING.md,

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

    shadowOpacity:
      0.08,

    shadowRadius:
      3,
  },

  /**
   * Allows button text to occupy available
   * space while leaving room for the arrow.
   */
  buttonContent: {
    flex: 1,
    paddingRight:
      SPACING.md,
  },

  buttonTitle: {
    ...TYPOGRAPHY.button,

    color:
      COLORS.white,

    marginBottom:
      SPACING.xs,

    flexShrink: 1,
  },

  buttonDescription: {
    ...TYPOGRAPHY.body,

    color:
      COLORS.white,

    opacity: 0.9,

    flexShrink: 1,
  },

  arrow: {
    color:
      COLORS.white,

    fontSize: 30,

    lineHeight: 32,

    fontWeight: "300",
  },
});
