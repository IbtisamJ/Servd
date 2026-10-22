import { Pressable, StyleSheet, Text } from 'react-native';

import { Icon } from '@/components/servd/icon';
import { ServdColors, ServdRadius } from '@/constants/servd-theme';
import type { DonationCategory } from '@/types/donation';

type Props = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  count?: number;
  category?: DonationCategory;
  invalid?: boolean;
};

export function Chip({ label, selected = false, onPress, count, category, invalid = false }: Props) {
  const fg = selected ? ServdColors.teal : ServdColors.text;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={count !== undefined ? `${label}, ${count}` : label}
      style={({ pressed }) => [
        styles.chip,
        selected && styles.selected,
        invalid && !selected && styles.invalid,
        pressed && !selected && styles.pressed,
      ]}>
      {category ? <Icon name={{ category }} size={16} color={selected ? ServdColors.teal : ServdColors.textSecondary} /> : null}
      <Text style={[styles.label, { color: fg }, selected && styles.labelSelected]}>{label}</Text>
      {count !== undefined ? (
        <Text style={[styles.count, selected && styles.countSelected]}>{count}</Text>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: 40,
    paddingHorizontal: 14,
    borderRadius: ServdRadius.pill,
    borderWidth: 1,
    borderColor: ServdColors.border,
    backgroundColor: ServdColors.surface,
  },
  selected: {
    borderColor: ServdColors.teal,
    borderWidth: 1.5,
    backgroundColor: ServdColors.tealTint,
  },
  invalid: {
    borderColor: ServdColors.red,
  },
  pressed: {
    backgroundColor: ServdColors.background,
  },
  label: {
    fontSize: 15,
    fontWeight: '500',
  },
  labelSelected: {
    fontWeight: '600',
  },
  count: {
    fontSize: 13,
    fontWeight: '600',
    color: ServdColors.textSecondary,
    fontVariant: ['tabular-nums'],
  },
  countSelected: {
    color: ServdColors.teal,
  },
});
