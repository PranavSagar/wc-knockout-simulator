import type { Match, Picks } from '../../types';
import { ROUNDS } from '../../data/fixtures';
import { buildBracket, getChampion } from '../bracketEngine';
import { track } from './client';
import { beginBuild, getBuild, getOrigin, noteChange, resetBuild, setOrigin } from './session';

/**
 * Domain-level analytics: translates state transitions into the typed event
 * catalog. All the "what counts as a pick vs a change vs a completion" logic
 * lives here (not in the store/components), so instrumentation stays in one
 * place and the call sites are trivial one-liners.
 */

const roundKey = (roundIndex: number) => ROUNDS[roundIndex].key;
const decidedCount = (picks: Picks) => Object.keys(picks).length; // user picks only (locked results aren't here)
const isComplete = (picks: Picks) => Boolean(getChampion(buildBracket(picks)));

function findMatch(rounds: Match[][], id: string): Match | undefined {
  for (const round of rounds) for (const m of round) if (m.id === id) return m;
  return undefined;
}

function snapshot(picks: Picks) {
  return { decided_count: decidedCount(picks), completed: isComplete(picks) };
}

/* ------------------------------- lifecycle ------------------------------- */

export function onAppLoaded(picks: Picks, hasSharedBracket: boolean): void {
  setOrigin(hasSharedBracket ? 'shared' : 'fresh');
  track('app_loaded', { has_shared_bracket: hasSharedBracket });
  // A shared, still-incomplete bracket: time any further building from now.
  if (hasSharedBracket && decidedCount(picks) > 0 && !isComplete(picks)) beginBuild();
}

/**
 * A single `select()` action. Diffs the affected match before/after to emit the
 * right events: bracket_started (first pick), match_predicted (team chosen),
 * prediction_changed (replaced/cleared) and bracket_completed (Final decided).
 */
export function onSelect(prev: Picks, next: Picks, matchId: string): void {
  const prevRounds = buildBracket(prev);
  const nextRounds = buildBracket(next);
  const prevMatch = findMatch(prevRounds, matchId);
  const nextMatch = findMatch(nextRounds, matchId);
  if (!nextMatch) return;

  const prevWinner = prevMatch?.winnerId;
  const nextWinner = nextMatch.winnerId;
  const round = roundKey(nextMatch.roundIndex);

  if (decidedCount(prev) === 0 && decidedCount(next) > 0) {
    beginBuild();
    track('bracket_started', { entry: getOrigin() });
  }

  if (nextWinner && nextWinner !== prevWinner) {
    const winner = nextWinner === nextMatch.teamA?.id ? nextMatch.teamA : nextMatch.teamB;
    const loser = nextWinner === nextMatch.teamA?.id ? nextMatch.teamB : nextMatch.teamA;
    if (winner && loser) {
      track('match_predicted', {
        round,
        match_id: matchId,
        winner_id: winner.id,
        loser_id: loser.id,
        winner_rank: winner.fifaRank,
        loser_rank: loser.fifaRank,
        is_upset: winner.fifaRank > loser.fifaRank,
        rank_gap: winner.fifaRank - loser.fifaRank,
      });
    }
    if (prevWinner) {
      noteChange();
      track('prediction_changed', { round, match_id: matchId, from_team_id: prevWinner, to_team_id: nextWinner });
    }
  } else if (prevWinner && !nextWinner) {
    noteChange();
    track('prediction_changed', { round, match_id: matchId, from_team_id: prevWinner, to_team_id: null });
  }

  if (getChampion(nextRounds) && !getChampion(prevRounds)) {
    emitCompletion(nextRounds);
  }
}

function emitCompletion(rounds: Match[][]): void {
  const finalMatch = rounds[rounds.length - 1][0];
  const sfRound = rounds[rounds.length - 2];
  const championId = finalMatch.winnerId!;
  const finalistIds = [finalMatch.teamA?.id, finalMatch.teamB?.id].filter(Boolean) as string[];
  const semifinalistIds = sfRound.flatMap((m) => [m.teamA?.id, m.teamB?.id]).filter(Boolean) as string[];

  let upsetCount = 0;
  for (const round of rounds) {
    for (const m of round) {
      if (m.winnerId && m.teamA && m.teamB) {
        const w = m.winnerId === m.teamA.id ? m.teamA : m.teamB;
        const l = m.winnerId === m.teamA.id ? m.teamB : m.teamA;
        if (w.fifaRank > l.fifaRank) upsetCount += 1;
      }
    }
  }

  const build = getBuild();
  track('bracket_completed', {
    champion_id: championId,
    runner_up_id: finalistIds.find((id) => id !== championId) ?? '',
    finalist_ids: finalistIds,
    semifinalist_ids: semifinalistIds,
    upset_count: upsetCount,
    changes_count: build?.changes ?? 0,
    duration_ms: build ? Date.now() - build.startedAt : null,
    entry: getOrigin(),
  });
  resetBuild();
}

export function onReset(prev: Picks): void {
  track('bracket_reset', { decided_before: decidedCount(prev) });
  setOrigin('fresh');
  resetBuild();
}

/* ------------------------------- commands -------------------------------- */

export function onExport(picks: Picks): void {
  track('predictions_exported', snapshot(picks));
}

export function onShare(picks: Picks): void {
  track('bracket_shared', snapshot(picks));
}

export function onImport(picks: Picks): void {
  setOrigin('imported');
  resetBuild();
  if (decidedCount(picks) > 0 && !isComplete(picks)) beginBuild();
  track('predictions_imported', snapshot(picks));
}
