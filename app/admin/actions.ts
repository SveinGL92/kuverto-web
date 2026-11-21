'use server';

import { revalidatePath } from 'next/cache';
import { tFor } from '@/lib/i18n';
import { PILOT_GRATIS_KLIPP, REFUSJON_ETTER_DAGER } from '@/lib/klipp';
import { erMarked } from '@/lib/markets';
import { mal, sendEpost } from '@/lib/server/epost';
import { db, erAdmin, innloggetEpost } from '@/lib/server/supabase';
import { varsleOmForesporsel } from '@/lib/server/varsle';

async function kravAdmin() {
  const epost = await innloggetEpost();
  if (!(await erAdmin(epost))) throw new Error('Ikke tilgang');
}

export async function godkjennLeverandor(id: string) {
  await kravAdmin();
  const s = db();
  const { data: l, error } = await s.from('leverandorer').update({ status: 'godkjent', godkjent: new Date().toISOString() }).eq('id', id).select('navn, epost, kontaktperson, marked').single();
  if (error) console.error('[admin] godkjenn', error.message);
  if (!l) return;
  // Gratis klipp én gang per leverandør (referansen er unik).
  await s.from('klipp_transaksjoner').upsert({ leverandor_id: id, endring: PILOT_GRATIS_KLIPP, grunn: 'gratis', referanse: `gratis:${id}` }, { onConflict: 'referanse', ignoreDuplicates: true });
  // E-posten går på leverandørens språk, med lenke til riktig land.
  const marked = erMarked(l.marked) ? l.marked : 'no';
  const t = tFor(marked);
  await sendEpost({
    til: l.epost,
    emne: t('{navn} er godkjent på Kuverto', { navn: l.navn }),
    html: mal({
      tittel: t('Bedriften er godkjent'),
      avsnitt: [
        t('Hei {fornavn}! {navn} er godkjent som leverandør på Kuverto.', { fornavn: l.kontaktperson.split(' ')[0], navn: l.navn }),
        t('Du har fått {antall} gratis klipp. Logg inn med denne e-postadressen for å se forespørsler i området ditt. Du får også e-post når nye forespørsler kommer.', { antall: PILOT_GRATIS_KLIPP }),
        t('Du får klippene tilbake hvis kunden trekker forespørselen, eller ikke svarer innen {dager} dager etter at du sendte tilbudet.', { dager: REFUSJON_ETTER_DAGER }),
      ],
      knapp: { tekst: t('Logg inn'), sti: `/logg-inn?rolle=leverandor&epost=${encodeURIComponent(l.epost)}` },
      marked,
    }),
  });
  revalidatePath('/admin', 'layout');
}

export async function settLeverandorStatus(id: string, status: 'avvist' | 'suspendert' | 'venter') {
  await kravAdmin();
  await db().from('leverandorer').update({ status }).eq('id', id);
  revalidatePath('/admin', 'layout');
}

export async function giKlipp(id: string, antall: number) {
  await kravAdmin();
  const n = Math.round(antall);
  if (!n || Math.abs(n) > 500) return;
  await db().from('klipp_transaksjoner').insert({ leverandor_id: id, endring: n, grunn: 'admin' });
  revalidatePath('/admin', 'layout');
}

export async function settForesporselStatus(id: string, status: 'avvist' | 'aktiv' | 'lukket') {
  await kravAdmin();
  await db().from('foresporsler').update({ status }).eq('id', id);
  // Stopper Kuverto forespørselen, får leverandørene som har låst opp, klippene tilbake.
  if (status === 'avvist') await db().rpc('refunder_opplasinger', { p_foresporsel: id });
  revalidatePath('/admin', 'layout');
}

/** Gir eller trekker klipp med valgfritt antall fra et skjema. */
export async function justerKlipp(id: string, data: FormData) {
  await kravAdmin();
  const n = Math.round(Number(data.get('antall')));
  if (!n || Math.abs(n) > 1000) return;
  await db().from('klipp_transaksjoner').insert({ leverandor_id: id, endring: n, grunn: 'admin' });
  revalidatePath('/admin', 'layout');
}

/** Aktiverer en forespørsel som venter på kundens bekreftelse, og varsler leverandørene. */
export async function bekreftForKunde(id: string) {
  await kravAdmin();
  const { data } = await db().from('foresporsler').update({ status: 'aktiv', bekreft_token: null }).eq('id', id).eq('status', 'venter_bekreftelse').select('id');
  if (data?.length) await varsleOmForesporsel(id);
  revalidatePath('/admin', 'layout');
}
