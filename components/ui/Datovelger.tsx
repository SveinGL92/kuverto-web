'use client';

import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { cn } from '@/lib/cn';
import { feltKlasse } from './Input';

/**
 * Datovelger i Kuvertos profil: tekstfelt (dd.mm.åååå) med en kalender i en dialog.
 * Følger APG-mønsteret «Date Picker Dialog»: piltaster flytter dag, Page Up/Down måned, Home/End uke, Esc lukker.
 */
const MANEDER = ['januar', 'februar', 'mars', 'april', 'mai', 'juni', 'juli', 'august', 'september', 'oktober', 'november', 'desember'];
const UKEDAGER = [
  ['ma', 'mandag'],
  ['ti', 'tirsdag'],
  ['on', 'onsdag'],
  ['to', 'torsdag'],
  ['fr', 'fredag'],
  ['lø', 'lørdag'],
  ['sø', 'søndag'],
];

const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const fraIso = (s: string) => {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
};
const visning = (s: string) => (s ? s.split('-').reverse().join('.') : '');
const langTekst = (s: string) => {
  const t = fraIso(s).toLocaleDateString('nb-NO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  return t.charAt(0).toUpperCase() + t.slice(1);
};
const leggTil = (d: Date, dager: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + dager);
const leggTilMnd = (d: Date, mnd: number) => {
  const ny = new Date(d.getFullYear(), d.getMonth() + mnd, 1);
  const sist = new Date(ny.getFullYear(), ny.getMonth() + 1, 0).getDate();
  return new Date(ny.getFullYear(), ny.getMonth(), Math.min(d.getDate(), sist));
};

/** «13.11.2026», «13.11.26», «13/11» og «13 11 2026» blir til 2026-11-13. */
function tolk(tekst: string): string | undefined {
  const m = tekst.trim().match(/^(\d{1,2})[./\s-](\d{1,2})(?:[./\s-](\d{2}|\d{4}))?$/);
  if (!m) return undefined;
  const dag = Number(m[1]);
  const mnd = Number(m[2]);
  const naa = new Date();
  let ar = m[3] ? Number(m[3]) : naa.getFullYear();
  if (ar < 100) ar += 2000;
  const d = new Date(ar, mnd - 1, dag);
  if (d.getMonth() !== mnd - 1 || d.getDate() !== dag) return undefined;
  // Uten årstall: velg neste gang datoen kommer.
  if (!m[3] && iso(d) < iso(naa)) d.setFullYear(ar + 1);
  return iso(d);
}

export function Datovelger({
  id,
  label,
  value,
  onChange,
  min,
  feil,
  required,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  min?: string;
  feil?: string;
  required?: boolean;
}) {
  const [tekst, setTekst] = useState(visning(value));
  const [apen, setApen] = useState(false);
  const [fokus, setFokus] = useState<Date>(() => (value ? fraIso(value) : min ? fraIso(min) : new Date()));
  const knapp = useRef<HTMLButtonElement>(null);
  const dialog = useRef<HTMLDivElement>(null);
  const grid = useRef<HTMLTableElement>(null);
  const hintId = useId();
  const feilId = useId();
  const tittelId = useId();
  const forrigeVerdi = useRef(value);

  // Hold tekstfeltet i takt når verdien endres utenfra (f.eks. gjenopprettet utkast).
  useEffect(() => {
    if (value !== forrigeVerdi.current) {
      forrigeVerdi.current = value;
      setTekst(visning(value));
    }
  }, [value]);

  useEffect(() => {
    if (!apen) return;
    const lukkUtenfor = (e: MouseEvent) => {
      if (!dialog.current?.contains(e.target as Node) && !knapp.current?.contains(e.target as Node)) setApen(false);
    };
    document.addEventListener('mousedown', lukkUtenfor);
    return () => document.removeEventListener('mousedown', lukkUtenfor);
  }, [apen]);

  // Flytt fokus til den aktive dagen når kalenderen åpnes eller dagen endres.
  useEffect(() => {
    if (apen) grid.current?.querySelector<HTMLButtonElement>(`[data-dato="${iso(fokus)}"]`)?.focus();
  }, [apen, fokus]);

  const settVerdi = (v: string) => {
    forrigeVerdi.current = v;
    onChange(v);
  };
  const forTidlig = (d: Date) => !!min && iso(d) < min;

  const apne = () => {
    setFokus(value ? fraIso(value) : min ? fraIso(min) : new Date());
    setApen(true);
  };
  const lukk = () => {
    setApen(false);
    knapp.current?.focus();
  };
  const velg = (d: Date) => {
    if (forTidlig(d)) return;
    const v = iso(d);
    setTekst(visning(v));
    settVerdi(v);
    lukk();
  };

  const tast = (e: KeyboardEvent) => {
    const flytt: Record<string, () => Date> = {
      ArrowLeft: () => leggTil(fokus, -1),
      ArrowRight: () => leggTil(fokus, 1),
      ArrowUp: () => leggTil(fokus, -7),
      ArrowDown: () => leggTil(fokus, 7),
      Home: () => leggTil(fokus, -((fokus.getDay() + 6) % 7)),
      End: () => leggTil(fokus, 6 - ((fokus.getDay() + 6) % 7)),
      PageUp: () => leggTilMnd(fokus, e.shiftKey ? -12 : -1),
      PageDown: () => leggTilMnd(fokus, e.shiftKey ? 12 : 1),
    };
    if (flytt[e.key]) {
      e.preventDefault();
      setFokus(flytt[e.key]());
    } else if (e.key === 'Escape') {
      e.preventDefault();
      lukk();
    }
  };

  // Kalenderuker for måneden som vises, mandag først.
  const forste = new Date(fokus.getFullYear(), fokus.getMonth(), 1);
  const start = leggTil(forste, -((forste.getDay() + 6) % 7));
  const uker = Array.from({ length: 6 }, (_, u) => Array.from({ length: 7 }, (_, d) => leggTil(start, u * 7 + d))).filter(
    (uke, i) => i < 4 || uke.some((d) => d.getMonth() === fokus.getMonth()),
  );
  const iDag = iso(new Date());
  const kanTilbake = !min || iso(new Date(fokus.getFullYear(), fokus.getMonth(), 0)) >= min;

  const pil = (retning: -1 | 1) => (
    <button
      type="button"
      onClick={() => setFokus(leggTilMnd(fokus, retning))}
      disabled={retning === -1 && !kanTilbake}
      aria-label={retning === -1 ? 'Forrige måned' : 'Neste måned'}
      className="flex h-11 w-11 items-center justify-center rounded-pill text-text hover:bg-surface-soft disabled:opacity-30"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d={retning === -1 ? 'M15 5l-7 7 7 7' : 'M9 5l7 7-7 7'} />
      </svg>
    </button>
  );

  return (
    <div className="relative flex flex-col gap-1.5">
      <label htmlFor={id} className="text-[15px] font-semibold">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          placeholder="dd.mm.åååå"
          value={tekst}
          required={required}
          aria-invalid={feil ? true : undefined}
          aria-describedby={[hintId, feil ? feilId : ''].filter(Boolean).join(' ')}
          onChange={(e) => {
            setTekst(e.target.value);
            const v = tolk(e.target.value);
            if (v && e.target.value.length >= 8) settVerdi(v);
            else if (!e.target.value.trim()) settVerdi('');
          }}
          onBlur={() => {
            const v = tolk(tekst);
            if (v) {
              setTekst(visning(v));
              settVerdi(v);
            } else if (tekst.trim()) settVerdi('');
          }}
          className={cn(feltKlasse(!!feil), 'pr-14')}
        />
        <button
          ref={knapp}
          type="button"
          onClick={() => (apen ? setApen(false) : apne())}
          aria-haspopup="dialog"
          aria-expanded={apen}
          aria-label={value ? `Velg dato i kalender. Valgt: ${langTekst(value)}` : 'Velg dato i kalender'}
          className="absolute right-1.5 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-pill text-primary hover:bg-surface-soft"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="3.5" y="5" width="17" height="15.5" rx="3" />
            <path d="M3.5 10h17M8 3v4M16 3v4" />
          </svg>
        </button>
      </div>
      <span id={hintId} className="text-small font-medium text-text-muted">
        {value ? langTekst(value) : 'Skriv datoen eller velg i kalenderen.'}
      </span>
      {feil && (
        <span id={feilId} className="text-small font-semibold text-error">
          {feil}
        </span>
      )}

      {apen && (
        <div
          ref={dialog}
          role="dialog"
          aria-modal="false"
          aria-labelledby={tittelId}
          onKeyDown={tast}
          className="absolute left-0 top-[84px] z-30 w-[min(340px,calc(100vw-32px))] rounded-card border border-border bg-surface p-3 shadow-float"
        >
          <div className="flex items-center justify-between gap-2 pb-2">
            {pil(-1)}
            <h2 id={tittelId} aria-live="polite" className="m-0 font-display text-[19px] font-extrabold tracking-[-0.02em]">
              {MANEDER[fokus.getMonth()].charAt(0).toUpperCase() + MANEDER[fokus.getMonth()].slice(1)} {fokus.getFullYear()}
            </h2>
            {pil(1)}
          </div>
          <table ref={grid} role="grid" aria-labelledby={tittelId} className="w-full border-collapse">
            <thead>
              <tr>
                {UKEDAGER.map(([kort, lang]) => (
                  <th key={kort} scope="col" abbr={lang} className="pb-1 text-center text-small font-semibold text-text-muted">
                    {kort}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {uker.map((uke, i) => (
                <tr key={i}>
                  {uke.map((d) => {
                    const v = iso(d);
                    const annenMnd = d.getMonth() !== fokus.getMonth();
                    const valgt = v === value;
                    const aktiv = v === iso(fokus);
                    const sperret = forTidlig(d);
                    return (
                      <td key={v} aria-selected={valgt || undefined} className="p-0.5 text-center">
                        <button
                          type="button"
                          data-dato={v}
                          tabIndex={aktiv ? 0 : -1}
                          aria-disabled={sperret || undefined}
                          aria-current={v === iDag ? 'date' : undefined}
                          aria-label={langTekst(v)}
                          onClick={() => velg(d)}
                          className={cn(
                            'k-num h-11 w-full rounded-pill text-base font-semibold outline-offset-2',
                            valgt ? 'bg-primary text-primary-on' : 'hover:bg-surface-soft',
                            !valgt && v === iDag && 'ring-[1.5px] ring-inset ring-primary',
                            annenMnd && !valgt && 'text-text-muted',
                            sperret && 'cursor-not-allowed text-text-muted line-through opacity-50 hover:bg-transparent',
                          )}
                        >
                          {d.getDate()}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex justify-between gap-2 pt-2">
            <button
              type="button"
              onClick={() => velg(new Date())}
              disabled={forTidlig(new Date())}
              className="min-h-touch rounded-pill px-3 text-[15px] font-semibold text-primary underline-offset-4 hover:underline disabled:opacity-40"
            >
              I dag
            </button>
            <button type="button" onClick={lukk} className="min-h-touch rounded-pill px-3 text-[15px] font-semibold text-text hover:bg-surface-soft">
              Lukk
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
