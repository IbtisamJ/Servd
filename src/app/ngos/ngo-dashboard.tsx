/**
 * NGO Dashboard Screen
 *
 * Main landing screen for an authenticated NGO user.
 */

import {
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import FontAwesome5 from "@react-native-vector-icons/fontawesome5";
import { router } from "expo-router";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";

import { auth, db } from "../../config/firebase";
import { Colors, Fonts, Radius, Spacing } from "../../constants/theme";

export default function NGODashboard() {
  const [organisationName, setOrganisationName] = useState("");

  /**
   * Log out the current NGO user and return to the login screen.
   */
  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.replace("/Login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setOrganisationName("");
        return;
      }

      try {
        const ngoRef = doc(db, "ngos", user.uid);
        const ngoSnapshot = await getDoc(ngoRef);

        if (ngoSnapshot.exists()) {
          const ngoData = ngoSnapshot.data();
          setOrganisationName(ngoData.organisationName ?? "");
        } else {
          setOrganisationName("");
        }
      } catch (error) {
        console.error("Error fetching NGO organisation name:", error);
        setOrganisationName("");
      }
    });

    return unsubscribe;
  }, []);

  const statusDetails: Record<
    string,
    { label: string; icon: string; color: string }
  > = {
    approved: {
      label: "Verified and approved",
      icon: "check-circle",
      color: Colors.light.accent,
    },
    pending: {
      label: "Verification pending",
      icon: "clock",
      color: Colors.light.secondary,
    },
    rejected: {
      label: "Verification unsuccessful",
      icon: "exclamation-circle",
      color: Colors.light.error,
    },
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Brand header */}
        <View style={styles.topBar}>
          <View style={styles.brandRow}>
            <Image
              source={require("../../../assets/images/Servd_Logo.png")}
              style={styles.brandIcon}
              resizeMode="contain"
              accessibilityLabel="Servd logo"
            />

            <Text style={styles.brandName}>Servd</Text>
          </View>

          <View style={styles.roleBadge}>
            <Text style={styles.roleBadgeText}>NGO</Text>
          </View>
        </View>

        {/* Personal welcome */}
        <View style={styles.welcomeSection}>
          <Text style={styles.eyebrow}>YOUR COMMUNITY, YOUR IMPACT</Text>

          <Text style={styles.heading}>
            Welcome back{organisationName ? "," : "."}
          </Text>

          {organisationName ? (
            <Text style={styles.organisationName}>
              {organisationName}
            </Text>
          ) : null}

          <Text style={styles.subtitle}>
            Good food is out there. Let's get it to the people who need it.
          </Text>
        </View>

        {/* Main donation feature */}
        <TouchableOpacity
          style={styles.featureCard}
          activeOpacity={0.88}
          onPress={() => router.push("/available-donations")}
          accessibilityRole="button"
          accessibilityLabel="Find available food donations"
        >
          <View style={styles.featureTopRow}>
            <View style={styles.featureIcon}>
              <FontAwesome5
                name="utensils"
                size={21}
                color={Colors.light.primary}
                iconStyle="solid"
              />
            </View>

            <View style={styles.featureTag}>
              <View style={styles.featureTagDot} />
              <Text style={styles.featureTagText}>FOOD FOR GOOD</Text>
            </View>
          </View>

          <Text style={styles.featureTitle}>
            Good food.
            {"\n"}
            Greater impact.
          </Text>

          <Text style={styles.featureDescription}>
            Discover surplus food from local businesses and reserve donations
            for your community.
          </Text>

          <View style={styles.featureAction}>
            <Text style={styles.featureActionText}>
              Find food donations
            </Text>

            <FontAwesome5
              name="arrow-right"
              size={14}
              color={Colors.light.background}
              iconStyle="solid"
            />
          </View>

          <View style={styles.featureDecoration} />
        </TouchableOpacity>

        {/* Secondary navigation */}
        <View style={styles.activitySection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionHeading}>Your space</Text>

            <Text style={styles.sectionSubtitle}>
              Manage your organisation's activity.
            </Text>
          </View>

          <View style={styles.tileRow}>
            <TouchableOpacity
              style={styles.activityTile}
              activeOpacity={0.75}
              onPress={() => router.push("/my-reservations")}
              accessibilityRole="button"
              accessibilityLabel="View my reservations"
            >
              <View style={[styles.tileIcon, styles.tealIconBackground]}>
                <FontAwesome5
                  name="clipboard-list"
                  size={20}
                  color={Colors.light.secondary}
                  iconStyle="solid"
                />
              </View>

              <Text style={styles.tileTitle}>My reservations</Text>

              <Text style={styles.tileDescription}>
                Track donations and collections.
              </Text>

              <View style={styles.tileArrow}>
                <FontAwesome5
                  name="arrow-right"
                  size={14}
                  color={Colors.light.secondary}
                  iconStyle="solid"
                />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.activityTile}
              activeOpacity={0.75}
              onPress={() => router.push("/ngo-verification")}
              accessibilityRole="button"
              accessibilityLabel="View organisation details"
            >
              <View style={[styles.tileIcon, styles.oliveIconBackground]}>
                <FontAwesome5
                  name="building"
                  size={20}
                  color={Colors.light.accent}
                  iconStyle="solid"
                />
              </View>

              <Text style={styles.tileTitle}>My organisation</Text>

              <Text style={styles.tileDescription}>
                View your organisation details.
              </Text>

              <View style={styles.tileArrow}>
                <FontAwesome5
                  name="arrow-right"
                  size={14}
                  color={Colors.light.secondary}
                  iconStyle="solid"
                />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Logout button */}
        <TouchableOpacity
          style={styles.logoutButton}
          activeOpacity={0.8}
          onPress={handleLogout}
          accessibilityRole="button"
          accessibilityLabel="Log out"
        >
          <FontAwesome5
            name="sign-out-alt"
            size={17}
            color="#FFFFFF"
            iconStyle="solid"
          />

          <Text style={styles.logoutButtonText}>Log Out</Text>
        </TouchableOpacity>

        {/* Footer */}
        <View style={styles.footer}>
          <FontAwesome5
            name="heart"
            size={13}
            color={Colors.light.primary}
            iconStyle="solid"
          />

          <Text style={styles.footerText}>
            Good food deserves to be shared.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },

  container: {
    flexGrow: 1,
    width: "100%",
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.five,
  },

  /* Brand header */
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.five,
  },

  brandRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  brandIcon: {
    width: 38,
    height: 38,
    marginRight: Spacing.two,
  },

  brandName: {
    fontFamily: Fonts.heading,
    fontSize: 24,
    color: Colors.light.text,
  },

  roleBadge: {
    backgroundColor: Colors.light.backgroundElement,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },

  roleBadgeText: {
    fontFamily: Fonts.button,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    color: Colors.light.secondary,
  },

  /* Welcome */
  welcomeSection: {
    marginBottom: Spacing.four,
  },

  eyebrow: {
    fontFamily: Fonts.button,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.5,
    color: Colors.light.secondary,
    marginBottom: Spacing.two,
  },

  heading: {
    fontFamily: Fonts.heading,
    fontSize: 30,
    lineHeight: 37,
    color: Colors.light.text,
  },

  organisationName: {
    fontFamily: Fonts.heading,
    fontSize: 25,
    lineHeight: 32,
    color: Colors.light.primary,
    marginTop: Spacing.one,
  },

  subtitle: {
    fontFamily: Fonts.body,
    fontSize: 14,
    lineHeight: 22,
    color: Colors.light.textSecondary,
    marginTop: Spacing.two,
    maxWidth: 340,
  },

  /* Main donation feature */
  featureCard: {
    width: "100%",
    backgroundColor: Colors.light.backgroundElement,
    padding: Spacing.three,
    borderRadius: Radius.lg,
    marginBottom: Spacing.two,
    borderWidth: 1,
    borderColor: "#E6D9C3",
    overflow: "hidden",
  },

  featureTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.three,
  },

  featureIcon: {
    width: 46,
    height: 46,
    borderRadius: Radius.md,
    backgroundColor: Colors.light.background,
    alignItems: "center",
    justifyContent: "center",
  },

  featureTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    backgroundColor: Colors.light.background,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.two,
  },

  featureTagDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: Colors.light.accent,
  },

  featureTagText: {
    fontFamily: Fonts.button,
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 0.7,
    color: Colors.light.textSecondary,
  },

  featureTitle: {
    fontFamily: Fonts.heading,
    fontSize: 28,
    lineHeight: 34,
    color: Colors.light.text,
    marginBottom: Spacing.two,
  },

  featureDescription: {
    fontFamily: Fonts.body,
    fontSize: 14,
    lineHeight: 21,
    color: Colors.light.textSecondary,
    marginBottom: Spacing.three,
    maxWidth: 330,
  },

  featureAction: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.two,
    backgroundColor: Colors.light.primary,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    borderRadius: Radius.md,
  },

  featureActionText: {
    fontFamily: Fonts.button,
    fontSize: 13,
    fontWeight: "700",
    color: Colors.light.background,
  },

  featureDecoration: {
    position: "absolute",
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 16,
    borderColor: "rgba(124, 156, 68, 0.10)",
    right: -35,
    bottom: -38,
    zIndex: -1,
  },

  /* Compact verification status */
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.three,
    borderBottomWidth: 1,
    borderBottomColor: "#E6D9C3",
    marginBottom: Spacing.four,
  },

  statusIcon: {
    width: 38,
    height: 38,
    borderRadius: Radius.md,
    backgroundColor: Colors.light.backgroundElement,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.two,
  },

  statusContent: {
    flex: 1,
    paddingRight: Spacing.two,
  },

  statusHeading: {
    fontFamily: Fonts.button,
    fontSize: 13,
    fontWeight: "700",
    color: Colors.light.text,
    marginBottom: Spacing.one,
  },

  statusDescription: {
    fontFamily: Fonts.body,
    fontSize: 12,
    lineHeight: 18,
    color: Colors.light.textSecondary,
  },

  /* Activity tiles */
  activitySection: {
    marginTop: Spacing.one,
  },

  sectionHeader: {
    marginBottom: Spacing.three,
  },

  sectionHeading: {
    fontFamily: Fonts.heading,
    fontSize: 22,
    color: Colors.light.text,
    marginBottom: Spacing.one,
  },

  sectionSubtitle: {
    fontFamily: Fonts.body,
    fontSize: 13,
    lineHeight: 19,
    color: Colors.light.textSecondary,
  },

  tileRow: {
    flexDirection: "row",
    alignItems: "stretch",
    gap: Spacing.two,
  },

  activityTile: {
    flex: 1,
    minWidth: 0,
    backgroundColor: Colors.light.background,
    borderWidth: 1,
    borderColor: "#E6D9C3",
    borderRadius: Radius.lg,
    padding: Spacing.three,
  },

  tileIcon: {
    width: 42,
    height: 42,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.three,
  },

  tealIconBackground: {
    backgroundColor: "rgba(0, 128, 128, 0.10)",
  },

  oliveIconBackground: {
    backgroundColor: "rgba(124, 156, 68, 0.13)",
  },

  tileTitle: {
    fontFamily: Fonts.button,
    fontSize: 14,
    lineHeight: 19,
    fontWeight: "700",
    color: Colors.light.text,
    marginBottom: Spacing.two,
  },

  tileDescription: {
    fontFamily: Fonts.body,
    fontSize: 12,
    lineHeight: 18,
    color: Colors.light.textSecondary,
    flexGrow: 1,
  },

  tileArrow: {
    alignSelf: "flex-end",
    marginTop: Spacing.three,
  },

  /* Logout button */
  logoutButton: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.two,
    backgroundColor: Colors.light.primary,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.four,
    borderRadius: Radius.lg,
    marginTop: Spacing.four,
    marginBottom: Spacing.two,
  },

  logoutButtonText: {
    fontFamily: Fonts.button,
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  /* Footer */
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.two,
    marginTop: Spacing.five,
  },

  footerText: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
});