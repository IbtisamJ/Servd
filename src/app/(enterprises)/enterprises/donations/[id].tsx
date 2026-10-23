
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
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

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

type Donation = {
  donationId?: string;
  enterpriseId: string;
  foodName: string;
  category: string;
  description: string;
  quantity: number;
  imageUrl?: string | null;
  collectionLocation: string;
  collectionDeadline: Date | { toDate: () => Date };
  expiryDate: Date | { toDate: () => Date };
  status: string;
  createdTimestamp?: Date | { toDate: () => Date } | null;
};

function toDate(value?: Date | { toDate: () => Date } | null): Date | null {
  if (!value) return null;

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  if (typeof value.toDate === "function") {
    const date = value.toDate();
    return Number.isNaN(date.getTime()) ? null : date;
  }

  return null;
}

function formatDate(value?: Date | { toDate: () => Date } | null) {
  const date = toDate(value);
  if (!date) return "Not provided";

  return date.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

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

  useEffect(() => {
    if (!id || !userId) {
      setLoading(false);
      return;
    }

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

        // Only show donations belonging to the signed-in enterprise.
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
  }, [id, userId]);

  const updateDonationStatus = async (
    nextStatus: (typeof DONATION_STATUS)[keyof typeof DONATION_STATUS],
  ) => {
    if (!id || !userId || !donation || updatingStatus) return;

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

  const confirmCancelDonation = () => {
    Alert.alert(
      "Cancel donation?",
      "This will mark the donation as cancelled.",
      [
        { text: "Keep donation", style: "cancel" },
        {
          text: "Cancel donation",
          style: "destructive",
          onPress: () =>
            updateDonationStatus(DONATION_STATUS.CANCELLED),
        },
      ],
    );
  };

  if (authLoading || loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.helperText}>Loading donation...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!userId) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}>
          <Text style={styles.helperText}>Redirecting to sign in...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!donation) {
    return (
      <SafeAreaView style={styles.safeArea}>
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
      </SafeAreaView>
    );
  }

  const statusStyle = getStatusStyle(donation.status);
  const isAvailable =
    donation.status === DONATION_STATUS.AVAILABLE;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.workspace}>
            <View style={styles.header}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Back to donations"
                onPress={() =>
                  router.replace("/enterprises/donations" as never)
                }
                style={styles.backButton}
              >
                <FontAwesome5
                  name="arrow-left"
                  size={16}
                  color={colors.text}
                  iconStyle="solid"
                />
              </Pressable>

              <View style={styles.headerCopy}>
                <Text style={styles.eyebrow}>YOUR ENTERPRISE</Text>
                <Text style={styles.heading}>Donation details</Text>
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
              <Text style={styles.sectionTitle}>Collection information</Text>

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
                  style={styles.cancelDonationButton}
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
                    Cancel donation
                  </Text>
                </Pressable>
              </View>
            ) : null}

            <Pressable
              accessibilityRole="button"
              onPress={() =>
                router.replace("/enterprises/donations" as never)
              }
              style={styles.primaryButton}
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

        <View style={styles.bottomNav}>
          <Pressable
            style={styles.navItem}
            onPress={() => router.replace("/enterprises" as never)}
          >
            <FontAwesome5
              name="home"
              size={19}
              color={colors.textSecondary}
              iconStyle="solid"
            />
            <Text style={styles.navLabel}>Home</Text>
          </Pressable>

          <Pressable
            style={styles.navItem}
            onPress={() =>
              router.replace("/enterprises/donations" as never)
            }
          >
            <FontAwesome5
              name="box-open"
              size={19}
              color={colors.primary}
              iconStyle="solid"
            />
            <Text style={[styles.navLabel, styles.navLabelActive]}>
              Donations
            </Text>
          </Pressable>

          <Pressable
            style={styles.navItem}
            onPress={() => router.push("/notifications" as never)}
          >
            <FontAwesome5
              name="bell"
              size={19}
              color={colors.textSecondary}
              iconStyle="solid"
            />
            <Text style={styles.navLabel}>Alerts</Text>
          </Pressable>

          <Pressable
            style={styles.navItem}
            onPress={() =>
              router.push("/enterprises/donations/create" as never)
            }
          >
            <View style={styles.addNavButton}>
              <FontAwesome5
                name="plus"
                size={18}
                color="#FFFFFF"
                iconStyle="solid"
              />
            </View>
            <Text style={styles.navLabel}>Add food</Text>
          </Pressable>

          <Pressable
            style={styles.navItem}
            onPress={() =>
              router.push("/enterprises/reservations" as never)
            }
          >
            <FontAwesome5
              name="clipboard-list"
              size={19}
              color={colors.textSecondary}
              iconStyle="solid"
            />
            <Text style={styles.navLabel}>Collections</Text>
          </Pressable>

          <Pressable
            style={styles.navItem}
            onPress={() => router.push("/enterprises/profile" as never)}
          >
            <FontAwesome5
              name="user-circle"
              size={19}
              color={colors.textSecondary}
              iconStyle="solid"
            />
            <Text style={styles.navLabel}>Profile</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
  },
  backButton: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Radius.md,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: colors.backgroundElement,
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
  bottomNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingTop: 9,
    paddingBottom: 8,
    paddingHorizontal: 2,
    borderTopWidth: 1,
    borderTopColor: colors.backgroundElement,
    backgroundColor: colors.background,
  },
  navItem: {
    flex: 1,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },
  navLabel: {
    fontFamily: Fonts.body,
    fontSize: 8,
    color: colors.textSecondary,
  },
  navLabelActive: {
    fontWeight: "700",
    color: colors.primary,
  },
  addNavButton: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 17,
    backgroundColor: colors.primary,
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
});