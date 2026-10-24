import { Stack, usePathname } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { EnterpriseTabBar } from "@/components/enterprise";
import { Colors } from "@/constants/theme";

export default function EnterpriseGroupLayout() {
  const pathname = usePathname();

  const showEnterpriseTabBar =
    pathname === "/enterprises" ||
    pathname.startsWith("/enterprises/");

  return (
    <SafeAreaView
      style={styles.container}
      edges={["top", "left", "right"]}
    >
      <StatusBar style="dark" />

      <View style={styles.content}>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: {
              backgroundColor: Colors.light.background,
            },
            animation: "slide_from_right",
          }}
        >
          <Stack.Screen name="enterprises" />
          <Stack.Screen name="notifications" />
        </Stack>
      </View>

      {showEnterpriseTabBar && <EnterpriseTabBar />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  content: {
    flex: 1,
  },
});