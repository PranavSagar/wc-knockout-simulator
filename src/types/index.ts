/**
 * Domain types. Intentionally framework-agnostic so the data layer and the
 * bracket engine never depend on React.
 */

export interface Team {
  /** Stable unique id (we reuse the flag code, which is unique per team). */
  id: string;
  name: string;
  /**
   * flagcdn.com code — ISO 3166-1 alpha-2 (e.g. "ar"), or a sub-region code
   * such as "gb-eng" / "gb-wls". Used to build the flag image URL.
   */
  code: string;
  fifaRank: number;
  /** Optional tournament seed (1 = strongest). Purely cosmetic. */
  seed?: number;
}

export type RoundKey = 'R32' | 'R16' | 'QF' | 'SF' | 'F';

export interface RoundMeta {
  key: RoundKey;
  label: string;
  short: string;
  matchCount: number;
}

export interface Match {
  /** Deterministic id, e.g. "r0m5" (round index 0, match index 5). */
  id: string;
  roundIndex: number;
  indexInRound: number;
  teamA?: Team;
  teamB?: Team;
  /** Id of the team the user picked to win this match (validated/derived). */
  winnerId?: string;
  /**
   * True when this match has an official, already-played result. Locked matches
   * are pre-filled and cannot be changed by the user.
   */
  locked?: boolean;
}

/** The ONLY persisted state: a map of matchId -> winning teamId. */
export type Picks = Record<string, string>;
