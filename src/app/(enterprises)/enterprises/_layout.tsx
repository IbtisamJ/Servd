import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, View } from "react-native";

import { Colors } from "@/constants/theme";

export default function EnterpriseLayout() {
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
          <Stack.Screen name="index" />
          <Stack.Screen name="donations/index" />
          <Stack.Screen name="donations/create" />
          <Stack.Screen name="donations/[id]" />
          <Stack.Screen name="reservations/index" />
          <Stack.Screen name="reservations/[id]" />
          <Stack.Screen name="profile" />
        </Stack>
      </View>

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
