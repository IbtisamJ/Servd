/**
 * Reservation Service
 *
 * Handles Firestore operations relating to
 * NGO donation reservations.
 */

import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

import { db } from "../config/firebase";

/**
 * Creates a reservation for an available donation.
 *
 * The donation is checked before the reservation is
 * created to reduce the possibility of reserving an
 * unavailable donation.
 */
export const reserveDonationForNGO = async (
  documentId: string,
  donationId: string,
  ngoId: string,
  foodName: string,
  collectionLocation: string
) => {
  // Reference the selected donation using its
  // actual Firestore document ID.
  const donationRef = doc(
    db,
    "Donations",
    documentId
  );

  // Retrieve the latest donation information.
  const donationSnapshot =
    await getDoc(donationRef);

  if (!donationSnapshot.exists()) {
    throw new Error(
      "The selected donation could not be found."
    );
  }

  const donationData =
    donationSnapshot.data();

  // Only Available donations may be reserved.
  if (donationData.status !== "Available") {
    throw new Error(
      "This donation is no longer available."
    );
  }

  // Create the reservation record.
  const reservationRef = await addDoc(
    collection(db, "Reservations"),
    {
      donationId,
      donationDocumentId: documentId,
      ngoId,
      foodName,
      collectionLocation,
      status: "Active",
      createdTimestamp: serverTimestamp(),
      updatedTimestamp: serverTimestamp(),
    }
  );

  // Change the donation lifecycle status.
  await updateDoc(donationRef, {
    status: "Reserved",
  });

  return reservationRef;
};

/**
 * Retrieves reservation records from Firestore.
 */
export const getReservations = async () => {
  const snapshot = await getDocs(
    collection(db, "Reservations")
  );

  return snapshot.docs.map(
    (reservationDocument) => ({
      id: reservationDocument.id,
      ...reservationDocument.data(),
    })
  );
};

/**
 * Updates an existing reservation status.
 */
export const updateReservationStatus = async (
  reservationDocumentId: string,
  status: string
) => {
  const reservationRef = doc(
    db,
    "Reservations",
    reservationDocumentId
  );

  await updateDoc(reservationRef, {
    status,
    updatedTimestamp: serverTimestamp(),
  });
};