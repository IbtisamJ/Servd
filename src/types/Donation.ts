/**
 * Donation Data Model
 *
 * Defines the structure of a donation
 * stored within Firestore.
 */

import {
    Timestamp,
} from "firebase/firestore";

import {
    DonationStatus,
} from "../constants/donationStatus";

export interface Donation {
  /**
   * Servd's logical donation identifier.
   *
   * Example:
   * DON01
   */
  donationId: string;

  /**
   * Identifies the Food Enterprise that
   * created and owns the donation.
   *
   * This establishes the Enterprise ->
   * Donation relationship.
   */
  enterpriseId: string;

  foodName: string;

  category: string;

  description: string;

  /**
   * Number of donated units/items.
   */
  quantity: number;

  collectionLocation: string;

  /**
   * Date/time by which the donation
   * should be collected.
   */
  collectionDeadline: Timestamp;

  /**
   * Date/time at which the donated
   * food expires.
   */
  expiryDate: Timestamp;

  /**
   * Current donation lifecycle state.
   */
  status: DonationStatus;

  /**
   * Date/time when the donation record
   * was originally created.
   */
  createdTimestamp: Timestamp;
}