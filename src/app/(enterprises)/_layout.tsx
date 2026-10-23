import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Colors } from '@/constants/theme';

export default function EnterpriseGroupLayout() {
  return (
    <>
      <StatusBar style="dark" />

      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: Colors.light.background,
          },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="enterprises" />
        <Stack.Screen name="notifications" />
      </Stack>
    </>
  );
}