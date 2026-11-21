import { redirect } from 'next/navigation';
import { erMarked, medPrefiks, type Marked } from '@/lib/markets';
import { aktivtMarked } from '@/lib/server/marked';
import { db, erAdmin, innloggetEpost } from '@/lib/server/supabase';

// Sender innlogget bruker til riktig side ut fra rolle, på riktig landside.
export default async function MinSide() {
  const marked = await aktivtMarked();
  const epost = await innloggetEpost();
  if (!epost) redirect(medPrefiks(marked, '/logg-inn'));
  if (await erAdmin(epost)) redirect('/admin');
  const s = db();
  const { data: lev } = await s.from('leverandorer').select('id, marked').eq('epost', epost).maybeSingle();
  // Leverandøren hører til ett marked.
  if (lev) redirect(medPrefiks(erMarked(lev.marked) ? lev.marked : marked, '/leverandor'));
  // Kunden: valgt land (fra adressen eller cookien). Uten valgt land (f.eks. lenken åpnet i en annen nettleser) brukes landet for siste forespørsel.
  let kundeMarked: Marked = marked;
  if (marked === 'no') {
    const { data: siste } = await s.from('foresporsler').select('marked').eq('kunde_epost', epost).order('opprettet', { ascending: false }).limit(1).maybeSingle();
    const m = siste?.marked;
    if (erMarked(m)) kundeMarked = m;
  }
  redirect(medPrefiks(kundeMarked, '/mine-foresporsler'));
}
