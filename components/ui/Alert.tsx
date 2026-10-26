import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

/** Bekreftelse som flyter (mørk) eller feil/advarsel i flyten. */
export function Alert({
  tone,
  children,
  handling,
  className,
}: {
  tone: 'status' | 'feil' | 'advarsel';
  children: ReactNode;
  handling?: ReactNode;
  className?: string;
}) {
  if (tone === 'status') {
    return (
      <div
        role="status"
        className={cn(
          'flex items-center gap-3 rounded-alert bg-text px-4 py-3.5 text-[15px] font-semibold text-bg shadow-[0_8px_24px_rgba(28,34,16,0.2)]',
          className,
        )}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--k-accent)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="shrink-0">
          <path d="M5 12l5 5 9-10" />
        </svg>
        <span>{children}</span>
        {handling && <span className="ml-auto [&_a]:py-2 [&_a]:text-accent">{handling}</span>}
      </div>
    );
  }
  const feil = tone === 'feil';
  return (
    <div
      role={feil ? 'alert' : 'note'}
      className={cn(
        'flex items-start gap-3 rounded-alert border-[1.5px] px-4 py-3.5 text-[15px] leading-[1.45]',
        feil ? 'border-error bg-error-bg' : 'border-warning bg-warning-bg',
        className,
      )}
    >
      {feil ? (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--k-error)" strokeWidth="2" strokeLinecap="round" aria-hidden="true" className="shrink-0">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v6M12 16.5v.5" />
        </svg>
      ) : (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--k-warning)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="shrink-0">
          <path d="M12 4l9 16H3z" />
          <path d="M12 10v4M12 17v.5" />
        </svg>
      )}
      <span>{children}</span>
    </div>
  );
}
