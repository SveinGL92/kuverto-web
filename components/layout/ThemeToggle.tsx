'use client';

import { useSyncExternalStore } from 'react';

type Tema = 'system' | 'light' | 'dark';
const valg: { id: Tema; navn: string }[] = [
  { id: 'system', navn: 'System' },
  { id: 'light', navn: 'Lys' },
  { id: 'dark', navn: 'Mørk' },
];

const lyttere = new Set<() => void>();
const les = (): Tema => {
  try {
    const t = localStorage.getItem('kuverto-tema');
    return t === 'light' || t === 'dark' ? t : 'system';
  } catch {
    return 'system';
  }
};
const sett = (t: Tema) => {
  try {
    if (t === 'system') localStorage.removeItem('kuverto-tema');
    else localStorage.setItem('kuverto-tema', t);
  } catch {}
  if (t === 'system') delete document.documentElement.dataset.theme;
  else document.documentElement.dataset.theme = t;
  lyttere.forEach((l) => l());
};

/** Enkel bryter for lys, mørk eller systemvalg. Lagres i nettleseren. */
export function ThemeToggle() {
  const tema = useSyncExternalStore(
    (l) => {
      lyttere.add(l);
      return () => lyttere.delete(l);
    },
    les,
    () => 'system' as Tema,
  );
  return (
    <fieldset className="m-0 flex items-center gap-1 border-0 p-0">
      <legend className="sr-only">Fargetema</legend>
      {valg.map((v) => (
        <label
          key={v.id}
          className="relative flex min-h-touch cursor-pointer items-center rounded-pill px-3 text-small font-semibold text-text-muted has-[:checked]:bg-surface-soft has-[:checked]:text-text has-[:focus-visible]:outline has-[:focus-visible]:outline-[3px] has-[:focus-visible]:outline-primary"
        >
          <input type="radio" name="tema" value={v.id} checked={tema === v.id} onChange={() => sett(v.id)} className="sr-only" />
          {v.navn}
        </label>
      ))}
    </fieldset>
  );
}
