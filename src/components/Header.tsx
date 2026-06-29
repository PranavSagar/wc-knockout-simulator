import { motion } from 'framer-motion';
import { useProgress } from '../store/bracketStore';
import { Controls } from './Controls';

/** Sticky app bar: brand, live prediction progress, and the action toolbar. */
export function Header() {
  const { decided, total } = useProgress();
  const pct = total > 0 ? Math.round((decided / total) * 100) : 0;

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-pitch-950/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-3 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl" aria-hidden>
            🏆
          </span>
          <div>
            <h1 className="font-display text-lg font-extrabold leading-none tracking-tight sm:text-xl">
              <span className="text-gradient-gold">World Cup</span>{' '}
              <span className="text-white">Knockout Simulator</span>
            </h1>
            <p className="mt-1 text-[12px] font-medium text-slate-400">
              Predict every match from the Round of 32 to the Final.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {/* Progress */}
          <div className="flex items-center gap-3">
            <div className="h-2 w-36 overflow-hidden rounded-full bg-white/10 sm:w-44">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-win to-accent"
                initial={false}
                animate={{ width: `${pct}%` }}
                transition={{ type: 'spring', stiffness: 200, damping: 30 }}
              />
            </div>
            <span className="whitespace-nowrap text-xs font-semibold tabular-nums text-slate-300">
              {decided}/{total}
            </span>
          </div>

          <Controls />
        </div>
      </div>
    </header>
  );
}
