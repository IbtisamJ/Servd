import { useFonts } from "expo-font";

import {
    Lora_400Regular,
    Lora_700Bold,
} from "@expo-google-fonts/lora";

import {
    DMSans_400Regular,
    DMSans_700Bold,
} from "@expo-google-fonts/dm-sans";

export default function useAppFonts() {
  return useFonts({
    "Lora-Regular": Lora_400Regular,
    "Lora-Bold": Lora_700Bold,

    "DMSans-Regular": DMSans_400Regular,
    "DMSans-Bold": DMSans_700Bold,
  });
}