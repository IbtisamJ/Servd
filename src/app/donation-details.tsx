/**
 * Donation Details Screen
 *
 * Displays information for the donation selected
 * on the Available Donations screen.
 *
 * An authenticated NGO can reserve an
 * available donation.
 */

import {
  useState,
} from "react";

import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
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
  auth,
} from "../config/firebase";

import {
  reserveDonationForNGO,
} from "../services/reservationService";

import {
  DONATION_STATUS,
} from "../constants/donationStatus";

import {
  COLORS,
  SPACING,
  TYPOGRAPHY,
} from "../theme";

export default function DonationDetails() {
  /**
   * Donation information received from
   * Available Donations through Expo Router.
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

  /**
   * Prevents repeated reservation attempts
   * while Firestore is processing the request.
   */
  const [isReserving, setIsReserving] =
    useState(false);

  /**
   * Reserves the selected donation for the
   * currently authenticated NGO.
   *
   * The Firebase Authentication UID is saved
   * as the ngoId on the Reservation document.
   */
  const handleReserveDonation =
    async () => {
      /**
       * Make sure the required donation
       * identifiers were received.
       */
      if (
        !documentId ||
        !donationId
      ) {
        Alert.alert(
          "Reservation Error",
          "Donation information is incomplete."
        );

        return;
      }

      /**
       * Only an Available donation may
       * be reserved.
       */
      if (
        status !==
        DONATION_STATUS.AVAILABLE
      ) {
        Alert.alert(
          "Unavailable Donation",
          "This donation is no longer available for reservation."
        );

        return;
      }

      /**
       * Retrieve the currently authenticated
       * Firebase user.
       */
      const currentUser =
        auth.currentUser;

      /**
       * An unauthenticated user must not
       * create a reservation.
       */
      if (!currentUser) {
        Alert.alert(
          "Authentication Required",
          "Please log in before reserving a donation."
        );

        return;
      }

      /**
       * The authenticated Firebase UID now
       * identifies the NGO creating the
       * reservation.
       *
       * This replaces the old development
       * value:
       *
       * NGO001
       */
      const ngoId =
        currentUser.uid;

      try {
        setIsReserving(true);

        /**
         * Creates the Reservation and changes
         * the Donation status:
         *
         * Available -> Reserved
         */
        await reserveDonationForNGO(
          documentId,
          donationId,
          ngoId,
          foodName ?? "",
          collectionLocation ?? ""
        );

        /**
         * Confirm the successful reservation
         * and provide a direct route to
         * My Reservations.
         */
        Alert.alert(
          "Reservation Successful",
          `${
            foodName ||
            "The donation"
          } has been reserved successfully.`,
          [
            {
              text:
                "View Reservations",

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

        /**
         * Display the Firestore/service error
         * when one is available.
         */
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
         * Returns to Available Donations
         * when arriving from that screen.
         */}
        <TouchableOpacity
          style={styles.backButton}
          activeOpacity={0.7}
          onPress={() =>
            router.back()
          }
        >
          <Text style={styles.backButtonText}>
            ← Back to Donations
          </Text>
        </TouchableOpacity>

        {/* Screen heading */}
        <Text style={styles.heading}>
          Donation Details
        </Text>

        {/*
         * Selected donation information.
         */}
        <View style={styles.card}>
          {/* Food Name */}
          <View style={styles.detailSection}>
            <Text style={styles.label}>
              Food Name
            </Text>

            <Text style={styles.value}>
              {foodName ||
                "Not specified"}
            </Text>
          </View>

          <View style={styles.divider} />

          {/* Category */}
          <View style={styles.detailSection}>
            <Text style={styles.label}>
              Category
            </Text>

            <Text style={styles.value}>
              {category ||
                "Not specified"}
            </Text>
          </View>

          <View style={styles.divider} />

          {/* Description */}
          <View style={styles.detailSection}>
            <Text style={styles.label}>
              Description
            </Text>

            <Text style={styles.value}>
              {description ||
                "No description provided."}
            </Text>
          </View>

          <View style={styles.divider} />

          {/* Quantity */}
          <View style={styles.detailSection}>
            <Text style={styles.label}>
              Quantity
            </Text>

            <Text style={styles.value}>
              {quantity ||
                "Not specified"}
            </Text>
          </View>

          <View style={styles.divider} />

          {/* Collection Location */}
          <View style={styles.detailSection}>
            <Text style={styles.label}>
              Collection Location
            </Text>

            <Text style={styles.value}>
              {collectionLocation ||
                "Not specified"}
            </Text>
          </View>

          <View style={styles.divider} />

          {/* Servd Donation ID */}
          <View style={styles.detailSection}>
            <Text style={styles.label}>
              Donation ID
            </Text>

            <Text style={styles.value}>
              {donationId ||
                "Not specified"}
            </Text>
          </View>

          <View style={styles.divider} />

          {/* Current Donation Status */}
          <View style={styles.detailSection}>
            <Text style={styles.label}>
              Status
            </Text>

            <Text style={styles.status}>
              {status ||
                "Unknown"}
            </Text>
          </View>
        </View>

        {/*
         * Reservation button.
         *
         * The button is disabled while the
         * Firestore operation is running.
         */}
        <TouchableOpacity
          style={[
            styles.button,

            isReserving &&
              styles.disabledButton,
          ]}
          activeOpacity={0.8}
          disabled={isReserving}
          onPress={
            handleReserveDonation
          }
        >
          {isReserving ? (
            <ActivityIndicator
              color={
                COLORS.white
              }
            />
          ) : (
            <Text style={styles.buttonText}>
              Reserve Donation
            </Text>
          )}
        </TouchableOpacity>

        <Text style={styles.helperText}>
          Reserving this donation will add it
          to your NGO's reservations.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

/**
 * Responsive Donation Details styling.
 *
 * The screen does not use fixed card or
 * page widths, allowing it to adapt to
 * different mobile devices.
 */
const styles = StyleSheet.create({
  /**
   * Keeps content inside the device's
   * safe display area.
   */
  safeArea: {
    flex: 1,

    backgroundColor:
      COLORS.offWhite,
  },

  /**
   * Scrollable screen container.
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
   * Main screen heading.
   */
  heading: {
    ...TYPOGRAPHY.headingLarge,

    color:
      COLORS.primaryTeal,

    marginBottom:
      SPACING.lg,

    flexShrink: 1,
  },

  /**
   * Donation information card.
   */
  card: {
    width: "100%",

    backgroundColor:
      COLORS.white,

    padding:
      SPACING.lg,

    borderRadius: 12,

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

  /**
   * Container for each donation field.
   */
  detailSection: {
    width: "100%",

    paddingVertical:
      SPACING.sm,
  },

  label: {
    ...TYPOGRAPHY.body,

    color:
      COLORS.black,

    fontWeight:
      "bold",

    marginBottom:
      SPACING.xs,

    flexShrink: 1,
  },

  value: {
    ...TYPOGRAPHY.body,

    color:
      COLORS.black,

    flexShrink: 1,
  },

  status: {
    ...TYPOGRAPHY.body,

    color:
      COLORS.primaryGreen,

    fontWeight:
      "bold",

    flexShrink: 1,
  },

  /**
   * Separates donation information fields.
   */
  divider: {
    width: "100%",

    height: 1,

    backgroundColor:
      COLORS.beige,
  },

  /**
   * Responsive full-width reservation button.
   */
  button: {
    width: "100%",

    minHeight: 52,

    justifyContent:
      "center",

    alignItems:
      "center",

    backgroundColor:
      COLORS.primaryTeal,

    paddingHorizontal:
      SPACING.md,

    paddingVertical:
      SPACING.md,

    borderRadius: 10,

    marginTop:
      SPACING.lg,
  },

  /**
   * Applied while a reservation is
   * being processed.
   */
  disabledButton: {
    opacity: 0.65,
  },

  buttonText: {
    ...TYPOGRAPHY.button,

    color:
      COLORS.white,

    textAlign:
      "center",

    flexShrink: 1,
  },

  /**
   * Supporting text displayed underneath
   * the Reserve Donation button.
   */
  helperText: {
    ...TYPOGRAPHY.body,

    color:
      COLORS.black,

    textAlign:
      "center",

    marginTop:
      SPACING.sm,

    paddingHorizontal:
      SPACING.sm,

    opacity: 0.75,

    flexShrink: 1,
  },
});