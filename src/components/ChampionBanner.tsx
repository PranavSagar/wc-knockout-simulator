import { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Sparkles, Trophy } from 'lucide-react';
import { useChampion } from '../store/bracketStore';
import { useConfetti } from '../hooks/useConfetti';
import { Flag } from './Flag';

/**
 * The pay-off: a large, celebratory champion banner that animates in once the
 * Final is decided, fires confetti, and glows. It mounts/unmounts with the
 * champion, so changing the Final result re-triggers the celebration.
 */
export function ChampionBanner() {
  const champion = useChampion();
  const celebrate = useConfetti();
  const lastChampion = useRef<string | null>(null);

  useEffect(() => {
    if (champion && champion.id !== lastChampion.current) {
      celebrate();
    }
    lastChampion.current = champion?.id ?? null;
  }, [champion, celebrate]);

  return (
    <AnimatePresence>
      {champion && (
        <motion.section
          key={champion.id}
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.98 }}
          transition={{ type: 'spring', stiffness: 220, damping: 26 }}
          className="mx-auto w-full max-w-3xl px-4"
          aria-live="polite"
        >
          <div className="glass-strong relative overflow-hidden rounded-3xl px-6 py-10 text-center shadow-glow-gold sm:px-12">
            {/* Radiant backdrop */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-70"
              style={{
                background:
                  'radial-gradient(40rem 20rem at 50% -20%, rgba(245,197,66,0.25), transparent 60%)',
              }}
            />

            <div className="relative">
              <div className="mb-3 flex items-center justify-center gap-2 text-gold">
                <Sparkles className="h-4 w-4" />
                <span className="text-xs font-bold uppercase tracking-[0.3em]">World Champions</span>
                <Sparkles className="h-4 w-4" />
              </div>

              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                className="mb-4 flex justify-center"
              >
                <Trophy className="h-16 w-16 text-gold drop-shadow-[0_0_24px_rgba(245,197,66,0.65)]" strokeWidth={1.5} />
              </motion.div>

              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1, type: 'spring', stiffness: 260, damping: 18 }}
                className="mx-auto mb-5 inline-flex"
              >
                <Flag team={champion} className="w-24 rounded-xl shadow-glass ring-2 ring-gold/40" />
              </motion.div>

              <h2 className="font-display text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
                {champion.name}
              </h2>
              <p className="mt-2 text-sm font-semibold uppercase tracking-[0.2em] text-gold">
                FIFA&nbsp;Rank&nbsp;#{champion.fifaRank}
              </p>

              <p className="mx-auto mt-5 max-w-md text-sm text-slate-400">
                Your predicted winners of the tournament. Tweak any earlier result and the
                bracket — and this trophy — update instantly.
              </p>
            </div>
          </div>
        </motion.section>
      )}
    </AnimatePresence>
  );
}
