/**
 * Donation Service
 *
 * Handles all Firestore operations related to donations.
 *
 * Collection:
 * Donations
 */

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
 * Creates a new donation record.
 *
 * Used by Food Enterprises when
 * submitting surplus food.
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
 *
 * Used by NGO users to browse
 * available donations.
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
 * Updates donation information.
 *
 * Used when donation details
 * need to be modified.
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
 *
 * Called when an NGO reserves
 * a donation.
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
 * Marks a donation as Collected.
 *
 * Used after successful collection.
 */
export const collectDonation = async (
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
        DONATION_STATUS.COLLECTED,
    }
  );
};

/**
 * Marks a donation as Cancelled.
 *
 * Donation remains in Firestore
 * for audit and testing purposes.
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
 * Marks a donation as Expired.
 *
 * Used when collection deadline
 * has passed.
 */
export const expireDonation = async (
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
        DONATION_STATUS.EXPIRED,
    }
  );
};

/**
 * Permanently removes a donation.
 *
 * Mainly used for administration
 * and testing purposes.
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