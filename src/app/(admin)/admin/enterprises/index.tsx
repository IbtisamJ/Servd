/**
 * Enterprise List Screen
 *
 * Retrieves registered food enterprise documents from Firestore
 * and displays them in the administrator interface.
 *
 * Responsibilities:
 * - Loads enterprise records from Firestore.
 * - Displays available enterprise information.
 * - Handles loading and error states where implemented.
 * - Allows administrators to select an enterprise for more information.
 * - Navigates to the selected enterprise's detail screen.
 */

import FontAwesome5 from "@react-native-vector-icons/fontawesome5";
import { useRouter } from "expo-router";
import { collection, getDocs } from "firebase/firestore";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { db } from "@/config/firebase";
import { COLLECTIONS } from "@/constants/roles";
import { Colors, Fonts, Spacing } from "@/constants/theme";

const colors = Colors.light;

type Enterprise = {
  id: string;
  enterpriseName?: string;
  contactName?: string;
  email?: string;
  phone?: string;
};

export default function EnterprisesScreen() {
  const router = useRouter();
  const [enterprises, setEnterprises] = useState<Enterprise[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadEnterprises = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const snapshot = await getDocs(
        collection(db, COLLECTIONS.ENTERPRISES)
      );

      setEnterprises(
        snapshot.docs.map((document) => ({
          id: document.id,
          ...document.data(),
        })) as Enterprise[]
      );
    } catch (err) {
      console.error("Error loading enterprises:", err);
      setError("Unable to load enterprises. Check your connection and permissions.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEnterprises();
  }, [loadEnterprises]);

  const filtered = enterprises.filter((enterprise) =>
    `${enterprise.enterpriseName ?? ""} ${enterprise.contactName ?? ""} ${enterprise.email ?? ""}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <View style={styles.heading}>
        <View>
          <Text style={styles.title}>Food enterprises</Text>
          <Text style={styles.subtitle}>
            {enterprises.length} registered enterprises
          </Text>
        </View>

        <Pressable onPress={loadEnterprises} style={styles.refresh}>
          <FontAwesome5 name="sync-alt" size={15} color={colors.primary} iconStyle="solid"/>
        </Pressable>
      </View>

      <View style={styles.searchBox}>
        <FontAwesome5 name="search" size={15} color={colors.textSecondary} iconStyle="solid"/>
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search enterprises..."
          placeholderTextColor={colors.textSecondary}
          style={styles.searchInput}
        />
      </View>

      {loading ? (
        <ActivityIndicator color={colors.primary} style={styles.loader} />
      ) : error ? (
        <Pressable onPress={loadEnterprises} style={styles.message}>
          <Text style={styles.error}>{error}</Text>
          <Text style={styles.retry}>Tap to retry</Text>
        </Pressable>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text style={styles.empty}>No enterprises found.</Text>
          }
          renderItem={({ item }) => (
            <Pressable
              style={styles.card}
              onPress={() =>
                router.push(`/admin/enterprises/${item.id}` as never)
              }
            >
              <View style={styles.icon}>
                <FontAwesome5 name="store" size={19} color={colors.secondary} iconStyle="solid"/>
              </View>

              <View style={styles.details}>
                <Text style={styles.name}>
                  {item.enterpriseName || "Unnamed enterprise"}
                </Text>
                <Text style={styles.contact}>
                  {item.contactName || item.email || "No contact details"}
                </Text>
                {item.phone ? (
                  <Text style={styles.contact}>{item.phone}</Text>
                ) : null}
              </View>

              <FontAwesome5
                name="chevron-right"
                size={13}
                color={colors.textSecondary}
                iconStyle="solid"
              />
            </Pressable>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: Spacing.three,
  },
  heading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.three,
  },
  title: {
    fontFamily: Fonts.heading,
    fontSize: 22,
    fontWeight: "700",
    color: colors.text,
  },
  subtitle: {
    fontFamily: Fonts.body,
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
  },
  refresh: {
    padding: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#EAE7E1",
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: Spacing.three,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    color: colors.text,
    fontFamily: Fonts.body,
  },
  list: {
    gap: Spacing.two,
    paddingBottom: Spacing.four,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#EAE7E1",
    borderRadius: 10,
    padding: Spacing.three,
  },
  icon: {
    width: 42,
    height: 42,
    borderRadius: 9,
    backgroundColor: "#E8F3F1",
    alignItems: "center",
    justifyContent: "center",
  },
  details: {
    flex: 1,
    gap: 4,
  },
  name: {
    fontFamily: Fonts.body,
    fontSize: 15,
    fontWeight: "700",
    color: colors.text,
  },
  contact: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: colors.textSecondary,
  },
  loader: {
    marginTop: 40,
  },
  message: {
    padding: Spacing.three,
    alignItems: "center",
  },
  error: {
    color: colors.error,
    textAlign: "center",
  },
  retry: {
    color: colors.primary,
    marginTop: 8,
  },
  empty: {
    textAlign: "center",
    color: colors.textSecondary,
    padding: Spacing.four,
  },
});