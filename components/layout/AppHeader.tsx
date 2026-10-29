import Link from 'next/link';
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { Symbol } from './Logo';

/** Olivenhode for innloggede kunder. På mobil vises en tilbakelenke i stedet for menyen. */
export function AppHeader({
  tilbake,
  aktiv,
  children,
}: {
  tilbake: { href: string; navn: string };
  aktiv: 'foresporsler' | 'meldinger';
  children: ReactNode;
}) {
  const lenke = (href: string, navn: string, id: string) => (
    <Link
      href={href}
      aria-current={aktiv === id ? 'page' : undefined}
      className={cn(
        'px-3.5 py-3 decoration-2 underline-offset-[6px]',
        aktiv === id ? 'text-panel-on underline hover:text-panel-on' : 'text-panel-on-muted no-underline hover:text-panel-on',
      )}
    >
      {navn}
    </Link>
  );
  return (
    <header className="bg-panel text-panel-on">
      <div className="mx-auto hidden max-w-[1200px] flex-wrap items-center justify-between gap-3 px-6 py-3.5 md:flex">
        <Link href="/" className="flex items-center gap-2 text-panel-on no-underline hover:text-panel-on">
          <Symbol size={28} />
          <span className="k-heading text-[28px] leading-none tracking-[-0.035em]">kuverto</span>
          <span className="sr-only">, til forsiden</span>
        </Link>
        <nav aria-label="Konto" className="flex flex-wrap gap-1 text-base font-semibold">
          {lenke('/mine-foresporsler', 'Mine forespørsler', 'foresporsler')}
          <form action="/logg-ut" method="post">
            <button type="submit" className="px-3.5 py-3 font-semibold text-panel-on-muted hover:text-panel-on">
              Logg ut
            </button>
          </form>
        </nav>
      </div>
      <div className="px-1 pt-2 md:hidden">
        <Link href={tilbake.href} className="inline-flex min-h-touch items-center gap-1 px-3 text-base font-semibold text-panel-on no-underline hover:text-panel-on">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M15 5l-7 7 7 7" />
          </svg>
          {tilbake.navn}
        </Link>
      </div>
      <div className="mx-auto max-w-[1200px] px-4 pb-6 pt-3 md:px-6 md:pb-10 md:pt-6">{children}</div>
    </header>
  );
}
