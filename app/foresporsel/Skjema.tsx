'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Button, ButtonLink } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { Input, Textarea, feltKlasse } from '@/components/ui/Input';
import { Progress } from '@/components/ui/Progress';
import { cn } from '@/lib/cn';
import { datoKort, stor } from '@/lib/format';
import { MAKS_LEVERANDORER } from '@/lib/klipp';
import { anledninger, anledningNavn, budsjetter, budsjettNavn, kostholdNavn, kostholdstyper, leveringer, serveringNavn, serveringer } from '@/lib/labels';
import { gyldigPostnummer, poststed, rensPostnummer } from '@/lib/postnummer';
import type { Anledning, Budsjett, Kostholdstype, Levering, Servering } from '@/lib/types';

const ANTALL_STEG = 4;
const titler = ['Om arrangementet', 'Maten du ønsker', 'Kontaktinformasjon', 'Se over og send'];
const hint = [
  'Hva, når, hvor mange og hvor. Et omtrentlig antall gjester holder.',
  'Alt her kan leverandørene foreslå alternativer til.',
  'Du trenger ikke lage konto. Vi sender lenke til tilbudene på e-post.',
  'Sjekk at alt stemmer. Du kan endre hver del.',
];
const varigheter = ['Under 1 time', '1–2 timer', '2–3 timer', '3–4 timer', 'Hele dagen'];

interface KostholdValg {
  antall: number;
  alvorlig: boolean;
}

interface Utkast {
  anledning: Anledning;
  gjester: number;
  dato: string;
  klokkeslett: string;
  fleksibel: boolean;
  postnummer: string;
  levering: Levering;
  servering: Servering;
  varighet: string;
  budsjett: Budsjett;
  kosthold: Partial<Record<Kostholdstype, KostholdValg>>;
  melding: string;
  navn: string;
  epost: string;
  telefon: string;
  firma: string;
}

type Felt = 'gjester' | 'dato' | 'klokkeslett' | 'postnummer' | 'navn' | 'epost' | 'telefon';
type Feil = Partial<Record<Felt, string>>;

/** Kontaktopplysninger lagres ikke i utkastet (dataminimering). */
const KONTAKTFELT = ['navn', 'epost', 'telefon', 'firma'] as const;
const LAGER = 'kuverto-utkast-v2';

/** Dagens dato i lokal tid (ikke UTC), som YYYY-MM-DD. */
const iDag = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
const epostOk = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());
const telefonOk = (v: string) => {
  const sifre = v.replace(/\D/g, '');
  return sifre.length >= 8 && sifre.length <= 15;
};

function startverdi(q: URLSearchParams): Utkast {
  const a = q.get('anledning');
  const g = Number(q.get('gjester'));
  const p = rensPostnummer(q.get('postnummer') ?? '');
  return {
    anledning: anledninger.some((x) => x.id === a) ? (a as Anledning) : 'firmalunsj',
    gjester: g > 0 && g < 10000 ? g : 25,
    dato: '',
    klokkeslett: '11:30',
    fleksibel: false,
    postnummer: p,
    levering: 'levering',
    servering: 'levert_ferdig',
    varighet: '1–2 timer',
    budsjett: '250_400',
    kosthold: {},
    melding: '',
    navn: '',
    epost: '',
    telefon: '',
    firma: '',
  };
}

const Hake = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--k-success)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="mt-1 shrink-0">
    <path d="M5 12l5 5 9-10" />
  </svg>
);

function Valgknapp({ valgt, onClick, children, className }: { valgt: boolean; onClick: () => void; children: ReactNode; className?: string }) {
  return (
    <button
      type="button"
      aria-pressed={valgt}
      onClick={onClick}
      className={cn(
        'flex min-h-touch items-center gap-2.5 rounded-pill px-4 py-2 text-left text-[15px] transition-colors duration-200',
        valgt ? 'border-2 border-primary bg-surface-soft font-bold' : 'border-[1.5px] border-border-input bg-surface font-semibold hover:border-primary',
        className,
      )}
    >
      {children}
    </button>
  );
}

