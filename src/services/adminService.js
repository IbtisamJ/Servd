import { collection, doc, getDocs, query, serverTimestamp, updateDoc, where } from 'firebase/firestore';
import { db } from '../firebaseConfig.js'; // Adjust path if needed

// 1. Approve/reject NGOs
export const approveOrRejectNGO = async (ngoUserId, newStatus) => {
  try {
    const ngoRef = doc(db, 'NGOs', ngoUserId);
    
    await updateDoc(ngoRef, {
      verificationStatus: newStatus, // 'Approved' or 'Rejected'
      updatedTimestamp: serverTimestamp()
    });

    return { success: true };
  } catch (error) {
    console.error("Error updating NGO status:", error.message);
    return { success: false, error: error.message };
  }
};

// Fetch pending NGOs
export const getPendingNGOs = async () => {
  try {
    const ngosRef = collection(db, 'NGOs');
    const q = query(ngosRef, where('verificationStatus', '==', 'Pending'));
    const querySnapshot = await getDocs(q);

    const pendingNGOs = [];
    querySnapshot.forEach((docSnap) => {
      pendingNGOs.push({ id: docSnap.id, ...docSnap.data() });
    });

    return { success: true, data: pendingNGOs };
  } catch (error) {
    console.error("Error fetching pending NGOs:", error.message);
    return { success: false, error: error.message };
  }
};

// Manage users
export const manageUsers = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'Users'));
    const users = querySnapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));
    return { success: true, data: users };
  } catch (error) {
    console.error("Error managing users:", error.message);
    return { success: false, error: error.message };
  }
};

// Manage donation records
export const manageDonationRecords = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'Donations'));
    const donations = querySnapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));
    return { success: true, data: donations };
  } catch (error) {
    console.error("Error managing donation records:", error.message);
    return { success: false, error: error.message };
  }
};