
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import FontAwesome5 from "@react-native-vector-icons/fontawesome5";
import { Colors, Fonts, Radius, Spacing } from "@/constants/theme";

type BrandHeaderProps = {
  role?: string;
  title?: string;
  actionLabel?: string;
  onActionPress?: () => void;
};

const colors = Colors.light;

export default function BrandHeader({
  role = "ENTERPRISE",
  title = "Enterprise Workspace",
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
          <Text style={styles.breadcrumb}>
            {role.toUpperCase()} WORKSPACE
          </Text>

          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
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
          accessibilityLabel={actionLabel}
        >
          <Text style={styles.actionText}>{actionLabel}</Text>
        </Pressable>
      ) : (
        <View
          style={styles.roleBadge}
          accessibilityLabel={`${role} workspace`}
        >
          <FontAwesome5
            name="building"
            size={15}
            color={colors.secondary}
            iconStyle="solid"
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 78,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.three,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E8E5DF",
  },
  brandGroup: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
  },
  logo: {
    width: 43,
    height: 47,
  },
  brandText: {
    flex: 1,
    minWidth: 0,
    justifyContent: "center",
  },
  breadcrumb: {
    fontFamily: Fonts.body,
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 1.3,
    color: "#85827D",
    marginBottom: 3,
  },
  title: {
    fontFamily: Fonts.heading,
    fontSize: 22,
    fontWeight: "700",
    color: "#292929",
  },
  roleBadge: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EAF4F1",
    borderRadius: Radius.md,
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
    color: colors.text,
  },
  pressed: {
    opacity: 0.7,
  },
});