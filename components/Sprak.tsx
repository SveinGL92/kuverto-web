'use client';

import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { lagT, type Ordbok } from '@/lib/i18n/core';
import { MARKED_INFO, medPrefiks, penger, STANDARD_MARKED, type Marked } from '@/lib/markets';

const Ctx = createContext<{ marked: Marked; ord: Ordbok }>({ marked: STANDARD_MARKED, ord: {} });

/** Gir klientkomponentene markedet og ordboken for språket (bare ett språk sendes til nettleseren). */
export function SprakProvider({ marked, ord, children }: { marked: Marked; ord: Ordbok; children: ReactNode }) {
  const v = useMemo(() => ({ marked, ord }), [marked, ord]);
  return <Ctx.Provider value={v}>{children}</Ctx.Provider>;
}

export function useSprak() {
  const { marked, ord } = useContext(Ctx);
  return useMemo(
    () => ({
      marked,
      info: MARKED_INFO[marked],
      t: lagT(ord),
      sti: (s: string) => medPrefiks(marked, s),
      penger: (minor: number) => penger(minor, marked),
    }),
    [marked, ord],
  );
}
