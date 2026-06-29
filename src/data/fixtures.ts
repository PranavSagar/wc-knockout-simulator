import type { RoundMeta } from '../types';

/**
 * Round of 32 — the REAL 2026 FIFA World Cup knockout bracket.
 *
 * The 16 opening matchups as [teamIdA, teamIdB] pairs. Crucially, the ORDER here
 * is not cosmetic: the engine pairs match `i` with match `i+1` into the next
 * round (match `i` feeds Round-of-16 match `floor(i/2)`). So this array is laid
 * out to reproduce FIFA's official fixed bracket exactly — the same path to the
 * final that the real teams face.
 *
 * Mapping to FIFA's official match numbers (R32 = 73–88), decoded from the
 * official Round-of-16 feeds so the halves line up:
 *   R16: M89(W74,W77) M90(W73,W75) M93(W83,W84) M94(W81,W82)
 *        M91(W76,W78) M92(W79,W80) M95(W86,W88) M96(W85,W87)
 *   QF:  M97(89,90) M98(93,94) M99(91,92) M100(95,96)
 *   SF:  M101(97,98) M102(99,100)  →  Final(101,102)
 *
 * Index → official match → fixture:
 */
export const ROUND_OF_32: ReadonlyArray<readonly [string, string]> = [
  ['de', 'py'], //  0 · M74 · Germany v Paraguay
  ['fr', 'se'], //  1 · M77 · France v Sweden
  ['ca', 'za'], //  2 · M73 · Canada v South Africa
  ['nl', 'ma'], //  3 · M75 · Netherlands v Morocco
  ['pt', 'hr'], //  4 · M83 · Portugal v Croatia
  ['es', 'at'], //  5 · M84 · Spain v Austria
  ['us', 'ba'], //  6 · M81 · USA v Bosnia & Herzegovina
  ['be', 'sn'], //  7 · M82 · Belgium v Senegal
  ['br', 'jp'], //  8 · M76 · Brazil v Japan
  ['ci', 'no'], //  9 · M78 · Ivory Coast v Norway
  ['mx', 'ec'], // 10 · M79 · Mexico v Ecuador
  ['eng', 'cd'], // 11 · M80 · England v DR Congo
  ['ar', 'cv'], // 12 · M86 · Argentina v Cape Verde
  ['au', 'eg'], // 13 · M88 · Australia v Egypt
  ['ch', 'dz'], // 14 · M85 · Switzerland v Algeria
  ['co', 'gh'], // 15 · M87 · Colombia v Ghana
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
