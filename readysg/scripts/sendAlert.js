// Creates a simulated alert in Firestore from your computer.
//
// Setup (once):
//   1. Firebase console > Project settings > Service accounts > Generate new private key.
//   2. Save the file as scripts/service-account.json (never commit it).
//   3. cd scripts && npm install
//
// Usage:
//   node sendAlert.js haze                 islandwide haze alert
//   node sendAlert.js flood 1.3329 103.7436 3   flood alert within 3 km of a point
//   node sendAlert.js clear                expire every active alert
const path = require('path');
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore, Timestamp } = require('firebase-admin/firestore');

initializeApp({ credential: cert(require(path.join(__dirname, 'service-account.json'))) });
const db = getFirestore();

const TEMPLATES = {
  haze: {
    title: 'Haze: air quality is Unhealthy',
    body: 'The 24-hr PSI has entered the Unhealthy range (101\u2013200).',
    category: 'haze',
    guideId: 'haze',
  },
  flood: {
    title: 'Flash flood risk in your area',
    body: 'Heavy rain may cause flash floods in low-lying areas over the next hour.',
    category: 'flood',
    guideId: 'floods',
  },
  fire: {
    title: 'Fire reported nearby',
    body: 'SCDF is responding to a fire. Avoid the area and follow instructions.',
    category: 'fire',
    guideId: 'fire',
  },
};

async function main() {
  const [kind = 'haze', lat, lng, radiusKm] = process.argv.slice(2);

  if (kind === 'clear') {
    const active = await db.collection('alerts').where('expiresAt', '>', Timestamp.now()).get();
    await Promise.all(active.docs.map((d) => d.ref.update({ expiresAt: Timestamp.now() })));
    console.log(`Expired ${active.size} alert(s).`);
    return;
  }

  const t = TEMPLATES[kind];
  if (!t) throw new Error(`Unknown alert type "${kind}". Use: ${Object.keys(TEMPLATES).join(', ')}, clear`);

  const doc = {
    ...t,
    simulated: true,
    createdAt: Timestamp.now(),
    expiresAt: Timestamp.fromMillis(Date.now() + 2 * 60 * 60 * 1000), // 2 hours
    ...(lat && lng && radiusKm ? { lat: Number(lat), lng: Number(lng), radiusKm: Number(radiusKm) } : {}),
  };
  const ref = await db.collection('alerts').add(doc);
  console.log(`Created alert ${ref.id}:`, doc.title);
}

main().then(() => process.exit(0)).catch((e) => { console.error(e.message); process.exit(1); });
