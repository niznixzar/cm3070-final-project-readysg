// Badges. earned(profile) is checked after every progress change.
import { MISSIONS } from './missions';

const done = (p, id) => Boolean(p.completedMissions?.[id]);

export const BADGES = [
  {
    id: 'first-mission',
    name: 'First Mission',
    description: 'Complete any mission.',
    earned: (p) => Object.keys(p.completedMissions ?? {}).length >= 1,
  },
  {
    id: 'first-aid-learner',
    name: 'First Aid Learner',
    description: 'Complete the CPR-AED basics mission.',
    earned: (p) => done(p, 'cpr-basics'),
  },
  {
    id: 'haze-ready',
    name: 'Haze Ready',
    description: 'Complete both haze missions.',
    earned: (p) => done(p, 'haze-checklist') && done(p, 'haze-quiz'),
  },
  {
    id: 'resource-mapper',
    name: 'Resource Mapper',
    description: 'Add your first resource to the map.',
    earned: (p) => (p.contributions ?? 0) >= 1,
  },
  {
    id: 'community-contributor',
    name: 'Community Contributor',
    description: 'Add or confirm 5 map resources.',
    earned: (p) => (p.contributions ?? 0) + (p.verifications ?? 0) >= 5,
  },
  {
    id: 'streak-30',
    name: '30-Day Streak',
    description: 'Open ReadySG 30 days in a row.',
    earned: (p) => (p.streak?.longest ?? 0) >= 30,
  },
  {
    id: 'preparedness-expert',
    name: 'Preparedness Expert',
    description: 'Complete every mission.',
    earned: (p) => MISSIONS.every((m) => done(p, m.id)),
  },
];

export const badgeById = (id) => BADGES.find((b) => b.id === id);
