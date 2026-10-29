import 'server-only';
import { db } from './supabase';

export interface Kommune {
  nr: string;
  navn: string;
}

/** Kommunene vi har postnummer for (Oslo og Akershus ved lansering), sortert med Oslo først. */
export async function hentKommuner(): Promise<Kommune[]> {
  const { data } = await db().from('postnummer').select('kommunenr, kommunenavn').order('kommunenavn');
  const unike = new Map<string, string>();
  for (const r of data ?? []) unike.set(r.kommunenr, r.kommunenavn);
  return [...unike.entries()].map(([nr, navn]) => ({ nr, navn })).sort((a, b) => (a.nr === '0301' ? -1 : b.nr === '0301' ? 1 : a.navn.localeCompare(b.navn, 'nb')));
}

export function dekningVisning(valgt: Kommune[]) {
  if (valgt.length <= 3) return valgt.map((k) => k.navn).join(', ');
  return `${valgt.slice(0, 2).map((k) => k.navn).join(', ')} og ${valgt.length - 2} til`;
}
