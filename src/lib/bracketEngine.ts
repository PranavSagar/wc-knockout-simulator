import type { Match, Picks, Team } from '../types';
import { ROUND_OF_32, ROUNDS } from '../data/fixtures';
import { TEAMS_BY_ID } from '../data/teams';
import { OFFICIAL_WINNERS, isLocked } from '../data/results';
import { matchId } from './ids';

export { matchId };

/**
 * The bracket engine.
 *
 * Design decision — single source of truth:
 * The ONLY state we store is `picks` (matchId -> winning teamId). Every round's
 * participants are *derived* from the winners of the previous round. This makes
 * the "changing an earlier result recalculates everything downstream" behaviour
 * fall out for free and impossible to get wrong:
 *
 *   - A pick is only honoured if the chosen team is actually one of the two
 *     (derived) participants of that match. If an upstream change means the
 *     picked team is no longer present, the pick silently evaporates, and so do
 *     all picks that depended on it — automatically, no manual cascade needed.
 *
 * Trade-off: we rebuild the whole bracket on each change. That's 31 matches —
 * trivially cheap — and we memoise it per `picks` reference at the React layer,
 * so the cost is paid at most once per interaction. We trade a few microseconds
 * for guaranteed consistency and far simpler code than mutating a shared tree.
 *
 * Official results: already-played matches (see data/results.ts) are merged on
 * top of the user's picks, so they always win and form a fixed, consistent
 * prefix of the bracket the user predicts the rest of.
 */

/**
 * Merge official (locked) results over the user's picks. Official results take
 * precedence — a played match can't be re-predicted.
 */
function effectivePicks(userPicks: Picks): Picks {
  return { ...userPicks, ...OFFICIAL_WINNERS };
}

/** A pick counts only if the team is one of the two current participants. */
function resolveWinner(
  pickedId: string | undefined,
  teamA: Team | undefined,
  teamB: Team | undefined,
): string | undefined {
  if (!pickedId) return undefined;
  if (pickedId === teamA?.id || pickedId === teamB?.id) return pickedId;
  return undefined;
}

/**
 * Build the full bracket (array of rounds, each an array of matches) from picks.
 * Pure and deterministic: same picks in => same bracket out.
 */
export function buildBracket(userPicks: Picks): Match[][] {
  const picks = effectivePicks(userPicks);
  const rounds: Match[][] = [];

  // Round 0 — Round of 32: participants come straight from the fixtures.
  const first: Match[] = ROUND_OF_32.map(([idA, idB], i) => {
    const teamA = TEAMS_BY_ID[idA];
    const teamB = TEAMS_BY_ID[idB];
    const id = matchId(0, i);
    return {
      id,
      roundIndex: 0,
      indexInRound: i,
      teamA,
      teamB,
      winnerId: resolveWinner(picks[id], teamA, teamB),
      locked: isLocked(id),
    };
  });
  rounds.push(first);

  // Later rounds — participants are the winners of the two feeder matches.
  for (let r = 1; r < ROUNDS.length; r++) {
    const prev = rounds[r - 1];
    const matches: Match[] = [];
    for (let i = 0; i < prev.length / 2; i++) {
      const feederA = prev[2 * i];
      const feederB = prev[2 * i + 1];
      const teamA = feederA.winnerId ? TEAMS_BY_ID[feederA.winnerId] : undefined;
      const teamB = feederB.winnerId ? TEAMS_BY_ID[feederB.winnerId] : undefined;
      const id = matchId(r, i);
      matches.push({
        id,
        roundIndex: r,
        indexInRound: i,
        teamA,
        teamB,
        winnerId: resolveWinner(picks[id], teamA, teamB),
        locked: isLocked(id),
      });
    }
    rounds.push(matches);
  }

  return rounds;
}

/** The champion = winner of the single Final match, if decided. */
export function getChampion(rounds: Match[][]): Team | undefined {
  const finalMatch = rounds[rounds.length - 1]?.[0];
  if (!finalMatch?.winnerId) return undefined;
  return TEAMS_BY_ID[finalMatch.winnerId];
}

/** Count of matches that currently have a valid, decided winner. */
export function countDecided(rounds: Match[][]): number {
  let n = 0;
  for (const round of rounds) for (const m of round) if (m.winnerId) n++;
  return n;
}

/**
 * Normalise a USER picks map: keep only the picks that survive derivation (i.e.
 * are still valid given everything upstream), excluding locked/official results
 * (those live in data, not in user state). Used after every mutation so the
 * persisted/exported/shared state stays clean and free of orphaned entries.
 */
export function prunePicks(picks: Picks): Picks {
  const rounds = buildBracket(picks);
  const next: Picks = {};
  for (const round of rounds) {
    for (const m of round) {
      if (m.winnerId && !m.locked) next[m.id] = m.winnerId;
    }
  }
  return next;
}

/**
 * Apply a click on `teamId` in `matchId`:
 *  - locked (already-played) matches are immutable — the click is ignored,
 *  - clicking the current winner again clears the pick (toggle off),
 *  - otherwise the team is set as winner.
 * The result is pruned so any now-invalid downstream picks are dropped.
 */
export function applyPick(picks: Picks, mId: string, teamId: string): Picks {
  if (isLocked(mId)) return picks; // official result, not user-editable
  const next: Picks = { ...picks };
  if (next[mId] === teamId) {
    delete next[mId];
  } else {
    next[mId] = teamId;
  }
  return prunePicks(next);
}
