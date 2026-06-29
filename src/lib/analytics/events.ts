import type { RoundKey } from '../../types';

/**
 * The event catalog — the single source of truth for analytics.
 *
 * Adding a new event is a one-line addition here: declare its name and the shape
 * of its properties, and every `track(name, props)` call site is instantly type-
 * checked and auto-completed. Names are snake_case and stable (renaming breaks
 * historical reporting), properties are flat and primitive-friendly so they map
 * cleanly onto PostHog breakdowns / HogQL without any schema migration.
 */
export interface AnalyticsEventMap {
  /** Fired once per page load. */
  app_loaded: { has_shared_bracket: boolean };

  /** First user pick on an empty bracket — i.e. a bracket is being created. */
  bracket_started: { entry: BracketEntry };

  /** A team was picked to win a match (fires on a new pick or a changed pick). */
  match_predicted: {
    round: RoundKey;
    match_id: string;
    winner_id: string;
    loser_id: string;
    winner_rank: number;
    loser_rank: number;
    /** Lower-ranked team won (winner_rank > loser_rank). */
    is_upset: boolean;
    /** winner_rank - loser_rank (positive = bigger upset). */
    rank_gap: number;
  };

  /** An existing pick was altered or cleared (powers "avg changes per bracket"). */
  prediction_changed: {
    round: RoundKey;
    match_id: string;
    from_team_id: string;
    to_team_id: string | null;
  };

  /** The Final was decided — the whole bracket is complete. */
  bracket_completed: {
    champion_id: string;
    runner_up_id: string;
    finalist_ids: string[];
    semifinalist_ids: string[];
    upset_count: number;
    changes_count: number;
    /** Build time, or null when the bracket was loaded (shared/imported). */
    duration_ms: number | null;
    entry: BracketEntry;
  };

  bracket_reset: { decided_before: number };
  predictions_exported: BracketSnapshot;
  predictions_imported: BracketSnapshot;
  bracket_shared: BracketSnapshot;
}

/** How the current bracket came to be — drives build-time attribution. */
export type BracketEntry = 'fresh' | 'shared' | 'imported';

/** Lightweight snapshot attached to export/import/share events. */
export interface BracketSnapshot {
  decided_count: number;
  completed: boolean;
}

export type AnalyticsEventName = keyof AnalyticsEventMap;

/**
 * Provider abstraction. Any analytics backend (PostHog today, something else
 * tomorrow, or several at once) implements this. The app never imports a vendor
 * SDK directly — only this interface — so swapping providers is a one-file change.
 */
export interface AnalyticsAdapter {
  init(): Promise<void> | void;
  capture(event: string, props?: Record<string, unknown>): void;
  optOut(): void;
  optIn(): void;
}
