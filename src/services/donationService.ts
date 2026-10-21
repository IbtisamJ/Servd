import { auth, db } from "@/config/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

export interface CreateDonationInput {
  title: string;
  description?: string;
  quantity: string | number;
  expiryDate?: string;
  pickupAddress?: string;
  imageUrl?: string | null;
}

/**
 * Creates a new donation document in Firestore with the uploaded image URL
 * and attributes it to the currently logged-in enterprise.
 */
export async function createDonation(data: CreateDonationInput): Promise<string> {
  const currentUser = auth.currentUser;

  if (!currentUser) {
    throw new Error("You must be logged in to create a donation.");
  }

  // Reference the top-level 'donations' collection
  const donationsRef = collection(db, "donations");

  const docRef = await addDoc(donationsRef, {
    enterpriseId: currentUser.uid,
    title: data.title.trim(),
    description: data.description?.trim() || "",
    quantity: data.quantity,
    expiryDate: data.expiryDate || null,
    pickupAddress: data.pickupAddress || "",
    imageUrl: data.imageUrl || null,
    status: "available",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return docRef.id;
}