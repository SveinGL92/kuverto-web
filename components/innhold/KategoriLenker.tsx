import Link from 'next/link';
import type { AnledningInnhold } from '@/lib/anledninger-innhold';
import { cn } from '@/lib/cn';
import { sprak } from '@/lib/server/marked';

/** Kategorier som lenker i pilleform, gruppert med overskrift. Tittel og kortnavn oversettes av siden som kaller. */
export async function KategoriLenker({ tittel, liste, className }: { tittel: string; liste: AnledningInnhold[]; className?: string }) {
  if (!liste.length) return null;
  const { sti } = await sprak();
  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <h3 className="m-0 text-[17px] font-bold">{tittel}</h3>
      <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
        {liste.map((a) => (
          <li key={a.slug}>
            <Link
              href={sti(`/catering/${a.slug}`)}
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
