import 'server-only';
import postnumre from './postnumre.json';
import { MARKED_INFO, type Marked } from '@/lib/markets';
import { lagreKommuner, stedsdata } from './kommuner';
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
 * med data fra Postens register (lib/server/postnumre.json, hentet fra npm-pakken «postnummer») og kommunenavn fra public.kommuner.
 */
export async function finnPostnummer(nr: string, marked: Marked = 'no'): Promise<Postnummer | null> {
  nr = String(nr ?? '').replace(/\s/g, '');
  if (!new RegExp(`^\\d{${MARKED_INFO[marked].postnummerLengde}}$`).test(nr)) return null;
  const s = db();
  const { data: finnes } = await s.from('postnummer').select('postnummer, poststed, kommunenr, kommunenavn, fylkesnr').eq('marked', marked).eq('postnummer', nr).maybeSingle();
  if (finnes) return finnes as Postnummer;
  if (marked !== 'no') {
    const d = await stedsdata(marked);
    const p = d.postnummer[nr];
    const k = p && d.kommuner.find((x) => x.nr === p[0]);
    if (!p || !k) return null;
    await lagreKommuner(marked, [k]);
    const rad = { marked, postnummer: nr, poststed: p[1], kommunenr: k.nr, kommunenavn: k.navn, fylkesnr: k.fylkesnr };
    await s.from('postnummer').upsert(rad, { onConflict: 'marked,postnummer', ignoreDuplicates: true });
    return { postnummer: nr, poststed: p[1], kommunenr: k.nr, kommunenavn: k.navn, fylkesnr: k.fylkesnr };
  }
  const treff = (postnumre as unknown as Record<string, [string, string]>)[nr];
  if (!treff) return null;
  const j = { kommunenummer: treff[0], poststed: treff[1] };
  const { data: k } = await s.from('kommuner').select('kommunenr, kommunenavn, fylkesnr').eq('kommunenr', j.kommunenummer).maybeSingle();
  if (!k) return null; // Svalbard, Jan Mayen og utgåtte kommunenumre
  const rad = { marked: 'no', postnummer: nr, poststed: storForbokstav(j.poststed), kommunenr: k.kommunenr, kommunenavn: k.kommunenavn, fylkesnr: k.kommunenr.slice(0, 2) };
  await s.from('postnummer').upsert(rad, { onConflict: 'marked,postnummer', ignoreDuplicates: true });
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
