/**
 * Reservation Service
 *
 * Handles Firestore operations related to NGO reservations.
 *
 * Responsibilities:
 * - Reserve an available donation
 * - Retrieve reservation records
 * - Track reservation status
 * - Mark collections as completed
 * - Cancel active reservations
 *
 * Firestore collections used:
 * - Reservations
 * - Donations
 */

import {
  addDoc,
  collection,
  doc,
  getDocs,
  runTransaction,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

import { db } from "../config/firebase";

import {
  RESERVATION_STATUS,
} from "../constants/reservationStatus";

import {
  DONATION_STATUS,
} from "../constants/donationStatus";

/**
 * Reserves an available donation for an NGO.
 *
 * The donation status is checked inside a
 * Firestore transaction before it is changed.
 *
 * This helps prevent two NGOs from successfully
 * reserving the same donation.
 */
export const reserveDonationForNGO = async (
  donationDocumentId: string,
  donationId: string,
  ngoId: string,
  foodName: string,
  collectionLocation: string
) => {
  // Reference the selected Firestore donation document.
  const donationRef = doc(
    db,
    "Donations",
    donationDocumentId
  );

  /**
   * First update the donation atomically.
   *
   * Firestore will re-check the document if another
   * client changes it during the transaction.
   */
  await runTransaction(
    db,
    async (transaction) => {
      const donationSnapshot =
        await transaction.get(
          donationRef
        );

      // Ensure the donation still exists.
      if (!donationSnapshot.exists()) {
        throw new Error(
          "The selected donation could not be found."
        );
      }

      const donationData =
        donationSnapshot.data();

      /**
       * Business rule:
       * Only donations currently marked Available
       * may be reserved.
       */
      if (
        donationData.status !==
        DONATION_STATUS.AVAILABLE
      ) {
        throw new Error(
          "This donation is no longer available."
        );
      }

      // Change the donation lifecycle state.
      transaction.update(
        donationRef,
        {
          status:
            DONATION_STATUS.RESERVED,
        }
      );
    }
  );

  /**
   * Create the reservation record after the
   * donation has successfully been reserved.
   */
  const reservationRef = await addDoc(
    collection(
      db,
      "Reservations"
    ),
    {
      donationId,

      // Stores the actual Firestore document ID.
      // This is required when updating the linked
      // donation later.
      donationDocumentId,

      ngoId,
      foodName,
      collectionLocation,

      status:
        RESERVATION_STATUS.ACTIVE,

      createdTimestamp:
        serverTimestamp(),

      updatedTimestamp:
        serverTimestamp(),
    }
  );

  return reservationRef;
};

/**
 * Retrieves all reservation records
 * from the Reservations collection.
 *
 * Used by the My Reservations screen.
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
      (reservationDocument) => ({
        // Actual Firestore reservation document ID.
        id:
          reservationDocument.id,

        ...reservationDocument.data(),
      })
    );
  };

/**
 * Updates only the reservation status.
 *
 * Useful for general status-management operations.
 */
export const updateReservationStatus =
  async (
    reservationDocumentId: string,
    status: string
  ) => {
    const reservationRef = doc(
      db,
      "Reservations",
      reservationDocumentId
    );

    await updateDoc(
      reservationRef,
      {
        status,

        updatedTimestamp:
          serverTimestamp(),
      }
    );
  };

/**
 * Marks an active reservation as collected.
 *
 * Reservation lifecycle:
 * Active -> Collected
 *
 * Donation lifecycle:
 * Reserved -> Collected
 *
 * Both documents are updated in one transaction
 * to help keep reservation and donation data
 * consistent.
 */
export const markReservationCollected =
  async (
    reservationDocumentId: string,
    donationDocumentId: string
  ) => {
    // Reference the Reservation document.
    const reservationRef = doc(
      db,
      "Reservations",
      reservationDocumentId
    );

    // Reference the associated Donation document.
    const donationRef = doc(
      db,
      "Donations",
      donationDocumentId
    );

    await runTransaction(
      db,
      async (transaction) => {
        const reservationSnapshot =
          await transaction.get(
            reservationRef
          );

        const donationSnapshot =
          await transaction.get(
            donationRef
          );

        // Verify that both documents still exist.
        if (
          !reservationSnapshot.exists()
        ) {
          throw new Error(
            "The reservation could not be found."
          );
        }

        if (
          !donationSnapshot.exists()
        ) {
          throw new Error(
            "The associated donation could not be found."
          );
        }

        const reservationData =
          reservationSnapshot.data();

        const donationData =
          donationSnapshot.data();

        /**
         * Only an Active reservation
         * can be marked as collected.
         */
        if (
          reservationData.status !==
          RESERVATION_STATUS.ACTIVE
        ) {
          throw new Error(
            "Only active reservations can be marked as collected."
          );
        }

        /**
         * The associated donation should still
         * be Reserved before collection.
         */
        if (
          donationData.status !==
          DONATION_STATUS.RESERVED
        ) {
          throw new Error(
            "The associated donation is not currently reserved."
          );
        }

        // Update the reservation.
        transaction.update(
          reservationRef,
          {
            status:
              RESERVATION_STATUS.COLLECTED,

            updatedTimestamp:
              serverTimestamp(),
          }
        );

        // Update the linked donation.
        transaction.update(
          donationRef,
          {
            status:
              DONATION_STATUS.COLLECTED,
          }
        );
      }
    );
  };

/**
 * Cancels an active reservation.
 *
 * Reservation lifecycle:
 * Active -> Cancelled
 *
 * Donation lifecycle:
 * Reserved -> Available
 *
 * Returning the donation to Available means
 * another eligible NGO can reserve it.
 */
export const cancelReservation =
  async (
    reservationDocumentId: string,
    donationDocumentId: string
  ) => {
    // Reference both linked documents.
    const reservationRef = doc(
      db,
      "Reservations",
      reservationDocumentId
    );

    const donationRef = doc(
      db,
      "Donations",
      donationDocumentId
    );

    await runTransaction(
      db,
      async (transaction) => {
        const reservationSnapshot =
          await transaction.get(
            reservationRef
          );

        const donationSnapshot =
          await transaction.get(
            donationRef
          );

        // Ensure both records still exist.
        if (
          !reservationSnapshot.exists()
        ) {
          throw new Error(
            "The reservation could not be found."
          );
        }

        if (
          !donationSnapshot.exists()
        ) {
          throw new Error(
            "The associated donation could not be found."
          );
        }

        const reservationData =
          reservationSnapshot.data();

        const donationData =
          donationSnapshot.data();

        /**
         * Only an Active reservation can
         * be cancelled.
         */
        if (
          reservationData.status !==
          RESERVATION_STATUS.ACTIVE
        ) {
          throw new Error(
            "Only active reservations can be cancelled."
          );
        }

        /**
         * Confirm that the linked donation
         * is currently Reserved.
         */
        if (
          donationData.status !==
          DONATION_STATUS.RESERVED
        ) {
          throw new Error(
            "The associated donation is not currently reserved."
          );
        }

        // Cancel the reservation.
        transaction.update(
          reservationRef,
          {
            status:
              RESERVATION_STATUS.CANCELLED,

            updatedTimestamp:
              serverTimestamp(),
          }
        );

        /**
         * Make the donation available again
         * so another NGO may reserve it.
         */
        transaction.update(
          donationRef,
          {
            status:
              DONATION_STATUS.AVAILABLE,
          }
        );
      }
    );
  };