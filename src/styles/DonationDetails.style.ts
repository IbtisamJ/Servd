/**
 * Stylesheet for donation-details.tsx:
 * - Layout, typography, and spacing
 * - Donation summary cards, food details, and status indicators
 * - Donation description, quantity, collection information, and reference details
 * - Reminder banners and reservation action buttons
 * - Loading, unavailable status, and navigation visuals
 * - Consistent use of theme colors, fonts, and spacing
 */

import { StyleSheet } from "react-native";
import { Colors, Fonts, Radius, Spacing } from "../constants/theme";

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.five,
  },

  // Back navigation
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: Spacing.two,
    paddingVertical: Spacing.two,
    marginBottom: Spacing.four,
  },

  backButtonText: {
    fontFamily: Fonts.body,
    fontSize: 13,
    fontWeight: "600",
    color: Colors.light.secondary,
  },

  // Page introduction
  introSection: {
    marginBottom: Spacing.four,
  },

  eyebrow: {
    fontFamily: Fonts.body,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.2,
    color: Colors.light.secondary,
    marginBottom: Spacing.two,
  },

  pageTitle: {
    fontFamily: Fonts.heading,
    fontSize: 32,
    lineHeight: 40,
    color: Colors.light.text,
    marginBottom: Spacing.two,
  },

  pageDescription: {
    fontFamily: Fonts.body,
    fontSize: 14,
    lineHeight: 22,
    color: Colors.light.textSecondary,
    maxWidth: 330,
  },

  // Donation overview card
  donationCard: {
    backgroundColor: "#FFFEFC",
    borderWidth: 1,
    borderColor: "#E9E1D5",
    borderRadius: Radius.lg,
    padding: Spacing.three,
    marginBottom: Spacing.four,
  },

  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.two,
    marginBottom: Spacing.three,
  },

  cardEyebrow: {
    fontFamily: Fonts.body,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
    color: Colors.light.textSecondary,
  },

  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#E9EFDF",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },

  unavailableBadge: {
    backgroundColor: Colors.light.backgroundElement,
  },

  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.light.accent,
  },

  unavailableStatusDot: {
    backgroundColor: Colors.light.textSecondary,
  },

  statusText: {
    fontFamily: Fonts.body,
    fontSize: 11,
    fontWeight: "600",
    color: "#526D35",
  },

  unavailableStatusText: {
    color: Colors.light.textSecondary,
  },

  foodName: {
    fontFamily: Fonts.heading,
    fontSize: 27,
    lineHeight: 35,
    color: Colors.light.text,
    marginBottom: Spacing.one,
  },

  categoryText: {
    fontFamily: Fonts.body,
    fontSize: 13,
    lineHeight: 20,
    color: Colors.light.textSecondary,
  },

  cardDivider: {
    height: 1,
    backgroundColor: "#E9E1D5",
    marginTop: Spacing.three,
    marginBottom: Spacing.three,
  },

  // Quantity
  quantityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
  },

  quantityIcon: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    backgroundColor: Colors.light.backgroundElement,
    alignItems: "center",
    justifyContent: "center",
  },

  quantityContent: {
    flex: 1,
  },

  detailLabel: {
    fontFamily: Fonts.body,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.8,
    color: Colors.light.textSecondary,
    marginBottom: Spacing.one,
  },

  quantityValue: {
    fontFamily: Fonts.body,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "600",
    color: Colors.light.text,
  },

  // Donation description inside the donation card
  descriptionSection: {
    gap: Spacing.two,
  },

  descriptionTitle: {
    fontFamily: Fonts.heading,
    fontSize: 17,
    lineHeight: 24,
    color: Colors.light.text,
  },

  // Collection and other information sections
  section: {
    marginBottom: Spacing.four,
  },

  sectionTitle: {
    fontFamily: Fonts.heading,
    fontSize: 20,
    lineHeight: 27,
    color: Colors.light.text,
    marginBottom: Spacing.two,
  },

  bodyText: {
    fontFamily: Fonts.body,
    fontSize: 14,
    lineHeight: 23,
    color: Colors.light.textSecondary,
  },

  // Collection location
  locationCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.three,
    backgroundColor: Colors.light.backgroundElement,
    borderRadius: Radius.md,
    padding: Spacing.three,
  },

  locationIcon: {
    width: 38,
    height: 38,
    borderRadius: Radius.md,
    backgroundColor: Colors.light.background,
    alignItems: "center",
    justifyContent: "center",
  },

  locationContent: {
    flex: 1,
    paddingTop: 2,
  },

  locationValue: {
    fontFamily: Fonts.body,
    fontSize: 14,
    lineHeight: 22,
    fontWeight: "600",
    color: Colors.light.text,
  },

  locationHint: {
    fontFamily: Fonts.body,
    fontSize: 12,
    lineHeight: 19,
    color: Colors.light.textSecondary,
    marginTop: Spacing.two,
  },

  // Donation reference
  referenceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.two,
    paddingVertical: Spacing.three,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: "#DCD2C4",
    marginBottom: Spacing.four,
  },

  referenceLabel: {
    flex: 1,
    fontFamily: Fonts.body,
    fontSize: 12,
    color: Colors.light.textSecondary,
  },

  referenceValue: {
    flexShrink: 1,
    fontFamily: Fonts.body,
    fontSize: 11,
    fontWeight: "600",
    color: Colors.light.text,
    textAlign: "right",
  },

  // Reservation actions
  actionSection: {
    marginTop: Spacing.one,
  },

  actionHint: {
    fontFamily: Fonts.heading,
    fontSize: 16,
    lineHeight: 23,
    color: Colors.light.text,
    textAlign: "center",
    marginBottom: Spacing.three,
  },

  reserveButton: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.two,
    backgroundColor: Colors.light.primary,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
  },

  disabledButton: {
    backgroundColor: "#A9ACB0",
  },

  reserveButtonText: {
    fontFamily: Fonts.button,
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  // Bottom back button
  cancelButton: {
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    marginTop: Spacing.two,
  },

  cancelButtonText: {
    fontFamily: Fonts.button,
    fontSize: 13,
    fontWeight: "600",
    color: Colors.light.textSecondary,
  },

  // Servd footer
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.two,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.two,
  },

  footerText: {
    flexShrink: 1,
    fontFamily: Fonts.body,
    fontSize: 11,
    lineHeight: 17,
    color: Colors.light.textSecondary,
    textAlign: "center",
  },
});
