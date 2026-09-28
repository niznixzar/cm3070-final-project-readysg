// Shown when the Firebase keys are missing.
import { Screen, T, H, Card } from './ui';

export default function SetupNeeded() {
  return (
    <Screen>
      <H level={1} style={{ marginTop: 24 }}>Connect ReadySG to Firebase</H>
      <T>The app cannot find your Firebase settings.</T>
      <Card>
        <T>1. Copy .env.example to a new file called .env in the project folder.</T>
        <T>2. Paste in the values from Firebase console, Project settings, Your apps, Web app.</T>
        <T>3. Stop the dev server and run: npx expo start --clear</T>
      </Card>
      <T>Full steps are in README.md.</T>
    </Screen>
  );
}
