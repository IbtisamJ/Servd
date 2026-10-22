import { Stack } from 'expo-router';
import type { ReactNode, RefObject } from 'react';
import { ScrollView, StyleSheet, Text, View, type ScrollViewProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ServdColors, ServdType } from '@/constants/servd-theme';

type Props = {
  /** Shown in the navigation bar (and as the back label on the next screen). */
  navTitle: string;
  title?: string;
  eyebrow?: string;
  subtitle?: string;
  headerAccessory?: ReactNode;
  children: ReactNode;
  refreshControl?: ScrollViewProps['refreshControl'];
  scrollRef?: RefObject<ScrollView | null>;
};

/** Cream page with the big teal title used across the NGO screens. */
export function Screen({
  navTitle,
  title,
  eyebrow,
  subtitle,
  headerAccessory,
  children,
  refreshControl,
  scrollRef,
}: Props) {
  const insets = useSafeAreaInsets();

  return (
    <>
      <Stack.Screen options={{ title: navTitle }} />
      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        automaticallyAdjustKeyboardInsets
        refreshControl={refreshControl}>
        {title ? (
          <View style={styles.header}>
            {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
            <View style={styles.titleRow}>
              <Text style={styles.title} accessibilityRole="header">
                {title}
              </Text>
              {headerAccessory}
            </View>
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          </View>
        ) : null}
        {children}
      </ScrollView>
    </>
  );
}

export function SectionTitle({ children, accessory }: { children: string; accessory?: ReactNode }) {
  return (
    <View style={styles.sectionRow}>
      <Text style={styles.sectionTitle} accessibilityRole="header">
        {children}
      </Text>
      {accessory}
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: ServdColors.background,
  },
  content: {
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 20,
  },
  header: {
    gap: 6,
    marginBottom: 4,
  },
  eyebrow: {
    ...ServdType.eyebrow,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  title: {
    ...ServdType.pageTitle,
    flexShrink: 1,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 23,
    color: ServdColors.textSecondary,
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
    marginBottom: -8,
  },
  sectionTitle: {
    ...ServdType.sectionTitle,
  },
});
