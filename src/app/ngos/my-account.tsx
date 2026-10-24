/**
 * NGO My Account Screen
 *
 * Displays the signed-in NGO user's account and organisation details
 * using fields currently stored in Firebase.
 *
 * This screen is read-only.
 */

import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { auth, db } from "../../config/firebase";
import { Colors, Fonts, Radius, Spacing } from "../../constants/theme";

const colors = Colors.light;

type NGOAccount = {
  email: string;
  organisationName: string;
  contactInfo: string;
  npoNumber: string;
  verificationStatus: string;
};

export default function MyAccountScreen() {
  const [account, setAccount] = useState<NGOAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setAccount(null);
        setErrorMessage("Please sign in to view your account.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setErrorMessage("");

        // NGO profile documents use the authenticated user's UID.
        const ngoRef = doc(db, "ngos", user.uid);
        const ngoSnapshot = await getDoc(ngoRef);

        if (!ngoSnapshot.exists()) {
          setAccount(null);
          setErrorMessage(
            "We could not find an organisation profile linked to your account.",
          );
          return;
        }

        const ngoData = ngoSnapshot.data();

        setAccount({
          email: user.email ?? "",
          organisationName: ngoData.organisationName ?? "",
          contactInfo: ngoData.contactInfo ?? "",
          npoNumber: ngoData.npoNumber ?? "",
          verificationStatus: ngoData.verificationStatus ?? "pending",
        });
      } catch (error) {
        console.error("Failed to load NGO account:", error);
        setAccount(null);
        setErrorMessage("Unable to load your account. Please try again later.");
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.helperText}>Loading your account...</Text>
      </View>
    );
  }

  if (errorMessage || !account) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorTitle}>Account unavailable</Text>
        <Text style={styles.helperText}>
          {errorMessage || "Your account details could not be displayed."}
        </Text>
      </View>
    );
  }

  const formattedStatus =
    account.verificationStatus.charAt(0).toUpperCase() +
    account.verificationStatus.slice(1);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.intro}>
        View your account and the organisation details registered with Servd.
      </Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Account Details</Text>

        <AccountField label="Account email" value={account.email} />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Organisation Details</Text>

        <AccountField
          label="Organisation name"
          value={account.organisationName}
        />

        <AccountField
          label="NPO registration number"
          value={account.npoNumber}
        />

        <AccountField label="Contact information" value={account.contactInfo} />

        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Verification status</Text>
          <Text style={styles.statusValue}>{formattedStatus}</Text>
        </View>
      </View>

      <Text style={styles.note}>
        Need to update your details? Please contact the Servd administration
        team.
      </Text>
    </ScrollView>
  );
}

function AccountField({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text style={styles.fieldValue}>
        {value.trim() ? value : "Not provided"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },

  content: {
    padding: Spacing.four,
    paddingBottom: Spacing.five,
    gap: Spacing.three,
  },

  intro: {
    fontFamily: Fonts.body,
    fontSize: 14,
    lineHeight: 21,
    color: colors.textSecondary,
    marginBottom: Spacing.one,
  },

  card: {
    padding: Spacing.four,
    backgroundColor: colors.backgroundElement,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: "#E8DCC8",
  },

  cardTitle: {
    fontFamily: Fonts.heading,
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
    marginBottom: Spacing.two,
  },

  field: {
    paddingVertical: Spacing.two,
    borderBottomWidth: 1,
    borderBottomColor: "#E0D5C5",
  },

  fieldLabel: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 5,
  },

  fieldValue: {
    fontFamily: Fonts.body,
    fontSize: 15,
    color: colors.text,
  },

  statusValue: {
    fontFamily: Fonts.body,
    fontSize: 14,
    fontWeight: "700",
    color: colors.primary,
  },

  note: {
    fontFamily: Fonts.body,
    fontSize: 12,
    lineHeight: 18,
    color: colors.textSecondary,
    marginTop: Spacing.one,
  },

  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.four,
    gap: Spacing.two,
    backgroundColor: colors.background,
  },

  helperText: {
    fontFamily: Fonts.body,
    fontSize: 14,
    lineHeight: 21,
    color: colors.textSecondary,
    textAlign: "center",
  },

  errorTitle: {
    fontFamily: Fonts.heading,
    fontSize: 18,
    fontWeight: "700",
    color: colors.error,
  },
});
