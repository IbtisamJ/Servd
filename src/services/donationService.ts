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
import { COLLECTIONS, DONATION_STATUS } from "@/constants/roles";
import {
  addDoc,
  collection, getDocs,
  serverTimestamp,
} from "firebase/firestore";

export interface CreateDonationInput {
  foodName: string;
  category: string;
  description: string;
  quantity: number;
  collectionLocation: string;
  collectionDeadline: Date;
  expiryDate: Date;
  imageUrl?: string | null;
}

export async function createDonation(
  data: CreateDonationInput
): Promise<string> {
  const currentUser = auth.currentUser;

  if (!currentUser) {
    throw new Error("You must be logged in to create a donation.");
  }

  const docRef = await addDoc(
    collection(db, COLLECTIONS.DONATIONS),
    {
      enterpriseId: currentUser.uid,
      foodName: data.foodName.trim(),
      category: data.category,
      description: data.description.trim(),
      quantity: data.quantity,
      collectionLocation: data.collectionLocation.trim(),
      collectionDeadline: data.collectionDeadline,
      expiryDate: data.expiryDate,
      imageUrl: data.imageUrl ?? null,
      status: "available",
      createdTimestamp: serverTimestamp(),
    }
  );

  return docRef.id;
}

/**
 *  Retrieves all donation from Firestore and 
 * includes each document's ID so NGO screen can identify it
 */
export async function getDonations() {
  const donationsRef = collection(db, COLLECTIONS.DONATIONS);
  const snapshot = await getDocs(donationsRef);

  return snapshot.docs.map((document) => ({
    id: document.id,
    ...document.data(),
  }));
}