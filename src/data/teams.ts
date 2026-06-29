import type { Team } from '../types';

/**
 * Team catalogue.
 *
 * This is deliberately the ONLY place that knows about specific teams, their
 * flags and rankings. To run the simulator for a different tournament or with
 * the real draw, edit this file and `fixtures.ts` — nothing else needs to change.
 *
 * `code` feeds flagcdn.com (https://flagcdn.com/{code}.svg). England & Wales use
 * the sub-region codes "gb-eng" / "gb-wls".
 *
 * Rankings reflect a recent FIFA snapshot and double as the seeds (rank N => seed N).
 * They are illustrative placeholders until the real 2026 knockout draw is known.
 */
export const TEAMS: Team[] = [
  { id: 'ar', name: 'Argentina', code: 'ar', fifaRank: 1, seed: 1 },
  { id: 'fr', name: 'France', code: 'fr', fifaRank: 2, seed: 2 },
  { id: 'es', name: 'Spain', code: 'es', fifaRank: 3, seed: 3 },
  { id: 'eng', name: 'England', code: 'gb-eng', fifaRank: 4, seed: 4 },
  { id: 'br', name: 'Brazil', code: 'br', fifaRank: 5, seed: 5 },
  { id: 'pt', name: 'Portugal', code: 'pt', fifaRank: 6, seed: 6 },
  { id: 'nl', name: 'Netherlands', code: 'nl', fifaRank: 7, seed: 7 },
  { id: 'be', name: 'Belgium', code: 'be', fifaRank: 8, seed: 8 },
  { id: 'it', name: 'Italy', code: 'it', fifaRank: 9, seed: 9 },
  { id: 'de', name: 'Germany', code: 'de', fifaRank: 10, seed: 10 },
  { id: 'hr', name: 'Croatia', code: 'hr', fifaRank: 11, seed: 11 },
  { id: 'ma', name: 'Morocco', code: 'ma', fifaRank: 12, seed: 12 },
  { id: 'co', name: 'Colombia', code: 'co', fifaRank: 13, seed: 13 },
  { id: 'uy', name: 'Uruguay', code: 'uy', fifaRank: 14, seed: 14 },
  { id: 'us', name: 'United States', code: 'us', fifaRank: 15, seed: 15 },
  { id: 'mx', name: 'Mexico', code: 'mx', fifaRank: 16, seed: 16 },
  { id: 'ch', name: 'Switzerland', code: 'ch', fifaRank: 17, seed: 17 },
  { id: 'jp', name: 'Japan', code: 'jp', fifaRank: 18, seed: 18 },
  { id: 'sn', name: 'Senegal', code: 'sn', fifaRank: 19, seed: 19 },
  { id: 'dk', name: 'Denmark', code: 'dk', fifaRank: 20, seed: 20 },
  { id: 'ir', name: 'Iran', code: 'ir', fifaRank: 21, seed: 21 },
  { id: 'kr', name: 'South Korea', code: 'kr', fifaRank: 22, seed: 22 },
  { id: 'au', name: 'Australia', code: 'au', fifaRank: 23, seed: 23 },
  { id: 'ua', name: 'Ukraine', code: 'ua', fifaRank: 24, seed: 24 },
  { id: 'at', name: 'Austria', code: 'at', fifaRank: 25, seed: 25 },
  { id: 'rs', name: 'Serbia', code: 'rs', fifaRank: 26, seed: 26 },
  { id: 'pl', name: 'Poland', code: 'pl', fifaRank: 27, seed: 27 },
  { id: 'wal', name: 'Wales', code: 'gb-wls', fifaRank: 28, seed: 28 },
  { id: 'ec', name: 'Ecuador', code: 'ec', fifaRank: 29, seed: 29 },
  { id: 'ca', name: 'Canada', code: 'ca', fifaRank: 30, seed: 30 },
  { id: 'ng', name: 'Nigeria', code: 'ng', fifaRank: 31, seed: 31 },
  { id: 'sa', name: 'Saudi Arabia', code: 'sa', fifaRank: 32, seed: 32 },
];

/** Fast lookup by id. Frozen to signal it is read-only reference data. */
export const TEAMS_BY_ID: Readonly<Record<string, Team>> = Object.freeze(
  Object.fromEntries(TEAMS.map((t) => [t.id, t])),
);
