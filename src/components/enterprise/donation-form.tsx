import { useState, type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Banner } from '@/components/servd/banner';
import { Button } from '@/components/servd/button';
import { Card } from '@/components/servd/card';
import { Chip } from '@/components/servd/chip';
import { TextField } from '@/components/servd/text-field';
import { ServdColors, ServdType } from '@/constants/servd-theme';
import { errorMessage } from '@/hooks/use-donations';
import { DONATION_CATEGORIES, type DonationInput } from '@/types/donation';
import { addDaysISO, describeBestBefore } from '@/utils/dates';
import {
  DONATION_LIMITS,
  EMPTY_DONATION_FORM,
  hasErrors,
  toDonationInput,
  validateDonationForm,
  type DonationFormValues,
} from '@/utils/donation-validation';

type Field = keyof DonationFormValues;

type Props = {
  initialValues?: DonationFormValues;
  submitLabel: string;
  submittingLabel: string;
  onSubmit: (input: DonationInput) => Promise<void>;
  /** Edit mode: keep the submit button disabled until something changes. */
  requireChanges?: boolean;
  /** Called when submit is blocked by validation, e.g. to scroll the summary into view. */
  onInvalid?: () => void;
  footer?: ReactNode;
};

const QUICK_DATES = [
  { label: 'Today', days: 0 },
  { label: 'Tomorrow', days: 1 },
  { label: 'In 3 days', days: 3 },
  { label: 'In a week', days: 7 },
];

/** Auto-inserts dashes as the user types digits: 20261025 -> 2026-10-25 */
function formatDateInput(text: string): string {
  const digits = text.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 4) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 4)}-${digits.slice(4)}`;
  return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6)}`;
}

export function DonationForm({
  initialValues = EMPTY_DONATION_FORM,
  submitLabel,
  submittingLabel,
  onSubmit,
  requireChanges = false,
  onInvalid,
  footer,
}: Props) {
  const [values, setValues] = useState<DonationFormValues>(initialValues);
  const [touched, setTouched] = useState<Partial<Record<Field, boolean>>>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const errors = validateDonationForm(values);
  const errorCount = Object.values(errors).filter(Boolean).length;
  const isDirty = (Object.keys(values) as Field[]).some((k) => values[k] !== initialValues[k]);
  const visibleError = (field: Field) => (submitAttempted || touched[field] ? errors[field] : undefined);

  const set = <K extends Field>(field: K, value: DonationFormValues[K]) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    setSubmitError(null);
  };
  const touch = (field: Field) => () => setTouched((prev) => ({ ...prev, [field]: true }));

  const handleSubmit = async () => {
    setSubmitAttempted(true);
    if (hasErrors(errors)) {
      onInvalid?.();
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      await onSubmit(toDonationInput(values));
    } catch (error) {
      setSubmitError(errorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  const bestBeforeHint = !errors.bestBefore && values.bestBefore ? describeBestBefore(values.bestBefore) : null;

  return (
    <View style={styles.form}>
      {submitAttempted && errorCount > 0 ? (
        <Banner
          tone="error"
          title={errorCount === 1 ? '1 field needs your attention' : `${errorCount} fields need your attention`}
          message="Check the fields highlighted in red below."
        />
      ) : null}

      <Card style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>The food</Text>
          <Text style={styles.sectionSubtitle}>What are you donating?</Text>
        </View>

        <TextField
          label="Food name"
          placeholder="e.g. Fresh Bread"
          value={values.foodName}
          onChangeText={(t) => set('foodName', t)}
          onBlur={touch('foodName')}
          error={visibleError('foodName')}
          maxLength={DONATION_LIMITS.foodNameMax}
          autoCapitalize="words"
          returnKeyType="next"
        />

        <View style={styles.group}>
          <Text style={styles.label}>Category</Text>
          <View style={styles.chips} accessibilityRole="radiogroup" accessibilityLabel="Category">
            {DONATION_CATEGORIES.map((category) => (
              <Chip
                key={category}
                label={category}
                category={category}
                selected={values.category === category}
                invalid={!!visibleError('category')}
                onPress={() => {
                  set('category', category);
                  touch('category')();
                }}
              />
            ))}
          </View>
          {visibleError('category') ? <Text style={styles.error}>{visibleError('category')}</Text> : null}
        </View>

        <TextField
          label="Description"
          placeholder="e.g. 20 loaves of white and brown bread baked this morning."
          value={values.description}
          onChangeText={(t) => set('description', t)}
          onBlur={touch('description')}
          error={visibleError('description')}
          helper="Mention packaging, storage needs or allergens."
          maxLength={DONATION_LIMITS.descriptionMax}
          showCount
          multiline
        />
      </Card>

      <Card style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Collection</Text>
          <Text style={styles.sectionSubtitle}>How much, where and by when.</Text>
        </View>

        <TextField
          label="Quantity"
          placeholder="e.g. 20"
          value={values.quantity}
          onChangeText={(t) => set('quantity', t.replace(/[^\d]/g, ''))}
          onBlur={touch('quantity')}
          error={visibleError('quantity')}
          helper="Number of items, portions, loaves or packs."
          keyboardType="number-pad"
          inputMode="numeric"
          maxLength={5}
        />

        <TextField
          label="Collection location"
          placeholder="e.g. Grassy Park"
          value={values.collectionLocation}
          onChangeText={(t) => set('collectionLocation', t)}
          onBlur={touch('collectionLocation')}
          error={visibleError('collectionLocation')}
          helper="Suburb or address where the NGO will collect."
          maxLength={DONATION_LIMITS.locationMax}
          autoCapitalize="words"
        />

        <View style={styles.group}>
          <TextField
            label="Best before"
            placeholder="YYYY-MM-DD"
            value={values.bestBefore}
            onChangeText={(t) => set('bestBefore', formatDateInput(t))}
            onBlur={touch('bestBefore')}
            error={visibleError('bestBefore')}
            helper={
              bestBeforeHint ? (
                <Text style={[styles.caption, { color: ServdColors.olive }]}>{bestBeforeHint}</Text>
              ) : (
                'The last day the food is good to eat.'
              )
            }
            keyboardType="number-pad"
            inputMode="numeric"
            maxLength={10}
          />
          <View style={styles.chips}>
            {QUICK_DATES.map(({ label, days }) => {
              const iso = addDaysISO(days);
              return (
                <Chip
                  key={label}
                  label={label}
                  selected={values.bestBefore === iso}
                  onPress={() => {
                    set('bestBefore', iso);
                    touch('bestBefore')();
                  }}
                />
              );
            })}
          </View>
        </View>
      </Card>

      {submitError ? <Banner tone="error" title="Couldn't save donation" message={submitError} /> : null}

      <View style={styles.actions}>
        <Button
          label={submitLabel}
          loadingLabel={submittingLabel}
          loading={submitting}
          disabled={requireChanges && !isDirty}
          onPress={handleSubmit}
        />
        {requireChanges && !isDirty ? (
          <Text style={[styles.caption, styles.center]}>Make a change to enable saving.</Text>
        ) : null}
        {footer}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: 20,
  },
  section: {
    gap: 20,
  },
  sectionHeader: {
    gap: 2,
  },
  sectionTitle: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '600',
    color: ServdColors.text,
  },
  sectionSubtitle: {
    ...ServdType.bodySecondary,
  },
  group: {
    gap: 10,
  },
  label: {
    ...ServdType.label,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  error: {
    fontSize: 13,
    lineHeight: 18,
    color: ServdColors.red,
  },
  caption: {
    ...ServdType.caption,
  },
  center: {
    textAlign: 'center',
  },
  actions: {
    gap: 10,
  },
});
