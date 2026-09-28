import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Chip, HelperText, SegmentedButtons, useTheme } from 'react-native-paper';
import { collection, getCountFromServer, getDocs, limit, orderBy, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { useProgress } from '../context/ProgressContext';
import { Screen, AppHeader, T, H, ChipRow } from '../components/ui';
import { weekKey, monthKey } from '../lib/dates';
import { space } from '../theme';

// Field to rank by, period filter, and this user's own score.
function config(board, period, profile) {
  const learning = board === 'learning';
  const p = profile.periods ?? {};
  if (period === 'week') {
    const current = p.weekKey === weekKey();
    return {
      field: learning ? 'weeklyXp' : 'weeklyContrib',
      filter: ['weekKey', weekKey()],
      mine: current ? (learning ? p.weeklyXp : p.weeklyContrib) : 0,
    };
  }
  if (period === 'month') {
    const current = p.monthKey === monthKey();
    return {
      field: learning ? 'monthlyXp' : 'monthlyContrib',
      filter: ['monthKey', monthKey()],
      mine: current ? (learning ? p.monthlyXp : p.monthlyContrib) : 0,
    };
  }
  return {
    field: learning ? 'xp' : 'contributions',
    filter: null,
    mine: learning ? profile.xp : (profile.contributions ?? 0) + (profile.verifications ?? 0),
  };
}

function Row({ rank, name, score, unit, you }) {
  const { colors } = useTheme();
  return (
    <View
      accessible
      accessibilityLabel={`Rank ${rank}. ${you ? 'You' : name}. ${score} ${unit}.`}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: space.md,
        minHeight: 52,
        paddingHorizontal: space.md,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: you ? colors.primary : colors.outlineVariant,
        backgroundColor: you ? colors.primaryContainer : colors.surface,
      }}
    >
      <T variant="bodyBold" style={{ minWidth: 40 }}>#{rank}</T>
      <T variant={you ? 'bodyBold' : 'body'} style={{ flex: 1 }} numberOfLines={1}>{you ? `${name} (you)` : name}</T>
      <T variant="bodyBold">{score} {unit}</T>
    </View>
  );
}

export default function Leaderboard() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const { profile } = useProgress();
  const [board, setBoard] = useState('learning');
  const [period, setPeriod] = useState('week');
  const [rows, setRows] = useState(null);
  const [myRank, setMyRank] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!profile) return;
    let cancelled = false;
    const { field, filter, mine } = config(board, period, profile);
    const profiles = collection(db, 'publicProfiles');
    const where_ = filter ? [where(filter[0], '==', filter[1])] : [];

    async function load() {
      setRows(null);
      setError('');
      try {
        const snap = await getDocs(query(profiles, ...where_, orderBy(field, 'desc'), limit(20)));
        const list = snap.docs.map((d, i) => ({ id: d.id, rank: i + 1, name: d.data().displayName, score: d.data()[field] ?? 0 }));

        // Not in the top 20? Count the people ahead to get your rank.
        let rank = list.find((r) => r.id === user.uid)?.rank ?? null;
        if (!rank && mine > 0) {
          const higher = await getCountFromServer(query(profiles, ...where_, where(field, '>', mine)));
          rank = higher.data().count + 1;
        }
        if (!cancelled) {
          setRows(list);
          setMyRank(rank ? { rank, score: mine } : null);
        }
      } catch (e) {
        if (!cancelled) {
          setRows([]);
          setError(
            e?.code === 'failed-precondition'
              ? 'This leaderboard needs a Firestore index. Deploy firestore.indexes.json (see README).'
              : 'Leaderboards need an internet connection. Connect and try again.'
          );
        }
      }
    }

    load();
    return () => {
      cancelled = true; // the user switched tabs before this finished
    };
  }, [board, period, profile?.xp, profile?.contributions]);

  const unit = board === 'learning' ? 'XP' : 'pts';
  const inTop = rows?.some((r) => r.id === user.uid);

  return (
    <Screen header={<AppHeader back="Back" />}>
      <H level={1}>Leaderboard</H>
      <SegmentedButtons
        value={board}
        onValueChange={setBoard}
        buttons={[
          { value: 'learning', label: 'Learning' },
          { value: 'community', label: 'Community' },
        ]}
      />
      <ChipRow label="Time period">
        <Chip selected={period === 'week'} onPress={() => setPeriod('week')}>This week</Chip>
        <Chip selected={period === 'month'} onPress={() => setPeriod('month')}>This month</Chip>
        <Chip selected={period === 'all'} onPress={() => setPeriod('all')}>All time</Chip>
      </ChipRow>
      <T variant="small" style={{ color: colors.onSurfaceVariant }}>
        {board === 'learning' ? 'Ranked by XP from missions, challenges and streaks.' : 'Ranked by map resources added and confirmed.'}
        {period === 'week' ? ' Weekly rankings reset every Monday, so everyone starts level.' : ''}
      </T>

      {rows === null ? (
        <ActivityIndicator accessibilityLabel="Loading leaderboard" />
      ) : error ? (
        <HelperText type="error" visible style={{ fontSize: 16 }}>{error}</HelperText>
      ) : rows.length === 0 ? (
        <T>No one has scored yet this period. Complete a mission to take the top spot.</T>
      ) : (
        <View style={{ gap: space.sm }}>
          {rows.map((r) => (
            <Row key={r.id} rank={r.rank} name={r.name} score={r.score} unit={unit} you={r.id === user.uid} />
          ))}
        </View>
      )}

      {myRank && !inTop ? (
        <View style={{ gap: space.xs, marginTop: space.md }}>
          <T variant="smallBold" style={{ color: colors.onSurfaceVariant }}>Your rank</T>
          <Row rank={myRank.rank} name={profile.displayName} score={myRank.score} unit={unit} you />
        </View>
      ) : null}
    </Screen>
  );
}
