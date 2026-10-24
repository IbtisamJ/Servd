/**
 * Stylesheet for my-reservation.tsx:
 * - Layout, typography, and spacing for the reservations screen
 * - Reservation cards, food details, and collection information
 * - Status indicators for reserved, collected, and cancelled donations
 * - Action buttons for marking donations as collected or cancelling reservations
 * - Summary statistics, loading indicators, and empty-state visuals
 * - Consistent use of theme colors, fonts, and spacing
 */

import { StyleSheet } from "react-native";
import { Colors, Fonts, Radius, Spacing } from "../constants/theme";

export const styles = StyleSheet.create({
  // Main screen uses the existing Servd background and colour palette.
  safeArea: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },

  listContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.five,
  },

  // Navigation header.
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.five,
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

  topBarTitle: {
    fontFamily: Fonts.body,
    fontSize: 15,
    fontWeight: "600",
    color: Colors.light.text,
  },

  headerSpacer: {
    width: 42,
  },

  // Introductory copy establishes a clear visual hierarchy.
  introSection: {
    marginBottom: Spacing.four,
  },

  eyebrow: {
    fontFamily: Fonts.body,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.4,
    color: Colors.light.secondary,
    marginBottom: Spacing.two,
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
    maxWidth: 330,
  },

  // Reservation totals are grouped into one subtle horizontal overview.
  overview: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.backgroundElement,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.two,
    marginBottom: Spacing.five,
  },

  overviewItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  overviewNumber: {
    fontFamily: Fonts.heading,
    fontSize: 25,
    lineHeight: 32,
    color: Colors.light.text,
  },

  overviewLabel: {
    fontFamily: Fonts.body,
    fontSize: 10,
    lineHeight: 15,
    textAlign: "center",
    color: Colors.light.textSecondary,
  },

  overviewDivider: {
    width: 1,
    height: 34,
    backgroundColor: "#DCCEB7",
  },

  // Heading separates the list from the overview without another panel.
  listHeading: {
    marginBottom: Spacing.three,
  },

  sectionTitle: {
    fontFamily: Fonts.heading,
    fontSize: 23,
    lineHeight: 30,
    color: Colors.light.text,
  },

  sectionSubtitle: {
    fontFamily: Fonts.body,
    fontSize: 12,
    lineHeight: 18,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },

  // Each reservation has one clean surface with minimal internal decoration.
  reservationCard: {
    backgroundColor: "#FFFCF7",
    borderWidth: 1,
    borderColor: "#EAE0D1",
    borderRadius: Radius.lg,
    padding: Spacing.three,
    marginBottom: Spacing.three,
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.three,
  },

  foodIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: Colors.light.backgroundElement,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.three,
  },

  cardHeading: {
    flex: 1,
  },

  cardEyebrow: {
    fontFamily: Fonts.body,
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 1,
    color: Colors.light.textSecondary,
    marginBottom: 4,
  },

  cardTitle: {
    fontFamily: Fonts.heading,
    fontSize: 19,
    lineHeight: 25,
    color: Colors.light.text,
  },

  // Status uses a small pill instead of a large status panel.
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    borderRadius: 20,
    paddingHorizontal: Spacing.two,
    paddingVertical: 6,
    marginBottom: Spacing.three,
  },

  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 7,
  },

  statusText: {
    fontFamily: Fonts.body,
    fontSize: 11,
    fontWeight: "700",
  },

  // Collection details use simple icon-and-text rows.
  details: {
    borderTopWidth: 1,
    borderTopColor: "#EAE0D1",
    paddingTop: Spacing.two,
  },

  detailRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: Spacing.two,
    gap: Spacing.two,
  },

  detailContent: {
    flex: 1,
  },

  detailLabel: {
    fontFamily: Fonts.body,
    fontSize: 11,
    color: Colors.light.textSecondary,
    marginBottom: 3,
  },

  detailValue: {
    fontFamily: Fonts.body,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "600",
    color: Colors.light.text,
  },

  // Primary and secondary actions have distinct visual importance.
  actions: {
    marginTop: Spacing.three,
    gap: Spacing.two,
  },

  collectButton: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: 24,
    backgroundColor: Colors.light.primary,
  },

  collectButtonText: {
    fontFamily: Fonts.button,
    fontSize: 13,
    fontWeight: "700",
    color: Colors.light.background,
  },

  cancelButton: {
    minHeight: 42,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: 22,
  },

  cancelButtonText: {
    fontFamily: Fonts.button,
    fontSize: 12,
    fontWeight: "600",
    color: Colors.light.textSecondary,
  },

  disabledButton: {
    opacity: 0.55,
  },

  // Feedback appears only after a reservation reaches its final state.
  feedbackNote: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.two,
    backgroundColor: "#F0F3E9",
    borderRadius: Radius.md,
    padding: Spacing.three,
    marginTop: Spacing.three,
  },

  feedbackText: {
    flex: 1,
    fontFamily: Fonts.body,
    fontSize: 12,
    lineHeight: 19,
    color: Colors.light.textSecondary,
  },

  cancelledNote: {
    fontFamily: Fonts.body,
    fontSize: 12,
    lineHeight: 18,
    color: Colors.light.textSecondary,
    marginTop: Spacing.two,
  },

  // Empty state guides the NGO towards available food donations.
  emptyState: {
    alignItems: "center",
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.five,
  },

  emptyIcon: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: Colors.light.backgroundElement,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.three,
  },

  emptyTitle: {
    fontFamily: Fonts.heading,
    fontSize: 22,
    lineHeight: 29,
    textAlign: "center",
    color: Colors.light.text,
    marginBottom: Spacing.two,
  },

  emptyDescription: {
    fontFamily: Fonts.body,
    fontSize: 13,
    lineHeight: 21,
    textAlign: "center",
    color: Colors.light.textSecondary,
    marginBottom: Spacing.four,
  },

  browseButton: {
    minHeight: 48,
    alignSelf: "stretch",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.two,
    backgroundColor: Colors.light.primary,
    borderRadius: 24,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },

  browseButtonText: {
    fontFamily: Fonts.button,
    fontSize: 13,
    fontWeight: "700",
    color: Colors.light.background,
  },

  // Loading feedback remains visually consistent with the rest of the app.
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.four,
  },

  loadingTitle: {
    fontFamily: Fonts.heading,
    fontSize: 21,
    color: Colors.light.text,
    textAlign: "center",
    marginTop: Spacing.three,
    marginBottom: Spacing.two,
  },

  loadingSubtitle: {
    fontFamily: Fonts.body,
    fontSize: 13,
    lineHeight: 20,
    color: Colors.light.textSecondary,
    textAlign: "center",
  },

  // A quiet footer reinforces the purpose of Servd.
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.two,
    paddingTop: Spacing.four,
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