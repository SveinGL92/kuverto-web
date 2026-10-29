'use client';

import Link from 'next/link';
import { useRef, useState } from 'react';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { registrerLeverandor, type RegistreringInn } from './actions';

interface Kommune {
  nr: string;
  navn: string;
}

type Felt = 'orgnr' | 'navn' | 'kontaktperson' | 'epost' | 'kommuner' | 'bekreftet';

export function Registrering({ kommuner }: { kommuner: Kommune[] }) {
  const [v, setV] = useState<RegistreringInn>({
    orgnr: '',
    navn: '',
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
  const [feil, setFeil] = useState<Partial<Record<Felt, string>>>({});
  const [generellFeil, setGenerellFeil] = useState<string>();
  const [sender, setSender] = useState(false);
  const [ferdig, setFerdig] = useState(false);
  const kvittering = useRef<HTMLHeadingElement>(null);

  const sett = <K extends keyof RegistreringInn>(k: K, verdi: RegistreringInn[K]) => {
    setV((x) => ({ ...x, [k]: verdi }));
    setFeil((f) => ({ ...f, [k]: undefined }));
  };
  const oslo = kommuner.filter((k) => k.nr === '0301');
  const akershus = kommuner.filter((k) => k.nr.startsWith('32'));
  const vekslKommune = (nr: string) => sett('kommuner', v.kommuner.includes(nr) ? v.kommuner.filter((x) => x !== nr) : [...v.kommuner, nr]);
  const alleAkershus = akershus.every((k) => v.kommuner.includes(k.nr));

  const send = async () => {
    const f: Partial<Record<Felt, string>> = {};
    if (!/^\d{9}$/.test(v.orgnr.replace(/\s/g, ''))) f.orgnr = 'Organisasjonsnummeret har ni siffer.';
    if (!v.kontaktperson.trim()) f.kontaktperson = 'Skriv navnet på kontaktpersonen.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.epost.trim())) f.epost = 'Skriv en gyldig e-postadresse.';
    if (!v.kommuner.length) f.kommuner = 'Velg minst én kommune.';
    if (!v.bekreftet) f.bekreftet = 'Du må bekrefte at opplysningene stemmer.';
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
        setFerdig(true);
        requestAnimationFrame(() => kvittering.current?.focus());
      } else if (svar.felt) {
        setFeil({ [svar.felt]: svar.feil });
        document.getElementById(`felt-${svar.felt}`)?.focus();
      } else setGenerellFeil(svar.feil);
    } catch {
      setGenerellFeil('Vi fikk ikke kontakt. Prøv igjen.');
    } finally {
      setSender(false);
    }
  };

  if (ferdig)
    return (
      <div role="status" className="mt-6 flex flex-col gap-3 rounded-card bg-surface p-6">
        <h2 ref={kvittering} tabIndex={-1} className="k-heading m-0 text-[28px] outline-none">
          Takk, registreringen er mottatt
        </h2>
        <p className="m-0 text-base leading-normal text-text-muted">
          Vi har sendt en bekreftelse til <strong className="text-text">{v.epost}</strong>. Du får en ny e-post når bedriften er godkjent. Da logger du inn med den samme adressen.
        </p>
        <Link href="/for-leverandorer" className="font-semibold">
          Les mer om hvordan det fungerer
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
          Bedriften
        </h2>
        <div className="grid gap-5 min-[480px]:grid-cols-2">
          <Input
            id="felt-orgnr"
            label="Organisasjonsnummer"
            inputMode="numeric"
            autoComplete="off"
            maxLength={11}
            value={v.orgnr}
            onChange={(e) => sett('orgnr', e.target.value.replace(/[^\d ]/g, ''))}
            feil={feil.orgnr}
            required
          />
          <Input id="felt-navn" label="Navn på bedriften (valgfritt)" hint="Hentes fra Enhetsregisteret hvis tomt." autoComplete="organization" value={v.navn} onChange={(e) => sett('navn', e.target.value)} feil={feil.navn} />
        </div>
        <Input id="felt-nettside" label="Nettside (valgfritt)" type="url" inputMode="url" autoComplete="url" value={v.nettside} onChange={(e) => sett('nettside', e.target.value)} />
        <Textarea
          label="Kort om bedriften (valgfritt)"
          hint="Vises for kundene sammen med tilbudene deres. Høyst 300 tegn."
          rows={3}
          maxLength={300}
          value={v.beskrivelse}
          onChange={(e) => sett('beskrivelse', e.target.value)}
        />
      </section>

      <section className="flex flex-col gap-5 rounded-card bg-surface p-5 md:p-7" aria-labelledby="kontakt-tittel">
        <h2 id="kontakt-tittel" className="m-0 text-xl font-bold">
          Kontaktperson
        </h2>
        <Input id="felt-kontaktperson" label="Navn" autoComplete="name" value={v.kontaktperson} onChange={(e) => sett('kontaktperson', e.target.value)} feil={feil.kontaktperson} required />
        <div className="grid gap-5 min-[480px]:grid-cols-2">
          <Input
            id="felt-epost"
            label="E-post"
            type="email"
            inputMode="email"
            autoComplete="email"
            hint="Her får du forespørsler, og med den logger du inn."
            value={v.epost}
            onChange={(e) => sett('epost', e.target.value)}
            feil={feil.epost}
            required
          />
          <Input id="felt-telefon" label="Telefon (valgfritt)" type="tel" inputMode="tel" autoComplete="tel" value={v.telefon} onChange={(e) => sett('telefon', e.target.value)} />
        </div>
      </section>

      <section className="flex flex-col gap-4 rounded-card bg-surface p-5 md:p-7" aria-labelledby="omrade-tittel">
        <div className="flex flex-col gap-1">
          <h2 id="omrade-tittel" className="m-0 text-xl font-bold">
            Hvor leverer dere?
          </h2>
          <p className="m-0 text-[15px] text-text-muted">Du får bare forespørsler fra kommunene du velger. Du kan endre dette senere.</p>
        </div>
        <fieldset id="felt-kommuner" tabIndex={-1} aria-describedby={feil.kommuner ? 'kommuner-feil' : undefined} className="m-0 flex flex-col gap-4 border-0 p-0 outline-none">
          <legend className="sr-only">Kommuner</legend>
          {oslo.map((k) => (
            <label key={k.nr} className="flex min-h-touch cursor-pointer items-center gap-3 text-base font-bold">
              <input type="checkbox" checked={v.kommuner.includes(k.nr)} onChange={() => vekslKommune(k.nr)} className="h-6 w-6 shrink-0 accent-[var(--k-primary)]" />
              {k.navn}
            </label>
          ))}
          <div className="flex flex-col gap-2 border-t border-border pt-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-base font-bold">Akershus</span>
              <Button
                variant="text"
                size="sm"
                onClick={() => sett('kommuner', alleAkershus ? v.kommuner.filter((nr) => !nr.startsWith('32')) : [...new Set([...v.kommuner, ...akershus.map((k) => k.nr)])])}
              >
                {alleAkershus ? 'Fjern alle i Akershus' : 'Velg alle i Akershus'}
              </Button>
            </div>
            <div className="grid grid-cols-1 gap-x-4 min-[420px]:grid-cols-2 md:grid-cols-3">
              {akershus.map((k) => (
                <label key={k.nr} className="flex min-h-touch cursor-pointer items-center gap-3 text-[15px] font-semibold">
                  <input type="checkbox" checked={v.kommuner.includes(k.nr)} onChange={() => vekslKommune(k.nr)} className="h-6 w-6 shrink-0 accent-[var(--k-primary)]" />
                  {k.navn}
                </label>
              ))}
            </div>
          </div>
        </fieldset>
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
            Jeg bekrefter at opplysningene stemmer, og at jeg kan representere bedriften. Les om <Link href="/personvern">personvern</Link>.
          </span>
        </label>
        {feil.bekreftet && (
          <span id="bekreftet-feil" className="pl-9 text-small font-semibold text-error">
            {feil.bekreftet}
          </span>
        )}
        <label className="flex cursor-pointer items-start gap-3 text-base">
          <input type="checkbox" checked={v.markedsforing} onChange={(e) => sett('markedsforing', e.target.checked)} className="mt-0.5 h-6 w-6 shrink-0 accent-[var(--k-primary)]" />
          <span>Send meg nyheter og tips fra Kuverto på e-post (valgfritt).</span>
        </label>
      </div>

      <div aria-hidden="true" className="absolute left-[-9999px] h-px w-px overflow-hidden">
        <input tabIndex={-1} autoComplete="off" value={v.felle} onChange={(e) => sett('felle', e.target.value)} />
      </div>

      {generellFeil && <Alert tone="feil">{generellFeil}</Alert>}
      <Button type="submit" size="lg" busy={sender} disabled={sender} className="self-start">
        {sender ? 'Sender' : 'Send registreringen'}
      </Button>
    </form>
  );
}
