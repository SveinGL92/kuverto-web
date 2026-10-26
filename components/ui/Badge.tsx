import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export type BadgeTone = 'ny' | 'last' | 'opplast' | 'suksess' | 'advarsel' | 'feil';

const tones: Record<BadgeTone, string> = {
  ny: 'bg-accent text-accent-on',
  last: 'bg-neutral-bg text-text',
  opplast: 'bg-surface-soft text-primary',
  suksess: 'bg-success-bg text-success',
  advarsel: 'bg-warning-bg text-warning',
  feil: 'bg-error-bg text-error',
};

export function Badge({ tone, children, className }: { tone: BadgeTone; children: ReactNode; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-pill px-2.5 py-1 text-small font-bold leading-none', tones[tone], className)}>
      {children}
    </span>
  );
}

/** Kostholdsmerke: urt for vanlige behov, advarsel for alvorlige allergier. */
export function DietTag({ children, alvorlig, ikon }: { children: ReactNode; alvorlig?: boolean; ikon?: 'blad' | 'not' }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-pill px-2.5 py-[5px] text-small font-bold leading-tight',
        alvorlig ? 'bg-warning-bg text-warning' : 'bg-surface-soft text-primary',
      )}
    >
      {ikon === 'blad' && (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M5 19C5 10.5 10.5 5 19 5c0 8.5-5.5 14-14 14z" />
          <path d="M5 19l8-8" />
        </svg>
      )}
      {ikon === 'not' && (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 4c4 0 6.5 3 6.5 7.5S15.5 20 12 20s-6.5-4-6.5-8.5S8 4 12 4z" />
          <path d="M6 10h12" />
        </svg>
      )}
      {children}
    </span>
  );
}
