import { doc, runTransaction, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebaseConfig'; // Adjust this import path if your Firebase config is located elsewhere

// NGO can reserve an available food donation securely
export const createReservation = async (donationId, ngoId, enterpriseId) => {
  const donationRef = doc(db, 'Donations', donationId);
  const reservationRef = doc(db, 'Reservations', `res_${donationId}`);

  try {
    await runTransaction(db, async (transaction) => {
      const donationDoc = await transaction.get(donationRef);

      if (!donationDoc.exists()) {
        throw new Error("Donation no longer exists.");
      }

      // Prevent duplicate reservations
      if (donationDoc.data().status !== 'Available') {
        throw new Error("This donation has already been reserved.");
      }

      // Update Donation status to 'Reserved'
      transaction.update(donationRef, {
        status: 'Reserved',
        updatedTimestamp: serverTimestamp()
      });

      // Create the Reservation record
      transaction.set(reservationRef, {
        reservationId: reservationRef.id,
        donationId: donationId,
        ngoId: ngoId,
        enterpriseId: enterpriseId,
        status: 'Active',
        createdTimestamp: serverTimestamp(),
        updatedTimestamp: serverTimestamp()
      });
    });

    return { success: true };
  } catch (error) {
    console.error("Reservation failed:", error.message);
    return { success: false, error: error.message };
  }
};

// Update reservation status (e.g., 'Collected' or 'Cancelled')
export const updateReservationStatus = async (reservationId, donationId, newStatus) => {
  const reservationRef = doc(db, 'Reservations', reservationId);
  const donationRef = doc(db, 'Donations', donationId);

  try {
    await runTransaction(db, async (transaction) => {
      transaction.update(reservationRef, {
        status: newStatus,
        updatedTimestamp: serverTimestamp()
      });

      // If cancelled, make the donation available again
      if (newStatus === 'Cancelled') {
        transaction.update(donationRef, {
          status: 'Available',
          updatedTimestamp: serverTimestamp()
        });
      } else if (newStatus === 'Collected') {
        transaction.update(donationRef, {
          status: 'Collected',
          updatedTimestamp: serverTimestamp()
        });
      }
    });

    return { success: true };
  } catch (error) {
    console.error("Error updating status:", error.message);
    return { success: false, error: error.message };
  }
};