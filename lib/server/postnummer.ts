import 'server-only';
import { json } from 'postnummer';
import { db } from './supabase';

export interface Postnummer {
  postnummer: string;
  poststed: string;
  kommunenr: string;
  kommunenavn: string;
  fylkesnr: string;
}

const storForbokstav = (s: string) =>
  s
    .toLowerCase()
    .replace(/(^|[\s\-/(])(\p{L})/gu, (_, a, b) => a + b.toUpperCase())
    .replace(/ (I|På|Og|Ved|Av)( |$)/g, (_, a, b) => ` ${a.toLowerCase()}${b}`);

/**
 * Slår opp et postnummer i hele Norge. Tabellen public.postnummer fylles på etter hvert som postnumre brukes,
 * med data fra Postens register (npm-pakken «postnummer») og kommunenavn fra public.kommuner.
 */
export async function finnPostnummer(nr: string): Promise<Postnummer | null> {
  if (!/^\d{4}$/.test(nr)) return null;
  const s = db();
  const { data: finnes } = await s.from('postnummer').select('postnummer, poststed, kommunenr, kommunenavn, fylkesnr').eq('postnummer', nr).maybeSingle();
  if (finnes) return finnes as Postnummer;
  const j = json(nr);
  if (!j?.kommunenummer) return null;
  const { data: k } = await s.from('kommuner').select('kommunenr, kommunenavn, fylkesnr').eq('kommunenr', j.kommunenummer).maybeSingle();
  if (!k) return null; // Svalbard, Jan Mayen og utgåtte kommunenumre
  const rad = { postnummer: nr, poststed: storForbokstav(j.poststed), kommunenr: k.kommunenr, kommunenavn: k.kommunenavn };
  await s.from('postnummer').upsert(rad, { onConflict: 'postnummer', ignoreDuplicates: true });
  return { ...rad, fylkesnr: k.fylkesnr };
}

/** Antall godkjente leverandører som leverer i kommunen. */
export async function leverandorerIKommune(kommunenr: string): Promise<number> {
  const s = db();
  const { data: d } = await s.from('dekning').select('leverandor_id').eq('kommunenr', kommunenr);
  const ider = (d ?? []).map((x) => x.leverandor_id);
  if (!ider.length) return 0;
  const { count } = await s.from('leverandorer').select('id', { count: 'exact', head: true }).in('id', ider).eq('status', 'godkjent');
  return count ?? 0;
}
