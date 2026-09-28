import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';
import { guideById } from '../../content/guides';
import { MISSIONS } from '../../content/missions';
import { Screen, AppHeader, T, H, Button } from '../../components/ui';
import GuideBlocks from '../../components/GuideBlocks';

export default function Guide() {
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const router = useRouter();
  const { colors } = useTheme();
  const guide = guideById(id);

  if (!guide) {
    return (
      <Screen header={<AppHeader back="Guides" guest={!user} />}>
        <T>This guide could not be found.</T>
      </Screen>
    );
  }

  const mission = MISSIONS.find((m) => m.guideId === guide.id);

  return (
    <Screen header={<AppHeader back="Guides" guest={!user} />}>
      <H level={1}>{guide.title}</H>
      <GuideBlocks blocks={guide.blocks} />
      <T variant="caption" style={{ color: colors.onSurfaceVariant }}>Source: {guide.source}</T>
      {user && mission ? (
        <Button mode="contained" onPress={() => router.push(`/mission/${mission.id}`)}>
          {`Start mission: ${mission.title} (+${mission.xp} XP)`}
        </Button>
      ) : null}
    </Screen>
  );
}
