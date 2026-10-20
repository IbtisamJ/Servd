/**
 * Enterprise Details Screen
 *
 * Retrieves and displays a selected food enterprise's Firestore
 * document using its document ID.
 *
 * Responsibilities:
 * - Loads the selected enterprise document.
 * - Displays the enterprise name, contact name, email, phone number,
 *   and address information where available.
 * - Displays the record's creation date where available.
 * - Handles missing records and loading states.
 * - Provides navigation back to the enterprise list.
 */

import FontAwesome5 from "@react-native-vector-icons/fontawesome5";
import { useLocalSearchParams, useRouter } from "expo-router";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { db } from "@/config/firebase";
import { COLLECTIONS } from "@/constants/roles";
import { Colors, Fonts, Spacing } from "@/constants/theme";

const colors = Colors.light;

type Enterprise = {
  enterpriseName?: string;
  contactName?: string;
  email?: string;
  phone?: string;
  address?: string;
  businessAddress?: string;
  createdAt?: { toDate?: () => Date } | string;
};

export default function EnterpriseDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [enterprise, setEnterprise] = useState<Enterprise | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadEnterprise() {
      if (!id) {
        setError("Enterprise ID is missing.");
        setLoading(false);
        return;
      }

      try {
        const snapshot = await getDoc(doc(db, COLLECTIONS.ENTERPRISES, id));

        if (!snapshot.exists()) {
          if (active) setError("Enterprise not found.");
          return;
        }

        if (active) setEnterprise(snapshot.data() as Enterprise);
      } catch (err) {
        console.error("Error loading enterprise:", err);
        if (active) setError("Unable to load enterprise details.");
      } finally {
        if (active) setLoading(false);
      }
    }

    loadEnterprise();
    return () => {
      active = false;
    };
  }, [id]);

  const dateValue = enterprise?.createdAt;
  const createdAt =
    dateValue && typeof dateValue === "object" && "toDate" in dateValue
      ? dateValue.toDate?.().toLocaleDateString()
      : typeof dateValue === "string"
        ? dateValue
        : undefined;

  function detail(label: string, value?: string) {
    return (
      <View style={styles.detail} key={label}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{value || "Not provided"}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Pressable onPress={() => router.back()} style={styles.back}>
          <FontAwesome5 name="arrow-left" size={14} color={colors.primary} iconStyle="solid"/>
          <Text style={styles.backText}>Back to enterprises</Text>
        </Pressable>

        {loading ? (
          <ActivityIndicator color={colors.primary} style={styles.loader} />
        ) : error ? (
          <Text style={styles.error}>{error}</Text>
        ) : enterprise ? (
          <>
            <View style={styles.profile}>
              <View style={styles.icon}>
                <FontAwesome5 name="store" size={26} color={colors.secondary} iconStyle="solid"/>
              </View>
              <Text style={styles.title}>
                {enterprise.enterpriseName || "Unnamed enterprise"}
              </Text>
              <Text style={styles.subtitle}>Food enterprise</Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Contact information</Text>
              {detail("Contact person", enterprise.contactName)}
              {detail("Email", enterprise.email)}
              {detail("Phone", enterprise.phone)}
            </View>

            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Business information</Text>
              {detail(
                "Business address",
                enterprise.businessAddress || enterprise.address,
              )}
              {detail("Registered on", createdAt)}
              <View style={styles.detail}>
                <Text style={styles.label}>Document ID</Text>
                <Text style={styles.value}>{id}</Text>
              </View>
            </View>
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: Spacing.three, gap: Spacing.three },
  back: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 8,
  },
  backText: {
    color: colors.primary,
    fontFamily: Fonts.body,
    fontWeight: "600",
  },
  loader: { marginTop: 40 },
  error: { color: colors.error, textAlign: "center", marginTop: 24 },
  profile: { alignItems: "center", paddingVertical: Spacing.four, gap: 8 },
  icon: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: "#E8F3F1",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  title: {
    fontFamily: Fonts.heading,
    fontSize: 23,
    fontWeight: "700",
    color: colors.text,
    textAlign: "center",
  },
  subtitle: {
    fontFamily: Fonts.body,
    color: colors.textSecondary,
    fontSize: 13,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#EAE7E1",
    padding: Spacing.three,
    gap: Spacing.three,
  },
  sectionTitle: {
    fontFamily: Fonts.heading,
    fontSize: 17,
    fontWeight: "700",
    color: colors.text,
  },
  detail: { gap: 4 },
  label: { fontFamily: Fonts.body, fontSize: 12, color: colors.textSecondary },
  value: { fontFamily: Fonts.body, fontSize: 14, color: colors.text },
});