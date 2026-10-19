/**
 * Stylesheet for available-donations.tsx:
 * - Layout, typography, and spacing
 * - Donation cards displaying food details, categories, and availability status
 * - Donation quantity, collection information, and detail navigation
 * - Results count, loading indicators, and empty-state visuals
 * - Back navigation and refresh action styling
 * - Consistent use of theme colors, fonts, and spacing
 */

import { StyleSheet, Platform } from "react-native";
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

  /* Back navigation */

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

  /* Page introduction */

  header: {
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
    fontSize: 29,
    lineHeight: 37,
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

  /* Results count */

  resultsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    marginBottom: Spacing.three,
  },

  resultsLabel: {
    fontFamily: Fonts.button,
    fontSize: 14,
    fontWeight: "700",
    color: Colors.light.text,
  },

  countBadge: {
    minWidth: 25,
    height: 25,
    paddingHorizontal: Spacing.two,
    borderRadius: 13,
    backgroundColor: "rgba(0, 128, 128, 0.10)",
    alignItems: "center",
    justifyContent: "center",
  },

  countText: {
    fontFamily: Fonts.button,
    fontSize: 12,
    fontWeight: "700",
    color: Colors.light.secondary,
  },

  /* Donation list */

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

  /* Lightweight donation cards */

  card: {
    width: "100%",
    backgroundColor: "#FFFEFC",
    borderRadius: 14,
    padding: Spacing.three,
    borderWidth: 1,
    borderColor: "#EAE6DE",
    ...Platform.select({
      ios: {
        shadowColor: "#333333",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.035,
        shadowRadius: 8,
      },
      android: {
        elevation: 1,
      },
      default: {},
    }),
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: Spacing.two,
  },

  foodHeading: {
    flex: 1,
    minWidth: 0,
    paddingRight: Spacing.one,
  },

  foodName: {
    fontFamily: Fonts.heading,
    fontSize: 20,
    lineHeight: 27,
    color: Colors.light.text,
    marginBottom: Spacing.one,
    flexShrink: 1,
  },

  category: {
    alignSelf: "flex-start",
    fontFamily: Fonts.body,
    fontSize: 12,
    lineHeight: 18,
    color: Colors.light.textSecondary,
    flexShrink: 1,
  },

  /* Minimal availability indicator */

  availableBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(124, 156, 68, 0.10)",
    paddingHorizontal: Spacing.two,
    paddingVertical: 6,
    borderRadius: 20,
    flexShrink: 0,
  },

  availableDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.light.accent,
  },

  availableText: {
    fontFamily: Fonts.button,
    fontSize: 11,
    fontWeight: "700",
    color: Colors.light.accent,
  },

  /* Subtle separation between information and details */

  cardDivider: {
    height: 1,
    backgroundColor: "#F0EDE7",
    marginVertical: Spacing.three,
  },

  /* Compact donation information */

  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    marginBottom: Spacing.three,
  },

  detailIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(0, 128, 128, 0.075)",
    alignItems: "center",
    justifyContent: "center",
  },

  detailContent: {
    flex: 1,
    minWidth: 0,
    paddingVertical: 1,
  },

  detailLabel: {
    fontFamily: Fonts.body,
    fontSize: 11,
    lineHeight: 16,
    color: Colors.light.textSecondary,
    marginBottom: 2,
  },

  detailValue: {
    fontFamily: Fonts.body,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "600",
    color: Colors.light.text,
    flexShrink: 1,
  },

  /* Clear call to action */

  button: {
    minHeight: 46,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.two,
    backgroundColor: Colors.light.secondary,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: 10,
    marginTop: Spacing.one,
  },

  buttonText: {
    fontFamily: Fonts.button,
    fontSize: 13,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  /* Loading state */

  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing.four,
  },

  loadingText: {
    fontFamily: Fonts.body,
    fontSize: 14,
    lineHeight: 21,
    color: Colors.light.textSecondary,
    marginTop: Spacing.three,
    textAlign: "center",
  },

  /* Empty state */

  emptyListContent: {
    flexGrow: 1,
    justifyContent: "center",
  },

  emptyContainer: {
    width: "100%",
    alignItems: "center",
    backgroundColor: "#FFFEFC",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#EAE6DE",
    padding: Spacing.four,
  },

  emptyIcon: {
    width: 54,
    height: 54,
    borderRadius: 16,
    backgroundColor: "rgba(0, 128, 128, 0.09)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.three,
  },

  emptyTitle: {
    fontFamily: Fonts.heading,
    fontSize: 20,
    lineHeight: 27,
    color: Colors.light.text,
    textAlign: "center",
    marginBottom: Spacing.two,
    flexShrink: 1,
  },

  emptyText: {
    fontFamily: Fonts.body,
    fontSize: 13,
    lineHeight: 21,
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
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(0, 128, 128, 0.45)",
    backgroundColor: "transparent",
  },

  refreshButtonText: {
    fontFamily: Fonts.button,
    fontSize: 13,
    fontWeight: "700",
    color: Colors.light.secondary,
  },
});