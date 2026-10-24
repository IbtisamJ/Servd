/**
 * Reservation Service
 *
 * Creates and retrieves reservations and updates reservation statuses.
 * Keeps reservation and donation updates consistent through transactions.
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  runTransaction,
  serverTimestamp,
  where,
} from "firebase/firestore";

import { db } from "../config/firebase";

const DONATIONS = "Donations";
const RESERVATIONS = "Reservations";

const STATUS = {
  AVAILABLE: "available",
  RESERVED: "reserved",
  ACTIVE: "active",
  COLLECTED: "collected",
  CANCELLED: "cancelled",
};

/**
 * Resolve a donation using its Firestore document ID first,
 * then fall back to its logical donationId.
 */
const resolveDonationRef = async (donationId) => {
  if (!donationId || typeof donationId !== "string") {
    return null;
  }

  const directRef = doc(db, DONATIONS, donationId);
  const directSnap = await getDoc(directRef);

  if (directSnap.exists()) {
    return directRef;
  }

  const donationQuery = query(
    collection(db, DONATIONS),
    where("donationId", "==", donationId),
  );

  const snapshot = await getDocs(donationQuery);

  return snapshot.empty ? null : snapshot.docs[0].ref;
};

/** Return all reservations with their Firestore document IDs. */
export const getReservations = async () => {
  const snapshot = await getDocs(collection(db, RESERVATIONS));

  return snapshot.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  }));
};

/** Return reservations belonging to a specific NGO. */
export const getReservationsForNGO = async (ngoId) => {
  if (!ngoId) {
    return [];
  }

  const reservationsQuery = query(
    collection(db, RESERVATIONS),
    where("ngoId", "==", ngoId),
  );

  const snapshot = await getDocs(reservationsQuery);

  return snapshot.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  }));
};

/**
 * Create a reservation.
 *
 * Arguments:
 * - donationDocumentId: Firestore document ID for the donation
 * - ngoId: authenticated NGO user's UID
 * - enterpriseId: owning enterprise user's UID
 *
 * Donation display details are copied from the donation document.
 */
export const createReservation = async (
  donationDocumentId,
  ngoId,
  enterpriseId,
) => {
  try {
    if (!donationDocumentId || !ngoId || !enterpriseId) {
      return {
        success: false,
        error: "Donation, NGO, or enterprise information is missing.",
      };
    }

    const donationRef = await resolveDonationRef(donationDocumentId);

    if (!donationRef) {
      return {
        success: false,
        error: "Donation not found.",
      };
    }

    // One reservation document per donation prevents duplicate reservations.
    const reservationRef = doc(db, RESERVATIONS, `res_${donationRef.id}`);

    await runTransaction(db, async (transaction) => {
      const donationDoc = await transaction.get(donationRef);

      if (!donationDoc.exists()) {
        throw new Error("Donation no longer exists.");
      }

      const donationData = donationDoc.data();

      if (donationData.enterpriseId !== enterpriseId) {
        throw new Error("The enterprise does not own this donation.");
      }

      if (donationData.status !== STATUS.AVAILABLE) {
        throw new Error("This donation is no longer available.");
      }

      const existingReservation = await transaction.get(reservationRef);

      if (existingReservation.exists()) {
        throw new Error(
          "A reservation record already exists for this donation.",
        );
      }

      const now = serverTimestamp();

      transaction.update(donationRef, {
        status: STATUS.RESERVED,
        updatedTimestamp: now,
      });

      transaction.set(reservationRef, {
        reservationId: reservationRef.id,

        // Keep both identifiers for screens and lookups.
        donationDocumentId: donationRef.id,
        donationId: donationData.donationId || donationRef.id,

        ngoId,
        enterpriseId,

        // Details used by the NGO and enterprise screens.
        foodName:
          donationData.foodName ||
          donationData.title ||
          donationData.name ||
          "Food donation",
        category: donationData.category || "",
        quantity: donationData.quantity ?? "",
        description: donationData.description || "",
        collectionLocation:
          donationData.collectionLocation || donationData.pickupAddress || "",
        collectionDeadline:
          donationData.collectionDeadline ||
          donationData.collectionTimeframe ||
          null,

        status: STATUS.ACTIVE,
        createdTimestamp: now,
        updatedTimestamp: now,
      });
    });

    return { success: true };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Reservation failed.";

    console.error("Reservation failed:", message);

    return { success: false, error: message };
  }
};

/**
 * Update a reservation and its donation in the same transaction.
 * donationDocumentId should be the Firestore document ID.
 */
export const updateReservationStatus = async (
  reservationId,
  donationDocumentId,
  newStatus,
) => {
  const allowedStatuses = [STATUS.COLLECTED, STATUS.CANCELLED];

  if (!allowedStatuses.includes(newStatus)) {
    return {
      success: false,
      error: "Invalid reservation status.",
    };
  }

  try {
    if (!reservationId || !donationDocumentId) {
      return {
        success: false,
        error: "Reservation or donation information is missing.",
      };
    }

    const donationRef = await resolveDonationRef(donationDocumentId);

    if (!donationRef) {
      return {
        success: false,
        error: "Donation not found.",
      };
    }

    const reservationRef = doc(db, RESERVATIONS, reservationId);

    await runTransaction(db, async (transaction) => {
      const reservationDoc = await transaction.get(reservationRef);
      const donationDoc = await transaction.get(donationRef);

      if (!reservationDoc.exists()) {
        throw new Error("Reservation not found.");
      }

      if (!donationDoc.exists()) {
        throw new Error("Donation not found.");
      }

      const reservationData = reservationDoc.data();

      if (reservationData.status !== STATUS.ACTIVE) {
        throw new Error("This reservation is no longer active.");
      }

      if (
        reservationData.donationDocumentId &&
        reservationData.donationDocumentId !== donationRef.id
      ) {
        throw new Error("The reservation does not match this donation.");
      }

      const now = serverTimestamp();

      transaction.update(reservationRef, {
        status: newStatus,
        updatedTimestamp: now,
      });

      transaction.update(donationRef, {
        status:
          newStatus === STATUS.CANCELLED ? STATUS.AVAILABLE : STATUS.COLLECTED,
        updatedTimestamp: now,
      });
    });

    return { success: true };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not update reservation.";

    console.error("Reservation update failed:", message);

    return { success: false, error: message };
  }
};

/** Cancel an active reservation. */
export const cancelReservation = (reservationId, donationDocumentId) =>
  updateReservationStatus(reservationId, donationDocumentId, STATUS.CANCELLED);

/** Mark an active reservation as collected. */
export const markReservationCollected = (reservationId, donationDocumentId) =>
  updateReservationStatus(reservationId, donationDocumentId, STATUS.COLLECTED);
