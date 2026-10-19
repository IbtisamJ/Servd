/**
 * My Reservations Screen
 *
 * Allows NGOs to view and manage their reserved food donations.
 * Displays reservation statuses, collection details, and summary statistics.
 * Supports confirming collections and cancelling active reservations.
 */

import FontAwesome5 from "@react-native-vector-icons/fontawesome5";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { auth } from "../config/firebase";

import {
  cancelReservation,
  getReservationsForNGO,
  markReservationCollected,
} from "../services/reservationService";

import { RESERVATION_STATUS } from "../constants/roles";
import { Colors } from "../constants/theme";
import { styles } from "../styles/Reservation.styles";

// Information displayed for each donation reserved by an NGO.
type Reservation = {
  id: string;
  donationDocumentId?: string;
  donationId?: string;
  foodName?: string;
  collectionLocation?: string;
  status: string;
};

export default function MyReservations() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Loads reservations whenever this screen is opened or revisited.
  const loadReservations = useCallback(async () => {
    try {
      setLoading(true);

      const currentUser =
        auth.currentUser;

      if (!currentUser) {
        Alert.alert(
          "Authentication Required",
          "Please log in to view your reservations.",
        );

        setReservations([]);
        return;
      }

      const data = await getReservationsForNGO(
        currentUser.uid,
      );

      setReservations(data as Reservation[]);
    } catch (error) {
      console.error("Error loading reservations:", error);

      Alert.alert(
        "Couldn't load reservations",
        "Your reservations could not be loaded. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // Refreshes reservation information when the screen regains focus.
  useFocusEffect(
    useCallback(() => {
      loadReservations();
    }, [loadReservations]),
  );

  // Marks an active reservation as collected after validating its IDs.
  const handleMarkCollected = async (item: Reservation) => {
    if (!item.id || !item.donationDocumentId) {
      Alert.alert(
        "Update unavailable",
        "This reservation is missing information needed to update its collection status.",
      );
      return;
    }

    try {
      setUpdatingId(item.id);

      await markReservationCollected(item.id, item.donationDocumentId);
      await loadReservations();

      Alert.alert(
        "Collection confirmed",
        `${item.foodName || "The donation"} has been marked as collected.`,
      );
    } catch (error) {
      console.error("Collection update error:", error);

      Alert.alert(
        "Couldn't update collection",
        error instanceof Error
          ? error.message
          : "The reservation could not be marked as collected.",
      );
    } finally {
      setUpdatingId(null);
    }
  };

  // Requests confirmation before cancelling a reservation.
  const handleCancelReservation = (item: Reservation) => {
    if (!item.id || !item.donationDocumentId) {
      Alert.alert(
        "Cancellation unavailable",
        "This reservation is missing information needed to cancel it.",
      );
      return;
    }

    Alert.alert(
      "Cancel reservation?",
      `Are you sure you want to cancel the reservation for ${
        item.foodName || "this donation"
      }? The donation may become available to another organisation.`,
      [
        {
          text: "Keep reservation",
          style: "cancel",
        },
        {
          text: "Cancel reservation",
          style: "destructive",
          onPress: async () => {
            try {
              setUpdatingId(item.id);

              await cancelReservation(item.id, item.donationDocumentId!);

              await loadReservations();

              Alert.alert(
                "Reservation cancelled",
                "Your reservation has been cancelled.",
              );
            } catch (error) {
              console.error("Reservation cancellation error:", error);

              Alert.alert(
                "Couldn't cancel reservation",
                error instanceof Error
                  ? error.message
                  : "The reservation could not be cancelled.",
              );
            } finally {
              setUpdatingId(null);
            }
          },
        },
      ],
    );
  };

  // Provides consistent colours and labels for each reservation status.
  const getStatusStyle = (status: string) => {
    switch (status) {
      case RESERVATION_STATUS.COLLECTED:
        return {
          backgroundColor: "#E4EBD8",
          textColor: Colors.light.accent,
          label: "Collected",
        };

      case RESERVATION_STATUS.CANCELLED:
        return {
          backgroundColor: "#F5E2DE",
          textColor: Colors.light.primary,
          label: "Cancelled",
        };

      default:
        return {
          backgroundColor: "#DDECE9",
          textColor: Colors.light.secondary,
          label:
            status.length > 0
              ? status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()
              : "Unknown",
        };
    }
  };

  // Calculates the reservation totals shown in the compact overview.
  const activeCount = reservations.filter(
    (item) => item.status === RESERVATION_STATUS.ACTIVE,
  ).length;

  const collectedCount = reservations.filter(
    (item) => item.status === RESERVATION_STATUS.COLLECTED,
  ).length;

  // Displays an individual reservation and its available actions.
  const renderReservation = ({ item }: { item: Reservation }) => {
    const isUpdating = updatingId === item.id;
    const isActive = item.status === RESERVATION_STATUS.ACTIVE;
    const statusStyle = getStatusStyle(item.status);

    return (
      <View style={styles.reservationCard}>
        <View style={styles.cardHeader}>
          <View style={styles.foodIcon}>
            <FontAwesome5
              name="utensils"
              size={17}
              color={Colors.light.secondary}
              iconStyle="solid"
            />
          </View>

          <View style={styles.cardHeading}>
            <Text style={styles.cardEyebrow}>RESERVED FOOD</Text>
            <Text style={styles.cardTitle}>
              {item.foodName || "Reserved donation"}
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.statusBadge,
            { backgroundColor: statusStyle.backgroundColor },
          ]}
        >
          <View
            style={[
              styles.statusDot,
              { backgroundColor: statusStyle.textColor },
            ]}
          />
          <Text style={[styles.statusText, { color: statusStyle.textColor }]}>
            {statusStyle.label}
          </Text>
        </View>

        <View style={styles.details}>
          <View style={styles.detailRow}>
            <FontAwesome5
              name="hashtag"
              size={13}
              color={Colors.light.textSecondary}
              iconStyle="solid"
            />

            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Donation reference</Text>
              <Text style={styles.detailValue}>
                {item.donationId || "Not available"}
              </Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <FontAwesome5
              name="map-marker-alt"
              size={15}
              color={Colors.light.textSecondary}
              iconStyle="solid"
            />

            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Collection location</Text>
              <Text style={styles.detailValue}>
                {item.collectionLocation || "Not provided"}
              </Text>
            </View>
          </View>
        </View>

        {/* Only active reservations can be collected or cancelled. */}
        {isActive && (
          <View style={styles.actions}>
            <TouchableOpacity
              style={[
                styles.collectButton,
                isUpdating && styles.disabledButton,
              ]}
              activeOpacity={0.8}
              disabled={isUpdating}
              onPress={() => handleMarkCollected(item)}
              accessibilityRole="button"
              accessibilityLabel={`Mark ${item.foodName || "donation"} as collected`}
            >
              {isUpdating ? (
                <ActivityIndicator
                  size="small"
                  color={Colors.light.background}
                />
              ) : (
                <>
                  <FontAwesome5
                    name="check"
                    size={13}
                    color={Colors.light.background}
                    iconStyle="solid"
                  />
                  <Text style={styles.collectButtonText}>
                    Mark as collected
                  </Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.cancelButton, isUpdating && styles.disabledButton]}
              activeOpacity={0.7}
              disabled={isUpdating}
              onPress={() => handleCancelReservation(item)}
              accessibilityRole="button"
              accessibilityLabel={`Cancel reservation for ${item.foodName || "donation"}`}
            >
              <Text style={styles.cancelButtonText}>Cancel reservation</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Confirms successful collection without offering further actions. */}
        {item.status === RESERVATION_STATUS.COLLECTED && (
          <View style={styles.feedbackNote}>
            <FontAwesome5
              name="heart"
              size={14}
              color={Colors.light.accent}
              iconStyle="solid"
            />
            <Text style={styles.feedbackText}>
              Collected successfully. Thank you for helping good food reach your
              community.
            </Text>
          </View>
        )}

        {item.status === RESERVATION_STATUS.CANCELLED && (
          <Text style={styles.cancelledNote}>
            This reservation is no longer active.
          </Text>
        )}
      </View>
    );
  };

  // Shows a simple loading screen while reservation data is retrieved.
  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.light.secondary} />
          <Text style={styles.loadingTitle}>Loading your reservations</Text>
          <Text style={styles.loadingSubtitle}>
            Just a moment while we get everything ready.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={reservations}
        keyExtractor={(item) => item.id}
        renderItem={renderReservation}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View>
            {/* Returns directly to the NGO dashboard. */}
            <TouchableOpacity
              style={styles.backButton}
              activeOpacity={0.7}
              onPress={() => router.replace("/ngo-dashboard")}
              accessibilityRole="button"
              accessibilityLabel="Go back to dashboard"
            >
              <FontAwesome5
                name="arrow-left"
                size={14}
                color={Colors.light.secondary}
                iconStyle="solid"
              />

              <Text style={styles.backButtonText}>Back to Dashboard</Text>
            </TouchableOpacity>

            {/* Introduces the screen without unnecessary decorative panels. */}
            <View style={styles.introSection}>
              <Text style={styles.eyebrow}>YOUR COMMUNITY IMPACT</Text>

              <Text style={styles.pageTitle}>
                Good food,{"\n"}put to good use.
              </Text>

              <Text style={styles.pageDescription}>
                Keep track of the food your organisation has reserved and manage
                upcoming collections.
              </Text>
            </View>

            {/* A compact overview keeps the key totals easy to scan. */}
            <View style={styles.overview}>
              <View style={styles.overviewItem}>
                <Text style={styles.overviewNumber}>{activeCount}</Text>
                <Text style={styles.overviewLabel}>To collect</Text>
              </View>

              <View style={styles.overviewDivider} />

              <View style={styles.overviewItem}>
                <Text style={styles.overviewNumber}>{collectedCount}</Text>
                <Text style={styles.overviewLabel}>Collected</Text>
              </View>

              <View style={styles.overviewDivider} />

              <View style={styles.overviewItem}>
                <Text style={styles.overviewNumber}>{reservations.length}</Text>
                <Text style={styles.overviewLabel}>Total reserved</Text>
              </View>
            </View>

            {/* Uses NGO-specific terminology throughout the reservation list. */}
            <View style={styles.listHeading}>
              <View>
                <Text style={styles.sectionTitle}>Reserved donations</Text>
                <Text style={styles.sectionSubtitle}>
                  Your organisation's collection activity
                </Text>
              </View>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <FontAwesome5
                name="hand-holding-heart"
                size={29}
                color={Colors.light.secondary}
                iconStyle="solid"
              />
            </View>

            <Text style={styles.emptyTitle}>Nothing reserved just yet</Text>

            <Text style={styles.emptyDescription}>
              When your organisation reserves a donation, its collection details
              and status will appear here.
            </Text>

            <TouchableOpacity
              style={styles.browseButton}
              activeOpacity={0.8}
              onPress={() => router.push("/available-donations")}
              accessibilityRole="button"
              accessibilityLabel="Explore available donations"
            >
              <Text style={styles.browseButtonText}>Explore donations</Text>
              <FontAwesome5
                name="arrow-right"
                size={13}
                color={Colors.light.background}
                iconStyle="solid"
              />
            </TouchableOpacity>
          </View>
        }
        ListFooterComponent={
          <View style={styles.footer}>
            <FontAwesome5
              name="heart"
              size={12}
              color={Colors.light.accent}
              iconStyle="solid"
            />
            <Text style={styles.footerText}>
              Helping good food reach the people who need it.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}