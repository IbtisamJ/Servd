/**
 * Donation Details Screen
 *
 * Displays detailed information about an available food donation.
 * Shows food descriptions, quantities, collection locations, and status.
 * Allows approved NGOs to reserve available donations.
 */

import FontAwesome5 from "@react-native-vector-icons/fontawesome5";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { auth } from "../../config/firebase";
import { DONATION_STATUS } from "../../constants/roles";
import { Colors } from "../../constants/theme";
import { createReservation } from "../../services/reservationService";
import { styles } from "../../styles/DonationDetails.style";

export default function DonationDetails() {
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

  const [isReserving, setIsReserving] = useState(false);

  const isAvailable = status === DONATION_STATUS.AVAILABLE;

  const displayValue = (value?: string) => {
    if (!value || value.trim().length === 0) {
      return "Not provided";
    }

    return value;
  };

  const formattedStatus = status
    ? status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()
    : "Unknown";

  const handleReserveDonation = async () => {
    if (!documentId || !donationId) {
      Alert.alert(
        "Donation unavailable",
        "This donation could not be found. Please return to available donations and try again.",
      );
      return;
    }

    if (!isAvailable) {
      Alert.alert(
        "No longer available",
        "This donation is no longer available to reserve.",
      );
      return;
    }

    const currentUser = auth.currentUser;

    if (!currentUser) {
      Alert.alert(
        "Sign in required",
        "Please sign in to reserve this donation.",
      );
      return;
    }

    setIsReserving(true);

    try {
      await reserveDonationForNGO(
        documentId,
        donationId,
        currentUser.uid,
        foodName ?? "",
        collectionLocation ?? "",
      );

      Alert.alert(
        "Reservation successful!",
        "This donation has been reserved for your organisation. Please check your reservations for the collection details.",
        [
          {
            text: "View reservations",
            onPress: () => router.replace("/ngos/my-reservations"),
          },
        ],
      );
    } catch (error) {
      console.error("Error reserving donation:", error);

      Alert.alert(
        "Couldn't reserve donation",
        error instanceof Error
          ? error.message
          : "Something went wrong while reserving this donation. Please try again.",
      );
    } finally {
      setIsReserving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Back navigation */}
        <TouchableOpacity
          style={styles.backButton}
          activeOpacity={0.7}
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Go back to available donations"
        >
          <FontAwesome5
            name="arrow-left"
            size={14}
            color={Colors.light.secondary}
            iconStyle="solid"
          />

          <Text style={styles.backButtonText}>Back to Available Donations</Text>
        </TouchableOpacity>

        {/* Page introduction */}
        <View style={styles.introSection}>
          <Text style={styles.eyebrow}>A LITTLE GOOD GOES A LONG WAY</Text>

          <Text style={styles.pageTitle}>Food worth sharing.</Text>

          <Text style={styles.pageDescription}>
            Discover the details and see how your organisation can make a
            difference.
          </Text>
        </View>

        {/* Donation overview and description */}
        <View style={styles.donationCard}>
          <View style={styles.statusRow}>
            <Text style={styles.cardEyebrow}>DONATION DETAILS</Text>

            <View
              style={[
                styles.statusBadge,
                !isAvailable && styles.unavailableBadge,
              ]}
            >
              <View
                style={[
                  styles.statusDot,
                  !isAvailable && styles.unavailableStatusDot,
                ]}
              />

              <Text
                style={[
                  styles.statusText,
                  !isAvailable && styles.unavailableStatusText,
                ]}
              >
                {formattedStatus}
              </Text>
            </View>
          </View>

          <Text style={styles.foodName}>{displayValue(foodName)}</Text>

          <Text style={styles.categoryText}>{displayValue(category)}</Text>

          <View style={styles.cardDivider} />

          {/* Quantity */}
          <View style={styles.quantityRow}>
            <View style={styles.quantityIcon}>
              <FontAwesome5
                name="box-open"
                size={17}
                color={Colors.light.secondary}
                iconStyle="solid"
              />
            </View>

            <View style={styles.quantityContent}>
              <Text style={styles.detailLabel}>QUANTITY AVAILABLE</Text>

              <Text style={styles.quantityValue}>{displayValue(quantity)}</Text>
            </View>
          </View>

          <View style={styles.cardDivider} />

          {/* Description */}
          <View style={styles.descriptionSection}>
            <Text style={styles.descriptionTitle}>About this donation</Text>

            <Text style={styles.bodyText}>{displayValue(description)}</Text>
          </View>
        </View>

        {/* Collection details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Collection details</Text>

          <View style={styles.locationCard}>
            <View style={styles.locationIcon}>
              <FontAwesome5
                name="map-marker-alt"
                size={18}
                color={Colors.light.secondary}
                iconStyle="solid"
              />
            </View>

            <View style={styles.locationContent}>
              <Text style={styles.detailLabel}>COLLECTION LOCATION</Text>

              <Text style={styles.locationValue}>
                {displayValue(collectionLocation)}
              </Text>
            </View>
          </View>

          <Text style={styles.locationHint}>
            Please make sure your organisation can arrange collection from this
            location before reserving.
          </Text>
        </View>

        {/* Donation reference */}
        <View style={styles.referenceRow}>
          <Text style={styles.referenceLabel}>Donation reference</Text>

          <Text style={styles.referenceValue}>{displayValue(donationId)}</Text>
        </View>

        {/* Reservation actions */}
        <View style={styles.actionSection}>
          <Text style={styles.actionHint}>
            Ready to help this food find a good home?
          </Text>

          <TouchableOpacity
            style={[
              styles.reserveButton,
              (!isAvailable || isReserving) && styles.disabledButton,
            ]}
            onPress={handleReserveDonation}
            disabled={!isAvailable || isReserving}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel={
              isAvailable ? "Reserve this donation" : "Donation unavailable"
            }
          >
            {isReserving ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Text style={styles.reserveButtonText}>
                  {isAvailable
                    ? "Reserve this donation"
                    : "Donation unavailable"}
                </Text>

                {isAvailable && (
                  <FontAwesome5
                    name="arrow-right"
                    size={14}
                    color="#FFFFFF"
                    iconStyle="solid"
                  />
                )}
              </>
            )}
          </TouchableOpacity>

          {/* Greyed back button */}
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => router.back()}
            disabled={isReserving}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Back to donations"
          >
            <Text style={styles.cancelButtonText}>Back to donations</Text>
          </TouchableOpacity>

          {/* Footer */}
          <View style={styles.footer}>
            <FontAwesome5
              name="heart"
              size={12}
              color={Colors.light.accent}
              iconStyle="solid"
            />

            <Text style={styles.footerText}>
              Good food. Stronger communities. Less waste.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
