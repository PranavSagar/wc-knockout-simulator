import { memo, useCallback, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';
import type { Match } from '../types';
import { useBracketStore } from '../store/bracketStore';
import { useMatchRegistry } from '../context/MatchRegistry';
import { OFFICIAL_RESULTS } from '../data/results';
import { TeamRow } from './TeamRow';

interface MatchCardProps {
  match: Match;
}

/**
 * A single knockout match: two stacked, selectable team rows on a glass card.
 * The card reports its DOM node to the MatchRegistry so the connector overlay
 * can anchor lines to it. Only this card re-renders when its own pick changes,
 * because it subscribes to the store's stable `select` action and receives its
 * `match` as a prop computed upstream.
 */
function MatchCardComponent({ match }: MatchCardProps) {
  const select = useBracketStore((s) => s.select);
  const { register } = useMatchRegistry();
  const ref = useRef<HTMLDivElement>(null);

  // Register / unregister this card's element for connector measurement.
  useEffect(() => {
    register(match.id, ref.current);
    return () => register(match.id, null);
  }, [match.id, register]);

  const onSelectA = useCallback(() => {
    if (match.teamA) select(match.id, match.teamA.id);
  }, [match.id, match.teamA, select]);

  const onSelectB = useCallback(() => {
    if (match.teamB) select(match.id, match.teamB.id);
  }, [match.id, match.teamB, select]);

  const decided = Boolean(match.winnerId);
  const aWins = decided && match.winnerId === match.teamA?.id;
  const bWins = decided && match.winnerId === match.teamB?.id;
  const ready = Boolean(match.teamA && match.teamB);
  const locked = Boolean(match.locked);
  const result = locked ? OFFICIAL_RESULTS[match.id] : undefined;

  return (
    <motion.div
      ref={ref}
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className={[
        'glass relative w-[clamp(200px,72vw,236px)] overflow-hidden rounded-xl transition-shadow duration-300',
        locked
          ? 'shadow-glass ring-1 ring-gold/25'
          : decided
            ? 'shadow-glow-win'
            : ready
              ? 'shadow-glass hover:shadow-glow-accent'
              : 'shadow-glass',
      ].join(' ')}
    >
      {/* Full-time / locked badge */}
      {locked && (
        <span className="absolute right-2 top-2 z-10 inline-flex items-center gap-1 rounded-full bg-gold/15 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-gold ring-1 ring-gold/30">
          <Lock className="h-2.5 w-2.5" strokeWidth={2.5} />
          FT
        </span>
      )}

      <TeamRow team={match.teamA} isWinner={aWins} isLoser={decided && !aWins && Boolean(match.teamA)} locked={locked} onSelect={onSelectA} />

      {/* Divider — shows the final score for played matches, otherwise "vs" */}
      <div className="relative flex items-center px-3">
        <span className="h-px flex-1 bg-white/10" />
        {result ? (
          <span className="px-2 text-[11px] font-bold tabular-nums tracking-wide text-slate-300">
            {result.scoreA}<span className="px-0.5 text-slate-500">–</span>{result.scoreB}
            {result.detail && <span className="ml-1 text-[8px] text-gold">{result.detail}</span>}
          </span>
        ) : (
          <span className="px-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">vs</span>
        )}
        <span className="h-px flex-1 bg-white/10" />
      </div>

      <TeamRow team={match.teamB} isWinner={bWins} isLoser={decided && !bWins && Boolean(match.teamB)} locked={locked} onSelect={onSelectB} />
    </motion.div>
  );
}

export const MatchCard = memo(MatchCardComponent);
