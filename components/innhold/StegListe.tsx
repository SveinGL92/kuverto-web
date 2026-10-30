import { cn } from '@/lib/cn';

export interface Steg {
  tittel: string;
  tekst: string;
  illustrasjon: string;
}

/** Tre (eller flere) nummererte steg. Vannrett på desktop, loddrett på mobil. */
export function StegListe({ steg, className }: { steg: Steg[]; className?: string }) {
  return (
    <ol className={cn('m-0 grid list-none gap-3 p-0 md:grid-cols-3 md:gap-5', className)}>
      {steg.map((s, i) => (
        <li key={s.tittel} className="flex gap-4 rounded-card bg-surface p-5 md:flex-col md:gap-5 md:p-7">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={s.illustrasjon} alt="" className="k-ink h-16 w-20 shrink-0 object-contain object-left md:h-20 md:w-auto md:self-start" />
          <div className="flex flex-col gap-1.5">
            <h3 className="m-0 flex items-baseline gap-2.5 text-[19px] font-bold leading-snug md:text-xl">
              <span>
                <span className="sr-only">Steg {i + 1}: </span>
                {s.tittel}
              </span>
            </h3>
            <p className="m-0 text-base leading-normal text-text-muted">{s.tekst}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
