import type { Picks } from '../types';
import { matchId } from '../lib/ids';

/**
 * Official, already-played knockout results.
 *
 * Each entry LOCKS a match: its winner is pre-filled and the user can't change
 * it (the engine merges these on top of user picks, and the UI disables them).
 * As real matches finish, just add a line below — that's the only change needed.
 *
 * `scoreA` / `scoreB` are goals for the fixture's teamA / teamB respectively
 * (see the Round-of-32 order in `fixtures.ts`), powering the full-time badge.
 * Use `detail` for knockout matches that needed extra time or penalties.
 */
export interface OfficialResult {
  /** Team id that advanced. Must be one of the match's two participants. */
  winnerId: string;
  scoreA: number;
  scoreB: number;
  detail?: 'AET' | 'PENS';
}

/**
 * Keyed by the engine's match id. Helper `matchId(round, index)` keeps these in
 * sync with the bracket geometry instead of hand-writing "r0m2" strings.
 *
 * Round of 32 index map (from fixtures.ts):
 *   0 Ger/Par · 1 Fra/Swe · 2 Can/RSA · 3 Ned/Mor · 4 Por/Cro · 5 Esp/Aut
 *   6 USA/Bos · 7 Bel/Sen · 8 Bra/Jpn · 9 Civ/Nor · 10 Mex/Ecu · 11 Eng/Cod
 *   12 Arg/CPV · 13 Aus/Egy · 14 Sui/Alg · 15 Col/Gha
 */
export const OFFICIAL_RESULTS: Record<string, OfficialResult> = {
  // 28 Jun · Canada 1–0 South Africa (Eustáquio, stoppage time) → Canada advance.
  [matchId(0, 2)]: { winnerId: 'ca', scoreA: 1, scoreB: 0 },
};

/** Just the winners, for merging into the bracket derivation. */
export const OFFICIAL_WINNERS: Picks = Object.fromEntries(
  Object.entries(OFFICIAL_RESULTS).map(([id, r]) => [id, r.winnerId]),
);

/** Whether a given match id is an official, locked result. */
export const isLocked = (id: string): boolean =>
  Object.prototype.hasOwnProperty.call(OFFICIAL_RESULTS, id);
