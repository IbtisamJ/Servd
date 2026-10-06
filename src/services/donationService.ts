import {
    addDoc,
    collection,
    doc,
    getDocs,
    updateDoc,
} from "firebase/firestore";

import { db } from "../config/firebase";

export const createDonation = async (donation: any) => {
  return await addDoc(collection(db, "donations"), donation);
};

export const getDonations = async () => {
  const snapshot = await getDocs(
    collection(db, "donations")
  );

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};

export const updateDonation = async (
  donationId: string,
  data: any
) => {
  const donationRef = doc(
    db,
    "donations",
    donationId
  );

  return await updateDoc(donationRef, data);
};