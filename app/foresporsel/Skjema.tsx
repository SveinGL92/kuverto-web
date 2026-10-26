'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Button, ButtonLink } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { Input, Textarea, feltKlasse } from '@/components/ui/Input';
import { Progress } from '@/components/ui/Progress';
import { cn } from '@/lib/cn';
import { datoKort, stor } from '@/lib/format';
import { anledninger, budsjetter, budsjettNavn, kostholdstyper, leveringer, serveringer } from '@/lib/labels';
import { gyldigPostnummer, poststed, rensPostnummer } from '@/lib/postnummer';
import type { Anledning, Budsjett, Kostholdstype, Levering, Servering } from '@/lib/types';

const titler = [
  'Hva skal du arrangere?',
  'Hvor mange kuverter?',
  'Når skal maten serveres?',
  'Hvor skal maten serveres?',
  'Hvordan vil du servere?',
  'Allergier og kosthold',
  'Budsjett og kontakt',
];
const hint = [
  'Velg det som ligner mest.',
  'Et omtrentlig antall holder.',
  'Vi viser forespørselen til leverandører som er ledige.',
  'Vi finner leverandører i nærheten.',
  'Leverandørene kan foreslå alternativer.',
  'Velg alt som gjelder, og skriv antall under.',
  'Siste steg. Du forplikter deg ikke til noe.',
];
const varigheter = ['Under 1 time', '1–2 timer', '2–3 timer', '3–4 timer', 'Hele dagen'];

interface Utkast {
  anledning: Anledning;
  gjester: number;
  dato: string;
  klokkeslett: string;
  varighet: string;
  fleksibel: boolean;
  postnummer: string;
  levering: Levering;
  servering: Servering;
  kosthold: Kostholdstype[];
  kostholdNotat: string;
  budsjett: Budsjett;
  navn: string;
  epost: string;
}

type Feil = Partial<Record<'gjester' | 'dato' | 'klokkeslett' | 'postnummer' | 'navn' | 'epost', string>>;

const LAGER = 'kuverto-utkast';
/** Dagens dato i lokal tid (ikke UTC), som YYYY-MM-DD. */
const iDag = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
const epostOk = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());

function startverdi(q: URLSearchParams): Utkast {
  const a = q.get('anledning');
  const g = Number(q.get('gjester'));
  const p = rensPostnummer(q.get('postnummer') ?? '');
  return {
    anledning: anledninger.some((x) => x.id === a) ? (a as Anledning) : 'firmalunsj',
    gjester: g > 0 && g < 10000 ? g : 25,
    dato: '',
    klokkeslett: '11:30',
    varighet: '1–2 timer',
    fleksibel: false,
    postnummer: p,
    levering: 'levering',
    servering: 'levert_ferdig',
    kosthold: [],
    kostholdNotat: '',
    budsjett: '250_400',
    navn: '',
    epost: '',
  };
}

