
/**
 * NGO Layout and Navigation
 *
 * Provides a shared layout for all NGO screens in Servd.
 *
 * Responsibilities:
 * - Displays a desktop sidebar on wider screens.
 * - Displays bottom navigation on smaller screens.
 * - Highlights the currently selected screen.
 * - Provides a More menu for account and organisation screens.
 * - Uses Servd's existing theme, logo, and navigation styling.
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

import { Colors, Fonts, Radius, Spacing } from "../../constants/theme";

// Use the existing light theme to keep the NGO and admin interfaces consistent.
const colors = Colors.light;

// Screens wider than this breakpoint use the desktop sidebar.
const BREAKPOINT = 768;

/**
 * Defines the NGO navigation links.
 *
 * The mobile property determines whether an item appears directly
 * in the bottom navigation or inside the More menu.
 *
 * These hrefs correspond to files inside src/app/ngos/.
 */
const navigationItems = [
  {
    label: "Dashboard",
    href: "/ngos/ngo-dashboard",
    icon: "th-large",
    mobile: true,
  },
  {
    label: "Find Food",
    href: "/ngos/available-donations",
    icon: "utensils",
    mobile: true,
  },
  {
    label: "Reservations",
    href: "/ngos/my-reservations",
    icon: "calendar-alt",
    mobile: true,
  },
  {
    label: "My Account",
    href: "/ngos/my-account",
    icon: "user",
    mobile: false,
  },
  {
    label: "My Organisation",
    href: "/ngos/ngo-verification",
    icon: "building",
    mobile: false,
  },
] as const;

// Derive the navigation item type from the list to keep labels and routes consistent.
type NavItem = (typeof navigationItems)[number];

/**
 * Determines whether a navigation item matches the current route.
 *
 * The startsWith check also keeps a parent navigation item active
 * when a nested screen is opened beneath its route.
 */
function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function NGOLayout() {
  // Read the current route so the correct navigation item and title can be highlighted.
  const pathname = usePathname();

  // Use Expo Router to navigate between NGO screens.
  const router = useRouter();

  // Read the screen width to choose the desktop or mobile layout.
  const { width } = useWindowDimensions();
  const desktop = width >= BREAKPOINT;

  // Tracks whether the extra mobile navigation menu is open.
  const [moreOpen, setMoreOpen] = useState(false);

  // Find the navigation item corresponding to the current screen.
  const current =
    navigationItems.find((item) => isActive(pathname, item.href)) ??
    navigationItems[0];

  // Separate the always-visible mobile links from links in the More menu.
  const mobileItems = navigationItems.filter((item) => item.mobile);
  const moreItems = navigationItems.filter((item) => !item.mobile);

  // Highlight More when the current screen belongs to that menu.
  const moreActive = moreItems.some((item) =>
    isActive(pathname, item.href)
  );

  /**
   * Closes the More menu before navigating to another screen.
   * Href typing keeps navigation compatible with Expo Router.
   */
  const navigate = (href: string) => {
    setMoreOpen(false);
    router.push(href as Href);
  };

  /**
   * Reusable navigation button for both desktop and mobile layouts.
   *
   * The compact option changes the sizing for the bottom navigation.
   * Accessibility labels and selected states help assistive technologies.
   */
  const navButton = (item: NavItem, compact = false) => {
    const active = isActive(pathname, item.href);

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
        {/* Give the active navigation item a matching icon background. */}
        <View style={[styles.iconWrap, active && styles.activeIconWrap]}>
          <FontAwesome5
            name={item.icon}
            size={compact ? 17 : 16}
            color={active ? colors.primary : colors.textSecondary}
            iconStyle="solid"
          />
        </View>

        {/* Prevent long navigation labels from overflowing. */}
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
        {/* Desktop sidebar: show all NGO navigation links at once. */}
        {desktop && (
          <View style={styles.sidebar}>
            {/* Servd branding at the top of the sidebar. */}
            <View style={styles.brandContainer}>
              <Image
                source={require("../../../assets/images/Servd_Logo.png")}
                resizeMode="contain"
                accessibilityLabel="Servd logo"
                style={styles.logo}
              />
            </View>

            <Text style={styles.sectionLabel}>NGO WORKSPACE</Text>

            {/* Allow sidebar links to scroll if the screen height is limited. */}
            <ScrollView
              style={styles.sidebarNavigation}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.sidebarNavigationContent}
            >
              {navigationItems.map((item) => navButton(item))}
            </ScrollView>

            {/* Keep a short message at the bottom of the sidebar. */}
            <View style={styles.sidebarFooter}>
              <View style={styles.footerDivider} />
              <Text style={styles.footerText}>
                Good food deserves to be shared.
              </Text>
            </View>
          </View>
        )}

        {/* Main content area shared by desktop and mobile screens. */}
        <View style={styles.main}>
          {/* Page header shows the current screen title. */}
          <View style={styles.header}>
            {/* On mobile, display the logo beside the page title. */}
            {!desktop && (
              <Image
                source={require("../../../assets/images/Servd_Logo.png")}
                resizeMode="contain"
                accessibilityLabel="Servd logo"
                style={styles.mobileLogo}
              />
            )}

            <View style={styles.headerText}>
              <Text style={styles.breadcrumb}>NGO WORKSPACE</Text>
              <Text style={styles.pageTitle}>{current.label}</Text>
            </View>

            {/* Visual indicator that this is the NGO workspace. */}
            <View
              style={styles.roleBadge}
              accessibilityLabel="NGO workspace"
            >
              <FontAwesome5
                name="building"
                size={15}
                color={colors.secondary}
                iconStyle="solid"
              />
            </View>
          </View>

          {/* Expo Router renders the selected NGO screen here. */}
          <View style={styles.content}>
            <Slot />
          </View>

          {/* Mobile navigation: show the main links and a More button. */}
          {!desktop && (
            <>
              {/* The backdrop closes the More menu when pressed. */}
              {moreOpen && (
                <>
                  <Pressable
                    onPress={() => setMoreOpen(false)}
                    style={styles.backdrop}
                    accessibilityRole="button"
                    accessibilityLabel="Close navigation menu"
                  />

                  {/* Additional screens appear above the bottom navigation. */}
                  <View style={styles.moreMenu}>
                    <Text style={styles.menuHeading}>YOUR ACCOUNT</Text>
                    {moreItems.map((item) => navButton(item))}
                  </View>
                </>
              )}

              <View style={styles.bottomNav}>
                {/* Display the primary navigation links. */}
                {mobileItems.map((item) => navButton(item, true))}

                {/* Toggle the extra links without navigating away. */}
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

/**
 * Layout styles.
 *
 * The styling follows the existing admin layout's visual language:
 * white surfaces, subtle borders, rounded corners, and Servd theme colours.
 */
const styles = StyleSheet.create({
  // Root layout
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

  // Desktop sidebar
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

  // Active and pressed navigation states
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

  // Sidebar footer
  sidebarFooter: {
    marginTop: Spacing.three,
  },
  footerDivider: {
    height: 1,
    backgroundColor: "#E8E5DF",
    marginBottom: Spacing.three,
  },
  footerText: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: colors.textSecondary,
    paddingHorizontal: Spacing.two,
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
  roleBadge: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EAF4F1",
    borderRadius: Radius.md,
  },

  // Screen content area
  content: {
    flex: 1,
    minHeight: 0,
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

  // More menu overlay
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
