/**
 * NGO Verification Screen
 *
 * Displays the NGO's current verification status.
 */

import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { router } from "expo-router";
import FontAwesome5 from "@react-native-vector-icons/fontawesome5";

import { Colors, Fonts, Spacing, Radius } from "../constants/theme";

import { NGO_STATUS } from "../constants/roles";

export default function NgoVerification() {
  /**
   * Temporary verification status.
   * Replace with the authenticated NGO's
   * Firestore status when integrated.
   */
  const verificationStatus = NGO_STATUS.APPROVED;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Back navigation */}
        <TouchableOpacity
          style={styles.backButton}
          activeOpacity={0.7}
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <FontAwesome5
            name="arrow-left"
            size={15}
            color={Colors.light.secondary}
            iconStyle="solid"
          />

          <Text style={styles.backButtonText}>Back to Dashboard</Text>
        </TouchableOpacity>

        {/* Page heading */}
        <View style={styles.header}>
          <Text style={styles.eyebrow}>YOUR ORGANISATION</Text>

          <Text style={styles.heading}>NGO Verification</Text>

          <Text style={styles.subtitle}>
            View your organisation's current verification status and account
            approval.
          </Text>
        </View>

        {/* Verification status card */}
        <View style={styles.card}>
          <View style={styles.statusTopRow}>
            <View style={styles.statusIcon}>
              <FontAwesome5
                name="shield-alt"
                size={22}
                color={Colors.light.accent}
                iconStyle="solid"
              />
            </View>

            <View style={styles.statusBadge}>
              <View style={styles.statusDot} />

              <Text style={styles.statusBadgeText}>{verificationStatus}</Text>
            </View>
          </View>

          <Text style={styles.cardTitle}>Your organisation is approved</Text>

          <Text style={styles.info}>
            Your organisation has been verified and is eligible to reserve
            available food donations through Servd.
          </Text>

          <View style={styles.divider} />

          <View style={styles.eligibilityRow}>
            <FontAwesome5
              name="check-circle"
              size={16}
              color={Colors.light.accent}
              iconStyle="solid"
            />

            <Text style={styles.eligibilityText}>
              Donation reservation access enabled
            </Text>
          </View>
        </View>

        {/* Additional information */}
        <View style={styles.informationCard}>
          <View style={styles.informationHeadingRow}>
            <FontAwesome5
              name="info-circle"
              size={18}
              color={Colors.light.secondary}
              iconStyle="solid"
            />

            <Text style={styles.informationTitle}>What does this mean?</Text>
          </View>

          <Text style={styles.informationText}>
            Your NGO account has been approved to use Servd's donation
            reservation features. You can browse available donations, reserve
            suitable food and manage your collection process.
          </Text>
        </View>

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

  backButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: Spacing.two,
    paddingVertical: Spacing.two,
    marginBottom: Spacing.four,
  },

  backButtonText: {
    fontFamily: Fonts.button,
    fontSize: 14,
    fontWeight: "600",
    color: Colors.light.secondary,
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
    marginBottom: Spacing.two,
  },

  heading: {
    fontFamily: Fonts.heading,
    fontSize: 28,
    lineHeight: 35,
    color: Colors.light.text,
    marginBottom: Spacing.two,
    flexShrink: 1,
  },

  subtitle: {
    fontFamily: Fonts.body,
    fontSize: 15,
    lineHeight: 23,
    color: Colors.light.textSecondary,
    flexShrink: 1,
  },

  card: {
    width: "100%",
    backgroundColor: Colors.light.backgroundElement,
    padding: Spacing.four,
    borderRadius: Radius.lg,
    marginBottom: Spacing.three,
  },

  statusTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: Spacing.two,
    marginBottom: Spacing.four,
  },

  statusIcon: {
    width: 48,
    height: 48,
    borderRadius: Radius.md,
    backgroundColor: Colors.light.background,
    alignItems: "center",
    justifyContent: "center",
  },

  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    backgroundColor: Colors.light.background,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Radius.lg,
  },

  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.light.accent,
  },

  statusBadgeText: {
    fontFamily: Fonts.button,
    fontSize: 12,
    fontWeight: "700",
    color: Colors.light.text,
  },

  cardTitle: {
    fontFamily: Fonts.heading,
    fontSize: 21,
    lineHeight: 28,
    color: Colors.light.text,
    marginBottom: Spacing.two,
    flexShrink: 1,
  },

  info: {
    fontFamily: Fonts.body,
    fontSize: 14,
    lineHeight: 22,
    color: Colors.light.textSecondary,
    flexShrink: 1,
  },

  divider: {
    height: 1,
    backgroundColor: Colors.light.background,
    marginVertical: Spacing.three,
  },

  eligibilityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },

  eligibilityText: {
    flex: 1,
    fontFamily: Fonts.body,
    fontSize: 13,
    lineHeight: 19,
    color: Colors.light.text,
  },

  informationCard: {
    width: "100%",
    backgroundColor: Colors.light.background,
    borderWidth: 1,
    borderColor: Colors.light.backgroundElement,
    padding: Spacing.three,
    borderRadius: Radius.lg,
  },

  informationHeadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    marginBottom: Spacing.two,
  },

  informationTitle: {
    flex: 1,
    fontFamily: Fonts.button,
    fontSize: 16,
    fontWeight: "700",
    color: Colors.light.text,
  },

  informationText: {
    fontFamily: Fonts.body,
    fontSize: 14,
    lineHeight: 22,
    color: Colors.light.textSecondary,
    flexShrink: 1,
  },

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
