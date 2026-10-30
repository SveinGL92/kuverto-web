import 'server-only';
import { db } from './supabase';

export interface Kommune {
  nr: string;
  navn: string;
  fylkesnr: string;
  fylke: string;
}

/** Fylkene kunder kan sende forespørsler fra nå. Leverandører kan velge dekning i hele landet. */
export const AKTIVE_FYLKER = ['03', '32'];

/** Alle kommuner i Norge med fylke, sortert alfabetisk. */
export async function hentKommuner(): Promise<Kommune[]> {
  const { data } = await db().from('kommuner').select('kommunenr, kommunenavn, fylkesnr, fylkesnavn').order('kommunenavn');
  return (data ?? []).map((r) => ({ nr: r.kommunenr, navn: r.kommunenavn, fylkesnr: r.fylkesnr, fylke: r.fylkesnavn }));
}

/** Gyldige kommuner blant de valgte numrene. */
export async function gyldigeKommuner(nr: string[]): Promise<Kommune[]> {
  const liste = [...new Set((nr ?? []).filter((x) => /^\d{4}$/.test(x)))].slice(0, 400);
  if (!liste.length) return [];
  const { data } = await db().from('kommuner').select('kommunenr, kommunenavn, fylkesnr, fylkesnavn').in('kommunenr', liste);
  return (data ?? []).map((r) => ({ nr: r.kommunenr, navn: r.kommunenavn, fylkesnr: r.fylkesnr, fylke: r.fylkesnavn }));
}

/** Kort tekst om dekningen, f.eks. «Oslo og Akershus» eller «Oslo, Bærum og 3 til». Hele fylker nevnes ved navn. */
export function dekningVisning(valgt: Kommune[], alle?: Kommune[]) {
  const deler: string[] = [];
  const perFylke = new Map<string, Kommune[]>();
  for (const k of valgt) (perFylke.get(k.fylkesnr) ?? perFylke.set(k.fylkesnr, []).get(k.fylkesnr)!).push(k);
  const fylker = [...perFylke.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  for (const [fnr, liste] of fylker) {
    const total = alle ? alle.filter((k) => k.fylkesnr === fnr).length : 0;
    if (total && liste.length === total) deler.push(liste[0].fylke);
    else deler.push(...liste.map((k) => k.navn).sort((a, b) => a.localeCompare(b, 'nb')));
  }
  if (deler.length <= 3) return deler.length > 1 ? `${deler.slice(0, -1).join(', ')} og ${deler.at(-1)}` : (deler[0] ?? '');
  return `${deler.slice(0, 2).join(', ')} og ${deler.length - 2} til`;
}
