import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

/** Bekreftelsen når kunden har valgt et tilbud. */
export function BordetErDekket({ leverandor, handling, className }: { leverandor: string; handling?: ReactNode; className?: string }) {
  return (
    <div className={cn('flex flex-col gap-3 bg-panel p-8 text-panel-on', className)}>
      {/* Strektegningen står på havre, som i designet, så blekket synes også i mørk modus. */}
      <span className="w-[212px] bg-[#F6F4EA] p-1.5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/illustrasjoner/tallerken-hake.svg" alt="" className="block w-[200px]" />
      </span>
      <h2 className="k-heading m-0 text-[28px] leading-[1.05]">Bordet er dekket</h2>
      <p className="m-0 max-w-[40ch] text-base text-panel-on-muted">
        Du har valgt {leverandor}. De tar kontakt for å avtale detaljene, og de andre får beskjed.
      </p>
      {handling && <div className="mt-auto pt-6">{handling}</div>}
    </div>
  );
}
