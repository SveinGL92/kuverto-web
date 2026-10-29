import Link from 'next/link';
import { Symbol } from './Logo';
import { ThemeToggle } from './ThemeToggle';

const kolonner = [
  {
    tittel: 'For deg som bestiller',
    lenker: [
      { href: '/foresporsel', navn: 'Få cateringtilbud' },
      { href: '/#slik-fungerer-det', navn: 'Slik fungerer det' },
      { href: '/#anledninger', navn: 'Anledninger' },
    ],
  },
  {
    tittel: 'For leverandører',
    lenker: [
      { href: '/for-leverandorer', navn: 'Bli leverandør' },
      { href: '/for-leverandorer#priser', navn: 'Priser' },
      { href: '/logg-inn?rolle=leverandor', navn: 'Logg inn' },
    ],
  },
  {
    tittel: 'Kuverto',
    lenker: [
      { href: 'mailto:hei@kuverto.no', navn: 'hei@kuverto.no' },
      { href: '/personvern', navn: 'Personvern' },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="k-wrap mt-16 pb-10 text-[15px] text-text-muted md:mt-24">
      <div className="flex flex-col gap-8 border-t border-border pt-10 md:flex-row md:flex-wrap md:justify-between md:gap-12 md:pt-14">
        <div className="flex max-w-[30ch] flex-col gap-3">
          <span className="flex items-center gap-2 text-primary">
            <Symbol size={22} />
            <span className="k-heading text-xl leading-none">kuverto</span>
          </span>
          <p className="m-0 leading-normal">Én forespørsel, flere cateringtilbud. Foreløpig i Oslo og Akershus.</p>
        </div>
        <nav aria-label="Bunnmeny" className="grid grid-cols-1 gap-6 min-[420px]:grid-cols-2 md:flex md:gap-14">
          {kolonner.map((k) => (
            <div key={k.tittel} className="flex flex-col gap-1">
              <h2 className="m-0 mb-1 text-[15px] font-bold text-text">{k.tittel}</h2>
              <ul className="m-0 flex list-none flex-col p-0">
                {k.lenker.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="inline-flex min-h-touch items-center text-text-muted no-underline hover:text-text hover:underline">
                      {l.navn}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>
      <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6">
        <span>Kuverto drives av Puncheur AS.</span>
        <ThemeToggle />
      </div>
    </footer>
  );
}
