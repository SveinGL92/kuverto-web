'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Alert } from '@/components/ui/Alert';
import { Button, ButtonLink } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { Input, Textarea, feltKlasse } from '@/components/ui/Input';
import { cn } from '@/lib/cn';
import { datoKort, stor } from '@/lib/format';
import { MAKS_LEVERANDORER } from '@/lib/klipp';
import { anledninger, anledningNavn, budsjetter, budsjettNavn, kostholdNavn, kostholdstyper, leveringer, serveringer } from '@/lib/labels';
import { gyldigPostnummer, poststed, rensPostnummer } from '@/lib/postnummer';
import type { Anledning, Budsjett, Kostholdstype, Levering, Servering } from '@/lib/types';
import { sendForesporsel } from './actions';

/**
 * Forespørselsskjemaet i to steg: 1) arrangementet og maten, 2) kontakt og innsending.
 * Anledning, gjester og postnummer kommer ofte ferdig utfylt fra forsiden eller en anledningsside.
 */
const ANTALL_STEG = 2;

/** Vanlig serveringstidspunkt per anledning, brukt til kunden selv endrer klokkeslettet. */
const standardTid: Record<Anledning, string> = {
  firmalunsj: '11:30',
  motemat: '09:00',
  julebord: '19:00',
  bryllup: '17:00',
  konfirmasjon: '13:00',
  minnesamvaer: '13:00',
  privat_fest: '18:00',
  annet: '12:00',
};

interface KostholdValg {
  antall: number;
  alvorlig: boolean;
}

