import { createContext, useCallback, useContext, useMemo, useRef } from 'react';
import type { ReactNode } from 'react';

/**
 * A tiny DOM registry so the connector overlay can measure each match card.
 *
 * Why a registry instead of prop-drilling refs: cards live several levels deep
 * inside Round columns, and the <svg> connector layer needs all of their rects
 * at once. Each card reports its element here on mount; the Connectors layer
 * reads the live map when it (re)computes paths. Reads happen in a layout
 * effect, never during render, so this stays render-safe.
 */

interface MatchRegistry {
  register: (id: string, el: HTMLElement | null) => void;
  get: (id: string) => HTMLElement | undefined;
}

const Ctx = createContext<MatchRegistry | null>(null);

export function MatchRegistryProvider({ children }: { children: ReactNode }) {
  const map = useRef(new Map<string, HTMLElement>());

  const register = useCallback((id: string, el: HTMLElement | null) => {
    if (el) map.current.set(id, el);
    else map.current.delete(id);
  }, []);

  const get = useCallback((id: string) => map.current.get(id), []);

  const value = useMemo<MatchRegistry>(() => ({ register, get }), [register, get]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useMatchRegistry(): MatchRegistry {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useMatchRegistry must be used within MatchRegistryProvider');
  return ctx;
}
