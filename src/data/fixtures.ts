import type { RoundMeta } from '../types';

/**
 * Round of 32 fixtures — the 16 opening matchups, as [teamIdA, teamIdB] pairs.
 *
 * This is the only seeding the app needs: every later round is *derived* from
 * the winners of these matches by the bracket engine. The order also defines the
 * bracket geometry (match i feeds into match floor(i/2) of the next round), so
 * the two strongest seeds sit in opposite halves and can only meet in the Final.
 *
 * Arranged by standard single-elimination seeding for 32:
 *   1v32 16v17 8v25 9v24 4v29 13v20 5v28 12v21 | 2v31 15v18 7v26 10v23 3v30 14v19 6v27 11v22
 */
export const ROUND_OF_32: ReadonlyArray<readonly [string, string]> = [
  ['ar', 'sa'], // 1 v 32
  ['mx', 'ch'], // 16 v 17
  ['be', 'at'], // 8 v 25
  ['it', 'ua'], // 9 v 24
  ['eng', 'ec'], // 4 v 29
  ['co', 'dk'], // 13 v 20
  ['br', 'wal'], // 5 v 28
  ['ma', 'ir'], // 12 v 21
  ['fr', 'ng'], // 2 v 31
  ['us', 'jp'], // 15 v 18
  ['nl', 'rs'], // 7 v 26
  ['de', 'au'], // 10 v 23
  ['es', 'ca'], // 3 v 30
  ['uy', 'sn'], // 14 v 19
  ['pt', 'pl'], // 6 v 27
  ['hr', 'kr'], // 11 v 22
];

/**
 * Round metadata, ordered from first knockout round to the Final.
 * `matchCount` is informational; the engine derives counts by halving.
 */
export const ROUNDS: ReadonlyArray<RoundMeta> = [
  { key: 'R32', label: 'Round of 32', short: 'R32', matchCount: 16 },
  { key: 'R16', label: 'Round of 16', short: 'R16', matchCount: 8 },
  { key: 'QF', label: 'Quarter-finals', short: 'QF', matchCount: 4 },
  { key: 'SF', label: 'Semi-finals', short: 'SF', matchCount: 2 },
  { key: 'F', label: 'Final', short: 'Final', matchCount: 1 },
];

/** Total number of matches across the whole bracket (16+8+4+2+1). */
export const TOTAL_MATCHES = ROUNDS.reduce((sum, r) => sum + r.matchCount, 0);
