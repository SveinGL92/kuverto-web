'use client';

import { useState } from 'react';
import { DekningVelger, type Kommune } from '@/components/kuverto/DekningVelger';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { oppdaterProfil, type ProfilInn } from '../actions';

export function Profil({ kommuner, start }: { kommuner: Kommune[]; start: ProfilInn }) {
  const [v, setV] = useState<ProfilInn>(start);
  const [status, setStatus] = useState<{ tone: 'status' | 'feil'; tekst: string }>();
  const [sender, setSender] = useState(false);
  const sett = <K extends keyof ProfilInn>(k: K, verdi: ProfilInn[K]) => setV((x) => ({ ...x, [k]: verdi }));

  const lagre = async () => {
    setSender(true);
    setStatus(undefined);
    const svar = await oppdaterProfil(v);
    setSender(false);
    setStatus(svar.ok ? { tone: 'status', tekst: svar.melding ?? 'Lagret.' } : { tone: 'feil', tekst: svar.feil });
  };

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        lagre();
      }}
      className="mt-4 flex flex-col gap-6"
    >
      <section className="flex flex-col gap-5 rounded-card bg-surface p-5 md:p-7" aria-labelledby="kontakt-tittel">
        <h2 id="kontakt-tittel" className="m-0 text-xl font-bold">
          Kontakt og presentasjon
        </h2>
        <div className="grid gap-5 min-[480px]:grid-cols-2">
          <Input label="Kontaktperson" autoComplete="name" value={v.kontaktperson} onChange={(e) => sett('kontaktperson', e.target.value)} required />
          <Input label="Telefon" required type="tel" inputMode="tel" autoComplete="tel" value={v.telefon} onChange={(e) => sett('telefon', e.target.value)} />
        </div>
        <Input label="Nettside (valgfritt)" type="url" inputMode="url" value={v.nettside} onChange={(e) => sett('nettside', e.target.value)} />
        <Textarea
          label="Kort om bedriften" required
          hint="Vises for kundene sammen med tilbudene deres. 20–300 tegn."
          rows={3}
          maxLength={300}
          value={v.beskrivelse}
          onChange={(e) => sett('beskrivelse', e.target.value)}
        />
      </section>
      <section className="flex flex-col gap-4 rounded-card bg-surface p-5 md:p-7" aria-labelledby="omrade-tittel">
        <div className="flex flex-col gap-1">
          <h2 id="omrade-tittel" className="m-0 text-xl font-bold">
            Hvor leverer dere?
          </h2>
          <p className="m-0 text-[15px] text-text-muted">Du får bare forespørsler fra områdene du velger.</p>
        </div>
        <DekningVelger kommuner={kommuner} valgt={v.kommuner} onChange={(l) => sett('kommuner', l)} />
      </section>
      <div aria-live="polite">{status && <Alert tone={status.tone}>{status.tekst}</Alert>}</div>
      <Button type="submit" size="lg" busy={sender} disabled={sender} className="self-start">
        Lagre endringene
      </Button>
    </form>
  );
}
