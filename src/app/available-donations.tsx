import {
    useEffect,
    useState,
} from "react";

import {
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import {
    getDonations,
} from "../services/donationService";

import {
    COLORS,
    SPACING,
    TYPOGRAPHY,
} from "../theme";

export default function AvailableDonations() {

  const [donations, setDonations] =
    useState<any[]>([]);

  useEffect(() => {
    loadDonations();
  }, []);

  const loadDonations = async () => {

    const data =
      await getDonations();

    const availableDonations =
      data.filter(
        (donation: any) =>
          donation.status ===
          "Available"
      );

    setDonations(
      availableDonations
    );
  };

  return (
    <View style={styles.container}>

      <Text style={styles.heading}>
        Available Donations
      </Text>

      <FlatList
        data={donations}
        keyExtractor={(item) =>
          item.id
        }

        renderItem={({ item }) => (

          <View style={styles.card}>

            <Text style={styles.title}>
              {item.foodName}
            </Text>

            <Text>
              Category:
              {" "}
              {item.category}
            </Text>

            <Text>
              Quantity:
              {" "}
              {item.quantity}
            </Text>

            <Text>
              Location:
              {" "}
              {
                item.collectionLocation
              }
            </Text>

            <TouchableOpacity
              style={styles.button}
            >
              <Text
                style={
                  styles.buttonText
                }
              >
                View Details
              </Text>
            </TouchableOpacity>

          </View>

        )}
      />

    </View>
  );
}

const styles =
  StyleSheet.create({

    container: {
      flex: 1,
      padding: SPACING.lg,
      backgroundColor:
        COLORS.offWhite,
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

    title: {
      ...TYPOGRAPHY.headingSmall,
      color:
        COLORS.primaryGreen,
      marginBottom: 8,
    },

    button: {
      backgroundColor:
        COLORS.primaryTeal,

      padding: 10,

      borderRadius: 8,

      marginTop: 10,
    },

    buttonText: {
      color:
        COLORS.white,

      textAlign:
        "center",

      ...TYPOGRAPHY.button,
    },
});