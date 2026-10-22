import { StyleSheet, View, type ViewProps } from 'react-native';

import { ServdColors, ServdRadius, ServdShadow } from '@/constants/servd-theme';

type Props = ViewProps & {
  /** surface = white card, muted = beige info card (like "Verification Status"). */
  tone?: 'surface' | 'muted';
};

export function Card({ tone = 'surface', style, ...rest }: Props) {
  return <View style={[styles.base, tone === 'muted' ? styles.muted : styles.surface, style]} {...rest} />;
}

const styles = StyleSheet.create({
  base: {
    borderRadius: ServdRadius.lg,
    padding: 20,
  },
  surface: {
    backgroundColor: ServdColors.surface,
    ...ServdShadow.card,
  },
  muted: {
    backgroundColor: ServdColors.surfaceMuted,
  },
});
