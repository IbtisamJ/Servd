/**
 * Stylesheet for available-donations.tsx:
 * - Layout, typography, and spacing
 * - Donation cards displaying food details, categories, and availability status
 * - Donation quantity, collection information, and detail navigation
 * - Results count, loading indicators, and empty-state visuals
 * - Back navigation and refresh action styling
 * - Consistent use of theme colors, fonts, and spacing
 */

import { StyleSheet } from "react-native";
import { Colors, Fonts, Radius, Spacing } from "../constants/theme";

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },

  container: {
    flex: 1,
    width: "100%",
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
  },

  backButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: Spacing.two,
    paddingVertical: Spacing.two,
    marginBottom: Spacing.three,
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
    fontSize: 14,
    lineHeight: 22,
    color: Colors.light.textSecondary,
    flexShrink: 1,
  },

  resultsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    marginBottom: Spacing.three,
  },

  resultsLabel: {
    fontFamily: Fonts.button,
    fontSize: 15,
    fontWeight: "700",
    color: Colors.light.text,
  },

  countBadge: {
    minWidth: 26,
    height: 26,
    paddingHorizontal: Spacing.two,
    borderRadius: Radius.md,
    backgroundColor: Colors.light.backgroundElement,
    alignItems: "center",
    justifyContent: "center",
  },

  countText: {
    fontFamily: Fonts.button,
    fontSize: 13,
    fontWeight: "700",
    color: Colors.light.text,
  },

  list: {
    flex: 1,
    width: "100%",
  },

  listContent: {
    paddingBottom: Spacing.five,
  },

  cardSeparator: {
    height: Spacing.three,
  },

  card: {
    width: "100%",
    backgroundColor: Colors.light.backgroundElement,
    borderRadius: Radius.lg,
    padding: Spacing.three,
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: Spacing.two,
  },

  foodHeading: {
    flex: 1,
    paddingRight: Spacing.one,
  },

  foodName: {
    fontFamily: Fonts.heading,
    fontSize: 19,
    lineHeight: 25,
    color: Colors.light.text,
    marginBottom: Spacing.one,
    flexShrink: 1,
  },

  category: {
    fontFamily: Fonts.body,
    fontSize: 12,
    lineHeight: 18,
    color: Colors.light.textSecondary,
    flexShrink: 1,
  },

  availableBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.one,
    backgroundColor: Colors.light.background,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    borderRadius: Radius.md,
    flexShrink: 0,
  },

  availableDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: Colors.light.accent,
  },

  availableText: {
    fontFamily: Fonts.button,
    fontSize: 11,
    fontWeight: "700",
    color: Colors.light.text,
  },

  cardDivider: {
    height: 1,
    backgroundColor: Colors.light.background,
    marginVertical: Spacing.three,
  },

  detailRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.two,
    marginBottom: Spacing.three,
  },

  detailIcon: {
    width: 32,
    height: 32,
    borderRadius: Radius.md,
    backgroundColor: Colors.light.background,
    alignItems: "center",
    justifyContent: "center",
  },

  detailContent: {
    flex: 1,
    paddingTop: Spacing.half,
  },

  detailLabel: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: Colors.light.textSecondary,
    marginBottom: Spacing.half,
  },

  detailValue: {
    fontFamily: Fonts.body,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "600",
    color: Colors.light.text,
    flexShrink: 1,
  },

  button: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.two,
    backgroundColor: Colors.light.secondary,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    borderRadius: Radius.md,
    marginTop: Spacing.one,
  },

  buttonText: {
    fontFamily: Fonts.button,
    fontSize: 14,
    fontWeight: "700",
    color: Colors.light.background,
  },

  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing.four,
  },

  loadingText: {
    fontFamily: Fonts.body,
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginTop: Spacing.three,
    textAlign: "center",
  },

  emptyListContent: {
    flexGrow: 1,
    justifyContent: "center",
  },

  emptyContainer: {
    width: "100%",
    alignItems: "center",
    backgroundColor: Colors.light.backgroundElement,
    borderRadius: Radius.lg,
    padding: Spacing.four,
  },

  emptyIcon: {
    width: 52,
    height: 52,
    borderRadius: Radius.lg,
    backgroundColor: Colors.light.background,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.three,
  },

  emptyTitle: {
    fontFamily: Fonts.heading,
    fontSize: 19,
    lineHeight: 26,
    color: Colors.light.text,
    textAlign: "center",
    marginBottom: Spacing.two,
    flexShrink: 1,
  },

  emptyText: {
    fontFamily: Fonts.body,
    fontSize: 14,
    lineHeight: 22,
    color: Colors.light.textSecondary,
    textAlign: "center",
    marginBottom: Spacing.three,
    flexShrink: 1,
  },

  refreshButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.light.secondary,
  },

  refreshButtonText: {
    fontFamily: Fonts.button,
    fontSize: 14,
    fontWeight: "700",
    color: Colors.light.secondary,
  },
});