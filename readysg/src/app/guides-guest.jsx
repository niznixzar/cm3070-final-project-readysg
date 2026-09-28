// Signed-out access to the resource hub, so nobody needs an account in an emergency.
import { Screen, AppHeader, H } from '../components/ui';
import GuidesList from '../components/GuidesList';

export default function GuestGuides() {
  return (
    <Screen header={<AppHeader back="Sign in" guest />}>
      <H level={1}>Emergency guides</H>
      <GuidesList />
    </Screen>
  );
}
