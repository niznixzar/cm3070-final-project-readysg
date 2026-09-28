// One question a day, the same for everyone.
import { useState } from 'react';
import { View } from 'react-native';
import { RadioButton, useTheme } from 'react-native-paper';
import { useProgress } from '../context/ProgressContext';
import { Screen, AppHeader, T, H, Card } from '../components/ui';
import { DAILY_POOL } from '../content/missions';
import { dailyIndex, XP } from '../lib/gamification';
import { dateKey } from '../lib/dates';
import { space } from '../theme';

export default function Challenge() {
  const { colors } = useTheme();
  const { profile, answerDailyChallenge } = useProgress();
  const [picked, setPicked] = useState(null);
  const question = DAILY_POOL[dailyIndex(DAILY_POOL.length)];
  const alreadyAnswered = profile?.dailyChallenge?.date === dateKey();

  const pick = (value) => {
    if (picked !== null) return;
    const i = Number(value);
    setPicked(i);
    answerDailyChallenge(i === question.answer);
  };

  if (alreadyAnswered && picked === null) {
    return (
      <Screen header={<AppHeader back="Missions" />}>
        <H level={1}>Daily challenge</H>
        <Card>
          <T variant="bodyBold">
            {profile.dailyChallenge.correct
              ? `You got today's question right and earned ${XP.dailyChallenge} XP.`
              : "You have answered today's question."}
          </T>
          <T>A new question arrives at midnight.</T>
        </Card>
      </Screen>
    );
  }

  const right = picked === question.answer;

  return (
    <Screen header={<AppHeader back="Missions" />}>
      <H level={1}>Daily challenge</H>
      <H>{question.prompt}</H>

      <RadioButton.Group value={picked === null ? '' : String(picked)} onValueChange={pick}>
        {question.options.map((option, i) => {
          const isAnswer = picked !== null && i === question.answer;
          const isWrongPick = picked === i && !right;
          return (
            <RadioButton.Item
              key={i}
              value={String(i)}
              label={`${option}${isAnswer ? ' (correct answer)' : isWrongPick ? ' (incorrect)' : ''}`}
              disabled={picked !== null}
              position="leading"
              labelStyle={{ textAlign: 'left', color: isAnswer ? colors.success : isWrongPick ? colors.error : colors.onSurface }}
            />
          );
        })}
      </RadioButton.Group>

      {picked !== null ? (
        <View accessibilityLiveRegion="polite" style={{ gap: space.sm }}>
          <T variant="bodyBold" style={{ color: right ? colors.success : colors.error }}>
            {right ? `Correct. +${XP.dailyChallenge} XP` : 'Not quite. Try again tomorrow.'}
          </T>
          <T>{question.explain}</T>
        </View>
      ) : null}
    </Screen>
  );
}
