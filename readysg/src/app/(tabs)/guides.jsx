import { Screen, AppHeader } from '../../components/ui';
import GuidesList from '../../components/GuidesList';

export default function Guides() {
  return (
    <Screen header={<AppHeader title="Guides" />}>
      <GuidesList />
    </Screen>
  );
}
