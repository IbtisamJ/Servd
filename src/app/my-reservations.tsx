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

  useEffect(() => {
    loadReservations();
  }, []);

  const loadReservations = async () => {

    try {

      const data =
        await getReservations();

      setReservations(data);

    } catch (error) {

      console.error(error);

    }
  };

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

            <Text style={styles.label}>
              Donation ID
            </Text>

            <Text style={styles.value}>
              {item.donationId}
            </Text>

            <Text style={styles.label}>
              Reservation Status
            </Text>

            <Text style={styles.status}>
              {item.status}
            </Text>

            <Text style={styles.label}>
              Created
            </Text>

            <Text style={styles.value}>
              {String(
                item.createdTimestamp
              )}
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
    color:
      COLORS.primaryTeal,
    marginBottom:
      SPACING.lg,
  },

  card: {
    backgroundColor:
      COLORS.white,

    padding:
      SPACING.md,

    borderRadius: 12,

    marginBottom:
      SPACING.md,
  },

  label: {
    ...TYPOGRAPHY.body,
    fontWeight: "bold",
  },

  value: {
    ...TYPOGRAPHY.body,
    marginBottom: 10,
  },

  status: {
    ...TYPOGRAPHY.body,
    color:
      COLORS.primaryGreen,
    marginBottom: 10,
  },
});