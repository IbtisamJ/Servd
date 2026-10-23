import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Colors } from "@/constants/theme";

export default function EnterpriseLayout() {
  return (
    <>
      <StatusBar style="dark" />

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
    </>
  );
}
