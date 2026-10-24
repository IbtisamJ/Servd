
import FontAwesome5 from "@react-native-vector-icons/fontawesome5";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
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
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { BrandHeader } from "@/components/enterprise";
import { auth, db } from "@/config/firebase";
import { DONATION_STATUS, COLLECTIONS } from "@/constants/roles";
import { Colors, Fonts, Radius, Spacing } from "@/constants/theme";
import { pickAndUploadImage } from "@/services/imageService";

const colors = Colors.light;

type DateFieldName = "collectionDeadline" | "expiryDate";

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

/** Converts a date to YYYY-MM-DD using local calendar values. */
function formatDateForStorage(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

/** Displays a stored date in a readable format. */
function formatDisplayDate(value: string): string {
  const date = parseStrictDate(value);

  if (!date) {
    return "";
  }

  return date.toLocaleDateString("en-ZA", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/**
 * Accepts only real dates in YYYY-MM-DD format.
 * Returns the selected date at 23:59 local time.
 */
function parseStrictDate(value: string): Date | null {
  const trimmed = value.trim();

  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return null;
  }

  const [year, month, day] = trimmed.split("-").map(Number);

  if (
    year < 1000 ||
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > 31
  ) {
    return null;
  }

  const date = new Date(year, month - 1, day, 23, 59, 0, 0);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}

/** Returns today's date at midnight for picker constraints. */
function getTodayAtMidnight(): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

/** Returns a date at midnight for calendar minimum-date constraints. */
function getDateAtMidnight(value: string): Date | undefined {
  const date = parseStrictDate(value);

  if (!date) {
    return undefined;
  }

  date.setHours(0, 0, 0, 0);
  return date;
}

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
        autoCapitalize={
          keyboardType === "default" ? "sentences" : "none"
        }
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
  const [activeDateField, setActiveDateField] =
    useState<DateFieldName | null>(null);

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

  const openDatePicker = (field: DateFieldName) => {
    if (saving || uploadingImage) {
      return;
    }

    setActiveDateField(field);
  };

  const handleDateChange = (
    event: DateTimePickerEvent,
    selectedDate?: Date,
  ) => {
    if (Platform.OS !== "ios") {
      setActiveDateField(null);
    }

    if (event.type !== "set" || !selectedDate || !activeDateField) {
      return;
    }

    updateField(
      activeDateField,
      formatDateForStorage(selectedDate),
    );
  };

  const collectionDate = parseStrictDate(form.collectionDeadline);
  const expiryDateValue = parseStrictDate(form.expiryDate);

  const pickerValue =
    (activeDateField === "collectionDeadline"
      ? collectionDate
      : expiryDateValue) ?? new Date();

  const minimumCollectionDate = getTodayAtMidnight();

  const minimumExpiryDate =
    getDateAtMidnight(form.collectionDeadline) ??
    getTodayAtMidnight();

  const handlePickImage = async () => {
    if (uploadingImage || saving) {
      return;
    }

    try {
      setUploadingImage(true);

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
      Alert.alert(
        "Sign in required",
        "Please sign in to create a donation.",
      );
      router.replace("/Login" as never);
      return;
    }

    const foodName = form.foodName.trim();
    const category = form.category.trim();
    const description = form.description.trim();
    const collectionLocation = form.collectionLocation.trim();
    const quantityInput = form.quantity.trim();
    const quantity = Number(quantityInput);

    if (
      !foodName ||
      !category ||
      !description ||
      !quantityInput ||
      !collectionLocation ||
      !form.collectionDeadline ||
      !form.expiryDate
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

    const collectionDeadline = parseStrictDate(
      form.collectionDeadline,
    );
    const expiryDate = parseStrictDate(form.expiryDate);

    if (!collectionDeadline) {
      Alert.alert(
        "Invalid collection deadline",
        "Please select a valid collection deadline from the calendar.",
      );
      return;
    }

    if (!expiryDate) {
      Alert.alert(
        "Invalid expiry date",
        "Please select a valid food expiry date from the calendar.",
      );
      return;
    }

    const today = getTodayAtMidnight();

    if (
      collectionDeadline.getTime() <
      new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
        23,
        59,
        0,
        0,
      ).getTime()
    ) {
      Alert.alert(
        "Invalid collection deadline",
        "The collection deadline cannot be in the past.",
      );
      return;
    }

    if (expiryDate.getTime() < collectionDeadline.getTime()) {
      Alert.alert(
        "Check your dates",
        "The expiry date must be on or after the collection deadline.",
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

      setForm(initialForm);
      setImageUrl(null);
      setActiveDateField(null);

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

  if (authLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingScreen}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>
            Checking your account...
          </Text>
        </View>
      </View>
    );
  }

  if (!userId) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingScreen}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>
            Redirecting to sign in...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <BrandHeader
        role="ENTERPRISE"
        actionLabel="Donations"
        onActionPress={() =>
          router.replace("/enterprises/donations" as never)
        }
      />

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
            <View style={styles.pageHeader}>
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
              Share surplus food with organisations that can put it to good use.
            </Text>

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
                    accessibilityLabel="Change donation image"
                    onPress={handlePickImage}
                    disabled={uploadingImage || saving}
                    style={({ pressed }) => [
                      styles.changeImageButton,
                      pressed && styles.pressed,
                      (uploadingImage || saving) &&
                        styles.disabledButton,
                    ]}
                  >
                    <FontAwesome5
                      name="camera"
                      size={13}
                      color={colors.primary}
                      iconStyle="solid"
                    />
                    <Text style={styles.changeImageText}>
                      Change image
                    </Text>
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
                    (uploadingImage || saving) &&
                      styles.disabledButton,
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
                    {uploadingImage
                      ? "Uploading image..."
                      : "Add food photo"}
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
                onChangeText={(value) =>
                  updateField("foodName", value)
                }
              />

              <FormField
                label="Category *"
                placeholder="e.g. Produce, bakery, prepared meals"
                value={form.category}
                onChangeText={(value) =>
                  updateField("category", value)
                }
              />

              <FormField
                label="Quantity *"
                placeholder="Enter the number of items or portions"
                value={form.quantity}
                onChangeText={(value) =>
                  updateField(
                    "quantity",
                    value.replace(/[^0-9.]/g, ""),
                  )
                }
                keyboardType="numeric"
                hint="Use a number. Include the unit in the description if needed."
              />

              <FormField
                label="Description *"
                placeholder="Describe the food, packaging, quantity per item, and any important details..."
                value={form.description}
                onChangeText={(value) =>
                  updateField("description", value)
                }
                multiline
              />
            </View>

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
                  <Text style={styles.sectionTitle}>
                    Collection details
                  </Text>
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

              <View style={styles.field}>
                <Text style={styles.fieldLabel}>
                  Collection deadline *
                </Text>

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Choose collection deadline"
                  onPress={() =>
                    openDatePicker("collectionDeadline")
                  }
                  disabled={saving || uploadingImage}
                  style={({ pressed }) => [
                    styles.dateInput,
                    pressed && styles.pressed,
                    activeDateField === "collectionDeadline" &&
                      styles.dateInputActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.dateInputText,
                      !form.collectionDeadline &&
                        styles.datePlaceholder,
                    ]}
                  >
                    {form.collectionDeadline
                      ? formatDisplayDate(form.collectionDeadline)
                      : "Select collection deadline"}
                  </Text>

                  <FontAwesome5
                    name="calendar-alt"
                    size={17}
                    color={colors.primary}
                    iconStyle="solid"
                  />
                </Pressable>

                <Text style={styles.fieldHint}>
                  Select the last date for collection.
                </Text>

                {activeDateField === "collectionDeadline" ? (
                  <View style={styles.datePickerContainer}>
                    <DateTimePicker
                      value={pickerValue}
                      mode="date"
                      display={
                        Platform.OS === "ios" ? "spinner" : "default"
                      }
                      minimumDate={minimumCollectionDate}
                      onChange={handleDateChange}
                      accentColor={colors.primary}
                    />

                    {Platform.OS === "ios" ? (
                      <Pressable
                        accessibilityRole="button"
                        onPress={() => setActiveDateField(null)}
                        style={styles.dateDoneButton}
                      >
                        <Text style={styles.dateDoneButtonText}>
                          Done
                        </Text>
                      </Pressable>
                    ) : null}
                  </View>
                ) : null}
              </View>

              <View style={styles.field}>
                <Text style={styles.fieldLabel}>
                  Food expiry date *
                </Text>

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Choose food expiry date"
                  onPress={() => openDatePicker("expiryDate")}
                  disabled={saving || uploadingImage}
                  style={({ pressed }) => [
                    styles.dateInput,
                    pressed && styles.pressed,
                    activeDateField === "expiryDate" &&
                      styles.dateInputActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.dateInputText,
                      !form.expiryDate && styles.datePlaceholder,
                    ]}
                  >
                    {form.expiryDate
                      ? formatDisplayDate(form.expiryDate)
                      : "Select food expiry date"}
                  </Text>

                  <FontAwesome5
                    name="calendar-alt"
                    size={17}
                    color={colors.primary}
                    iconStyle="solid"
                  />
                </Pressable>

                <Text style={styles.fieldHint}>
                  Choose the date the food expires. It must be on or after
                  the collection deadline.
                </Text>

                {activeDateField === "expiryDate" ? (
                  <View style={styles.datePickerContainer}>
                    <DateTimePicker
                      value={pickerValue}
                      mode="date"
                      display={
                        Platform.OS === "ios" ? "spinner" : "default"
                      }
                      minimumDate={minimumExpiryDate}
                      onChange={handleDateChange}
                      accentColor={colors.primary}
                    />

                    {Platform.OS === "ios" ? (
                      <Pressable
                        accessibilityRole="button"
                        onPress={() => setActiveDateField(null)}
                        style={styles.dateDoneButton}
                      >
                        <Text style={styles.dateDoneButtonText}>
                          Done
                        </Text>
                      </Pressable>
                    ) : null}
                  </View>
                ) : null}
              </View>
            </View>

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
                (saving || uploadingImage) &&
                  styles.submitButtonDisabled,
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
              disabled={saving || uploadingImage}
              onPress={() =>
                router.replace("/enterprises/donations" as never)
              }
              style={({ pressed }) => [
                styles.cancelButton,
                pressed && styles.pressed,
                (saving || uploadingImage) &&
                  styles.disabledButton,
              ]}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
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
  pageHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.three,
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
  dateInput: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: 11,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: colors.backgroundElement,
    backgroundColor: "#FFFEFC",
  },
  dateInputActive: {
    borderColor: colors.primary,
  },
  dateInputText: {
    flex: 1,
    fontFamily: Fonts.body,
    fontSize: 13,
    color: colors.text,
  },
  datePlaceholder: {
    color: "#9699A1",
  },
  datePickerContainer: {
    padding: Spacing.two,
    borderRadius: Radius.md,
    backgroundColor: "#F7FAF8",
    borderWidth: 1,
    borderColor: colors.backgroundElement,
  },
  dateDoneButton: {
    alignSelf: "flex-end",
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderRadius: Radius.md,
    backgroundColor: colors.primary,
  },
  dateDoneButtonText: {
    fontFamily: Fonts.button,
    fontSize: 12,
    fontWeight: "700",
    color: "#FFFFFF",
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
  disabledButton: {
    opacity: 0.65,
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