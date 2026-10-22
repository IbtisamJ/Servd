import { StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/servd/icon';
import { ServdColors } from '@/constants/servd-theme';
import type { TimelineStep } from '@/utils/donation-status';

const DOT = 22;

export function StatusTimeline({ steps }: { steps: TimelineStep[] }) {
  return (
    <View accessibilityRole="list">
      {steps.map((step, i) => {
        const last = i === steps.length - 1;
        const color =
          step.state === 'cancelled'
            ? ServdColors.red
            : step.state === 'done'
              ? ServdColors.olive
              : step.state === 'current'
                ? ServdColors.teal
                : ServdColors.borderStrong;
        const nextDone = !last && steps[i + 1].state !== 'upcoming';

        return (
          <View key={step.key} style={styles.row} accessibilityLabel={`${step.label}${step.detail ? `, ${step.detail}` : ''}`}>
            <View style={styles.rail}>
              {step.state === 'done' ? (
                <Icon name="check" size={DOT} color={color} />
              ) : step.state === 'cancelled' ? (
                <Icon name="cancel" size={DOT} color={color} />
              ) : (
                <View style={[styles.ring, { borderColor: color }]}>
                  {step.state === 'current' ? <View style={[styles.core, { backgroundColor: color }]} /> : null}
                </View>
              )}
              {!last ? (
                <View
                  style={[
                    styles.line,
                    { backgroundColor: nextDone ? ServdColors.olive : ServdColors.border },
                  ]}
                />
              ) : null}
            </View>
            <View style={[styles.text, !last && styles.textSpacing]}>
              <Text
                style={[
                  styles.label,
                  step.state === 'upcoming' && styles.labelUpcoming,
                  step.state === 'cancelled' && { color: ServdColors.red },
                ]}>
                {step.label}
              </Text>
              {step.detail ? <Text style={styles.detail}>{step.detail}</Text> : null}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 14,
  },
  rail: {
    width: DOT,
    alignItems: 'center',
  },
  ring: {
    width: DOT - 4,
    height: DOT - 4,
    marginTop: 2,
    borderRadius: DOT,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  core: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  line: {
    width: 2,
    flex: 1,
    minHeight: 18,
    marginVertical: 3,
    borderRadius: 1,
  },
  text: {
    flex: 1,
    paddingTop: 1,
  },
  textSpacing: {
    paddingBottom: 16,
  },
  label: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '600',
    color: ServdColors.text,
  },
  labelUpcoming: {
    fontWeight: '400',
    color: ServdColors.textMuted,
  },
  detail: {
    fontSize: 14,
    lineHeight: 19,
    color: ServdColors.textSecondary,
  },
});
