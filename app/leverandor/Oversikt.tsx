'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ForesporselKort } from '@/components/kuverto/ForesporselKort';
import { dagerTil } from '@/components/kuverto/tid';
import { Symbol } from '@/components/layout/Logo';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { EmptyState } from '@/components/states/EmptyState';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { VedleggOpplaster } from '@/components/kuverto/VedleggOpplaster';
import { Datovelger } from '@/components/ui/Datovelger';
import { Dialog } from '@/components/ui/Dialog';
import { Input, Textarea, feltKlasse } from '@/components/ui/Input';
import { Tabs } from '@/components/ui/Tabs';
import { useSprak } from '@/components/Sprak';
import type { T } from '@/lib/i18n/core';
import { KLIPPAKKER, MVA_SATS, pakkePris, prisPerKlipp, refusjonLang } from '@/lib/klipp';
import { anledningNavn } from '@/lib/labels';
import type { Foresporsel, ForesporselKontakt } from '@/lib/types';
import { Samtale } from '@/components/kuverto/Samtale';
import { kjopKlipp, lasOpp, sendTilbud, type TilbudInn } from './actions';

export interface Opplast {
  foresporsel: Foresporsel;
  kontakt: ForesporselKontakt;
  svarfrist: string | null;
  foresporselStatus: string;
  meldinger: number;
  uleste: number;
  tilbud?: TilbudInn & { status: string };
}

const SKJULT = 'kuverto-skjulte';
const statusNavn: Record<string, string> = { sendt: 'Sendt', endret: 'Oppdatert', godtatt: 'Valgt av kunden', avslatt: 'Ikke valgt', trukket: 'Trukket', utlopt: 'Utløpt' };

function svarfristTekst(iso: string | null, t: T) {
  if (!iso) return undefined;
  const d = dagerTil(iso);
  if (d < 0) return t('Svarfristen har gått ut');
  if (d === 0) return t('Svar i dag');
  if (d === 1) return t('Svar innen i morgen');
  return t('Svar innen {d} dager', { d });
}

export interface KlippLinje {
  id: string;
  endring: number;
  tekst: string;
  dato: string;
}

