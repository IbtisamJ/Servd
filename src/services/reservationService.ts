/**
 * Reservation Service
 *
 * Handles all Firestore operations related
 * to NGO donation reservations.
 *
 * Collection:
 * Reservations
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

/**
 * Creates a new reservation.
 *
 * Called when an NGO reserves a donation.
 */
export const createReservation = async (
  reservation: any
) => {
  return await addDoc(
    collection(db, "Reservations"),
    reservation
  );
};

/**
 * Retrieves all reservations from Firestore.
 *
 * Used by the My Reservations screen.
 */
export const getReservations = async () => {
  const snapshot = await getDocs(
    collection(db, "Reservations")
  );

  return snapshot.docs.map((document) => ({
    id: document.id,
    ...document.data(),
  }));
};

/**
 * Updates a reservation status.
 *
 * Possible statuses:
 * - Active
 * - Collected
 * - Cancelled
 */
export const updateReservationStatus = async (
  reservationId: string,
  status: string
) => {
  const reservationRef = doc(
    db,
    "Reservations",
    reservationId
  );

  return await updateDoc(
    reservationRef,
    {
      status,
      updatedTimestamp: new Date(),
    }
  );
};

/**
 * Marks a reservation as collected.
 */
export const markReservationCollected =
  async (
    reservationId: string
  ) => {

    const reservationRef = doc(
      db,
      "Reservations",
      reservationId
    );

    return await updateDoc(
      reservationRef,
      {
        status: "Collected",
        updatedTimestamp:
          new Date(),
      }
    );
  };

/**
 * Cancels a reservation.
 */
export const cancelReservation =
  async (
    reservationId: string
  ) => {

    const reservationRef = doc(
      db,
      "Reservations",
      reservationId
    );

    return await updateDoc(
      reservationRef,
      {
        status: "Cancelled",
        updatedTimestamp:
          new Date(),
      }
    );
  };

/**
 * Permanently deletes a reservation.
 *
 * Mostly used for testing or
 * administrator functionality.
 */
export const deleteReservation =
  async (
    reservationId: string
  ) => {

    const reservationRef = doc(
      db,
      "Reservations",
      reservationId
    );

    return await deleteDoc(
      reservationRef
    );
  };