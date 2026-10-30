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
import { kr } from '@/lib/format';
import { KLIPPAKKER, MVA_SATS, prisPerKlipp } from '@/lib/klipp';
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

function svarfristTekst(iso: string | null) {
  if (!iso) return undefined;
  const d = dagerTil(iso);
  if (d < 0) return 'Svarfristen har gått ut';
  if (d === 0) return 'Svar i dag';
  if (d === 1) return 'Svar innen i morgen';
  return `Svar innen ${d} dager`;
}

export function Oversikt({ firma, dekning, saldo, nye, opplaste }: { firma: string; dekning: string; saldo: number; nye: (Foresporsel & { andreOpplast: number })[]; opplaste: Opplast[] }) {
  const router = useRouter();
  const q = useSearchParams();
  const [fane, setFane] = useState(q.get('samtale') || (nye.length === 0 && opplaste.length > 0) ? 'opplaste' : 'nye');
  const [skjult, setSkjult] = useState<string[]>([]);
  const [status, setStatus] = useState<{ tone: 'status' | 'feil'; tekst: string } | undefined>(
    q.get('kjop') === 'ok' ? { tone: 'status', tekst: 'Takk for kjøpet! Klippene legges til så snart betalingen er bekreftet. Last siden på nytt om et øyeblikk.' } : undefined,
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
      setStatus({ tone: 'status', tekst: `${anledningNavn(f.anledning)} for ${f.gjester} er låst opp. ${f.klippPris} klipp er trukket. Du finner den under «Opplåste».` });
      setFane('opplaste');
      router.refresh();
    } else setStatus({ tone: 'feil', tekst: svar.feil });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-dvh">
      <header className="bg-panel text-panel-on">
        <div className="k-wrap flex flex-wrap items-center justify-between gap-3 py-3.5">
          <Link href="/" className="flex items-center gap-2 text-panel-on no-underline hover:text-panel-on">
            <Symbol size={26} />
            <span className="k-heading text-[26px] leading-none tracking-[-0.035em]">kuverto</span>
            <span className="sr-only">, til forsiden</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/leverandor/profil" className="inline-flex min-h-touch items-center px-2 text-[15px] font-semibold text-panel-on-muted no-underline hover:text-panel-on">
              Profil og område
            </Link>
            <form action="/logg-ut" method="post">
              <button type="submit" className="min-h-touch px-2 text-[15px] font-semibold text-panel-on-muted hover:text-panel-on">
                Logg ut
              </button>
            </form>
          </div>
        </div>
        <div className="k-wrap flex flex-wrap items-end justify-between gap-5 pb-8 pt-4">
          <div className="flex flex-col gap-1.5">
            <h1 className="k-heading m-0 text-[34px] leading-none md:text-[48px]">{firma}</h1>
            <p className="m-0 text-[15px] text-panel-on-muted">
              Leverer til {dekning} ·{' '}
              <Link href="/leverandor/profil" className="text-panel-on">
                endre
              </Link>
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end">
              <span className="k-heading k-num text-[34px] leading-none">{saldo}</span>
              <span className="text-small text-panel-on-muted">klipp igjen</span>
            </div>
            <Button variant="accent" onClick={() => setKjopApen(true)}>
              Kjøp klipp
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
          label="Forespørsler"
          aktiv={fane}
          onVelg={setFane}
          faner={[
            { id: 'nye', navn: `Nye i området (${synlige.length})` },
            { id: 'opplaste', navn: `Opplåste (${opplaste.length})` },
          ]}
        />

        {fane === 'nye' && (
          <div role="tabpanel" id="nye-panel" aria-labelledby="nye-fane" className="grid gap-5 lg:grid-cols-2">
            {synlige.length === 0 ? (
              <div className="lg:col-span-2">
                <EmptyState illustrasjon="/illustrasjoner/tom-tallerken.svg" tittel="Ingen nye forespørsler akkurat nå">
                  Du får e-post når det kommer nye forespørsler i området ditt.
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
                    {f.andreOpplast === 0 ? 'Ingen har låst opp ennå.' : `${f.andreOpplast} av ${f.maksLeverandorer} plasser er tatt.`}
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
                <EmptyState illustrasjon="/illustrasjoner/bordkort.svg" tittel="Ingen opplåste ennå">
                  Når du låser opp en forespørsel, ser du kundens kontaktinfo her og kan sende tilbud.
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
                    svarfrist={o.tilbud ? undefined : svarfristTekst(o.svarfrist)}
                    lagTilbudTekst={o.tilbud ? 'Endre tilbudet' : 'Lag tilbud'}
                    onLagTilbud={kanEndre ? () => setTilbudFor(o) : undefined}
                    onSendMelding={() => setMeldingFor(o)}
                    meldingTekst={o.uleste ? `Meldinger (${o.uleste} nye)` : o.meldinger ? `Meldinger (${o.meldinger})` : 'Send melding'}
                    tilbudStatus={
                      o.tilbud ? (
                        <p className="m-0 rounded-alert bg-surface-soft px-4 py-3 text-[15px]">
                          <strong>Tilbud: {statusNavn[o.tilbud.status] ?? o.tilbud.status}</strong> · kr {o.tilbud.prisPerKuvert} per kuvert
                          {o.tilbud.status === 'godtatt' && ' · Ta kontakt med kunden for å avtale detaljene.'}
                        </p>
                      ) : o.foresporselStatus !== 'aktiv' ? (
                        <p className="m-0 rounded-alert bg-surface-soft px-4 py-3 text-[15px]">Kunden har valgt et annet tilbud, eller forespørselen er lukket.</p>
                      ) : undefined
                    }
                  />
                );
              })
            )}
          </div>
        )}

        <div className="pt-4">
          <ThemeToggle />
        </div>
      </main>

      <Dialog apen={kjopApen} onLukk={() => setKjopApen(false)} label="Kjøp klipp">
        <KjopKlipp />
      </Dialog>
      <Dialog apen={!!tilbudFor} onLukk={() => setTilbudFor(undefined)} label="Tilbud" className="max-w-[640px]">
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
          if (q.get('samtale')) router.replace('/leverandor', { scroll: false });
          router.refresh();
        }}
        label="Samtale med kunden"
        className="max-w-[640px]"
      >
        {meldingFor && (
          <div className="flex flex-col gap-1 bg-bg p-6 md:p-7">
            <Samtale foresporselId={meldingFor.foresporsel.id} tittel={`Samtale med ${meldingFor.kontakt.navn}`} />
            <p className="m-0 text-small text-text-muted">
              {anledningNavn(meldingFor.foresporsel.anledning)} for {meldingFor.foresporsel.gjester} gjester. Kunden får e-post når du skriver, og svarer her på Kuverto.
            </p>
          </div>
        )}
      </Dialog>
    </div>
  );
}

