'use client';

import { useEffect, useId, useRef, useState } from 'react';
import type { BrregTreff } from '@/app/api/brreg/route';
import { useSprak } from '@/components/Sprak';
import { formaterOrgnr, gyldigOrgnr } from '@/lib/orgnr';

/** Søk opp bedriften i registeret (Norge: Enhetsregisteret, Finland: YTJ) på navn eller org.nr. Tilgjengelig kombinasjonsboks (ARIA 1.2). */
export function BrregSok({
  id,
  valgt,
  onVelg,
  feil,
}: {
  id: string;
  valgt?: BrregTreff;
  onVelg: (t: BrregTreff | undefined) => void;
  feil?: string;
}) {
  const [q, setQ] = useState('');
  const [treff, setTreff] = useState<BrregTreff[]>([]);
  const [apen, setApen] = useState(false);
  const [aktiv, setAktiv] = useState(-1);
  const [laster, setLaster] = useState(false);
  const [nede, setNede] = useState(false);
  const liste = useId();
  const hint = useId();
  const feilId = useId();
  const status = useId();
  const input = useRef<HTMLInputElement>(null);
  const { marked, info, t } = useSprak();
  // «organisasjonsnummeret», «organisationsnummer», «Y-tunnus»
  const orgnrTekst = marked === 'no' ? 'organisasjonsnummeret' : marked === 'se' ? info.orgnr.navn.toLowerCase() : info.orgnr.navn;

  useEffect(() => {
    const sok = q.trim();
    if (sok.length < 2) return;
    const ctrl = new AbortController();
    const tid = setTimeout(async () => {
      setLaster(true);
      try {
        const r = await fetch(`/api/brreg?q=${encodeURIComponent(sok)}${marked === 'fi' ? '&m=fi' : ''}`, { signal: ctrl.signal });
        const d = (await r.json()) as { treff: BrregTreff[]; feil?: boolean };
        setTreff(d.treff);
        setNede(!!d.feil);
        setAktiv(-1);
        setApen(true);
      } catch {
        if (!ctrl.signal.aborted) setNede(true);
      } finally {
        if (!ctrl.signal.aborted) setLaster(false);
      }
    }, 250);
    return () => {
      clearTimeout(tid);
      ctrl.abort();
    };
  }, [q]);

  const nr = q.replace(/[\s-]/g, '');
  // Er registeret nede, kan man fortsatt bruke et gyldig org.nr. Vi sjekker det igjen ved innsending.
  const manuell: BrregTreff | undefined = nede && gyldigOrgnr(marked, nr) ? { orgnr: nr, navn: '', form: '', sted: '', bransje: '', nettside: '' } : undefined;
  const valg = manuell ? [manuell] : treff;

  const velg = (b: BrregTreff) => {
    onVelg(b);
    setApen(false);
    setQ('');
  };

  if (valgt)
    return (
      <div className="flex flex-col gap-1.5">
        <span className="text-[15px] font-semibold">{t('Bedriften')}</span>
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-input border-[1.5px] border-primary bg-surface-soft px-4 py-3">
          <div className="flex flex-col">
            <strong className="text-[17px]">{valgt.navn || t('Navn hentes ved innsending')}</strong>
            <span className="text-[15px] text-text-muted">
              {t('Org.nr.')} {formaterOrgnr(marked, valgt.orgnr)}
              {valgt.sted ? ` · ${valgt.sted}` : ''}
              {valgt.bransje ? ` · ${valgt.bransje}` : ''}
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              onVelg(undefined);
              requestAnimationFrame(() => document.getElementById(id)?.focus());
            }}
            className="min-h-touch px-2 text-[15px] font-semibold text-primary underline"
          >
            {t('Velg en annen bedrift')}
          </button>
        </div>
      </div>
    );

  return (
    <div className="relative flex flex-col gap-1.5">
      <label htmlFor={id} className="text-[15px] font-semibold">
        {t('Søk opp bedriften')}
      </label>
      <span id={hint} className="text-small text-text-muted">
        {t('Skriv navnet eller {orgnr}. Vi henter opplysningene fra {register}.', { orgnr: orgnrTekst, register: info.orgnr.register })}
      </span>
      <input
        ref={input}
        id={id}
        type="text"
        role="combobox"
        aria-expanded={apen && q.trim().length >= 2}
        aria-controls={liste}
        aria-autocomplete="list"
        aria-activedescendant={aktiv >= 0 ? `${liste}-${aktiv}` : undefined}
        aria-describedby={[hint, feil ? feilId : ''].filter(Boolean).join(' ')}
        aria-invalid={!!feil || undefined}
        autoComplete="off"
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          if (e.target.value.trim().length < 2) {
            setTreff([]);
            setNede(false);
          }
        }}
        onFocus={() => setApen(true)}
        onBlur={() => setTimeout(() => setApen(false), 150)}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown') {
            e.preventDefault();
            setApen(true);
            setAktiv((a) => Math.min(a + 1, valg.length - 1));
          } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setAktiv((a) => Math.max(a - 1, 0));
          } else if (e.key === 'Enter') {
            if (apen && valg[aktiv >= 0 ? aktiv : 0]) {
              e.preventDefault();
              velg(valg[aktiv >= 0 ? aktiv : 0]);
            }
          } else if (e.key === 'Escape') setApen(false);
        }}
        placeholder={marked === 'no' ? t('Bedriftsnavn eller org.nr. (ni siffer)') : t('Bedriftsnavn eller {navn}, for eksempel {eksempel}', { navn: orgnrTekst, eksempel: info.orgnr.eksempel })}
        className={`min-h-[52px] rounded-input border-[1.5px] bg-surface px-4 text-[17px] ${feil ? 'border-error' : 'border-border-input'}`}
      />
      {feil && (
        <span id={feilId} className="text-small font-semibold text-error">
          {feil}
        </span>
      )}
      <span id={status} role="status" className="sr-only">
        {q.trim().length >= 2 && !laster ? (valg.length ? t('{n} treff. Bruk piltastene for å velge.', { n: valg.length }) : t('Ingen treff.')) : ''}
      </span>
      {apen && q.trim().length >= 2 && (
        <ul id={liste} role="listbox" aria-label={t('Treff i {register}', { register: info.orgnr.register })} className="absolute left-0 right-0 top-full z-20 m-0 mt-1 max-h-[340px] list-none overflow-y-auto rounded-input border border-border bg-surface p-1 shadow-lg">
          {laster && !valg.length && <li className="px-3 py-3 text-[15px] text-text-muted">{t('Søker …')}</li>}
          {!laster && !valg.length && (
            <li className="px-3 py-3 text-[15px] text-text-muted">
              {nede
                ? marked === 'no'
                  ? t('Enhetsregisteret svarer ikke akkurat nå. Skriv organisasjonsnummeret med ni siffer.')
                  : t('{register} svarer ikke akkurat nå. Skriv {orgnr}, for eksempel {eksempel}.', { register: info.orgnr.register, orgnr: orgnrTekst, eksempel: info.orgnr.eksempel })
                : t('Ingen aktive bedrifter med det navnet eller nummeret.')}
            </li>
          )}
          {valg.map((b, i) => (
            <li
              key={b.orgnr}
              id={`${liste}-${i}`}
              role="option"
              aria-selected={i === aktiv}
              onMouseDown={(e) => {
                e.preventDefault();
                velg(b);
              }}
              onMouseEnter={() => setAktiv(i)}
              className={`flex cursor-pointer flex-col rounded-[10px] px-3 py-2.5 ${i === aktiv ? 'bg-surface-soft' : ''}`}
            >
              <span className="text-base font-semibold">{b.navn || t('Bruk org.nr. {nr}', { nr: b.orgnr })}</span>
              <span className="text-small text-text-muted">
                {formaterOrgnr(marked, b.orgnr)}
                {b.sted ? ` · ${b.sted}` : ''}
                {b.bransje ? ` · ${b.bransje}` : ''}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
