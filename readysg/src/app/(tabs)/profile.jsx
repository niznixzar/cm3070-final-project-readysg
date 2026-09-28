import { ActivityIndicator, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Avatar, ProgressBar, SegmentedButtons, useTheme } from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';
import { useProgress } from '../../context/ProgressContext';
import { useThemeSettings, THEME_MODE_OPTIONS } from '../../context/ThemeContext';
import { Screen, AppHeader, T, H, Card, Button } from '../../components/ui';
import { levelInfo } from '../../lib/gamification';
import { BADGES } from '../../content/badges';
import { FONT_SIZE_OPTIONS, space } from '../../theme';

const REMINDER_OPTIONS = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'off', label: 'Off' },
];

function Stat({ value, label }) {
  const { colors } = useTheme();
  return (
    <View style={{ flex: 1, alignItems: 'center' }} accessible accessibilityLabel={`${label}: ${value}`}>
      <T variant="title">{value}</T>
      <T variant="caption" style={{ color: colors.onSurfaceVariant, textAlign: 'center' }}>{label}</T>
    </View>
  );
}

export default function Profile() {
  const router = useRouter();
  const { colors } = useTheme();
  const { user, signOut } = useAuth();
  const { profile, setReminders } = useProgress();
  const { themeMode, setThemeMode, fontSize, setFontSize } = useThemeSettings();

  if (!profile) {
    return (
      <Screen header={<AppHeader title="Profile" />}>
        <ActivityIndicator />
      </Screen>
    );
  }

  const lvl = levelInfo(profile.xp);
  const name = profile.displayName || user?.email || '?';
  const initials = name.split(' ').map((word) => word[0]).join('').slice(0, 2).toUpperCase();
  const earned = profile.badges ?? [];

  return (
    <Screen header={<AppHeader title="Profile" />}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
        <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          <Avatar.Text size={60} label={initials} color="#ffffff" style={{ backgroundColor: colors.emphasis }} />
        </View>
        <View style={{ flex: 1 }}>
          <H level={1}>{profile.displayName || 'ReadySG user'}</H>
          <T variant="small" style={{ color: colors.onSurfaceVariant }}>Level {lvl.level}: {lvl.name}</T>
        </View>
      </View>

      <Card>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <T variant="bodyBold">{profile.xp} XP</T>
          <T variant="small" style={{ color: colors.onSurfaceVariant }}>
            {lvl.nextLevel ? `${lvl.toNext} XP to Level ${lvl.nextLevel}` : 'Top level reached'}
          </T>
        </View>
        <ProgressBar progress={lvl.pct / 100} accessibilityLabel={`Progress to next level, ${lvl.pct} percent`} />
        <View style={{ flexDirection: 'row', marginTop: space.sm }}>
          <Stat value={profile.streak?.current ?? 0} label="Day streak" />
          <Stat value={profile.streak?.longest ?? 0} label="Longest streak" />
          <Stat value={profile.streak?.weeklyCurrent ?? 0} label="Weeks active in a row" />
        </View>
      </Card>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <H>Badges: {earned.length} of {BADGES.length}</H>
        <Button mode="text" onPress={() => router.push('/leaderboard')}>Leaderboard</Button>
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
        {BADGES.map((badge) => {
          const has = earned.includes(badge.id);
          return (
            <Card
              key={badge.id}
              style={{ width: '31%', flexGrow: 1 }}
              contentStyle={{ alignItems: 'center', paddingHorizontal: space.sm }}
            >
              <View accessible accessibilityLabel={`${badge.name}. ${has ? 'Earned' : 'Locked'}. ${badge.description}`} style={{ alignItems: 'center', gap: 4 }}>
                <Avatar.Icon
                  size={44}
                  icon={has ? 'medal' : 'lock'}
                  color={has ? colors.onPrimaryContainer : colors.onSurfaceVariant}
                  style={{ backgroundColor: has ? colors.primaryContainer : colors.surfaceVariant }}
                />
                <T variant="smallBold" style={{ textAlign: 'center' }}>{badge.name}</T>
                <T variant="caption" style={{ color: colors.onSurfaceVariant }}>{has ? 'Earned' : 'Locked'}</T>
              </View>
            </Card>
          );
        })}
      </View>

      <H>Reminders</H>
      <SegmentedButtons
        value={profile.settings?.reminders ?? 'daily'}
        onValueChange={setReminders}
        buttons={REMINDER_OPTIONS}
      />
      <T variant="small" style={{ color: colors.onSurfaceVariant }}>
        Reminders appear as a banner when you open the app: today's challenge, a weekly revision prompt, and a welcome back if you have been away for 3 days.
      </T>

      <H>Display</H>
      <T variant="bodyBold">Appearance</T>
      <SegmentedButtons value={themeMode} onValueChange={setThemeMode} buttons={THEME_MODE_OPTIONS} />
      <T variant="bodyBold">Font size</T>
      <SegmentedButtons
        value={fontSize}
        onValueChange={setFontSize}
        buttons={FONT_SIZE_OPTIONS.map(({ value, label }) => ({ value, label }))}
      />
      <T variant="small" style={{ color: colors.onSurfaceVariant }}>
        This is on top of your phone's own text size setting.
      </T>

      <Button mode="outlined" icon="logout" onPress={signOut}>Sign out</Button>
    </Screen>
  );
}
