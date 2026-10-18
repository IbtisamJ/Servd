/**
 * Available Donations Screen
 *
 * Displays currently available food donations
 * retrieved from Firestore.
 *
 * Uses the shared Servd theme and refreshes
 * whenever the screen receives focus.
 */

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

import { router, useFocusEffect } from "expo-router";
import FontAwesome5 from "@react-native-vector-icons/fontawesome5";

import { getDonations } from "../services/donationService";
import { DONATION_STATUS } from "../constants/roles";
import { styles } from "../styles/AvailableDonations.style";

import { Colors } from "../constants/theme";

export default function AvailableDonations() {
  const [donations, setDonations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  /**
   * Load available donations from Firestore.
   */
  const loadDonations = useCallback(async () => {
    try {
      setLoading(true);

      const data = await getDonations();

      const availableDonations = data.filter(
        (donation: any) => donation.status === DONATION_STATUS.AVAILABLE,
      );

      setDonations(availableDonations);
    } catch (error) {
      console.error("Error loading donations:", error);

      Alert.alert(
        "Unable to load donations",
        "Please check your connection and try again.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Try again",
            onPress: () => loadDonations(),
          },
        ],
      );
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Refresh the list whenever this screen
   * becomes active.
   */
  useFocusEffect(
    useCallback(() => {
      loadDonations();
    }, [loadDonations]),
  );

  /**
   * Loading state.
   */
  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.light.secondary} />

          <Text style={styles.loadingText}>Finding available donations...</Text>
        </View>
      </SafeAreaView>
    );
  }

  /**
   * Opens the selected donation's details.
   * Existing navigation parameters are preserved.
   */
  const openDonation = (item: any) => {
    router.push({
      pathname: "/donation-details",
      params: {
        documentId: item.id,
        donationId: item.donationId,
        enterpriseId: item.enterpriseId,
        foodName: item.foodName,
        category: item.category,
        description: item.description,
        quantity: item.quantity?.toString(),
        collectionLocation: item.collectionLocation,
        status:
          item.status as (typeof DONATION_STATUS)[keyof typeof DONATION_STATUS],
      },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Back navigation */}
        <TouchableOpacity
          style={styles.backButton}
          activeOpacity={0.7}
          onPress={() => router.back()}
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

        {/* Page introduction */}
        <View style={styles.header}>
          <Text style={styles.eyebrow}>FOOD REDISTRIBUTION</Text>

          <Text style={styles.heading}>Available donations</Text>

          <Text style={styles.subtitle}>
            Find surplus food available for your organisation to collect.
          </Text>
        </View>

        {/* Results count */}
        <View style={styles.resultsRow}>
          <Text style={styles.resultsLabel}>Available near you</Text>

          <View style={styles.countBadge}>
            <Text style={styles.countText}>{donations.length}</Text>
          </View>
        </View>

        <FlatList
          data={donations}
          keyExtractor={(item) => item.id}
          style={styles.list}
          contentContainerStyle={[
            styles.listContent,
            donations.length === 0 && styles.emptyListContent,
          ]}
          showsVerticalScrollIndicator={false}
          onRefresh={loadDonations}
          refreshing={loading}
          ItemSeparatorComponent={() => <View style={styles.cardSeparator} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIcon}>
                <FontAwesome5
                  name="utensils"
                  size={23}
                  color={Colors.light.secondary}
                  iconStyle="solid"
                />
              </View>

              <Text style={styles.emptyTitle}>
                No donations available just yet
              </Text>

              <Text style={styles.emptyText}>
                There are no available food donations at the moment. Please
                check back later.
              </Text>

              <TouchableOpacity
                style={styles.refreshButton}
                activeOpacity={0.8}
                onPress={loadDonations}
                accessibilityRole="button"
              >
                <FontAwesome5
                  name="sync-alt"
                  size={13}
                  color={Colors.light.secondary}
                  iconStyle="solid"
                />

                <Text style={styles.refreshButtonText}>Check again</Text>
              </TouchableOpacity>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              {/* Food name and availability */}
              <View style={styles.cardHeader}>
                <View style={styles.foodHeading}>
                  <Text style={styles.foodName}>
                    {item.foodName || "Food donation"}
                  </Text>

                  {!!item.category && (
                    <Text style={styles.category}>{item.category}</Text>
                  )}
                </View>

                <View style={styles.availableBadge}>
                  <View style={styles.availableDot} />

                  <Text style={styles.availableText}>Available</Text>
                </View>
              </View>

              <View style={styles.cardDivider} />

              {/* Quantity */}
              <View style={styles.detailRow}>
                <View style={styles.detailIcon}>
                  <FontAwesome5
                    name="box"
                    size={15}
                    color={Colors.light.secondary}
                    iconStyle="solid"
                  />
                </View>

                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Quantity</Text>

                  <Text style={styles.detailValue}>
                    {item.quantity ?? "Not specified"}
                  </Text>
                </View>
              </View>

              {/* Collection location */}
              <View style={styles.detailRow}>
                <View style={styles.detailIcon}>
                  <FontAwesome5
                    name="map-marker-alt"
                    size={15}
                    color={Colors.light.secondary}
                    iconStyle="solid"
                  />
                </View>

                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Collection location</Text>

                  <Text style={styles.detailValue}>
                    {item.collectionLocation || "Not specified"}
                  </Text>
                </View>
              </View>

              {/* View details action */}
              <TouchableOpacity
                style={styles.button}
                activeOpacity={0.8}
                onPress={() => openDonation(item)}
                accessibilityRole="button"
                accessibilityLabel={`View details for ${item.foodName || "food donation"}`}
              >
                <Text style={styles.buttonText}>View donation details</Text>

                <FontAwesome5
                  name="arrow-right"
                  size={14}
                  color={Colors.light.background}
                  iconStyle="solid"
                />
              </TouchableOpacity>
            </View>
          )}
        />
      </View>
    </SafeAreaView>
  );
}
