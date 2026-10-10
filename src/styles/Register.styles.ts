/**
 * Stylesheet for Register.tsx:
 * - Layout, typography, and spacing
 * - Form fields, role selection cards, and progress indicators
 * - Buttons, banners, and success screen visuals
 * - Consistent use of theme colors, fonts, and spacing
 */

import { StyleSheet } from "react-native";
import { Colors, Fonts, Radius, Spacing } from "../constants/theme";

export const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },

  safeArea: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.five,
    alignItems: "center",
  },

  header: {
    width: "100%",
    maxWidth: 520,
    marginBottom: Spacing.four,
  },

  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.four,
  },

  logoImage: {
    width: 44,
    height: 44,
    marginRight: Spacing.two,
  },

  logoText: {
    color: Colors.light.text,
    fontSize: 25,
    fontWeight: "700",
    fontFamily: Fonts.heading,
    letterSpacing: -0.8,
  },

  eyebrow: {
    color: Colors.light.secondary,
    fontSize: 11,
    letterSpacing: 2,
    fontWeight: "700",
    fontFamily: Fonts.body,
    marginBottom: Spacing.two,
  },

  pageTitle: {
    color: Colors.light.text,
    fontSize: 30,
    lineHeight: 37,
    fontFamily: Fonts.heading,
    fontWeight: "700",
    marginBottom: Spacing.two,
  },

  pageSubtitle: {
    color: Colors.light.textSecondary,
    fontSize: 14,
    lineHeight: 22,
    fontFamily: Fonts.body,
    maxWidth: 460,
  },

  progressSection: {
    width: "100%",
    maxWidth: 520,
    marginBottom: Spacing.three,
  },

  progressLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: Spacing.two,
  },

  progressLabel: {
    fontFamily: Fonts.body,
    color: Colors.light.textSecondary,
    fontSize: 12,
    fontWeight: "500",
  },

  progressLabelActive: {
    color: Colors.light.primary,
    fontWeight: "700",
  },

  progressTrack: {
    height: 5,
    borderRadius: 5,
    overflow: "hidden",
    backgroundColor: Colors.light.backgroundElement,
  },

  progressFill: {
    height: "100%",
    borderRadius: 5,
    backgroundColor: Colors.light.primary,
  },

  formCard: {
    width: "100%",
    maxWidth: 520,
    backgroundColor: "#FFFFFF",
    borderRadius: Radius.lg,
    padding: Spacing.three,
    borderWidth: 1,
    borderColor: "#EAE6DF",
  },

  sectionTitle: {
    fontFamily: Fonts.heading,
    color: Colors.light.text,
    fontSize: 22,
    lineHeight: 29,
    fontWeight: "700",
    marginBottom: 5,
  },

  sectionSubtitle: {
    fontFamily: Fonts.body,
    color: Colors.light.textSecondary,
    fontSize: 13,
    lineHeight: 20,
    marginBottom: Spacing.four,
  },

  fieldContainer: {
    marginBottom: Spacing.three,
  },

  fieldLabel: {
    color: Colors.light.text,
    fontSize: 13,
    fontWeight: "600",
    fontFamily: Fonts.body,
    marginBottom: Spacing.two,
  },

  inputWrapper: {
    minHeight: 49,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#DEDAD3",
    borderRadius: Radius.md,
    backgroundColor: "#FFFFFF",
  },

  inputWrapperError: {
    borderColor: Colors.light.error,
  },

  input: {
    flex: 1,
    minHeight: 47,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    color: Colors.light.text,
    fontFamily: Fonts.body,
    fontSize: 14,
  },

  passwordToggle: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },

  passwordToggleText: {
    color: Colors.light.secondary,
    fontFamily: Fonts.body,
    fontWeight: "700",
    fontSize: 12,
  },

  errorText: {
    color: Colors.light.error,
    fontSize: 12,
    marginTop: 5,
    fontFamily: Fonts.body,
  },

  passwordStrengthContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: -Spacing.two,
    marginBottom: Spacing.two,
    gap: Spacing.two,
  },

  strengthBars: {
    flex: 1,
    flexDirection: "row",
    gap: 4,
  },

  strengthBar: {
    flex: 1,
    height: 4,
    borderRadius: 4,
  },

  strengthLabel: {
    fontFamily: Fonts.body,
    fontSize: 11,
    fontWeight: "700",
    minWidth: 38,
    textAlign: "right",
  },

  passwordHint: {
    color: Colors.light.textSecondary,
    fontFamily: Fonts.body,
    fontSize: 11,
    lineHeight: 17,
    marginBottom: Spacing.three,
  },

  roleSection: {
    marginTop: Spacing.one,
    marginBottom: Spacing.three,
  },

  roleOptions: {
    flexDirection: "row",
    gap: Spacing.two,
    marginTop: Spacing.two,
  },

  roleCard: {
    flex: 1,
    minHeight: 153,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: "#DEDAD3",
    backgroundColor: "#FFFFFF",
    padding: Spacing.two,
    position: "relative",
  },

  roleCardSelected: {
    borderColor: Colors.light.primary,
    backgroundColor: "#FFF8F5",
  },

  roleIcon: {
    width: 36,
    height: 36,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.light.background,
    marginBottom: Spacing.two,
  },

  roleIconSelected: {
    backgroundColor: "#F7E4E0",
  },

  roleEmoji: {
    color: Colors.light.primary,
    fontSize: 23,
    fontWeight: "600",
  },

  roleTitle: {
    fontFamily: Fonts.body,
    color: Colors.light.text,
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 5,
  },

  roleDescription: {
    fontFamily: Fonts.body,
    color: Colors.light.textSecondary,
    fontSize: 11,
    lineHeight: 16,
    paddingRight: 2,
  },

  radioOuter: {
    position: "absolute",
    top: Spacing.two,
    right: Spacing.two,
    width: 17,
    height: 17,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: "#C9C5BE",
    alignItems: "center",
    justifyContent: "center",
  },

  radioOuterSelected: {
    borderColor: Colors.light.primary,
  },

  radioInner: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: Colors.light.primary,
  },

  primaryButton: {
    minHeight: 51,
    borderRadius: Radius.md,
    backgroundColor: Colors.light.primary,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.three,
    marginTop: Spacing.two,
  },

  primaryButtonDisabled: {
    opacity: 0.7,
  },

  primaryButtonText: {
    color: "#FFFFFF",
    fontFamily: Fonts.button,
    fontSize: 15,
    fontWeight: "700",
  },

  buttonArrow: {
    fontSize: 17,
  },

  backButton: {
    alignSelf: "flex-start",
    paddingVertical: Spacing.one,
    marginBottom: Spacing.three,
  },

  backButtonText: {
    color: Colors.light.secondary,
    fontSize: 13,
    fontWeight: "700",
    fontFamily: Fonts.body,
  },

  detailsHeadingRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: Spacing.one,
  },

  detailsHeadingText: {
    flex: 1,
  },

  detailsStepBadge: {
    backgroundColor: Colors.light.background,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    borderRadius: Radius.sm,
    marginLeft: Spacing.two,
  },

  detailsStepBadgeText: {
    color: Colors.light.secondary,
    fontFamily: Fonts.body,
    fontWeight: "700",
    fontSize: 10,
    letterSpacing: 0.5,
  },

  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#F4F7F3",
    borderRadius: Radius.md,
    padding: Spacing.three,
    marginBottom: Spacing.three,
    gap: Spacing.two,
  },

  infoIcon: {
    color: Colors.light.secondary,
    fontSize: 17,
    fontWeight: "700",
  },

  infoText: {
    flex: 1,
    color: Colors.light.textSecondary,
    fontFamily: Fonts.body,
    fontSize: 12,
    lineHeight: 18,
  },

  errorBanner: {
    backgroundColor: "#FCEDEC",
    borderWidth: 1,
    borderColor: "#F2C6C3",
    borderRadius: Radius.md,
    padding: Spacing.three,
    marginBottom: Spacing.two,
  },

  errorBannerText: {
    color: Colors.light.error,
    fontFamily: Fonts.body,
    fontSize: 12,
    lineHeight: 18,
  },

  termsText: {
    color: Colors.light.textSecondary,
    fontFamily: Fonts.body,
    fontSize: 11,
    lineHeight: 17,
    textAlign: "center",
    marginTop: Spacing.three,
  },

  loginRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flexWrap: "wrap",
    marginTop: Spacing.four,
  },

  loginText: {
    color: Colors.light.textSecondary,
    fontFamily: Fonts.body,
    fontSize: 13,
  },

  loginLink: {
    color: Colors.light.primary,
    fontFamily: Fonts.body,
    fontSize: 13,
    fontWeight: "700",
  },

  bottomNote: {
    color: Colors.light.textSecondary,
    fontFamily: Fonts.body,
    fontSize: 9,
    letterSpacing: 1.3,
    textAlign: "center",
    marginTop: Spacing.four,
  },

  successContainer: {
    flex: 1,
    width: "100%",
    maxWidth: 520,
    alignSelf: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.five,
  },

  successIconCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: "#E7F2E4",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: Spacing.four,
  },

  successCheck: {
    color: Colors.light.accent,
    fontSize: 42,
    fontWeight: "700",
  },

  successTitle: {
    fontFamily: Fonts.heading,
    fontSize: 28,
    lineHeight: 36,
    fontWeight: "700",
    color: Colors.light.text,
    textAlign: "center",
    marginBottom: Spacing.two,
  },

  successDescription: {
    fontFamily: Fonts.body,
    fontSize: 14,
    lineHeight: 22,
    color: Colors.light.textSecondary,
    textAlign: "center",
    marginBottom: Spacing.four,
  },

  statusCard: {
    borderWidth: 1,
    borderColor: "#EAE6DF",
    backgroundColor: "#FFFFFF",
    borderRadius: Radius.lg,
    padding: Spacing.three,
    marginBottom: Spacing.four,
  },

  statusLabel: {
    color: Colors.light.textSecondary,
    fontFamily: Fonts.body,
    fontSize: 10,
    letterSpacing: 1.4,
    fontWeight: "700",
    marginBottom: Spacing.two,
  },

  statusBadge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    backgroundColor: "#FFF2D9",
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    marginBottom: Spacing.three,
    gap: Spacing.two,
  },

  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#B7791F",
  },

  statusBadgeText: {
    color: "#8A5A12",
    fontFamily: Fonts.body,
    fontSize: 12,
    fontWeight: "700",
  },

  statusDescription: {
    color: Colors.light.textSecondary,
    fontFamily: Fonts.body,
    fontSize: 13,
    lineHeight: 20,
  },

  footerText: {
    color: Colors.light.textSecondary,
    fontFamily: Fonts.body,
    fontSize: 12,
    lineHeight: 19,
    textAlign: "center",
    marginTop: Spacing.four,
  },
});
