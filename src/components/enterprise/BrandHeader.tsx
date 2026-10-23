import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { Colors, Fonts, Radius, Spacing } from "@/constants/theme";

type BrandHeaderProps = {
  role?: string;
  actionLabel?: string;
  onActionPress?: () => void;
};

export default function BrandHeader({
  role = "ENTERPRISE",
  actionLabel,
  onActionPress,
}: BrandHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.brandGroup}>
        <Image
          source={require("../../../assets/images/Servd_Logo.png")}
          style={styles.logo}
          resizeMode="contain"
          accessibilityLabel="Servd logo"
        />

        <View style={styles.brandText}>
          <Text style={styles.wordmark}>Servd</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>{role}</Text>
          </View>
        </View>
      </View>

      {actionLabel && onActionPress ? (
        <Pressable
          onPress={onActionPress}
          style={({ pressed }) => [
            styles.actionButton,
            pressed && styles.pressed,
          ]}
          accessibilityRole="button"
        >
          <Text style={styles.actionText}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 76,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.light.background,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.light.backgroundElement,
  },
  brandGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
  logo: {
    width: 42,
    height: 42,
  },
  brandText: {
    justifyContent: "center",
    gap: 2,
  },
  wordmark: {
    fontFamily: Fonts.heading,
    fontSize: 24,
    lineHeight: 28,
    color: Colors.light.text,
  },
  roleBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: Spacing.two,
    paddingVertical: 3,
    borderRadius: Radius.sm,
    backgroundColor: Colors.light.backgroundElement,
  },
  roleText: {
    fontFamily: Fonts.body,
    fontSize: 9,
    letterSpacing: 1,
    fontWeight: "700",
    color: Colors.light.textSecondary,
  },
  actionButton: {
    minHeight: 40,
    paddingHorizontal: Spacing.three,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Radius.md,
    backgroundColor: Colors.light.backgroundElement,
  },
  actionText: {
    fontFamily: Fonts.button,
    fontSize: 13,
    fontWeight: "600",
    color: Colors.light.text,
  },
  pressed: {
    opacity: 0.7,
  },
});
