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

import { db } from "@/config/firebase";
import {
  COLLECTIONS,
  DONATION_STATUS,
  RESERVATION_STATUS,
} from "@/constants/roles";
import { createNotification } from "@/services/notificationService";

type ReservationStatus =
  (typeof RESERVATION_STATUS)[keyof typeof RESERVATION_STATUS];

interface ReservationNotificationDetails {
  enterpriseId: string;
  foodName: string;
  ngoId?: string;
  reservationId: string;
  donationId?: string;
}

/**
 * Notifications should not undo a reservation, cancellation,
 * or collection that has already succeeded.
 */
async function sendReservationNotification(notification: {
  recipientId: string;
  title: string;
  message: string;
  type: "reservation" | "cancellation" | "collected";
  reservationId: string;
  donationId?: string;
}): Promise<void> {
  try {
    await createNotification(notification);
  } catch (error) {
    console.error(
      "NOTIFICATION CREATION FAILED",
      error instanceof Error
        ? {
            message: error.message,
            name: error.name,
            code: "code" in error ? error.code : undefined,
          }
        : error,
    );
  }
}

export async function reserveDonationForNGO(
  donationDocumentId: string,
  donationId: string,
  ngoId: string,
  foodName: string,
  collectionLocation: string,
): Promise<string> {
  const donationRef = doc(db, COLLECTIONS.DONATIONS, donationDocumentId);

  const reservationRef = doc(collection(db, COLLECTIONS.RESERVATIONS));

  const notificationDetails = await runTransaction(db, async (transaction) => {
    const donationSnapshot = await transaction.get(donationRef);

    if (!donationSnapshot.exists()) {
      throw new Error("This donation no longer exists.");
    }

    const donationData = donationSnapshot.data();

    if (donationData.status !== DONATION_STATUS.AVAILABLE) {
      throw new Error("This donation is no longer available.");
    }

    const enterpriseId = donationData.enterpriseId;

    if (typeof enterpriseId !== "string" || !enterpriseId.trim()) {
      throw new Error(
        "This donation is missing its enterprise owner. Please update the donation before reserving it.",
      );
    }

    transaction.update(donationRef, {
      status: DONATION_STATUS.RESERVED,
    });

    transaction.set(reservationRef, {
      donationId,
      donationDocumentId,
      enterpriseId,
      ngoId,
      foodName,
      collectionLocation,
      status: RESERVATION_STATUS.ACTIVE,
      createdTimestamp: serverTimestamp(),
      updatedTimestamp: serverTimestamp(),
    });

    return {
      enterpriseId,
      foodName:
        typeof donationData.foodName === "string"
          ? donationData.foodName
          : foodName,
    };
  });

  await sendReservationNotification({
    recipientId: notificationDetails.enterpriseId,
    title: "New reservation",
    message: `Your donation "${notificationDetails.foodName}" has been reserved by an NGO.`,
    type: "reservation",
    reservationId: reservationRef.id,
    donationId,
  });

  return reservationRef.id;
}

export async function getReservations() {
  const snapshot = await getDocs(collection(db, COLLECTIONS.RESERVATIONS));

  return snapshot.docs.map((reservationDoc) => ({
    id: reservationDoc.id,
    ...reservationDoc.data(),
  }));
}

export async function getReservationsForNGO(ngoId: string) {
  const reservationsQuery = query(
    collection(db, COLLECTIONS.RESERVATIONS),
    where("ngoId", "==", ngoId),
  );

  const snapshot = await getDocs(reservationsQuery);

  return snapshot.docs.map((reservationDoc) => ({
    id: reservationDoc.id,
    ...reservationDoc.data(),
  }));
}

export async function getReservationsForEnterprise(enterpriseId: string) {
  const reservationsQuery = query(
    collection(db, COLLECTIONS.RESERVATIONS),
    where("enterpriseId", "==", enterpriseId),
  );

  const snapshot = await getDocs(reservationsQuery);

  return snapshot.docs.map((reservationDoc) => ({
    id: reservationDoc.id,
    ...reservationDoc.data(),
  }));
}

/**
 * Generic status updater retained for existing callers.
 * Use cancelReservation() and markReservationCollected()
 * when changing the full reservation/donation lifecycle.
 */
export async function updateReservationStatus(
  reservationDocumentId: string,
  status: ReservationStatus,
) {
  const reservationRef = doc(
    db,
    COLLECTIONS.RESERVATIONS,
    reservationDocumentId,
  );

  await updateDoc(reservationRef, {
    status,
    updatedTimestamp: serverTimestamp(),
  });
}