function KjopKlipp() {
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
      <h2 className="k-heading m-0 pr-10 text-[28px]">Kjøp klipp</h2>
      <p className="m-0 text-[15px] text-text-muted">Du betaler med kort hos Stripe. Kvittering og faktura kommer på e-post. Prisene er eks. mva.</p>
      <ul className="m-0 flex list-none flex-col gap-2 p-0">
        {KLIPPAKKER.map((p) => (
          <li key={p.id} className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-border bg-surface p-4">
            <div className="flex flex-col">
              <strong className="text-[17px]">
                {p.navn} · {p.klipp} klipp
              </strong>
              <span className="text-[15px] text-text-muted">
                {kr(p.prisEksMva)} + mva ({kr(p.prisEksMva * (1 + MVA_SATS))}) · {kr(prisPerKlipp(p))} per klipp
              </span>
            </div>
            <Button size="sm" busy={opptatt === p.id} disabled={!!opptatt} onClick={() => kjop(p.id)}>
              Velg<span className="sr-only"> {p.navn}</span>
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
  const krTekst = (n: number) => `kr ${Math.round(n).toLocaleString('nb-NO')}`;

  const send = async () => {
    setSender(true);
    setFeil(undefined);
    const svar = await sendTilbud(f.id, v);
    setSender(false);
    if (svar.ok) onFerdig(svar.melding ?? 'Tilbudet er sendt.');
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
        <h2 className="k-heading m-0 text-[28px]">{o.tilbud ? 'Endre tilbudet' : 'Lag tilbud'}</h2>
        <p className="m-0 text-[15px] text-text-muted">
          {anledningNavn(f.anledning)} for {f.gjester} gjester · {o.kontakt.navn}
        </p>
      </div>
      <div className="grid gap-5 min-[480px]:grid-cols-2">
        <Input
          id="tilbud-pris"
          label="Pris per kuvert inkl. mva (kr)"
          inputMode="decimal"
          value={v.prisPerKuvert || ''}
          onChange={(e) => sett('prisPerKuvert', Number(e.target.value.replace(',', '.').replace(/[^\d.]/g, '')) || 0)}
          required
        />
        <Datovelger id="tilbud-gyldig" label="Tilbudet gjelder til" min={new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Oslo' })} value={v.gyldigTil} onChange={(d) => sett('gyldigTil', d)} required />
      </div>
      <Textarea label="Meny" hint="Hva som serveres, gjerne med retter og tilbehør." rows={4} maxLength={2000} value={v.meny} onChange={(e) => sett('meny', e.target.value)} required />
      <Input
        id="tilbud-meny-url"
        label="Lenke til menyen (valgfritt)"
        type="url"
        inputMode="url"
        placeholder="https://firma.no/meny"
        hint="Har dere menyen på nettsiden, kan kunden åpne den herfra."
        value={v.menyUrl}
        onChange={(e) => sett('menyUrl', e.target.value)}
      />
      <VedleggOpplaster foresporselId={f.id} vedlegg={v.vedlegg} onChange={(l) => sett('vedlegg', l)} />
      {f.kosthold.length > 0 && (
        <div className="flex flex-col gap-2">
          <label className="flex min-h-touch cursor-pointer items-center gap-3 text-base font-semibold">
            <input type="checkbox" checked={v.kostholdDekket} onChange={(e) => sett('kostholdDekket', e.target.checked)} className="h-6 w-6 shrink-0 accent-[var(--k-primary)]" />
            Alle kostholdsbehov er dekket
          </label>
          <Input label="Kommentar om kosthold (valgfritt)" value={v.kostholdTekst} maxLength={300} onChange={(e) => sett('kostholdTekst', e.target.value)} placeholder="Egen nøttefri dessert til én gjest" />
        </div>
      )}
      <fieldset className="m-0 flex flex-col gap-2 border-0 p-0">
        <legend className="mb-2 text-[15px] font-semibold">Levering</legend>
        <label className="flex min-h-touch cursor-pointer items-center gap-3 text-base">
          <input type="radio" name="levering" checked={v.leveringInkludert} onChange={() => sett('leveringInkludert', true)} className="h-6 w-6 shrink-0 accent-[var(--k-primary)]" />
          Inkludert i prisen
        </label>
        <label className="flex min-h-touch cursor-pointer items-center gap-3 text-base">
          <input type="radio" name="levering" checked={!v.leveringInkludert} onChange={() => sett('leveringInkludert', false)} className="h-6 w-6 shrink-0 accent-[var(--k-primary)]" />
          Kommer i tillegg
        </label>
        {!v.leveringInkludert && (
          <Input
            label="Leveringspris inkl. mva (kr)"
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
            Servise
          </label>
          <select id="tilbud-servise" value={v.servise} onChange={(e) => sett('servise', e.target.value)} className={feltKlasse()}>
            <option value="">Ikke oppgitt</option>
            <option>Porselen</option>
            <option>Kompostérbart engangs</option>
            <option>Ikke inkludert</option>
          </select>
        </div>
        <label className="flex min-h-touch cursor-pointer items-center gap-3 self-end text-base font-semibold">
          <input type="checkbox" checked={v.oppsettOgRydding} onChange={(e) => sett('oppsettOgRydding', e.target.checked)} className="h-6 w-6 shrink-0 accent-[var(--k-primary)]" />
          Oppsett og rydding inkludert
        </label>
      </div>
      <Textarea label="Betingelser (valgfritt)" hint="For eksempel avbestilling og betaling." rows={2} maxLength={1000} value={v.betingelser} onChange={(e) => sett('betingelser', e.target.value)} />
      <div className="sticky bottom-0 z-10 -mx-6 -mb-6 flex flex-col gap-3 border-t border-border bg-bg px-6 pb-6 pt-4 md:-mx-7 md:-mb-7 md:px-7 md:pb-7">
        <section aria-labelledby="tilbud-sum" className="flex flex-col gap-1 rounded-alert bg-surface-soft px-4 py-3">
          <h3 id="tilbud-sum" className="sr-only">
            Totalpris
          </h3>
          <div className="flex justify-between gap-3 text-[15px] text-text-muted">
            <span>
              {f.gjester} kuverter × {krTekst(Number(v.prisPerKuvert) || 0)}
            </span>
            <span className="k-num">{krTekst(mat)}</span>
          </div>
          <div className="flex justify-between gap-3 text-[15px] text-text-muted">
            <span>Levering</span>
            <span className="k-num">{v.leveringInkludert ? 'Inkludert' : krTekst(frakt)}</span>
          </div>
          <div className="mt-1 flex items-baseline justify-between gap-3 border-t border-border pt-2">
            <strong className="text-base">Totalt for kunden inkl. mva</strong>
            <strong className="k-heading k-num text-[26px] leading-none" aria-live="polite">
              {krTekst(total)}
            </strong>
          </div>
        </section>
        {feil && <Alert tone="feil">{feil}</Alert>}
        <Button type="submit" size="lg" busy={sender} disabled={sender}>
          {o.tilbud ? 'Oppdater tilbudet' : total > 0 ? `Send tilbud på ${krTekst(total)}` : 'Send tilbudet'}
        </Button>
      </div>
    </form>
  );
}
