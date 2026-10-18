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

  scrollContent: {
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.five,
  },

  // Navigation
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.four,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: Radius.md,
    backgroundColor: Colors.light.backgroundElement,
    alignItems: "center",
    justifyContent: "center",
  },

  topBarTitle: {
    fontFamily: Fonts.body,
    fontSize: 15,
    fontWeight: "600",
    color: Colors.light.text,
  },

  topBarSpacer: {
    width: 42,
  },

  // Intro
  introSection: {
    marginBottom: Spacing.four,
  },

  eyebrow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.two,
  },

  eyebrowDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: Colors.light.accent,
    marginRight: Spacing.two,
  },

  eyebrowText: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: Colors.light.secondary,
    fontWeight: "600",
    letterSpacing: 0.3,
  },

  pageTitle: {
    fontFamily: Fonts.heading,
    fontSize: 34,
    lineHeight: 41,
    color: Colors.light.text,
    marginBottom: Spacing.two,
  },

  pageDescription: {
    fontFamily: Fonts.body,
    fontSize: 14,
    lineHeight: 22,
    color: Colors.light.textSecondary,
    maxWidth: 310,
  },

  // Hero card
  heroCard: {
    backgroundColor: Colors.light.backgroundElement,
    borderRadius: Radius.lg,
    padding: Spacing.three,
    marginBottom: Spacing.four,
  },

  heroTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.three,
  },

  foodIconContainer: {
    width: 52,
    height: 52,
    borderRadius: Radius.md,
    backgroundColor: Colors.light.background,
    alignItems: "center",
    justifyContent: "center",
  },

  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: Spacing.two,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: "#E4EBD8",
  },

  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: Colors.light.accent,
    marginRight: 6,
  },

  statusText: {
    fontFamily: Fonts.body,
    fontSize: 11,
    fontWeight: "700",
    color: Colors.light.accent,
    textTransform: "capitalize",
  },

  unavailableBadge: {
    backgroundColor: Colors.light.background,
  },

  unavailableDot: {
    backgroundColor: Colors.light.textSecondary,
  },

  unavailableStatusText: {
    color: Colors.light.textSecondary,
  },

  foodName: {
    fontFamily: Fonts.heading,
    fontSize: 25,
    lineHeight: 32,
    color: Colors.light.text,
    marginBottom: Spacing.two,
  },

  categoryTag: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.background,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.two,
    paddingVertical: 6,
    gap: 7,
  },

  categoryText: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: Colors.light.secondary,
    fontWeight: "600",
  },

  heroDivider: {
    height: 1,
    backgroundColor: "#E0D3BC",
    marginVertical: Spacing.three,
  },

  quantityRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  quantityIcon: {
    width: 38,
    height: 38,
    borderRadius: Radius.md,
    backgroundColor: Colors.light.background,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.two,
  },

  quantityContent: {
    flex: 1,
  },

  quantityLabel: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: Colors.light.textSecondary,
    marginBottom: 3,
  },

  quantityValue: {
    fontFamily: Fonts.body,
    fontSize: 16,
    fontWeight: "700",
    color: Colors.light.text,
  },

  // Section headings
  sectionHeading: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.two,
    marginTop: Spacing.one,
  },

  sectionTitle: {
    fontFamily: Fonts.body,
    fontSize: 16,
    fontWeight: "700",
    color: Colors.light.text,
    marginRight: Spacing.two,
  },

  sectionAccent: {
    flex: 1,
    height: 1,
    backgroundColor: "#E6D9C3",
  },

  // Description
  descriptionCard: {
    backgroundColor: Colors.light.background,
    borderWidth: 1,
    borderColor: "#E6D9C3",
    borderRadius: Radius.md,
    padding: Spacing.three,
    marginBottom: Spacing.four,
  },

  descriptionText: {
    fontFamily: Fonts.body,
    fontSize: 14,
    lineHeight: 22,
    color: Colors.light.textSecondary,
  },

  // Collection
  collectionCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: Colors.light.background,
    borderWidth: 1,
    borderColor: "#E6D9C3",
    borderRadius: Radius.md,
    padding: Spacing.three,
    marginBottom: Spacing.three,
  },

  collectionIconContainer: {
    width: 42,
    height: 42,
    borderRadius: Radius.md,
    backgroundColor: Colors.light.backgroundElement,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.three,
  },

  collectionContent: {
    flex: 1,
  },

  detailLabel: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: Colors.light.textSecondary,
    marginBottom: 5,
  },

  detailValue: {
    fontFamily: Fonts.body,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "600",
    color: Colors.light.text,
  },

  collectionHint: {
    fontFamily: Fonts.body,
    fontSize: 12,
    lineHeight: 18,
    color: Colors.light.textSecondary,
    marginTop: Spacing.two,
  },

  // Reference
  referenceRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.two,
    marginBottom: Spacing.three,
  },

  referenceIcon: {
    width: 36,
    height: 36,
    borderRadius: Radius.md,
    backgroundColor: Colors.light.backgroundElement,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.two,
  },

  referenceContent: {
    flex: 1,
  },

  referenceLabel: {
    fontFamily: Fonts.body,
    fontSize: 11,
    color: Colors.light.textSecondary,
    marginBottom: 3,
  },

  referenceValue: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: Colors.light.text,
    fontWeight: "600",
  },

  // Reminder
  reminderCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: Colors.light.backgroundElement,
    borderRadius: Radius.md,
    padding: Spacing.three,
    marginBottom: Spacing.four,
  },

  reminderIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.light.background,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.two,
  },

  reminderText: {
    flex: 1,
    fontFamily: Fonts.body,
    fontSize: 12,
    lineHeight: 19,
    color: Colors.light.textSecondary,
  },

  // Actions
  actionSection: {
    marginTop: Spacing.one,
  },

  reserveButton: {
    minHeight: 54,
    backgroundColor: Colors.light.primary,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.three,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.two,
  },

  disabledButton: {
    backgroundColor: Colors.light.textSecondary,
    opacity: 0.65,
  },

  reserveButtonText: {
    fontFamily: Fonts.button,
    fontSize: 15,
    fontWeight: "700",
    color: Colors.light.background,
  },

  cancelButton: {
    minHeight: 46,
    alignItems: "center",
    justifyContent: "center",
    marginTop: Spacing.two,
  },

  cancelButtonText: {
    fontFamily: Fonts.button,
    fontSize: 14,
    fontWeight: "600",
    color: Colors.light.textSecondary,
  },

  footerNote: {
    fontFamily: Fonts.body,
    fontSize: 11,
    color: Colors.light.textSecondary,
    textAlign: "center",
    marginTop: Spacing.two,
  },
});