export function Skjema() {
  const q = useSearchParams();
  const router = useRouter();
  const [steg, setSteg] = useState(1);
  const [u, setU] = useState<Utkast>(() => startverdi(new URLSearchParams(q.toString())));
  const [feil, setFeil] = useState<Feil>({});
  const [lastet, setLastet] = useState(false);
  const tittel = useRef<HTMLHeadingElement>(null);
  const forsteGang = useRef(true);

  // Hent lagret utkast fra denne fanen, men la verdier fra forsiden vinne.
  useEffect(() => {
    try {
      const lagret = sessionStorage.getItem(LAGER);
      if (lagret && !q.get('anledning')) {
        const data = JSON.parse(lagret) as { u: Utkast; steg: number };
        // eslint-disable-next-line react-hooks/set-state-in-effect -- engangs gjenoppretting fra sessionStorage
        setU((v) => ({ ...v, ...data.u }));
        setSteg(Math.min(7, Math.max(1, data.steg)));
      }
    } catch {}
    setLastet(true);
  }, [q]);

  useEffect(() => {
    if (!lastet) return;
    try {
      if (steg <= 7) sessionStorage.setItem(LAGER, JSON.stringify({ u, steg }));
      else sessionStorage.removeItem(LAGER);
    } catch {}
  }, [u, steg, lastet]);

  // Flytt fokus til overskriften ved nytt steg, så skjermlesere får med seg skiftet.
  useEffect(() => {
    if (forsteGang.current) {
      forsteGang.current = false;
      return;
    }
    tittel.current?.focus();
  }, [steg]);

  const sett = <K extends keyof Utkast>(k: K, v: Utkast[K]) => {
    setU((x) => ({ ...x, [k]: v }));
    if (k in feil) setFeil((f) => ({ ...f, [k]: undefined }));
  };

  const valider = (): Feil => {
    const f: Feil = {};
    if (steg === 2 && u.gjester < 1) f.gjester = 'Skriv antall gjester, minst 1.';
    if (steg === 3) {
      if (!u.dato) f.dato = 'Velg en dato.';
      else if (u.dato < iDag()) f.dato = 'Datoen har passert. Velg en dato fra i dag og fremover.';
      if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(u.klokkeslett)) f.klokkeslett = 'Skriv klokkeslett som tt:mm, for eksempel 11:30.';
    }
    if (steg === 4 && !gyldigPostnummer(u.postnummer))
      f.postnummer = u.postnummer.length === 4 ? 'Vi finner ikke dette postnummeret.' : 'Skriv postnummeret med fire siffer, for eksempel 0150.';
    if (steg === 7) {
      if (!u.navn.trim()) f.navn = 'Skriv navnet ditt.';
      if (!epostOk(u.epost)) f.epost = u.epost.includes('@') ? 'Mangler domene, f.eks. @firma.no' : 'Skriv e-postadressen din, f.eks. kari@firma.no';
    }
    return f;
  };

  const neste = () => {
    const f = valider();
    setFeil(f);
    const forste = Object.keys(f)[0];
    if (forste) {
      document.getElementById(`felt-${forste}`)?.focus();
      return;
    }
    setSteg((s) => Math.min(8, s + 1));
  };
  const tilbake = () => (steg === 1 ? router.push('/') : setSteg((s) => Math.max(1, s - 1)));

  const sted = poststed(u.postnummer);
  const postOk = gyldigPostnummer(u.postnummer);

  if (steg === 8) {
    return (
      <main id="innhold" className="flex min-h-dvh flex-col">
        <div className="bg-panel px-6 pb-8 pt-14 text-panel-on">
          <div className="mx-auto flex max-w-[640px] flex-col gap-4">
            <h1 ref={tittel} tabIndex={-1} className="k-heading m-0 text-[38px] leading-[1.02] outline-none md:text-h1">
              Forespørselen er sendt
            </h1>
            <p className="m-0 text-[17px] leading-[1.55] text-panel-on-muted">
              Godkjente leverandører {sted ? `i ${sted}` : 'i nærheten'} får beskjed nå. Du får en e-post hver gang et tilbud kommer inn.
            </p>
          </div>
        </div>
        <div className="mx-auto flex w-full max-w-[640px] flex-grow flex-col gap-5 p-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/illustrasjoner/understrek.svg" alt="" className="k-ink w-full" />
          <div className="flex flex-col gap-1 border-y border-border py-4">
            <strong className="text-[17px]">
              {anledninger.find((a) => a.id === u.anledning)?.navn} · {u.gjester} kuverter
            </strong>
            <span className="text-[15px] text-text-muted">
              {u.dato ? stor(datoKort(u.dato)) : 'Fleksibel dato'} · {[u.postnummer, sted].filter(Boolean).join(' ')} · {budsjettNavn(u.budsjett)}
            </span>
          </div>
          <div className="mt-auto flex flex-col gap-2">
            <ButtonLink href="/foresporsler/f-firmalunsj" size="lg">
              Se forespørselen
            </ButtonLink>
            <ButtonLink href="/" variant="text">
              Til forsiden
            </ButtonLink>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main id="innhold" className="flex min-h-dvh flex-col">
      <div className="mx-auto flex w-full max-w-[640px] flex-grow flex-col">
        <div className="flex shrink-0 items-center justify-between px-2 pt-2">
          <button type="button" aria-label={steg === 1 ? 'Tilbake til forsiden' : 'Forrige steg'} onClick={tilbake} className="flex h-11 w-11 items-center justify-center rounded-pill">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M15 5l-7 7 7 7" />
            </svg>
          </button>
          <span className="text-[15px] font-semibold" aria-hidden="true">
            Steg {steg} av 7
          </span>
          <Link href="/" aria-label="Lukk skjemaet. Det du har fylt ut, blir lagret." className="flex h-11 w-11 items-center justify-center rounded-pill text-text">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </Link>
        </div>
        <div className="shrink-0 px-4 pt-1.5 [&>div]:justify-between [&_svg]:h-[34px] [&_svg]:w-[34px]">
          <Progress steg={steg} navn={titler[steg - 1]} />
        </div>

        <form
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            neste();
          }}
          className="flex flex-grow flex-col"
          aria-labelledby="skjema-tittel"
        >
          <div className="flex flex-grow flex-col gap-5 px-4 py-6">
            <div className="flex flex-col gap-2">
              <h1 id="skjema-tittel" ref={tittel} tabIndex={-1} className="k-heading m-0 text-h1 leading-[1.02] outline-none">
                {titler[steg - 1]}
              </h1>
              <p className="m-0 text-base text-text-muted">{hint[steg - 1]}</p>
            </div>

            {steg === 1 && (
              <div role="group" aria-label="Anledning" className="grid grid-cols-2 gap-2">
                {anledninger.map((a) => {
                  const valgt = u.anledning === a.id;
                  return (
                    <button
                      key={a.id}
                      type="button"
                      aria-pressed={valgt}
                      onClick={() => sett('anledning', a.id)}
                      className={cn(
                        'flex min-h-[104px] flex-col justify-between gap-1.5 rounded-pill px-6 py-3 text-left text-base font-bold transition-colors duration-200',
                        valgt ? 'border-2 border-primary bg-surface-soft' : 'border-[1.5px] border-border-input bg-surface hover:border-primary',
                      )}
                    >
                      {a.illustrasjon ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={a.illustrasjon} alt="" className="k-ink h-12 w-auto self-start" />
                      ) : (
                        <span className="h-12" />
                      )}
                      <span>{a.navn}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {steg === 2 && (
              <div className="flex flex-col gap-5">
                <div className="flex items-center justify-between rounded-alert bg-panel p-5 text-panel-on">
                  <button
                    type="button"
                    aria-label="Færre gjester"
                    onClick={() => sett('gjester', Math.max(1, u.gjester - 1))}
                    className="flex h-[52px] w-[52px] items-center justify-center rounded-pill border-2 border-panel-on"
                  >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
                      <path d="M5 12h14" />
                    </svg>
                  </button>
                  <label className="flex flex-col items-center">
                    <span className="sr-only">Antall gjester</span>
                    <input
                      id="felt-gjester"
                      aria-invalid={feil.gjester ? true : undefined}
                      aria-describedby={feil.gjester ? 'felt-gjester-feil' : undefined}
                      inputMode="numeric"
                      value={u.gjester}
                      onChange={(e) => sett('gjester', Math.min(9999, Number(e.target.value.replace(/\D/g, '')) || 0))}
                      onBlur={() => u.gjester < 1 && sett('gjester', 1)}
                      className="k-heading k-num w-[4ch] bg-transparent text-center text-[56px] leading-none tracking-[-0.04em] text-panel-on outline-none focus-visible:rounded-input focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-accent"
                    />
                    <span className="text-[15px] font-semibold text-panel-on-muted" aria-hidden="true">
                      kuverter
                    </span>
                  </label>
                  <button
                    type="button"
                    aria-label="Flere gjester"
                    onClick={() => sett('gjester', Math.min(9999, u.gjester + 1))}
                    className="flex h-[52px] w-[52px] items-center justify-center rounded-pill bg-accent text-accent-on"
                  >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
                      <path d="M5 12h14M12 5v14" />
                    </svg>
                  </button>
                </div>
                {feil.gjester && (
                  <p id="felt-gjester-feil" className="-mt-3 mb-0 text-small font-semibold text-error">
                    {feil.gjester}
                  </p>
                )}
                <div className="flex flex-wrap gap-2">
                  {[10, 25, 50, 100].map((n) => (
                    <Chip key={n} pressed={u.gjester === n} onClick={() => sett('gjester', n)}>
                      {n} gjester
                    </Chip>
                  ))}
                </div>
              </div>
            )}

            {steg === 3 && (
              <div className="flex flex-col gap-4">
                <Input id="felt-dato" label="Dato" type="date" min={iDag()} value={u.dato} onChange={(e) => sett('dato', e.target.value)} feil={feil.dato} required />
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    id="felt-klokkeslett"
                    label="Serveres kl."
                    type="time"
                    step={300}
                    value={u.klokkeslett}
                    onChange={(e) => sett('klokkeslett', e.target.value)}
                    feil={feil.klokkeslett}
                  />
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="felt-varighet" className="text-[15px] font-semibold">
                      Varighet
                    </label>
                    <select id="felt-varighet" value={u.varighet} onChange={(e) => sett('varighet', e.target.value)} className={feltKlasse()}>
                      {varigheter.map((v) => (
                        <option key={v}>{v}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <label className="flex min-h-touch cursor-pointer items-center gap-3 text-base font-semibold">
                  <input type="checkbox" checked={u.fleksibel} onChange={(e) => sett('fleksibel', e.target.checked)} className="h-[22px] w-[22px] accent-[var(--k-primary)]" />
                  Datoen er fleksibel
                </label>
              </div>
            )}

            {steg === 4 && (
              <div className="flex flex-col gap-4">
                <Input
                  id="felt-postnummer"
                  label="Postnummer"
                  inputMode="numeric"
                  autoComplete="postal-code"
                  maxLength={4}
                  value={u.postnummer}
                  onChange={(e) => sett('postnummer', rensPostnummer(e.target.value))}
                  hint={postOk ? (sted ?? `Postnummer ${u.postnummer}`) : undefined}
                  feil={feil.postnummer}
                  required
                />
                <fieldset className="m-0 flex flex-col gap-2 border-0 p-0">
                  <legend className="mb-2 text-[15px] font-semibold">Hvordan skal maten komme frem?</legend>
                  {leveringer.map((l) => (
                    <Chip key={l.id} tone="soft" pressed={u.levering === l.id} onClick={() => sett('levering', l.id)} className="min-h-14 px-3.5 text-base">
                      {l.navn}
                    </Chip>
                  ))}
                </fieldset>
                <div className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/illustrasjoner/kart.svg" alt="" className="k-ink w-[92px] shrink-0" />
                  <p className="m-0 text-[15px] text-text-muted">Leverandørene ser bare området. Full adresse deles når du velger et tilbud.</p>
                </div>
              </div>
            )}

            {steg === 5 && (
              <div role="group" aria-label="Servering" className="flex flex-col gap-2">
                {serveringer.map((s) => {
                  const valgt = u.servering === s.id;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      aria-pressed={valgt}
                      onClick={() => sett('servering', s.id)}
                      className={cn(
                        'flex min-h-16 flex-col gap-0.5 rounded-pill px-6 py-3 text-left transition-colors duration-200',
                        valgt ? 'border-2 border-primary bg-surface-soft' : 'border-[1.5px] border-border-input bg-surface hover:border-primary',
                      )}
                    >
                      <span className="text-base font-bold">{s.navn}</span>
                      <span className="text-small font-medium text-text-muted">{s.beskrivelse}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {steg === 6 && (
              <div className="flex flex-col gap-4">
                <div role="group" aria-label="Kosthold" className="flex flex-wrap gap-2">
                  {kostholdstyper.map((k) => {
                    const valgt = u.kosthold.includes(k.id);
                    return (
                      <Chip
                        key={k.id}
                        pressed={valgt}
                        onClick={() => sett('kosthold', valgt ? u.kosthold.filter((x) => x !== k.id) : [...u.kosthold, k.id])}
                        className="font-bold"
                      >
                        {k.navn}
                      </Chip>
                    );
                  })}
                </div>
                <Textarea
                  label="Hvor mange, og hvor alvorlig?"
                  placeholder="4 vegetarianere. 1 med alvorlig nøtteallergi."
                  value={u.kostholdNotat}
                  onChange={(e) => sett('kostholdNotat', e.target.value)}
                  rows={4}
                  className="[&_textarea]:resize-none"
                />
              </div>
            )}

            {steg === 7 && (
              <div className="flex flex-col gap-4">
                <fieldset className="m-0 flex flex-col gap-2 border-0 p-0">
                  <legend className="mb-2 text-[15px] font-semibold">Budsjett per kuvert</legend>
                  <div className="flex flex-wrap gap-2">
                    {budsjetter.map((b) => (
                      <Chip key={b.id} pressed={u.budsjett === b.id} onClick={() => sett('budsjett', b.id)} className="px-3.5 font-bold">
                        {b.navn}
                      </Chip>
                    ))}
                  </div>
                </fieldset>
                <Input id="felt-navn" label="Navn" autoComplete="name" value={u.navn} onChange={(e) => sett('navn', e.target.value)} feil={feil.navn} required />
                <Input
                  id="felt-epost"
                  label="E-post"
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  value={u.epost}
                  onChange={(e) => sett('epost', e.target.value)}
                  feil={feil.epost}
                  required
                />
                <p className="m-0 text-[15px] text-text-muted">Kontaktinfo deles bare med leverandøren du velger.</p>
              </div>
            )}
          </div>

          <div className="sticky bottom-0 flex shrink-0 gap-2 border-t border-border bg-bg px-4 pb-6 pt-3">
            {steg > 1 && (
              <Button variant="secondary" onClick={tilbake} className="min-h-14 px-5">
                Tilbake
              </Button>
            )}
            <Button type="submit" className="min-h-14 flex-grow text-[17px]">
              {steg === 7 ? 'Send forespørsel' : 'Neste'}
            </Button>
          </div>
        </form>
      </div>
    </main>
  );
}
