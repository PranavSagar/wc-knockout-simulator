import { useState } from 'react';
import { isOptedOut, optIn, optOut } from '../lib/analytics';

/**
 * Tiny footer control to opt in/out of analytics. Privacy-first: analytics is
 * cookieless and collects no personal data, but users (and Do-Not-Track) can
 * still turn it off entirely. The choice persists in localStorage.
 */
export function AnalyticsToggle() {
  const [off, setOff] = useState(isOptedOut());

  const toggle = () => {
    if (off) {
      optIn();
      setOff(false);
    } else {
      optOut();
      setOff(true);
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      className="underline decoration-dotted underline-offset-2 transition-colors hover:text-slate-300"
      title="Privacy-friendly, cookieless analytics — no personal data is collected."
    >
      {off ? 'Analytics off — enable' : 'Analytics on — disable'}
    </button>
  );
}
