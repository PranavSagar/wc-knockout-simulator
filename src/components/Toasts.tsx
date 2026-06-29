import { AnimatePresence, motion } from 'framer-motion';
import { Check, Info, X } from 'lucide-react';
import { useToastStore } from '../store/toastStore';

const toneStyles: Record<string, string> = {
  success: 'text-win',
  error: 'text-rose-400',
  info: 'text-accent',
};

const toneIcon = {
  success: Check,
  error: X,
  info: Info,
};

/** Bottom-center stack of transient notices. */
export function Toasts() {
  const toasts = useToastStore((s) => s.toasts);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-[120] flex flex-col items-center gap-2 px-4">
      <AnimatePresence>
        {toasts.map((t) => {
          const Icon = toneIcon[t.tone];
          return (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="glass-strong pointer-events-auto flex items-center gap-2.5 rounded-full px-4 py-2.5 text-sm font-medium shadow-glass"
            >
              <Icon className={`h-4 w-4 ${toneStyles[t.tone]}`} strokeWidth={2.5} />
              <span className="text-slate-100">{t.message}</span>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
