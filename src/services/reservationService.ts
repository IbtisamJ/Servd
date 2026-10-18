/**
 * Reservation Service
 *
 * Handles Firestore operations related to NGO reservations.
 *
 * Responsibilities:
 * - Reserve an available donation
 * - Retrieve reservation records
 * - Retrieve reservations for a specific NGO
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
  query,
  runTransaction,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";

import {
  db,
} from "../config/firebase";

import { RESERVATION_STATUS } from "../constants/roles";

import { DONATION_STATUS } from "../constants/roles";

/**
 * Reserves an available donation for an NGO.
 *
 * ngoId should contain the Firebase Authentication
 * UID of the currently authenticated NGO.
 *
 * The donation status is checked inside a
 * Firestore transaction before it is changed.
 *
 * This helps prevent two NGOs from successfully
 * reserving the same donation.
 */
export const reserveDonationForNGO =
  async (
    donationDocumentId: string,
    donationId: string,
    ngoId: string,
    foodName: string,
    collectionLocation: string
  ) => {
    /**
     * Reference the selected Firestore
     * Donation document.
     */
    const donationRef =
      doc(
        db,
        "Donations",
        donationDocumentId
      );

    /**
     * Update the Donation atomically.
     *
     * Firestore will re-check the document
     * if another client changes it during
     * the transaction.
     */
    await runTransaction(
      db,
      async (transaction) => {
        const donationSnapshot =
          await transaction.get(
            donationRef
          );

        /**
         * Ensure the Donation still exists.
         */
        if (
          !donationSnapshot.exists()
        ) {
          throw new Error(
            "The selected donation could not be found."
          );
        }

        const donationData =
          donationSnapshot.data();

        /**
         * Business rule:
         *
         * Only Donations currently marked
         * Available may be reserved.
         */
        if (
          donationData.status !==
          DONATION_STATUS.AVAILABLE
        ) {
          throw new Error(
            "This donation is no longer available."
          );
        }

        /**
         * Change the Donation lifecycle state:
         *
         * Available -> Reserved
         */
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
     * Create the Reservation after the
     * Donation has successfully been reserved.
     *
     * ngoId stores the authenticated
     * Firebase user's UID.
     */
    const reservationRef =
      await addDoc(
        collection(
          db,
          "Reservations"
        ),
        {
          donationId,

          /**
           * Actual Firestore Donation
           * document identifier.
           *
           * Required when the linked
           * Donation is updated later.
           */
          donationDocumentId,

          /**
           * Firebase Authentication UID
           * belonging to the NGO that
           * created this Reservation.
           */
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
 * Retrieves all Reservation records.
 *
 * This function is retained because it may
 * still be useful for administration or
 * development/testing functionality.
 *
 * NGO-facing screens should use
 * getReservationsForNGO() instead.
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
        /**
         * Actual Firestore Reservation
         * document identifier.
         */
        id:
          reservationDocument.id,

        ...reservationDocument.data(),
      })
    );
  };

/**
 * Retrieves Reservation records belonging
 * to one specific NGO.
 *
 * ngoId should contain the Firebase
 * Authentication UID of the signed-in NGO.
 *
 * This prevents the NGO-facing My Reservations
 * screen from displaying Reservations belonging
 * to other NGO accounts.
 */
export const getReservationsForNGO =
  async (
    ngoId: string
  ) => {
    if (!ngoId) {
      throw new Error(
        "An NGO identifier is required to retrieve reservations."
      );
    }

    /**
     * Query only Reservations whose ngoId
     * matches the authenticated user's UID.
     */
    const reservationsQuery =
      query(
        collection(
          db,
          "Reservations"
        ),

        where(
          "ngoId",
          "==",
          ngoId
        )
      );

    const snapshot =
      await getDocs(
        reservationsQuery
      );

    return snapshot.docs.map(
      (reservationDocument) => ({
        /**
         * Actual Firestore Reservation
         * document identifier.
         */
        id:
          reservationDocument.id,

        ...reservationDocument.data(),
      })
    );
  };

/**
 * Updates only the Reservation status.
 *
 * Useful for general Reservation
 * status-management operations.
 */
export const updateReservationStatus =
  async (
    reservationDocumentId: string,
    status: string
  ) => {
    const reservationRef =
      doc(
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
 * Marks an Active Reservation as Collected.
 *
 * Reservation lifecycle:
 * Active -> Collected
 *
 * Donation lifecycle:
 * Reserved -> Collected
 *
 * Both documents are updated in one transaction
 * to help keep Reservation and Donation data
 * consistent.
 */
export const markReservationCollected =
  async (
    reservationDocumentId: string,
    donationDocumentId: string
  ) => {
    /**
     * Reference the Reservation document.
     */
    const reservationRef =
      doc(
        db,
        "Reservations",
        reservationDocumentId
      );

    /**
     * Reference the associated
     * Donation document.
     */
    const donationRef =
      doc(
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

        /**
         * Verify that both documents
         * still exist.
         */
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
         * Only an Active Reservation can
         * be marked as Collected.
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
         * The associated Donation should
         * still be Reserved.
         */
        if (
          donationData.status !==
          DONATION_STATUS.RESERVED
        ) {
          throw new Error(
            "The associated donation is not currently reserved."
          );
        }

        /**
         * Reservation:
         * Active -> Collected
         */
        transaction.update(
          reservationRef,
          {
            status:
              RESERVATION_STATUS.COLLECTED,

            updatedTimestamp:
              serverTimestamp(),
          }
        );

        /**
         * Donation:
         * Reserved -> Collected
         */
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
 * Cancels an Active Reservation.
 *
 * Reservation lifecycle:
 * Active -> Cancelled
 *
 * Donation lifecycle:
 * Reserved -> Available
 *
 * Returning the Donation to Available means
 * another eligible NGO can reserve it.
 */
export const cancelReservation =
  async (
    reservationDocumentId: string,
    donationDocumentId: string
  ) => {
    /**
     * Reference the linked documents.
     */
    const reservationRef =
      doc(
        db,
        "Reservations",
        reservationDocumentId
      );

    const donationRef =
      doc(
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

        /**
         * Ensure both records still exist.
         */
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
         * Only an Active Reservation
         * may be cancelled.
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
         * Confirm that the linked Donation
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

        /**
         * Reservation:
         * Active -> Cancelled
         */
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
         * Donation:
         * Reserved -> Available
         *
         * This allows another NGO
         * to reserve the Donation.
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