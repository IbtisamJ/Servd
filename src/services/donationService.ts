/**
 * Donation Service
 *
 * Handles the Firestore backend operations for
 * food donations in the Servd application.
 *
 * Responsibilities:
 * - Create donations
 * - Read donations
 * - Retrieve enterprise-specific donations
 * - Update donation details
 * - Cancel donations
 * - Update donation status
 * - Identify and mark expired donations
 */

import {
    addDoc,
    collection,
    doc,
    getDoc,
    getDocs,
    query,
    serverTimestamp,
    Timestamp,
    updateDoc,
    where,
    writeBatch,
} from "firebase/firestore";

import { db } from "../config/firebase";

import {
    DONATION_STATUS,
    DonationStatus,
} from "../constants/donationStatus";

/**
 * Input structure used when creating
 * a new donation.
 *
 * Firestore generates the created timestamp
 * on the server rather than trusting the device clock.
 */
export interface CreateDonationInput {
  donationId: string;
  enterpriseId: string;
  foodName: string;
  category: string;
  description: string;
  quantity: number;
  collectionLocation: string;
  collectionDeadline: Timestamp;
  expiryDate: Timestamp;
}

/**
 * Input structure for editable donation fields.
 *
 * Status, donationId, enterpriseId and the original
 * created timestamp are intentionally excluded from
 * general editing.
 */
export interface UpdateDonationInput {
  foodName?: string;
  category?: string;
  description?: string;
  quantity?: number;
  collectionLocation?: string;
  collectionDeadline?: Timestamp;
  expiryDate?: Timestamp;
}

/**
 * Performs basic server-side/service validation
 * before a donation is written to Firestore.
 */
const validateDonation = (
  donation: CreateDonationInput
) => {
  if (!donation.donationId.trim()) {
    throw new Error(
      "Donation ID is required."
    );
  }

  if (!donation.enterpriseId.trim()) {
    throw new Error(
      "Enterprise ID is required."
    );
  }

  if (!donation.foodName.trim()) {
    throw new Error(
      "Food name is required."
    );
  }

  if (!donation.category.trim()) {
    throw new Error(
      "Donation category is required."
    );
  }

  if (
    !Number.isFinite(donation.quantity) ||
    donation.quantity <= 0
  ) {
    throw new Error(
      "Quantity must be greater than zero."
    );
  }

  if (
    !donation.collectionLocation.trim()
  ) {
    throw new Error(
      "Collection location is required."
    );
  }

  if (
    donation.expiryDate.toMillis() <=
    Date.now()
  ) {
    throw new Error(
      "Expiry date must be in the future."
    );
  }
};

/**
 * Creates a new donation.
 *
 * Every newly created donation begins
 * with the Available status.
 *
 * enterpriseId creates the relationship
 * between the Food Enterprise and Donation.
 */
export const createDonation = async (
  donation: CreateDonationInput
) => {
  validateDonation(donation);

  return await addDoc(
    collection(db, "Donations"),
    {
      ...donation,

      status:
        DONATION_STATUS.AVAILABLE,

      createdTimestamp:
        serverTimestamp(),
    }
  );
};

/**
 * Retrieves every donation stored
 * in the Donations collection.
 */
export const getDonations =
  async () => {
    const snapshot =
      await getDocs(
        collection(db, "Donations")
      );

    return snapshot.docs.map(
      (donationDocument) => ({
        id:
          donationDocument.id,

        ...donationDocument.data(),
      })
    );
  };

/**
 * Retrieves one donation using its actual
 * Firestore document ID.
 */
export const getDonationByDocumentId =
  async (
    donationDocumentId: string
  ) => {
    const donationRef = doc(
      db,
      "Donations",
      donationDocumentId
    );

    const snapshot =
      await getDoc(donationRef);

    if (!snapshot.exists()) {
      throw new Error(
        "Donation could not be found."
      );
    }

    return {
      id: snapshot.id,
      ...snapshot.data(),
    };
  };

/**
 * Retrieves donations belonging to
 * a particular Food Enterprise.
 *
 * This implements the Enterprise ->
 * Donation relationship.
 */
