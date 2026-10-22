import { DONATION_CATEGORIES, type DonationCategory, type DonationInput } from '@/types/donation';
import { daysFromToday, parseISODate } from '@/utils/dates';

/** Raw form state: everything is a string while the user is typing. */
export type DonationFormValues = {
  foodName: string;
  category: DonationCategory | '';
  description: string;
  quantity: string;
  collectionLocation: string;
  bestBefore: string;
};

export type DonationFormErrors = Partial<Record<keyof DonationFormValues, string>>;

export const DONATION_LIMITS = {
  foodNameMin: 2,
  foodNameMax: 50,
  descriptionMin: 10,
  descriptionMax: 250,
  quantityMin: 1,
  quantityMax: 10_000,
  locationMin: 3,
  locationMax: 80,
  bestBeforeMaxDays: 365,
} as const;

export const EMPTY_DONATION_FORM: DonationFormValues = {
  foodName: '',
  category: '',
  description: '',
  quantity: '',
  collectionLocation: '',
  bestBefore: '',
};

export function validateDonationForm(values: DonationFormValues): DonationFormErrors {
  const errors: DonationFormErrors = {};
  const L = DONATION_LIMITS;

  const foodName = values.foodName.trim();
  if (!foodName) errors.foodName = 'Please enter the food name.';
  else if (foodName.length < L.foodNameMin) errors.foodName = `Use at least ${L.foodNameMin} characters.`;
  else if (foodName.length > L.foodNameMax) errors.foodName = `Keep it under ${L.foodNameMax} characters.`;

  if (!values.category) errors.category = 'Please choose a category.';
  else if (!DONATION_CATEGORIES.includes(values.category)) errors.category = 'Please choose a valid category.';

  const description = values.description.trim();
  if (!description) errors.description = 'Please describe the food so NGOs know what to expect.';
  else if (description.length < L.descriptionMin)
    errors.description = `Add a little more detail (at least ${L.descriptionMin} characters).`;
  else if (description.length > L.descriptionMax)
    errors.description = `Keep it under ${L.descriptionMax} characters.`;

  const quantity = values.quantity.trim();
  if (!quantity) errors.quantity = 'Please enter a quantity.';
  else if (!/^\d+$/.test(quantity)) errors.quantity = 'Quantity must be a whole number.';
  else {
    const n = Number(quantity);
    if (n < L.quantityMin) errors.quantity = 'Quantity must be at least 1.';
    else if (n > L.quantityMax) errors.quantity = `Quantity can't be more than ${L.quantityMax.toLocaleString()}.`;
  }

  const location = values.collectionLocation.trim();
  if (!location) errors.collectionLocation = 'Please enter where NGOs should collect from.';
  else if (location.length < L.locationMin) errors.collectionLocation = 'Please enter a full location.';
  else if (location.length > L.locationMax)
    errors.collectionLocation = `Keep it under ${L.locationMax} characters.`;

  const bestBefore = values.bestBefore.trim();
  if (!bestBefore) errors.bestBefore = 'Please enter a best-before date.';
  else if (!parseISODate(bestBefore)) errors.bestBefore = 'Use the format YYYY-MM-DD, e.g. 2026-10-25.';
  else {
    const days = daysFromToday(bestBefore) ?? 0;
    if (days < 0) errors.bestBefore = "Best-before date can't be in the past.";
    else if (days > L.bestBeforeMaxDays) errors.bestBefore = 'Best-before date must be within the next year.';
  }

  return errors;
}

export function hasErrors(errors: DonationFormErrors): boolean {
  return Object.values(errors).some(Boolean);
}

export function toDonationInput(values: DonationFormValues): DonationInput {
  return {
    foodName: values.foodName.trim(),
    category: values.category as DonationCategory,
    description: values.description.trim(),
    quantity: Number(values.quantity.trim()),
    collectionLocation: values.collectionLocation.trim(),
    bestBefore: values.bestBefore.trim(),
  };
}

export function toFormValues(input: DonationInput): DonationFormValues {
  return {
    foodName: input.foodName,
    category: input.category,
    description: input.description,
    quantity: String(input.quantity),
    collectionLocation: input.collectionLocation,
    bestBefore: input.bestBefore,
  };
}
