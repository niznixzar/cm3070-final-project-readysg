import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Chip, Icon, ProgressBar, useTheme } from 'react-native-paper';
import { useProgress } from '../../context/ProgressContext';
import { useAlerts } from '../../context/AlertsContext';
import { Screen, AppHeader, T, H, Card, PressableCard, Button, CallButton } from '../../components/ui';
import { levelInfo, preparednessPct } from '../../lib/gamification';
import { fetchAirQuality, psiBand, pm25Band } from '../../lib/airQuality';
import { timeOfDayGreeting, formatTime } from '../../lib/dates';
import { MISSIONS } from '../../content/missions';
import { space } from '../../theme';

// A mission already in progress first, otherwise the first unfinished one.
function nextMission(profile) {
  const done = (m) => profile.completedMissions?.[m.id];
  const started = (m) => (profile.missionProgress?.[m.id]?.length ?? 0) > 0;
  return MISSIONS.find((m) => !done(m) && started(m)) ?? MISSIONS.find((m) => !done(m));
}

function AirQualityCard({ location }) {
  const router = useRouter();
  const { colors } = useTheme();
  const [aq, setAq] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchAirQuality(location).then((result) => {
      setAq(result);
      setLoading(false);
    });
  }, [location]);

  const band = psiBand(aq?.psi);
  const pm = pm25Band(aq?.pm25);

  return (
    <Card>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <H>Air quality now</H>
        {aq?.stale ? <Chip compact icon="cloud-off-outline">Offline: last saved</Chip> : null}
      </View>

      {loading && !aq ? (
        <ActivityIndicator accessibilityLabel="Loading air quality" />
      ) : aq?.psi == null ? (
        <T style={{ color: colors.onSurfaceVariant }}>Air quality is unavailable right now. Check haze.gov.sg.</T>
      ) : (
        <>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.lg }}>
            <View accessible accessibilityLabel={`24-hour PSI ${aq.psi}, ${band.label}, ${aq.region} region`}>
              <T variant="small" style={{ color: colors.onSurfaceVariant }}>24-hr PSI, {aq.region}</T>
              <T variant="heading">{aq.psi} {band.label}</T>
            </View>
            {pm ? (
              <View accessible accessibilityLabel={`1-hour PM2.5 band ${pm.band}, ${pm.label}`}>
                <T variant="small" style={{ color: colors.onSurfaceVariant }}>1-hr PM2.5</T>
                <T variant="heading">Band {pm.band} {pm.label}</T>
              </View>
            ) : null}
          </View>
          <T>{band.advice}</T>
          <T variant="caption" style={{ color: colors.onSurfaceVariant }}>
            Source: NEA via data.gov.sg. Fetched {formatTime(aq.fetchedAt)}.
          </T>
        </>
      )}

      <Button mode="text" onPress={() => router.push('/guide/haze')} style={{ alignSelf: 'flex-start' }}>
        What should I do in haze?
      </Button>
    </Card>
  );
}

export default function Home() {
  const router = useRouter();
  const { colors } = useTheme();
  const { profile } = useProgress();
  const { alerts, location } = useAlerts();

  if (!profile) {
    return (
      <Screen header={<AppHeader title="ReadySG" />}>
        <ActivityIndicator accessibilityLabel="Loading your progress" />
      </Screen>
    );
  }

  const lvl = levelInfo(profile.xp);
  const pct = preparednessPct(profile);
  const mission = nextMission(profile);
  const done = mission ? profile.missionProgress?.[mission.id]?.length ?? 0 : 0;
  const total = mission?.steps?.length ?? mission?.questions?.length ?? 0;

  return (
    <Screen header={<AppHeader title="ReadySG" />}>
      <H level={1}>{timeOfDayGreeting()}, {profile.displayName || 'there'}</H>

      {alerts.length ? (
        <PressableCard
          onPress={() => router.push(`/alert/${alerts[0].id}`)}
          accessibilityLabel={`Active simulated alert: ${alerts[0].title}. Open details.`}
          style={{ backgroundColor: colors.emphasis }}
        >
          <T variant="smallBold" style={{ color: '#ffffff' }}>
            Simulated alert{alerts.length > 1 ? ` (1 of ${alerts.length})` : ''}
          </T>
          <T variant="heading" style={{ color: '#ffffff' }}>{alerts[0].title}</T>
          <T variant="small" style={{ color: '#ffffff' }}>Tap for what to do</T>
        </PressableCard>
      ) : null}

      <Card>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <H>Preparedness</H>
          <T variant="small" style={{ color: colors.onSurfaceVariant }}>Level {lvl.level}, {profile.xp} XP</T>
        </View>
        <T variant="display">{pct}% prepared</T>
        <ProgressBar progress={pct / 100} accessibilityLabel={`Preparedness ${pct} percent`} />
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Icon source="fire" size={20} color={colors.emergency} />
          <T>
            <T variant="bodyBold">{profile.streak?.current ?? 0}-day streak</T>, longest {profile.streak?.longest ?? 0}
          </T>
        </View>
      </Card>

      <AirQualityCard location={location} />

      {mission ? (
        <Card>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <H>{done ? 'Continue mission' : 'Next mission'}</H>
            <T variant="bodyBold" style={{ color: colors.success }}>+{mission.xp} XP</T>
          </View>
          <T>
            {mission.title}
            {total && mission.type === 'checklist' ? `, ${done} of ${total} done` : ''}
          </T>
          {mission.type === 'checklist' ? (
            <ProgressBar progress={total ? done / total : 0} accessibilityLabel={`${mission.title}, ${done} of ${total} steps`} />
          ) : null}
          <Button mode="contained" onPress={() => router.push(`/mission/${mission.id}`)}>
            {done ? 'Continue' : 'Start'}
          </Button>
        </Card>
      ) : (
        <Card>
          <T variant="bodyBold">You have completed every mission. Well done.</T>
        </Card>
      )}

      <View style={{ flexDirection: 'row', gap: space.sm }}>
        <CallButton number="995" label="Fire, ambulance" primary />
        <Button mode="outlined" icon="book-open-variant" onPress={() => router.push('/guides')} style={{ flex: 1, justifyContent: 'center' }}>
          Guides
        </Button>
        <Button mode="outlined" icon="trophy-outline" onPress={() => router.push('/leaderboard')} style={{ flex: 1, justifyContent: 'center' }}>
          Ranks
        </Button>
      </View>
    </Screen>
  );
}
