import {
  Flame, BookOpen, Dumbbell, MoonStar, HandHeart,
  Sparkles, Moon, BedDouble, AlarmClock, Clock
} from 'lucide-react';

export const TASKS = {
  nofap: {
    id: 'nofap',
    name: 'NoFap',
    icon: Flame,
    points: 5,
    color: '#ef4444',
    description: 'Derived from Prayer completion',
    requirement: 'Auto-completes when Prayer is done',
    isDerived: true,
    timeWindow: null,
  },
  gate_study: {
    id: 'gate_study',
    name: 'GATE Study',
    icon: BookOpen,
    points: 5,
    color: '#6c63ff',
    description: '≥180 min total, sessions ≥25 min each',
    requirement: 'Camera snapshot every 10 min',
    isDerived: false,
    isStudy: true,
    timeWindow: null,
  },
  gym: {
    id: 'gym',
    name: 'Gym',
    icon: Dumbbell,
    points: 3,
    color: '#f59e0b',
    description: 'Live photo + GPS required',
    requirement: 'Camera + GPS location',
    isDerived: false,
    timeWindow: { start: '5:00 PM', end: '11:00 PM' },
    needsCamera: true,
    needsGps: true,
  },
  night_walk: {
    id: 'night_walk',
    name: 'Night Walk',
    icon: MoonStar,
    points: 2,
    color: '#22d3ee',
    description: 'Upload a photo from gallery with details',
    requirement: 'Gallery photo upload',
    isDerived: false,
    timeWindow: null,
    needsGallery: true,
  },
  prayer: {
    id: 'prayer',
    name: 'Prayer',
    icon: HandHeart,
    points: 2,
    color: '#a78bfa',
    description: 'Upload a photo from gallery with details',
    requirement: 'Gallery photo upload',
    isDerived: false,
    timeWindow: null,
    needsGallery: true,
  },
  skincare_morning: {
    id: 'skincare_morning',
    name: 'Skincare Morning',
    icon: Sparkles,
    points: 1,
    color: '#fbbf24',
    description: 'Selfie capture required',
    requirement: 'Camera selfie',
    isDerived: false,
    timeWindow: { start: '6:00 AM', end: '11:00 AM' },
    needsCamera: true,
  },
  skincare_night: {
    id: 'skincare_night',
    name: 'Skincare Night',
    icon: Moon,
    points: 1,
    color: '#818cf8',
    description: 'Selfie capture required',
    requirement: 'Camera selfie',
    isDerived: false,
    timeWindow: { start: '9:00 PM', end: '2:00 AM' },
    needsCamera: true,
  },
  sleep: {
    id: 'sleep',
    name: 'Sleep Before 3AM',
    icon: BedDouble,
    points: 3,
    color: '#34d399',
    description: 'Auto-fails if app opened after 3 AM',
    requirement: 'Close app before 3 AM',
    isDerived: true,
    timeWindow: null,
  },
  wake: {
    id: 'wake',
    name: 'Wake Before 8AM',
    icon: AlarmClock,
    points: 3,
    color: '#fb923c',
    description: 'Check in before 8 AM (except Sunday)',
    requirement: 'Open app & check in',
    isDerived: false,
    timeWindow: { start: '—', end: '8:00 AM' },
    isSundayExcluded: true,
  },
};

export const TASK_ORDER = [
  'nofap', 'gate_study', 'gym', 'night_walk', 'prayer',
  'skincare_morning', 'skincare_night', 'sleep', 'wake',
];

export const MOTIVATIONAL_MESSAGES = [
  "Stay locked in.",
  "No excuses today.",
  "You either win or reset.",
  "Consistency = power.",
  "Don't fold now.",
  "Discipline over motivation.",
  "Actions define you.",
  "No shortcuts. No mercy.",
  "The grind doesn't sleep.",
  "Pain today, power tomorrow.",
  "Control the chaos.",
  "Weak days build weak men.",
  "Show up or shut up.",
  "Your future self is watching.",
  "Stack the wins.",
];

export function getTodayMessage() {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000
  );
  return MOTIVATIONAL_MESSAGES[dayOfYear % MOTIVATIONAL_MESSAGES.length];
}
