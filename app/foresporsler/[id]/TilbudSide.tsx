'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useRef, useState } from 'react';
import { AppHeader } from '@/components/layout/AppHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { EmptyState } from '@/components/states/EmptyState';
import { dagerTil } from '@/components/kuverto/tid';
import { BordetErDekket } from '@/components/states/BordetErDekket';
import { Button, ButtonLink } from '@/components/ui/Button';
import { PriceRing } from '@/components/ui/PriceRing';
import { cn } from '@/lib/cn';
import { dagMndLang, datoKort, datoLang, kr } from '@/lib/format';
import { anledningNavn, budsjettNavn, kostholdNavn } from '@/lib/labels';
import type { Foresporsel, Tilbud } from '@/lib/types';

type Sortering = 'pris' | 'inkludert' | 'nyeste';
const sorteringer: { id: Sortering; navn: string }[] = [
  { id: 'pris', navn: 'Lavest pris' },
  { id: 'inkludert', navn: 'Mest inkludert' },
  { id: 'nyeste', navn: 'Nyeste' },
];

const inkludertPoeng = (t: Tilbud) => Number(t.levering.inkludert) + Number(t.oppsettOgRydding) + Number(t.kosthold.dekket);

/** Bokstaven fra «[Leverandør A]», brukt i korte knappetekster på mobil. */
const kortnavn = (t: Tilbud) => t.leverandorNavn.match(/\b([A-ZÆØÅ])\]?$/)?.[1] ?? t.leverandorNavn;

function gjelderTil(iso: string) {
  const d = dagerTil(iso);
  if (d === 0) return { tekst: 'I dag', haster: true };
  if (d === 1) return { tekst: 'I morgen', haster: true };
  return { tekst: dagMndLang(iso), haster: false };
}

const Hake = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--k-success)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="mr-1.5 inline align-[-1px]">
    <path d="M5 12l5 5 9-10" />
  </svg>
);

