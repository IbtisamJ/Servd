/**
 * Reservation Service
 *
 * Handles Firestore operations for creating and retrieving reservations
 * and updating reservation statuses. Uses Firestore transactions to
 * keep reservation and donation status changes consistent.
 *
 * Responsibilities:
 * - Retrieves reservation documents and includes their document IDs.
 * - Creates reservations for donations that are currently available.
 * - Updates the donation to reserved when a reservation is created.
 * - Prevents reservations for missing or unavailable donations.
 * - Marks active reservations as collected or cancelled.
 * - Updates the related donation in the same transaction.
 * - Makes the donation available again when a reservation is cancelled.
 * - Marks the donation as collected when the reservation is collected.
 * - Returns success or error information for supported operations.
 */
/**
 * Reservation Service
 *
 * Handles Firestore operations for creating and retrieving reservations
 * and updating reservation statuses. Uses Firestore transactions to
 * keep reservation and donation status changes consistent.
 *
 * Responsibilities:
 * - Retrieves reservation documents and includes their document IDs.
 * - Creates reservations for donations that are currently available.
 * - Updates the donation to reserved when a reservation is created.
 * - Prevents reservations for missing or unavailable donations.
 * - Marks active reservations as collected or cancelled.
 * - Updates the related donation in the same transaction.
 * - Makes the donation available again when a reservation is cancelled.
 * - Marks the donation as collected when the reservation is collected.
 * - Returns success or error information for supported operations.
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

/** Helper to find the correct donation document reference. */
const resolveDonationRef = async (donationId) => {
  const directRef = doc(db, DONATIONS, donationId);
  const directSnap = await getDoc(directRef);
  if (directSnap.exists()) {
    return directRef;
  }

  const q = query(
    collection(db, DONATIONS),
    where("donationId", "==", donationId),
  );
  const snapshot = await getDocs(q);

  return snapshot.empty ? null : snapshot.docs[0].ref;
};

/** Get all reservations, including each Firestore document ID. */
export const getReservations = async () => {
  const snapshot = await getDocs(collection(db, RESERVATIONS));

  return snapshot.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  }));
};

/** Reserve an available donation transactionally. */
export const createReservation = async (donationId, ngoId, enterpriseId) => {
  try {
    const donationRef = await resolveDonationRef(donationId);

    if (!donationRef) {
      return { success: false, error: "Donation not found." };
    }

    const reservationRef = doc(db, RESERVATIONS, `res_${donationId}`);

    await runTransaction(db, async (transaction) => {
      const donationDoc = await transaction.get(donationRef);

      if (!donationDoc.exists()) {
        throw new Error("Donation no longer exists.");
      }

      const donationData = donationDoc.data();

      // Confirm the enterprise ID belongs to this donation
      if (donationData.enterpriseId !== enterpriseId) {
        throw new Error("The enterprise does not own this donation.");
      }

      if (donationDoc.data().status !== STATUS.AVAILABLE) {
        throw new Error("This donation is no longer available.");
      }

      transaction.update(donationRef, {
        status: STATUS.RESERVED,
        updatedTimestamp: serverTimestamp(),
      });

      transaction.set(reservationRef, {
        reservationId: reservationRef.id,
        donationId,
        ngoId,
        enterpriseId,
        status: STATUS.ACTIVE,
        createdTimestamp: serverTimestamp(),
        updatedTimestamp: serverTimestamp(),
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

/** Update a reservation and its donation in one transaction. */
export const updateReservationStatus = async (
  reservationId,
  donationId,
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
    const donationRef = await resolveDonationRef(donationId);

    if (!donationRef) {
      return { success: false, error: "Donation not found." };
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

      if (reservationDoc.data().status !== STATUS.ACTIVE) {
        throw new Error("This reservation is no longer active.");
      }

      transaction.update(reservationRef, {
        status: newStatus,
        updatedTimestamp: serverTimestamp(),
      });

      transaction.update(donationRef, {
        status:
          newStatus === STATUS.CANCELLED ? STATUS.AVAILABLE : STATUS.COLLECTED,
        updatedTimestamp: serverTimestamp(),
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