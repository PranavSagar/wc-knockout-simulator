import { memo } from 'react';
import type { Match, RoundMeta } from '../types';
import { MatchCard } from './MatchCard';

interface RoundProps {
  meta: RoundMeta;
  matches: Match[];
}

/**
 * One bracket column.
 *
 * Layout trick: every round's match list is the same height (`--bracket-h`) and
 * uses `justify-around`. With N evenly-spaced items in a fixed height H, item i
 * is centered at (i + 0.5)·H/N. A round with half as many items therefore places
 * each match exactly at the midpoint of its two feeders — so connector lines line
 * up perfectly across rounds with zero JavaScript measurement for *layout*.
 * (We still measure for *drawing* the curved lines, in <Connectors/>.)
 */
function RoundComponent({ meta, matches }: RoundProps) {
  return (
    <section className="flex shrink-0 flex-col" aria-label={meta.label}>
      <header className="sticky top-0 z-10 mb-2 flex h-9 items-center justify-center">
        <span className="glass rounded-full px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-300">
          {meta.label}
        </span>
      </header>

      <div
        className="flex flex-col justify-around"
        style={{ height: 'var(--bracket-h)' }}
      >
        {matches.map((m) => (
          <div key={m.id} className="flex items-center justify-center px-1">
            <MatchCard match={m} />
          </div>
        ))}
      </div>
    </section>
  );
}

export const Round = memo(RoundComponent);