export function TilbudSide({ foresporsel: f, tilbud }: { foresporsel: Foresporsel; tilbud: Tilbud[] }) {
  const [sortering, setSortering] = useState<Sortering>('pris');
  const [valgt, setValgt] = useState<string>();
  const kvittering = useRef<HTMLDivElement>(null);

  const lavest = useMemo(() => [...tilbud].sort((a, b) => a.prisPerKuvert - b.prisPerKuvert)[0]?.id, [tilbud]);
  const sortert = useMemo(() => {
    const l = [...tilbud];
    if (sortering === 'pris') l.sort((a, b) => a.prisPerKuvert - b.prisPerKuvert);
    if (sortering === 'inkludert') l.sort((a, b) => inkludertPoeng(b) - inkludertPoeng(a) || a.prisPerKuvert - b.prisPerKuvert);
    if (sortering === 'nyeste') l.sort((a, b) => b.opprettet.localeCompare(a.opprettet));
    return l;
  }, [tilbud, sortering]);
  // Ringen og den fylte knappen går til tilbudet kunden bør se først: det valgte, ellers det billigste.
  const fremhevet = valgt ?? lavest;
  const valgtTilbud = tilbud.find((t) => t.id === valgt);

  const anledning = anledningNavn(f.anledning).toLowerCase();
  const kostholdTekst = f.kosthold.map((k) => `${k.type === 'notter' ? 'nøttefritt' : kostholdNavn(k.type).toLowerCase()} ${k.antall}`).join(' · ');
  // «Vegetar og nøttefritt» ut fra det kunden har oppgitt.
  const kostholdKort = (() => {
    const ord = f.kosthold.map((k) => (k.type === 'notter' ? 'nøttefritt' : kostholdNavn(k.type).toLowerCase()));
    const tekst = ord.length > 1 ? `${ord.slice(0, -1).join(', ')} og ${ord.at(-1)}` : (ord[0] ?? '');
    return tekst.charAt(0).toUpperCase() + tekst.slice(1);
  })();
  const velg = (id: string) => {
    setValgt(id);
    requestAnimationFrame(() => kvittering.current?.focus());
  };

  const velgKnapp = (t: Tilbud, tekst: string, className?: string) =>
    valgt === t.id ? (
      <span className={cn('inline-flex min-h-[52px] items-center justify-center gap-2 rounded-pill bg-success-bg px-4 font-bold text-success', className)}>
        <Hake /> Valgt
      </span>
    ) : (
      <Button variant={t.id === fremhevet && !valgt ? 'primary' : 'secondary'} onClick={() => velg(t.id)} disabled={!!valgt} className={className}>
        {tekst}
      </Button>
    );

  const sorteringsknapper = (tone: 'lys' | 'panel') => (
    <div role="group" aria-label="Sorter tilbudene" className={cn('flex flex-wrap', tone === 'panel' ? 'gap-5' : 'gap-2')}>
      {sorteringer.map((s) => {
        const pa = sortering === s.id;
        return tone === 'panel' ? (
          <button
            key={s.id}
            type="button"
            aria-pressed={pa}
            onClick={() => setSortering(s.id)}
            className={cn('min-h-touch border-b-[3px] text-base', pa ? 'border-accent font-bold text-panel-on' : 'border-transparent font-semibold text-panel-on-muted hover:text-panel-on')}
          >
            {s.navn}
          </button>
        ) : (
          <button
            key={s.id}
            type="button"
            aria-pressed={pa}
            onClick={() => setSortering(s.id)}
            className={cn(
              'min-h-touch rounded-pill px-3.5 text-[15px]',
              pa ? 'border-2 border-primary bg-primary font-bold text-primary-on' : 'border-[1.5px] border-border-input bg-surface font-semibold text-text',
            )}
          >
            {s.navn}
          </button>
        );
      })}
    </div>
  );

  return (
    <>
      <AppHeader tilbake={{ href: '/', navn: 'Mine forespørsler' }} aktiv="foresporsler">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-col gap-1.5 md:gap-2">
            <h1 className="k-heading m-0 text-[34px] leading-[1.02] md:text-[52px] md:leading-none md:tracking-[-0.04em]">
              {tilbud.length === 0 ? `Ingen tilbud ennå på ${anledning}` : `${tilbud.length} tilbud på ${anledning}`}
            </h1>
            <p className="m-0 text-[15px] text-panel-on-muted md:hidden">
              {f.gjester} kuverter · {datoKort(f.dato)} · {f.postnummer} {f.poststed}
            </p>
            <p className="m-0 hidden text-[17px] text-panel-on-muted md:block">
              {f.gjester} kuverter · {datoLang(f.dato)} kl. {f.klokkeslett} · {f.postnummer} {f.poststed} · budsjett {budsjettNavn(f.budsjett)} per kuvert
            </p>
          </div>
          {tilbud.length > 1 && <div className="hidden md:block">{sorteringsknapper('panel')}</div>}
        </div>
      </AppHeader>

      <main id="innhold" className="mx-auto max-w-[1200px] pb-16 md:px-6 md:pb-[72px] md:pt-10">
        {valgtTilbud && (
          <div ref={kvittering} tabIndex={-1} role="status" className="mx-4 mt-4 outline-none md:mx-0 md:mb-8 md:mt-0">
            <BordetErDekket
              leverandor={valgtTilbud.leverandorNavn}
              className="rounded-media md:flex-row md:flex-wrap md:items-center md:gap-x-8"
              handling={
                <ButtonLink href="#" variant="accent">
                  Se avtalen
                </ButtonLink>
              }
            />
          </div>
        )}

        {tilbud.length === 0 ? (
          <div className="px-4 pt-8 md:px-0">
            <EmptyState
              illustrasjon="/illustrasjoner/tom-tallerken.svg"
              tittel="Ingen tilbud ennå"
              handling={
                <Link href="/foresporsel" className="font-semibold">
                  Endre forespørselen
                </Link>
              }
            >
              Leverandørene har fått forespørselen. Du får en e-post når det første tilbudet kommer.
            </EmptyState>
          </div>
        ) : (
          <>
            {/* Mobil: kort som sveipes */}
            <div className="md:hidden">
              {tilbud.length > 1 && <div className="px-4 pb-2 pt-4">{sorteringsknapper('lys')}</div>}
              {sortert.length > 2 && (
                <p className="m-0 px-4 pb-3 text-small text-text-muted" id="sveip-hint">
                  Sveip for å se tilbud {kortnavn(sortert[2])}
                </p>
              )}
              <ul
                tabIndex={0}
                aria-label="Tilbud"
                aria-describedby={sortert.length > 2 ? 'sveip-hint' : undefined}
                className="k-scroll-snap m-0 flex list-none gap-3 overflow-x-auto px-4 pb-4 [scroll-padding-inline:16px]"
              >
                {sortert.map((t) => {
                  const g = gjelderTil(t.gyldigTil);
                  return (
                    <li key={t.id} className="flex w-[172px] shrink-0 flex-col gap-3">
                      <article aria-label={t.leverandorNavn} className="flex flex-grow flex-col gap-3">
                        <div className="relative h-[130px] overflow-hidden rounded-card bg-[var(--k-photo-placeholder)]">
                          <Image src={t.bilde.src} alt={t.bilde.alt} fill sizes="172px" className="object-cover" />
                        </div>
                        <h2 className="m-0 text-[15px] font-bold">{t.leverandorNavn}</h2>
                        <div className="flex min-h-[84px] flex-col items-start">
                          <PriceRing ringed={t.id === fremhevet} className={cn('text-[36px]', t.id === fremhevet && 'mb-1.5 ml-2.5 mt-2')}>
                            {kr(t.prisPerKuvert)}
                          </PriceRing>
                          <span className="pl-1.5 text-small font-semibold">per kuvert{t.id === lavest ? ' · lavest' : ''}</span>
                        </div>
                        <dl className="m-0 flex flex-col gap-3 text-[15px]">
                          <div className="min-h-touch">
                            <dt className="text-small text-text-muted">Totalt inkl. mva</dt>
                            <dd className="k-num m-0 font-bold">{kr(t.totalInklMva)}</dd>
                          </div>
                          <div className="min-h-[88px]">
                            <dt className="text-small text-text-muted">Meny</dt>
                            <dd className="m-0 leading-[1.4]">{t.meny}</dd>
                          </div>
                          <div className="min-h-[112px]">
                            <dt className="text-small text-text-muted">Inkludert</dt>
                            <dd className="m-0 leading-[1.6]">
                              <ul className="m-0 list-none p-0">
                                {t.levering.inkludert && (
                                  <li>
                                    <Hake />
                                    Levering
                                  </li>
                                )}
                                {f.kosthold.length > 0 &&
                                  (t.kosthold.dekket ? (
                                    <li>
                                      <Hake />
                                      {kostholdKort}
                                    </li>
                                  ) : (
                                    <>
                                      <li>
                                        <Hake />
                                        {t.kosthold.tekst.replace(/ dekket\.?$/, '')}
                                      </li>
                                      {t.kosthold.merknad && <li className="font-semibold text-warning">{t.kosthold.merknad.replace(/\.$/, '')}</li>}
                                    </>
                                  ))}
                                {t.oppsettOgRydding ? (
                                  <li>
                                    <Hake />
                                    Oppsett og rydding
                                  </li>
                                ) : (
                                  <li className="text-text-muted">Uten oppsett</li>
                                )}
                                {!t.levering.inkludert && t.levering.pris && <li className="text-text-muted">Levering {kr(t.levering.pris)}</li>}
                              </ul>
                            </dd>
                          </div>
                          <div>
                            <dt className="text-small text-text-muted">Gjelder til</dt>
                            <dd className={cn('m-0 font-semibold', g.haster && 'text-warning')}>{g.tekst}</dd>
                          </div>
                        </dl>
                        <div className="mt-auto">{velgKnapp(t, `Velg ${kortnavn(t)}`, 'w-full')}</div>
                      </article>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Desktop: tabell */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[860px] table-fixed border-collapse">
                <caption className="sr-only">
                  {tilbud.length} tilbud side om side, sortert etter {sorteringer.find((s) => s.id === sortering)?.navn.toLowerCase()}
                </caption>
                <colgroup>
                  <col className="w-[22%]" />
                  {sortert.map((t) => (
                    <col key={t.id} />
                  ))}
                </colgroup>
                <thead>
                  <tr className="border-b-2 border-text">
                    <th scope="col" className="pb-4 pr-4 text-left align-bottom text-[15px] font-semibold text-text-muted">
                      Tilbud
                    </th>
                    {sortert.map((t) => (
                      <th key={t.id} scope="col" className="px-3 pb-4 text-left align-top">
                        <div className="flex flex-col gap-3">
                          <div className="relative h-[170px] overflow-hidden rounded-card bg-[var(--k-photo-placeholder)]">
                            <Image src={t.bilde.src} alt={t.bilde.alt} fill sizes="(min-width: 1200px) 300px, 25vw" className="object-cover" />
                          </div>
                          <span className="text-[17px] font-bold">{t.leverandorNavn}</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="[&>tr]:border-b [&>tr]:border-border [&_th]:py-[18px] [&_th]:pr-4 [&_th]:text-left [&_th]:align-top [&_th]:text-[15px] [&_th]:font-semibold [&_th]:text-text-muted [&_td]:px-3 [&_td]:py-[18px] [&_td]:align-top">
                  <tr>
                    <th scope="row" className="!align-middle">
                      Pris per kuvert
                    </th>
                    {sortert.map((t) => (
                      <td key={t.id} className="!py-3">
                        <PriceRing ringed={t.id === fremhevet} className="px-2 text-[44px]">
                          {kr(t.prisPerKuvert)}
                        </PriceRing>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <th scope="row">Totalt inkl. mva</th>
                    {sortert.map((t) => (
                      <td key={t.id} className="k-num font-bold">
                        {kr(t.totalInklMva)}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <th scope="row">Meny</th>
                    {sortert.map((t) => (
                      <td key={t.id} className="leading-normal">
                        {t.meny}
                      </td>
                    ))}
                  </tr>
                  {f.kosthold.length > 0 && (
                    <tr>
                      <th scope="row">{kostholdTekst.charAt(0).toUpperCase() + kostholdTekst.slice(1)}</th>
                      {sortert.map((t) => (
                        <td key={t.id} className="font-bold leading-tight">
                          <span className="text-success">{t.kosthold.tekst}</span>
                          {t.kosthold.merknad && <span className="text-warning"> {t.kosthold.merknad}</span>}
                        </td>
                      ))}
                    </tr>
                  )}
                  <tr>
                    <th scope="row">Levering</th>
                    {sortert.map((t) => (
                      <td key={t.id}>{t.levering.inkludert ? 'Inkludert' : t.levering.pris ? kr(t.levering.pris) : 'Ikke inkludert'}</td>
                    ))}
                  </tr>
                  <tr>
                    <th scope="row">Oppsett og rydding</th>
                    {sortert.map((t) => (
                      <td key={t.id} className={cn(!t.oppsettOgRydding && 'text-text-muted')}>
                        {t.oppsettOgRydding ? 'Inkludert' : 'Ikke inkludert'}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <th scope="row">Servise</th>
                    {sortert.map((t) => (
                      <td key={t.id}>{t.servise}</td>
                    ))}
                  </tr>
                  <tr>
                    <th scope="row">Gjelder til</th>
                    {sortert.map((t) => {
                      const g = gjelderTil(t.gyldigTil);
                      return (
                        <td key={t.id} className={cn(g.haster && 'font-bold text-warning')}>
                          {g.tekst}
                        </td>
                      );
                    })}
                  </tr>
                  <tr className="!border-0">
                    <td className="!px-0" />
                    {sortert.map((t) => (
                      <td key={t.id} className="!pt-5">
                        <div className="flex flex-col items-start gap-1.5">
                          {velgKnapp(t, 'Velg dette tilbudet', 'min-h-[54px] w-full')}
                          <Link href="#" className="py-2 text-[15px] font-semibold">
                            Se hele tilbudet<span className="sr-only"> fra {t.leverandorNavn}</span>
                          </Link>
                        </div>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mx-4 mt-4 flex items-center gap-3.5 border-t border-border py-[18px] md:mx-0 md:mt-7 md:gap-8 md:pt-8">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/illustrasjoner/tallerken-hake.svg" alt="" className="k-ink w-[84px] shrink-0 md:ml-3 md:w-[80px]" />
              <p className="m-0 max-w-[60ch] text-[15px] leading-normal text-text-muted md:text-base">
                Du forplikter deg først når du velger. Leverandørene du ikke velger, får beskjed automatisk.
                <span className="hidden md:inline"> Kuverto tar ingen provisjon.</span>
              </p>
            </div>

            <section className="mx-4 mt-6 flex flex-col gap-2.5 md:hidden">
              <h2 className="k-heading m-0 text-2xl">Spørsmål til en leverandør?</h2>
              <p className="m-0 text-[15px] text-text-muted">Åpne tilbudet og send en melding. Svaret kommer her og på e-post.</p>
              <ButtonLink href="#" variant="text" className="self-start !px-0 font-semibold">
                Se hele tilbudet fra {kortnavn(sortert[0])}
              </ButtonLink>
            </section>
          </>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
