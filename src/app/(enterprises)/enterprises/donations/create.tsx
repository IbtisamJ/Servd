
import FontAwesome5 from "@react-native-vector-icons/fontawesome5";
import { router } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  doc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { auth, db } from "@/config/firebase";
import { DONATION_STATUS, COLLECTIONS } from "@/constants/roles";
import { Colors, Fonts, Radius, Spacing } from "@/constants/theme";
import { pickAndUploadImage } from "@/services/imageService";

const colors = Colors.light;

type DonationForm = {
  foodName: string;
  category: string;
  description: string;
  quantity: string;
  collectionLocation: string;
  collectionDeadline: string;
  expiryDate: string;
};

const initialForm: DonationForm = {
  foodName: "",
  category: "",
  description: "",
  quantity: "",
  collectionLocation: "",
  collectionDeadline: "",
  expiryDate: "",
};

type FieldProps = {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (value: string) => void;
  multiline?: boolean;
  keyboardType?: "default" | "numeric";
  hint?: string;
};

function FormField({
  label,
  placeholder,
  value,
  onChangeText,
  multiline = false,
  keyboardType = "default",
  hint,
}: FieldProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9699A1"
        style={[styles.input, multiline && styles.multilineInput]}
        multiline={multiline}
        textAlignVertical={multiline ? "top" : "center"}
        keyboardType={keyboardType}
        autoCapitalize={keyboardType === "default" ? "sentences" : "none"}
      />
      {hint ? <Text style={styles.fieldHint}>{hint}</Text> : null}
    </View>
  );
}

