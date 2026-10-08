/**
 * Available Donations Screen
 *
 * Displays all donations that are
 * currently marked as Available.
 */

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

import { router } from "expo-router";

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

  /**
   * Load donations when
   * screen opens.
   */
  useEffect(() => {
    loadDonations();
  }, []);

  /**
   * Retrieves donations
   * from Firestore and
   * displays only available items.
   */
  const loadDonations = async () => {

    try {

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

    } catch (error) {

      console.error(
        "Error loading donations:",
        error
      );

    }
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

            <Text style={styles.text}>
              Category: {item.category}
            </Text>

            <Text style={styles.text}>
              Quantity: {item.quantity}
            </Text>

            <Text style={styles.text}>
              Location: {item.collectionLocation}
            </Text>

            <TouchableOpacity
              style={styles.button}
              onPress={() =>
                router.push(
                  "/donation-details"
                )
              }
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

    title: {
      ...TYPOGRAPHY.headingSmall,

      color:
        COLORS.primaryGreen,

      marginBottom: 10,
    },

    text: {
      ...TYPOGRAPHY.body,
      marginBottom: 5,
    },

    button: {
      backgroundColor:
        COLORS.primaryTeal,

      padding: SPACING.md,

      borderRadius: 10,

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