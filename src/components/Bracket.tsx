import { useEffect, useRef, type CSSProperties } from 'react';
import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';
import type { Team } from '../types';
import { ROUNDS } from '../data/fixtures';
import { useBracket, useChampion } from '../store/bracketStore';
import { MatchRegistryProvider, useMatchRegistry } from '../context/MatchRegistry';
import { Round } from './Round';
import { Connectors } from './Connectors';
import { Flag } from './Flag';

/**
 * The scrollable bracket: a horizontal row of round columns with an animated SVG
 * connector layer underneath, ending in the trophy node. On mobile the whole row
 * scrolls horizontally (momentum/touch); on desktop it typically fits or pans.
 */
export function Bracket() {
  const rounds = useBracket();
  const champion = useChampion();

  const scrollRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Total height is driven by the Round of 32 (the tallest column).
  const style = {
    '--bracket-h': `calc(${rounds[0].length} * var(--slot))`,
  } as CSSProperties;

  return (
    <MatchRegistryProvider>
      <div
        ref={scrollRef}
        className="w-full overflow-x-auto overflow-y-hidden px-1 pb-8"
        role="region"
        aria-label="Knockout bracket — scroll horizontally to see all rounds"
      >
        <div
          ref={contentRef}
          style={style}
          className="relative inline-flex items-start gap-x-10 px-4 sm:gap-x-14 sm:px-6 lg:gap-x-20"
        >
          <Connectors rounds={rounds} contentRef={contentRef} />

          {ROUNDS.map((meta, r) => (
            <Round key={meta.key} meta={meta} matches={rounds[r]} />
          ))}

          <ChampionNode champion={champion} />
        </div>
      </div>
    </MatchRegistryProvider>
  );
}

/** The trophy slot at the end of the bracket — fills in once the Final is decided. */
function ChampionNode({ champion }: { champion?: Team }) {
  const { register } = useMatchRegistry();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    register('champion', ref.current);
    return () => register('champion', null);
  }, [register]);

  return (
    <section className="flex shrink-0 flex-col" aria-label="Champion">
      <header className="mb-2 flex h-9 items-center justify-center">
        <span className="rounded-full bg-gradient-to-r from-gold-deep to-gold px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-pitch-950">
          Champion
        </span>
      </header>

      <div className="flex flex-col justify-center" style={{ height: 'var(--bracket-h)' }}>
        <div ref={ref} className="flex items-center justify-center px-1">
          <motion.div
            layout
            className={[
              'relative grid w-[clamp(170px,72vw,200px)] place-items-center gap-2 rounded-2xl p-5 text-center transition-all duration-500',
              champion ? 'glass-strong shadow-glow-gold' : 'glass',
            ].join(' ')}
          >
            <motion.div
              animate={champion ? { y: [0, -6, 0] } : {}}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Trophy
                className={champion ? 'h-9 w-9 text-gold drop-shadow-[0_0_12px_rgba(245,197,66,0.6)]' : 'h-9 w-9 text-slate-600'}
                strokeWidth={1.75}
              />
            </motion.div>

            {champion ? (
              <motion.div
                key={champion.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                className="grid place-items-center gap-1.5"
              >
                <Flag team={champion} className="w-10 rounded-md" />
                <span className="text-sm font-bold text-white">{champion.name}</span>
                <span className="text-[11px] font-medium uppercase tracking-wide text-gold">
                  FIFA&nbsp;#{champion.fifaRank}
                </span>
              </motion.div>
            ) : (
              <span className="text-xs font-medium text-slate-500">Awaiting the Final</span>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
