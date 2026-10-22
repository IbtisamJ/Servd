import { router, useLocalSearchParams } from 'expo-router';
import { useRef } from 'react';
import type { ScrollView } from 'react-native';

import { DonationForm } from '@/components/enterprise/donation-form';
import { Banner } from '@/components/servd/banner';
import { Button } from '@/components/servd/button';
import { Screen } from '@/components/servd/screen';
import { EmptyState, LoadingState } from '@/components/servd/states';
import { setDonationNotice, updateDonation, useDonation } from '@/hooks/use-donations';
import type { DonationInput } from '@/types/donation';
import { canEditDonation } from '@/utils/donation-status';
import { toFormValues } from '@/utils/donation-validation';

export default function EditDonationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { donation, isLoading, notFound } = useDonation(id);
  const scrollRef = useRef<ScrollView>(null);

  if (!donation) {
    return (
      <Screen navTitle="Edit Donation" title="Edit Donation">
        {isLoading ? (
          <LoadingState label="Loading donation…" />
        ) : (
          <EmptyState
            icon="error"
            title={notFound ? 'Donation not found' : "Couldn't load this donation"}
            action={<Button label="Back to My Donations" onPress={() => router.replace('/enterprise/donations')} />}
          />
        )}
      </Screen>
    );
  }

  if (!canEditDonation(donation)) {
    return (
      <Screen navTitle="Edit Donation" title="Edit Donation">
        <Banner
          tone="warning"
          icon="lock"
          title={`This donation is ${donation.status.toLowerCase()}`}
          message={
            donation.status === 'Reserved'
              ? `${donation.reservation?.ngoName ?? 'An NGO'} has reserved it, so the details can't be changed. You can still cancel it from the details screen.`
              : 'Only available donations can be edited.'
          }
        />
        <Button label="Back to Donation Details" variant="secondary" onPress={() => router.back()} />
      </Screen>
    );
  }

  const handleSubmit = async (input: DonationInput) => {
    await updateDonation(donation.id, input);
    setDonationNotice(donation.id, 'updated');
    router.back();
  };

  return (
    <Screen
      navTitle="Edit Donation"
      eyebrow={`Donation ${donation.id}`}
      title="Edit Donation"
      subtitle="You can edit a donation until an NGO reserves it."
      scrollRef={scrollRef}>
      <DonationForm
        initialValues={toFormValues(donation)}
        submitLabel="Save Changes"
        submittingLabel="Saving…"
        requireChanges
        onSubmit={handleSubmit}
        onInvalid={() => scrollRef.current?.scrollTo({ y: 0, animated: true })}
        footer={<Button label="Discard Changes" variant="ghost" onPress={() => router.back()} />}
      />
    </Screen>
  );
}
