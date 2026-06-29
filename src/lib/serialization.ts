import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string';
import type { Picks } from '../types';
import { prunePicks } from './bracketEngine';

/**
 * Serialization for Export / Import / Share.
 *
 * Share links use lz-string's URL-safe compression so even a full bracket fits
 * comfortably in a hash fragment (kept in `#` so static hosts like Cloudflare
 * Pages never try to route it). Import always re-prunes, so a tampered or stale
 * payload can never put the bracket into an inconsistent state.
 */

const SHARE_PARAM = 'p';

/** A versioned envelope keeps exported files forward-compatible. */
export interface PredictionFile {
  app: 'wc-knockout-simulator';
  version: 1;
  exportedAt: string;
  picks: Picks;
}

export function toFile(picks: Picks): PredictionFile {
  return {
    app: 'wc-knockout-simulator',
    version: 1,
    exportedAt: new Date().toISOString(),
    picks: prunePicks(picks),
  };
}

export function fromFileText(text: string): Picks {
  const parsed = JSON.parse(text) as Partial<PredictionFile>;
  if (!parsed || typeof parsed !== 'object' || !parsed.picks) {
    throw new Error('Not a valid predictions file.');
  }
  return prunePicks(parsed.picks as Picks);
}

/** Encode picks into a compact, URL-safe string. */
export function encodePicks(picks: Picks): string {
  return compressToEncodedURIComponent(JSON.stringify(prunePicks(picks)));
}

/** Decode a share string back into picks (returns null on failure). */
export function decodePicks(encoded: string): Picks | null {
  try {
    const json = decompressFromEncodedURIComponent(encoded);
    if (!json) return null;
    const picks = JSON.parse(json) as Picks;
    return prunePicks(picks);
  } catch {
    return null;
  }
}

/** Build a full shareable URL pointing at the current page. */
export function buildShareUrl(picks: Picks): string {
  const { origin, pathname } = window.location;
  return `${origin}${pathname}#${SHARE_PARAM}=${encodePicks(picks)}`;
}

/** Read picks from the current URL hash, if a share payload is present. */
export function readPicksFromUrl(): Picks | null {
  const hash = window.location.hash.replace(/^#/, '');
  if (!hash) return null;
  const params = new URLSearchParams(hash);
  const encoded = params.get(SHARE_PARAM);
  return encoded ? decodePicks(encoded) : null;
}

/** Remove the share payload from the URL without reloading. */
export function clearUrlPicks(): void {
  if (window.location.hash) {
    history.replaceState(null, '', window.location.pathname + window.location.search);
  }
}
