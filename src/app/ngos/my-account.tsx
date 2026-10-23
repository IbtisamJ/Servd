
/**
 * NGO My Account Screen
 *
 * Displays the signed-in NGO user's account details and organisation
 * information retrieved from Firebase Authentication and Firestore.
 *
 * This screen is read-only for now. We can add editing functionality later.
 */

import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    View
} from "react-native";
import { auth, db } from "../../config/firebase";
import { Colors, Fonts, Radius, Spacing } from "../../constants/theme";

// Use the existing Servd theme.
const colors = Colors.light;

// Describes the account information this screen will display.
type NGOAccount = {
  email: string;
  fullName: string;
  organisationName: string;
  phone: string;
  address: string;
  registrationNumber: string;
  verificationStatus: string;
};

export default function MyAccountScreen() {
  // Holds the NGO details loaded from Firebase.
  const [account, setAccount] = useState<NGOAccount | null>(null);

  // Tracks whether the initial Firebase request is still running.
  const [loading, setLoading] = useState(true);

  // Shows a message if account information cannot be loaded.
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    // Listen for login and logout changes so the screen uses the current user.
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

        // Read the NGO document using the signed-in user's Firebase UID.
        const ngoRef = doc(db, "ngos", user.uid);
        const ngoSnapshot = await getDoc(ngoRef);

        if (!ngoSnapshot.exists()) {
          setAccount(null);
          setErrorMessage(
            "We could not find an organisation profile linked to your account."
          );
          return;
        }

        // Use the stored fields when available; fall back to safe display values.
        const ngoData = ngoSnapshot.data();

        setAccount({
          email: user.email ?? "",
          fullName: ngoData.fullName ?? ngoData.contactPerson ?? "",
          organisationName: ngoData.organisationName ?? "",
          phone: ngoData.phone ?? ngoData.contactNumber ?? "",
          address: ngoData.address ?? "",
          registrationNumber: ngoData.registrationNumber ?? "",
          verificationStatus: ngoData.verificationStatus ?? ngoData.status ?? "Pending",
        });
      } catch (error) {
        // Log the technical error for debugging without exposing it to the user.
        console.error("Failed to load NGO account:", error);
        setErrorMessage("Unable to load your account. Please try again later.");
      } finally {
        setLoading(false);
      }
    });

    // Stop listening when the screen is unmounted.
    return unsubscribe;
  }, []);

  // Show a loading state while Firebase checks the signed-in user and profile.
  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.helperText}>Loading your account...</Text>
      </View>
    );
  }

  // Explain what went wrong if the profile could not be retrieved.
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

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Brief introduction to the account page. */}
      <Text style={styles.intro}>
        View your account and the organisation details registered with Servd.
      </Text>

      {/* Personal account details. */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Account Details</Text>

        <AccountField label="Email address" value={account.email} />
        <AccountField label="Full name" value={account.fullName} />
        <AccountField label="Phone number" value={account.phone} />
      </View>

      {/* Organisation details stored in the NGO Firestore document. */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Organisation Details</Text>

        <AccountField
          label="Organisation name"
          value={account.organisationName}
        />
        <AccountField
          label="Registration number"
          value={account.registrationNumber}
        />
        <AccountField label="Address" value={account.address} />

        {/* Display the status currently stored in Firestore. */}
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Verification status</Text>
          <Text style={styles.statusValue}>
            {account.verificationStatus}
          </Text>
        </View>
      </View>

      {/* Editing can be added as a separate feature after the data is verified. */}
      <Text style={styles.note}>
        Need to update your details? Please contact the Servd administration
        team.
      </Text>
    </ScrollView>
  );
}

/**
 * Reusable field component keeps account details consistently formatted.
 * Missing values are displayed clearly rather than showing undefined.
 */
function AccountField({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text style={styles.fieldValue}>
        {value.trim() ? value : "Not provided"}
      </Text>
    </View>
  );
}

// Styles follow the simple card-based appearance used throughout Servd.
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
