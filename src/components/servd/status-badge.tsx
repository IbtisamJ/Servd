import { StyleSheet, Text, View } from 'react-native';

import type { StatusTone } from '@/utils/donation-status';

type Props = {
  label: string;
  tone: StatusTone;
  size?: 'sm' | 'md';
};

/** Pill with a coloured dot, styled like the "Pending Verification" pill on the auth screens. */
export function StatusBadge({ label, tone, size = 'sm' }: Props) {
  return (
    <View
      style={[styles.pill, size === 'md' && styles.pillMd, { backgroundColor: tone.tint }]}
      accessibilityLabel={`Status: ${label}`}>
      <View style={[styles.dot, { backgroundColor: tone.color }]} />
      <Text style={[styles.label, size === 'md' && styles.labelMd, { color: tone.color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  pillMd: {
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
  },
  labelMd: {
    fontSize: 15,
  },
});
