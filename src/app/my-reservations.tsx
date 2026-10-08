/**
 * My Reservations Screen
 *
 * Displays all donations reserved by the NGO.
 * Shows reservation status and collection information.
 */

import {
  useEffect,
  useState,
} from "react";

import {
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  getReservations,
} from "../services/reservationService";

import {
  COLORS,
  SPACING,
  TYPOGRAPHY,
} from "../theme";

export default function MyReservations() {
  const [reservations, setReservations] =
    useState<any[]>([]);

  /**
   * Load reservation data when
   * the screen opens.
   */
  useEffect(() => {
    loadReservations();
  }, []);

  /**
   * Retrieves reservations from Firestore.
   */
  const loadReservations = async () => {
    try {
      const data =
        await getReservations();

      setReservations(data);
    } catch (error) {
      console.error(
        "Error loading reservations:",
        error
      );
    }
  };

  /**
   * Display a friendly message when
   * no reservations are available.
   */
  if (reservations.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.heading}>
          My Reservations
        </Text>

        <Text style={styles.emptyText}>
          No reservations found.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>
        My Reservations
      </Text>

      <FlatList
        data={reservations}
        keyExtractor={(item) =>
          item.id
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.title}>
              {item.foodName ||
                "Reserved Donation"}
            </Text>

            <Text style={styles.text}>
              Status: {item.status}
            </Text>

            <Text style={styles.text}>
              Location:{" "}
              {item.collectionLocation}
            </Text>

            <Text style={styles.text}>
              Donation ID:{" "}
              {item.donationId}
            </Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:
      COLORS.offWhite,
    padding: SPACING.lg,
  },

  heading: {
    ...TYPOGRAPHY.headingLarge,
    color: COLORS.primaryTeal,
    marginBottom: SPACING.lg,
  },

  card: {
    backgroundColor:
      COLORS.white,
    padding: SPACING.md,
    borderRadius: 12,
    marginBottom: SPACING.md,
  },

  title: {
    ...TYPOGRAPHY.headingSmall,
    color: COLORS.primaryGreen,
    marginBottom: 10,
  },

  text: {
    ...TYPOGRAPHY.body,
    marginBottom: 5,
  },

  emptyText: {
    ...TYPOGRAPHY.body,
    textAlign: "center",
    marginTop: SPACING.xl,
  },
});