# ReadySG

An emergency-preparedness app for Singapore. It has missions, badges and streaks, offline guides, a map of AEDs and shelters, and a personal emergency card. Built with Expo SDK 57 and Firebase, and it runs in Expo Go.

## What you need

- Node.js 20 or newer (https://nodejs.org)
- Expo Go on your phone, updated to the latest version
- Your phone and computer on the same Wi-Fi

## Setup

**1. Install packages.** 
In the project folder, run:

```bash
npm install --legacy-peer-deps
```

Leave out the flag and npm will fail with an `ERESOLVE` error.

**2. Connect Firebase.** 

1. Create a project at https://console.firebase.google.com.
2. Click the Web icon `</>` to register a web app, then copy the `firebaseConfig` values into a copy of `.env.example` named `.env`.
3. Turn on **Authentication > Sign-in method > Email/Password**.
4. Create a **Firestore Database** in production mode, in the `asia-southeast1` (Singapore) location.
5. Deploy the security rules and leaderboard indexes:

```bash
npm install -g firebase-tools

firebase login

firebase use --add

firebase deploy --only firestore
```

With `firebase use --add`, pick your project and call it `default`. No command line? Paste `firestore.rules` into **Firestore > Rules** and click Publish instead.

**3. Start the app.**

```bash
npx expo start --clear
```

Scan the QR code, with the Camera app on iPhone or with Expo Go on Android, then create an account.

## Sending a test alert

Alerts are simulated. You create them, and the app shows a banner. The quickest way is the included script, which needs a service account key.

1. In the Firebase console, go to **Project settings > Service accounts > Generate new private key**. Use the same project your `.env` points to.
2. Rename the downloaded file to `service-account.json` and put it in the `scripts` folder.
3. Run `npm install` inside `scripts`, then send an alert:

```bash
node sendAlert.js haze
```

That sends an islandwide alert. You can also try `node sendAlert.js flood 1.3329 103.7436 3` (within 3 km of a point), or `node sendAlert.js clear` to end all alerts.


## Tests

Run the unit tests with `npm test`.

Content comes from the SCDF *Civil Defence Emergency Handbook* (2026) and NEA haze advisories. Air-quality readings come from data.gov.sg, and map tiles from OneMap.
