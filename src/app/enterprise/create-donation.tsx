import { router } from 'expo-router';
import { useRef } from 'react';
import type { ScrollView } from 'react-native';

import { DonationForm } from '@/components/enterprise/donation-form';
import { Screen } from '@/components/servd/screen';
import { createDonation, setDonationNotice } from '@/hooks/use-donations';
import type { DonationInput } from '@/types/donation';

export default function CreateDonationScreen() {
  const scrollRef = useRef<ScrollView>(null);

  const handleSubmit = async (input: DonationInput) => {
    const donation = await createDonation(input);
    setDonationNotice(donation.id, 'created');
    // Replace so "back" from the new donation goes to wherever the user came from, not an empty form.
    router.replace({ pathname: '/enterprise/donations/[id]', params: { id: donation.id } });
  };

  return (
    <Screen
      navTitle="Create Donation"
      eyebrow="New donation"
      title="Create Donation"
      subtitle="Tell NGOs what you have. As soon as it's listed they can reserve it for collection."
      scrollRef={scrollRef}>
      <DonationForm
        submitLabel="List Donation"
        submittingLabel="Listing donation…"
        onSubmit={handleSubmit}
        onInvalid={() => scrollRef.current?.scrollTo({ y: 0, animated: true })}
      />
    </Screen>
  );
}
