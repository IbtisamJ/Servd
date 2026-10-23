/**
 * Donation Service
 *
 * Handles Firestore operations related to food donations.
 * Centralises donation creation, retrieval, updates, status changes,
 * and deletion so that screens can reuse the same data operations.
 *
 * Responsibilities:
 * - Creates donation documents with creation and update timestamps.
 * - Retrieves all donation documents and includes each document ID.
 * - Updates donation fields and refreshes updatedTimestamp.
 * - Marks donations as reserved, collected, cancelled, or expired.
 * - Deletes donation documents when requested.
 */

import { auth, db } from "@/config/firebase";
import { addDoc, collection, getDocs, serverTimestamp } from "firebase/firestore";

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

/**
 *  Retrieves all donation from Firestore and 
 * includes each document's ID so NGO screen can identify it
 */
export async function getDonations() {
  const donationsRef = collection(db, "donations");
  const snapshot = await getDocs(donationsRef);

  return snapshot.docs.map((document) => ({
    id: document.id,
    ...document.data(),
  }));
}