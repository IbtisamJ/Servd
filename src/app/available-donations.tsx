/**
 * Available Donations Screen
 *
 * Displays all donations that are currently
 * available for NGOs to reserve.
 *
 * Data is retrieved from the Firestore
 * Donations collection.
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
   * Load donations when the screen opens.
   */
  useEffect(() => {
    loadDonations();
  }, []);

  /**
   * Retrieves donation data from Firestore.
   * Only donations with status "Available"
   * are displayed.
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

  /**
   * Display a friendly message if no
   * available donations exist.
   */
  if (donations.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.heading}>
          Available Donations
        </Text>

        <Text style={styles.emptyText}>
          No available donations found.
        </Text>
      </View>
    );
  }

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
            {/* Food Name */}
            <Text style={styles.title}>
              {item.foodName}
            </Text>

            {/* Category */}
            <Text style={styles.text}>
              Category: {item.category}
            </Text>

            {/* Quantity */}
            <Text style={styles.text}>
              Quantity: {item.quantity}
            </Text>

            {/* Collection Location */}
            <Text style={styles.text}>
              Location:
              {" "}
              {item.collectionLocation}
            </Text>

            {/* Navigate to Donation Details */}
            <TouchableOpacity
              style={styles.button}
              onPress={() =>
                router.push({
                  pathname:
                    "/donation-details",

                  params: {
                    documentId:
                      item.id,

                    donationId:
                      item.donationId,

                    enterpriseId:
                      item.enterpriseId,

                    foodName:
                      item.foodName,

                    category:
                      item.category,

                    description:
                      item.description,

                    quantity:
                      item.quantity?.toString(),

                    collectionLocation:
                      item.collectionLocation,

                    status:
                      item.status,
                  },
                })
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

      padding:
        SPACING.md,

      borderRadius: 10,

      marginTop: 10,
    },

    buttonText: {
      ...TYPOGRAPHY.button,

      color:
        COLORS.white,

      textAlign:
        "center",
    },

    emptyText: {
      ...TYPOGRAPHY.body,

      textAlign:
        "center",

      marginTop:
        SPACING.xl,
    },

  });