export async function markReservationCollected(
  reservationDocumentId: string,
  donationDocumentId: string,
): Promise<void> {
  const reservationRef = doc(
    db,
    COLLECTIONS.RESERVATIONS,
    reservationDocumentId,
  );

  const donationRef = doc(db, COLLECTIONS.DONATIONS, donationDocumentId);

  const details: ReservationNotificationDetails = await runTransaction(
    db,
    async (transaction) => {
      const reservationSnapshot = await transaction.get(reservationRef);
      const donationSnapshot = await transaction.get(donationRef);

      if (!reservationSnapshot.exists()) {
        throw new Error("Reservation not found.");
      }

      if (!donationSnapshot.exists()) {
        throw new Error("Donation not found.");
      }

      const reservationData = reservationSnapshot.data();
      const donationData = donationSnapshot.data();

      if (reservationData.status !== RESERVATION_STATUS.ACTIVE) {
        throw new Error("This reservation is no longer active.");
      }

      if (donationData.status !== DONATION_STATUS.RESERVED) {
        throw new Error("This donation is not currently reserved.");
      }

      if (reservationData.donationDocumentId !== donationDocumentId) {
        throw new Error("This reservation does not match the donation.");
      }

      const enterpriseId =
        reservationData.enterpriseId ?? donationData.enterpriseId;

      if (typeof enterpriseId !== "string" || !enterpriseId.trim()) {
        throw new Error(
          "The enterprise owner could not be found for this reservation.",
        );
      }

      transaction.update(reservationRef, {
        status: RESERVATION_STATUS.COLLECTED,
        updatedTimestamp: serverTimestamp(),
      });

      transaction.update(donationRef, {
        status: DONATION_STATUS.COLLECTED,
      });

      return {
        enterpriseId,
        foodName:
          typeof reservationData.foodName === "string"
            ? reservationData.foodName
            : typeof donationData.foodName === "string"
              ? donationData.foodName
              : "your donation",
        ngoId:
          typeof reservationData.ngoId === "string"
            ? reservationData.ngoId
            : undefined,
        reservationId: reservationDocumentId,
        donationId:
          typeof reservationData.donationId === "string"
            ? reservationData.donationId
            : undefined,
      };
    },
  );

  await sendReservationNotification({
    recipientId: details.enterpriseId,
    title: "Donation collected",
    message: `"${details.foodName}" has been marked as collected.`,
    type: "collected",
    reservationId: details.reservationId,
    donationId: details.donationId,
  });
}

export async function cancelReservation(
  reservationDocumentId: string,
  donationDocumentId: string,
): Promise<void> {
  const reservationRef = doc(
    db,
    COLLECTIONS.RESERVATIONS,
    reservationDocumentId,
  );

  const donationRef = doc(db, COLLECTIONS.DONATIONS, donationDocumentId);

  const details: ReservationNotificationDetails = await runTransaction(
    db,
    async (transaction) => {
      const reservationSnapshot = await transaction.get(reservationRef);
      const donationSnapshot = await transaction.get(donationRef);

      if (!reservationSnapshot.exists()) {
        throw new Error("Reservation not found.");
      }

      if (!donationSnapshot.exists()) {
        throw new Error("Donation not found.");
      }

      const reservationData = reservationSnapshot.data();
      const donationData = donationSnapshot.data();

      if (reservationData.status !== RESERVATION_STATUS.ACTIVE) {
        throw new Error("This reservation is no longer active.");
      }

      if (donationData.status !== DONATION_STATUS.RESERVED) {
        throw new Error("This donation is not currently reserved.");
      }

      if (reservationData.donationDocumentId !== donationDocumentId) {
        throw new Error("This reservation does not match the donation.");
      }

      const enterpriseId =
        reservationData.enterpriseId ?? donationData.enterpriseId;

      if (typeof enterpriseId !== "string" || !enterpriseId.trim()) {
        throw new Error(
          "The enterprise owner could not be found for this reservation.",
        );
      }

      transaction.update(reservationRef, {
        status: RESERVATION_STATUS.CANCELLED,
        updatedTimestamp: serverTimestamp(),
      });

      transaction.update(donationRef, {
        status: DONATION_STATUS.AVAILABLE,
      });

      return {
        enterpriseId,
        foodName:
          typeof reservationData.foodName === "string"
            ? reservationData.foodName
            : typeof donationData.foodName === "string"
              ? donationData.foodName
              : "your donation",
        ngoId:
          typeof reservationData.ngoId === "string"
            ? reservationData.ngoId
            : undefined,
        reservationId: reservationDocumentId,
        donationId:
          typeof reservationData.donationId === "string"
            ? reservationData.donationId
            : undefined,
      };
    },
  );

  await sendReservationNotification({
    recipientId: details.enterpriseId,
    title: "Reservation cancelled",
    message: `The reservation for "${details.foodName}" has been cancelled. The donation is available again.`,
    type: "cancellation",
    reservationId: details.reservationId,
    donationId: details.donationId,
  });
}
