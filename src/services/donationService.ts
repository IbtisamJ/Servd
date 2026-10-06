import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDocs,
    updateDoc,
} from "firebase/firestore";

import { db } from "../config/firebase";
import { Donation } from "../types/Donations";

/**
 * Create Donation
 */
export const createDonation = async (
  donation: Donation
) => {
  return await addDoc(
    collection(db, "donations"),
    donation
  );
};

/**
 * Get All Donations
 */
export const getDonations = async () => {
  const snapshot = await getDocs(
    collection(db, "donations")
  );

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};

/**
 * Update Donation
 */
export const updateDonation = async (
  donationId: string,
  data: Partial<Donation>
) => {
  const donationRef = doc(
    db,
    "donations",
    donationId
  );

  return await updateDoc(
    donationRef,
    data
  );
};

/**
 * Cancel Donation
 */
export const cancelDonation = async (
  donationId: string
) => {
  const donationRef = doc(
    db,
    "donations",
    donationId
  );

  return await updateDoc(donationRef, {
    status: "Cancelled",
  });
};

/**
 * Delete Donation
 */
export const deleteDonation = async (
  donationId: string
) => {
  const donationRef = doc(
    db,
    "donations",
    donationId
  );

  return await deleteDoc(donationRef);
};