/**
 * Donation Type Definition
 *
 * Defines the TypeScript structure used to represent a food donation
 * throughout the application.
 *
 * Responsibilities:
 * - Specifies donation identification fields.
 * - Defines enterprise ownership and food information.
 * - Defines quantity and collection location information.
 * - Defines collection deadline and expiry date fields.
 * - Restricts donation status to the supported donation status values.
 * - Defines the donation creation timestamp.
 */

import { DONATION_STATUS } from "../constants/roles";

export interface Donation {
  donationId?: string;
  enterpriseId: string;
  foodName: string;
  category: string;
  description: string;
  quantity: number;
  collectionLocation: string;
  collectionDeadline: Date;
  expiryDate: Date;
  status: (typeof DONATION_STATUS)[keyof typeof DONATION_STATUS];
  createdTimestamp: Date;
}