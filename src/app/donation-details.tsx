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
import { auth } from "../config/firebase";
import { DONATION_STATUS } from "../constants/roles";
import { reserveDonationForNGO } from "../services/reservationService";

import { Colors } from "../constants/theme";
import { styles } from "../styles/DonationDetails.style";

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
        "We couldn't identify this donation. Please return to the donations list and try again.",
      );
      return;
    }

    if (!isAvailable) {
      Alert.alert(
        "No longer available",
        "This donation cannot be reserved because it is no longer available.",
      );
      return;
    }

    const currentUser = auth.currentUser;

    if (!currentUser) {
      Alert.alert(
        "Sign in required",
        "Please sign in to your NGO account before reserving a donation.",
      );
      return;
    }

    setIsReserving(true);

    try {
      const ngoId = currentUser.uid;

      await reserveDonationForNGO(
        documentId,
        donationId,
        ngoId,
        foodName ?? "",
        collectionLocation ?? "",
      );

      Alert.alert(
        "Reservation successful!",
        "This donation has been reserved for your organisation. Please check your reservations for the collection details.",
        [
          {
            text: "View reservations",
            onPress: () => router.replace("/my-reservations"),
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
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Navigation */}
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Go back to donations"
            activeOpacity={0.75}
          >
            <FontAwesome5
              name="arrow-left"
              size={15}
              color={Colors.light.text}
              iconStyle="solid"
            />
          </TouchableOpacity>

          <Text style={styles.topBarTitle}>Donation details</Text>

          <View style={styles.topBarSpacer} />
        </View>

        {/* Intro */}
        <View style={styles.introSection}>
          <View style={styles.eyebrow}>
            <View style={styles.eyebrowDot} />
            <Text style={styles.eyebrowText}>
              A little good goes a long way
            </Text>
          </View>

          <Text style={styles.pageTitle}>Food worth{"\n"}sharing.</Text>

          <Text style={styles.pageDescription}>
            Get to know this donation before reserving it for your organisation.
          </Text>
        </View>

        {/* Donation summary card */}
        <View style={styles.heroCard}>
          <View style={styles.heroTopRow}>
            <View style={styles.foodIconContainer}>
              <FontAwesome5
                name="utensils"
                size={23}
                color={Colors.light.secondary}
                iconStyle="solid"
              />
            </View>

            <View
              style={[
                styles.statusBadge,
                !isAvailable && styles.unavailableBadge,
              ]}
            >
              <View
                style={[
                  styles.statusDot,
                  !isAvailable && styles.unavailableDot,
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

          <View style={styles.categoryTag}>
            <FontAwesome5
              name="tag"
              size={11}
              color={Colors.light.secondary}
              iconStyle="solid"
            />
            <Text style={styles.categoryText}>{displayValue(category)}</Text>
          </View>

          <View style={styles.heroDivider} />

          <View style={styles.quantityRow}>
            <View style={styles.quantityIcon}>
              <FontAwesome5
                name="box"
                size={15}
                color={Colors.light.accent}
                iconStyle="solid"
              />
            </View>

            <View style={styles.quantityContent}>
              <Text style={styles.quantityLabel}>Donation quantity</Text>
              <Text style={styles.quantityValue}>{displayValue(quantity)}</Text>
            </View>
          </View>
        </View>

        {/* Description */}
        <View style={styles.sectionHeading}>
          <Text style={styles.sectionTitle}>About this donation</Text>
          <View style={styles.sectionAccent} />
        </View>

        <View style={styles.descriptionCard}>
          <Text style={styles.descriptionText}>
            {displayValue(description)}
          </Text>
        </View>

        {/* Collection information */}
        <View style={styles.sectionHeading}>
          <Text style={styles.sectionTitle}>Collection information</Text>
          <View style={styles.sectionAccent} />
        </View>

        <View style={styles.collectionCard}>
          <View style={styles.collectionIconContainer}>
            <FontAwesome5
              name="map-marker-alt"
              size={18}
              color={Colors.light.secondary}
              iconStyle="solid"
            />
          </View>

          <View style={styles.collectionContent}>
            <Text style={styles.detailLabel}>Collection location</Text>
            <Text style={styles.detailValue}>
              {displayValue(collectionLocation)}
            </Text>
            <Text style={styles.collectionHint}>
              Please review the collection arrangements before collecting.
            </Text>
          </View>
        </View>

        {/* Reference information */}
        <View style={styles.referenceRow}>
          <View style={styles.referenceIcon}>
            <FontAwesome5
              name="clipboard-list"
              size={15}
              color={Colors.light.textSecondary}
              iconStyle="solid"
            />
          </View>

          <View style={styles.referenceContent}>
            <Text style={styles.referenceLabel}>Donation reference</Text>
            <Text style={styles.referenceValue}>
              {displayValue(donationId)}
            </Text>
          </View>
        </View>

        {/* Gentle reminder */}
        <View style={styles.reminderCard}>
          <View style={styles.reminderIcon}>
            <FontAwesome5 name="heart" size={16} color={Colors.light.primary} />
          </View>

          <Text style={styles.reminderText}>
            Every donation makes a difference. Please reserve only if your
            organisation can arrange collection.
          </Text>
        </View>

        {/* Bottom action */}
        <View style={styles.actionSection}>
          <TouchableOpacity
            style={[
              styles.reserveButton,
              (!isAvailable || isReserving) && styles.disabledButton,
            ]}
            onPress={handleReserveDonation}
            disabled={!isAvailable || isReserving}
            accessibilityRole="button"
            accessibilityLabel={
              isAvailable ? "Reserve donation" : "Donation unavailable"
            }
            activeOpacity={0.85}
          >
            {isReserving ? (
              <>
                <ActivityIndicator
                  size="small"
                  color={Colors.light.background}
                />
                <Text style={styles.reserveButtonText}>
                  Reserving donation...
                </Text>
              </>
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
                    size={15}
                    color={Colors.light.background}
                    iconStyle="solid"
                  />
                )}
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => router.back()}
            disabled={isReserving}
            accessibilityRole="button"
            activeOpacity={0.7}
          >
            <Text style={styles.cancelButtonText}>Back to donations</Text>
          </TouchableOpacity>

          <Text style={styles.footerNote}>
            Together, we can make surplus food count.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
