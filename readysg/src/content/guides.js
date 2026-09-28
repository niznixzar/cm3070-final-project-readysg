// Guide content, bundled so it works offline. From the SCDF Civil Defence
// Emergency Handbook (10th ed., 2026) and NEA haze advisories.
// Block types (drawn by GuideBlocks.jsx): p, h, list, steps, callout, table, link, call

export const GUIDES = [
  {
    id: 'first-aid',
    title: 'First aid and CPR-AED',
    subtitle: 'Burns, choking, CPR',
    source: 'SCDF Civil Defence Emergency Handbook, Chapter 1',
    blocks: [
      { type: 'call', number: '995', label: 'Call 995 for an emergency ambulance' },
      { type: 'p', text: 'Only call 995 in an emergency. For a non-emergency ambulance, call 1777.' },
      { type: 'h', text: 'CPR at a glance' },
      {
        type: 'steps',
        items: [
          'Check if the casualty responds.',
          'If not, call 995 and get someone to bring an AED.',
          'Tilt the head back and lift the chin to open the airway.',
          'Look, listen and feel for breathing.',
          'If they are breathing, monitor them and wait for the ambulance.',
          'If they are not breathing, give 30 chest compressions then 2 breaths, and repeat. Hands-only CPR is also an option.',
          'Use the AED as soon as it arrives and follow its voice prompts.',
        ],
      },
      { type: 'callout', text: 'The 995 specialists are trained to talk you through CPR over the phone. Follow their instructions.' },
      { type: 'h', text: 'Burns and scalds: the four Cs' },
      {
        type: 'steps',
        items: [
          'Cool the burn under cold running water for at least 10 minutes. For chemical burns, wash the chemical off.',
          'Constricting items like rings, watches and bracelets: remove them gently before swelling starts.',
          'Cover the burn with a sterile dressing.',
          'Consult a doctor. If the burn is severe, call 995.',
        ],
      },
      {
        type: 'list',
        items: [
          'Do not apply toothpaste, lotion, ointment or anything fatty.',
          'Do not cover the burn with cotton wool.',
          'Do not break blisters or remove anything stuck to the burn.',
        ],
      },
      { type: 'p', text: 'A burn is severe if it covers more than five palm-sizes of the casualty\u2019s body, or affects the mouth, throat, eyes, ears or genitals.' },
      { type: 'h', text: 'Choking' },
      {
        type: 'list',
        items: [
          'Place your fist two fingers above the navel, cover it with your other hand and give quick inward and upward thrusts.',
          'For someone who is pregnant or obese, give chest thrusts at the centre of the breastbone instead.',
          'If they become unconscious, lay them down, call 995, get an AED and start CPR. Check the mouth for the object between cycles.',
        ],
      },
      { type: 'h', text: 'Your first aid kit' },
      { type: 'p', text: 'Keep tweezers, scissors, a thermometer, disposable gloves, adhesive tape, dressings and bandages. Check expiry dates regularly.' },
      { type: 'callout', text: 'Reading is not training. SCDF\u2019s Responders Plus Programme teaches first aid and CPR-AED hands-on.' },
    ],
  },
  {
    id: 'fire',
    title: 'Fire safety',
    subtitle: 'Escaping a fire, extinguishers',
    source: 'SCDF Civil Defence Emergency Handbook, Chapter 2',
    blocks: [
      { type: 'call', number: '995', label: 'Call 995 to report a fire' },
      { type: 'h', text: 'If you discover a fire' },
      {
        type: 'list',
        items: [
          'Fight the fire only if you can do so without endangering yourself or others.',
          'If you cannot put it out, leave your home immediately and call 995.',
          'Close the door of the room and your main door as you leave to contain the fire.',
          'Evacuate if you are on the fire floor or up to two floors above it.',
          'On other floors it is generally safer to stay in your unit with windows and doors closed, unless the authorities say otherwise.',
          'Stay low. Smoke rises.',
          'Never use the lift. Use the exit stairs.',
        ],
      },
      { type: 'h', text: 'If you cannot escape' },
      {
        type: 'list',
        items: [
          'Go to the room furthest from the fire, shout for help and call 995 if you can.',
          'Shut the door and seal the gap under it with a wet towel or rug.',
          'Stay calm. Do not jump out of the building.',
        ],
      },
      { type: 'h', text: 'Battery fires in PMDs, PABs and e-scooters' },
      {
        type: 'list',
        items: [
          'Lithium-ion battery fires spread fast and may explode. Do not fight the fire.',
          'Shout to warn others, leave, close the door behind you and call 995.',
          'Never charge devices overnight, unattended, near exits or in common corridors.',
          'Use only original batteries and the original power adapter.',
        ],
      },
      { type: 'h', text: 'Fire extinguishers' },
      { type: 'p', text: 'Every household should have at least one certified dry chemical powder extinguisher. SCDF is not linked to any door-to-door extinguisher sellers.' },
    ],
  },
  {
    id: 'haze',
    title: 'Haze',
    subtitle: 'PSI, PM2.5, masks',
    source: 'NEA haze advisories (haze.gov.sg)',
    blocks: [
      { type: 'p', text: 'Smoke haze from land and forest fires in the region can reach Singapore, mostly in dry months. Know which reading to check and what to do.' },
      { type: 'h', text: 'Which reading should I check?' },
      {
        type: 'list',
        items: [
          '1-hr PM2.5: for what to do in the next hour, like a run or a walk.',
          '24-hr PSI: to plan activities for the next day.',
        ],
      },
      {
        type: 'table',
        caption: '24-hr PSI bands',
        headers: ['PSI', 'Air quality'],
        rows: [
          ['0\u201350', 'Good'],
          ['51\u2013100', 'Moderate'],
          ['101\u2013200', 'Unhealthy'],
          ['201\u2013300', 'Very unhealthy'],
          ['301 and above', 'Hazardous'],
        ],
      },
      {
        type: 'table',
        caption: '1-hr PM2.5 bands (\u00b5g/m\u00b3)',
        headers: ['Band', 'Reading', 'Level'],
        rows: [
          ['1', '0\u201355', 'Normal'],
          ['2', '56\u2013150', 'Elevated'],
          ['3', '151\u2013250', 'High'],
          ['4', '251 and above', 'Very high'],
        ],
      },
      {
        type: 'table',
        caption: 'What to do, by 24-hr PSI',
        headers: ['PSI', 'Healthy people', 'Elderly, children, pregnant women, heart or lung conditions'],
        rows: [
          ['0\u2013100', 'Normal activities', 'Normal activities'],
          ['101\u2013200', 'Reduce prolonged or strenuous outdoor exertion', 'Minimise prolonged or strenuous outdoor exertion'],
          ['201\u2013300', 'Avoid prolonged or strenuous outdoor exertion', 'Minimise outdoor activity'],
          ['301 and above', 'Minimise outdoor activity', 'Avoid outdoor activity'],
        ],
      },
      { type: 'h', text: 'At home' },
      {
        type: 'list',
        items: [
          'Keep windows and doors closed. Use an air purifier if you have one.',
          'Drink plenty of water.',
          'Keep medication for heart and lung conditions within reach.',
          'See a doctor if you feel unwell, especially with breathing problems.',
        ],
      },
      { type: 'link', text: 'Live readings at haze.gov.sg', url: 'https://www.haze.gov.sg' },
    ],
  },
  {
    id: 'floods',
    title: 'Floods',
    subtitle: 'At home, on the road',
    source: 'SCDF Civil Defence Emergency Handbook, Chapter 3',
    blocks: [
      { type: 'callout', text: 'When there is a flood, move to higher ground.' },
      { type: 'h', text: 'At home' },
      {
        type: 'list',
        items: [
          'Follow PUB\u2019s flood alert channels or local radio and news for updates.',
          'Stay put, but grab your Ready Bag and be ready to evacuate when the authorities say so.',
          'If it is dangerous to stay, call 995 or 999 with your name and address, then evacuate to higher ground away from open areas, streams and storm drains.',
          'Use a stick to check the ground in front of you.',
        ],
      },
      { type: 'h', text: 'In a vehicle or on foot' },
      {
        type: 'list',
        items: [
          'Do not drive through water above kerb height or where road markings are no longer visible.',
          'If your vehicle stalls in rising water, do not restart it. Turn on hazard lights, call 995 or 999 and move to higher ground.',
          'Do not walk through moving water higher than your ankles.',
        ],
      },
    ],
  },
  {
    id: 'power',
    title: 'Power outages',
    subtitle: 'Lifts, appliances, updates',
    source: 'SCDF Civil Defence Emergency Handbook, Chapter 3',
    blocks: [
      { type: 'p', text: 'Keep a torchlight and spare batteries in your Ready Bag. Matches and candles are not advisable in the dark.' },
      { type: 'h', text: 'When the power goes out' },
      {
        type: 'list',
        items: [
          'Check whether the outage affects only you or nearby buildings too.',
          'Get your Ready Bag, turn on the torchlight and tune in to the radio.',
          'If you are trapped in a lift, stay calm, press the alarm button and wait. Never force the doors open.',
          'If someone else is trapped in a lift, call your EMSU (number at the lift lobby). Only call 995 or 999 if a life is at risk.',
          'Keep fridge doors closed.',
          'Switch off appliances to protect them from a surge when power returns.',
          'Check SP Group and the Energy Market Authority for official updates. Beware of fake news.',
        ],
      },
    ],
  },
  {
    id: 'ready-bag',
    title: 'Ready Bag',
    subtitle: 'What to pack',
    source: 'SCDF Civil Defence Emergency Handbook, Chapter 3',
    blocks: [
      { type: 'p', text: 'Take your Ready Bag with you if you have to leave home. Everyone in your family should know where it is, and it should be easy to reach in the dark.' },
      { type: 'h', text: 'Essential items' },
      {
        type: 'list',
        items: [
          'Torchlight, without batteries fitted',
          'Batteries, packed separately to avoid leaks and rust',
          'Essential personal medication and healthcare supplies',
          'Whistle',
          'First aid kit',
          'Childcare and other special care items',
          'N95 masks',
        ],
      },
      { type: 'h', text: 'Optional items' },
      {
        type: 'list',
        items: [
          'Cash',
          'Pocket radio, without batteries fitted',
          'Pre-charged power bank',
          'Bottled water and dry food',
          'A change of clothes',
          'A list of essential service numbers',
        ],
      },
      { type: 'callout', text: 'Keep the bag portable. It should not be too heavy or bulky to carry.' },
    ],
  },
  {
    id: 'warnings',
    title: 'SG Alert and warning sirens',
    subtitle: 'What each signal means',
    source: 'SCDF Civil Defence Emergency Handbook, Chapters 3 and 4',
    blocks: [
      { type: 'h', text: 'SG Alert' },
      { type: 'p', text: 'During a major emergency, SCDF broadcasts SG Alert messages straight to mobile phones. They sound even on silent and fill the screen. When you see one, stop, read it and follow the instructions. No app is needed.' },
      {
        type: 'table',
        caption: 'Public Warning System sirens',
        headers: ['Signal', 'Sound', 'What to do'],
        rows: [
          ['Alarm', 'Wailing blasts', 'Move to a Civil Defence shelter immediately'],
          ['All Clear', 'Continuous blasts', 'Leave the shelter in an orderly way'],
          ['Important Message', 'Pulsating blasts', 'Tune in to local radio, TV and phone alerts'],
        ],
      },
      { type: 'p', text: 'The Important Message signal is usually sounded islandwide on 15 February and 15 September each year.' },
      { type: 'link', text: 'Listen to the signals on scdf.gov.sg', url: 'https://www.scdf.gov.sg' },
    ],
  },
  {
    id: 'tremors',
    title: 'Tremors and lightning',
    subtitle: 'Indoors and outdoors',
    source: 'SCDF Civil Defence Emergency Handbook, Chapter 3',
    blocks: [
      { type: 'h', text: 'Tremors' },
      {
        type: 'steps',
        items: [
          'Keep calm and stay away from windows, shelves and anything that could fall.',
          'Take cover under a sturdy table.',
          'When the shaking stops, switch off gas and electrical appliances. Do not touch damaged wiring.',
          'Do not use naked flames. Report a gas pipe leak on 1800 752 1800.',
          'Look for new cracks in walls, columns and beams. Only evacuate if you see them.',
          'Tune in to local radio or TV. Only call 995 or 999 for a real emergency so lines stay free.',
        ],
      },
      { type: 'h', text: 'Lightning' },
      {
        type: 'list',
        items: [
          'Stay indoors, in a building or a vehicle, away from metal fixtures.',
          'At home, avoid showers and corded phones, and unplug electronics.',
          'Outdoors, get off high ground and off bicycles. Avoid tall trees and metal fences.',
          'If you cannot find shelter, crouch low in a ball-like position.',
        ],
      },
    ],
  },
];

export const guideById = (id) => GUIDES.find((g) => g.id === id);

export const EMERGENCY_NUMBERS = [
  { number: '995', label: 'Fire and ambulance' },
  { number: '999', label: 'Police' },
  { number: '1777', label: 'Non-emergency ambulance' },
];
