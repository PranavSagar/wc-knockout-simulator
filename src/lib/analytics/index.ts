/**
 * Public analytics surface. App code imports only from here — never a vendor SDK
 * — so the provider stays swappable behind this barrel.
 *
 *  - Low-level:  initAnalytics, track, optIn/optOut/isOptedOut
 *  - Domain:     onAppLoaded, onSelect, onReset, onExport, onImport, onShare
 *
 * See ../../../docs/analytics.md for the event catalog and dashboard recipes.
 */
export { initAnalytics, track, optIn, optOut, isOptedOut } from './client';
export { onAppLoaded, onSelect, onReset, onExport, onImport, onShare } from './tracking';
