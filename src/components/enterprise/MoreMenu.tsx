import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { FontAwesome5 } from "@react-native-vector-icons/fontawesome5";

import { Colors, Fonts, Radius, Spacing } from "@/constants/theme";

type MoreMenuProps = {
  visible: boolean;
  onClose: () => void;
  onNotifications: () => void;
  onProfile: () => void;
  onLogout: () => void;
};

type MenuItemProps = {
  icon: string;
  label: string;
  description?: string;
  danger?: boolean;
  onPress: () => void;
};

function MenuItem({
  icon,
  label,
  description,
  danger = false,
  onPress,
}: MenuItemProps) {
  const color = danger ? Colors.light.error : Colors.light.text;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [
        styles.menuItem,
        pressed && styles.menuItemPressed,
      ]}
    >
      <View
        style={[styles.iconContainer, danger && styles.dangerIconContainer]}
      >
        <FontAwesome5
          name={icon as never}
          size={17}
          color={color}
          iconStyle="solid"
        />
      </View>

      <View style={styles.menuItemText}>
        <Text style={[styles.menuItemLabel, { color }]}>{label}</Text>

        {description ? (
          <Text style={styles.menuItemDescription}>{description}</Text>
        ) : null}
      </View>

      <FontAwesome5
        name="chevron-right"
        size={12}
        color={Colors.light.textSecondary}
        iconStyle="solid"
      />
    </Pressable>
  );
}

export default function MoreMenu({
  visible,
  onClose,
  onNotifications,
  onProfile,
  onLogout,
}: MoreMenuProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.modalRoot}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close menu"
          style={styles.backdrop}
          onPress={onClose}
        />

        <View style={styles.sheet}>
          <View style={styles.handle} />

          <View style={styles.headingRow}>
            <View>
              <Text style={styles.title}>More</Text>
              <Text style={styles.subtitle}>Manage your Servd account</Text>
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close menu"
              onPress={onClose}
              style={styles.closeButton}
              hitSlop={8}
            >
              <FontAwesome5
                name="times"
                size={17}
                color={Colors.light.text}
                iconStyle="solid"
              />
            </Pressable>
          </View>

          <View style={styles.menuList}>
            <MenuItem
              icon="bell"
              label="Notifications"
              description="Stay up to date"
              onPress={onNotifications}
            />

            <MenuItem
              icon="building"
              label="Enterprise profile"
              description="Manage your organisation"
              onPress={onProfile}
            />

            <View style={styles.separator} />

            <MenuItem
              icon="sign-out-alt"
              label="Log out"
              description="Sign out of your account"
              danger
              onPress={onLogout}
            />
          </View>

          <Text style={styles.footer}>Servd · Food shared, not wasted.</Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(28, 34, 27, 0.38)",
  },
  sheet: {
    backgroundColor: Colors.light.background,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.four,
  },
  handle: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: Radius.lg,
    backgroundColor: Colors.light.backgroundElement,
    marginBottom: Spacing.three,
  },
  headingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.three,
  },
  title: {
    fontFamily: Fonts.heading,
    fontSize: 25,
    color: Colors.light.text,
  },
  subtitle: {
    fontFamily: Fonts.body,
    fontSize: 13,
    color: Colors.light.textSecondary,
    marginTop: 3,
  },
  closeButton: {
    width: 38,
    height: 38,
    borderRadius: Radius.lg,
    backgroundColor: Colors.light.backgroundElement,
    alignItems: "center",
    justifyContent: "center",
  },
  menuList: {
    gap: Spacing.one,
  },
  menuItem: {
    minHeight: 66,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.two,
    borderRadius: Radius.lg,
    gap: Spacing.three,
  },
  menuItemPressed: {
    backgroundColor: Colors.light.backgroundElement,
  },
  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: Radius.md,
    backgroundColor: Colors.light.backgroundElement,
    alignItems: "center",
    justifyContent: "center",
  },
  dangerIconContainer: {
    backgroundColor: "#F8E5E3",
  },
  menuItemText: {
    flex: 1,
    gap: 3,
  },
  menuItemLabel: {
    fontFamily: Fonts.body,
    fontSize: 15,
    fontWeight: "700",
  },
  menuItemDescription: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.light.backgroundElement,
    marginVertical: Spacing.two,
  },
  footer: {
    fontFamily: Fonts.body,
    fontSize: 11,
    color: Colors.light.textSecondary,
    textAlign: "center",
    marginTop: Spacing.four,
  },
});
