import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { signerVedlegg, tilForesporsel, tilTilbud } from '@/lib/server/data';
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
  const { data: k } = await s.from('foresporsel_kontakt').select('adresse').eq('foresporsel_id', id).maybeSingle();
  const { data: rader } = await s.from('tilbud').select('*').eq('foresporsel_id', id).neq('status', 'trukket').order('opprettet');
  const levIder = [...new Set((rader ?? []).map((t) => t.leverandor_id))];
  const { data: lev } = levIder.length ? await s.from('leverandorer').select('id, navn, beskrivelse').in('id', levIder) : { data: [] };
  const lenker = await signerVedlegg(rader ?? []);
  // Samtaler med leverandører, også de som ikke har sendt tilbud ennå.
  const { data: ms } = await s.from('meldinger').select('leverandor_id, fra, tekst, opprettet, lest').eq('foresporsel_id', id).order('opprettet');
  const samtaleIder = [...new Set((ms ?? []).map((m) => m.leverandor_id))];
  const manglerNavn = samtaleIder.filter((x) => !lev?.some((l) => l.id === x));
  const { data: flere } = manglerNavn.length ? await s.from('leverandorer').select('id, navn').in('id', manglerNavn) : { data: [] };
  const navnPa = (lid: string) => lev?.find((l) => l.id === lid)?.navn ?? flere?.find((l) => l.id === lid)?.navn ?? 'Leverandør';
  const samtaler = samtaleIder.map((lid) => {
    const egne = (ms ?? []).filter((m) => m.leverandor_id === lid);
    const sist = egne.at(-1);
    return {
      leverandorId: lid,
      navn: navnPa(lid),
      antall: egne.length,
      uleste: egne.filter((m) => m.fra === 'leverandor' && !m.lest).length,
      sist: sist ? { tekst: sist.tekst, fra: sist.fra, opprettet: sist.opprettet } : undefined,
    };
  });
  const tilbud = (rader ?? []).map((t, i) => tilTilbud(t, lev?.find((l) => l.id === t.leverandor_id) ?? { navn: 'Leverandør' }, i, lenker));
  return <TilbudSide foresporsel={tilForesporsel(f)} tilbud={tilbud} adresse={k?.adresse ?? undefined} samtaler={samtaler} />;
}
