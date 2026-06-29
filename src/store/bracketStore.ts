import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useMemo } from 'react';
import type { Match, Picks, Team } from '../types';
import { applyPick, buildBracket, countDecided, getChampion, prunePicks } from '../lib/bracketEngine';
import { onReset, onSelect } from '../lib/analytics';

/**
 * Global state.
 *
 * We persist ONLY `picks` (matchId -> teamId) to localStorage via zustand's
 * `persist` middleware — that is the auto-save. Everything else (the full
 * bracket, the champion, progress) is *derived* on read, so persisted state
 * stays tiny and can never drift from the rendered bracket.
 *
 * Components subscribe to `picks` and compute the bracket with `useBracket()`,
 * which memoises by `picks` reference. Because every mutation produces a fresh
 * pruned `picks` object, derivation runs at most once per interaction.
 */

interface BracketState {
  picks: Picks;
  /** Click a team in a match: advance it (or toggle it off). */
  select: (matchId: string, teamId: string) => void;
  /** Replace all picks (used by Import / Share-link hydration). */
  setPicks: (picks: Picks) => void;
  /** Drop any stale/invalid/now-locked picks (run once after hydration). */
  normalize: () => void;
  /** Clear the whole bracket (official results stay — they're data). */
  reset: () => void;
}

export const useBracketStore = create<BracketState>()(
  persist(
    (set, get) => ({
      picks: {},
      select: (matchId, teamId) => {
        const prev = get().picks;
        const next = applyPick(prev, matchId, teamId);
        if (next === prev) return; // locked match or no-op — nothing to track
        set({ picks: next });
        // Analytics is a fire-and-forget side effect, kept out of the set() updater.
        onSelect(prev, next, matchId);
      },
      setPicks: (picks) => set({ picks: prunePicks(picks) }),
      normalize: () => set((state) => ({ picks: prunePicks(state.picks) })),
      reset: () => {
        const prev = get().picks;
        set({ picks: {} });
        onReset(prev);
      },
    }),
    {
      name: 'wc-knockout-picks',
      version: 1,
      // Persist only the raw picks; derived data is never stored.
      partialize: (state) => ({ picks: state.picks }),
    },
  ),
);

/* ----------------------------- derived hooks ----------------------------- */

/** The full bracket (rounds of matches), memoised by the current picks. */
export function useBracket(): Match[][] {
  const picks = useBracketStore((s) => s.picks);
  return useMemo(() => buildBracket(picks), [picks]);
}

/** Champion team, or undefined until the Final is decided. */
export function useChampion(): Team | undefined {
  const rounds = useBracket();
  return useMemo(() => getChampion(rounds), [rounds]);
}

/** { decided, total } progress for the whole bracket. */
export function useProgress(): { decided: number; total: number } {
  const rounds = useBracket();
  return useMemo(() => {
    const total = rounds.reduce((sum, r) => sum + r.length, 0);
    return { decided: countDecided(rounds), total };
  }, [rounds]);
}
