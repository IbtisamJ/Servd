import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import FontAwesome5 from "@react-native-vector-icons/fontawesome5";
import { SafeAreaView } from "react-native-safe-area-context";

import { BrandHeader } from "@/components/enterprise";
import { auth, db } from "@/config/firebase";
import { Colors, Fonts, Radius, Spacing } from "@/constants/theme";
import { COLLECTIONS, RESERVATION_STATUS } from "@/constants/roles";
import {
  markReservationCollected,
  cancelReservation,
} from "@/services/reservationService";

type ReservationData = {
  enterpriseId?: string;
  donationId?: string;
  donationDocumentId?: string;
  ngoId?: string;
  foodName?: string;
  collectionLocation?: string;
  status?: string;
  createdTimestamp?: { toDate?: () => Date } | Date | string;
  updatedTimestamp?: unknown;
};

export default function ReservationDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [reservation, setReservation] = useState<ReservationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    let unsubscribeReservation: (() => void) | undefined;
    let active = true;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      unsubscribeReservation?.();
      unsubscribeReservation = undefined;

      if (!user) {
        setReservation(null);
        setLoading(false);
        router.replace("/Login" as never);
        return;
      }

      if (!id) {
        setReservation(null);
        setLoading(false);
        return;
      }

      setLoading(true);

      unsubscribeReservation = onSnapshot(
        doc(db, COLLECTIONS.RESERVATIONS, id),
        (snapshot) => {
          if (!active) return;

          if (!snapshot.exists()) {
            setReservation(null);
            setLoading(false);
            return;
          }

          const data = snapshot.data() as ReservationData;

          if (data.enterpriseId !== user.uid) {
            setReservation(null);
            setLoading(false);
            return;
          }

          setReservation(data);
          setLoading(false);
        },
        (error) => {
          console.error("Reservation loading error:", error);

          if (!active) return;

          setLoading(false);
          Alert.alert(
            "Unable to load reservation",
            "Please check your connection and try again.",
          );
        },
      );
    });

    return () => {
      active = false;
      unsubscribeAuth();
      unsubscribeReservation?.();
    };
  }, [id, router]);

  const formatDate = (value: unknown): string => {
    if (!value) return "Not provided";

    let date: Date | null = null;

    if (value instanceof Date) {
      date = value;
    } else if (typeof value === "string") {
      const parsed = new Date(value);
      if (!Number.isNaN(parsed.getTime())) date = parsed;
    } else if (
      typeof value === "object" &&
      value !== null &&
      "toDate" in value &&
      typeof value.toDate === "function"
    ) {
      date = value.toDate();
    }

    if (!date || Number.isNaN(date.getTime())) {
      return "Not provided";
    }

    return date.toLocaleString(undefined, {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const confirmStatusChange = (action: "collect" | "cancel") => {
    if (!reservation || !id || updating) return;

    const donationDocumentId = reservation.donationDocumentId;

    if (!donationDocumentId) {
      Alert.alert(
        "Missing donation reference",
        "This reservation does not contain donationDocumentId, so its donation cannot be updated safely.",
      );
      return;
    }

    const isCollecting = action === "collect";

    Alert.alert(
      isCollecting ? "Confirm collection" : "Cancel reservation",
      isCollecting
        ? "Mark this reservation and its donation as collected?"
        : "Cancel this reservation and make its donation available again?",
      [
        { text: "Keep reservation", style: "cancel" },
        {
          text: isCollecting ? "Mark collected" : "Cancel reservation",
          style: isCollecting ? "default" : "destructive",
          onPress: async () => {
            setUpdating(true);

            try {
              if (isCollecting) {
                await markReservationCollected(id, donationDocumentId);
              } else {
                await cancelReservation(id, donationDocumentId);
              }

              Alert.alert(
                "Success",
                isCollecting
                  ? "The reservation and donation have been marked as collected."
                  : "The reservation has been cancelled and the donation is available again.",
              );
            } catch (error) {
              console.error("Reservation update error:", error);
              Alert.alert(
                "Could not update reservation",
                error instanceof Error ? error.message : "Please try again.",
              );
            } finally {
              setUpdating(false);
            }
          },
        },
      ],
    );
  };

  const renderDetail = (icon: string, label: string, value: string) => (
    <View style={styles.detailRow} key={label}>
      <View style={styles.detailIcon}>
        <FontAwesome5
          name={icon as never}
          iconStyle="solid"
          size={16}
          color={Colors.light.secondary}
        />
      </View>

      <View style={styles.detailContent}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>{value}</Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.light.primary} />
          <Text style={styles.mutedText}>Loading reservation...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!reservation) {
    return (
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <View style={styles.center}>
          <FontAwesome5
            name="clipboard-list"
            iconStyle="solid"
            size={34}
            color={Colors.light.secondary}
          />
          <Text style={styles.emptyTitle}>Reservation not found</Text>
          <Text style={styles.mutedText}>
            This reservation may not exist or may belong to another account.
          </Text>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.back()}
          >
            <Text style={styles.primaryButtonText}>Go back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const status = (reservation.status ?? "unknown").toLowerCase();
  const isActive = status === RESERVATION_STATUS.ACTIVE;

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.screen}>
        <Stack.Screen options={{ title: "Reservation details" }} />

        <BrandHeader
          role="ENTERPRISE"
          actionLabel="Collections"
          onActionPress={() =>
            router.replace("/enterprises/reservations" as never)
          }
        />

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <FontAwesome5
              name="arrow-left"
              iconStyle="solid"
              size={15}
              color={Colors.light.text}
            />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>

          <Text style={styles.eyebrow}>RESERVATION DETAILS</Text>
          <Text style={styles.title}>
            {reservation.foodName || "Food reservation"}
          </Text>
          <Text style={styles.subtitle}>
            Review the reservation and manage collection.
          </Text>

          <View style={styles.statusCard}>
            <FontAwesome5
              name={
                status === RESERVATION_STATUS.COLLECTED
                  ? "check-circle"
                  : status === RESERVATION_STATUS.CANCELLED
                    ? "times-circle"
                    : "clock"
              }
              iconStyle="solid"
              size={25}
              color={
                status === RESERVATION_STATUS.CANCELLED
                  ? Colors.light.error
                  : Colors.light.secondary
              }
            />
            <View style={styles.statusContent}>
              <Text style={styles.detailLabel}>Current status</Text>
              <Text style={styles.statusValue}>
                {status.replace(/_/g, " ")}
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Reservation information</Text>
            <View style={styles.card}>
              {renderDetail(
                "utensils",
                "Food item",
                reservation.foodName || "Not provided",
              )}
              {renderDetail(
                "calendar-plus",
                "Reserved on",
                formatDate(reservation.createdTimestamp),
              )}
              {renderDetail(
                "user",
                "NGO account UID",
                reservation.ngoId || "Not provided",
              )}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Collection details</Text>
            <View style={styles.card}>
              {renderDetail(
                "map-marker-alt",
                "Collection location",
                reservation.collectionLocation || "Not provided",
              )}
              {renderDetail(
                "hashtag",
                "Donation ID",
                reservation.donationId || "Not provided",
              )}
            </View>
          </View>

          {isActive && (
            <View style={styles.actions}>
              <TouchableOpacity
                style={[
                  styles.primaryButton,
                  updating && styles.disabledButton,
                ]}
                disabled={updating}
                onPress={() => confirmStatusChange("collect")}
              >
                {updating ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <FontAwesome5
                      name="check"
                      iconStyle="solid"
                      size={16}
                      color="#FFFFFF"
                    />
                    <Text style={styles.primaryButtonText}>
                      Mark as collected
                    </Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.cancelButton, updating && styles.disabledButton]}
                disabled={updating}
                onPress={() => confirmStatusChange("cancel")}
              >
                <Text style={styles.cancelButtonText}>Cancel reservation</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  screen: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.four,
    gap: Spacing.three,
    backgroundColor: Colors.light.background,
  },
  scrollContent: {
    padding: Spacing.three,
    paddingBottom: Spacing.five,
    width: "100%",
    maxWidth: 800,
    alignSelf: "center",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    marginBottom: Spacing.four,
  },
  backText: {
    fontFamily: Fonts.body,
    fontSize: 13,
    color: Colors.light.text,
  },
  eyebrow: {
    fontFamily: Fonts.button,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.4,
    color: Colors.light.secondary,
    marginBottom: Spacing.one,
  },
  title: {
    fontFamily: Fonts.heading,
    fontSize: 27,
    fontWeight: "700",
    color: Colors.light.text,
  },
  subtitle: {
    fontFamily: Fonts.body,
    fontSize: 14,
    lineHeight: 21,
    color: Colors.light.textSecondary,
    marginTop: Spacing.two,
    marginBottom: Spacing.four,
  },
  statusCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
    padding: Spacing.three,
    backgroundColor: "#FFFFFF",
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.light.backgroundElement,
    marginBottom: Spacing.four,
  },
  statusContent: {
    flex: 1,
  },
  statusValue: {
    fontFamily: Fonts.button,
    fontSize: 16,
    fontWeight: "700",
    color: Colors.light.text,
    textTransform: "capitalize",
    marginTop: Spacing.one,
  },
  section: {
    marginBottom: Spacing.four,
  },
  sectionTitle: {
    fontFamily: Fonts.heading,
    fontSize: 18,
    fontWeight: "700",
    color: Colors.light.text,
    marginBottom: Spacing.two,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.light.backgroundElement,
    paddingHorizontal: Spacing.three,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
    paddingVertical: Spacing.three,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.light.backgroundElement,
  },
  detailIcon: {
    width: 38,
    height: 38,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.light.background,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: Colors.light.textSecondary,
    marginBottom: Spacing.one,
  },
  detailValue: {
    fontFamily: Fonts.body,
    fontSize: 14,
    fontWeight: "600",
    color: Colors.light.text,
  },
  actions: {
    gap: Spacing.two,
    marginTop: Spacing.two,
  },
  primaryButton: {
    minHeight: 50,
    borderRadius: Radius.md,
    backgroundColor: Colors.light.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
  },
  primaryButtonText: {
    fontFamily: Fonts.button,
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  cancelButton: {
    minHeight: 48,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.light.error,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.three,
  },
  cancelButtonText: {
    fontFamily: Fonts.button,
    fontSize: 14,
    fontWeight: "700",
    color: Colors.light.error,
  },
  disabledButton: {
    opacity: 0.65,
  },
  emptyTitle: {
    fontFamily: Fonts.heading,
    fontSize: 21,
    fontWeight: "700",
    color: Colors.light.text,
    textAlign: "center",
  },
  mutedText: {
    fontFamily: Fonts.body,
    fontSize: 14,
    lineHeight: 21,
    color: Colors.light.textSecondary,
    textAlign: "center",
  },
});
