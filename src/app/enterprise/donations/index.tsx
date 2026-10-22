import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

import { DonationCard } from '@/components/enterprise/donation-card';
import { Banner } from '@/components/servd/banner';
import { Button } from '@/components/servd/button';
import { Chip } from '@/components/servd/chip';
import { Screen } from '@/components/servd/screen';
import { EmptyState, LoadingState } from '@/components/servd/states';
import { ServdColors } from '@/constants/servd-theme';
import { useEnterpriseDonations } from '@/hooks/use-donations';
import { DONATION_STATUSES, type DonationStatus } from '@/types/donation';

type Filter = 'All' | DonationStatus;
const FILTERS: Filter[] = ['All', ...DONATION_STATUSES];

const EMPTY_COPY: Record<Filter, { title: string; message: string }> = {
  All: { title: 'No donations yet', message: 'Food you list will appear here so you can track it.' },
  Available: { title: 'Nothing available right now', message: 'Donations waiting for an NGO will show here.' },
  Reserved: { title: 'No reservations', message: "When an NGO reserves your food, you'll see it here." },
  Collected: { title: 'Nothing collected yet', message: 'Donations NGOs have picked up will show here.' },
  Cancelled: { title: 'No cancelled donations', message: "Donations you cancel will show here." },
};

function isFilter(value: unknown): value is Filter {
  return typeof value === 'string' && (FILTERS as string[]).includes(value);
}

export default function MyDonationsScreen() {
  const params = useLocalSearchParams<{ status?: string }>();
  const [filter, setFilter] = useState<Filter>(isFilter(params.status) ? params.status : 'All');
  const [refreshing, setRefreshing] = useState(false);
  const { donations, isLoading, hasError, error, refresh } = useEnterpriseDonations();

  const visible = filter === 'All' ? donations : donations.filter((d) => d.status === filter);
  const countFor = (f: Filter) => (f === 'All' ? donations.length : donations.filter((d) => d.status === f).length);

  const onRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  return (
    <Screen
      navTitle="My Donations"
      title="My Donations"
      subtitle="Track the status of everything you've listed."
      headerAccessory={
        <Button
          label="New"
          icon="plus"
          compact
          onPress={() => router.push('/enterprise/create-donation')}
          accessibilityHint="Create a new donation"
        />
      }
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={ServdColors.teal} />}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filters}
        style={styles.filterScroll}
        accessibilityRole="tablist">
        {FILTERS.map((f) => (
          <Chip key={f} label={f} count={isLoading ? undefined : countFor(f)} selected={filter === f} onPress={() => setFilter(f)} />
        ))}
      </ScrollView>

      {hasError ? (
        <View style={styles.gap}>
          <Banner tone="error" title="Couldn't load your donations" message={error ?? undefined} />
          <Button label="Try again" variant="secondary" onPress={refresh} />
        </View>
      ) : isLoading ? (
        <LoadingState />
      ) : visible.length === 0 ? (
        <EmptyState
          icon={filter === 'Reserved' ? 'reserved' : 'box'}
          title={EMPTY_COPY[filter].title}
          message={EMPTY_COPY[filter].message}
          action={
            filter === 'All' || filter === 'Available' ? (
              <Button label="Create Donation" icon="add" onPress={() => router.push('/enterprise/create-donation')} />
            ) : undefined
          }
        />
      ) : (
        <View style={styles.list}>
          {visible.map((donation) => (
            <DonationCard
              key={donation.id}
              donation={donation}
              onPress={() => router.push({ pathname: '/enterprise/donations/[id]', params: { id: donation.id } })}
            />
          ))}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  filterScroll: {
    marginHorizontal: -20,
    flexGrow: 0,
  },
  filters: {
    gap: 8,
    paddingHorizontal: 20,
  },
  list: {
    gap: 16,
  },
  gap: {
    gap: 10,
  },
});
