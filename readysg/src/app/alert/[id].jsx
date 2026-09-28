// Full-screen simulated alert, like SG Alert. It has to be acknowledged.
import { useEffect } from 'react';
import { AccessibilityInfo, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Avatar, useTheme } from 'react-native-paper';
import { useAlerts } from '../../context/AlertsContext';
import { T, H, Card, Button } from '../../components/ui';
import { formatTime } from '../../lib/dates';
import { space } from '../../theme';

const DEFAULT_ACTIONS = {
  haze: [
    'Reduce prolonged or strenuous outdoor activity.',
    'Elderly, children, pregnant women and people with heart or lung conditions: minimise outdoor activity.',
    'Keep windows and doors closed.',
    'Keep needed medication within reach.',
    'Check on vulnerable family and neighbours.',
  ],
  flood: [
    'Move to higher ground.',
    'Grab your Ready Bag and be ready to evacuate if told to.',
    'Do not walk through moving water above your ankles.',
    'Do not drive through water above kerb height.',
  ],
  fire: [
    'Evacuate if you are on the fire floor or up to two floors above it.',
    'Use the stairs, never the lift.',
    'Stay low. Call 995.',
  ],
  default: ['Stay calm.', 'Follow instructions from the authorities.', 'Check official sources for updates.'],
};

export default function AlertScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { colors } = useTheme();
  const { alerts } = useAlerts();
  const alert = alerts.find((a) => a.id === id);

  // Read it aloud to screen-reader users when it opens.
  useEffect(() => {
    if (alert) AccessibilityInfo.announceForAccessibility(`Simulated alert. ${alert.title}. ${alert.body}`);
  }, [alert?.id]);

  const close = () => (router.canGoBack() ? router.back() : router.replace('/'));
  const actions = alert?.actions?.length ? alert.actions : DEFAULT_ACTIONS[alert?.category] ?? DEFAULT_ACTIONS.default;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ backgroundColor: colors.emergency, padding: space.md, paddingHorizontal: space.xl }}>
        <T variant="bodyBold" style={{ color: '#ffffff' }}>SIMULATED ALERT: for practice only</T>
      </View>

      {!alert ? (
        <View style={{ padding: space.xl, gap: space.md }}>
          <H level={1}>This alert has ended</H>
          <T>It may have expired or been withdrawn.</T>
          <Button mode="contained" onPress={close}>Close</Button>
        </View>
      ) : (
        <View style={{ flex: 1, padding: space.xl, gap: space.md }}>
          <Avatar.Icon size={64} icon="alert" color={colors.error} style={{ backgroundColor: colors.errorContainer }} />
          <T variant="small" style={{ color: colors.onSurfaceVariant }}>
            {alert.createdAtMs ? formatTime(alert.createdAtMs) : ''}
            {alert.area ? `, ${alert.area}` : ''}
          </T>
          <H level={1}>{alert.title}</H>
          <T>{alert.body}</T>
          <Card>
            <H>What to do now</H>
            {actions.map((action, i) => (
              <View key={i} style={{ flexDirection: 'row', gap: space.sm }}>
                <T accessibilityElementsHidden importantForAccessibility="no">{'•'}</T>
                <T style={{ flex: 1 }}>{action}</T>
              </View>
            ))}
          </Card>
          <View style={{ marginTop: 'auto', gap: space.sm }}>
            {alert.guideId ? (
              <Button mode="contained" onPress={() => router.replace(`/guide/${alert.guideId}`)}>Open the guide</Button>
            ) : null}
            <Button mode="outlined" onPress={close}>I understand</Button>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}
