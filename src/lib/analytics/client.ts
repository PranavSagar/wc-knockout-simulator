import type { AnalyticsAdapter, AnalyticsEventMap, AnalyticsEventName } from './events';
import { createPostHogAdapter } from './posthog';

/**
 * Provider-agnostic analytics core.
 *
 * Responsibilities: lazy/idle initialisation, an event queue so nothing is lost
 * before the SDK is ready, opt-out / Do-Not-Track enforcement, and a DEV console
 * logger so instrumentation can be verified without a live key. It is fire-and-
 * forget: every call is wrapped so a failing/blocked analytics backend can never
 * break the app.
 */

const DEV = import.meta.env.DEV;
const OPTOUT_KEY = 'wc-analytics-optout';

let adapter: AnalyticsAdapter | null = null;
let ready = false;
let suppressed = false;
const queue: Array<{ name: string; props?: Record<string, unknown> }> = [];

function dntEnabled(): boolean {
  if (typeof navigator === 'undefined') return false;
  const dnt =
    navigator.doNotTrack ||
    (window as unknown as { doNotTrack?: string }).doNotTrack ||
    (navigator as unknown as { msDoNotTrack?: string }).msDoNotTrack;
  return dnt === '1' || dnt === 'yes';
}

function storedOptOut(): boolean {
  try {
    return localStorage.getItem(OPTOUT_KEY) === '1';
  } catch {
    return false;
  }
}

function whenIdle(fn: () => void): void {
  const w = window as unknown as { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => void };
  if (typeof w.requestIdleCallback === 'function') w.requestIdleCallback(fn, { timeout: 2000 });
  else window.setTimeout(fn, 1);
}

/** Initialise analytics once, after the app is interactive. Safe to call again. */
export function initAnalytics(): void {
  if (typeof window === 'undefined' || adapter) return;

  suppressed = storedOptOut() || dntEnabled();
  if (suppressed) {
    if (DEV) console.debug('[analytics] disabled (opt-out or Do-Not-Track)');
    return;
  }

  const key = import.meta.env.VITE_POSTHOG_KEY;
  if (DEV && !key) console.debug('[analytics] no VITE_POSTHOG_KEY set — DEV logging only');

  whenIdle(() => {
    adapter = createPostHogAdapter({ key, host: import.meta.env.VITE_POSTHOG_HOST });
    Promise.resolve(adapter.init())
      .then(() => {
        ready = true;
        for (const e of queue) adapter!.capture(e.name, e.props);
        queue.length = 0;
      })
      .catch(() => {
        /* swallow — analytics must never surface errors to the user */
      });
  });
}

/** Emit a typed event. Buffered until the adapter is ready; never throws. */
export function track<K extends AnalyticsEventName>(name: K, props: AnalyticsEventMap[K]): void {
  if (DEV) console.debug('[analytics]', name, props);
  if (suppressed) return;
  const payload = props as Record<string, unknown>;
  if (!ready || !adapter) {
    queue.push({ name, props: payload });
    return;
  }
  try {
    adapter.capture(name, payload);
  } catch {
    /* swallow */
  }
}

/** Whether a product-analytics backend is actually configured (key present). */
export function isAnalyticsConfigured(): boolean {
  return Boolean(import.meta.env.VITE_POSTHOG_KEY);
}

export function isOptedOut(): boolean {
  return storedOptOut();
}

export function optOut(): void {
  suppressed = true;
  try {
    localStorage.setItem(OPTOUT_KEY, '1');
  } catch {
    /* ignore */
  }
  adapter?.optOut();
}

export function optIn(): void {
  try {
    localStorage.removeItem(OPTOUT_KEY);
  } catch {
    /* ignore */
  }
  suppressed = false;
  if (adapter) adapter.optIn();
  else initAnalytics();
}
