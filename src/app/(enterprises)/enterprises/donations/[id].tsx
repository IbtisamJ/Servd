
import FontAwesome5 from "@react-native-vector-icons/fontawesome5";
import { router, useLocalSearchParams } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import {
  doc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { BrandHeader } from "@/components/enterprise";
import { auth, db } from "@/config/firebase";
import {
  COLLECTIONS,
  DONATION_STATUS,
} from "@/constants/roles";
import {
  Colors,
  Fonts,
  Radius,
  Spacing,
} from "@/constants/theme";

const colors = Colors.light;

type FirestoreDate = Date | { toDate: () => Date };

type Donation = {
  donationId?: string;
  enterpriseId: string;
  foodName: string;
  category: string;
  description: string;
  quantity: number;
  imageUrl?: string | null;
  collectionLocation: string;
  collectionDeadline: FirestoreDate;
  expiryDate: FirestoreDate;
  status: string;
  createdTimestamp?: FirestoreDate | null;
};

// Converts a Firestore Timestamp or JavaScript Date into a valid Date.
// Returns null when the value is missing or invalid.
function toDate(value?: FirestoreDate | null): Date | null {
  if (!value) {
    return null;
  }

  const date =
    value instanceof Date
      ? value
      : typeof value.toDate === "function"
        ? value.toDate()
        : null;

  if (!date || Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

// Formats dates consistently for the donation details screen.
function formatDate(value?: FirestoreDate | null): string {
  const date = toDate(value);

  if (!date) {
    return "Not provided";
  }

  return date.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// Returns the badge colours and label associated with each donation status.
function getStatusStyle(status: string) {
  switch (status.toLowerCase()) {
    case DONATION_STATUS.AVAILABLE:
      return {
        backgroundColor: "#E5F4E8",
        color: "#287A3D",
        label: "Available",
      };

    case DONATION_STATUS.RESERVED:
      return {
        backgroundColor: "#FFF0D5",
        color: "#996400",
        label: "Reserved",
      };

    case DONATION_STATUS.COLLECTED:
      return {
        backgroundColor: "#E5EDF9",
        color: "#315F9B",
        label: "Collected",
      };

    case DONATION_STATUS.EXPIRED:
      return {
        backgroundColor: "#FCE8E6",
        color: colors.error,
        label: "Expired",
      };

    case DONATION_STATUS.CANCELLED:
      return {
        backgroundColor: "#F0E6D2",
        color: colors.textSecondary,
        label: "Cancelled",
      };

    default:
      return {
        backgroundColor: colors.backgroundElement,
        color: colors.textSecondary,
        label: status || "Unknown",
      };
  }
}

// Reusable row for displaying collection and donation information.
function DetailRow({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.detailRow}>
      <View style={styles.detailIcon}>
        <FontAwesome5
          name={icon as never}
          size={15}
          color={colors.secondary}
          iconStyle="solid"
        />
      </View>

      <View style={styles.detailCopy}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>{value}</Text>
      </View>
    </View>
  );
}

export default function DonationDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [donation, setDonation] = useState<Donation | null>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(
    auth.currentUser?.uid ?? null,
  );
  const [authLoading, setAuthLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Listen for authentication changes and redirect signed-out users.
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUserId(user?.uid ?? null);
      setAuthLoading(false);

      if (!user) {
        router.replace("/Login" as never);
      }
    });

    return unsubscribe;
  }, []);

  // Load the donation in real time from Firestore.
  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!id || !userId) {
      setDonation(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setDonation(null);

    const donationRef = doc(db, COLLECTIONS.DONATIONS, id);

    const unsubscribe = onSnapshot(
      donationRef,
      (snapshot) => {
        if (!snapshot.exists()) {
          setDonation(null);
          setLoading(false);
          return;
        }

        const data = snapshot.data() as Donation;

        // Enterprises may only view donations belonging to their own account.
        if (data.enterpriseId !== userId) {
          setDonation(null);
          setLoading(false);
          return;
        }

        setDonation(data);
        setLoading(false);
      },
      (error) => {
        console.error("Error loading donation:", error);
        setLoading(false);

        Alert.alert(
          "Unable to load donation",
          "Please try again later.",
        );
      },
    );

    return unsubscribe;
  }, [id, userId, authLoading]);

  // Update the donation status only when the signed-in enterprise owns it.
  const updateDonationStatus = async (
    nextStatus: (typeof DONATION_STATUS)[keyof typeof DONATION_STATUS],
  ) => {
    if (
      !id ||
      !userId ||
      !donation ||
      donation.enterpriseId !== userId ||
      updatingStatus
    ) {
      return;
    }

    try {
      setUpdatingStatus(true);

      await updateDoc(doc(db, COLLECTIONS.DONATIONS, id), {
        status: nextStatus,
      });

      Alert.alert(
        "Status updated",
        `This donation is now ${nextStatus}.`,
      );
    } catch (error) {
      console.error("Error updating donation status:", error);

      Alert.alert(
        "Update failed",
        "We couldn't update this donation. Please try again.",
      );
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Ask for confirmation before cancelling an available donation.
  const confirmCancelDonation = () => {
    if (donation?.status !== DONATION_STATUS.AVAILABLE) {
      return;
    }

    Alert.alert(
      "Cancel donation?",
      "This will mark the donation as cancelled.",
      [
        {
          text: "Keep donation",
          style: "cancel",
        },
        {
          text: "Cancel donation",
          style: "destructive",
          onPress: () =>
            updateDonationStatus(DONATION_STATUS.CANCELLED),
        },
      ],
    );
  };

  // Show a loading state while authentication or donation data is being checked.
  if (authLoading || loading) {
    return (
      <View style={styles.container}>
        <BrandHeader
          role="ENTERPRISE"
          actionLabel="Donations"
          onActionPress={() =>
            router.replace("/enterprises/donations" as never)
          }
        />

        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.helperText}>Loading donation...</Text>
        </View>
      </View>
    );
  }

  if (!userId) {
    return (
      <View style={styles.container}>
        <BrandHeader
          role="ENTERPRISE"
          actionLabel="Donations"
          onActionPress={() =>
            router.replace("/enterprises/donations" as never)
          }
        />

        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.helperText}>
            Redirecting to sign in...
          </Text>
        </View>
      </View>
    );
  }

  if (!donation) {
    return (
      <View style={styles.container}>
        <BrandHeader
          role="ENTERPRISE"
          actionLabel="Donations"
          onActionPress={() =>
            router.replace("/enterprises/donations" as never)
          }
        />

        <View style={styles.centered}>
          <View style={styles.emptyIcon}>
            <FontAwesome5
              name="box-open"
              size={27}
              color={colors.secondary}
              iconStyle="solid"
            />
          </View>

          <Text style={styles.emptyTitle}>Donation not found</Text>

          <Text style={styles.helperText}>
            This donation may have been removed or may not belong to your
            enterprise.
          </Text>

          <Pressable
            accessibilityRole="button"
            onPress={() =>
              router.replace("/enterprises/donations" as never)
            }
            style={styles.primaryButton}
          >
            <Text style={styles.primaryButtonText}>
              Back to donations
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const statusStyle = getStatusStyle(donation.status);
  const isAvailable = donation.status === DONATION_STATUS.AVAILABLE;

  return (
    <View style={styles.container}>
      <BrandHeader
        role="ENTERPRISE"
        actionLabel="Donations"
        onActionPress={() =>
          router.replace("/enterprises/donations" as never)
        }
      />

      <View style={styles.screen}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.workspace}>
            <View style={styles.pageHeader}>
              <View style={styles.headerCopy}>
                <Text style={styles.eyebrow}>YOUR ENTERPRISE</Text>
                <Text style={styles.heading}>Donation details</Text>
              </View>

              <View style={styles.headerIcon}>
                <FontAwesome5
                  name="box-open"
                  size={17}
                  color="#FFFFFF"
                  iconStyle="solid"
                />
              </View>
            </View>

            {donation.imageUrl ? (
              <Image
                source={{ uri: donation.imageUrl }}
                style={styles.heroImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.imagePlaceholder}>
                <FontAwesome5
                  name="utensils"
                  size={34}
                  color={colors.secondary}
                  iconStyle="solid"
                />
                <Text style={styles.placeholderText}>
                  No food image added
                </Text>
              </View>
            )}

            <View style={styles.card}>
              <View style={styles.titleRow}>
                <View style={styles.titleCopy}>
                  <Text style={styles.foodName}>{donation.foodName}</Text>
                  <Text style={styles.category}>{donation.category}</Text>
                </View>

                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: statusStyle.backgroundColor },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      { color: statusStyle.color },
                    ]}
                  >
                    {statusStyle.label}
                  </Text>
                </View>
              </View>

              <View style={styles.quantityBox}>
                <FontAwesome5
                  name="boxes"
                  size={17}
                  color={colors.secondary}
                  iconStyle="solid"
                />

                <View>
                  <Text style={styles.quantityLabel}>Quantity</Text>
                  <Text style={styles.quantityValue}>
                    {donation.quantity}
                  </Text>
                </View>
              </View>

              <View style={styles.divider} />

              <Text style={styles.sectionTitle}>Description</Text>

              <Text style={styles.description}>
                {donation.description || "No description provided."}
              </Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.sectionTitle}>
                Collection information
              </Text>

              <DetailRow
                icon="map-marker-alt"
                label="Collection location"
                value={donation.collectionLocation || "Not provided"}
              />

              <DetailRow
                icon="calendar-alt"
                label="Collection deadline"
                value={formatDate(donation.collectionDeadline)}
              />

              <DetailRow
                icon="clock"
                label="Expiry date"
                value={formatDate(donation.expiryDate)}
              />

              <DetailRow
                icon="calendar-plus"
                label="Date listed"
                value={formatDate(donation.createdTimestamp)}
              />
            </View>

            {isAvailable ? (
              <View style={styles.actionsCard}>
                <Text style={styles.sectionTitle}>Manage donation</Text>

                <Text style={styles.sectionDescription}>
                  If this food is no longer available, you can cancel the
                  listing.
                </Text>

                <Pressable
                  accessibilityRole="button"
                  disabled={updatingStatus}
                  onPress={confirmCancelDonation}
                  style={({ pressed }) => [
                    styles.cancelDonationButton,
                    pressed && styles.pressed,
                    updatingStatus && styles.disabledButton,
                  ]}
                >
                  {updatingStatus ? (
                    <ActivityIndicator color={colors.primary} />
                  ) : (
                    <FontAwesome5
                      name="times-circle"
                      size={16}
                      color={colors.primary}
                      iconStyle="solid"
                    />
                  )}

                  <Text style={styles.cancelDonationText}>
                    {updatingStatus
                      ? "Updating donation..."
                      : "Cancel donation"}
                  </Text>
                </Pressable>
              </View>
            ) : null}

            <Pressable
              accessibilityRole="button"
              onPress={() =>
                router.replace("/enterprises/donations" as never)
              }
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && styles.pressed,
              ]}
            >
              <FontAwesome5
                name="arrow-left"
                size={14}
                color="#FFFFFF"
                iconStyle="solid"
              />

              <Text style={styles.primaryButtonText}>
                Back to donations
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.four,
  },
  workspace: {
    width: "100%",
    maxWidth: 800,
    alignSelf: "center",
    gap: Spacing.three,
  },
  pageHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.three,
  },
  headerCopy: {
    flex: 1,
    gap: 3,
  },
  eyebrow: {
    fontFamily: Fonts.body,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.2,
    color: colors.secondary,
  },
  heading: {
    fontFamily: Fonts.heading,
    fontSize: 25,
    color: colors.text,
  },
  headerIcon: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Radius.md,
    backgroundColor: colors.primary,
  },
  heroImage: {
    width: "100%",
    height: 240,
    borderRadius: Radius.lg,
    backgroundColor: colors.backgroundElement,
  },
  imagePlaceholder: {
    height: 190,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.two,
    borderRadius: Radius.lg,
    backgroundColor: "#E8F4F1",
  },
  placeholderText: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: colors.textSecondary,
  },
  card: {
    padding: Spacing.three,
    gap: Spacing.three,
    borderRadius: Radius.lg,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: colors.backgroundElement,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: Spacing.two,
  },
  titleCopy: {
    flex: 1,
    gap: Spacing.two,
  },
  foodName: {
    fontFamily: Fonts.heading,
    fontSize: 22,
    color: colors.text,
  },
  category: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: colors.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Radius.md,
  },
  statusText: {
    fontFamily: Fonts.button,
    fontSize: 10,
    fontWeight: "700",
  },
  quantityBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: Radius.md,
    backgroundColor: "#E8F4F1",
  },
  quantityLabel: {
    fontFamily: Fonts.body,
    fontSize: 10,
    color: colors.textSecondary,
  },
  quantityValue: {
    marginTop: 3,
    fontFamily: Fonts.button,
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: colors.backgroundElement,
  },
  sectionTitle: {
    fontFamily: Fonts.heading,
    fontSize: 18,
    color: colors.text,
  },
  sectionDescription: {
    fontFamily: Fonts.body,
    fontSize: 11,
    lineHeight: 17,
    color: colors.textSecondary,
  },
  description: {
    fontFamily: Fonts.body,
    fontSize: 13,
    lineHeight: 21,
    color: colors.textSecondary,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.three,
  },
  detailIcon: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Radius.md,
    backgroundColor: "#E8F4F1",
  },
  detailCopy: {
    flex: 1,
    gap: 4,
    paddingTop: 2,
  },
  detailLabel: {
    fontFamily: Fonts.body,
    fontSize: 11,
    color: colors.textSecondary,
  },
  detailValue: {
    fontFamily: Fonts.button,
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 19,
    color: colors.text,
  },
  actionsCard: {
    padding: Spacing.three,
    gap: Spacing.two,
    borderRadius: Radius.lg,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: colors.backgroundElement,
  },
  cancelDonationButton: {
    minHeight: 46,
    marginTop: Spacing.two,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.two,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: Radius.md,
  },
  cancelDonationText: {
    fontFamily: Fonts.button,
    fontSize: 12,
    fontWeight: "700",
    color: colors.primary,
  },
  primaryButton: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.two,
    paddingHorizontal: Spacing.four,
    borderRadius: Radius.md,
    backgroundColor: colors.primary,
  },
  primaryButtonText: {
    fontFamily: Fonts.button,
    fontSize: 12,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.four,
    gap: Spacing.three,
    backgroundColor: colors.background,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 32,
    backgroundColor: "#E8F4F1",
  },
  emptyTitle: {
    fontFamily: Fonts.heading,
    fontSize: 21,
    color: colors.text,
  },
  helperText: {
    fontFamily: Fonts.body,
    fontSize: 12,
    lineHeight: 19,
    textAlign: "center",
    color: colors.textSecondary,
  },
  pressed: {
    opacity: 0.72,
  },
  disabledButton: {
    opacity: 0.6,
  },
});