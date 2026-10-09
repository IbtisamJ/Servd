/**
 * My Reservations Screen
 *
 * Displays reservations belonging to the NGO and
 * allows the NGO to track and update collection status.
 *
 * Supported reservation statuses:
 * - Active
 * - Collected
 * - Cancelled
 *
 * Active reservations can be:
 * - Marked as Collected
 * - Cancelled
 */

import {
  useCallback,
  useState,
} from "react";

import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import {
  useFocusEffect,
} from "expo-router";

import {
  cancelReservation,
  getReservations,
  markReservationCollected,
} from "../services/reservationService";

import {
  RESERVATION_STATUS,
} from "../constants/reservationStatus";

import {
  COLORS,
  SPACING,
  TYPOGRAPHY,
} from "../theme";

export default function MyReservations() {
  // Stores reservation records retrieved from Firestore.
  const [reservations, setReservations] =
    useState<any[]>([]);

  // Controls the loading indicator.
  const [loading, setLoading] =
    useState(true);

  // Stores the reservation currently being updated.
  // This prevents users from pressing update buttons repeatedly.
  const [updatingId, setUpdatingId] =
    useState<string | null>(null);

  /**
   * Retrieves reservations from Firestore.
   *
   * This function refreshes the screen after
   * collection or cancellation updates as well.
   */
  const loadReservations =
    useCallback(async () => {
      try {
        setLoading(true);

        const data =
          await getReservations();

        setReservations(data);

      } catch (error) {
        console.error(
          "Error loading reservations:",
          error
        );

        Alert.alert(
          "Loading Error",
          "Your reservations could not be loaded."
        );

      } finally {
        setLoading(false);
      }
    }, []);

  /**
   * Reload reservations whenever the user
   * returns to this screen.
   *
   * This means a newly created reservation
   * should appear without restarting the app.
   */
  useFocusEffect(
    useCallback(() => {
      loadReservations();
    }, [loadReservations])
  );

  /**
   * Marks an Active reservation as Collected.
   *
   * The service also changes the associated
   * Donation from Reserved to Collected.
   */
  const handleMarkCollected =
    async (item: any) => {

      // Both Firestore document IDs are needed
      // to update the linked records.
      if (
        !item.id ||
        !item.donationDocumentId
      ) {
        Alert.alert(
          "Update Error",
          "The reservation does not contain all the information required for this update."
        );

        return;
      }

      try {
        setUpdatingId(item.id);

        await markReservationCollected(
          item.id,
          item.donationDocumentId
        );

        Alert.alert(
          "Collection Updated",
          `${item.foodName || "The donation"} has been marked as collected.`
        );

        // Refresh the list so the new status is visible.
        await loadReservations();

      } catch (error) {
        console.error(
          "Collection update error:",
          error
        );

        const message =
          error instanceof Error
            ? error.message
            : "The reservation could not be marked as collected.";

        Alert.alert(
          "Update Failed",
          message
        );

      } finally {
        setUpdatingId(null);
      }
    };

  /**
   * Cancels an Active reservation.
   *
   * The service changes:
   *
   * Reservation:
   * Active -> Cancelled
   *
   * Donation:
   * Reserved -> Available
   *
   * This makes the donation available
   * to other eligible NGOs again.
   */
  const handleCancelReservation =
    async (item: any) => {

      if (
        !item.id ||
        !item.donationDocumentId
      ) {
        Alert.alert(
          "Cancellation Error",
          "The reservation does not contain all the information required for cancellation."
        );

        return;
      }

      /**
       * Ask for confirmation before performing
       * the cancellation.
       */
      Alert.alert(
        "Cancel Reservation",
        `Are you sure you want to cancel the reservation for ${item.foodName || "this donation"}?`,
        [
          {
            text: "Keep Reservation",
            style: "cancel",
          },

          {
            text: "Cancel Reservation",
            style: "destructive",

            onPress: async () => {
              try {
                setUpdatingId(
                  item.id
                );

                await cancelReservation(
                  item.id,
                  item.donationDocumentId
                );

                Alert.alert(
                  "Reservation Cancelled",
                  "The reservation has been cancelled and the donation is available again."
                );

                // Refresh after the Firestore update.
                await loadReservations();

              } catch (error) {
                console.error(
                  "Reservation cancellation error:",
                  error
                );

                const message =
                  error instanceof Error
                    ? error.message
                    : "The reservation could not be cancelled.";

                Alert.alert(
                  "Cancellation Failed",
                  message
                );

              } finally {
                setUpdatingId(
                  null
                );
              }
            },
          },
        ]
      );
    };

  /**
   * Returns the appropriate colour for
   * each reservation status.
   */
  const getStatusColor = (
    status: string
  ) => {
    switch (status) {
      case RESERVATION_STATUS.COLLECTED:
        return COLORS.primaryGreen;

      case RESERVATION_STATUS.CANCELLED:
        return COLORS.primaryRed;

      default:
        return COLORS.primaryTeal;
    }
  };

  /**
   * Display a loading indicator while
   * reservation data is being retrieved.
   */
  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator
          size="large"
          color={COLORS.primaryTeal}
        />

        <Text style={styles.loadingText}>
          Loading reservations...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Screen heading */}
      <Text style={styles.heading}>
        My Reservations
      </Text>

      {reservations.length === 0 ? (
        /**
         * Empty state shown if the NGO
         * currently has no reservations.
         */
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>
            No Reservations Yet
          </Text>

          <Text style={styles.emptyText}>
            Your reserved donations will appear here.
          </Text>
        </View>
      ) : (
        <FlatList
          data={reservations}

          keyExtractor={(item) =>
            item.id
          }

          showsVerticalScrollIndicator={
            false
          }

          renderItem={({ item }) => {
            const isUpdating =
              updatingId === item.id;

            const isActive =
              item.status ===
              RESERVATION_STATUS.ACTIVE;

            return (
              <View style={styles.card}>
                {/* Food name */}
                <Text style={styles.title}>
                  {item.foodName ||
                    "Reserved Donation"}
                </Text>

                {/* Servd Donation ID */}
                <Text style={styles.text}>
                  Donation ID:{" "}
                  {item.donationId ||
                    "Not available"}
                </Text>

                {/* Collection location */}
                <Text style={styles.text}>
                  Collection Location:{" "}
                  {item.collectionLocation ||
                    "Not available"}
                </Text>

                {/* Reservation status */}
                <Text
                  style={[
                    styles.status,
                    {
                      color:
                        getStatusColor(
                          item.status
                        ),
                    },
                  ]}
                >
                  Status:{" "}
                  {item.status ||
                    "Unknown"}
                </Text>

                {/**
                 * Only Active reservations
                 * can be collected or cancelled.
                 */}
                {isActive && (
                  <View style={styles.actions}>
                    {/* Mark as Collected */}
                    <TouchableOpacity
                      style={[
                        styles.collectButton,

                        isUpdating &&
                          styles.disabledButton,
                      ]}
                      disabled={isUpdating}
                      onPress={() =>
                        handleMarkCollected(
                          item
                        )
                      }
                    >
                      {isUpdating ? (
                        <ActivityIndicator
                          color={
                            COLORS.white
                          }
                        />
                      ) : (
                        <Text
                          style={
                            styles.buttonText
                          }
                        >
                          Mark as Collected
                        </Text>
                      )}
                    </TouchableOpacity>

                    {/* Cancel Reservation */}
                    <TouchableOpacity
                      style={[
                        styles.cancelButton,

                        isUpdating &&
                          styles.disabledButton,
                      ]}
                      disabled={isUpdating}
                      onPress={() =>
                        handleCancelReservation(
                          item
                        )
                      }
                    >
                      <Text
                        style={
                          styles.buttonText
                        }
                      >
                        Cancel Reservation
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: SPACING.lg,
    backgroundColor: COLORS.offWhite,
  },

  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
    marginBottom: SPACING.md,
  },

  title: {
    ...TYPOGRAPHY.headingSmall,
    color: COLORS.primaryGreen,
    marginBottom: SPACING.sm,
  },

  text: {
    ...TYPOGRAPHY.body,
    color: COLORS.black,
    marginBottom: SPACING.xs,
  },

  status: {
    ...TYPOGRAPHY.body,
    fontWeight: "bold",
    marginTop: SPACING.sm,
    marginBottom: SPACING.md,
  },

  actions: {
    marginTop: SPACING.sm,
  },

  collectButton: {
    backgroundColor: COLORS.primaryGreen,
    padding: SPACING.md,
    borderRadius: 10,
    minHeight: 50,
    justifyContent: "center",
    marginBottom: SPACING.sm,
  },

  cancelButton: {
    backgroundColor: COLORS.primaryRed,
    padding: SPACING.md,
    borderRadius: 10,
    minHeight: 50,
    justifyContent: "center",
  },

  disabledButton: {
    opacity: 0.6,
  },

  buttonText: {
    ...TYPOGRAPHY.button,
    color: COLORS.white,
    textAlign: "center",
  },

  loadingText: {
    ...TYPOGRAPHY.body,
    color: COLORS.black,
    marginTop: SPACING.md,
  },

  emptyContainer: {
    backgroundColor: COLORS.white,
    padding: SPACING.lg,
    borderRadius: 12,
    alignItems: "center",
  },

  emptyTitle: {
    ...TYPOGRAPHY.headingSmall,
    color: COLORS.primaryTeal,
    marginBottom: SPACING.sm,
  },

  emptyText: {
    ...TYPOGRAPHY.body,
    color: COLORS.black,
    textAlign: "center",
  },
});