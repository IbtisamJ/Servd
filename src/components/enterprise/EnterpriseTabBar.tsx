import React, { useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FontAwesome5 } from "@react-native-vector-icons/fontawesome5";
import { router, usePathname } from "expo-router";
import { signOut } from "firebase/auth";

import { auth } from "@/config/firebase";
import { Colors, Fonts, Radius, Spacing } from "@/constants/theme";
import MoreMenu from "./MoreMenu";

type TabItemProps = {
  label: string;
  icon: string;
  active?: boolean;
  onPress: () => void;
};

function TabItem({
  label,
  icon,
  active = false,
  onPress,
}: TabItemProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.tabItem,
        pressed && styles.tabPressed,
      ]}
    >
      <FontAwesome5
        name={icon as never}
        size={19}
        color={
          active
            ? Colors.light.primary
            : Colors.light.textSecondary
        }
        iconStyle="solid"
      />

      <Text
        numberOfLines={1}
        style={[
          styles.tabLabel,
          active && styles.activeTabLabel,
        ]}
      >
        {label}
      </Text>

      {active ? <View style={styles.activeIndicator} /> : null}
    </Pressable>
  );
}

export default function EnterpriseTabBar() {
  const pathname = usePathname();
  const [moreVisible, setMoreVisible] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const isHome =
    pathname === "/enterprises" ||
    pathname === "/enterprises/";

  const isDonations = pathname.startsWith(
    "/enterprises/donations"
  );

  const isBookings = pathname.startsWith(
    "/enterprises/reservations"
  );

  function navigate(path: string) {
    setMoreVisible(false);
    router.push(path as never);
  }

  async function handleLogout() {
    if (loggingOut) return;

    setLoggingOut(true);

    try {
      setMoreVisible(false);
      await signOut(auth);
      router.replace("/Login" as never);
    } catch (error) {
      console.error("Unable to log out:", error);
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <>
      <SafeAreaView
        edges={["bottom"]}
        style={styles.safeArea}
      >
        <View style={styles.bar}>
          <TabItem
            label="Home"
            icon="home"
            active={isHome}
            onPress={() => navigate("/enterprises")}
          />

          <TabItem
            label="Donations"
            icon="box"
            active={isDonations}
            onPress={() => navigate("/enterprises/donations")}
          />

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Add food donation"
            onPress={() =>
              navigate("/enterprises/donations/create")
            }
            style={({ pressed }) => [
              styles.addFoodItem,
              pressed && styles.addFoodPressed,
            ]}
          >
            <View style={styles.addFoodButton}>
              <FontAwesome5
                name="plus"
                size={21}
                color="#FFFFFF"
                iconStyle="solid"
              />
            </View>

            <Text style={styles.addFoodLabel}>
              Add food
            </Text>
          </Pressable>

          <TabItem
            label="Bookings"
            icon="calendar-check"
            active={isBookings}
            onPress={() =>
              navigate("/enterprises/reservations")
            }
          />

          <TabItem
            label="More"
            icon="ellipsis-h"
            active={moreVisible}
            onPress={() => setMoreVisible(true)}
          />
        </View>
      </SafeAreaView>

      <MoreMenu
        visible={moreVisible}
        onClose={() => setMoreVisible(false)}
        onNotifications={() => navigate("/notifications")}
        onProfile={() => navigate("/enterprises/profile")}
        onLogout={handleLogout}
      />
    </>
  );
}

const styles = StyleSheet.create({
 safeArea: {
  backgroundColor: "#FFFFFF",
  borderTopWidth: StyleSheet.hairlineWidth,
  borderTopColor: Colors.light.backgroundElement,
},
bar: {
  minHeight: 64,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-around",
  paddingHorizontal: Spacing.one,
  paddingTop: Spacing.two,
  paddingBottom: Spacing.one,
  backgroundColor: "#FFFFFF",
},
  tabItem: {
    flex: 1,
    minWidth: 0,
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingVertical: Spacing.one,
    borderRadius: Radius.md,
  },
  tabPressed: {
    opacity: 0.65,
  },
  tabLabel: {
    fontFamily: Fonts.navigation,
    fontSize: 10,
    color: Colors.light.textSecondary,
    fontWeight: "500",
  },
  activeTabLabel: {
    color: Colors.light.primary,
    fontWeight: "700",
  },
  activeIndicator: {
    position: "absolute",
    bottom: -Spacing.one,
    width: 16,
    height: 3,
    borderRadius: Radius.sm,
    backgroundColor: Colors.light.primary,
  },
  addFoodItem: {
    flex: 1,
    minWidth: 0,
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
  },
  addFoodButton: {
    width: 42,
    height: 42,
    borderRadius: 15,
    backgroundColor: Colors.light.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  addFoodPressed: {
    opacity: 0.75,
    transform: [{ scale: 0.96 }],
  },
  addFoodLabel: {
    fontFamily: Fonts.navigation,
    fontSize: 10,
    color: Colors.light.text,
    fontWeight: "700",
  },
});