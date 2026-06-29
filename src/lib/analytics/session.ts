import type { BracketEntry } from './events';

/**
 * In-memory state for the *current* bracket build. Never persisted — it only
 * exists to attribute build time and change counts to a `bracket_completed`
 * event. Resets on completion / reset / a fresh import.
 */

let origin: BracketEntry = 'fresh';
let build: { startedAt: number; changes: number } | null = null;

export const setOrigin = (o: BracketEntry): void => {
  origin = o;
};
export const getOrigin = (): BracketEntry => origin;

/** Start timing a build (idempotent — won't reset an in-progress build). */
export const beginBuild = (): void => {
  if (!build) build = { startedAt: Date.now(), changes: 0 };
};
export const resetBuild = (): void => {
  build = null;
};
export const noteChange = (): void => {
  if (build) build.changes += 1;
};
export const getBuild = (): { startedAt: number; changes: number } | null => build;
