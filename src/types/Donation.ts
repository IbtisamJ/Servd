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
