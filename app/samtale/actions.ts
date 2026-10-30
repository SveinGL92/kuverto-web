'use server';

import { anledningNavn } from '@/lib/labels';
import { mal, sendEpost } from '@/lib/server/epost';
import { db, innloggetEpost } from '@/lib/server/supabase';
import type { Anledning } from '@/lib/types';

export interface ChatMelding {
  id: string;
  fra: 'kunde' | 'leverandor';
  tekst: string;
  opprettet: string;
  lest: boolean;
}

export type SamtaleSvar =
  | { ok: true; meg: 'kunde' | 'leverandor'; motpart: string; meldinger: ChatMelding[]; kanSende: boolean; grunn?: string }
  | { ok: false; feil: string };

/** Finner ut om innlogget bruker er kunden eller leverandøren i samtalen, og om samtalen finnes. */
async function tilgang(foresporselId: string, leverandorId?: string | null) {
  if (!/^[0-9a-f-]{36}$/.test(foresporselId)) return null;
  const epost = await innloggetEpost();
  if (!epost) return null;
  const s = db();
  const { data: f } = await s.from('foresporsler').select('id, kunde_epost, status, anledning, gjester').eq('id', foresporselId).maybeSingle();
  if (!f) return null;
  let meg: 'kunde' | 'leverandor';
  let levId: string;
  if (f.kunde_epost === epost) {
    if (!leverandorId || !/^[0-9a-f-]{36}$/.test(leverandorId)) return null;
    meg = 'kunde';
    levId = leverandorId;
  } else {
    const { data: l } = await s.from('leverandorer').select('id, status').eq('epost', epost).maybeSingle();
    if (!l || l.status !== 'godkjent') return null;
    meg = 'leverandor';
    levId = l.id;
  }
  const [{ data: oppl }, { data: lev }, { data: t }, { data: k }] = await Promise.all([
    s.from('opplasinger').select('status').eq('foresporsel_id', f.id).eq('leverandor_id', levId).maybeSingle(),
    s.from('leverandorer').select('id, navn, epost').eq('id', levId).maybeSingle(),
    s.from('tilbud').select('status').eq('foresporsel_id', f.id).eq('leverandor_id', levId).maybeSingle(),
    s.from('foresporsel_kontakt').select('navn').eq('foresporsel_id', f.id).maybeSingle(),
  ]);
  if (!oppl || oppl.status !== 'aktiv' || !lev) return null;
  const kanSende = f.status === 'aktiv' || t?.status === 'godtatt';
  const grunn = kanSende ? undefined : 'Forespørselen er avsluttet, så samtalen er lukket.';
  return { s, f, lev, meg, kanSende, grunn, kundeNavn: k?.navn ?? 'Kunden' };
}

export async function hentSamtale(foresporselId: string, leverandorId?: string | null): Promise<SamtaleSvar> {
  const a = await tilgang(foresporselId, leverandorId);
  if (!a) return { ok: false, feil: 'Fant ikke samtalen.' };
  const { s, f, lev, meg } = a;
  const { data } = await s
    .from('meldinger')
    .select('id, fra, tekst, opprettet, lest')
    .eq('foresporsel_id', f.id)
    .eq('leverandor_id', lev.id)
    .order('opprettet')
    .limit(500);
  // Det motparten har skrevet, er nå lest.
  if ((data ?? []).some((m) => m.fra !== meg && !m.lest))
    await s.from('meldinger').update({ lest: new Date().toISOString() }).eq('foresporsel_id', f.id).eq('leverandor_id', lev.id).neq('fra', meg).is('lest', null);
  return {
    ok: true,
    meg,
    motpart: meg === 'kunde' ? lev.navn : a.kundeNavn,
    kanSende: a.kanSende,
    grunn: a.grunn,
    meldinger: (data ?? []).map((m) => ({ id: m.id, fra: m.fra, tekst: m.tekst, opprettet: m.opprettet, lest: !!m.lest })),
  };
}

export async function sendChatMelding(foresporselId: string, leverandorId: string | null, tekst: string): Promise<{ ok: true; melding: ChatMelding } | { ok: false; feil: string }> {
  const a = await tilgang(foresporselId, leverandorId);
  if (!a) return { ok: false, feil: 'Fant ikke samtalen.' };
  const { s, f, lev, meg } = a;
  if (!a.kanSende) return { ok: false, feil: a.grunn ?? 'Samtalen er lukket.' };
  const t = String(tekst ?? '').trim().slice(0, 2000);
  if (!t) return { ok: false, feil: 'Skriv en melding.' };

  const tiMin = new Date(Date.now() - 10 * 60_000).toISOString();
  const { count } = await s.from('meldinger').select('id', { count: 'exact', head: true }).eq('foresporsel_id', f.id).eq('leverandor_id', lev.id).eq('fra', meg).gte('opprettet', tiMin);
  if ((count ?? 0) >= 30) return { ok: false, feil: 'Du har sendt mange meldinger på kort tid. Vent litt.' };

  // Varsle på e-post, men ikke for hver melding: hopp over hvis motparten allerede har en ulest melding fra deg fra den siste halvtimen.
  const halvtime = new Date(Date.now() - 30 * 60_000).toISOString();
  const { count: uleste } = await s
    .from('meldinger')
    .select('id', { count: 'exact', head: true })
    .eq('foresporsel_id', f.id)
    .eq('leverandor_id', lev.id)
    .eq('fra', meg)
    .is('lest', null)
    .gte('opprettet', halvtime);

  const { data: ny, error } = await s.from('meldinger').insert({ foresporsel_id: f.id, leverandor_id: lev.id, fra: meg, tekst: t }).select('id, fra, tekst, opprettet').single();
  if (error || !ny) {
    console.error('[chat]', error);
    return { ok: false, feil: 'Meldingen ble ikke sendt. Prøv igjen.' };
  }

  if (!uleste) {
    const hva = `${anledningNavn(f.anledning as Anledning).toLowerCase()} for ${f.gjester} gjester`;
    const avsender = meg === 'kunde' ? a.kundeNavn : lev.navn;
    await sendEpost({
      til: meg === 'kunde' ? lev.epost : f.kunde_epost,
      emne: `Ny melding fra ${avsender} på Kuverto`,
      html: mal({
        tittel: `Ny melding fra ${avsender}`,
        avsnitt: [`Om ${hva}:`, t.length > 400 ? `${t.slice(0, 400)} …` : t, 'Trykk på knappen for å svare. Da holdes hele samtalen samlet på Kuverto.'],
        knapp: { tekst: 'Svar på Kuverto', sti: meg === 'kunde' ? `/leverandor?samtale=${f.id}` : `/foresporsler/${f.id}?samtale=${lev.id}` },
        fot: 'Du får bare én e-post selv om det kommer flere meldinger, til du har lest dem.',
      }),
    });
  }
  return { ok: true, melding: { id: ny.id, fra: ny.fra, tekst: ny.tekst, opprettet: ny.opprettet, lest: false } };
}
