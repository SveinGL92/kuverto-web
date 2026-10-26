'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Logo } from './Logo';

const lenker = [
  { href: '/#slik-fungerer-det', navn: 'Slik fungerer det' },
  { href: '/#anledninger', navn: 'Anledninger' },
  { href: '/logg-inn?rolle=leverandor', navn: 'For leverandører' },
];

export function SiteHeader() {
  const [apen, setApen] = useState(false);
  return (
    <header className="k-wrap flex flex-wrap items-center justify-between gap-3 py-3 pl-4 pr-2 md:py-6 md:pl-[clamp(16px,5vw,72px)] md:pr-[clamp(16px,5vw,72px)]">
      <Logo />
      <nav aria-label="Hovedmeny" className="flex items-center gap-1 text-base font-semibold">
        {lenker.map((l) => (
          <Link key={l.href} href={l.href} className="hidden px-3.5 py-3 text-text no-underline hover:text-primary md:block">
            {l.navn}
          </Link>
        ))}
        <Link
          href="/logg-inn"
          className="ml-1.5 flex min-h-touch items-center rounded-pill border-[1.5px] border-text px-4 text-[15px] font-bold text-text no-underline hover:bg-surface hover:text-text md:min-h-[46px] md:px-[22px] md:text-base md:font-semibold"
        >
          Logg inn
        </Link>
        <button
          type="button"
          aria-label="Meny"
          aria-expanded={apen}
          aria-controls="mobilmeny"
          onClick={() => setApen((v) => !v)}
          className="flex h-11 w-11 items-center justify-center md:hidden"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            {apen ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 8h16M4 16h11" />}
          </svg>
        </button>
      </nav>
      {apen && (
        <nav id="mobilmeny" aria-label="Meny" className="w-full pb-2 md:hidden">
          <ul className="m-0 flex list-none flex-col p-0">
            {lenker.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  onClick={() => setApen(false)}
                  className="flex min-h-12 items-center border-b border-border text-[17px] font-semibold text-text no-underline"
                >
                  {l.navn}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
