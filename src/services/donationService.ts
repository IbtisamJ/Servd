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

  return snapshot.docs.map((document) => ({
    id: document.id,
    ...document.data(),
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
 * Reserve Donation
 */
export const reserveDonation = async (
  donationId: string
) => {
  const donationRef = doc(
    db,
    "donations",
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
 * Mark Donation Collected
 */
export const collectDonation = async (
  donationId: string
) => {
  const donationRef = doc(
    db,
    "donations",
    donationId
  );

  return await updateDoc(
    donationRef,
    {
      status:
        DONATION_STATUS.COLLECTED,
    }
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

  return await updateDoc(
    donationRef,
    {
      status:
        DONATION_STATUS.CANCELLED,
    }
  );
};

/**
 * Expire Donation
 */
export const expireDonation = async (
  donationId: string
) => {
  const donationRef = doc(
    db,
    "donations",
    donationId
  );

  return await updateDoc(
    donationRef,
    {
      status:
        DONATION_STATUS.EXPIRED,
    }
  );
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

  return await deleteDoc(
    donationRef
  );
};