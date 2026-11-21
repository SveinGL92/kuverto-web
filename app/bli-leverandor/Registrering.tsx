'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import type { BrregTreff } from '@/app/api/brreg/route';
import { BrregSok } from '@/components/kuverto/BrregSok';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { DekningVelger, type Kommune } from '@/components/kuverto/DekningVelger';
import { Input, Textarea } from '@/components/ui/Input';
import { useSprak } from '@/components/Sprak';
import { foreslattMvaNummer, gyldigMvaNummer, gyldigOrgnr, gyldigTelefon } from '@/lib/orgnr';
import { registrerLeverandor, type RegistreringInn } from './actions';

type Felt = 'orgnr' | 'navn' | 'mvaNummer' | 'beskrivelse' | 'kontaktperson' | 'epost' | 'telefon' | 'kommuner' | 'bekreftet';

const UTKAST = 'kuverto-registrering';

export function Registrering({ kommuner }: { kommuner: Kommune[] }) {
  const { marked, info, t, sti } = useSprak();
  // Sverige og Danmark har ikke et åpent navnesøk. Der skriver leverandøren navn og nummer selv.
  const medSok = marked === 'no' || marked === 'fi';
  const [v, setV] = useState<RegistreringInn>({
    orgnr: '',
    navn: '',
    mvaNummer: '',
    kontaktperson: '',
    epost: '',
    telefon: '',
    nettside: '',
    beskrivelse: '',
    kommuner: [],
    bekreftet: false,
    markedsforing: false,
    felle: '',
  });
  const [bedrift, setBedrift] = useState<BrregTreff>();
  const [feil, setFeil] = useState<Partial<Record<Felt, string>>>({});
  const [generellFeil, setGenerellFeil] = useState<string>();
  const [sender, setSender] = useState(false);
  const [ferdig, setFerdig] = useState(false);
  const kvittering = useRef<HTMLHeadingElement>(null);

  const sett = <K extends keyof RegistreringInn>(k: K, verdi: RegistreringInn[K]) => {
    setV((x) => ({ ...x, [k]: verdi }));
    setFeil((f) => ({ ...f, [k]: undefined }));
  };

  // Ta vare på utkastet i fanen, så ingenting går tapt om man går til en annen side og tilbake.
  const lastet = useRef(false);
  useEffect(() => {
    try {
      const u = JSON.parse(sessionStorage.getItem(UTKAST) ?? 'null') as { v?: RegistreringInn; bedrift?: BrregTreff } | null;
      // eslint-disable-next-line react-hooks/set-state-in-effect -- henter utkast fra sessionStorage etter hydrering
      if (u?.v) setV({ ...u.v, felle: '' });
      if (u?.bedrift) setBedrift(u.bedrift);
    } catch {
      // ignorer
    }
    lastet.current = true;
  }, []);
  useEffect(() => {
    if (!lastet.current || ferdig) return;
    try {
      sessionStorage.setItem(UTKAST, JSON.stringify({ v: { ...v, felle: '' }, bedrift }));
    } catch {
      // ignorer
    }
  }, [v, bedrift, ferdig]);

  const velgBedrift = (b: BrregTreff | undefined) => {
    setBedrift(b);
    setFeil((f) => ({ ...f, orgnr: undefined }));
    setV((x) => ({ ...x, orgnr: b?.orgnr ?? '', navn: b?.navn ?? '', nettside: x.nettside || (b?.nettside ?? ''), mvaNummer: x.mvaNummer || foreslattMvaNummer(marked, b?.orgnr ?? '') }));
  };


  const send = async () => {
    const f: Partial<Record<Felt, string>> = {};
    if (medSok) {
      if (!bedrift) f.orgnr = t('Søk opp og velg bedriften.');
    } else {
      if (!v.navn.trim()) f.navn = t('Skriv navnet på bedriften.');
      if (!gyldigOrgnr(marked, v.orgnr)) f.orgnr = t('Sjekk {navn}, for eksempel {eksempel}.', { navn: marked === 'se' ? info.orgnr.navn.toLowerCase() : info.orgnr.navn, eksempel: info.orgnr.eksempel });
    }
    if (info.omvendtAvgift && !gyldigMvaNummer(marked, v.mvaNummer ?? "")) f.mvaNummer = t('Skriv MVA-nummeret, for eksempel {eksempel}.', { eksempel: foreslattMvaNummer(marked, v.orgnr) || info.mvaPrefiks + '…' });
    if (v.beskrivelse.trim().length < 20) f.beskrivelse = t('Skriv noen setninger om bedriften (minst 20 tegn).');
    if (!v.kontaktperson.trim()) f.kontaktperson = t('Skriv navnet på kontaktpersonen.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.epost.trim())) f.epost = t('Skriv en gyldig e-postadresse.');
    if (!gyldigTelefon(v.telefon)) f.telefon = t('Skriv et gyldig telefonnummer.');
    if (!v.kommuner.length) f.kommuner = t('Velg minst én kommune.');
    if (!v.bekreftet) f.bekreftet = t('Du må bekrefte at opplysningene stemmer.');
    setFeil(f);
    const forste = Object.keys(f)[0];
    if (forste) {
      document.getElementById(`felt-${forste}`)?.focus();
      return;
    }
    setSender(true);
    setGenerellFeil(undefined);
    try {
      const svar = await registrerLeverandor(v);
      if (svar.ok) {
        try {
          sessionStorage.removeItem(UTKAST);
        } catch {
          // ignorer
        }
        setFerdig(true);
        requestAnimationFrame(() => kvittering.current?.focus());
      } else if (svar.felt) {
        setFeil({ [svar.felt]: svar.feil });
        document.getElementById(`felt-${svar.felt}`)?.focus();
      } else setGenerellFeil(svar.feil);
    } catch {
      setGenerellFeil(t('Vi fikk ikke kontakt. Prøv igjen.'));
    } finally {
      setSender(false);
    }
  };

  if (ferdig)
    return (
      <div role="status" className="mt-6 flex flex-col gap-3 rounded-card bg-surface p-6">
        <h2 ref={kvittering} tabIndex={-1} className="k-heading m-0 text-[28px] outline-none">
          {t('Takk, registreringen er mottatt')}
        </h2>
        <p className="m-0 text-base leading-normal text-text-muted">
          {t('Vi har sendt en bekreftelse til')} <strong className="text-text">{v.epost}</strong>. {t('Du får en ny e-post når bedriften er godkjent. Da logger du inn med den samme adressen.')}
        </p>
        <Link href={sti('/for-leverandorer')} className="font-semibold">
          {t('Les mer om hvordan det fungerer')}
        </Link>
      </div>
    );

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        send();
      }}
      className="mt-6 flex flex-col gap-6"
    >
      <section className="flex flex-col gap-5 rounded-card bg-surface p-5 md:p-7" aria-labelledby="bedrift-tittel">
        <h2 id="bedrift-tittel" className="m-0 text-xl font-bold">
          {t('Bedriften')}
        </h2>
        {medSok ? (
          <BrregSok id="felt-orgnr" valgt={bedrift} onVelg={velgBedrift} feil={feil.orgnr} />
        ) : (
          <div className="grid gap-5 min-[480px]:grid-cols-2">
            <Input id="felt-navn" label={t('Bedriftens navn')} autoComplete="organization" value={v.navn} onChange={(e) => sett('navn', e.target.value)} feil={feil.navn} required />
            <Input
              id="felt-orgnr"
              label={info.orgnr.navn}
              inputMode="numeric"
              placeholder={info.orgnr.eksempel}
              value={v.orgnr}
              onChange={(e) => {
                const nr = e.target.value;
                setV((x) => ({ ...x, orgnr: nr, mvaNummer: x.mvaNummer && x.mvaNummer !== foreslattMvaNummer(marked, x.orgnr) ? x.mvaNummer : foreslattMvaNummer(marked, nr) }));
                setFeil((f) => ({ ...f, orgnr: undefined }));
              }}
              feil={feil.orgnr}
              required
            />
          </div>
        )}
        {info.omvendtAvgift && (
          <Input
            id="felt-mvaNummer"
            label={t('MVA-nummer (VAT)')}
            hint={t('Kuverto fakturerer fra Norge med omvendt avgiftsplikt, så vi trenger bedriftens MVA-nummer.')}
            value={v.mvaNummer ?? ''}
            onChange={(e) => sett('mvaNummer', e.target.value.toUpperCase())}
            feil={feil.mvaNummer}
            required
          />
        )}
        <Textarea
          id="felt-beskrivelse"
          label={t('Kort om bedriften')}
          hint={t('Vises for kundene sammen med tilbudene deres. Hva lager dere, og hva er dere gode på? 20–300 tegn.')}
          rows={3}
          maxLength={300}
          value={v.beskrivelse}
          onChange={(e) => sett('beskrivelse', e.target.value)}
          feil={feil.beskrivelse}
          required
        />
        <Input id="felt-nettside" label={t('Nettside (valgfritt)')} type="url" inputMode="url" autoComplete="url" value={v.nettside} onChange={(e) => sett('nettside', e.target.value)} />
      </section>

      <section className="flex flex-col gap-5 rounded-card bg-surface p-5 md:p-7" aria-labelledby="kontakt-tittel">
        <h2 id="kontakt-tittel" className="m-0 text-xl font-bold">
          {t('Kontaktperson')}
        </h2>
        <Input id="felt-kontaktperson" label={t('Navn')} autoComplete="name" value={v.kontaktperson} onChange={(e) => sett('kontaktperson', e.target.value)} feil={feil.kontaktperson} required />
        <div className="grid gap-5 min-[480px]:grid-cols-2">
          <Input
            id="felt-epost"
            label={t('E-post')}
            type="email"
            inputMode="email"
            autoComplete="email"
            hint={t('Her får du forespørsler, og med den logger du inn.')}
            value={v.epost}
            onChange={(e) => sett('epost', e.target.value)}
            feil={feil.epost}
            required
          />
          <Input
            id="felt-telefon"
            label={t('Telefon')}
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            hint={t('Kunden får nummeret når de velger tilbudet deres.')}
            value={v.telefon}
            onChange={(e) => sett('telefon', e.target.value)}
            feil={feil.telefon}
            required
          />
        </div>
      </section>

      <section className="flex flex-col gap-4 rounded-card bg-surface p-5 md:p-7" aria-labelledby="omrade-tittel">
        <div className="flex flex-col gap-1">
          <h2 id="omrade-tittel" className="m-0 text-xl font-bold">
            {t('Hvor leverer dere?')}
          </h2>
          <p className="m-0 text-[15px] text-text-muted">{t('Kryss av for fylkene dere leverer til, eller åpne fylket og velg enkeltkommuner. Du får bare forespørsler fra områdene du velger.')}</p>
        </div>
        <DekningVelger kommuner={kommuner} valgt={v.kommuner} onChange={(l) => sett('kommuner', l)} feilId={feil.kommuner ? 'kommuner-feil' : undefined} />
        {feil.kommuner && (
          <span id="kommuner-feil" className="text-small font-semibold text-error">
            {feil.kommuner}
          </span>
        )}
      </section>

      <div className="flex flex-col gap-2">
        <label className="flex cursor-pointer items-start gap-3 text-base">
          <input
            id="felt-bekreftet"
            type="checkbox"
            checked={v.bekreftet}
            onChange={(e) => sett('bekreftet', e.target.checked)}
            aria-describedby={feil.bekreftet ? 'bekreftet-feil' : undefined}
            className="mt-0.5 h-6 w-6 shrink-0 accent-[var(--k-primary)]"
          />
          <span>
            {t('Jeg bekrefter at opplysningene stemmer, og at jeg kan representere bedriften. Les om')}{' '}
            <a href={sti('/personvern')} target="_blank" rel="noopener">
              {t('personvern')}<span className="sr-only"> {t('(åpnes i ny fane)')}</span>
            </a>
            .
          </span>
        </label>
        {feil.bekreftet && (
          <span id="bekreftet-feil" className="pl-9 text-small font-semibold text-error">
            {feil.bekreftet}
          </span>
        )}
        <label className="flex cursor-pointer items-start gap-3 text-base">
          <input type="checkbox" checked={v.markedsforing} onChange={(e) => sett('markedsforing', e.target.checked)} className="mt-0.5 h-6 w-6 shrink-0 accent-[var(--k-primary)]" />
          <span>{t('Send meg nyheter og tips fra Kuverto på e-post (valgfritt).')}</span>
        </label>
      </div>

      <div aria-hidden="true" className="absolute left-[-9999px] h-px w-px overflow-hidden">
        <input tabIndex={-1} autoComplete="off" value={v.felle} onChange={(e) => sett('felle', e.target.value)} />
      </div>

      {generellFeil && <Alert tone="feil">{generellFeil}</Alert>}
      <Button type="submit" size="lg" busy={sender} disabled={sender} className="self-start">
        {sender ? t('Sender') : t('Send registreringen')}
      </Button>
    </form>
  );
}
