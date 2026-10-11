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
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
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
import { auth, db } from "../config/firebase";
import { Colors } from "../constants/theme";

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
    const trimmedEmail = email.trim().toLowerCase();

    // Basic input validation
    if (!trimmedEmail) {
      setError("Please enter your email address.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      // Authenticate the user
      const userCredential = await signInWithEmailAndPassword(
        auth,
        trimmedEmail,
        password,
      );

      // Retrieve main user record from Firestore
      const user = userCredential.user;

      // Retrieve the main user record
      const userDoc = await getDoc(doc(db, "Users", user.uid));

      if (!userDoc.exists()) {
        await signOut(auth);
        setError(
          "Your account details could not be found. Please contact support.",
        );
        return;
      }

      const userData = userDoc.data();
      const role = String(userData.role ?? "").toLowerCase();
      const accountStatus = String(userData.accountStatus ?? "").toLowerCase();

      // Block suspended/disabled accounts
      if (accountStatus === "suspended" || accountStatus === "disabled") {
        await signOut(auth);
        setError(
          "Your account has been suspended or disabled. Please contact support.",
        );
        return;
      }

      if (role === "ngo") {
        // Check NGO verification status
        const ngoDoc = await getDoc(doc(db, "NGOs", user.uid));

        if (!ngoDoc.exists()) {
          await signOut(auth);
          setError(
            "Your organisation details could not be found. Please contact support.",
          );
          return;
        }

        const verificationStatus = String(
          ngoDoc.data().verificationStatus ?? "",
        ).toLowerCase();

        if (verificationStatus === "approved") {
          await playTruckAnimation();
          router.replace("/ngo-dashboard");
        } else if (verificationStatus === "pending") {
          await playTruckAnimation();
          router.replace("/NGOWelcome");
        } else if (verificationStatus === "rejected") {
          await signOut(auth);
          setError(
            "Your NGO registration was not approved. Please contact support.",
          );
        } else {
          await signOut(auth);
          setError(
            "Your account is not approved for access. Please contact support.",
          );
        }
      } else if (role === "foodEnterprise") {
        // Route active food enterprise accounts.

        if (accountStatus !== "approved" && accountStatus !== "active") {
          await signOut(auth);
          setError("Your enterprise account is not yet approved for access.");
          return;
        }

        await playTruckAnimation();
        router.replace("/EnterpriseDashboard");
      } else {
        await signOut(auth);
        setError(
          "Your account role could not be identified. Please contact support.",
        );
      }
    } catch (err: any) {
      console.error("Login error:", err.code ?? err.message);

      // Handle common authentication and connection errors
      switch (err.code) {
        case "auth/invalid-credential":
        case "auth/wrong-password":
        case "auth/user-not-found":
          setError("Incorrect email or password. Please try again.");
          break;

        case "auth/invalid-email":
          setError("Please enter a valid email address.");
          break;

        case "auth/user-disabled":
          setError("This account has been disabled.");
          break;

        case "auth/too-many-requests":
          setError("Too many login attempts. Please wait and try again.");
          break;

        case "auth/network-request-failed":
        case "unavailable":
          setError(
            "Unable to connect. Check your internet connection and try again.",
          );
          break;

        case "permission-denied":
          setError(
            "We couldn't access your account details. Please try again or contact support.",
          );
          break;

        default:
          setError("Something went wrong while logging in. Please try again.");
      }
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
