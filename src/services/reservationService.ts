import {
    addDoc,
    collection,
    doc,
    getDocs,
    updateDoc,
} from "firebase/firestore";

import { db } from "../config/firebase";

export const createReservation =
  async (
    reservation: any
  ) => {

    return await addDoc(
      collection(
        db,
        "reservations"
      ),
      reservation
    );
  };

export const getReservations =
  async () => {

    const snapshot =
      await getDocs(
        collection(
          db,
          "reservations"
        )
      );

    return snapshot.docs.map(
      (document) => ({
        id: document.id,
        ...document.data(),
      })
    );
  };

export const updateReservationStatus =
  async (
    reservationId: string,
    status: string
  ) => {

    const reservationRef =
      doc(
        db,
        "reservations",
        reservationId
      );

    return await updateDoc(
      reservationRef,
      {
        status,
      }
    );
  };
``