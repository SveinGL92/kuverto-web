import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

/** Tom tilstand: strektegning, overskrift, én setning og eventuelt én handling. */
export function EmptyState({
  illustrasjon,
  tittel,
  children,
  handling,
  className,
  overskriftNiva = 2,
}: {
  illustrasjon: string;
  tittel: string;
  children: ReactNode;
  handling?: ReactNode;
  className?: string;
  overskriftNiva?: 1 | 2 | 3;
}) {
  const H = `h${overskriftNiva}` as const;
  return (
    <div className={cn('flex flex-col items-start gap-3', className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={illustrasjon} alt="" className="k-ink mb-2 h-[132px] w-auto max-w-[180px] object-contain object-left" />
      <H className="k-heading m-0 text-[28px] leading-[1.05]">{tittel}</H>
      <div className="m-0 max-w-[40ch] text-base text-text-muted">{children}</div>
      {handling && <div className="mt-auto flex flex-wrap items-center gap-4 pt-6">{handling}</div>}
    </div>
  );
}
