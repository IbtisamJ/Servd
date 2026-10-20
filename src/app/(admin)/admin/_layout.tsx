/**
 * Admin Layout and Navigation
 *
 * Defines the shared navigation layout for the administrator
 * section of the application. Uses Expo Router to render the
 * selected admin screen and provides navigation to the main
 * management sections.
 *
 * Responsibilities:
 * - Provides the admin navigation structure.
 * - Displays the currently selected admin route.
 * - Connects the dashboard to the management screens.
 *
 */

import FontAwesome5 from "@react-native-vector-icons/fontawesome5";
import { Slot, usePathname, useRouter, type Href } from "expo-router";
import { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Colors, Fonts, Spacing } from "@/constants/theme";

const colors = Colors.light;
const BREAKPOINT = 768;

const navigationItems = [
  { label: "Dashboard", href: "/admin", icon: "th-large", mobile: true },
  { label: "NGOs", href: "/admin/ngos", icon: "users", mobile: true },
  { label: "Donations", href: "/admin/donations", icon: "box", mobile: true },
  { label: "Enterprises", href: "/admin/enterprises", icon: "store", mobile: false },
  { label: "Reservations", href: "/admin/reservations", icon: "calendar-alt", mobile: false },
  { label: "Users", href: "/admin/users", icon: "user", mobile: false },
  { label: "Settings", href: "/admin/settings", icon: "cog", mobile: false },
] as const;

type NavItem = (typeof navigationItems)[number];

function activeRoute(pathname: string, href: string) {
  return href === "/admin"
    ? pathname === href
    : pathname === href || pathname.startsWith(`${href}/`);
}

export default function AdminLayout() {
  const pathname = usePathname();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const desktop = width >= BREAKPOINT;
  const [moreOpen, setMoreOpen] = useState(false);

  const current =
    navigationItems.find((item) => activeRoute(pathname, item.href)) ??
    navigationItems[0];

  const mobileItems = navigationItems.filter((item) => item.mobile);
  const moreItems = navigationItems.filter((item) => !item.mobile);
  const moreActive = moreItems.some((item) => activeRoute(pathname, item.href));

  const navigate = (href: string) => {
  setMoreOpen(false);
  router.push(href as Href);
};

  const navButton = (item: NavItem, compact = false) => {
    const active = activeRoute(pathname, item.href);

    return (
      <Pressable
        key={item.href}
        onPress={() => navigate(item.href)}
        accessibilityRole="button"
        style={[
          compact ? styles.mobileItem : styles.navItem,
          active && styles.activeItem,
        ]}
      >
        <FontAwesome5
          name={item.icon}
          size={compact ? 18 : 16}
          color={active ? colors.primary : colors.textSecondary}
          iconStyle="solid"
        />
        <Text
          numberOfLines={1}
          style={[
            compact ? styles.mobileLabel : styles.navLabel,
            active && styles.activeLabel,
          ]}
        >
          {item.label}
        </Text>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <View style={styles.container}>
        {desktop && (
          <View style={styles.sidebar}>
            <Text style={styles.logo}>Servd</Text>
            <Text style={styles.section}>WORKSPACE</Text>
            <ScrollView>
              {navigationItems.map((item) => navButton(item))}
            </ScrollView>
            <Text style={styles.footer}>Admin console</Text>
          </View>
        )}

        <View style={styles.main}>
          <View style={styles.header}>
            {!desktop && <Text style={styles.mobileLogo}>Servd</Text>}
            <View style={styles.headerText}>
              <Text style={styles.title}>{current.label}</Text>
              <Text style={styles.subtitle}>Manage your platform</Text>
            </View>
            <FontAwesome5 name="shield-alt" size={18} color={colors.secondary} iconStyle="solid" />
          </View>

          <View style={styles.content}>
            <Slot />
          </View>

          {!desktop && (
            <>
              {moreOpen && (
                <>
                  <Pressable
                    onPress={() => setMoreOpen(false)}
                    style={styles.backdrop}
                  />
                  <View style={styles.moreMenu}>
                    <Text style={styles.section}>MORE</Text>
                    {moreItems.map((item) => navButton(item))}
                  </View>
                </>
              )}

              <View style={styles.bottomNav}>
                {mobileItems.map((item) => navButton(item, true))}
                <Pressable
                  onPress={() => setMoreOpen((open) => !open)}
                  style={[
                    styles.mobileItem,
                    (moreOpen || moreActive) && styles.activeItem,
                  ]}
                >
                  <FontAwesome5
                    name="bars"
                    size={18}
                    color={
                      moreOpen || moreActive
                        ? colors.primary
                        : colors.textSecondary
                    }
                    iconStyle="solid"
                  />
                  <Text
                    style={[
                      styles.mobileLabel,
                      (moreOpen || moreActive) && styles.activeLabel,
                    ]}
                  >
                    More
                  </Text>
                </Pressable>
              </View>
            </>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, flexDirection: "row" },
  sidebar: {
    width: 230,
    padding: Spacing.three,
    backgroundColor: "#FFFFFF",
    borderRightWidth: 1,
    borderColor: "#EAE7E1",
  },
  logo: {
    fontFamily: Fonts.heading,
    fontSize: 28,
    fontWeight: "700",
    color: colors.primary,
    marginBottom: Spacing.five,
  },
  section: {
    fontFamily: Fonts.body,
    fontSize: 11,
    fontWeight: "700",
    color: colors.textSecondary,
    marginBottom: Spacing.two,
  },
  navItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: 8,
  },
  activeItem: { backgroundColor: "#FCEDEA" },
  navLabel: {
    fontFamily: Fonts.navigation,
    fontSize: 14,
    color: colors.textSecondary,
  },
  activeLabel: { color: colors.primary, fontWeight: "700" },
  footer: {
    fontFamily: Fonts.body,
    color: colors.textSecondary,
    marginTop: Spacing.three,
  },
  main: { flex: 1, minWidth: 0 },
  header: {
    minHeight: 76,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderColor: "#EAE7E1",
  },
  headerText: { flex: 1 },
  title: {
    fontFamily: Fonts.heading,
    fontSize: 22,
    fontWeight: "700",
    color: colors.text,
  },
  subtitle: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: colors.textSecondary,
  },
  mobileLogo: {
    fontFamily: Fonts.heading,
    fontSize: 18,
    fontWeight: "700",
    color: colors.primary,
  },
  content: { flex: 1, minHeight: 0 },
  bottomNav: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderColor: "#EAE7E1",
    justifyContent: "space-around",
  },
  mobileItem: {
    flex: 1,
    minWidth: 0,
    minHeight: 58,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingHorizontal: 2,
  },
  mobileLabel: {
    fontFamily: Fonts.navigation,
    fontSize: 10,
    color: colors.textSecondary,
  },
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(20,20,20,0.15)",
    zIndex: 5,
  },
  moreMenu: {
    position: "absolute",
    right: 12,
    bottom: 68,
    width: 210,
    padding: Spacing.two,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    elevation: 8,
    zIndex: 6,
  },
});