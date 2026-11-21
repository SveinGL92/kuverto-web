import { MARKED_INFO, type Marked } from './markets';

/**
 * Organisasjonsnummer og MVA-nummer per marked (samme regler som Samtura).
 * Norge: 9 sifre, mod 11. Sverige: 10 sifre, Luhn. Danmark (CVR): 8 sifre, mod 11. Finland (Y-tunnus): 8 sifre, mod 11.
 */
export const rensOrgnr = (v: string) => String(v ?? '').replace(/\D/g, '');

const sifre = (v: string) => [...v].map(Number);

export function gyldigOrgnr(marked: Marked, raw: string): boolean {
  const v = rensOrgnr(raw);
  const d = sifre(v);
  switch (marked) {
    case 'no': {
      if (!/^\d{9}$/.test(v)) return false;
      const w = [3, 2, 7, 6, 5, 4, 3, 2];
      let r = 11 - (w.reduce((s, x, i) => s + x * d[i], 0) % 11);
      if (r === 11) r = 0;
      return r !== 10 && r === d[8];
    }
    case 'se': {
      if (!/^\d{10}$/.test(v)) return false;
      const sum = d.reduce((s, x, i) => {
        let y = i % 2 === 0 ? x * 2 : x;
        if (y > 9) y -= 9;
        return s + y;
      }, 0);
      return sum % 10 === 0;
    }
    case 'dk': {
      if (!/^\d{8}$/.test(v)) return false;
      const w = [2, 7, 6, 5, 4, 3, 2, 1];
      return w.reduce((s, x, i) => s + x * d[i], 0) % 11 === 0;
    }
    case 'fi': {
      if (!/^\d{8}$/.test(v)) return false;
      const w = [7, 9, 10, 5, 8, 4, 2];
      const r = w.reduce((s, x, i) => s + x * d[i], 0) % 11;
      if (r === 1) return false;
      return (r === 0 ? 0 : 11 - r) === d[7];
    }
  }
}

/** Visningsform: 999 552 536 · 556677-8899 · 12345678 · 1234567-8 */
export function formaterOrgnr(marked: Marked, raw: string): string {
  const v = rensOrgnr(raw);
  if (marked === 'no' && v.length === 9) return `${v.slice(0, 3)} ${v.slice(3, 6)} ${v.slice(6)}`;
  if (marked === 'se' && v.length === 10) return `${v.slice(0, 6)}-${v.slice(6)}`;
  if (marked === 'fi' && v.length === 8) return `${v.slice(0, 7)}-${v.slice(7)}`;
  return v;
}

export const rensMvaNummer = (v: string) => String(v ?? '').replace(/[^A-Za-z0-9]/g, '').toUpperCase();

/** EU-MVA-nummer (VAT ID) med riktig landskode. Norge bruker ikke dette. */
export function gyldigMvaNummer(marked: Marked, raw: string): boolean {
  const prefiks = MARKED_INFO[marked].mvaPrefiks;
  const v = rensMvaNummer(raw);
  if (!prefiks || !v.startsWith(prefiks)) return false;
  if (marked === 'se') return /^SE\d{12}$/.test(v);
  if (marked === 'dk') return /^DK\d{8}$/.test(v);
  if (marked === 'fi') return /^FI\d{8}$/.test(v);
  return false;
}

/** Vanlig MVA-nummer ut fra org.nr.: SE + nummer + 01, DK + CVR, FI + Y-tunnus uten bindestrek. */
export function foreslattMvaNummer(marked: Marked, orgnr: string): string {
  const v = rensOrgnr(orgnr);
  if (!gyldigOrgnr(marked, v)) return '';
  if (marked === 'se') return `SE${v}01`;
  if (marked === 'dk') return `DK${v}`;
  if (marked === 'fi') return `FI${v}`;
  return '';
}

/** Telefonnummer: 7–15 sifre, eventuelt med landskode. */
export function gyldigTelefon(raw: string): boolean {
  const x = String(raw ?? '').replace(/[^\d+]/g, '');
  return /^\+?\d{7,15}$/.test(x);
}