function Gruppe({ legend, children, hjelp, className }: { legend: string; children: ReactNode; hjelp?: string; className?: string }) {
  return (
    <fieldset className={cn('m-0 flex min-w-0 flex-col gap-2.5 border-0 p-0', className)}>
      <legend className="mb-2.5 p-0 text-[15px] font-semibold">
        {legend}
        {hjelp && <span className="mt-0.5 block text-small font-medium text-text-muted">{hjelp}</span>}
      </legend>
      {children}
    </fieldset>
  );
}

export function Skjema() {
  const q = useSearchParams();
  const router = useRouter();
  const [steg, setSteg] = useState(1);
  const [u, setU] = useState<Utkast>(() => startverdi(new URLSearchParams(q.toString())));
  const [feil, setFeil] = useState<Feil>({});
  const [lastet, setLastet] = useState(false);
  /** Satt når kunden har trykket «Endre» i oversikten, så «Neste» går rett tilbake dit. */
  const [fraOversikt, setFraOversikt] = useState(false);
  const tittel = useRef<HTMLHeadingElement>(null);
  const forsteGang = useRef(true);

  // Hent lagret utkast fra denne fanen, men la verdier fra forsiden vinne.
  useEffect(() => {
    try {
      const lagret = sessionStorage.getItem(LAGER);
      if (lagret && !q.get('anledning')) {
        const data = JSON.parse(lagret) as { u: Partial<Utkast>; steg: number };
        // eslint-disable-next-line react-hooks/set-state-in-effect -- engangs gjenoppretting fra sessionStorage
        setU((v) => ({ ...v, ...data.u }));
        setSteg(Math.min(ANTALL_STEG, Math.max(1, data.steg)));
      }
    } catch {}
    setLastet(true);
  }, [q]);

  useEffect(() => {
    if (!lastet) return;
    try {
      if (steg <= ANTALL_STEG) {
        const utenKontakt: Partial<Utkast> = { ...u };
        for (const k of KONTAKTFELT) delete utenKontakt[k];
        sessionStorage.setItem(LAGER, JSON.stringify({ u: utenKontakt, steg: Math.min(steg, 2) }));
      } else sessionStorage.removeItem(LAGER);
    } catch {}
  }, [u, steg, lastet]);

  // Flytt fokus til overskriften ved nytt steg, så skjermlesere får med seg skiftet.
  useEffect(() => {
    if (forsteGang.current) {
      forsteGang.current = false;
      return;
    }
    tittel.current?.focus();
    window.scrollTo({ top: 0 });
  }, [steg]);

  const sett = <K extends keyof Utkast>(k: K, v: Utkast[K]) => {
    setU((x) => ({ ...x, [k]: v }));
    if (k in feil) setFeil((f) => ({ ...f, [k]: undefined }));
  };

  const settKosthold = (type: Kostholdstype, v: KostholdValg | undefined) =>
    setU((x) => {
      const k = { ...x.kosthold };
      if (v) k[type] = v;
      else delete k[type];
      return { ...x, kosthold: k };
    });

  const validerSteg = (s: number): Feil => {
    const f: Feil = {};
    if (s === 1) {
      if (u.gjester < 1) f.gjester = 'Skriv antall gjester, minst 1.';
      if (!u.dato) f.dato = 'Velg en dato.';
      else if (u.dato < iDag()) f.dato = 'Datoen har passert. Velg en dato fra i dag og fremover.';
      if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(u.klokkeslett)) f.klokkeslett = 'Skriv klokkeslett som tt:mm, for eksempel 11:30.';
      if (!gyldigPostnummer(u.postnummer))
        f.postnummer = u.postnummer.length === 4 ? 'Vi finner ikke dette postnummeret.' : 'Skriv postnummeret med fire siffer, for eksempel 0150.';
    }
    if (s === 3) {
      if (!u.navn.trim()) f.navn = 'Skriv navnet ditt.';
      if (!epostOk(u.epost)) f.epost = u.epost.includes('@') ? 'E-postadressen mangler domene, for eksempel @firma.no.' : 'Skriv e-postadressen din, for eksempel kari@firma.no.';
      if (u.telefon.trim() && !telefonOk(u.telefon)) f.telefon = 'Telefonnummeret må ha minst åtte siffer, for eksempel 912 34 567.';
    }
    return f;
  };

  const visFeil = (f: Feil) => {
    setFeil(f);
    const forste = Object.keys(f)[0];
    if (forste) document.getElementById(`felt-${forste}`)?.focus();
    return !forste;
  };

  const neste = () => {
    if (steg === ANTALL_STEG) {
      // Siste kontroll av alle steg før innsending. Fase 2: server action med validering på serveren.
      for (const s of [1, 3]) {
        const f = validerSteg(s);
        if (Object.keys(f).length) {
          setSteg(s);
          setFeil(f);
          return;
        }
      }
      setSteg(ANTALL_STEG + 1);
      return;
    }
    if (!visFeil(validerSteg(steg))) return;
    if (fraOversikt) {
      setFraOversikt(false);
      setSteg(ANTALL_STEG);
    } else setSteg((s) => s + 1);
  };
  const tilbake = () => {
    setFraOversikt(false);
    if (steg === 1) router.push('/');
    else setSteg((s) => s - 1);
  };
  const endre = (s: number) => {
    setFraOversikt(true);
    setFeil({});
    setSteg(s);
  };

  const sted = poststed(u.postnummer);
  const postOk = gyldigPostnummer(u.postnummer);
  const kostholdListe = (Object.entries(u.kosthold) as [Kostholdstype, KostholdValg][]).map(
    ([type, v]) => `${kostholdNavn(type)}${v.antall ? ` · ${v.antall}` : ''}${v.alvorlig ? ', alvorlig allergi' : ''}`,
  );

  if (steg > ANTALL_STEG) {
    return (
      <main id="innhold" className="flex min-h-dvh flex-col">
        <div className="bg-panel px-6 pb-8 pt-14 text-panel-on">
          <div className="mx-auto flex max-w-[640px] flex-col gap-4">
            <h1 ref={tittel} tabIndex={-1} className="k-heading m-0 text-[38px] leading-[1.02] outline-none md:text-h1">
              Forespørselen er sendt
            </h1>
            <p className="m-0 text-[17px] leading-[1.55] text-panel-on-muted">
              Vi har sendt en bekreftelse til <strong className="text-panel-on">{u.epost}</strong> med lenke til forespørselen.
            </p>
          </div>
        </div>
        <div className="mx-auto flex w-full max-w-[640px] flex-grow flex-col gap-6 p-6">
          <div className="flex flex-col gap-1 border-b border-border pb-4">
            <strong className="text-[17px]">
              {anledningNavn(u.anledning)} · {u.gjester} kuverter
            </strong>
            <span className="text-[15px] text-text-muted">
              {u.dato ? stor(datoKort(u.dato)) : 'Fleksibel dato'} · {[u.postnummer, sted].filter(Boolean).join(' ')} · {budsjettNavn(u.budsjett)}
            </span>
          </div>
          <section aria-labelledby="hva-na" className="flex flex-col gap-3">
            <h2 id="hva-na" className="k-heading m-0 text-2xl">
              Hva skjer nå?
            </h2>
            <ol className="m-0 flex list-none flex-col gap-3 p-0 text-base leading-normal">
              <li className="flex gap-3">
                <Hake />
                <span>Godkjente leverandører {sted ? `i ${sted}` : 'i nærheten'} får beskjed om forespørselen.</span>
              </li>
              <li className="flex gap-3">
                <Hake />
                <span>Du får en e-post hver gang et tilbud kommer inn. Høyst {MAKS_LEVERANDORER} leverandører kan svare.</span>
              </li>
              <li className="flex gap-3">
                <Hake />
                <span>Sammenlign tilbudene og velg det som passer, eller la være. Det er helt uforpliktende.</span>
              </li>
            </ol>
          </section>
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
      <div className="mx-auto flex w-full max-w-[680px] flex-grow flex-col">
        <div className="flex shrink-0 items-center justify-between px-2 pt-2">
          <button type="button" aria-label={steg === 1 ? 'Tilbake til forsiden' : 'Forrige steg'} onClick={tilbake} className="flex h-11 w-11 items-center justify-center rounded-pill">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M15 5l-7 7 7 7" />
            </svg>
          </button>
          <span className="text-[15px] font-semibold" aria-hidden="true">
            Steg {steg} av {ANTALL_STEG}
          </span>
          <Link href="/" aria-label="Lukk skjemaet. Valgene dine blir lagret i denne fanen." className="flex h-11 w-11 items-center justify-center rounded-pill text-text">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </Link>
        </div>
        <div className="shrink-0 px-4 pt-1.5 [&>div]:justify-between [&_svg]:h-[34px] [&_svg]:w-[34px]">
          <Progress steg={steg} totalt={ANTALL_STEG} navn={titler[steg - 1]} />
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
          <div className="flex flex-grow flex-col gap-7 px-4 py-6">
            <div className="flex flex-col gap-2">
              <h1 id="skjema-tittel" ref={tittel} tabIndex={-1} className="k-heading m-0 text-h1 leading-[1.02] outline-none">
                {titler[steg - 1]}
              </h1>
              <p className="m-0 text-base text-text-muted">{hint[steg - 1]}</p>
            </div>

            {steg === 1 && (
              <>
                <Gruppe legend="Anledning">
                  <div className="flex flex-wrap gap-2">
                    {anledninger.map((a) => (
                      <Valgknapp key={a.id} valgt={u.anledning === a.id} onClick={() => sett('anledning', a.id)} className="pl-2.5">
                        {a.illustrasjon ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={a.illustrasjon} alt="" className="k-ink h-7 w-auto" />
                        ) : (
                          <span className="w-1" />
                        )}
                        {a.navn}
                      </Valgknapp>
                    ))}
                  </div>
                </Gruppe>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="felt-gjester" className="text-[15px] font-semibold">
                    Antall gjester
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      aria-label="Færre gjester"
                      onClick={() => sett('gjester', Math.max(1, u.gjester - 1))}
                      className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-pill border-[1.5px] border-border-input bg-surface hover:border-primary"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
                        <path d="M5 12h14" />
                      </svg>
                    </button>
                    <input
                      id="felt-gjester"
                      inputMode="numeric"
                      autoComplete="off"
                      aria-invalid={feil.gjester ? true : undefined}
                      aria-describedby={feil.gjester ? 'felt-gjester-feil' : undefined}
                      value={u.gjester || ''}
                      onChange={(e) => sett('gjester', Math.min(9999, Number(e.target.value.replace(/\D/g, '')) || 0))}
                      className={cn(feltKlasse(!!feil.gjester), 'k-num !w-[110px] text-center font-bold')}
                    />
                    <button
                      type="button"
                      aria-label="Flere gjester"
                      onClick={() => sett('gjester', Math.min(9999, u.gjester + 1))}
                      className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-pill border-[1.5px] border-border-input bg-surface hover:border-primary"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
                        <path d="M5 12h14M12 5v14" />
                      </svg>
                    </button>
                  </div>
                  {feil.gjester && (
                    <span id="felt-gjester-feil" className="text-small font-semibold text-error">
                      {feil.gjester}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-4 min-[420px]:grid-cols-2">
                  <Input id="felt-dato" label="Dato" type="date" min={iDag()} value={u.dato} onChange={(e) => sett('dato', e.target.value)} feil={feil.dato} required />
                  <Input
                    id="felt-klokkeslett"
                    label="Maten skal stå klar kl."
                    type="time"
                    step={300}
                    value={u.klokkeslett}
                    onChange={(e) => sett('klokkeslett', e.target.value)}
                    feil={feil.klokkeslett}
                    required
                  />
                </div>
                <label className="-mt-3 flex min-h-touch cursor-pointer items-center gap-3 text-base font-semibold">
                  <input type="checkbox" checked={u.fleksibel} onChange={(e) => sett('fleksibel', e.target.checked)} className="h-6 w-6 accent-[var(--k-primary)]" />
                  Datoen er fleksibel
                </label>

                <div className="grid grid-cols-1 gap-4 min-[420px]:grid-cols-2">
                  <Input
                    id="felt-postnummer"
                    label="Postnummer der maten skal serveres"
                    inputMode="numeric"
                    autoComplete="postal-code"
                    maxLength={4}
                    value={u.postnummer}
                    onChange={(e) => sett('postnummer', rensPostnummer(e.target.value))}
                    hint={postOk ? (sted ?? `Postnummer ${u.postnummer}`) : 'Fire siffer, for eksempel 0150'}
                    feil={feil.postnummer}
                    required
                  />
                  <Gruppe legend="Levering eller henting">
                    <div className="flex flex-wrap gap-2">
                      {leveringer.map((l) => (
                        <Chip key={l.id} tone="soft" pressed={u.levering === l.id} onClick={() => sett('levering', l.id)} className="min-h-[52px] px-5 text-base">
                          {l.navn}
                        </Chip>
                      ))}
                    </div>
                  </Gruppe>
                </div>
                <p className="-mt-2 m-0 text-[15px] text-text-muted">Leverandørene ser bare området. Full adresse deles når du velger et tilbud.</p>
              </>
            )}

            {steg === 2 && (
              <>
                <Gruppe legend="Servering">
                  <div className="grid gap-2 md:grid-cols-2">
                    {serveringer.map((s) => {
                      const valgt = u.servering === s.id;
                      return (
                        <button
                          key={s.id}
                          type="button"
                          aria-pressed={valgt}
                          onClick={() => sett('servering', s.id)}
                          className={cn(
                            'flex min-h-16 flex-col justify-center gap-0.5 rounded-card px-5 py-3 text-left transition-colors duration-200',
                            valgt ? 'border-2 border-primary bg-surface-soft' : 'border-[1.5px] border-border-input bg-surface hover:border-primary',
                          )}
                        >
                          <span className="text-base font-bold">{s.navn}</span>
                          <span className="text-small font-medium text-text-muted">{s.beskrivelse}</span>
                        </button>
                      );
                    })}
                  </div>
                </Gruppe>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="felt-varighet" className="text-[15px] font-semibold">
                    Hvor lenge varer arrangementet?
                  </label>
                  <select id="felt-varighet" value={u.varighet} onChange={(e) => sett('varighet', e.target.value)} className={cn(feltKlasse(), 'min-[420px]:max-w-[280px]')}>
                    {varigheter.map((v) => (
                      <option key={v}>{v}</option>
                    ))}
                  </select>
                </div>

                <Gruppe legend="Budsjett per kuvert" hjelp="Inkludert mva. Hjelper leverandørene å foreslå riktig meny.">
                  <div className="flex flex-wrap gap-2">
                    {budsjetter.map((b) => (
                      <Chip key={b.id} pressed={u.budsjett === b.id} onClick={() => sett('budsjett', b.id)} className="px-4 font-bold">
                        {b.navn}
                      </Chip>
                    ))}
                  </div>
                </Gruppe>

                <Gruppe legend="Allergier og kosthold" hjelp="Velg alt som gjelder, og skriv hvor mange.">
                  <div className="flex flex-wrap gap-2">
                    {kostholdstyper.map((k) => {
                      const valgt = !!u.kosthold[k.id];
                      return (
                        <Chip key={k.id} pressed={valgt} onClick={() => settKosthold(k.id, valgt ? undefined : { antall: 1, alvorlig: false })} className="font-bold">
                          {k.navn}
                        </Chip>
                      );
                    })}
                  </div>
                  {(Object.entries(u.kosthold) as [Kostholdstype, KostholdValg][]).length > 0 && (
                    <ul className="m-0 mt-1 flex list-none flex-col gap-2 rounded-alert bg-surface-soft p-3 md:p-4">
                      {(Object.entries(u.kosthold) as [Kostholdstype, KostholdValg][]).map(([type, v]) => (
                        <li key={type} className="flex flex-wrap items-center gap-x-4 gap-y-1">
                          <label htmlFor={`kosthold-${type}`} className="min-w-[96px] text-base font-semibold">
                            {kostholdNavn(type)}
                          </label>
                          <span className="flex items-center gap-2">
                            <input
                              id={`kosthold-${type}`}
                              inputMode="numeric"
                              aria-describedby={`kosthold-${type}-enhet`}
                              value={v.antall || ''}
                              onChange={(e) => settKosthold(type, { ...v, antall: Math.min(9999, Number(e.target.value.replace(/\D/g, '')) || 0) })}
                              className={cn(feltKlasse(), 'k-num min-h-touch !w-[76px] text-center')}
                            />
                            <span id={`kosthold-${type}-enhet`} className="text-[15px] text-text-muted">
                              personer
                            </span>
                          </span>
                          {type === 'notter' && (
                            <label className="flex min-h-touch cursor-pointer items-center gap-2.5 text-[15px] font-semibold">
                              <input
                                type="checkbox"
                                checked={v.alvorlig}
                                onChange={(e) => settKosthold(type, { ...v, alvorlig: e.target.checked })}
                                className="h-6 w-6 accent-[var(--k-primary)]"
                              />
                              Alvorlig allergi
                            </label>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </Gruppe>

                <Textarea
                  label="Andre ønsker (valgfritt)"
                  hint="For eksempel andre allergier, servise, drikke eller tema. Vises bare for leverandørene som låser opp forespørselen."
                  placeholder="Gjerne mye grønt, og kaffe til slutt."
                  value={u.melding}
                  onChange={(e) => sett('melding', e.target.value)}
                  rows={4}
                  maxLength={1000}
                />
              </>
            )}

            {steg === 3 && (
              <>
                <div className="flex flex-col gap-4">
                  <Input id="felt-navn" label="Navn" autoComplete="name" value={u.navn} onChange={(e) => sett('navn', e.target.value)} feil={feil.navn} required />
                  <Input
                    id="felt-epost"
                    label="E-post"
                    type="email"
                    autoComplete="email"
                    inputMode="email"
                    value={u.epost}
                    onChange={(e) => sett('epost', e.target.value)}
                    hint="Hit sender vi lenke til tilbudene."
                    feil={feil.epost}
                    required
                  />
                  <Input
                    id="felt-telefon"
                    label="Telefon (valgfritt)"
                    type="tel"
                    autoComplete="tel"
                    inputMode="tel"
                    value={u.telefon}
                    onChange={(e) => sett('telefon', e.target.value)}
                    hint="Gjør det enklere for leverandørene å avklare detaljer."
                    feil={feil.telefon}
                  />
                  <Input id="felt-firma" label="Bedrift (valgfritt)" autoComplete="organization" value={u.firma} onChange={(e) => sett('firma', e.target.value)} />
                </div>
                <div className="flex flex-col gap-2 rounded-alert bg-surface-soft p-4 text-[15px] leading-normal md:p-5">
                  <strong className="text-base">Hvem ser hva?</strong>
                  <p className="m-0">
                    Godkjente leverandører i området ser anledning, dato, antall gjester, område, budsjett og kosthold.
                  </p>
                  <p className="m-0">
                    Navn, kontaktinfo og ønskene dine ser bare leverandørene som låser opp forespørselen, høyst {MAKS_LEVERANDORER}. Full adresse deles først når du velger et tilbud.
                  </p>
                </div>
              </>
            )}

            {steg === 4 && (
              <>
                <Oversikt tittel="Arrangementet" onEndre={() => endre(1)}>
                  <Rad navn="Anledning">{anledningNavn(u.anledning)}</Rad>
                  <Rad navn="Gjester">{u.gjester}</Rad>
                  <Rad navn="Dato">
                    {u.dato ? stor(datoKort(u.dato)) : '–'} kl. {u.klokkeslett}
                    {u.fleksibel ? ' (fleksibel)' : ''}
                  </Rad>
                  <Rad navn="Sted">
                    {[u.postnummer, sted].filter(Boolean).join(' ')} · {leveringer.find((l) => l.id === u.levering)?.navn}
                  </Rad>
                </Oversikt>
                <Oversikt tittel="Maten" onEndre={() => endre(2)}>
                  <Rad navn="Servering">
                    {serveringNavn(u.servering)} · {u.varighet.toLowerCase()}
                  </Rad>
                  <Rad navn="Budsjett">{budsjettNavn(u.budsjett)} per kuvert</Rad>
                  <Rad navn="Kosthold">{kostholdListe.length ? kostholdListe.join('; ') : 'Ingen oppgitt'}</Rad>
                  {u.melding.trim() && <Rad navn="Ønsker">{u.melding}</Rad>}
                </Oversikt>
                <Oversikt tittel="Kontakt" onEndre={() => endre(3)}>
                  <Rad navn="Navn">{u.navn}</Rad>
                  <Rad navn="E-post">{u.epost}</Rad>
                  {u.telefon.trim() && <Rad navn="Telefon">{u.telefon}</Rad>}
                  {u.firma.trim() && <Rad navn="Bedrift">{u.firma}</Rad>}
                </Oversikt>
                <p className="m-0 text-[15px] leading-normal text-text-muted">
                  Når du sender, lagrer vi forespørselen og viser den til godkjente leverandører i området. Forespørselen er gratis og uforpliktende.{' '}
                  <Link href="/personvern" target="_blank">
                    Les om personvern<span className="sr-only"> (åpnes i ny fane)</span>
                  </Link>
                  .
                </p>
              </>
            )}
          </div>

          <div className="sticky bottom-0 flex shrink-0 gap-2 border-t border-border bg-bg px-4 pb-6 pt-3">
            {steg > 1 && !fraOversikt && (
              <Button variant="secondary" onClick={tilbake} className="min-h-14 px-5">
                Tilbake
              </Button>
            )}
            <Button type="submit" className="min-h-14 flex-grow text-[17px]">
              {steg === ANTALL_STEG ? 'Send forespørsel' : fraOversikt ? 'Lagre og gå til oversikten' : 'Neste'}
            </Button>
          </div>
        </form>
      </div>
    </main>
  );
}

function Oversikt({ tittel, onEndre, children }: { tittel: string; onEndre: () => void; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-2 rounded-card border border-border bg-surface p-4 md:p-5" aria-label={tittel}>
      <div className="flex items-center justify-between gap-3">
        <h2 className="m-0 text-[17px] font-bold">{tittel}</h2>
        <Button variant="text" size="sm" onClick={onEndre} className="font-semibold">
          Endre<span className="sr-only"> {tittel.toLowerCase()}</span>
        </Button>
      </div>
      <dl className="m-0 flex flex-col gap-2 text-[15px]">{children}</dl>
    </section>
  );
}

function Rad({ navn, children }: { navn: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[96px_minmax(0,1fr)] gap-3">
      <dt className="text-text-muted">{navn}</dt>
      <dd className="m-0 break-words font-semibold">{children}</dd>
    </div>
  );
}
