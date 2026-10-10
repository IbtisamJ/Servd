/**
 * Handles user registration for Servd:
 * - Two-step flow (account basics → role-specific details)
 * - Validates inputs and password strength
 * - Creates Firebase Auth account
 * - Saves user, NGO, or Enterprise details to Firestore
 * - Displays success screen with pending status
 */

import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

import { auth, db } from "../config/firebase";
import { Colors } from "../constants/theme";
import FontAwesome5 from "@react-native-vector-icons/fontawesome5";
import { styles } from "../styles/Register.styles";

type AccountRole = "NGO" | "Enterprise";

type FieldProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  keyboardType?: "default" | "email-address" | "phone-pad";
  secureTextEntry?: boolean;
  showPasswordToggle?: boolean;
  onTogglePassword?: () => void;
  isPasswordVisible?: boolean;
  error?: string;
};

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  autoCapitalize = "sentences",
  keyboardType = "default",
  secureTextEntry = false,
  showPasswordToggle = false,
  onTogglePassword,
  isPasswordVisible = false,
  error,
}: FieldProps) {
  return (
    <View style={styles.fieldContainer}>
      <Text style={styles.fieldLabel}>{label}</Text>

      <View
        style={[styles.inputWrapper, error ? styles.inputWrapperError : null]}
      >
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={Colors.light.textSecondary}
          autoCapitalize={autoCapitalize}
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          autoCorrect={false}
          selectionColor={Colors.light.primary}
        />

        {showPasswordToggle && (
          <TouchableOpacity
            onPress={onTogglePassword}
            style={styles.passwordToggle}
            accessibilityRole="button"
            accessibilityLabel={
              isPasswordVisible ? "Hide password" : "Show password"
            }
          >
            <Text style={styles.passwordToggleText}>
              {isPasswordVisible ? "Hide" : "Show"}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

export default function Register() {
  const router = useRouter();

  // Shared account details
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<AccountRole | null>(null);

  // NGO-specific details
  const [ngoName, setNgoName] = useState("");
  const [npoNumber, setNpoNumber] = useState("");
  const [ngoContact, setNgoContact] = useState("");

  // Food enterprise-specific details
  const [enterpriseName, setEnterpriseName] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [enterpriseContact, setEnterpriseContact] = useState("");

  // Screen state
  const [step, setStep] = useState<1 | 2>(1);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const passwordStrength = useMemo(() => {
    if (!password) {
      return { score: 0, label: "", color: Colors.light.backgroundSelected };
    }

    let score = 0;

    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    if (score <= 1) {
      return { score, label: "Weak", color: "#C62828" };
    }

    if (score === 2) {
      return { score, label: "Fair", color: "#D98E04" };
    }

    if (score === 3) {
      return { score, label: "Good", color: "#008080" };
    }

    return { score, label: "Strong", color: "#7C9C44" };
  }, [password]);

  const validateStepOne = () => {
    const errors: Record<string, string> = {};

    if (!name.trim()) {
      errors.name = "Please enter your full name.";
    }

    const normalizedEmail = email.trim().toLowerCase();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!normalizedEmail) {
      errors.email = "Please enter your email address.";
    } else if (!emailPattern.test(normalizedEmail)) {
      errors.email = "Please enter a valid email address.";
    }

    if (!password) {
      errors.password = "Please create a password.";
    } else if (password.length < 8) {
      errors.password = "Your password must be at least 8 characters.";
    }

    if (!role) {
      errors.role = "Please select an account type.";
    }

    setFieldErrors(errors);

    return Object.keys(errors).length === 0;
  };

  const validateStepTwo = () => {
    const errors: Record<string, string> = {};

    if (role === "NGO") {
      if (!ngoName.trim()) {
        errors.ngoName = "Please enter your organisation name.";
      }

      if (!npoNumber.trim()) {
        errors.npoNumber = "Please enter your NPO registration number.";
      }

      if (!ngoContact.trim()) {
        errors.ngoContact = "Please enter your contact information.";
      }
    }

    if (role === "Enterprise") {
      if (!enterpriseName.trim()) {
        errors.enterpriseName = "Please enter your business name.";
      }

      if (!registrationNumber.trim()) {
        errors.registrationNumber =
          "Please enter your business registration number.";
      }

      if (!enterpriseContact.trim()) {
        errors.enterpriseContact = "Please enter your contact information.";
      }
    }

    setFieldErrors(errors);

    return Object.keys(errors).length === 0;
  };

  const handleContinue = () => {
    setFormError("");

    if (!validateStepOne()) return;

    setStep(2);
  };

  const handleBack = () => {
    setFormError("");
    setFieldErrors({});
    setStep(1);
  };

  const handleRegister = async () => {
    setFormError("");

    if (!validateStepTwo() || !role) return;

    setIsLoading(true);

    try {
      const normalizedEmail = email.trim().toLowerCase();

      // Create the Firebase Authentication account
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        normalizedEmail,
        password,
      );

      const user = userCredential.user;
      const createdTimestamp = new Date().toISOString();

      // Save the shared account details
      await setDoc(doc(db, "Users", user.uid), {
        userId: user.uid,
        name: name.trim(),
        email: normalizedEmail,
        role: role === "NGO" ? "ngo" : "enterprise",
        accountStatus: "Pending",
        createdTimestamp,
      });

      if (role === "NGO") {
        // Save NGO-specific details
        await setDoc(doc(db, "NGOs", user.uid), {
          userId: user.uid,
          organisationName: ngoName.trim(),
          npoNumber: npoNumber.trim(),
          contactInformation: ngoContact.trim(),
          verificationStatus: "Pending",
          createdTimestamp,
        });
      } else {
        // Save food enterprise-specific details
        await setDoc(doc(db, "Food Enterprises", user.uid), {
          userID: user.uid,
          registrationNumber: registrationNumber.trim(),
          enterpriseName: enterpriseName.trim(),
          createdTimestamp,
          contactInformation: enterpriseContact.trim(),
        });
      }

      setSuccess(true);
    } catch (error: any) {
      console.error("Registration error:", error);

      switch (error?.code) {
        case "auth/email-already-in-use":
          setFormError(
            "An account with this email already exists. Please log in instead.",
          );
          break;

        case "auth/invalid-email":
          setFormError("Please enter a valid email address.");
          break;

        case "auth/weak-password":
          setFormError(
            "Please choose a stronger password with at least 8 characters.",
          );
          break;

        case "auth/network-request-failed":
          setFormError(
            "A network error occurred. Check your internet connection and try again.",
          );
          break;

        case "permission-denied":
          setFormError(
            "Your account could not be saved because of a database permission issue. Please contact your administrator.",
          );
          break;

        default:
          setFormError(
            "We couldn't complete your registration. Please try again.",
          );
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Registration success screen
  if (success) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.successContainer}>
          <View style={styles.successIconCircle}>
            <Text style={styles.successCheck}>✓</Text>
          </View>

          <Text style={styles.successTitle}>You're on your way!</Text>

          <Text style={styles.successDescription}>
            Your Servd account has been created successfully.
          </Text>

          <View style={styles.statusCard}>
            <Text style={styles.statusLabel}>ACCOUNT STATUS</Text>

            <View style={styles.statusBadge}>
              <View style={styles.statusDot} />
              <Text style={styles.statusBadgeText}>
                {role === "NGO" ? "Pending Verification" : "Pending Approval"}
              </Text>
            </View>

            <Text style={styles.statusDescription}>
              {role === "NGO"
                ? "Your organisation's details need to be verified before you can access NGO features."
                : "Your account is pending approval before you can use Servd's food donation features."}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.replace("/Login" as any)}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryButtonText}>Go to Login</Text>
          </TouchableOpacity>

          <Text style={styles.footerText}>
            Thank you for being part of a community that reduces food waste.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoRow}>
              <Image
                source={require("../../assets/images/Servd_Logo.png")}
                style={styles.logoImage}
                resizeMode="contain"
              />

              <Text style={styles.logoText}>Servd</Text>
            </View>

            <Text style={styles.eyebrow}>JOIN THE MOVEMENT</Text>

            <Text style={styles.pageTitle}>
              {step === 1 ? "Create your account" : "Tell us about yourself"}
            </Text>

            <Text style={styles.pageSubtitle}>
              {step === 1
                ? "Be part of a better way to connect surplus food with communities that need it."
                : role === "NGO"
                  ? "Enter your organisation's details so we can verify your account."
                  : "Enter your business details to get started with food donations."}
            </Text>
          </View>

          {/* Progress */}
          <View style={styles.progressSection}>
            <View style={styles.progressLabels}>
              <Text
                style={[
                  styles.progressLabel,
                  step === 1 && styles.progressLabelActive,
                ]}
              >
                01 Account
              </Text>

              <Text
                style={[
                  styles.progressLabel,
                  step === 2 && styles.progressLabelActive,
                ]}
              >
                02 Details
              </Text>
            </View>

            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  { width: step === 1 ? "50%" : "100%" },
                ]}
              />
            </View>
          </View>

          {/* Form */}
          <View style={styles.formCard}>
            {step === 1 ? (
              <>
                <Text style={styles.sectionTitle}>Your account</Text>
                <Text style={styles.sectionSubtitle}>
                  Let's start with the basics.
                </Text>

                <Field
                  label="Full name"
                  value={name}
                  onChangeText={(value) => {
                    setName(value);
                    setFieldErrors((previous) => ({
                      ...previous,
                      name: "",
                    }));
                  }}
                  placeholder="e.g. Alex Smith"
                  error={fieldErrors.name}
                />

                <Field
                  label="Email address"
                  value={email}
                  onChangeText={(value) => {
                    setEmail(value);
                    setFieldErrors((previous) => ({
                      ...previous,
                      email: "",
                    }));
                  }}
                  placeholder="you@example.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  error={fieldErrors.email}
                />

                <Field
                  label="Password"
                  value={password}
                  onChangeText={(value) => {
                    setPassword(value);
                    setFieldErrors((previous) => ({
                      ...previous,
                      password: "",
                    }));
                  }}
                  placeholder="Create a secure password"
                  autoCapitalize="none"
                  secureTextEntry
                  showPasswordToggle
                  isPasswordVisible={isPasswordVisible}
                  onTogglePassword={() =>
                    setIsPasswordVisible((previous) => !previous)
                  }
                  error={fieldErrors.password}
                />

                {password.length > 0 && (
                  <View style={styles.passwordStrengthContainer}>
                    <View style={styles.strengthBars}>
                      {[1, 2, 3, 4].map((bar) => (
                        <View
                          key={bar}
                          style={[
                            styles.strengthBar,
                            {
                              backgroundColor:
                                passwordStrength.score >= bar
                                  ? passwordStrength.color
                                  : Colors.light.backgroundSelected,
                            },
                          ]}
                        />
                      ))}
                    </View>

                    <Text
                      style={[
                        styles.strengthLabel,
                        { color: passwordStrength.color },
                      ]}
                    >
                      {passwordStrength.label}
                    </Text>
                  </View>
                )}

                <Text style={styles.passwordHint}>
                  Use at least 8 characters. A mix of letters, numbers and
                  symbols makes your password stronger.
                </Text>

                <View style={styles.roleSection}>
                  <Text style={styles.fieldLabel}>
                    What type of account do you need?
                  </Text>

                  <View style={styles.roleOptions}>
                    <TouchableOpacity
                      style={[
                        styles.roleCard,
                        role === "NGO" && styles.roleCardSelected,
                      ]}
                      onPress={() => {
                        setRole("NGO");
                        setFieldErrors((previous) => ({
                          ...previous,
                          role: "",
                        }));
                      }}
                      activeOpacity={0.85}
                    >
                      <View
                        style={[
                          styles.roleIcon,
                          role === "NGO" && styles.roleIconSelected,
                        ]}
                      >
                        <FontAwesome5
                          name="hand-holding-heart"
                          size={23}
                          color={Colors.light.secondary}
                          iconStyle="solid"
                        />
                      </View>

                      <Text style={styles.roleTitle}>NGO</Text>
                      <Text style={styles.roleDescription}>
                        Receive food donations
                      </Text>

                      <View
                        style={[
                          styles.radioOuter,
                          role === "NGO" && styles.radioOuterSelected,
                        ]}
                      >
                        {role === "NGO" && <View style={styles.radioInner} />}
                      </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.roleCard,
                        role === "Enterprise" && styles.roleCardSelected,
                      ]}
                      onPress={() => {
                        setRole("Enterprise");
                        setFieldErrors((previous) => ({
                          ...previous,
                          role: "",
                        }));
                      }}
                      activeOpacity={0.85}
                    >
                      <View
                        style={[
                          styles.roleIcon,
                          role === "Enterprise" && styles.roleIconSelected,
                        ]}
                      >
                        <FontAwesome5
                          name="store"
                          size={23}
                          color={Colors.light.secondary}
                          iconStyle="solid"
                        />
                      </View>

                      <Text style={styles.roleTitle}>Food Enterprise</Text>
                      <Text style={styles.roleDescription}>
                        Donate surplus food
                      </Text>

                      <View
                        style={[
                          styles.radioOuter,
                          role === "Enterprise" && styles.radioOuterSelected,
                        ]}
                      >
                        {role === "Enterprise" && (
                          <View style={styles.radioInner} />
                        )}
                      </View>
                    </TouchableOpacity>
                  </View>

                  {fieldErrors.role ? (
                    <Text style={styles.errorText}>{fieldErrors.role}</Text>
                  ) : null}
                </View>

                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={handleContinue}
                  activeOpacity={0.85}
                >
                  <Text style={styles.primaryButtonText}>
                    Continue <Text style={styles.buttonArrow}>→</Text>
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TouchableOpacity
                  onPress={handleBack}
                  style={styles.backButton}
                  activeOpacity={0.7}
                >
                  <Text style={styles.backButtonText}>← Back</Text>
                </TouchableOpacity>

                <View style={styles.detailsHeadingRow}>
                  <View style={styles.detailsHeadingText}>
                    <Text style={styles.sectionTitle}>
                      {role === "NGO"
                        ? "Organisation details"
                        : "Business details"}
                    </Text>

                    <Text style={styles.sectionSubtitle}>
                      {role === "NGO"
                        ? "These details help us verify your NGO."
                        : "These details help us identify your business."}
                    </Text>
                  </View>

                  <View style={styles.detailsStepBadge}>
                    <Text style={styles.detailsStepBadgeText}>STEP 2</Text>
                  </View>
                </View>

                {role === "NGO" ? (
                  <>
                    <Field
                      label="Organisation name"
                      value={ngoName}
                      onChangeText={(value) => {
                        setNgoName(value);
                        setFieldErrors((previous) => ({
                          ...previous,
                          ngoName: "",
                        }));
                      }}
                      placeholder="Registered NGO name"
                      error={fieldErrors.ngoName}
                    />

                    <Field
                      label="NPO registration number"
                      value={npoNumber}
                      onChangeText={(value) => {
                        setNpoNumber(value);
                        setFieldErrors((previous) => ({
                          ...previous,
                          npoNumber: "",
                        }));
                      }}
                      placeholder="e.g. 123-456 NPO"
                      autoCapitalize="characters"
                      error={fieldErrors.npoNumber}
                    />

                    <Field
                      label="Contact information"
                      value={ngoContact}
                      onChangeText={(value) => {
                        setNgoContact(value);
                        setFieldErrors((previous) => ({
                          ...previous,
                          ngoContact: "",
                        }));
                      }}
                      placeholder="Organisation email or phone number"
                      error={fieldErrors.ngoContact}
                    />

                    <View style={styles.infoBox}>
                      <Text style={styles.infoIcon}>ⓘ</Text>
                      <Text style={styles.infoText}>
                        Your account will remain pending until an administrator
                        reviews your organisation's details.
                      </Text>
                    </View>
                  </>
                ) : (
                  <>
                    <Field
                      label="Business name"
                      value={enterpriseName}
                      onChangeText={(value) => {
                        setEnterpriseName(value);
                        setFieldErrors((previous) => ({
                          ...previous,
                          enterpriseName: "",
                        }));
                      }}
                      placeholder="Registered business name"
                      error={fieldErrors.enterpriseName}
                    />

                    <Field
                      label="Business registration number"
                      value={registrationNumber}
                      onChangeText={(value) => {
                        setRegistrationNumber(value);
                        setFieldErrors((previous) => ({
                          ...previous,
                          registrationNumber: "",
                        }));
                      }}
                      placeholder="Enter your registration number"
                      autoCapitalize="characters"
                      error={fieldErrors.registrationNumber}
                    />

                    <Field
                      label="Contact information"
                      value={enterpriseContact}
                      onChangeText={(value) => {
                        setEnterpriseContact(value);
                        setFieldErrors((previous) => ({
                          ...previous,
                          enterpriseContact: "",
                        }));
                      }}
                      placeholder="Business email or phone number"
                      error={fieldErrors.enterpriseContact}
                    />

                    <View style={styles.infoBox}>
                      <Text style={styles.infoIcon}>ⓘ</Text>
                      <Text style={styles.infoText}>
                        You can provide collection details when creating
                        individual food donation listings.
                      </Text>
                    </View>
                  </>
                )}

                {formError ? (
                  <View style={styles.errorBanner}>
                    <Text style={styles.errorBannerText}>{formError}</Text>
                  </View>
                ) : null}

                <TouchableOpacity
                  style={[
                    styles.primaryButton,
                    isLoading && styles.primaryButtonDisabled,
                  ]}
                  onPress={handleRegister}
                  disabled={isLoading}
                  activeOpacity={0.85}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.primaryButtonText}>Create account</Text>
                  )}
                </TouchableOpacity>

                <Text style={styles.termsText}>
                  By creating an account, you agree to use Servd responsibly and
                  provide accurate registration information.
                </Text>
              </>
            )}
          </View>

          {/* Login link */}
          <View style={styles.loginRow}>
            <Text style={styles.loginText}>Already have an account? </Text>

            <TouchableOpacity
              onPress={() => router.replace("/Login" as any)}
              activeOpacity={0.7}
            >
              <Text style={styles.loginLink}>Log in</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.bottomNote}>
            GOOD FOOD. BETTER CONNECTIONS. LESS WASTE.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
