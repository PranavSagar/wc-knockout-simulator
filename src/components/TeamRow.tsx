import { memo } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import type { Team } from '../types';
import { Flag } from './Flag';

interface TeamRowProps {
  team?: Team;
  /** This team is the chosen winner of the match. */
  isWinner: boolean;
  /** The match is decided and this team lost. */
  isLoser: boolean;
  /** Official, already-played result — not selectable. */
  locked?: boolean;
  onSelect: () => void;
}

/**
 * One selectable team inside a match card. Renders a "TBD" placeholder when the
 * feeder match has not yet produced a winner. Winners glow emerald with a check;
 * losers stay visible but subdued so the outcome reads at a glance. Locked
 * (already-played) rows are non-interactive.
 */
function TeamRowComponent({ team, isWinner, isLoser, locked, onSelect }: TeamRowProps) {
  if (!team) {
    return (
      <div className="flex items-center gap-2.5 px-3 py-2.5 opacity-40">
        <span className="h-5 w-[30px] shrink-0 rounded-[5px] bg-white/10 ring-1 ring-white/10" />
        <span className="text-sm font-medium text-slate-400">To be decided</span>
      </div>
    );
  }

  return (
    <motion.button
      type="button"
      onClick={onSelect}
      disabled={locked}
      whileTap={locked ? undefined : { scale: 0.97 }}
      aria-pressed={isWinner}
      className={[
        'group/team relative flex w-full items-center gap-2.5 px-3 py-2.5 text-left transition-colors duration-300',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/70',
        locked ? 'cursor-default' : '',
        isWinner ? 'bg-win/10' : locked ? '' : 'hover:bg-white/[0.06]',
        isLoser ? 'opacity-45 saturate-50' : 'opacity-100',
      ].join(' ')}
    >
      {/* Winner accent bar */}
      <motion.span
        aria-hidden
        initial={false}
        animate={{ scaleY: isWinner ? 1 : 0, opacity: isWinner ? 1 : 0 }}
        transition={{ type: 'spring', stiffness: 500, damping: 32 }}
        className="absolute inset-y-1 left-0 w-[3px] origin-center rounded-full bg-win shadow-[0_0_10px_rgba(52,211,153,0.8)]"
      />

      <motion.span
        animate={isWinner ? { scale: [1, 1.18, 1] } : { scale: 1 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
      >
        <Flag team={team} className="w-[30px]" />
      </motion.span>

      <span className="min-w-0 flex-1">
        <span
          className={[
            'block truncate text-sm leading-tight transition-colors',
            isWinner ? 'font-bold text-white' : 'font-semibold text-slate-200',
          ].join(' ')}
        >
          {team.name}
        </span>
        <span className="block text-[11px] font-medium uppercase tracking-wide text-slate-400">
          FIFA&nbsp;#{team.fifaRank}
        </span>
      </span>

      {/* Selected check */}
      <motion.span
        aria-hidden
        initial={false}
        animate={{ scale: isWinner ? 1 : 0, opacity: isWinner ? 1 : 0 }}
        transition={{ type: 'spring', stiffness: 600, damping: 24 }}
        className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-win text-pitch-950"
      >
        <Check className="h-3.5 w-3.5" strokeWidth={3.5} />
      </motion.span>
    </motion.button>
  );
}

export const TeamRow = memo(TeamRowComponent);
