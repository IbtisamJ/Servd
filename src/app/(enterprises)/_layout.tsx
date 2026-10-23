import { Stack, usePathname } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, View } from "react-native";

import { EnterpriseTabBar } from "@/components/enterprise";
import { Colors } from "@/constants/theme";

export default function EnterpriseGroupLayout() {
  const pathname = usePathname();

  const showEnterpriseTabBar =
    pathname === "/enterprises" || pathname.startsWith("/enterprises/");

  return (
    <View style={styles.container}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  content: {
    flex: 1,
  },
});
