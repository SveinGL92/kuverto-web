'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { LeverandorShell } from '@/components/layout/LeverandorShell';
import { Symbol } from '@/components/layout/Logo';
import { ForesporselKort } from '@/components/kuverto/ForesporselKort';
import { dagerTil, tidSiden } from '@/components/kuverto/tid';
import { EmptyState } from '@/components/states/EmptyState';
import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { Button, ButtonLink } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { PriceRing } from '@/components/ui/PriceRing';
import { Tabs } from '@/components/ui/Tabs';
import { cn } from '@/lib/cn';
import { dagMnd, dagMndLang, datoKort, stor } from '@/lib/format';
import { anledningIllustrasjon, anledningNavn, budsjettNavn, kostholdNavn, serveringNavn } from '@/lib/labels';
import { foresporsler, kontaktFor, leverandor, meldinger, opplaste } from '@/lib/mock';
import type { Foresporsel } from '@/lib/types';

/** Områdevisning uten poststed i parentes: «Oslo sentrum (01xx)» → «Oslo 01xx». */
const omrade = (f: Foresporsel) => f.omradeVisning.replace(' sentrum', '').replace(/[()]/g, '');

const undertekst = (f: Foresporsel) => {
  const dager = dagerTil(f.dato);
  if (dager >= 0 && dager <= 3) return { tekst: dager === 0 ? 'I dag' : dager === 1 ? 'I morgen' : `Om ${dager} dager`, haster: true };
  if (f.gjentakelse) return { tekst: 'Fast, hver tirsdag', haster: false };
  if (f.kosthold.length) return { tekst: f.kosthold.map((k) => `${kostholdNavn(k.type)} ${k.antall}`).join(' · '), haster: false };
  return { tekst: serveringNavn(f.servering), haster: false };
};

const merkelapp = (f: Foresporsel) => {
  const dager = dagerTil(f.dato);
  if (dager >= 0 && dager <= 3) return <Badge tone="advarsel">Om {dager} dager</Badge>;
  const t = tidSiden(f.opprettet);
  return <Badge tone="ny">Ny · {t}</Badge>;
};

