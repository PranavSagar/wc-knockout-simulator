import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Download, RotateCcw, Share2, Upload } from 'lucide-react';
import { useBracketStore } from '../store/bracketStore';
import { useToastStore } from '../store/toastStore';
import { buildShareUrl, clearUrlPicks, fromFileText, toFile } from '../lib/serialization';

/**
 * Toolbar: Reset · Export · Import · Share. Each action is small and pure —
 * Export/Import go through the versioned serialization layer, Share encodes
 * picks into the URL hash, and Reset uses a two-click confirm to avoid wiping a
 * full bracket by accident.
 */
export function Controls() {
  const picks = useBracketStore((s) => s.picks);
  const setPicks = useBracketStore((s) => s.setPicks);
  const reset = useBracketStore((s) => s.reset);
  const notify = useToastStore((s) => s.notify);

  const fileInput = useRef<HTMLInputElement>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const confirmTimer = useRef<number | null>(null);

  const hasPicks = Object.keys(picks).length > 0;

  const handleReset = () => {
    if (!confirmReset) {
      setConfirmReset(true);
      confirmTimer.current = window.setTimeout(() => setConfirmReset(false), 3000);
      return;
    }
    if (confirmTimer.current) window.clearTimeout(confirmTimer.current);
    setConfirmReset(false);
    reset();
    clearUrlPicks();
    notify('Bracket reset', 'info');
  };

  const handleExport = () => {
    const file = toFile(picks);
    const blob = new Blob([JSON.stringify(file, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wc-predictions-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    notify('Predictions exported', 'success');
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow re-importing the same file
    if (!file) return;
    try {
      const text = await file.text();
      setPicks(fromFileText(text));
      clearUrlPicks();
      notify('Predictions imported', 'success');
    } catch {
      notify('Could not read that file', 'error');
    }
  };

  const handleShare = async () => {
    const url = buildShareUrl(picks);
    // Reflect the shared state in the address bar too.
    history.replaceState(null, '', url);
    try {
      await navigator.clipboard.writeText(url);
      notify('Share link copied to clipboard', 'success');
    } catch {
      notify('Share link is in the address bar', 'info');
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <ToolButton onClick={handleShare} disabled={!hasPicks} icon={<Share2 className="h-4 w-4" />} label="Share" highlight />
      <ToolButton onClick={handleExport} disabled={!hasPicks} icon={<Download className="h-4 w-4" />} label="Export" />
      <ToolButton onClick={() => fileInput.current?.click()} icon={<Upload className="h-4 w-4" />} label="Import" />
      <ToolButton
        onClick={handleReset}
        disabled={!hasPicks}
        icon={<RotateCcw className="h-4 w-4" />}
        label={confirmReset ? 'Confirm?' : 'Reset'}
        danger={confirmReset}
      />
      <input ref={fileInput} type="file" accept="application/json,.json" className="hidden" onChange={handleImportFile} />
    </div>
  );
}

interface ToolButtonProps {
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  disabled?: boolean;
  highlight?: boolean;
  danger?: boolean;
}

function ToolButton({ onClick, icon, label, disabled, highlight, danger }: ToolButtonProps) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      whileTap={{ scale: 0.95 }}
      className={[
        'glass flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-semibold transition-all duration-200',
        'disabled:cursor-not-allowed disabled:opacity-40',
        danger
          ? 'text-rose-300 shadow-[0_0_0_1px_rgba(244,63,94,0.5)]'
          : highlight
            ? 'text-accent hover:shadow-glow-accent'
            : 'text-slate-200 hover:bg-white/[0.09]',
      ].join(' ')}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </motion.button>
  );
}