export const getEnterpriseDonations =
  async (
    enterpriseId: string
  ) => {
    if (!enterpriseId.trim()) {
      throw new Error(
        "Enterprise ID is required."
      );
    }

    const enterpriseQuery = query(
      collection(db, "Donations"),

      where(
        "enterpriseId",
        "==",
        enterpriseId
      )
    );

    const snapshot =
      await getDocs(
        enterpriseQuery
      );

    return snapshot.docs.map(
      (donationDocument) => ({
        id:
          donationDocument.id,

        ...donationDocument.data(),
      })
    );
  };

/**
 * Updates an existing donation.
 *
 * Business rule:
 * A Food Enterprise may only edit a donation
 * while the donation is still Available.
 */
export const updateDonation = async (
  donationDocumentId: string,
  updates: UpdateDonationInput
) => {
  const donationRef = doc(
    db,
    "Donations",
    donationDocumentId
  );

  const snapshot =
    await getDoc(donationRef);

  if (!snapshot.exists()) {
    throw new Error(
      "Donation could not be found."
    );
  }

  const donation =
    snapshot.data();

  if (
    donation.status !==
    DONATION_STATUS.AVAILABLE
  ) {
    throw new Error(
      "Only available donations can be edited."
    );
  }

  /**
   * Validate certain editable values
   * when they are provided.
   */
  if (
    updates.foodName !== undefined &&
    !updates.foodName.trim()
  ) {
    throw new Error(
      "Food name cannot be empty."
    );
  }

  if (
    updates.quantity !== undefined &&
    (
      !Number.isFinite(
        updates.quantity
      ) ||
      updates.quantity <= 0
    )
  ) {
    throw new Error(
      "Quantity must be greater than zero."
    );
  }

  await updateDoc(
    donationRef, 
    {...updates}
  );
};

/**
 * Cancels a donation without deleting
 * its Firestore record.
 *
 * Business rule:
 * Only Available donations can be cancelled
 * by the Food Enterprise.
 */
export const cancelDonation = async (
  donationDocumentId: string
) => {
  const donationRef = doc(
    db,
    "Donations",
    donationDocumentId
  );

  const snapshot =
    await getDoc(donationRef);

  if (!snapshot.exists()) {
    throw new Error(
      "Donation could not be found."
    );
  }

  const donation =
    snapshot.data();

  if (
    donation.status !==
    DONATION_STATUS.AVAILABLE
  ) {
    throw new Error(
      "Only available donations can be cancelled."
    );
  }

  await updateDoc(
    donationRef,
    {
      status:
        DONATION_STATUS.CANCELLED,
    }
  );
};

/**
 * Updates the lifecycle status of a donation.
 *
 * This is intended for controlled business logic
 * such as reservation, collection or administrative
 * processes rather than unrestricted UI editing.
 */
export const updateDonationStatus =
  async (
    donationDocumentId: string,
    status: DonationStatus
  ) => {
    const donationRef = doc(
      db,
      "Donations",
      donationDocumentId
    );

    const snapshot =
      await getDoc(donationRef);

    if (!snapshot.exists()) {
      throw new Error(
        "Donation could not be found."
      );
    }

    await updateDoc(
      donationRef,
      {
        status,
      }
    );
  };

/**
 * Finds Available donations whose collection
 * deadline has already passed and marks them
 * as Expired.
 *
 * Reserved or Collected donations are not changed
 * by this function.
 */
export const markExpiredDonations =
  async () => {
    const availableQuery = query(
      collection(db, "Donations"),

      where(
        "status",
        "==",
        DONATION_STATUS.AVAILABLE
      )
    );

    const snapshot =
      await getDocs(
        availableQuery
      );

    const now =
      Date.now();

    const expiredDocuments =
      snapshot.docs.filter(
        (donationDocument) => {
          const donation =
            donationDocument.data();

          const deadline =
            donation.collectionDeadline;

          /**
           * Ignore malformed records here.
           * Missing/invalid values should be handled
           * separately during validation/testing.
           */
          if (
            !(
              deadline instanceof
              Timestamp
            )
          ) {
            return false;
          }

          return (
            deadline.toMillis() <
            now
          );
        }
      );

    if (
      expiredDocuments.length === 0
    ) {
      return 0;
    }

    /**
     * Batch the updates so the matching
     * donation records are written together.
     */
    const batch =
      writeBatch(db);

    expiredDocuments.forEach(
      (donationDocument) => {
        batch.update(
          donationDocument.ref,
          {
            status:
              DONATION_STATUS.EXPIRED,
          }
        );
      }
    );

    await batch.commit();

    return expiredDocuments.length;
  };