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

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

import { db } from "../config/firebase";
import { DONATION_STATUS } from "../constants/roles";
import type { Donation } from "../types/Donation";

const DONATIONS_COLLECTION = "Donations";

/** Create a donation. */
export const createDonation = async (donation: Donation) => {
  return addDoc(collection(db, DONATIONS_COLLECTION), {
    ...donation,
    createdTimestamp: serverTimestamp(),
    updatedTimestamp: serverTimestamp(),
  });
};

/** Retrieve all donations. */
export const getDonations = async () => {
  const snapshot = await getDocs(collection(db, DONATIONS_COLLECTION));

  return snapshot.docs.map((document) => ({
    id: document.id,
    ...document.data(),
  }));
};

/** Update donation details. */
export const updateDonation = async (
  donationId: string,
  data: Partial<Donation>,
) => {
  return updateDoc(doc(db, DONATIONS_COLLECTION, donationId), {
    ...data,
    updatedTimestamp: serverTimestamp(),
  });
};

/** Shared helper for donation status changes. */
const updateDonationStatus = async (
  donationId: string,
  status: Donation["status"],
) => {
  return updateDoc(doc(db, DONATIONS_COLLECTION, donationId), {
    status,
    updatedTimestamp: serverTimestamp(),
  });
};

/** Mark a donation as reserved. */
export const reserveDonation = async (donationId: string) =>
  updateDonationStatus(donationId, DONATION_STATUS.RESERVED);

/** Mark a donation as collected. */
export const collectDonation = async (donationId: string) =>
  updateDonationStatus(donationId, DONATION_STATUS.COLLECTED);

/** Mark a donation as cancelled. */
export const cancelDonation = async (donationId: string) =>
  updateDonationStatus(donationId, DONATION_STATUS.CANCELLED);

/** Mark a donation as expired. */
export const expireDonation = async (donationId: string) =>
  updateDonationStatus(donationId, DONATION_STATUS.EXPIRED);

/** Permanently delete a donation. */
export const deleteDonation = async (donationId: string) =>
  deleteDoc(doc(db, DONATIONS_COLLECTION, donationId));
