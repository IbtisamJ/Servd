import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { onAuthStateChanged, User } from 'firebase/auth';
import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  where,
} from 'firebase/firestore';
import FontAwesome5 from '@react-native-vector-icons/fontawesome5';

import { auth, db } from '@/config/firebase';
import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';

const NOTIFICATIONS_COLLECTION = 'Notifications';

interface AppNotification {
  id: string;
  title?: string;
  message?: string;
  body?: string;
  type?: string;
  recipientId?: string;
  read?: boolean;
  isRead?: boolean;
  createdAt?: {
    toDate?: () => Date;
  } | Date | string;
}

type FilterType = 'all' | 'unread';

export default function NotificationsScreen() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    let unsubscribeNotifications: (() => void) | undefined;

    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      unsubscribeNotifications?.();
      setUser(currentUser);

      if (!currentUser) {
        setNotifications([]);
        setLoading(false);
        router.replace('../Login');
        return;
      }

      setLoading(true);

      const notificationsQuery = query(
        collection(db, NOTIFICATIONS_COLLECTION),
        where('recipientId', '==', currentUser.uid),
        orderBy('createdAt', 'desc'),
      );

      unsubscribeNotifications = onSnapshot(
        notificationsQuery,
        (snapshot) => {
          const items = snapshot.docs.map((notificationDoc) => ({
            id: notificationDoc.id,
            ...notificationDoc.data(),
          })) as AppNotification[];

          setNotifications(items);
          setLoading(false);
        },
        (error) => {
          console.error('Error loading notifications:', error);
          setLoading(false);
          Alert.alert(
            'Unable to load notifications',
            'Please check your connection and try again. If the query requires a Firestore index, check the Firebase console for a suggested index.',
          );
        },
      );
    });

    return () => {
      unsubscribeAuth();
      unsubscribeNotifications?.();
    };
  }, [router]);

  const isRead = (item: AppNotification) =>
    item.read === true || item.isRead === true;

  const unreadCount = notifications.filter(
    (item) => !isRead(item),
  ).length;

  const filteredNotifications = notifications.filter((item) =>
    filter === 'unread' ? !isRead(item) : true,
  );

  const getDate = (value: AppNotification['createdAt']) => {
    if (!value) return 'Date unavailable';

    let date: Date | null = null;

    if (value instanceof Date) {
      date = value;
    } else if (typeof value === 'string') {
      const parsed = new Date(value);
      if (!Number.isNaN(parsed.getTime())) date = parsed;
    } else if (typeof value === 'object' && value.toDate) {
      date = value.toDate();
    }

    if (!date || Number.isNaN(date.getTime())) {
      return 'Date unavailable';
    }

    return date.toLocaleString(undefined, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getIcon = (type?: string) => {
    switch (type?.toLowerCase()) {
      case 'reservation':
      case 'booking':
        return 'calendar-check';
      case 'donation':
        return 'box-open';
      case 'collection':
      case 'collected':
        return 'check-circle';
      case 'cancelled':
      case 'cancellation':
        return 'times-circle';
      default:
        return 'bell';
    }
  };

  const markAsRead = async (item: AppNotification) => {
    if (!user || isRead(item)) return;

    setUpdatingId(item.id);

    try {
      await updateDoc(
        doc(db, NOTIFICATIONS_COLLECTION, item.id),
        {
          read: true,
        },
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
      Alert.alert(
        'Update failed',
        'This notification could not be marked as read.',
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const markAllAsRead = async () => {
    if (!user || unreadCount === 0) return;

    Alert.alert(
      'Mark all as read',
      'Mark all your notifications as read?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Mark all',
          onPress: async () => {
            const unread = notifications.filter(
              (item) => !isRead(item),
            );

            try {
              await Promise.all(
                unread.map((item) =>
                  updateDoc(
                    doc(db, NOTIFICATIONS_COLLECTION, item.id),
                    { read: true },
                  ),
                ),
              );
            } catch (error) {
              console.error(
                'Error marking all notifications as read:',
                error,
              );
              Alert.alert(
                'Update failed',
                'Some notifications could not be updated. Please try again.',
              );
            }
          },
        },
      ],
    );
  };

  const renderNotification = ({ item }: { item: AppNotification }) => {
    const read = isRead(item);

    return (
      <TouchableOpacity
        style={[
          styles.notificationCard,
          !read && styles.unreadCard,
        ]}
        onPress={() => markAsRead(item)}
        activeOpacity={0.8}
        disabled={updatingId === item.id}
      >
        <View style={styles.notificationIcon}>
          <FontAwesome5
            name={getIcon(item.type)}
            iconStyle="solid"
            size={19}
            color={Colors.light.secondary}
          />
        </View>

        <View style={styles.notificationContent}>
          <View style={styles.notificationHeading}>
            <Text style={styles.notificationTitle}>
              {item.title || 'Notification'}
            </Text>

            {!read && <View style={styles.unreadDot} />}
          </View>

          <Text style={styles.notificationMessage}>
            {item.message || item.body || 'You have a new notification.'}
          </Text>

          <Text style={styles.notificationDate}>
            {getDate(item.createdAt)}
          </Text>

          {updatingId === item.id && (
            <ActivityIndicator
              size="small"
              color={Colors.light.secondary}
              style={styles.rowLoader}
            />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerTextContainer}>
            <Text style={styles.eyebrow}>STAY UP TO DATE</Text>
            <Text style={styles.title}>Notifications</Text>
          </View>

          <View style={styles.bellBadge}>
            <FontAwesome5
              name="bell"
              iconStyle="solid"
              size={22}
              color={Colors.light.primary}
            />

            {unreadCount > 0 && (
              <View style={styles.countBadge}>
                <Text style={styles.countText}>
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Text>
              </View>
            )}
          </View>
        </View>

        <Text style={styles.subtitle}>
          Updates about your donations and reservations.
        </Text>

        <View style={styles.filterRow}>
          <TouchableOpacity
            onPress={() => setFilter('all')}
            style={[
              styles.filterButton,
              filter === 'all' && styles.activeFilter,
            ]}
          >
            <Text
              style={[
                styles.filterText,
                filter === 'all' && styles.activeFilterText,
              ]}
            >
              All ({notifications.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setFilter('unread')}
            style={[
              styles.filterButton,
              filter === 'unread' && styles.activeFilter,
            ]}
          >
            <Text
              style={[
                styles.filterText,
                filter === 'unread' && styles.activeFilterText,
              ]}
            >
              Unread ({unreadCount})
            </Text>
          </TouchableOpacity>

          {unreadCount > 0 && (
            <TouchableOpacity
              style={styles.markAllButton}
              onPress={markAllAsRead}
            >
              <Text style={styles.markAllText}>Mark all read</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {loading ? (
        <View style={styles.centerState}>
          <ActivityIndicator
            size="large"
            color={Colors.light.primary}
          />
          <Text style={styles.stateText}>
            Loading notifications...
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredNotifications}
          keyExtractor={(item) => item.id}
          renderItem={renderNotification}
          contentContainerStyle={[
            styles.listContent,
            filteredNotifications.length === 0 &&
              styles.emptyListContent,
          ]}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <FontAwesome5
                  name={filter === 'unread' ? 'check' : 'bell-slash'}
                  iconStyle="solid"
                  size={28}
                  color={Colors.light.secondary}
                />
              </View>

              <Text style={styles.emptyTitle}>
                {filter === 'unread'
                  ? 'You’re all caught up'
                  : 'No notifications yet'}
              </Text>

              <Text style={styles.emptyDescription}>
                {filter === 'unread'
                  ? 'You have no unread notifications.'
                  : 'When there are updates about your account, they’ll appear here.'}
              </Text>
            </View>
          }
        />
      )}

      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.replace('/enterprises')}
        >
          <FontAwesome5
            name="home"
            iconStyle="solid"
            size={19}
            color={Colors.light.textSecondary}
          />
          <Text style={styles.navLabel}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push('/enterprises/donations')}
        >
          <FontAwesome5
            name="box-open"
            iconStyle="solid"
            size={19}
            color={Colors.light.textSecondary}
          />
          <Text style={styles.navLabel}>Donations</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push('/enterprises/reservations')}
        >
          <FontAwesome5
            name="clipboard-list"
            iconStyle="solid"
            size={19}
            color={Colors.light.textSecondary}
          />
          <Text style={styles.navLabel}>Reservations</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push('/notifications')}
        >
          <FontAwesome5
            name="bell"
            iconStyle="solid"
            size={19}
            color={Colors.light.primary}
          />
          <Text style={[styles.navLabel, styles.activeNavLabel]}>
            Alerts
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.replace('/enterprises/profile')}
        >
          <FontAwesome5
            name="user-circle"
            iconStyle="solid"
            size={19}
            color={Colors.light.textSecondary}
          />
          <Text style={styles.navLabel}>Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.two,
    backgroundColor: Colors.light.background,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTextContainer: {
    flex: 1,
  },
  eyebrow: {
    fontFamily: Fonts.button,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: Colors.light.secondary,
    marginBottom: Spacing.one,
  },
  title: {
    fontFamily: Fonts.heading,
    fontSize: 29,
    fontWeight: '700',
    color: Colors.light.text,
  },
  subtitle: {
    fontFamily: Fonts.body,
    fontSize: 14,
    lineHeight: 21,
    color: Colors.light.textSecondary,
    marginTop: Spacing.two,
  },
  bellBadge: {
    width: 52,
    height: 52,
    borderRadius: Radius.lg,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.light.backgroundElement,
  },
  countBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.light.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  countText: {
    color: '#FFFFFF',
    fontFamily: Fonts.button,
    fontSize: 10,
    fontWeight: '700',
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    marginTop: Spacing.four,
    marginBottom: Spacing.two,
    flexWrap: 'wrap',
  },
  filterButton: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Radius.md,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: Colors.light.backgroundElement,
  },
  activeFilter: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  filterText: {
    fontFamily: Fonts.button,
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.textSecondary,
  },
  activeFilterText: {
    color: '#FFFFFF',
  },
  markAllButton: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.one,
    marginLeft: 'auto',
  },
  markAllText: {
    fontFamily: Fonts.button,
    fontSize: 12,
    fontWeight: '700',
    color: Colors.light.secondary,
  },
  listContent: {
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
    paddingBottom: 120,
    width: '100%',
    maxWidth: 800,
    alignSelf: 'center',
    flexGrow: 1,
  },
  emptyListContent: {
    justifyContent: 'center',
  },
  notificationCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.three,
    padding: Spacing.three,
    marginBottom: Spacing.two,
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.light.backgroundElement,
  },
  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: Colors.light.secondary,
  },
  notificationIcon: {
    width: 42,
    height: 42,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.background,
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  notificationTitle: {
    flex: 1,
    fontFamily: Fonts.button,
    fontSize: 15,
    fontWeight: '700',
    color: Colors.light.text,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.light.primary,
  },
  notificationMessage: {
    fontFamily: Fonts.body,
    fontSize: 13,
    lineHeight: 20,
    color: Colors.light.textSecondary,
    marginTop: Spacing.one,
  },
  notificationDate: {
    fontFamily: Fonts.body,
    fontSize: 11,
    color: Colors.light.textSecondary,
    marginTop: Spacing.two,
  },
  rowLoader: {
    alignSelf: 'flex-start',
    marginTop: Spacing.two,
  },
  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
  },
  stateText: {
    fontFamily: Fonts.body,
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
  emptyState: {
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.six,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: Colors.light.backgroundElement,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.three,
  },
  emptyTitle: {
    fontFamily: Fonts.heading,
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.text,
    textAlign: 'center',
  },
  emptyDescription: {
    fontFamily: Fonts.body,
    fontSize: 14,
    lineHeight: 21,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.two,
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: Colors.light.backgroundElement,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.four,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.one,
    paddingVertical: Spacing.one,
  },
  navLabel: {
    fontFamily: Fonts.navigation,
    fontSize: 10,
    color: Colors.light.textSecondary,
  },
  activeNavLabel: {
    color: Colors.light.primary,
    fontWeight: '700',
  },
});