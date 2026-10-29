import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { tilForesporsel, tilTilbud } from '@/lib/server/data';
import { db, erAdmin, innloggetEpost } from '@/lib/server/supabase';
import { TilbudSide } from './TilbudSide';

export const metadata: Metadata = { title: 'Tilbud', robots: { index: false } };
export const dynamic = 'force-dynamic';

export default async function Side({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const epost = await innloggetEpost();
  if (!epost) redirect(`/logg-inn`);
  const s = db();
  const { data: f } = await s.from('foresporsler').select('*').eq('id', id).maybeSingle();
  if (!f || (f.kunde_epost !== epost && !(await erAdmin(epost)))) notFound();
  const { data: rader } = await s.from('tilbud').select('*').eq('foresporsel_id', id).neq('status', 'trukket').order('opprettet');
  const levIder = [...new Set((rader ?? []).map((t) => t.leverandor_id))];
  const { data: lev } = levIder.length ? await s.from('leverandorer').select('id, navn, beskrivelse').in('id', levIder) : { data: [] };
  const tilbud = (rader ?? []).map((t, i) => tilTilbud(t, lev?.find((l) => l.id === t.leverandor_id) ?? { navn: 'Leverandør' }, i));
  return <TilbudSide foresporsel={tilForesporsel(f)} tilbud={tilbud} />;
}
