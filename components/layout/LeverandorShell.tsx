import Link from 'next/link';
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { Symbol } from './Logo';
import { ThemeToggle } from './ThemeToggle';

export interface MenyPunkt {
  href: string;
  navn: string;
  aktiv?: boolean;
  merke?: ReactNode;
}

/** Rammen rundt leverandørsidene: olivenmeny til venstre på desktop, faste faner nederst på mobil. */
export function LeverandorShell({
  meny,
  firma,
  dekning,
  mobilHode,
  children,
}: {
  meny: MenyPunkt[];
  firma: string;
  dekning: string;
  mobilHode: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="min-h-dvh md:flex">
      <aside className="hidden w-[248px] shrink-0 flex-col gap-7 bg-panel px-4 py-6 text-panel-on md:sticky md:top-0 md:flex md:h-dvh">
        <Link href="/" className="flex items-center gap-2 px-2 text-panel-on no-underline hover:text-panel-on">
          <Symbol size={28} />
          <span className="k-heading text-[28px] leading-none tracking-[-0.035em]">kuverto</span>
          <span className="sr-only">, til forsiden</span>
        </Link>
        <nav aria-label="Leverandørmeny">
          <ul className="m-0 flex list-none flex-col gap-0.5 p-0 text-base">
            {meny.map((m) => (
              <li key={m.navn}>
                <Link
                  href={m.href}
                  aria-current={m.aktiv ? 'page' : undefined}
                  className={cn(
                    'flex min-h-[46px] items-center justify-between rounded-pill px-3 no-underline',
                    m.aktiv ? 'bg-bg font-bold text-text hover:text-text' : 'font-semibold text-panel-on hover:bg-white/10 hover:text-panel-on',
                  )}
                >
                  {m.navn}
                  {m.merke}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="mt-auto flex flex-col gap-1 border-t border-white/20 px-3 pt-4">
          <strong>{firma}</strong>
          <span className="text-small text-panel-on-muted">Godkjent · {dekning}</span>
        </div>
        <div className="-mt-4 px-1 [&_label]:text-panel-on-muted [&_label:has(:checked)]:bg-white/15 [&_label:has(:checked)]:text-panel-on">
          <ThemeToggle />
        </div>
      </aside>

      <div className="min-w-0 flex-grow pb-[84px] md:pb-0">
        <div className="md:hidden">{mobilHode}</div>
        {children}
      </div>

      <nav aria-label="Leverandørmeny" className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-bg md:hidden">
        <ul className="m-0 grid list-none grid-cols-4 p-0">
          {[
            { navn: 'Forespørsler', aktiv: true, d: <><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="4" /></> },
            { navn: 'Tilbud', d: <><path d="M7 3h7l4 4v14H7z" /><path d="M10 12h5M10 16h5" /></> },
            { navn: 'Meldinger', d: <path d="M4 5h16v11H9l-4 3z" /> },
            { navn: 'Profil', d: <><circle cx="12" cy="8" r="4" /><path d="M5 20c1-4 4-6 7-6s6 2 7 6" /></> },
          ].map((m) => (
            <li key={m.navn}>
              <Link
                href="/leverandor"
                aria-current={m.aktiv ? 'page' : undefined}
                className={cn(
                  'flex min-h-[64px] flex-col items-center justify-center gap-1 text-[15px] no-underline',
                  m.aktiv ? 'font-bold text-text' : 'font-semibold text-text-muted hover:text-text',
                )}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  {m.d}
                </svg>
                {m.navn}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
