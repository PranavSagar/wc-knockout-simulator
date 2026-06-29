import { useLayoutEffect, useState, type RefObject } from 'react';
import type { Match } from '../types';
import { matchId } from '../lib/bracketEngine';
import { useMatchRegistry } from '../context/MatchRegistry';

interface ConnectorsProps {
  rounds: Match[][];
  /** The sized content element that hosts both the columns and this overlay. */
  contentRef: RefObject<HTMLElement>;
}

interface Line {
  key: string;
  d: string;
  active: boolean;
}

interface Size {
  w: number;
  h: number;
}

/**
 * SVG overlay that draws curved connectors from each match to the match it feeds
 * into. Lines whose source already has a winner light up (gradient + flowing
 * dash) to visualise a team advancing; undecided lines stay faint.
 *
 * We measure real card rectangles (so the curves are pixel-accurate regardless
 * of responsive sizing) and recompute on: picks change (via `rounds`), container
 * resize, and font load. Measurement happens in a layout effect — after the DOM
 * is laid out, before paint — so connectors never lag a frame behind the cards.
 */
export function Connectors({ rounds, contentRef }: ConnectorsProps) {
  const { get } = useMatchRegistry();
  const [lines, setLines] = useState<Line[]>([]);
  const [size, setSize] = useState<Size>({ w: 0, h: 0 });

  useLayoutEffect(() => {
    const content = contentRef.current;
    if (!content) return;

    const measure = () => {
      const origin = content.getBoundingClientRect();
      const next: Line[] = [];

      // For every round except the Final, connect each match to its parent.
      for (let r = 0; r < rounds.length - 1; r++) {
        const round = rounds[r];
        for (let i = 0; i < round.length; i++) {
          const sourceEl = get(matchId(r, i));
          const targetEl = get(matchId(r + 1, Math.floor(i / 2)));
          if (!sourceEl || !targetEl) continue;

          const s = sourceEl.getBoundingClientRect();
          const t = targetEl.getBoundingClientRect();

          // Anchor: source right-center -> target left-center, in content coords.
          const x1 = s.right - origin.left;
          const y1 = s.top - origin.top + s.height / 2;
          const x2 = t.left - origin.left;
          const y2 = t.top - origin.top + t.height / 2;
          const mid = (x1 + x2) / 2;

          next.push({
            key: matchId(r, i),
            // Smooth S-curve: horizontal tangents at both ends read as a clean elbow.
            d: `M ${x1} ${y1} C ${mid} ${y1}, ${mid} ${y2}, ${x2} ${y2}`,
            active: Boolean(round[i].winnerId),
          });
        }
      }

      // Final -> trophy node.
      const lastRound = rounds[rounds.length - 1];
      const finalEl = get(matchId(rounds.length - 1, 0));
      const champEl = get('champion');
      if (lastRound?.length && finalEl && champEl) {
        const s = finalEl.getBoundingClientRect();
        const t = champEl.getBoundingClientRect();
        const x1 = s.right - origin.left;
        const y1 = s.top - origin.top + s.height / 2;
        const x2 = t.left - origin.left;
        const y2 = t.top - origin.top + t.height / 2;
        const mid = (x1 + x2) / 2;
        next.push({
          key: 'champion',
          d: `M ${x1} ${y1} C ${mid} ${y1}, ${mid} ${y2}, ${x2} ${y2}`,
          active: Boolean(lastRound[0].winnerId),
        });
      }

      setSize({ w: content.scrollWidth, h: content.scrollHeight });
      setLines(next);
    };

    // Measure now, and again next frame to catch late layout (fonts/flags).
    measure();
    const raf = requestAnimationFrame(measure);

    const ro = new ResizeObserver(measure);
    ro.observe(content);

    let fontsDone = false;
    if ('fonts' in document) {
      document.fonts.ready.then(() => {
        if (!fontsDone) measure();
      });
    }

    return () => {
      fontsDone = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [rounds, contentRef, get]);

  return (
    <svg
      className="pointer-events-none absolute left-0 top-0 z-0 overflow-visible"
      width={size.w}
      height={size.h}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="conn-active" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#34d399" />
          <stop offset="100%" stopColor="#22d3ee" />
        </linearGradient>
      </defs>
      {lines.map((line) =>
        line.active ? (
          <path
            key={line.key}
            d={line.d}
            fill="none"
            stroke="url(#conn-active)"
            strokeWidth={2.25}
            strokeLinecap="round"
            strokeDasharray="6 6"
            className="animate-flow-dash drop-shadow-[0_0_4px_rgba(52,211,153,0.5)]"
          />
        ) : (
          <path
            key={line.key}
            d={line.d}
            fill="none"
            stroke="rgba(148,163,184,0.18)"
            strokeWidth={1.5}
            strokeLinecap="round"
          />
        ),
      )}
    </svg>
  );
}
