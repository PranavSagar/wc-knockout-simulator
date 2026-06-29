import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { MousePointerClick } from 'lucide-react';
import { Header } from './components/Header';
import { Bracket } from './components/Bracket';
import { ChampionBanner } from './components/ChampionBanner';
import { Toasts } from './components/Toasts';
import { useBracketStore } from './store/bracketStore';
import { readPicksFromUrl } from './lib/serialization';

export default function App() {
  const setPicks = useBracketStore((s) => s.setPicks);
  const [ready, setReady] = useState(false);

  // On first load, a shared link (#p=...) takes precedence over saved state.
  useEffect(() => {
    const shared = readPicksFromUrl();
    if (shared && Object.keys(shared).length > 0) {
      setPicks(shared);
    }
    setReady(true);
  }, [setPicks]);

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
            Tap a team to send them through. Everything downstream updates automatically.
          </span>
        </div>

        <Bracket />

        <ChampionBanner />

        <footer className="mt-4 px-4 pb-8 text-center text-xs text-slate-500">
          Built with React, Zustand &amp; Framer Motion · Flags by{' '}
          <a className="underline decoration-dotted hover:text-slate-300" href="https://flagcdn.com" target="_blank" rel="noreferrer">
            flagcdn
          </a>
          . Rankings are illustrative placeholders — edit{' '}
          <code className="rounded bg-white/10 px-1 py-0.5">src/data</code> to use the real draw.
        </footer>
      </motion.main>

      <Toasts />
    </div>
  );
}
