import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, MousePointerClick } from 'lucide-react';
import { Header } from './components/Header';
import { Bracket } from './components/Bracket';
import { ChampionBanner } from './components/ChampionBanner';
import { Toasts } from './components/Toasts';
import { AnalyticsToggle } from './components/AnalyticsToggle';
import { useBracketStore } from './store/bracketStore';
import { readPicksFromUrl } from './lib/serialization';
import { initAnalytics, onAppLoaded } from './lib/analytics';

export default function App() {
  const setPicks = useBracketStore((s) => s.setPicks);
  const normalize = useBracketStore((s) => s.normalize);
  const [ready, setReady] = useState(false);

  // On first load, a shared link (#p=...) takes precedence over saved state.
  // Either way, normalise so stale or now-locked picks are pruned.
  useEffect(() => {
    initAnalytics();
    const shared = readPicksFromUrl();
    if (shared && Object.keys(shared).length > 0) {
      setPicks(shared);
      onAppLoaded(shared, true);
    } else {
      normalize();
      onAppLoaded(useBracketStore.getState().picks, false);
    }
    setReady(true);
  }, [setPicks, normalize]);

  return (
    <div className="flex min-h-full flex-col">
      <Header />

      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: ready ? 1 : 0 }}
        transition={{ duration: 0.4 }}
        className="mx-auto flex w-full max-w-[1600px] flex-1 flex-col gap-8 py-6"
      >
        {/* Hint */}
        <div className="flex items-center justify-center px-4">
          <span className="glass inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium text-slate-300">
            <MousePointerClick className="h-3.5 w-3.5 text-accent" />
            Tap a team to send them through. Played matches
            <Lock className="h-3 w-3 text-gold" /> are locked to their real result.
          </span>
        </div>

        <Bracket />

        <ChampionBanner />

        <footer className="mt-4 flex flex-col items-center gap-1 px-4 pb-8 text-center text-xs text-slate-500">
          <p>
            Built with React, Zustand &amp; Framer Motion · Flags by{' '}
            <a className="underline decoration-dotted hover:text-slate-300" href="https://flagcdn.com" target="_blank" rel="noreferrer">
              flagcdn
            </a>
            . Real 2026 World Cup Round-of-32 bracket · FIFA rankings as of 1 Apr 2026.
          </p>
          <p>
            Privacy-friendly, cookieless analytics · <AnalyticsToggle />
          </p>
        </footer>
      </motion.main>

      <Toasts />
    </div>
  );
}
