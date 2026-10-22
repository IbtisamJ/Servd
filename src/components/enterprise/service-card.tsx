import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/servd/icon';
import { ServdColors, ServdRadius } from '@/constants/servd-theme';

type Props = {
  title: string;
  description: string;
  onPress: () => void;
  badge?: number;
};

/** Teal navigation card — same as the "NGO Services" cards on the NGO dashboard. */
export function ServiceCard({ title, description, onPress, badge }: Props) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${description}`}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <View style={styles.text}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>{title}</Text>
          {badge ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{badge}</Text>
            </View>
          ) : null}
        </View>
        <Text style={styles.description}>{description}</Text>
      </View>
      <Icon name="chevronRight" size={20} color="#FFFFFF" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: ServdColors.teal,
    borderRadius: ServdRadius.lg,
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  pressed: {
    backgroundColor: ServdColors.tealPressed,
  },
  text: {
    flex: 1,
    gap: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  description: {
    fontSize: 16,
    lineHeight: 22,
    color: 'rgba(255,255,255,0.88)',
  },
  badge: {
    minWidth: 22,
    height: 22,
    paddingHorizontal: 6,
    borderRadius: 11,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: ServdColors.teal,
  },
});