export function Oversikt({
  firma,
  dekning,
  saldo,
  nye,
  opplaste,
  historikk,
}: {
  firma: string;
  dekning: string;
  saldo: number;
  nye: (Foresporsel & { andreOpplast: number })[];
  opplaste: Opplast[];
  historikk: KlippLinje[];
}) {
  const router = useRouter();
  const q = useSearchParams();
  const { t, sti, info, penger } = useSprak();
  const [fane, setFane] = useState(q.get('samtale') || (nye.length === 0 && opplaste.length > 0) ? 'opplaste' : 'nye');
  const [skjult, setSkjult] = useState<string[]>([]);
  const [status, setStatus] = useState<{ tone: 'status' | 'feil'; tekst: string } | undefined>(
    q.get('kjop') === 'ok' ? { tone: 'status', tekst: t('Takk for kjøpet! Klippene legges til så snart betalingen er bekreftet. Last siden på nytt om et øyeblikk.') } : undefined,
  );
  const [opptatt, setOpptatt] = useState<string>();
  const [kjopApen, setKjopApen] = useState(false);
  const [tilbudFor, setTilbudFor] = useState<Opplast>();
  // Lenke fra e-postvarsel: /leverandor?samtale=<forespørsel>
  const [meldingFor, setMeldingFor] = useState<Opplast | undefined>(() => opplaste.find((o) => o.foresporsel.id === q.get('samtale')));

  useEffect(() => {
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- engangs innlesing fra localStorage
      setSkjult(JSON.parse(localStorage.getItem(SKJULT) ?? '[]'));
    } catch {}
  }, []);
  const skjul = (id: string) => {
    const ny = [...skjult, id];
    setSkjult(ny);
    try {
      localStorage.setItem(SKJULT, JSON.stringify(ny.slice(-200)));
    } catch {}
  };

  const synlige = nye.filter((f) => !skjult.includes(f.id));

  const lasOppHandling = async (f: Foresporsel) => {
    setOpptatt(f.id);
    const svar = await lasOpp(f.id);
    setOpptatt(undefined);
    if (svar.ok) {
      setStatus({ tone: 'status', tekst: t('{hva} for {gjester} er låst opp. {klipp} klipp er trukket. Du finner den under «Opplåste».', { hva: anledningNavn(f.anledning, t), gjester: f.gjester, klipp: f.klippPris }) });
      setFane('opplaste');
      router.refresh();
    } else setStatus({ tone: 'feil', tekst: svar.feil });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-dvh">
      <header className="bg-panel text-panel-on">
        <div className="k-wrap flex flex-wrap items-center justify-between gap-3 py-3.5">
          <Link href={sti('/')} className="flex items-center gap-2 text-panel-on no-underline hover:text-panel-on">
            <Symbol size={26} />
            <span className="k-heading text-[26px] leading-none tracking-[-0.035em]">kuverto</span>
            <span className="sr-only">{t(', til forsiden')}</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link href={sti('/leverandor/profil')} className="inline-flex min-h-touch items-center px-2 text-[15px] font-semibold text-panel-on-muted no-underline hover:text-panel-on">
              {t('Profil og område')}
            </Link>
            <form action="/logg-ut" method="post">
              <button type="submit" className="min-h-touch px-2 text-[15px] font-semibold text-panel-on-muted hover:text-panel-on">
                {t('Logg ut')}
              </button>
            </form>
          </div>
        </div>
        <div className="k-wrap flex flex-wrap items-end justify-between gap-5 pb-8 pt-4">
          <div className="flex flex-col gap-1.5">
            <h1 className="k-heading m-0 text-[34px] leading-none md:text-[48px]">{firma}</h1>
            <p className="m-0 text-[15px] text-panel-on-muted">
              {t('Leverer til {dekning}', { dekning })} ·{' '}
              <Link href={sti('/leverandor/profil')} className="text-panel-on">
                {t('endre')}
              </Link>
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end">
              <span className="k-heading k-num text-[34px] leading-none">{saldo}</span>
              <span className="text-small text-panel-on-muted">{t('klipp igjen')}</span>
            </div>
            <Button variant="accent" onClick={() => setKjopApen(true)}>
              {t('Kjøp klipp')}
            </Button>
          </div>
        </div>
      </header>

      <main id="innhold" className="k-wrap flex flex-col gap-6 py-6 md:py-10">
        {status && (
          <div aria-live="polite">
            <Alert tone={status.tone}>{status.tekst}</Alert>
          </div>
        )}
        <Tabs
          label={t('Forespørsler')}
          aktiv={fane}
          onVelg={setFane}
          faner={[
            { id: 'nye', navn: t('Nye i området ({n})', { n: synlige.length }) },
            { id: 'opplaste', navn: t('Opplåste ({n})', { n: opplaste.length }) },
            { id: 'klipp', navn: t('Klipp') },
          ]}
        />

        {fane === 'nye' && (
          <div role="tabpanel" id="nye-panel" aria-labelledby="nye-fane" className="grid gap-5 lg:grid-cols-2">
            {synlige.length === 0 ? (
              <div className="lg:col-span-2">
                <EmptyState illustrasjon="/illustrasjoner/tom-tallerken.svg" tittel={t('Ingen nye forespørsler akkurat nå')}>
                  {t('Du får e-post når det kommer nye forespørsler i området ditt.')}
                </EmptyState>
              </div>
            ) : (
              synlige.map((f) => (
                <div key={f.id} className="flex flex-col gap-2">
                  <ForesporselKort
                    foresporsel={f}
                    klippsaldo={saldo}
                    opptatt={opptatt === f.id}
                    onLasOpp={() => lasOppHandling(f)}
                    onIkkeAktuell={() => skjul(f.id)}
                    onKjopKlipp={() => setKjopApen(true)}
                  />
                  <p className="m-0 px-2 text-small text-text-muted">
                    {f.andreOpplast === 0 ? t('Ingen har låst opp ennå.') : t('{n} av {maks} plasser er tatt.', { n: f.andreOpplast, maks: f.maksLeverandorer })}
                  </p>
                </div>
              ))
            )}
          </div>
        )}

        {fane === 'opplaste' && (
          <div role="tabpanel" id="opplaste-panel" aria-labelledby="opplaste-fane" className="grid gap-5 lg:grid-cols-2">
            {opplaste.length === 0 ? (
              <div className="lg:col-span-2">
                <EmptyState illustrasjon="/illustrasjoner/bordkort.svg" tittel={t('Ingen opplåste ennå')}>
                  {t('Når du låser opp en forespørsel, ser du kundens kontaktinfo her og kan sende tilbud.')}
                </EmptyState>
              </div>
            ) : (
              opplaste.map((o) => {
                const kanEndre = o.foresporselStatus === 'aktiv' && (!o.tilbud || ['sendt', 'endret'].includes(o.tilbud.status));
                return (
                  <ForesporselKort
                    key={o.foresporsel.id}
                    foresporsel={o.foresporsel}
                    kontakt={o.kontakt}
                    klippsaldo={saldo}
                    svarfrist={o.tilbud ? undefined : svarfristTekst(o.svarfrist, t)}
                    lagTilbudTekst={o.tilbud ? t('Endre tilbudet') : t('Lag tilbud')}
                    onLagTilbud={kanEndre ? () => setTilbudFor(o) : undefined}
                    onSendMelding={() => setMeldingFor(o)}
                    meldingTekst={o.uleste ? t('Meldinger ({n} nye)', { n: o.uleste }) : o.meldinger ? t('Meldinger ({n})', { n: o.meldinger }) : t('Send melding')}
                    tilbudStatus={
                      o.tilbud ? (
                        <p className="m-0 rounded-alert bg-surface-soft px-4 py-3 text-[15px]">
                          <strong>{t('Tilbud: {status}', { status: statusNavn[o.tilbud.status] ? t(statusNavn[o.tilbud.status]) : o.tilbud.status })}</strong> · {t('{pris} per kuvert', { pris: penger(Math.round(o.tilbud.prisPerKuvert * 100)) })}
                          {o.tilbud.status === 'godtatt' && ` · ${t('Ta kontakt med kunden for å avtale detaljene.')}`}
                        </p>
                      ) : o.foresporselStatus !== 'aktiv' ? (
                        <p className="m-0 rounded-alert bg-surface-soft px-4 py-3 text-[15px]">{t('Kunden har valgt et annet tilbud, eller forespørselen er lukket.')}</p>
                      ) : undefined
                    }
                  />
                );
              })
            )}
          </div>
        )}

        {fane === 'klipp' && (
          <div role="tabpanel" id="klipp-panel" aria-labelledby="klipp-fane" className="flex flex-col gap-4">
            <p className="m-0 max-w-[70ch] rounded-alert bg-surface-soft px-4 py-3 text-[15px]">{refusjonLang(t)}</p>
            {historikk.length === 0 ? (
              <p className="m-0 text-text-muted">{t('Ingen klipp ennå.')}</p>
            ) : (
              <ul className="m-0 flex list-none flex-col rounded-card bg-surface p-0">
                {historikk.map((h) => (
                  <li key={h.id} className="flex items-center justify-between gap-4 border-b border-border px-4 py-3 last:border-0 md:px-6">
                    <span className="flex min-w-0 flex-col">
                      <span className="text-base">{h.tekst}</span>
                      <span className="text-small text-text-muted">{new Date(h.dato).toLocaleString(info.intl, { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Oslo' })}</span>
                    </span>
                    <strong className={`k-num shrink-0 text-[17px] ${h.endring < 0 ? 'text-text' : 'text-success'}`}>
                      {h.endring > 0 ? `+${h.endring}` : h.endring}
                      <span className="sr-only"> {t('klipp')}</span>
                    </strong>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        <div className="pt-4">
          <ThemeToggle />
        </div>
      </main>

      <Dialog apen={kjopApen} onLukk={() => setKjopApen(false)} label={t('Kjøp klipp')}>
        <KjopKlipp />
      </Dialog>
      <Dialog apen={!!tilbudFor} onLukk={() => setTilbudFor(undefined)} label={t('Tilbud')} className="max-w-[640px]">
        {tilbudFor && (
          <TilbudSkjema
            o={tilbudFor}
            onFerdig={(melding) => {
              setTilbudFor(undefined);
              setStatus({ tone: 'status', tekst: melding });
              router.refresh();
            }}
          />
        )}
      </Dialog>
      <Dialog
        apen={!!meldingFor}
        onLukk={() => {
          setMeldingFor(undefined);
          if (q.get('samtale')) router.replace(sti('/leverandor'), { scroll: false });
          router.refresh();
        }}
        label={t('Samtale med kunden')}
        className="max-w-[640px]"
      >
        {meldingFor && (
          <div className="flex flex-col gap-1 bg-bg p-6 md:p-7">
            <Samtale foresporselId={meldingFor.foresporsel.id} tittel={t('Samtale med {navn}', { navn: meldingFor.kontakt.navn })} />
            <p className="m-0 text-small text-text-muted">
              {t('{hva} for {gjester} gjester. Kunden får e-post når du skriver, og svarer her på Kuverto.', { hva: anledningNavn(meldingFor.foresporsel.anledning, t), gjester: meldingFor.foresporsel.gjester })}
            </p>
          </div>
        )}
      </Dialog>
    </div>
  );
}

function KjopKlipp() {
  const { t, marked, info, penger } = useSprak();
  const [opptatt, setOpptatt] = useState<string>();
  const [feil, setFeil] = useState<string>();
  const kjop = async (id: string) => {
    setOpptatt(id);
    setFeil(undefined);
    const svar = await kjopKlipp(id);
    if (svar.ok) window.location.assign(svar.url);
    else {
      setFeil(svar.feil);
      setOpptatt(undefined);
    }
  };
  return (
    <div className="flex flex-col gap-4 bg-bg p-6 md:p-7">
      <h2 className="k-heading m-0 pr-10 text-[28px]">{t('Kjøp klipp')}</h2>
      <p className="m-0 text-[15px] text-text-muted">
        {info.omvendtAvgift
          ? t('Du betaler med kort hos Stripe. Kvittering og faktura kommer på e-post. Fakturaen er uten mva (omvendt avgiftsplikt).')
          : t('Du betaler med kort hos Stripe. Kvittering og faktura kommer på e-post. Prisene er eks. mva.')}
      </p>
      <p className="m-0 rounded-alert bg-surface-soft px-4 py-3 text-[15px]">{refusjonLang(t)}</p>
      <ul className="m-0 flex list-none flex-col gap-2 p-0">
        {KLIPPAKKER.map((p) => (
          <li key={p.id} className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-border bg-surface p-4">
            <div className="flex flex-col">
              <strong className="text-[17px]">
                {t(p.navn)} · {t('{n} klipp', { n: p.klipp })}
              </strong>
              <span className="text-[15px] text-text-muted">
                {info.omvendtAvgift
                  ? `${penger(pakkePris(p, marked))} · ${t('{pris} per klipp', { pris: penger(prisPerKlipp(p, marked)) })}`
                  : `${penger(pakkePris(p, marked))} + ${t('mva')} (${penger(pakkePris(p, marked) * (1 + MVA_SATS))}) · ${t('{pris} per klipp', { pris: penger(prisPerKlipp(p, marked)) })}`}
              </span>
            </div>
            <Button size="sm" busy={opptatt === p.id} disabled={!!opptatt} onClick={() => kjop(p.id)}>
              {t('Velg')}<span className="sr-only"> {t(p.navn)}</span>
            </Button>
          </li>
        ))}
      </ul>
      {feil && <Alert tone="feil">{feil}</Alert>}
    </div>
  );
}

const om14Dager = () => {
  const d = new Date(Date.now() + 14 * 86_400_000);
  return d.toLocaleDateString('sv-SE', { timeZone: 'Europe/Oslo' });
};

function TilbudSkjema({ o, onFerdig }: { o: Opplast; onFerdig: (melding: string) => void }) {
  const { t, penger } = useSprak();
  const f = o.foresporsel;
  const [v, setV] = useState<TilbudInn>(
    o.tilbud ?? {
      prisPerKuvert: 0,
      meny: '',
      kostholdDekket: f.kosthold.length > 0,
      kostholdTekst: '',
      leveringInkludert: f.levering === 'levering',
      leveringPris: 0,
      oppsettOgRydding: f.servering === 'buffet_oppsett' || f.servering === 'servert_bordet',
      servise: '',
      gyldigTil: om14Dager(),
      betingelser: '',
      menyUrl: '',
      vedlegg: [],
    },
  );
  const [feil, setFeil] = useState<string>();
  const [sender, setSender] = useState(false);
  const sett = <K extends keyof TilbudInn>(k: K, verdi: TilbudInn[K]) => setV((x) => ({ ...x, [k]: verdi }));
  const mat = (Number(v.prisPerKuvert) || 0) * f.gjester;
  const frakt = v.leveringInkludert ? 0 : Number(v.leveringPris) || 0;
  const total = mat + frakt;
  const krTekst = (n: number) => penger(Math.round(n) * 100);

  const send = async () => {
    setSender(true);
    setFeil(undefined);
    const svar = await sendTilbud(f.id, v);
    setSender(false);
    if (svar.ok) onFerdig(svar.melding ?? t('Tilbudet er sendt.'));
    else setFeil(svar.feil);
  };

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        send();
      }}
      className="flex flex-col gap-5 bg-bg p-6 md:p-7"
    >
      <div className="flex flex-col gap-1 pr-10">
        <h2 className="k-heading m-0 text-[28px]">{o.tilbud ? t('Endre tilbudet') : t('Lag tilbud')}</h2>
        <p className="m-0 text-[15px] text-text-muted">
          {t('{hva} for {gjester} gjester', { hva: anledningNavn(f.anledning, t), gjester: f.gjester })} · {o.kontakt.navn}
        </p>
      </div>
      <div className="grid gap-5 min-[480px]:grid-cols-2">
        <Input
          id="tilbud-pris"
          label={t('Pris per kuvert inkl. mva (kr)')}
          inputMode="decimal"
          value={v.prisPerKuvert || ''}
          onChange={(e) => sett('prisPerKuvert', Number(e.target.value.replace(',', '.').replace(/[^\d.]/g, '')) || 0)}
          required
        />
        <Datovelger id="tilbud-gyldig" label={t('Tilbudet gjelder til')} min={new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Oslo' })} value={v.gyldigTil} onChange={(d) => sett('gyldigTil', d)} required />
      </div>
      <Textarea label={t('Meny')} hint={t('Hva som serveres, gjerne med retter og tilbehør.')} rows={4} maxLength={2000} value={v.meny} onChange={(e) => sett('meny', e.target.value)} required />
      <Input
        id="tilbud-meny-url"
        label={t('Lenke til menyen (valgfritt)')}
        type="url"
        inputMode="url"
        placeholder={t('https://firma.no/meny')}
        hint={t('Har dere menyen på nettsiden, kan kunden åpne den herfra.')}
        value={v.menyUrl}
        onChange={(e) => sett('menyUrl', e.target.value)}
      />
      <VedleggOpplaster foresporselId={f.id} vedlegg={v.vedlegg} onChange={(l) => sett('vedlegg', l)} />
      {f.kosthold.length > 0 && (
        <div className="flex flex-col gap-2">
          <label className="flex min-h-touch cursor-pointer items-center gap-3 text-base font-semibold">
            <input type="checkbox" checked={v.kostholdDekket} onChange={(e) => sett('kostholdDekket', e.target.checked)} className="h-6 w-6 shrink-0 accent-[var(--k-primary)]" />
            {t('Alle kostholdsbehov er dekket')}
          </label>
          <Input label={t('Kommentar om kosthold (valgfritt)')} value={v.kostholdTekst} maxLength={300} onChange={(e) => sett('kostholdTekst', e.target.value)} placeholder={t('Egen nøttefri dessert til én gjest')} />
        </div>
      )}
      <fieldset className="m-0 flex flex-col gap-2 border-0 p-0">
        <legend className="mb-2 text-[15px] font-semibold">{t('Levering')}</legend>
        <label className="flex min-h-touch cursor-pointer items-center gap-3 text-base">
          <input type="radio" name="levering" checked={v.leveringInkludert} onChange={() => sett('leveringInkludert', true)} className="h-6 w-6 shrink-0 accent-[var(--k-primary)]" />
          {t('Inkludert i prisen')}
        </label>
        <label className="flex min-h-touch cursor-pointer items-center gap-3 text-base">
          <input type="radio" name="levering" checked={!v.leveringInkludert} onChange={() => sett('leveringInkludert', false)} className="h-6 w-6 shrink-0 accent-[var(--k-primary)]" />
          {t('Kommer i tillegg')}
        </label>
        {!v.leveringInkludert && (
          <Input
            label={t('Leveringspris inkl. mva (kr)')}
            inputMode="decimal"
            value={v.leveringPris || ''}
            onChange={(e) => sett('leveringPris', Number(e.target.value.replace(',', '.').replace(/[^\d.]/g, '')) || 0)}
            className="min-[480px]:max-w-[240px]"
          />
        )}
      </fieldset>
      <div className="grid gap-5 min-[480px]:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="tilbud-servise" className="text-[15px] font-semibold">
            {t('Servise')}
          </label>
          <select id="tilbud-servise" value={v.servise} onChange={(e) => sett('servise', e.target.value)} className={feltKlasse()}>
            <option value="">{t('Ikke oppgitt')}</option>
            {/* Verdien lagres på norsk og oversettes der den vises. */}
            <option value="Porselen">{t('Porselen')}</option>
            <option value="Kompostérbart engangs">{t('Kompostérbart engangs')}</option>
            <option value="Ikke inkludert">{t('Ikke inkludert')}</option>
          </select>
        </div>
        <label className="flex min-h-touch cursor-pointer items-center gap-3 self-end text-base font-semibold">
          <input type="checkbox" checked={v.oppsettOgRydding} onChange={(e) => sett('oppsettOgRydding', e.target.checked)} className="h-6 w-6 shrink-0 accent-[var(--k-primary)]" />
          {t('Oppsett og rydding inkludert')}
        </label>
      </div>
      <Textarea label={t('Betingelser (valgfritt)')} hint={t('For eksempel avbestilling og betaling.')} rows={2} maxLength={1000} value={v.betingelser} onChange={(e) => sett('betingelser', e.target.value)} />
      <div className="sticky bottom-0 z-10 -mx-6 -mb-6 flex flex-col gap-3 border-t border-border bg-bg px-6 pb-6 pt-4 md:-mx-7 md:-mb-7 md:px-7 md:pb-7">
        <section aria-labelledby="tilbud-sum" className="flex flex-col gap-1 rounded-alert bg-surface-soft px-4 py-3">
          <h3 id="tilbud-sum" className="sr-only">
            {t('Totalpris')}
          </h3>
          <div className="flex justify-between gap-3 text-[15px] text-text-muted">
            <span>
              {t('{n} kuverter × {pris}', { n: f.gjester, pris: krTekst(Number(v.prisPerKuvert) || 0) })}
            </span>
            <span className="k-num">{krTekst(mat)}</span>
          </div>
          <div className="flex justify-between gap-3 text-[15px] text-text-muted">
            <span>{t('Levering')}</span>
            <span className="k-num">{v.leveringInkludert ? t('Inkludert') : krTekst(frakt)}</span>
          </div>
          <div className="mt-1 flex items-baseline justify-between gap-3 border-t border-border pt-2">
            <strong className="text-base">{t('Totalt for kunden inkl. mva')}</strong>
            <strong className="k-heading k-num text-[26px] leading-none" aria-live="polite">
              {krTekst(total)}
            </strong>
          </div>
        </section>
        {feil && <Alert tone="feil">{feil}</Alert>}
        <Button type="submit" size="lg" busy={sender} disabled={sender}>
          {o.tilbud ? t('Oppdater tilbudet') : total > 0 ? t('Send tilbud på {belop}', { belop: krTekst(total) }) : t('Send tilbudet')}
        </Button>
      </div>
    </form>
  );
}
