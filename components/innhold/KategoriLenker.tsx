import Link from 'next/link';
import type { AnledningInnhold } from '@/lib/anledninger-innhold';
import { cn } from '@/lib/cn';

/** Kategorier som lenker i pilleform, gruppert med overskrift. */
export function KategoriLenker({ tittel, liste, className }: { tittel: string; liste: AnledningInnhold[]; className?: string }) {
  if (!liste.length) return null;
  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <h3 className="m-0 text-[17px] font-bold">{tittel}</h3>
      <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
        {liste.map((a) => (
          <li key={a.slug}>
            <Link
              href={`/catering/${a.slug}`}
              className="inline-flex min-h-touch items-center rounded-pill border-[1.5px] border-border-input bg-surface px-4 text-[15px] font-semibold text-text no-underline hover:border-primary hover:text-text"
            >
              {a.kortnavn}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
