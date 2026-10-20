/**
 * Admin Layout and Navigation
 *
 * Provides shared navigation and layout for the admin section.
 * The layout adapts between a desktop sidebar and mobile bottom
 * navigation while preserving the existing Expo Router routes.
 */

import FontAwesome5 from "@react-native-vector-icons/fontawesome5";
import { Slot, usePathname, useRouter, type Href } from "expo-router";
import { useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Colors, Fonts, Radius, Spacing } from "@/constants/theme";

const colors = Colors.light;
const BREAKPOINT = 768;

const navigationItems = [
  { label: "Dashboard", href: "/admin", icon: "th-large", mobile: true },
  { label: "NGOs", href: "/admin/ngos", icon: "users", mobile: true },
  { label: "Donations", href: "/admin/donations", icon: "box", mobile: true },
  {
    label: "Enterprises",
    href: "/admin/enterprises",
    icon: "store",
    mobile: false,
  },
  {
    label: "Reservations",
    href: "/admin/reservations",
    icon: "calendar-alt",
    mobile: false,
  },
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
  const moreActive = moreItems.some((item) =>
    activeRoute(pathname, item.href)
  );

  // Close the extra navigation menu whenever a route is selected.
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
        accessibilityLabel={item.label}
        accessibilityState={{ selected: active }}
        style={({ pressed }) => [
          compact ? styles.mobileItem : styles.navItem,
          active && styles.activeItem,
          pressed && styles.pressedItem,
        ]}
      >
        <View style={[styles.iconWrap, active && styles.activeIconWrap]}>
          <FontAwesome5
            name={item.icon}
            size={compact ? 17 : 16}
            color={active ? colors.primary : colors.textSecondary}
            iconStyle="solid"
          />
        </View>

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
            <View style={styles.brandContainer}>
              <Image
                source={require("../../../../assets/images/Servd_Logo.png")}
                resizeMode="contain"
                accessibilityLabel="Servd logo"
                style={styles.logo}
              />
            </View>

            <Text style={styles.sectionLabel}>MENU</Text>

            <ScrollView
              style={styles.sidebarNavigation}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.sidebarNavigationContent}
            >
              {navigationItems.map((item) => navButton(item))}
            </ScrollView>

            <View style={styles.sidebarFooter}>
              <View style={styles.footerDivider} />
              <View style={styles.footerStatus}>
                <View style={styles.statusDot} />
                <Text style={styles.footerText}>Admin workspace</Text>
              </View>
            </View>
          </View>
        )}

        <View style={styles.main}>
          <View style={styles.header}>
            {!desktop && (
              <Image
                source={require("../../../../assets/images/Servd_Logo.png")}
                resizeMode="contain"
                accessibilityLabel="Servd logo"
                style={styles.mobileLogo}
              />
            )}

            <View style={styles.headerText}>
              <Text style={styles.breadcrumb}>ADMINISTRATION</Text>
              <Text style={styles.pageTitle}>{current.label}</Text>
            </View>

            <View
              style={styles.securityBadge}
              accessibilityLabel="Admin workspace"
            >
              <FontAwesome5
                name="shield-alt"
                size={16}
                color={colors.secondary}
                iconStyle="solid"
              />
            </View>
          </View>

          {/* Individual screens render here inside the shared workspace. */}
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
                    accessibilityRole="button"
                    accessibilityLabel="Close navigation menu"
                  />

                  <View style={styles.moreMenu}>
                    <Text style={styles.menuHeading}>MORE</Text>
                    {moreItems.map((item) => navButton(item))}
                  </View>
                </>
              )}

              <View style={styles.bottomNav}>
                {mobileItems.map((item) => navButton(item, true))}

                <Pressable
                  onPress={() => setMoreOpen((open) => !open)}
                  accessibilityRole="button"
                  accessibilityLabel="More navigation options"
                  accessibilityState={{ expanded: moreOpen }}
                  style={({ pressed }) => [
                    styles.mobileItem,
                    (moreOpen || moreActive) && styles.activeItem,
                    pressed && styles.pressedItem,
                  ]}
                >
                  <View
                    style={[
                      styles.iconWrap,
                      (moreOpen || moreActive) && styles.activeIconWrap,
                    ]}
                  >
                    <FontAwesome5
                      name="bars"
                      size={17}
                      color={
                        moreOpen || moreActive
                          ? colors.primary
                          : colors.textSecondary
                      }
                      iconStyle="solid"
                    />
                  </View>

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
  safe: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  container: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
  },
  main: {
    flex: 1,
    minWidth: 0,
    backgroundColor: "#FFFFFF",
  },

  // Desktop navigation
  sidebar: {
    width: 248,
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.three,
    backgroundColor: "#FFFFFF",
    borderRightWidth: 1,
    borderRightColor: "#E8E5DF",
  },
  brandContainer: {
    height: 104,
    alignItems: "flex-start",
    justifyContent: "center",
    paddingHorizontal: Spacing.two,
    marginBottom: Spacing.four,
  },
  // The image keeps its original 625:677 aspect ratio.
  logo: {
    width: 112,
    height: 104,
  },
  sectionLabel: {
    fontFamily: Fonts.body,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.2,
    color: "#85827D",
    paddingHorizontal: Spacing.two,
    marginBottom: Spacing.two,
  },
  sidebarNavigation: {
    flex: 1,
  },
  sidebarNavigationContent: {
    paddingBottom: Spacing.two,
  },
  navItem: {
    minHeight: 46,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.two,
    marginBottom: Spacing.one,
    borderRadius: Radius.md,
    borderLeftWidth: 3,
    borderLeftColor: "transparent",
  },
  activeItem: {
    backgroundColor: "#FFF4F1",
    borderLeftColor: colors.primary,
  },
  pressedItem: {
    opacity: 0.72,
  },
  iconWrap: {
    width: 30,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Radius.sm,
  },
  activeIconWrap: {
    backgroundColor: "#FCE5E0",
  },
  navLabel: {
    flex: 1,
    fontFamily: Fonts.navigation,
    fontSize: 13,
    fontWeight: "500",
    color: "#55565A",
  },
  activeLabel: {
    color: colors.primary,
    fontWeight: "700",
  },
  sidebarFooter: {
    marginTop: Spacing.three,
  },
  footerDivider: {
    height: 1,
    backgroundColor: "#E8E5DF",
    marginBottom: Spacing.three,
  },
  footerStatus: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    paddingHorizontal: Spacing.two,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.accent,
  },
  footerText: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: colors.textSecondary,
  },

  // Shared page header
  header: {
    minHeight: 78,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E8E5DF",
  },
  headerText: {
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
  pageTitle: {
    fontFamily: Fonts.heading,
    fontSize: 22,
    fontWeight: "700",
    color: "#292929",
  },
  mobileLogo: {
    width: 43,
    height: 47,
  },
  securityBadge: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EAF4F1",
    borderRadius: Radius.md,
  },

  // Warm off-white distinguishes page content from the white frame.
  content: {
  flex: 1,
  minHeight: 0,
  height: 0,
  alignSelf: "stretch",
  backgroundColor: "#FFFFFF",
},

  // Mobile bottom navigation
  bottomNav: {
    flexDirection: "row",
    alignItems: "stretch",
    justifyContent: "space-around",
    paddingHorizontal: Spacing.one,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E8E5DF",
  },
  mobileItem: {
    flex: 1,
    minWidth: 0,
    minHeight: 62,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
    paddingHorizontal: 2,
    borderRadius: Radius.md,
  },
  mobileLabel: {
    fontFamily: Fonts.navigation,
    fontSize: 10,
    fontWeight: "500",
    color: "#626269",
  },

  // Additional mobile navigation opens above the bottom bar.
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(35, 32, 30, 0.18)",
    zIndex: 5,
  },
  moreMenu: {
    position: "absolute",
    right: Spacing.three,
    bottom: 70,
    width: 224,
    padding: Spacing.two,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E8E5DF",
    borderRadius: Radius.lg,
    elevation: 8,
    shadowColor: "#292929",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    zIndex: 6,
  },
  menuHeading: {
    fontFamily: Fonts.body,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.2,
    color: "#85827D",
    paddingHorizontal: Spacing.two,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.two,
  },
});