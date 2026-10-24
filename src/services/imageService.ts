
import * as ImagePicker from "expo-image-picker";
import { File } from "expo-file-system";

const CLOUDINARY_CLOUD_NAME = "hfimsm9w";
const CLOUDINARY_UPLOAD_PRESET = "servd_uploads";

/**
 * Opens the user's photo library, lets them select and crop an image,
 * uploads it to Cloudinary, and returns the secure HTTPS URL.
 *
 * Returns null if the user cancels image selection.
 * Throws an error if permission is denied or the upload fails.
 */
export async function pickAndUploadImage(): Promise<string | null> {
  // 1. Request photo library permission
  const permissionResult =
    await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (!permissionResult.granted) {
    throw new Error(
      "Permission to access your photo library was denied. Please enable it in your device settings.",
    );
  }

  // 2. Open the photo library
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    allowsEditing: true,
    aspect: [4, 3],
    quality: 0.7,
  });

  // The user cancelled image selection
  if (result.canceled || !result.assets?.length) {
    return null;
  }

  const asset = result.assets[0];

  // 3. Determine the filename and MIME type
  const uri = asset.uri;
  const filename = uri.split("/").pop()?.split("?")[0] || "upload.jpg";
  const extension = filename.split(".").pop()?.toLowerCase();

  const mimeType =
    extension === "png"
      ? "image/png"
      : extension === "webp"
        ? "image/webp"
        : extension === "heic"
          ? "image/heic"
          : "image/jpeg";

  // 4. Prepare the multipart upload
  const formData = new FormData();

  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

  // Use Expo FileSystem's File object instead of a plain object
  // cast to Blob, which can cause unsupported FormDataPart errors.
  const imageFile = new File(uri);

  formData.append("file", imageFile, filename);

  // 5. Upload directly to Cloudinary
  const uploadUrl =
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

  const response = await fetch(uploadUrl, {
    method: "POST",
    body: formData,
  });

  // 6. Handle Cloudinary errors
  if (!response.ok) {
    let errorMessage = "The image could not be uploaded.";

    try {
      const errorData = await response.json();
      errorMessage =
        errorData?.error?.message || errorMessage;
    } catch {
      // Keep the fallback error message if the response isn't JSON.
    }

    throw new Error(errorMessage);
  }

  // 7. Return the public HTTPS URL
  const data: { secure_url?: string } = await response.json();

  if (!data.secure_url) {
    throw new Error(
      "The image uploaded, but Cloudinary did not return an image URL.",
    );
  }

  return data.secure_url;
}