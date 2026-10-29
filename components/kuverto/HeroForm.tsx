'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { anledninger } from '@/lib/labels';
import { gyldigPostnummer, rensPostnummer } from '@/lib/postnummer';
import { cn } from '@/lib/cn';

/** Hurtigstart på forsiden. Sender verdiene videre til skjemaet, som fortsetter derfra. */
export function HeroForm({ standardAnledning = 'firmalunsj', standardGjester = 25, knapp = 'Få cateringtilbud' }: { standardAnledning?: string; standardGjester?: number; knapp?: string } = {}) {
  const router = useRouter();
  const [anledning, setAnledning] = useState(standardAnledning);
  const [gjester, setGjester] = useState(String(standardGjester));
  const [postnummer, setPostnummer] = useState('');
  const [feil, setFeil] = useState(false);

  const send = (e: FormEvent) => {
    e.preventDefault();
    if (postnummer && !gyldigPostnummer(postnummer)) {
      setFeil(true);
      return;
    }
    const q = new URLSearchParams({ anledning });
    if (gjester) q.set('gjester', gjester);
    if (postnummer) q.set('postnummer', postnummer);
    router.push(`/foresporsel?${q}`);
  };

  const labelMobil = 'flex flex-col gap-1.5 text-small font-bold text-text-muted';
  const feltMobil =
    'min-h-[52px] w-full rounded-input border-[1.5px] border-border-input bg-surface px-3.5 text-[17px] font-semibold text-text box-border md:min-h-[32px] md:rounded-none md:border-0 md:bg-transparent md:p-0';
  const celle = 'md:gap-0.5 md:px-3.5 md:py-1.5';

  return (
    <form
      onSubmit={send}
      noValidate
      aria-label="Start en forespørsel"
      className="flex flex-col gap-3.5 rounded-[28px] bg-surface p-[18px] shadow-[0_10px_30px_rgba(28,34,16,0.10)] md:flex-row md:flex-wrap md:items-center md:gap-1 md:rounded-media md:p-2"
    >
      <label className={cn(labelMobil, celle, 'md:flex-[1.4_1_130px]')}>
        Anledning
        <select value={anledning} onChange={(e) => setAnledning(e.target.value)} className={feltMobil}>
          {anledninger.map((a) => (
            <option key={a.id} value={a.id}>
              {a.navn}
            </option>
          ))}
        </select>
      </label>
      <div className="grid grid-cols-2 gap-2.5 md:contents">
        <label className={cn(labelMobil, celle, 'md:flex-[0.7_1_70px] md:border-l md:border-border')}>
          Gjester
          <input
            inputMode="numeric"
            autoComplete="off"
            value={gjester}
            onChange={(e) => setGjester(e.target.value.replace(/\D/g, '').slice(0, 4))}
            className={feltMobil}
          />
        </label>
        <label className={cn(labelMobil, celle, 'md:flex-[0.9_1_90px] md:border-l md:border-border')}>
          Postnummer
          <input
            inputMode="numeric"
            autoComplete="postal-code"
            placeholder="0150"
            value={postnummer}
            aria-invalid={feil || undefined}
            aria-describedby={feil ? 'hero-postnummer-feil' : undefined}
            onChange={(e) => {
              setPostnummer(rensPostnummer(e.target.value));
              setFeil(false);
            }}
            className={cn(feltMobil, 'placeholder:text-text-muted placeholder:font-medium', feil && 'border-2 border-error')}
          />
        </label>
      </div>
      <button
        type="submit"
        className="min-h-[58px] rounded-pill bg-primary px-[22px] text-[17px] font-bold text-primary-on transition-colors hover:bg-primary-hover md:h-[60px] md:flex-[1_1_160px] md:whitespace-nowrap"
      >
        {knapp}
      </button>
      {feil && (
        <p id="hero-postnummer-feil" role="alert" className="m-0 w-full px-3.5 text-small font-semibold text-error">
          Skriv postnummeret med fire siffer, for eksempel 0150.
        </p>
      )}
    </form>
  );
}