export default function CreateDonationScreen() {
  const [form, setForm] = useState<DonationForm>(initialForm);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [saving, setSaving] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(
    auth.currentUser?.uid ?? null,
  );

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUserId(user?.uid ?? null);
      setAuthLoading(false);

      if (!user) {
        router.replace("/Login" as never);
      }
    });

    return unsubscribe;
  }, []);

  const updateField = (field: keyof DonationForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handlePickImage = async () => {
    if (uploadingImage || saving) return;

    try {
      setUploadingImage(true);

      // Uses the existing image picker and Cloudinary upload service.
      const uploadedUrl = await pickAndUploadImage();

      if (uploadedUrl) {
        setImageUrl(uploadedUrl);
      }
    } catch (error) {
      console.error("Image upload failed:", error);
      Alert.alert(
        "Image upload failed",
        "We couldn't upload your image. Please try again.",
      );
    } finally {
      setUploadingImage(false);
    }
  };

  const handleCreateDonation = async () => {
    const currentUser = auth.currentUser;
    const enterpriseId = currentUser?.uid ?? userId;

    if (!enterpriseId) {
      Alert.alert("Sign in required", "Please sign in to create a donation.");
      router.replace("/Login" as never);
      return;
    }

    const foodName = form.foodName.trim();
    const category = form.category.trim();
    const description = form.description.trim();
    const collectionLocation = form.collectionLocation.trim();
    const quantity = Number(form.quantity);

    if (
      !foodName ||
      !category ||
      !description ||
      !form.quantity.trim() ||
      !collectionLocation ||
      !form.collectionDeadline.trim() ||
      !form.expiryDate.trim()
    ) {
      Alert.alert(
        "Missing information",
        "Please complete all required fields before submitting.",
      );
      return;
    }

    if (!Number.isFinite(quantity) || quantity <= 0) {
      Alert.alert(
        "Invalid quantity",
        "Enter a quantity greater than zero.",
      );
      return;
    }

    // Dates are entered as YYYY-MM-DD.
    const collectionDeadline = new Date(
      `${form.collectionDeadline.trim()}T23:59:00`,
    );
    const expiryDate = new Date(`${form.expiryDate.trim()}T23:59:00`);

    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(form.collectionDeadline.trim()) ||
      Number.isNaN(collectionDeadline.getTime())
    ) {
      Alert.alert(
        "Invalid collection deadline",
        "Enter the collection deadline in YYYY-MM-DD format.",
      );
      return;
    }

    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(form.expiryDate.trim()) ||
      Number.isNaN(expiryDate.getTime())
    ) {
      Alert.alert(
        "Invalid expiry date",
        "Enter the expiry date in YYYY-MM-DD format.",
      );
      return;
    }

    if (expiryDate < collectionDeadline) {
      Alert.alert(
        "Check your dates",
        "The expiry date should be on or after the collection deadline.",
      );
      return;
    }

    try {
      setSaving(true);

      const donationRef = doc(collection(db, COLLECTIONS.DONATIONS));

      await setDoc(donationRef, {
        donationId: donationRef.id,
        enterpriseId,
        foodName,
        category,
        description,
        quantity,
        imageUrl: imageUrl ?? null,
        collectionLocation,
        collectionDeadline,
        expiryDate,
        status: DONATION_STATUS.AVAILABLE,
        createdTimestamp: serverTimestamp(),
      });

      Alert.alert(
        "Donation created",
        "Your food donation has been listed successfully.",
        [
          {
            text: "View donations",
            onPress: () =>
              router.replace("/enterprises/donations" as never),
          },
        ],
      );

      setForm(initialForm);
      setImageUrl(null);
    } catch (error) {
      console.error("Error creating donation:", error);
      Alert.alert(
        "Couldn't create donation",
        "Please check your connection and try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  const goTo = (path: string) => router.push(path as never);

  if (authLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingScreen}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Checking your account...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!userId) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingScreen}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Redirecting to sign in...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.screen}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.workspace}>
            <View style={styles.header}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Back to donations"
                onPress={() =>
                  router.replace("/enterprises/donations" as never)
                }
                style={styles.backButton}
              >
                <FontAwesome5
                  name="arrow-left"
                  size={16}
                  color={colors.text}
                  iconStyle="solid"
                />
              </Pressable>

              <View style={styles.headerCopy}>
                <Text style={styles.eyebrow}>YOUR ENTERPRISE</Text>
                <Text style={styles.heading}>Create donation</Text>
              </View>

              <View style={styles.headerIcon}>
                <FontAwesome5
                  name="plus"
                  size={17}
                  color="#FFFFFF"
                  iconStyle="solid"
                />
              </View>
            </View>

            <Text style={styles.subtitle}>
              Share surplus food with organisations that can put it to good
              use.
            </Text>

            {/* Image upload */}
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Food image</Text>
              <Text style={styles.sectionDescription}>
                Add a clear photo to help organisations identify your donation.
              </Text>

              {imageUrl ? (
                <View style={styles.imagePreviewContainer}>
                  <Image
                    source={{ uri: imageUrl }}
                    style={styles.imagePreview}
                    resizeMode="cover"
                  />
                  <Pressable
                    accessibilityRole="button"
                    onPress={handlePickImage}
                    disabled={uploadingImage || saving}
                    style={styles.changeImageButton}
                  >
                    <FontAwesome5
                      name="camera"
                      size={13}
                      color={colors.primary}
                      iconStyle="solid"
                    />
                    <Text style={styles.changeImageText}>Change image</Text>
                  </Pressable>
                </View>
              ) : (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Choose and upload food image"
                  onPress={handlePickImage}
                  disabled={uploadingImage || saving}
                  style={({ pressed }) => [
                    styles.uploadArea,
                    pressed && styles.pressed,
                  ]}
                >
                  {uploadingImage ? (
                    <ActivityIndicator
                      size="large"
                      color={colors.primary}
                    />
                  ) : (
                    <View style={styles.uploadIcon}>
                      <FontAwesome5
                        name="camera"
                        size={23}
                        color={colors.secondary}
                        iconStyle="solid"
                      />
                    </View>
                  )}

                  <Text style={styles.uploadTitle}>
                    {uploadingImage ? "Uploading image..." : "Add food photo"}
                  </Text>
                  <Text style={styles.uploadHint}>
                    Tap to select a photo from your device
                  </Text>
                </Pressable>
              )}

              {uploadingImage ? (
                <Text style={styles.fieldHint}>
                  Please wait while your image uploads.
                </Text>
              ) : null}
            </View>

            {/* Food details */}
            <View style={styles.card}>
              <View style={styles.sectionHeadingRow}>
                <View style={styles.sectionIcon}>
                  <FontAwesome5
                    name="utensils"
                    size={16}
                    color={colors.secondary}
                    iconStyle="solid"
                  />
                </View>
                <View style={styles.sectionHeadingCopy}>
                  <Text style={styles.sectionTitle}>Food details</Text>
                  <Text style={styles.sectionDescription}>
                    Tell organisations what you're donating.
                  </Text>
                </View>
              </View>

              <FormField
                label="Food name *"
                placeholder="e.g. Fresh vegetable boxes"
                value={form.foodName}
                onChangeText={(value) => updateField("foodName", value)}
              />

              <FormField
                label="Category *"
                placeholder="e.g. Produce, bakery, prepared meals"
                value={form.category}
                onChangeText={(value) => updateField("category", value)}
              />

              <FormField
                label="Quantity *"
                placeholder="Enter the number of items or portions"
                value={form.quantity}
                onChangeText={(value) =>
                  updateField("quantity", value.replace(/[^0-9.]/g, ""))
                }
                keyboardType="numeric"
                hint="Use a number. Include the unit in the description if needed."
              />

              <FormField
                label="Description *"
                placeholder="Describe the food, packaging, quantity per item, and any important details..."
                value={form.description}
                onChangeText={(value) => updateField("description", value)}
                multiline
              />
            </View>

            {/* Collection details */}
            <View style={styles.card}>
              <View style={styles.sectionHeadingRow}>
                <View style={styles.sectionIcon}>
                  <FontAwesome5
                    name="map-marker-alt"
                    size={16}
                    color={colors.secondary}
                    iconStyle="solid"
                  />
                </View>
                <View style={styles.sectionHeadingCopy}>
                  <Text style={styles.sectionTitle}>Collection details</Text>
                  <Text style={styles.sectionDescription}>
                    Let organisations know where and when to collect.
                  </Text>
                </View>
              </View>

              <FormField
                label="Collection location *"
                placeholder="Enter pickup address or collection point"
                value={form.collectionLocation}
                onChangeText={(value) =>
                  updateField("collectionLocation", value)
                }
                multiline
              />

              <FormField
                label="Collection deadline *"
                placeholder="YYYY-MM-DD"
                value={form.collectionDeadline}
                onChangeText={(value) =>
                  updateField("collectionDeadline", value)
                }
                hint="Last date for collection, e.g. 2026-10-25."
              />

              <FormField
                label="Food expiry date *"
                placeholder="YYYY-MM-DD"
                value={form.expiryDate}
                onChangeText={(value) => updateField("expiryDate", value)}
                hint="Enter the food's expiry date in YYYY-MM-DD format."
              />
            </View>

            {/* Listing note */}
            <View style={styles.notice}>
              <FontAwesome5
                name="info-circle"
                size={17}
                color={colors.secondary}
                iconStyle="solid"
              />
              <Text style={styles.noticeText}>
                Your donation will be listed as available after you submit it.
                Make sure the food and collection information is accurate.
              </Text>
            </View>

            <Pressable
              accessibilityRole="button"
              disabled={saving || uploadingImage}
              onPress={handleCreateDonation}
              style={({ pressed }) => [
                styles.submitButton,
                (saving || uploadingImage) && styles.submitButtonDisabled,
                pressed && !saving && styles.pressed,
              ]}
            >
              {saving ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <FontAwesome5
                  name="check"
                  size={16}
                  color="#FFFFFF"
                  iconStyle="solid"
                />
              )}
              <Text style={styles.submitButtonText}>
                {saving ? "Creating donation..." : "Create donation"}
              </Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              disabled={saving}
              onPress={() =>
                router.replace("/enterprises/donations" as never)
              }
              style={styles.cancelButton}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </Pressable>
          </View>
        </ScrollView>

        {/* Bottom navigation: consistent with the enterprise screens */}
        <View style={styles.bottomNav}>
          <Pressable
            style={styles.navItem}
            accessibilityRole="button"
            accessibilityLabel="Dashboard"
            onPress={() => router.replace("/enterprises" as never)}
          >
            <FontAwesome5
              name="home"
              size={19}
              color={colors.textSecondary}
              iconStyle="solid"
            />
            <Text style={styles.navLabel}>Home</Text>
          </Pressable>

          <Pressable
            style={styles.navItem}
            accessibilityRole="button"
            accessibilityLabel="Donations"
            onPress={() =>
              router.replace("/enterprises/donations" as never)
            }
          >
            <FontAwesome5
              name="box-open"
              size={19}
              color={colors.textSecondary}
              iconStyle="solid"
            />
            <Text style={styles.navLabel}>Donations</Text>
          </Pressable>

          <Pressable
            style={styles.navItem}
            accessibilityRole="button"
            accessibilityLabel="Notifications"
            onPress={() => goTo("/notifications")}
          >
            <FontAwesome5
              name="bell"
              size={19}
              color={colors.textSecondary}
              iconStyle="solid"
            />
            <Text style={styles.navLabel}>Alerts</Text>
          </Pressable>

          <Pressable
            style={styles.navItem}
            accessibilityRole="button"
            accessibilityLabel="Create donation"
            onPress={() =>
              router.replace("/enterprises/donations/create" as never)
            }
          >
            <View style={styles.addNavButton}>
              <FontAwesome5
                name="plus"
                size={18}
                color="#FFFFFF"
                iconStyle="solid"
              />
            </View>
            <Text style={[styles.navLabel, styles.navLabelActive]}>
              Add food
            </Text>
          </Pressable>

          <Pressable
            style={styles.navItem}
            accessibilityRole="button"
            accessibilityLabel="Reservations"
            onPress={() => goTo("/enterprises/reservations")}
          >
            <FontAwesome5
              name="clipboard-list"
              size={19}
              color={colors.textSecondary}
              iconStyle="solid"
            />
            <Text style={styles.navLabel}>Collections</Text>
          </Pressable>

          <Pressable
            style={styles.navItem}
            accessibilityRole="button"
            accessibilityLabel="Profile"
            onPress={() => goTo("/enterprises/profile")}
          >
            <FontAwesome5
              name="user-circle"
              size={19}
              color={colors.textSecondary}
              iconStyle="solid"
            />
            <Text style={styles.navLabel}>Profile</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.four,
  },
  workspace: {
    width: "100%",
    maxWidth: 800,
    alignSelf: "center",
    gap: Spacing.three,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
  },
  backButton: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Radius.md,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: colors.backgroundElement,
  },
  headerCopy: {
    flex: 1,
    gap: 3,
  },
  eyebrow: {
    fontFamily: Fonts.body,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.2,
    color: colors.secondary,
  },
  heading: {
    fontFamily: Fonts.heading,
    fontSize: 25,
    color: colors.text,
  },
  headerIcon: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Radius.md,
    backgroundColor: colors.primary,
  },
  subtitle: {
    fontFamily: Fonts.body,
    fontSize: 13,
    lineHeight: 20,
    color: colors.textSecondary,
  },
  card: {
    padding: Spacing.three,
    gap: Spacing.three,
    borderRadius: Radius.lg,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: colors.backgroundElement,
  },
  sectionHeadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
  sectionIcon: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Radius.md,
    backgroundColor: "#E8F4F1",
  },
  sectionHeadingCopy: {
    flex: 1,
    gap: 3,
  },
  sectionTitle: {
    fontFamily: Fonts.heading,
    fontSize: 19,
    color: colors.text,
  },
  sectionDescription: {
    fontFamily: Fonts.body,
    fontSize: 11,
    lineHeight: 17,
    color: colors.textSecondary,
  },
  field: {
    gap: Spacing.two,
  },
  fieldLabel: {
    fontFamily: Fonts.button,
    fontSize: 12,
    fontWeight: "700",
    color: colors.text,
  },
  input: {
    minHeight: 46,
    paddingHorizontal: Spacing.three,
    paddingVertical: 11,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: colors.backgroundElement,
    backgroundColor: "#FFFEFC",
    color: colors.text,
    fontFamily: Fonts.body,
    fontSize: 13,
  },
  multilineInput: {
    minHeight: 100,
    paddingTop: Spacing.three,
  },
  fieldHint: {
    fontFamily: Fonts.body,
    fontSize: 10,
    lineHeight: 15,
    color: colors.textSecondary,
  },
  uploadArea: {
    minHeight: 170,
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.four,
    gap: Spacing.two,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: colors.secondary,
    borderRadius: Radius.md,
    backgroundColor: "#F7FAF8",
  },
  uploadIcon: {
    width: 52,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 26,
    backgroundColor: "#E8F4F1",
  },
  uploadTitle: {
    fontFamily: Fonts.button,
    fontSize: 13,
    fontWeight: "700",
    color: colors.text,
  },
  uploadHint: {
    fontFamily: Fonts.body,
    fontSize: 11,
    color: colors.textSecondary,
    textAlign: "center",
  },
  imagePreviewContainer: {
    gap: Spacing.two,
  },
  imagePreview: {
    width: "100%",
    height: 210,
    borderRadius: Radius.md,
    backgroundColor: colors.backgroundElement,
  },
  changeImageButton: {
    minHeight: 40,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.two,
    borderWidth: 1,
    borderColor: colors.backgroundElement,
    borderRadius: Radius.md,
    backgroundColor: "#FFFFFF",
  },
  changeImageText: {
    fontFamily: Fonts.button,
    fontSize: 12,
    fontWeight: "700",
    color: colors.primary,
  },
  notice: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.two,
    padding: Spacing.three,
    borderRadius: Radius.md,
    backgroundColor: "#E8F4F1",
  },
  noticeText: {
    flex: 1,
    fontFamily: Fonts.body,
    fontSize: 11,
    lineHeight: 18,
    color: colors.text,
  },
  submitButton: {
    minHeight: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.two,
    paddingHorizontal: Spacing.four,
    borderRadius: Radius.md,
    backgroundColor: colors.primary,
  },
  submitButtonDisabled: {
    opacity: 0.65,
  },
  submitButtonText: {
    fontFamily: Fonts.button,
    fontSize: 13,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  cancelButton: {
    minHeight: 42,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButtonText: {
    fontFamily: Fonts.button,
    fontSize: 12,
    fontWeight: "700",
    color: colors.textSecondary,
  },
  bottomNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingTop: 9,
    paddingBottom: 8,
    paddingHorizontal: 2,
    borderTopWidth: 1,
    borderTopColor: colors.backgroundElement,
    backgroundColor: colors.background,
  },
  navItem: {
    flex: 1,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },
  navLabel: {
    fontFamily: Fonts.body,
    fontSize: 8,
    color: colors.textSecondary,
  },
  navLabelActive: {
    fontWeight: "700",
    color: colors.primary,
  },
  addNavButton: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 17,
    backgroundColor: colors.primary,
  },
  loadingScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.three,
    backgroundColor: colors.background,
  },
  loadingText: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: colors.textSecondary,
  },
  pressed: {
    opacity: 0.72,
  },
});