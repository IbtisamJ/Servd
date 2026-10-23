import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import FontAwesome5 from "@react-native-vector-icons/fontawesome5";

import { auth, db } from "@/config/firebase";
import { Colors, Fonts, Radius, Spacing } from "@/constants/theme";
import { COLLECTIONS } from "@/constants/roles";
import { BrandHeader } from "@/components/enterprise";

type ProfileData = Record<string, unknown>;

export default function EnterpriseProfileScreen() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [enterprise, setEnterprise] = useState<ProfileData | null>(null);
  const [account, setAccount] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    let unsubscribeEnterprise: (() => void) | undefined;
    let unsubscribeAccount: (() => void) | undefined;

    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      unsubscribeEnterprise?.();
      unsubscribeAccount?.();

      setUser(currentUser);

      if (!currentUser) {
        setEnterprise(null);
        setAccount(null);
        setLoading(false);
        router.replace("/Login" as never);
        return;
      }

      setLoading(true);

      unsubscribeEnterprise = onSnapshot(
        doc(db, COLLECTIONS.ENTERPRISES, currentUser.uid),
        (snapshot) => {
          setEnterprise(
            snapshot.exists() ? (snapshot.data() as ProfileData) : null,
          );
          setLoading(false);
        },
        (error) => {
          console.error("Error loading enterprise profile:", error);
          setLoading(false);
        },
      );

      unsubscribeAccount = onSnapshot(
        doc(db, COLLECTIONS.USERS, currentUser.uid),
        (snapshot) => {
          setAccount(
            snapshot.exists() ? (snapshot.data() as ProfileData) : null,
          );
        },
        (error) => {
          console.error("Error loading account details:", error);
        },
      );
    });

    return () => {
      unsubscribeAuth();
      unsubscribeEnterprise?.();
      unsubscribeAccount?.();
    };
  }, [router]);

  const getString = (
    data: ProfileData | null,
    keys: string[],
  ): string | null => {
    if (!data) return null;

    for (const key of keys) {
      const value = data[key];

      if (typeof value === "string" && value.trim()) {
        return value.trim();
      }
    }

    return null;
  };

  const enterpriseName =
    getString(enterprise, [
      "enterpriseName",
      "businessName",
      "organizationName",
      "name",
      "companyName",
    ]) ?? "Enterprise profile";

  const email =
    getString(account, ["email"]) ??
    getString(enterprise, ["email"]) ??
    user?.email ??
    "Not provided";

  const phone =
    getString(enterprise, ["phoneNumber", "phone", "contactNumber"]) ??
    getString(account, ["phoneNumber", "phone", "contactNumber"]) ??
    "Not provided";

  const address =
    getString(enterprise, [
      "address",
      "businessAddress",
      "location",
      "physicalAddress",
    ]) ?? "Not provided";

  const accountStatus =
    getString(enterprise, ["status", "accountStatus"]) ??
    getString(account, ["status", "accountStatus"]) ??
    "Not specified";

  const handleSignOut = () => {
    Alert.alert("Sign out", "Are you sure you want to sign out?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Sign out",
        style: "destructive",
        onPress: async () => {
          try {
            setSigningOut(true);
            await signOut(auth);
            router.replace("/Login" as never);
          } catch (error) {
            console.error("Sign-out error:", error);
            Alert.alert("Sign out failed", "Please try again.");
          } finally {
            setSigningOut(false);
          }
        },
      },
    ]);
  };

  const renderInfoRow = (icon: string, label: string, value: string) => (
    <View style={styles.infoRow} key={label}>
      <View style={styles.infoIcon}>
        <FontAwesome5
          name={icon as never}
          size={16}
          color={Colors.light.secondary}
          iconStyle="solid"
        />
      </View>

      <View style={styles.infoContent}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
        <Text style={styles.loadingText}>Loading your profile...</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      {/* Shared Servd branding keeps enterprise screens consistent. */}
      <BrandHeader
        role="ENTERPRISE"
        actionLabel="Home"
        onActionPress={() => router.replace("/enterprises" as never)}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.eyebrow}>YOUR ACCOUNT</Text>
          <Text style={styles.title}>Profile</Text>
          <Text style={styles.subtitle}>
            Manage your enterprise account information.
          </Text>
        </View>

        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <FontAwesome5
              name="store"
              iconStyle="solid"
              size={30}
              color={Colors.light.primary}
            />
          </View>

          <Text style={styles.enterpriseName}>{enterpriseName}</Text>
          <Text style={styles.profileEmail}>{email}</Text>

          <View style={styles.statusPill}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>{accountStatus}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Enterprise information</Text>

          <View style={styles.infoCard}>
            {renderInfoRow("store", "Business name", enterpriseName)}
            {renderInfoRow("envelope", "Email address", email)}
            {renderInfoRow("phone", "Phone number", phone)}
            {renderInfoRow("map-marker-alt", "Address", address)}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account details</Text>

          <View style={styles.infoCard}>
            {renderInfoRow(
              "user",
              "Account type",
              getString(account, ["role"]) ??
                getString(enterprise, ["role"]) ??
                "Enterprise",
            )}

            {renderInfoRow(
              "id-card",
              "Account ID",
              user?.uid ?? "Not available",
            )}
          </View>
        </View>

        {!enterprise && (
          <View style={styles.noticeCard}>
            <FontAwesome5
              name="info-circle"
              iconStyle="solid"
              size={18}
              color={Colors.light.secondary}
            />
            <Text style={styles.noticeText}>
              An enterprise profile document could not be found. Some details
              may be unavailable. Check that your Firestore document ID matches
              your account UID.
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.signOutButton, signingOut && styles.disabledButton]}
          onPress={handleSignOut}
          disabled={signingOut}
          activeOpacity={0.8}
        >
          {signingOut ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <FontAwesome5
                name="sign-out-alt"
                iconStyle="solid"
                size={17}
                color="#FFFFFF"
              />
              <Text style={styles.signOutText}>Sign out</Text>
            </>
          )}
        </TouchableOpacity>

        <Text style={styles.footerText}>
          Servd · Connecting surplus food with communities
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.light.background,
    gap: Spacing.two,
  },
  loadingText: {
    fontFamily: Fonts.body,
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
  scrollContent: {
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.four,
    paddingBottom: 120,
    width: "100%",
    maxWidth: 800,
    alignSelf: "center",
  },
  header: {
    marginBottom: Spacing.four,
  },
  eyebrow: {
    fontFamily: Fonts.button,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.5,
    color: Colors.light.secondary,
    marginBottom: Spacing.one,
  },
  title: {
    fontFamily: Fonts.heading,
    fontSize: 30,
    fontWeight: "700",
    color: Colors.light.text,
  },
  subtitle: {
    fontFamily: Fonts.body,
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginTop: Spacing.one,
    lineHeight: 21,
  },
  profileCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: Radius.lg,
    padding: Spacing.four,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.light.backgroundElement,
    marginBottom: Spacing.four,
  },
  avatar: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: Colors.light.background,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.three,
    borderWidth: 1,
    borderColor: Colors.light.backgroundElement,
  },
  enterpriseName: {
    fontFamily: Fonts.heading,
    fontSize: 21,
    fontWeight: "700",
    color: Colors.light.text,
    textAlign: "center",
  },
  profileEmail: {
    fontFamily: Fonts.body,
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginTop: Spacing.one,
    textAlign: "center",
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    backgroundColor: Colors.light.background,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Radius.md,
    marginTop: Spacing.three,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.light.accent,
  },
  statusText: {
    fontFamily: Fonts.button,
    fontSize: 12,
    fontWeight: "600",
    color: Colors.light.text,
    textTransform: "capitalize",
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
  infoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.three,
    borderWidth: 1,
    borderColor: Colors.light.backgroundElement,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.three,
    gap: Spacing.three,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.light.backgroundElement,
  },
  infoIcon: {
    width: 38,
    height: 38,
    borderRadius: Radius.md,
    backgroundColor: Colors.light.background,
    justifyContent: "center",
    alignItems: "center",
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: Colors.light.textSecondary,
    marginBottom: Spacing.one,
  },
  infoValue: {
    fontFamily: Fonts.body,
    fontSize: 14,
    color: Colors.light.text,
    fontWeight: "600",
  },
  noticeCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.two,
    padding: Spacing.three,
    backgroundColor: Colors.light.backgroundElement,
    borderRadius: Radius.md,
    marginBottom: Spacing.four,
  },
  noticeText: {
    flex: 1,
    fontFamily: Fonts.body,
    fontSize: 13,
    lineHeight: 19,
    color: Colors.light.text,
  },
  signOutButton: {
    minHeight: 50,
    borderRadius: Radius.md,
    backgroundColor: Colors.light.primary,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: Spacing.two,
    marginTop: Spacing.one,
  },
  disabledButton: {
    opacity: 0.7,
  },
  signOutText: {
    fontFamily: Fonts.button,
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  footerText: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: Colors.light.textSecondary,
    textAlign: "center",
    marginTop: Spacing.four,
  },
});
