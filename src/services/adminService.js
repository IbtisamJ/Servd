/**
 * Admin Service
 *
 * Provides Firestore operations used by the admin dashboard and management
 * screens.
 *
 * Responsibilities:
 * - Fetch NGOs and filter pending applications.
 * - Update NGO verification status when the team connects approval actions.
 * - Fetch users, donations, and reservations for admin views and dashboard stats.
 */

import {
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";

import { db } from "../config/firebase";
import { COLLECTIONS, NGO_STATUS } from "../constants/roles";

// Fetch NGOs awaiting verification.
export const getPendingNGOs = async () => {
  try {
    const ngosRef = collection(db, COLLECTIONS.NGOS);
    const pendingQuery = query(
      ngosRef,
      where("verificationStatus", "==", NGO_STATUS.PENDING)
    );

    const snapshot = await getDocs(pendingQuery);
    const pendingNGOs = snapshot.docs.map((document) => ({
      id: document.id,
      ...document.data(),
    }));

    return { success: true, data: pendingNGOs };
  } catch (error) {
    console.error("Error fetching pending NGOs:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch pending NGOs",
    };
  }
};

// Update an NGO's verification status.
// Call this only when the team is ready to connect approval/rejection actions.
export const approveOrRejectNGO = async (ngoDocumentId, newStatus) => {
  try {
    if (![NGO_STATUS.APPROVED, NGO_STATUS.REJECTED].includes(newStatus)) {
      throw new Error("Invalid NGO verification status.");
    }

    await updateDoc(doc(db, COLLECTIONS.NGOS, ngoDocumentId), {
      verificationStatus: newStatus,
      updatedTimestamp: serverTimestamp(),
    });

    return { success: true };
  } catch (error) {
    console.error("Error updating NGO status:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update NGO status",
    };
  }
};

// Fetch all users.
export const manageUsers = async () => {
  try {
    const snapshot = await getDocs(collection(db, COLLECTIONS.USERS));
    const users = snapshot.docs.map((document) => ({
      id: document.id,
      ...document.data(),
    }));

    return { success: true, data: users };
  } catch (error) {
    console.error("Error fetching users:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch users",
    };
  }
};

// Fetch all donation records.
export const manageDonationRecords = async () => {
  try {
    const snapshot = await getDocs(collection(db, COLLECTIONS.DONATIONS));
    const donations = snapshot.docs.map((document) => ({
      id: document.id,
      ...document.data(),
    }));

    return { success: true, data: donations };
  } catch (error) {
    console.error("Error fetching donations:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch donations",
    };
  }
};

// Fetch all reservations.
export const manageReservationRecords = async () => {
  try {
    const snapshot = await getDocs(collection(db, COLLECTIONS.RESERVATIONS));
    const reservations = snapshot.docs.map((document) => ({
      id: document.id,
      ...document.data(),
    }));

    return { success: true, data: reservations };
  } catch (error) {
    console.error("Error fetching reservations:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch reservations",
    };
  }
};