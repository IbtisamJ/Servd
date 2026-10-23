
import { auth, db } from "@/config/firebase";
import {
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";
import { COLLECTIONS } from "@/constants/roles";

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