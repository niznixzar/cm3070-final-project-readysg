import { useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { Chip, Icon, ProgressBar, useTheme } from 'react-native-paper';
import { useProgress } from '../../context/ProgressContext';
import { Screen, AppHeader, T, ChipRow, PressableCard } from '../../components/ui';
import { MISSIONS, CATEGORIES } from '../../content/missions';
import { dateKey } from '../../lib/dates';
import { XP } from '../../lib/gamification';
import { space } from '../../theme';

// "Completed", "3 of 8" or "Not started"
function statusOf(profile, mission) {
  if (profile?.completedMissions?.[mission.id]) return { label: 'Completed', done: true };
  const ticked = profile?.missionProgress?.[mission.id]?.length ?? 0;
  if (mission.type === 'checklist' && ticked) {
    return { label: `${ticked} of ${mission.steps.length}`, progress: ticked / mission.steps.length };
  }
  return { label: 'Not started' };
}

function describe(mission) {
  if (mission.type === 'quiz') return `Quiz, ${mission.questions.length} questions`;
  if (mission.type === 'checklist') return `${mission.steps.length} steps`;
  return 'Action';
}

export default function Missions() {
  const router = useRouter();
  const { colors } = useTheme();
  const { profile } = useProgress();
  const [category, setCategory] = useState('all');

  const list = MISSIONS.filter((m) => category === 'all' || m.category === category);
  const challengeDone = profile?.dailyChallenge?.date === dateKey();

  return (
    <Screen header={<AppHeader title="Missions" />}>
      <PressableCard
        onPress={() => router.push('/challenge')}
        accessibilityLabel={challengeDone ? 'Daily challenge done for today' : `Daily challenge. One question, ${XP.dailyChallenge} XP`}
        style={{ backgroundColor: colors.emphasis }}
      >
        <T variant="smallBold" style={{ color: '#ffffff' }}>Daily challenge</T>
        <T variant="heading" style={{ color: '#ffffff' }}>
          {challengeDone ? 'Done for today. Come back tomorrow.' : "Answer today's question"}
        </T>
        {!challengeDone ? (
          <T variant="small" style={{ color: '#ffffff' }}>+{XP.dailyChallenge} XP and keeps your streak going</T>
        ) : null}
      </PressableCard>

      <ChipRow label="Filter missions by topic">
        {CATEGORIES.map((c) => (
          <Chip key={c.id} selected={category === c.id} onPress={() => setCategory(c.id)}>
            {c.label}
          </Chip>
        ))}
      </ChipRow>

      {list.map((mission) => {
        const status = statusOf(profile, mission);
        return (
          <PressableCard
            key={mission.id}
            onPress={() => router.push(`/mission/${mission.id}`)}
            accessibilityLabel={`${mission.title}. ${mission.xp} XP. ${status.label}.`}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: space.sm }}>
              <T variant="bodyBold" style={{ flex: 1 }}>{mission.title}</T>
              <Icon source="chevron-right" size={22} color={colors.onSurfaceVariant} />
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap', gap: space.sm }}>
              <T variant="small" style={{ color: colors.onSurfaceVariant }}>
                {describe(mission)}, +{mission.xp} XP
              </T>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                {status.done ? <Icon source="check-circle" size={18} color={colors.success} /> : null}
                <T variant="smallBold" style={{ color: status.done ? colors.success : colors.onSurfaceVariant }}>
                  {status.label}
                </T>
              </View>
            </View>
            {status.progress != null ? (
              <ProgressBar progress={status.progress} accessibilityLabel={`${mission.title} progress`} />
            ) : null}
          </PressableCard>
        );
      })}
    </Screen>
  );
}
