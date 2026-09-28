// Notification banner at the top of the screen. Alerts stay until dismissed.
// Reminders hide after 8 seconds, unless a screen reader is on (WCAG 2.2.1:
// people need enough time to read).
import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { subscribe } from '../lib/notifications';
import { useTheme } from 'react-native-paper';
import { T } from './ui';
import { space, TOUCH } from '../theme';

const WHITE = '#ffffff';

export default function NotificationBanner() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors } = useTheme();
  const [queue, setQueue] = useState([]);
  const screenReader = useRef(false);
  const current = queue[0];

  useEffect(() => {
    AccessibilityInfo.isScreenReaderEnabled().then((on) => (screenReader.current = on));
    const sub = AccessibilityInfo.addEventListener('screenReaderChanged', (on) => (screenReader.current = on));
    const unsub = subscribe((item) =>
      // Alerts jump ahead of reminders.
      setQueue((q) => (item.kind === 'alert' ? [item, ...q] : [...q, item]))
    );
    return () => {
      sub.remove();
      unsub();
    };
  }, []);

  useEffect(() => {
    if (!current) return;
    AccessibilityInfo.announceForAccessibility(`${current.title}. ${current.body}`);
    if (current.kind === 'alert' || screenReader.current) return;
    const t = setTimeout(() => dismiss(current.id), 8000);
    return () => clearTimeout(t);
  }, [current?.id]);

  const dismiss = (id) => setQueue((q) => q.filter((n) => n.id !== id));

  if (!current) return null;

  const isAlert = current.kind === 'alert';
  const target = current.alertId ? `/alert/${current.alertId}` : current.href;
  const open = () => {
    dismiss(current.id);
    if (target) router.push(target);
  };

  return (
    <View
      pointerEvents="box-none"
      style={{ position: 'absolute', top: insets.top + space.sm, left: space.md, right: space.md, zIndex: 1000, elevation: 10 }}
    >
      <View
        accessibilityLiveRegion={isAlert ? 'assertive' : 'polite'}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: space.sm,
          backgroundColor: isAlert ? colors.emergency : colors.emphasis,
          borderRadius: 14,
          paddingLeft: space.lg,
          paddingVertical: space.sm,
          shadowColor: '#000',
          shadowOpacity: 0.25,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 3 },
        }}
      >
        <Ionicons name={isAlert ? 'warning' : 'notifications'} size={24} color={WHITE} />
        <Pressable
          onPress={open}
          disabled={!target}
          accessibilityRole={target ? 'button' : 'text'}
          accessibilityLabel={`${current.title}. ${current.body}`}
          accessibilityHint={target ? 'Opens details' : undefined}
          style={{ flex: 1, minHeight: TOUCH, justifyContent: 'center', paddingVertical: 4 }}
        >
          <T variant="bodyBold" style={{ color: WHITE }}>{current.title}</T>
          <T variant="small" style={{ color: WHITE }}>{current.body}</T>
          {queue.length > 1 ? (
            <T variant="caption" style={{ color: WHITE }}>{queue.length - 1} more</T>
          ) : null}
        </Pressable>
        <Pressable
          onPress={() => dismiss(current.id)}
          accessibilityRole="button"
          accessibilityLabel="Dismiss notification"
          style={{ width: TOUCH, height: TOUCH, alignItems: 'center', justifyContent: 'center' }}
        >
          <Ionicons name="close" size={24} color={WHITE} />
        </Pressable>
      </View>
    </View>
  );
}
