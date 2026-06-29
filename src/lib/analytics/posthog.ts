import type { PostHog } from 'posthog-js';
import type { AnalyticsAdapter } from './events';

/**
 * PostHog adapter.
 *
 * The SDK is **dynamically imported inside `init`** so it never lands in the
 * initial bundle and only loads after the app is interactive. When no project
 * key is configured the adapter becomes a no-op (and the SDK is never even
 * fetched) — so forks, local dev, and preview builds work without analytics and
 * without errors.
 *
 * Config is privacy-first: no autocapture, no session recording, cookieless
 * (localStorage) persistence, Do-Not-Track respected, and EU data residency by
 * default. Capturing pageviews here gives PostHog the session/funnel context for
 * product analysis (high-volume traffic still goes to Cloudflare Web Analytics).
 */
export function createPostHogAdapter(opts: { key?: string; host?: string }): AnalyticsAdapter {
  let ph: PostHog | null = null;

  return {
    async init() {
      if (!opts.key) return; // no key → no-op adapter, SDK not loaded
      const { default: posthog } = await import('posthog-js');
      posthog.init(opts.key, {
        api_host: opts.host || 'https://eu.i.posthog.com',
        autocapture: false,
        capture_pageview: true,
        capture_pageleave: true,
        disable_session_recording: true,
        persistence: 'localStorage',
        respect_dnt: true,
        person_profiles: 'identified_only',
      });
      ph = posthog;
    },
    capture(event, props) {
      ph?.capture(event, props);
    },
    optOut() {
      ph?.opt_out_capturing();
    },
    optIn() {
      ph?.opt_in_capturing();
    },
  };
}
