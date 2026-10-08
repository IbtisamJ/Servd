import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  updateDoc,
} from "firebase/firestore";

import { db } from "../config/firebase";
import { DONATION_STATUS } from "../constants/donationStatus";
import { Donation } from "../types/Donation";

/**
 * Creates a new donation in Firestore.
 * Used by Food Enterprises when submitting surplus food.
 */
export const createDonation = async (
  donation: Donation
) => {
  return await addDoc(
    collection(db, "Donations"),
    donation
  );
};

/**
 * Retrieves all donations from Firestore.
 * Used by NGO users to browse available donations.
 */
export const getDonations = async () => {
  const snapshot = await getDocs(
    collection(db, "Donations")
  );

  return snapshot.docs.map((document) => ({
    id: document.id,
    ...document.data(),
  }));
};

/**
 * Updates an existing donation.
 * Used when enterprises edit donation details.
 */
export const updateDonation = async (
  donationId: string,
  data: Partial<Donation>
) => {
  const donationRef = doc(
    db,
    "Donations",
    donationId
  );

  return await updateDoc(
    donationRef,
    data
  );
};

/**
 * Marks a donation as Reserved.
 * Triggered when an NGO reserves a donation.
 */
export const reserveDonation = async (
  donationId: string
) => {
  const donationRef = doc(
    db,
    "Donations",
    donationId
  );

  return await updateDoc(
    donationRef,
    {
      status:
        DONATION_STATUS.RESERVED,
    }
  );
};

/**
 * Marks a donation as Cancelled.
 * Used when a donation is withdrawn.
 */
export const cancelDonation = async (
  donationId: string
) => {
  const donationRef = doc(
    db,
    "Donations",
    donationId
  );

  return await updateDoc(
    donationRef,
    {
      status:
        DONATION_STATUS.CANCELLED,
    }
  );
};

/**
 * Permanently removes a donation.
 * Mainly for administration and testing.
 */
export const deleteDonation = async (
  donationId: string
) => {
  const donationRef = doc(
    db,
    "Donations",
    donationId
  );

  return await deleteDoc(
    donationRef
  );
};