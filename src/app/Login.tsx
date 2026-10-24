/**
 * Handles user authentication for Servd:
 * - Email/password login via Firebase Auth
 * - Role-based routing (NGO / Enterprise)
 * - Account status and verification checks
 * - Error handling and feedback messages
 * - Loading animation during login
 */

import FontAwesome5 from "@react-native-vector-icons/fontawesome5";
import { useRouter } from "expo-router";
import { doc, getDoc } from "firebase/firestore";
import { useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { db } from "../config/firebase";
import { COLLECTIONS, NGO_STATUS, ROLES } from "../constants/roles";
import { Colors } from "../constants/theme";
import {
  getAuthErrorMessage,
  loginUser,
  logoutUser,
} from "../services/authService";

export default function Login() {
  const router = useRouter();

  // Local state for form inputs and UI feedback
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Loading animation values
  const truckAnim = useRef(new Animated.Value(0)).current;
  const wheelAnim = useRef(new Animated.Value(0)).current;
  const screenWidth = Dimensions.get("window").width;

  // Plays truck + wheel animation once before routing
  const playTruckAnimation = () =>
    new Promise<void>((resolve) => {
      truckAnim.setValue(0);
      wheelAnim.setValue(0);

      Animated.parallel([
        Animated.timing(truckAnim, {
          toValue: 1,
          duration: 1400,
          useNativeDriver: true,
        }),
        Animated.timing(wheelAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]).start(() => resolve());
    });

  const handleLogin = async () => {
    setError("");

    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);

    try {
      const result = await loginUser(email, password);

      if (result.role === ROLES.NGO) {
        const ngoDoc = await getDoc(doc(db, COLLECTIONS.NGOS, result.uid));

        if (!ngoDoc.exists()) {
          await logoutUser();
          setError(
            "Your organisation details could not be found. Please contact support.",
          );
          return;
        }

        const verificationStatus = String(
          ngoDoc.data().verificationStatus ?? "",
        ).toLowerCase();

        if (verificationStatus === NGO_STATUS.PENDING) {
          await playTruckAnimation();
          router.replace("/NGOWelcome");
        } else if (verificationStatus === NGO_STATUS.APPROVED) {
          await playTruckAnimation();
          router.replace("/ngos/ngo-dashboard");
        } else if (verificationStatus === NGO_STATUS.REJECTED) {
          await logoutUser();
          setError(
            "Your NGO registration was not approved. Please contact support.",
          );
        } else {
          await logoutUser();
          setError(
            "Your account is not approved for access. Please contact support.",
          );
        }
      } else if (result.role === ROLES.ENTERPRISE) {
        await playTruckAnimation();
        router.replace("/(enterprises)/enterprises");
      } else if (result.role === ROLES.ADMIN) {
        await playTruckAnimation();
        router.replace("/admin");
      } else {
        await logoutUser();
        setError(
          "Your account role could not be identified. Please contact support.",
        );
      }
    } catch (error: unknown) {
      console.error("Login error:", error);
      setError(getAuthErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  // Animation transforms for truck movement + wheel rotation
  const truckTranslateX = truckAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, Math.max(0, screenWidth - 100)],
  });

  const truckRotate = wheelAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View style={styles.container}>
      {!loading ? (
        <>
          <View style={styles.logoContainer}>
            <Image
              source={require("../../assets/images/Servd_Logo.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          <Text style={styles.title}>Welcome back to Servd</Text>

          <TextInput
            placeholder="Email"
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            value={email}
            onChangeText={setEmail}
            placeholderTextColor={Colors.light.textSecondary}
            accessibilityLabel="Email address"
          />

          <View style={styles.passwordContainer}>
            <TextInput
              placeholder="Password"
              style={styles.passwordInput}
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
              placeholderTextColor={Colors.light.textSecondary}
              accessibilityLabel="Password"
            />

            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.passwordToggle}
              accessibilityRole="button"
              accessibilityLabel={
                showPassword ? "Hide password" : "Show password"
              }
            >
              <Text style={styles.passwordToggleText}>
                {showPassword ? "Hide" : "Show"}
              </Text>
            </TouchableOpacity>
          </View>

          {error ? (
            <Text accessibilityRole="alert" style={styles.error}>
              {error}
            </Text>
          ) : null}

          <TouchableOpacity
            style={styles.button}
            onPress={handleLogin}
            disabled={loading}
            accessibilityRole="button"
          >
            <Text style={styles.buttonText}>LOGIN</Text>
          </TouchableOpacity>

          <Text
            style={styles.link}
            onPress={() => router.push("/ResetPassword")}
          >
            Forgot Password?
          </Text>

          <Text style={styles.footer}>
            Don’t have an account?{" "}
            <Text
              style={styles.link}
              onPress={() => router.replace("/Register")}
            >
              Register
            </Text>
          </Text>
        </>
      ) : (
        <View style={styles.loader}>
          <Animated.View
            style={{
              transform: [
                { translateX: truckTranslateX },
                { rotate: truckRotate },
              ],
            }}
          >
            <FontAwesome5
              name="truck"
              size={32}
              color={Colors.light.secondary}
              iconStyle="solid"
            />
          </Animated.View>

          <Text style={styles.loadingText}>Getting things ready...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  logo: {
    width: 120,
    height: 120,
  },
  title: {
    fontSize: 22,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 32,
    color: Colors.light.text,
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#ddd",
    color: Colors.light.text,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    backgroundColor: "#fff",
    marginBottom: 16,
  },
  passwordInput: {
    flex: 1,
    padding: 12,
    color: Colors.light.text,
  },
  passwordToggle: {
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  passwordToggleText: {
    color: Colors.light.secondary,
    fontSize: 12,
    fontWeight: "700",
  },
  button: {
    backgroundColor: Colors.light.secondary,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 16,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  link: {
    color: Colors.light.secondary,
    textAlign: "center",
    marginTop: 8,
  },
  footer: {
    textAlign: "center",
    marginTop: 24,
    color: Colors.light.textSecondary,
  },
  error: {
    color: Colors.light.error,
    textAlign: "center",
    marginBottom: 12,
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 24,
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
});
