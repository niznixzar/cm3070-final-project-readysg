import { useState } from 'react';
import { View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Checkbox, Icon, ProgressBar, RadioButton, useTheme } from 'react-native-paper';
import { useProgress } from '../../context/ProgressContext';
import { missionById } from '../../content/missions';
import { Screen, AppHeader, T, H, Card, Button } from '../../components/ui';
import { space } from '../../theme';

function DoneCard({ text }) {
  const { colors } = useTheme();
  return (
    <Card contentStyle={{ flexDirection: 'row', alignItems: 'center' }}>
      <Icon source="check-circle" size={24} color={colors.success} />
      <T variant="bodyBold" style={{ color: colors.success, flex: 1 }}>{text}</T>
    </Card>
  );
}

function Checklist({ mission, profile, toggleStep, completeMission }) {
  const { colors } = useTheme();
  const ticked = profile.missionProgress?.[mission.id] ?? [];
  const completed = Boolean(profile.completedMissions?.[mission.id]);
  const allTicked = ticked.length === mission.steps.length;

  return (
    <>
      <T variant="bodyBold">
        {completed ? mission.steps.length : ticked.length} of {mission.steps.length} done
      </T>
      <ProgressBar progress={completed ? 1 : ticked.length / mission.steps.length} accessibilityLabel="Checklist progress" />

      <View>
        {mission.steps.map((step) => (
          <Checkbox.Item
            key={step.id}
            label={step.text}
            position="leading"
            labelStyle={{ textAlign: 'left' }}
            status={completed || ticked.includes(step.id) ? 'checked' : 'unchecked'}
            disabled={completed}
            onPress={() => toggleStep(mission.id, step.id)}
          />
        ))}
      </View>

      {completed ? (
        <DoneCard text={`Mission complete. You earned ${mission.xp} XP.`} />
      ) : (
        <>
          <Button
            mode="contained"
            disabled={!allTicked}
            onPress={() => completeMission(mission.id)}
            accessibilityHint={allTicked ? undefined : `Finish all ${mission.steps.length} steps first`}
          >
            Mark mission complete
          </Button>
          {!allTicked ? (
            <T variant="small" style={{ color: colors.onSurfaceVariant, textAlign: 'center' }}>
              Finish all {mission.steps.length} steps to earn {mission.xp} XP
            </T>
          ) : null}
        </>
      )}
    </>
  );
}

function Quiz({ mission, profile, completeMission }) {
  const { colors } = useTheme();
  const completed = Boolean(profile.completedMissions?.[mission.id]);
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  if (completed && !finished) {
    return <DoneCard text={`You passed this quiz and earned ${mission.xp} XP.`} />;
  }

  const total = mission.questions.length;

  if (finished) {
    const passed = score === total;
    const restart = () => {
      setIndex(0);
      setPicked(null);
      setScore(0);
      setFinished(false);
    };
    return (
      <Card>
        <H>{passed ? 'All correct' : `${score} of ${total} correct`}</H>
        <T>
          {passed
            ? `Mission complete. You earned ${mission.xp} XP.`
            : 'Get every answer right to complete the mission. Review the guide and try again.'}
        </T>
        {!passed ? <Button mode="contained" onPress={restart}>Try again</Button> : null}
      </Card>
    );
  }

  const question = mission.questions[index];
  const answered = picked !== null;
  const right = picked === question.answer;

  const next = () => {
    const newScore = score + (right ? 1 : 0);
    setScore(newScore);
    if (index + 1 < total) {
      setIndex(index + 1);
      setPicked(null);
    } else {
      setFinished(true);
      if (newScore === total) completeMission(mission.id);
    }
  };

  return (
    <View style={{ gap: space.md }}>
      <T variant="smallBold" style={{ color: colors.onSurfaceVariant }}>Question {index + 1} of {total}</T>
      <H>{question.prompt}</H>

      <RadioButton.Group value={picked === null ? '' : String(picked)} onValueChange={(v) => !answered && setPicked(Number(v))}>
        {question.options.map((option, i) => {
          const isAnswer = answered && i === question.answer;
          const isWrongPick = answered && i === picked && !right;
          return (
            <RadioButton.Item
              key={i}
              value={String(i)}
              label={`${option}${isAnswer ? ' (correct answer)' : isWrongPick ? ' (incorrect)' : ''}`}
              disabled={answered}
              position="leading"
              labelStyle={{ textAlign: 'left', color: isAnswer ? colors.success : isWrongPick ? colors.error : colors.onSurface }}
            />
          );
        })}
      </RadioButton.Group>

      {answered ? (
        <View accessibilityLiveRegion="polite" style={{ gap: space.sm }}>
          <T variant="bodyBold" style={{ color: right ? colors.success : colors.error }}>
            {right ? 'Correct.' : 'Not quite.'}
          </T>
          <T>{question.explain}</T>
          <Button mode="contained" onPress={next}>
            {index + 1 < total ? 'Next question' : 'See result'}
          </Button>
        </View>
      ) : null}
    </View>
  );
}

export default function MissionScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { colors } = useTheme();
  const { profile, toggleStep, completeMission } = useProgress();
  const mission = missionById(id);

  if (!mission || !profile) {
    return (
      <Screen header={<AppHeader back="Missions" />}>
        <T>Mission not found.</T>
      </Screen>
    );
  }

  return (
    <Screen header={<AppHeader back="Missions" />}>
      <H level={1}>{mission.title}</H>
      <T variant="small" style={{ color: colors.onSurfaceVariant }}>+{mission.xp} XP. Based on {mission.source}.</T>
      <T>{mission.summary}</T>

      {mission.type === 'checklist' ? (
        <Checklist mission={mission} profile={profile} toggleStep={toggleStep} completeMission={completeMission} />
      ) : mission.type === 'quiz' ? (
        <Quiz mission={mission} profile={profile} completeMission={completeMission} />
      ) : profile.completedMissions?.[mission.id] ? (
        <DoneCard text="Mission complete. Thanks for helping your community." />
      ) : (
        <Button mode="contained" onPress={() => router.push(mission.action.href)}>{mission.action.label}</Button>
      )}

      {mission.guideId ? (
        <Button mode="outlined" onPress={() => router.push(`/guide/${mission.guideId}`)}>Read the guide</Button>
      ) : null}
    </Screen>
  );
}
