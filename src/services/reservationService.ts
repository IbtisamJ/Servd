import {
  addDoc,
  collection,
  doc,
  getDocs,
  updateDoc,
} from "firebase/firestore";

import { db } from "../config/firebase";

/**
 * Creates a new reservation record.
 * Called when an NGO reserves a donation.
 */
export const createReservation =
  async (
    reservation: any
  ) => {
    return await addDoc(
      collection(
        db,
        "Reservations"
      ),
      reservation
    );
  };

/**
 * Retrieves all reservations.
 * Used in the My Reservations screen.
 */
export const getReservations =
  async () => {

    const snapshot =
      await getDocs(
        collection(
          db,
          "Reservations"
        )
      );

    return snapshot.docs.map(
      (document) => ({
        id: document.id,
        ...document.data(),
      })
    );
  };

/**
 * Updates reservation status.
 * Possible values:
 * Active
 * Collected
 * Cancelled
 */
export const updateReservationStatus =
  async (
    reservationId: string,
    status: string
  ) => {

    const reservationRef =
      doc(
        db,
        "Reservations",
        reservationId
      );

    return await updateDoc(
      reservationRef,
      {
        status,
      }
    );
  };