interface Utkast {
  anledning: Anledning;
  gjester: number;
  dato: string;
  klokkeslett: string;
  tidEndret: boolean;
  fleksibel: boolean;
  postnummer: string;
  levering: Levering;
  servering: Servering;
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
const LAGER = 'kuverto-utkast-v3';

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
  const anledning = anledninger.some((x) => x.id === a) ? (a as Anledning) : 'firmalunsj';
  return {
    anledning,
    gjester: g > 0 && g < 10000 ? g : 25,
    dato: '',
    klokkeslett: standardTid[anledning],
    tidEndret: false,
    fleksibel: false,
    postnummer: rensPostnummer(q.get('postnummer') ?? ''),
    levering: 'levering',
    servering: 'levert_ferdig',
    budsjett: 'vet_ikke',
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

function Del({ tittel, children }: { tittel: string; children: ReactNode }) {
  const id = `del-${tittel.toLowerCase().replace(/[^a-zæøå]+/g, '-')}`;
  return (
    <section aria-labelledby={id} className="flex flex-col gap-5 border-t border-border pt-6">
      <h2 id={id} className="m-0 text-[19px] font-bold">
        {tittel}
      </h2>
      {children}
    </section>
  );
}

export function Skjema() {
  const q = useSearchParams();
  const router = useRouter();
  const [steg, setSteg] = useState(1);
  const [u, setU] = useState<Utkast>(() => startverdi(new URLSearchParams(q.toString())));
  const [feil, setFeil] = useState<Feil>({});
  const [lastet, setLastet] = useState(false);
  const [sender, setSender] = useState(false);
  const [sendeFeil, setSendeFeil] = useState<string>();
  const [nettside, setNettside] = useState('');
  const startet = useRef(0);
  useEffect(() => {
    startet.current = Date.now();
  }, []);
  const tittel = useRef<HTMLHeadingElement>(null);
  const forsteGang = useRef(true);
  /** Felt som skal få fokus etter neste stegbytte (når innsendingen sender kunden tilbake til steg 1). */
  const fokusFelt = useRef<string | null>(null);

  // Kommer kunden med valg fra forsiden, starter vi et nytt utkast med dem og fjerner dem fra adressen,
  // så en omlasting henter utkastet. Ellers hentes lagret utkast fra denne fanen.
  useEffect(() => {
    if (lastet) return;
    try {
      if (q.get('anledning') || q.get('gjester') || q.get('postnummer')) {
        sessionStorage.removeItem(LAGER);
        router.replace('/foresporsel', { scroll: false });
      } else {
        const lagret = sessionStorage.getItem(LAGER);
        // eslint-disable-next-line react-hooks/set-state-in-effect -- engangs gjenoppretting fra sessionStorage
        if (lagret) setU((v) => ({ ...v, ...(JSON.parse(lagret) as Partial<Utkast>) }));
      }
    } catch {}
    setLastet(true);
  }, [q, lastet, router]);

  useEffect(() => {
    if (!lastet) return;
    try {
      if (steg <= ANTALL_STEG) {
        const utenKontakt: Partial<Utkast> = { ...u };
        for (const k of KONTAKTFELT) delete utenKontakt[k];
        sessionStorage.setItem(LAGER, JSON.stringify(utenKontakt));
      } else sessionStorage.removeItem(LAGER);
    } catch {}
  }, [u, steg, lastet]);

  // Flytt fokus til overskriften ved nytt steg, så skjermlesere får med seg skiftet.
  useEffect(() => {
    if (forsteGang.current) {
      forsteGang.current = false;
      return;
    }
    if (fokusFelt.current) {
      document.getElementById(fokusFelt.current)?.focus();
      fokusFelt.current = null;
    } else {
      tittel.current?.focus();
      window.scrollTo({ top: 0 });
    }
  }, [steg]);

  const sett = <K extends keyof Utkast>(k: K, v: Utkast[K]) => {
    setU((x) => ({ ...x, [k]: v }));
    if (k in feil) setFeil((f) => ({ ...f, [k]: undefined }));
  };

  const velgAnledning = (a: Anledning) =>
    setU((x) => ({ ...x, anledning: a, klokkeslett: x.tidEndret ? x.klokkeslett : standardTid[a] }));

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
      if (!u.dato) {
        if (!u.fleksibel) f.dato = 'Velg en dato, eller kryss av for at datoen ikke er bestemt.';
      } else if (u.dato < iDag()) f.dato = 'Datoen har passert. Velg en dato fra i dag og fremover.';
      if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(u.klokkeslett)) f.klokkeslett = 'Skriv klokkeslett som tt:mm, for eksempel 11:30.';
      if (!gyldigPostnummer(u.postnummer))
        f.postnummer = u.postnummer.length === 4 ? 'Vi finner ikke dette postnummeret.' : 'Skriv postnummeret med fire siffer, for eksempel 0150.';
    }
    if (s === 2) {
      if (!u.navn.trim()) f.navn = 'Skriv navnet ditt.';
      if (!epostOk(u.epost)) f.epost = u.epost.includes('@') ? 'E-postadressen mangler domene, for eksempel @firma.no.' : 'Skriv e-postadressen din, for eksempel kari@firma.no.';
      if (u.telefon.trim() && !telefonOk(u.telefon)) f.telefon = 'Telefonnummeret må ha minst åtte siffer, for eksempel 912 34 567.';
    }
    return f;
  };

  const neste = async () => {
    if (sender) return;
    if (steg === ANTALL_STEG) {
      const f1 = validerSteg(1);
      if (Object.keys(f1).length) {
        fokusFelt.current = `felt-${Object.keys(f1)[0]}`;
        setFeil(f1);
        setSteg(1);
        return;
      }
    }
    const f = validerSteg(steg);
    setFeil(f);
    const forste = Object.keys(f)[0];
    if (forste) {
      document.getElementById(`felt-${forste}`)?.focus();
      return;
    }
    if (steg < ANTALL_STEG) {
      setSteg((s) => s + 1);
      return;
    }
    setSender(true);
    setSendeFeil(undefined);
    try {
      const svar = await sendForesporsel({ ...u, nettside, startet: startet.current });
      if (svar.ok) {
        setSteg(ANTALL_STEG + 1);
        return;
      }
      const felt = svar.felt as Felt | undefined;
      if (felt && ['gjester', 'dato', 'klokkeslett', 'postnummer'].includes(felt)) {
        fokusFelt.current = `felt-${felt}`;
        setFeil({ [felt]: svar.feil });
        setSteg(1);
      } else if (felt) {
        setFeil({ [felt]: svar.feil });
        document.getElementById(`felt-${felt}`)?.focus();
      } else {
        setSendeFeil(svar.feil);
      }
    } catch {
      setSendeFeil('Vi fikk ikke kontakt. Sjekk nettforbindelsen og prøv igjen. Det du har fylt ut, er tatt vare på.');
    } finally {
      setSender(false);
    }
  };
  const tilbake = () => (steg === 1 ? router.push('/') : setSteg(1));

  const sted = poststed(u.postnummer);
  const postOk = gyldigPostnummer(u.postnummer);
  const kostholdListe = (Object.entries(u.kosthold) as [Kostholdstype, KostholdValg][]).map(
    ([type, v]) => `${kostholdNavn(type)}${v.antall ? ` ${v.antall}` : ''}${v.alvorlig ? ' (alvorlig)' : ''}`,
  );
  const valgtServering = serveringer.find((s) => s.id === u.servering);

  if (steg > ANTALL_STEG) {
    return (
      <main id="innhold" className="flex min-h-dvh flex-col">
        <div className="bg-panel px-6 pb-8 pt-14 text-panel-on">
          <div className="mx-auto flex max-w-[640px] flex-col gap-4">
            <h1 ref={tittel} tabIndex={-1} className="k-heading m-0 text-[38px] leading-[1.02] outline-none md:text-h1">
              Forespørselen er sendt
            </h1>
            <p className="m-0 text-[17px] leading-[1.55] text-panel-on-muted">
              Vi har sendt en bekreftelse til <strong className="text-panel-on">{u.epost}</strong>. Der finner du lenken du logger inn med for å se tilbudene.
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
            <ButtonLink href={`/logg-inn?epost=${encodeURIComponent(u.epost)}`} size="lg">
              Logg inn og følg forespørselen
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
          <button type="button" aria-label={steg === 1 ? 'Tilbake til forsiden' : 'Tilbake til arrangementet'} onClick={tilbake} className="flex h-11 w-11 items-center justify-center rounded-pill">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M15 5l-7 7 7 7" />
            </svg>
          </button>
          <span className="text-[15px] font-semibold" aria-hidden="true">
            Steg {steg} av {ANTALL_STEG}
          </span>
          <Link href="/" aria-label="Lukk skjemaet. Valgene om arrangementet og maten blir lagret i denne fanen." className="flex h-11 w-11 items-center justify-center rounded-pill text-text">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </Link>
        </div>
        <div
          className="mx-4 mt-1 h-1.5 overflow-hidden rounded-pill bg-surface-soft"
          role="progressbar"
          aria-valuemin={1}
          aria-valuemax={ANTALL_STEG}
          aria-valuenow={steg}
          aria-label={`Steg ${steg} av ${ANTALL_STEG}`}
        >
          <div className="h-full rounded-pill bg-primary transition-[width] duration-300 motion-reduce:transition-none" style={{ width: `${(steg / ANTALL_STEG) * 100}%` }} />
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
          <div className="flex flex-grow flex-col gap-6 px-4 pb-8 pt-6">
            <div className="flex flex-col gap-2">
              <h1 id="skjema-tittel" ref={tittel} tabIndex={-1} className="k-heading m-0 text-h1 leading-[1.02] outline-none">
                {steg === 1 ? 'Fortell om arrangementet' : 'Hvor skal vi sende tilbudene?'}
              </h1>
              <p className="m-0 text-base text-text-muted">
                {steg === 1 ? 'Tar rundt to minutter. Et omtrentlig svar holder, leverandørene kan foreslå alternativer.' : 'Du trenger ikke lage konto. Vi sender lenke til tilbudene på e-post.'}
              </p>
            </div>

            {steg === 1 && (
              <>
                <div className="grid grid-cols-1 gap-5 min-[480px]:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="felt-anledning" className="text-[15px] font-semibold">
                      Anledning
                    </label>
                    <select id="felt-anledning" value={u.anledning} onChange={(e) => velgAnledning(e.target.value as Anledning)} className={feltKlasse()}>
                      {anledninger.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.navn}
                        </option>
                      ))}
                    </select>
                  </div>
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
                        className={cn(feltKlasse(!!feil.gjester), 'k-num min-w-0 flex-1 text-center font-bold')}
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
                </div>

                <div className="flex flex-col gap-2">
                  <div className="grid grid-cols-1 gap-5 min-[480px]:grid-cols-2">
                    <Input id="felt-dato" label="Dato" type="date" min={iDag()} value={u.dato} onChange={(e) => sett('dato', e.target.value)} feil={feil.dato} required={!u.fleksibel} />
                    <Input
                      id="felt-klokkeslett"
                      label="Maten skal stå klar kl."
                      type="time"
                      step={300}
                      value={u.klokkeslett}
                      onChange={(e) => {
                        sett('klokkeslett', e.target.value);
                        sett('tidEndret', true);
                      }}
                      feil={feil.klokkeslett}
                      required
                    />
                  </div>
                  <label className="flex min-h-touch cursor-pointer items-center gap-3 text-base font-semibold">
                    <input
                      type="checkbox"
                      checked={u.fleksibel}
                      onChange={(e) => {
                        sett('fleksibel', e.target.checked);
                        if (e.target.checked) setFeil((f) => ({ ...f, dato: undefined }));
                      }}
                      className="h-6 w-6 shrink-0 accent-[var(--k-primary)]"
                    />
                    Datoen er fleksibel eller ikke bestemt
                  </label>
                </div>

                <div className="grid grid-cols-1 gap-5 min-[480px]:grid-cols-2">
                  <Input
                    id="felt-postnummer"
                    label="Postnummer der maten skal serveres"
                    inputMode="numeric"
                    autoComplete="postal-code"
                    maxLength={4}
                    value={u.postnummer}
                    onChange={(e) => sett('postnummer', rensPostnummer(e.target.value))}
                    hint={postOk ? (sted ?? `Postnummer ${u.postnummer}`) : 'Leverandørene ser bare området.'}
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

                <Del tittel="Maten">
                  <Gruppe legend="Servering" hjelp={valgtServering?.beskrivelse}>
                    <div className="flex flex-wrap gap-2">
                      {serveringer.map((s) => (
                        <Chip key={s.id} tone="soft" pressed={u.servering === s.id} onClick={() => sett('servering', s.id)}>
                          {s.navn}
                        </Chip>
                      ))}
                    </div>
                  </Gruppe>

                  <Gruppe legend="Budsjett per kuvert inkl. mva">
                    <div className="flex flex-wrap gap-2">
                      {budsjetter.map((b) => (
                        <Chip key={b.id} tone="soft" pressed={u.budsjett === b.id} onClick={() => sett('budsjett', b.id)}>
                          {b.navn}
                        </Chip>
                      ))}
                    </div>
                  </Gruppe>

                  <Gruppe legend="Allergier og kosthold" hjelp="Velg det som gjelder, og skriv hvor mange.">
                    <div className="flex flex-wrap gap-2">
                      {kostholdstyper.map((k) => {
                        const valgt = !!u.kosthold[k.id];
                        return (
                          <Chip key={k.id} pressed={valgt} onClick={() => settKosthold(k.id, valgt ? undefined : { antall: 1, alvorlig: false })}>
                            {k.navn}
                          </Chip>
                        );
                      })}
                    </div>
                    {kostholdListe.length > 0 && (
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
                                  className="h-6 w-6 shrink-0 accent-[var(--k-primary)]"
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
                    hint="For eksempel andre allergier, drikke, servise eller fast levering. Vises bare for leverandørene som låser opp forespørselen."
                    value={u.melding}
                    onChange={(e) => sett('melding', e.target.value)}
                    rows={3}
                    maxLength={1000}
                  />
                </Del>
              </>
            )}

            {steg === 2 && (
              <>
                <section aria-labelledby="oppsummering" className="flex items-start justify-between gap-3 rounded-card border border-border bg-surface p-4 md:p-5">
                  <div className="flex min-w-0 flex-col gap-1">
                    <h2 id="oppsummering" className="m-0 text-[17px] font-bold">
                      {anledningNavn(u.anledning)} · {u.gjester} gjester
                    </h2>
                    <p className="m-0 text-[15px] leading-normal text-text-muted">
                      {u.dato ? `${stor(datoKort(u.dato))} kl. ${u.klokkeslett}` : 'Fleksibel dato'} · {[u.postnummer, sted].filter(Boolean).join(' ')} ·{' '}
                      {leveringer.find((l) => l.id === u.levering)?.navn.toLowerCase()}
                    </p>
                    <p className="m-0 text-[15px] leading-normal text-text-muted">
                      {valgtServering?.navn} · {budsjettNavn(u.budsjett)}
                      {u.budsjett === 'vet_ikke' ? '' : ' per kuvert'}
                      {kostholdListe.length ? ` · ${kostholdListe.join(', ')}` : ''}
                    </p>
                  </div>
                  <Button variant="text" size="sm" onClick={tilbake} className="shrink-0 font-semibold">
                    Endre<span className="sr-only"> arrangementet</span>
                  </Button>
                </section>

                <div className="flex flex-col gap-5">
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
                  <div className="grid grid-cols-1 gap-5 min-[480px]:grid-cols-2">
                    <Input
                      id="felt-telefon"
                      label="Telefon (valgfritt)"
                      type="tel"
                      autoComplete="tel"
                      inputMode="tel"
                      value={u.telefon}
                      onChange={(e) => sett('telefon', e.target.value)}
                      feil={feil.telefon}
                    />
                    <Input id="felt-firma" label="Bedrift (valgfritt)" autoComplete="organization" value={u.firma} onChange={(e) => sett('firma', e.target.value)} />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 rounded-alert bg-surface-soft p-4 text-[15px] leading-normal">
                  <strong className="text-base">Hvem ser hva?</strong>
                  <p className="m-0">Leverandører i området ser arrangementet og maten, ikke hvem du er.</p>
                  <p className="m-0">
                    Navn, kontaktinfo og ønskene dine ser bare de som låser opp forespørselen, høyst {MAKS_LEVERANDORER}. Full adresse deles først når du velger et tilbud.{' '}
                    <Link href="/personvern" target="_blank">
                      Personvern<span className="sr-only"> (åpnes i ny fane)</span>
                    </Link>
                  </p>
                </div>
              </>
            )}
          </div>

          <div aria-hidden="true" className="absolute left-[-9999px] h-px w-px overflow-hidden">
            <label>
              Nettside
              <input tabIndex={-1} autoComplete="off" value={nettside} onChange={(e) => setNettside(e.target.value)} />
            </label>
          </div>
          <div className="sticky bottom-0 flex shrink-0 flex-col gap-2 border-t border-border bg-bg px-4 pb-6 pt-3">
            {sendeFeil && <Alert tone="feil">{sendeFeil}</Alert>}
            <Button type="submit" className="min-h-14 w-full text-[17px]" busy={sender} disabled={sender}>
              {steg === 1 ? 'Neste: kontaktinfo' : sender ? 'Sender' : 'Send forespørsel'}
            </Button>
            <span className="text-center text-small text-text-muted">{steg === 1 ? 'Ingenting sendes før neste steg.' : 'Gratis og uforpliktende.'}</span>
          </div>
        </form>
      </div>
    </main>
  );
}
