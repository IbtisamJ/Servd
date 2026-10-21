import * as ImagePicker from "expo-image-picker";

// Replace these two strings with your actual Cloudinary values from Step 1
const CLOUDINARY_CLOUD_NAME = "YOUR_CLOUD_NAME";
const CLOUDINARY_UPLOAD_PRESET = "servd_uploads";

/**
 * Prompts the user to pick an image from their photo library,
 * uploads it directly to Cloudinary via unsigned upload,
 * and returns the public HTTPS secure URL.
 */
export async function pickAndUploadImage(): Promise<string | null> {
  // 1. Request media library permissions
  const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permissionResult.granted) {
    throw new Error("Permission to access the camera roll was denied.");
  }

  // 2. Open phone gallery
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    allowsEditing: true,
    aspect: [4, 3],
    quality: 0.7, // compresses image slightly for faster mobile upload
  });

  if (result.canceled || !result.assets || result.assets.length === 0) {
    return null; // User cancelled
  }

  const asset = result.assets[0];

  // 3. Prepare multipart form data
  const data = new FormData();
  data.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

  // Derive MIME type and filename
  const uri = asset.uri;
  const filename = uri.split("/").pop() || "upload.jpg";
  const match = /\.(\w+)$/.exec(filename);
  const type = match ? `image/${match[1]}` : "image/jpeg";

  data.append("file", {
    uri,
    name: filename,
    type,
  } as any);

  // 4. Send directly to Cloudinary
  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
    {
      method: "POST",
      body: data,
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Upload failed: ${errorText}`);
  }

  const json = await response.json();
  return json.secure_url; // e.g. "https://res.cloudinary.com/.../image.jpg"
}