import { SymbolView } from 'expo-symbols';
import type { ComponentProps } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';

import type { DonationCategory } from '@/types/donation';

type SymbolName = Exclude<ComponentProps<typeof SymbolView>['name'], string>;

/** SF Symbol on iOS, Material Symbol on Android + web (font ships with expo-symbols). */
const ICONS = {
  store: { ios: 'storefront.fill', android: 'storefront', web: 'storefront' },
  add: { ios: 'plus.circle.fill', android: 'add_circle', web: 'add_circle' },
  plus: { ios: 'plus', android: 'add', web: 'add' },
  list: { ios: 'list.bullet.rectangle.portrait', android: 'format_list_bulleted', web: 'format_list_bulleted' },
  reserved: { ios: 'bookmark.fill', android: 'bookmark_added', web: 'bookmark_added' },
  chevronRight: { ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' },
  edit: { ios: 'pencil', android: 'edit', web: 'edit' },
  cancel: { ios: 'xmark.circle', android: 'cancel', web: 'cancel' },
  close: { ios: 'xmark', android: 'close', web: 'close' },
  location: { ios: 'mappin.and.ellipse', android: 'location_on', web: 'location_on' },
  calendar: { ios: 'calendar', android: 'calendar_month', web: 'calendar_month' },
  check: { ios: 'checkmark.circle.fill', android: 'check_circle', web: 'check_circle' },
  info: { ios: 'info.circle.fill', android: 'info', web: 'info' },
  warning: { ios: 'exclamationmark.triangle.fill', android: 'warning', web: 'warning' },
  error: { ios: 'exclamationmark.circle.fill', android: 'error', web: 'error' },
  lock: { ios: 'lock.fill', android: 'lock', web: 'lock' },
  box: { ios: 'shippingbox.fill', android: 'inventory_2', web: 'inventory_2' },
  ngo: { ios: 'heart.circle.fill', android: 'volunteer_activism', web: 'volunteer_activism' },
  clock: { ios: 'clock', android: 'schedule', web: 'schedule' },
} satisfies Record<string, SymbolName>;

const CATEGORY_ICONS: Record<DonationCategory, SymbolName> = {
  Bakery: { ios: 'birthday.cake', android: 'bakery_dining', web: 'bakery_dining' },
  Produce: { ios: 'carrot', android: 'nutrition', web: 'nutrition' },
  Dairy: { ios: 'drop', android: 'water_bottle', web: 'water_bottle' },
  'Prepared Meals': { ios: 'fork.knife', android: 'soup_kitchen', web: 'soup_kitchen' },
  Pantry: { ios: 'basket', android: 'shopping_basket', web: 'shopping_basket' },
  Beverages: { ios: 'cup.and.saucer', android: 'emoji_food_beverage', web: 'emoji_food_beverage' },
  Other: { ios: 'square.grid.2x2', android: 'category', web: 'category' },
};

export type IconName = keyof typeof ICONS;

type Props = {
  name: IconName | { category: DonationCategory };
  size?: number;
  color: string;
  style?: StyleProp<ViewStyle>;
};

export function Icon({ name, size = 20, color, style }: Props) {
  const symbol = typeof name === 'string' ? ICONS[name] : CATEGORY_ICONS[name.category];
  return (
    <SymbolView
      name={symbol}
      size={size}
      tintColor={color}
      style={style}
      accessibilityElementsHidden
      importantForAccessibility="no"
    />
  );
}
