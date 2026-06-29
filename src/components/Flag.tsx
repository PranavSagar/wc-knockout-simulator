import { memo } from 'react';
import type { Team } from '../types';
import { flagSvg } from '../lib/flags';

interface FlagProps {
  team: Team;
  className?: string;
}

/**
 * Country flag with a consistent 3:2 frame, rounded corners and a hairline
 * border so light flags still read against the dark glass. Lazy-loaded; the
 * decorative alt keeps it out of the a11y tree (the country name is adjacent).
 */
function FlagComponent({ team, className = '' }: FlagProps) {
  return (
    <span
      className={`relative block shrink-0 overflow-hidden rounded-[5px] ring-1 ring-white/15 shadow-sm ${className}`}
      style={{ aspectRatio: '3 / 2' }}
    >
      <img
        src={flagSvg(team)}
        alt=""
        aria-hidden="true"
        loading="lazy"
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover"
        draggable={false}
      />
    </span>
  );
}

export const Flag = memo(FlagComponent);
