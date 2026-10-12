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
  status: string;
  createdTimestamp: Date;
}