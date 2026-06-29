import type { Team } from '../types';

/**
 * Flag asset helper. We source flags from flagcdn.com (free, high-quality,
 * CDN-cached SVG + raster). Centralised here so swapping the provider — or
 * self-hosting flags for offline use — is a one-line change.
 */

/** Crisp vector flag, scales to any size. Used for cards and the champion. */
export const flagSvg = (team: Team): string => `https://flagcdn.com/${team.code}.svg`;

/**
 * Raster fallback at a fixed width (used as <img> srcSet density hints could be
 * added later). Kept available for environments that prefer PNG over SVG.
 */
export const flagPng = (team: Team, width = 80): string =>
  `https://flagcdn.com/w${width}/${team.code}.png`;
