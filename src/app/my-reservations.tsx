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
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import {
  router,
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
  /**
   * Stores reservation records retrieved
   * from Firestore.
   */
  const [reservations, setReservations] =
    useState<any[]>([]);

  /**
   * Controls the loading indicator.
   */
  const [loading, setLoading] =
    useState(true);

  /**
   * Stores the reservation currently
   * being updated.
   *
   * This prevents repeated button presses
   * while a Firestore update is running.
   */
  const [updatingId, setUpdatingId] =
    useState<string | null>(null);

  /**
   * Retrieves reservations from Firestore.
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
   * Refresh reservations when the user
   * returns to this screen.
   */
  useFocusEffect(
    useCallback(() => {
      loadReservations();
    }, [loadReservations])
  );

  /**
   * Marks an Active reservation as Collected.
   *
   * The associated Donation is also changed
   * from Reserved to Collected.
   */
  const handleMarkCollected =
    async (item: any) => {
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
          `${
            item.foodName ||
            "The donation"
          } has been marked as collected.`
        );

        /**
         * Refresh so the Collected status
         * appears immediately.
         */
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
   * Reservation:
   * Active -> Cancelled
   *
   * Donation:
   * Reserved -> Available
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
       * Ask for confirmation before the
       * Firestore records are changed.
       */
      Alert.alert(
        "Cancel Reservation",
        `Are you sure you want to cancel the reservation for ${
          item.foodName ||
          "this donation"
        }?`,
        [
          {
            text:
              "Keep Reservation",

            style:
              "cancel",
          },

          {
            text:
              "Cancel Reservation",

            style:
              "destructive",

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

                /**
                 * Refresh immediately after
                 * the Firestore update.
                 */
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
   * Returns a colour representing
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
   * Loading state.
   */
  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerContainer}>
          <ActivityIndicator
            size="large"
            color={
              COLORS.primaryTeal
            }
          />

          <Text style={styles.loadingText}>
            Loading reservations...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>

        {/*
         * Returns to the screen that opened
         * My Reservations, normally the NGO Dashboard.
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

        <Text style={styles.heading}>
          My Reservations
        </Text>

        {reservations.length === 0 ? (
          /**
           * Empty state.
           */
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>
              No Reservations Yet
            </Text>

            <Text style={styles.emptyText}>
              Your reserved donations will
              appear here.
            </Text>

            {/*
             * Gives the NGO a logical next
             * action from the empty state.
             */}
            <TouchableOpacity
              style={styles.browseButton}
              activeOpacity={0.8}
              onPress={() =>
                router.push(
                  "/available-donations"
                )
              }
            >
              <Text style={styles.buttonText}>
                Browse Donations
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={reservations}

            keyExtractor={(item) =>
              item.id
            }

            style={styles.list}

            contentContainerStyle={
              styles.listContent
            }

            showsVerticalScrollIndicator={
              false
            }

            renderItem={({ item }) => {
              const isUpdating =
                updatingId ===
                item.id;

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

                  <View style={styles.divider} />

                  {/* Servd Donation ID */}
                  <View style={styles.detailSection}>
                    <Text style={styles.label}>
                      Donation ID
                    </Text>

                    <Text style={styles.text}>
                      {item.donationId ||
                        "Not available"}
                    </Text>
                  </View>

                  {/* Collection location */}
                  <View style={styles.detailSection}>
                    <Text style={styles.label}>
                      Collection Location
                    </Text>

                    <Text style={styles.text}>
                      {item.collectionLocation ||
                        "Not available"}
                    </Text>
                  </View>

                  {/* Reservation status */}
                  <View style={styles.detailSection}>
                    <Text style={styles.label}>
                      Reservation Status
                    </Text>

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
                      {item.status ||
                        "Unknown"}
                    </Text>
                  </View>

                  {/*
                   * Only Active reservations
                   * can be collected or cancelled.
                   */}
                  {isActive && (
                    <View style={styles.actions}>
                      <TouchableOpacity
                        style={[
                          styles.collectButton,

                          isUpdating &&
                            styles.disabledButton,
                        ]}
                        activeOpacity={0.8}
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
                          <Text style={styles.buttonText}>
                            Mark as Collected
                          </Text>
                        )}
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[
                          styles.cancelButton,

                          isUpdating &&
                            styles.disabledButton,
                        ]}
                        activeOpacity={0.8}
                        disabled={isUpdating}
                        onPress={() =>
                          handleCancelReservation(
                            item
                          )
                        }
                      >
                        <Text style={styles.buttonText}>
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
    </SafeAreaView>
  );
}

/**
 * Responsive styles for the
 * My Reservations screen.
 */
const styles = StyleSheet.create({
  /**
   * Keeps content inside the mobile
   * device's safe display area.
   */
  safeArea: {
    flex: 1,
    backgroundColor:
      COLORS.offWhite,
  },

  /**
   * Main screen container.
   */
  container: {
    flex: 1,

    width: "100%",

    backgroundColor:
      COLORS.offWhite,

    paddingHorizontal:
      SPACING.lg,

    paddingTop:
      SPACING.sm,
  },

  /**
   * Loading state.
   */
  centerContainer: {
    flex: 1,

    justifyContent:
      "center",

    alignItems:
      "center",

    paddingHorizontal:
      SPACING.lg,
  },

  /**
   * Navigation back to NGO Dashboard.
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

  heading: {
    ...TYPOGRAPHY.headingLarge,

    color:
      COLORS.primaryTeal,

    marginBottom:
      SPACING.lg,

    flexShrink: 1,
  },

  /**
   * Reservation list fills the remaining
   * available screen space.
   */
  list: {
    flex: 1,
    width: "100%",
  },

  /**
   * Ensures the final reservation does not
   * sit directly against the bottom edge.
   */
  listContent: {
    paddingBottom:
      SPACING.xl,
  },

  /**
   * Responsive reservation card.
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

  title: {
    ...TYPOGRAPHY.headingSmall,

    color:
      COLORS.primaryGreen,

    marginBottom:
      SPACING.sm,

    flexShrink: 1,
  },

  divider: {
    width: "100%",

    height: 1,

    backgroundColor:
      COLORS.beige,

    marginBottom:
      SPACING.sm,
  },

  detailSection: {
    width: "100%",
    marginTop:
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

  text: {
    ...TYPOGRAPHY.body,

    color:
      COLORS.black,

    flexShrink: 1,
  },

  status: {
    ...TYPOGRAPHY.body,

    fontWeight:
      "bold",

    flexShrink: 1,
  },

  /**
   * Reservation actions remain vertically
   * stacked, which works well on narrow phones.
   */
  actions: {
    width: "100%",

    marginTop:
      SPACING.lg,
  },

  collectButton: {
    width: "100%",

    minHeight: 50,

    justifyContent:
      "center",

    alignItems:
      "center",

    backgroundColor:
      COLORS.primaryGreen,

    paddingHorizontal:
      SPACING.md,

    paddingVertical:
      SPACING.md,

    borderRadius: 10,

    marginBottom:
      SPACING.sm,
  },

  cancelButton: {
    width: "100%",

    minHeight: 50,

    justifyContent:
      "center",

    alignItems:
      "center",

    backgroundColor:
      COLORS.primaryRed,

    paddingHorizontal:
      SPACING.md,

    paddingVertical:
      SPACING.md,

    borderRadius: 10,
  },

  browseButton: {
    width: "100%",

    minHeight: 50,

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

  disabledButton: {
    opacity: 0.6,
  },

  buttonText: {
    ...TYPOGRAPHY.button,

    color:
      COLORS.white,

    textAlign:
      "center",

    flexShrink: 1,
  },

  loadingText: {
    ...TYPOGRAPHY.body,

    color:
      COLORS.black,

    marginTop:
      SPACING.md,

    textAlign:
      "center",
  },

  emptyContainer: {
    width: "100%",

    backgroundColor:
      COLORS.white,

    padding:
      SPACING.lg,

    borderRadius: 12,

    alignItems:
      "center",
  },

  emptyTitle: {
    ...TYPOGRAPHY.headingSmall,

    color:
      COLORS.primaryTeal,

    marginBottom:
      SPACING.sm,

    textAlign:
      "center",

    flexShrink: 1,
  },

  emptyText: {
    ...TYPOGRAPHY.body,

    color:
      COLORS.black,

    textAlign:
      "center",

    flexShrink: 1,
  },
});