export function Dashbord() {
  const [saldo, setSaldo] = useState(leverandor.klippsaldo);
  const [opplasteIder, setOpplasteIder] = useState<string[]>([]);
  const [skjult, setSkjult] = useState<string[]>([]);
  const [apen, setApen] = useState<string>();
  const [melding, setMelding] = useState<string>();
  const [fane, setFane] = useState('nye');

  const nye = foresporsler.filter((f) => !opplasteIder.includes(f.id) && !skjult.includes(f.id));
  const ulest = meldinger.filter((m) => m.ulest).length;
  const valgt = foresporsler.find((f) => f.id === apen);
  const haster = opplaste.filter((o) => o.svarfrist && dagerTil(o.svarfrist) <= 1).length;

  const lasOpp = (f: Foresporsel) => {
    setSaldo((s) => s - f.klippPris);
    setOpplasteIder((l) => [...l, f.id]);
    setMelding(`${anledningNavn(f.anledning)} for ${f.gjester} er låst opp. ${f.klippPris} klipp er trukket.`);
  };

  const meny = [
    { href: '/leverandor', navn: 'Oversikt', aktiv: true },
    {
      href: '/leverandor',
      navn: 'Nye forespørsler',
      merke: (
        <span className="rounded-pill bg-accent px-2 text-small font-bold text-accent-on">
          {nye.length}
          <span className="sr-only"> nye</span>
        </span>
      ),
    },
    { href: '/leverandor', navn: 'Opplåste' },
    { href: '/leverandor', navn: 'Mine tilbud' },
    { href: '/leverandor', navn: 'Meldinger', merke: <span className="text-small font-normal text-panel-on-muted">{ulest} uleste</span> },
    { href: '/leverandor', navn: 'Klipp og kvitteringer' },
    { href: '/leverandor', navn: 'Område og innstillinger' },
  ];

  const mobilHode = (
    <header className="flex flex-col gap-5 bg-panel pb-7 pl-4 pr-2 pt-2.5 text-panel-on">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2">
          <Symbol size={24} />
          <span className="text-[15px] font-semibold text-panel-on-muted">{leverandor.navn}</span>
        </span>
        <button type="button" aria-label={`Varsler, ${ulest + 1} nye`} className="relative flex h-11 w-11 items-center justify-center">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z" />
            <path d="M10 20.5h4" />
          </svg>
          <span className="absolute right-[9px] top-[9px] h-2.5 w-2.5 rounded-pill border-2 border-panel bg-accent" />
        </button>
      </div>
      <div className="flex items-end justify-between gap-3 pr-2">
        <div className="flex flex-col gap-0.5">
          <span className="text-[15px] text-panel-on-muted">Klippsaldo</span>
          <span className="k-heading k-num text-[52px] leading-none tracking-[-0.04em]" aria-live="polite">
            {saldo} klipp
          </span>
        </div>
        <ButtonLink href="#" variant="accent" className="min-h-12 px-4">
          Kjøp klipp
        </ButtonLink>
      </div>
    </header>
  );

  const ringId = nye[0]?.id;

  return (
    <LeverandorShell meny={meny} firma={leverandor.navn} dekning={leverandor.dekningVisning} mobilHode={mobilHode}>
      <main id="innhold" className="flex flex-col md:gap-9 md:px-[clamp(16px,4vw,56px)] md:pb-14 md:pt-9">
        {/* Desktop-hode */}
        <div className="hidden flex-wrap items-end justify-between gap-5 md:flex">
          <h1 className="k-heading m-0 text-[52px] leading-none tracking-[-0.04em]">{nye.length} nye i området</h1>
          <div className="flex items-center gap-5">
            <span className="flex flex-col">
              <span className="text-small text-text-muted">Klippsaldo</span>
              <strong className="k-heading k-num text-[32px] tracking-[-0.03em]" aria-live="polite">
                {saldo} klipp
              </strong>
            </span>
            <ButtonLink href="#" className="min-h-[50px] px-[18px]">
              Kjøp klipp
            </ButtonLink>
          </div>
        </div>
        <h1 className="sr-only md:hidden">{nye.length} nye forespørsler i området</h1>

        {melding && (
          <div className="px-4 pt-4 md:px-0 md:pt-0">
            <Alert tone="status">{melding}</Alert>
          </div>
        )}

        {/* Mobil: faner og kort */}
        <div className="md:hidden">
          <Tabs
            label="Oversikt"
            aktiv={fane}
            onVelg={setFane}
            className="mx-4 gap-[22px] [&>button]:min-h-[52px]"
            faner={[
              { id: 'nye', navn: `Nye ${nye.length}` },
              { id: 'opplaste', navn: `Opplåste ${opplaste.length + opplasteIder.length}` },
              { id: 'meldinger', navn: `Meldinger ${ulest}` },
            ]}
          />
          <div role="tabpanel" id={`${fane}-panel`} aria-labelledby={`${fane}-fane`} className="px-4 pb-6 pt-2">
            {fane === 'nye' &&
              (nye.length === 0 ? (
                <EmptyState illustrasjon="/illustrasjoner/kart.svg" tittel="Stille i området" className="pt-6" handling={<Button variant="secondary">Utvid området</Button>}>
                  Vi varsler deg så snart noen i området ditt sender en forespørsel. Et større område gir flere å velge mellom.
                </EmptyState>
              ) : (
                <ul className="m-0 flex list-none flex-col p-0">
                  {nye.map((f) => {
                    const dag = dagerTil(f.dato);
                    return (
                      <li key={f.id} className="flex flex-col gap-2.5 border-b border-border py-5">
                        <div className="flex justify-between gap-3">
                          <div className="flex flex-col gap-1.5">
                            <span className="self-start">{merkelapp(f)}</span>
                            <h2 className="k-heading m-0 text-2xl tracking-[-0.025em]">
                              {anledningNavn(f.anledning)} for {f.gjester}
                            </h2>
                          </div>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={anledningIllustrasjon(f.anledning)} alt="" className="k-ink w-[84px] shrink-0 self-start" />
                        </div>
                        <p className="m-0 text-[15px] leading-normal text-text-muted">
                          {stor(datoKort(f.dato))} · {omrade(f)}
                          {f.id === ringId
                            ? f.kosthold.length > 0 && ` · ${f.kosthold.map((k) => `${kostholdNavn(k.type).toLowerCase()} ${k.antall}`).join(', ')}`
                            : ` · ${budsjettNavn(f.budsjett)} per kuvert${dag > 3 ? ` · ${serveringNavn(f.servering).toLowerCase()}` : ''}`}
                        </p>
                        {f.id === ringId && (
                          <PriceRing className="mb-2 ml-[22px] mt-2.5 text-[22px] tracking-[-0.02em]">{budsjettNavn(f.budsjett)}</PriceRing>
                        )}
                        <Button onClick={() => setApen(f.id)} className="min-h-[50px]">
                          Lås opp for {f.klippPris} klipp
                        </Button>
                      </li>
                    );
                  })}
                </ul>
              ))}
            {fane === 'opplaste' && <OpplasteListe ekstra={opplasteIder} onApne={setApen} />}
            {fane === 'meldinger' && <MeldingsListe />}
          </div>
        </div>

        {/* Desktop: tabell, opplåste og meldinger */}
        <div className="hidden flex-wrap items-start gap-10 md:flex">
          <section aria-labelledby="nye-tittel" className="flex min-w-0 flex-[2_1_520px] flex-col gap-3.5">
            <div className="flex items-baseline justify-between">
              <h2 id="nye-tittel" className="k-heading m-0 text-[28px]">
                Nye forespørsler
              </h2>
              <Link href="#" className="font-semibold">
                Se alle {nye.length}
              </Link>
            </div>
            {nye.length === 0 ? (
              <EmptyState illustrasjon="/illustrasjoner/kart.svg" tittel="Stille i området" overskriftNiva={3} handling={<Button variant="secondary">Utvid området</Button>}>
                Vi varsler deg så snart noen i området ditt sender en forespørsel. Et større område gir flere å velge mellom.
              </EmptyState>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px] border-collapse">
                  <thead>
                    <tr className="text-left text-small text-text-muted">
                      <th scope="col" className="py-2.5 pr-3 font-semibold">
                        Anledning
                      </th>
                      <th scope="col" className="px-3 py-2.5 font-semibold">
                        Dato
                      </th>
                      <th scope="col" className="px-3 py-2.5 font-semibold">
                        Område
                      </th>
                      <th scope="col" className="px-3 py-2.5 font-semibold">
                        Per kuvert
                      </th>
                      <th scope="col" className="py-2.5">
                        <span className="sr-only">Lås opp</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {nye.map((f) => {
                      const u = undertekst(f);
                      return (
                        <tr key={f.id} className="border-t border-border last:border-b">
                          <td className="py-3 pr-3">
                            <span className="flex items-center gap-3">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={anledningIllustrasjon(f.anledning)} alt="" className="k-ink w-16 shrink-0" />
                              <span>
                                <strong>
                                  {anledningNavn(f.anledning)} · {f.gjester}
                                </strong>
                                <br />
                                <span className={cn('text-small', u.haster ? 'text-warning' : 'text-text-muted')}>{u.tekst}</span>
                              </span>
                            </span>
                          </td>
                          <td className="p-3">{f.gjentakelse ? `Fra ${dagMnd(f.dato)}` : dagMnd(f.dato)}</td>
                          <td className="p-3">{omrade(f)}</td>
                          <td className="k-num whitespace-nowrap p-3">
                            {f.id === ringId ? <PriceRing heading={false} className="py-0.5">{budsjettNavn(f.budsjett)}</PriceRing> : budsjettNavn(f.budsjett)}
                          </td>
                          <td className="py-3 text-right">
                            <Button size="sm" onClick={() => setApen(f.id)} className="whitespace-nowrap px-3.5">
                              Lås opp · {f.klippPris}
                              <span className="sr-only"> klipp, {anledningNavn(f.anledning).toLowerCase()} for {f.gjester}</span>
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            <div className="mt-6 flex items-baseline justify-between">
              <h2 className="k-heading m-0 text-[28px]">
                Opplåste{' '}
                {haster > 0 && (
                  <span className="font-sans text-base font-bold tracking-normal text-warning">· {haster} må besvares i morgen</span>
                )}
              </h2>
              <Link href="#" className="font-semibold">
                Se alle {opplaste.length + opplasteIder.length}
              </Link>
            </div>
            <div className="flex flex-wrap border-t-2 border-text">
              {opplaste.slice(0, 2).map((o, i) => (
                <div key={o.id} className={cn('flex flex-[1_1_260px] flex-col gap-1.5 py-[18px]', i === 0 ? 'pr-5' : 'border-l border-border pl-5')}>
                  <span className="self-start">
                    {o.tilbudGodtatt ? <Badge tone="suksess">Godtatt</Badge> : <Badge tone="advarsel">Svar innen i morgen</Badge>}
                  </span>
                  <strong className="k-heading text-[22px] tracking-normal">{o.tittel}</strong>
                  <span className="text-[15px] text-text-muted">
                    {o.kunde} · {o.sted} · {dagMndLang(o.dato)}
                    {o.dato.slice(0, 4) !== String(new Date().getFullYear()) && !o.tilbudGodtatt ? ` ${o.dato.slice(0, 4)}` : ''}
                  </span>
                  <Link href="#" className="pt-1.5 font-semibold">
                    {o.tilbudGodtatt ? 'Åpne oppdraget' : 'Lag tilbud'}
                  </Link>
                </div>
              ))}
            </div>
          </section>

          <section aria-labelledby="meldinger-tittel" className="flex min-w-0 flex-[1_1_280px] flex-col gap-3.5">
            <div className="flex items-baseline justify-between">
              <h2 id="meldinger-tittel" className="k-heading m-0 text-[28px]">
                Meldinger
              </h2>
              <Link href="#" className="font-semibold">
                Alle
              </Link>
            </div>
            <MeldingsListe />
            <div className="relative mt-3 h-[200px] overflow-hidden rounded-card bg-[var(--k-photo-placeholder)]">
              <Image
                src="/bilder/leverandor.webp"
                alt="Eksempelbilde: hender i forkle som anretter et fat med grillede grønnsaker"
                fill
                sizes="(min-width: 1200px) 360px, 30vw"
                className="object-cover"
                style={{ objectPosition: '50% 45%' }}
              />
            </div>
            <Link href="#" className="font-semibold">
              Bytt profilbilde og menyfoto
            </Link>
          </section>
        </div>

        <Dialog apen={!!valgt} onLukk={() => setApen(undefined)} label={valgt ? `${anledningNavn(valgt.anledning)} for ${valgt.gjester}` : 'Forespørsel'}>
          {valgt && (
            <ForesporselKort
              foresporsel={valgt}
              kontakt={opplasteIder.includes(valgt.id) ? kontaktFor(valgt.id) ?? { foresporselId: valgt.id, navn: '[Kunde]', epost: 'kunde@eksempel.no' } : undefined}
              klippsaldo={saldo}
              onLasOpp={() => lasOpp(valgt)}
              onIkkeAktuell={() => {
                setSkjult((l) => [...l, valgt.id]);
                setApen(undefined);
              }}
              onLagTilbud={() => setApen(undefined)}
              onSendMelding={() => setApen(undefined)}
            />
          )}
        </Dialog>
      </main>
    </LeverandorShell>
  );
}

function OpplasteListe({ ekstra, onApne }: { ekstra: string[]; onApne: (id: string) => void }) {
  return (
    <ul className="m-0 flex list-none flex-col p-0">
      {ekstra.map((id) => {
        const f = foresporsler.find((x) => x.id === id)!;
        return (
          <li key={id} className="flex flex-col gap-1.5 border-b border-border py-5">
            <span className="self-start">
              <Badge tone="opplast">Opplåst</Badge>
            </span>
            <strong className="k-heading text-[22px] tracking-normal">
              {anledningNavn(f.anledning)} · {f.gjester}
            </strong>
            <Button variant="text" onClick={() => onApne(id)} className="self-start !px-0">
              Åpne forespørselen
            </Button>
          </li>
        );
      })}
      {opplaste.map((o) => (
        <li key={o.id} className="flex flex-col gap-1.5 border-b border-border py-5">
          <span className="self-start">{o.tilbudGodtatt ? <Badge tone="suksess">Godtatt</Badge> : <Badge tone="advarsel">Svar innen i morgen</Badge>}</span>
          <strong className="k-heading text-[22px] tracking-normal">{o.tittel}</strong>
          <span className="text-[15px] text-text-muted">
            {o.kunde} · {o.sted} · {dagMndLang(o.dato)}
          </span>
          <Link href="#" className="pt-1 font-semibold">
            {o.tilbudGodtatt ? 'Åpne oppdraget' : 'Lag tilbud'}
          </Link>
        </li>
      ))}
    </ul>
  );
}

function MeldingsListe() {
  return (
    <ul className="m-0 flex list-none flex-col border-t-2 border-text p-0">
      {meldinger.map((m) => (
        <li key={m.id}>
          <Link href="#" className="flex flex-col gap-0.5 border-b border-border py-3.5 text-text no-underline hover:text-text">
            <span className={cn('flex items-center gap-2', m.ulest ? 'font-bold' : 'font-semibold')}>
              {m.fra}
              {m.ulest && (
                <>
                  <span className="h-2 w-2 rounded-pill bg-primary" aria-hidden="true" />
                  <span className="sr-only">, ulest</span>
                </>
              )}
            </span>
            <span className="truncate text-[15px] text-text-muted">
              {m.sendtAvMeg ? 'Du: ' : ''}
              {m.tekst}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
