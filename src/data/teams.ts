import type { Team } from '../types';

/**
 * Team catalogue — the 32 nations that actually reached the Round of 32 at the
 * 2026 FIFA World Cup (Canada / Mexico / USA).
 *
 * This is the only place that knows about specific teams, their flags and
 * rankings. `code` feeds flagcdn.com (https://flagcdn.com/{code}.svg); England
 * uses the sub-region code "gb-eng".
 *
 * FIFA rankings are the official 1 April 2026 release. Listed here by rank for
 * readability — order is irrelevant to the bracket logic (the real Round-of-32
 * matchups live in `fixtures.ts`).
 */
export const TEAMS: Team[] = [
  { id: 'fr', name: 'France', code: 'fr', fifaRank: 1 },
  { id: 'es', name: 'Spain', code: 'es', fifaRank: 2 },
  { id: 'ar', name: 'Argentina', code: 'ar', fifaRank: 3 },
  { id: 'eng', name: 'England', code: 'gb-eng', fifaRank: 4 },
  { id: 'pt', name: 'Portugal', code: 'pt', fifaRank: 5 },
  { id: 'br', name: 'Brazil', code: 'br', fifaRank: 6 },
  { id: 'nl', name: 'Netherlands', code: 'nl', fifaRank: 7 },
  { id: 'ma', name: 'Morocco', code: 'ma', fifaRank: 8 },
  { id: 'be', name: 'Belgium', code: 'be', fifaRank: 9 },
  { id: 'de', name: 'Germany', code: 'de', fifaRank: 10 },
  { id: 'hr', name: 'Croatia', code: 'hr', fifaRank: 11 },
  { id: 'co', name: 'Colombia', code: 'co', fifaRank: 13 },
  { id: 'sn', name: 'Senegal', code: 'sn', fifaRank: 14 },
  { id: 'mx', name: 'Mexico', code: 'mx', fifaRank: 15 },
  { id: 'us', name: 'United States', code: 'us', fifaRank: 16 },
  { id: 'jp', name: 'Japan', code: 'jp', fifaRank: 18 },
  { id: 'ch', name: 'Switzerland', code: 'ch', fifaRank: 19 },
  { id: 'at', name: 'Austria', code: 'at', fifaRank: 23 },
  { id: 'ec', name: 'Ecuador', code: 'ec', fifaRank: 24 },
  { id: 'au', name: 'Australia', code: 'au', fifaRank: 26 },
  { id: 'eg', name: 'Egypt', code: 'eg', fifaRank: 29 },
  { id: 'ca', name: 'Canada', code: 'ca', fifaRank: 30 },
  { id: 'ci', name: 'Ivory Coast', code: 'ci', fifaRank: 33 },
  { id: 'dz', name: 'Algeria', code: 'dz', fifaRank: 36 },
  { id: 'se', name: 'Sweden', code: 'se', fifaRank: 39 },
  { id: 'no', name: 'Norway', code: 'no', fifaRank: 44 },
  { id: 'cd', name: 'DR Congo', code: 'cd', fifaRank: 51 },
  { id: 'ba', name: 'Bosnia & Herzegovina', code: 'ba', fifaRank: 52 },
  { id: 'za', name: 'South Africa', code: 'za', fifaRank: 60 },
  { id: 'py', name: 'Paraguay', code: 'py', fifaRank: 64 },
  { id: 'gh', name: 'Ghana', code: 'gh', fifaRank: 65 },
  { id: 'cv', name: 'Cape Verde', code: 'cv', fifaRank: 70 },
];

/** Fast lookup by id. Frozen to signal it is read-only reference data. */
export const TEAMS_BY_ID: Readonly<Record<string, Team>> = Object.freeze(
  Object.fromEntries(TEAMS.map((t) => [t.id, t])),
);
