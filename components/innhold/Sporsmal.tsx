import { cn } from '@/lib/cn';

export interface SporsmalSvar {
  sporsmal: string;
  svar: React.ReactNode;
}

/** Spørsmål og svar med <details>, så det fungerer uten JavaScript og med tastatur. */
export function Sporsmal({ liste, className }: { liste: SporsmalSvar[]; className?: string }) {
  return (
    <div className={cn('flex flex-col border-t border-border', className)}>
      {liste.map((s) => (
        <details key={s.sporsmal} className="group border-b border-border">
          <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-3 text-[17px] font-bold [&::-webkit-details-marker]:hidden">
            {s.sporsmal}
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              aria-hidden="true"
              className="shrink-0 transition-transform duration-200 group-open:rotate-45 motion-reduce:transition-none"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
          </summary>
          <div className="max-w-[68ch] pb-5 text-base leading-[1.6] text-text-muted">{s.svar}</div>
        </details>
      ))}
    </div>
  );
}
