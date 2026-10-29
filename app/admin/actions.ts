'use server';

import { revalidatePath } from 'next/cache';
import { PILOT_GRATIS_KLIPP } from '@/lib/klipp';
import { mal, sendEpost } from '@/lib/server/epost';
import { db, erAdmin, innloggetEpost } from '@/lib/server/supabase';

async function kravAdmin() {
  const epost = await innloggetEpost();
  if (!(await erAdmin(epost))) throw new Error('Ikke tilgang');
}

export async function godkjennLeverandor(id: string) {
  await kravAdmin();
  const s = db();
  const { data: l, error } = await s.from('leverandorer').update({ status: 'godkjent', godkjent: new Date().toISOString() }).eq('id', id).select('navn, epost, kontaktperson').single();
  if (error) console.error('[admin] godkjenn', error.message);
  if (!l) return;
  // Gratis klipp én gang per leverandør (referansen er unik).
  await s.from('klipp_transaksjoner').upsert({ leverandor_id: id, endring: PILOT_GRATIS_KLIPP, grunn: 'gratis', referanse: `gratis:${id}` }, { onConflict: 'referanse', ignoreDuplicates: true });
  await sendEpost({
    til: l.epost,
    emne: `${l.navn} er godkjent på Kuverto`,
    html: mal({
      tittel: 'Bedriften er godkjent',
      avsnitt: [
        `Hei ${l.kontaktperson.split(' ')[0]}! ${l.navn} er godkjent som leverandør på Kuverto.`,
        `Du har fått ${PILOT_GRATIS_KLIPP} gratis klipp. Logg inn med denne e-postadressen for å se forespørsler i området ditt. Du får også e-post når nye forespørsler kommer.`,
      ],
      knapp: { tekst: 'Logg inn', sti: `/logg-inn?rolle=leverandor&epost=${encodeURIComponent(l.epost)}` },
    }),
  });
  revalidatePath('/admin');
}

export async function settLeverandorStatus(id: string, status: 'avvist' | 'suspendert' | 'venter') {
  await kravAdmin();
  await db().from('leverandorer').update({ status }).eq('id', id);
  revalidatePath('/admin');
}

export async function giKlipp(id: string, antall: number) {
  await kravAdmin();
  const n = Math.round(antall);
  if (!n || Math.abs(n) > 500) return;
  await db().from('klipp_transaksjoner').insert({ leverandor_id: id, endring: n, grunn: 'admin' });
  revalidatePath('/admin');
}

export async function settForesporselStatus(id: string, status: 'avvist' | 'aktiv' | 'lukket') {
  await kravAdmin();
  await db().from('foresporsler').update({ status }).eq('id', id);
  revalidatePath('/admin');
}
