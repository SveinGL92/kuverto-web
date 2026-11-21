import 'server-only';
import type { Marked } from '@/lib/markets';
import { db } from './supabase';

export interface Kommune {
  nr: string;
  navn: string;
  fylkesnr: string;
  fylke: string;
}

/** Stedsdata for Sverige, Danmark og Finland (GeoNames, CC BY 4.0), lastet ved behov. */
export interface Stedsdata {
  kommuner: Kommune[];
  postnummer: Record<string, [string, string]>;
}
const cache = new Map<Marked, Stedsdata>();
export async function stedsdata(marked: Exclude<Marked, 'no'>): Promise<Stedsdata> {
  const fra = cache.get(marked);
  if (fra) return fra;
  const d = (marked === 'se' ? await import('./steder/se.json') : marked === 'dk' ? await import('./steder/dk.json') : await import('./steder/fi.json')).default as unknown as Stedsdata;
  cache.set(marked, d);
  return d;
}

/** Alle kommuner i markedet med fylke/län/region/maakunta, sortert alfabetisk. */
export async function hentKommuner(marked: Marked = 'no'): Promise<Kommune[]> {
  if (marked !== 'no') return (await stedsdata(marked)).kommuner;
  const { data } = await db().from('kommuner').select('kommunenr, kommunenavn, fylkesnr, fylkesnavn').eq('marked', 'no').order('kommunenavn');
  return (data ?? []).map((r) => ({ nr: r.kommunenr, navn: r.kommunenavn, fylkesnr: r.fylkesnr, fylke: r.fylkesnavn }));
}

/** Legger utenlandske kommuner inn i public.kommuner, så admin og oppslag finner navnene. */
export async function lagreKommuner(marked: Marked, liste: Kommune[]) {
  if (marked === 'no' || !liste.length) return;
  await db()
    .from('kommuner')
    .upsert(liste.map((k) => ({ kommunenr: k.nr, kommunenavn: k.navn, fylkesnr: k.fylkesnr, fylkesnavn: k.fylke, marked })), { onConflict: 'kommunenr', ignoreDuplicates: true });
}

/** Gyldige kommuner blant de valgte numrene, i riktig marked. */
export async function gyldigeKommuner(nr: string[], marked: Marked = 'no'): Promise<Kommune[]> {
  const liste = [...new Set((nr ?? []).filter((x) => typeof x === 'string'))].slice(0, 400);
  if (!liste.length) return [];
  if (marked !== 'no') {
    const valgt = (await stedsdata(marked)).kommuner.filter((k) => liste.includes(k.nr));
    await lagreKommuner(marked, valgt);
    return valgt;
  }
  const { data } = await db().from('kommuner').select('kommunenr, kommunenavn, fylkesnr, fylkesnavn').eq('marked', 'no').in('kommunenr', liste.filter((x) => /^\d{4}$/.test(x)));
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
