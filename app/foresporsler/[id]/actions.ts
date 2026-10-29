'use server';

import { revalidatePath } from 'next/cache';
import { anledningNavn } from '@/lib/labels';
import { mal, sendEpost } from '@/lib/server/epost';
import { db, innloggetEpost } from '@/lib/server/supabase';
import type { Anledning } from '@/lib/types';

type Svar = { ok: true } | { ok: false; feil: string };

/** Henter tilbudet og sjekker at forespørselen tilhører innlogget kunde. */
async function eget(tilbudId: string) {
  const epost = await innloggetEpost();
  if (!epost) return null;
  const s = db();
  const { data: t } = await s.from('tilbud').select('id, status, foresporsel_id, leverandor_id').eq('id', tilbudId).maybeSingle();
  if (!t) return null;
  const { data: f } = await s.from('foresporsler').select('id, kunde_epost, status, anledning, gjester').eq('id', t.foresporsel_id).single();
  if (!f || f.kunde_epost !== epost) return null;
  const { data: l } = await s.from('leverandorer').select('navn, epost').eq('id', t.leverandor_id).single();
  return { epost, t, f, l: l! };
}

const VELG_FEIL: Record<string, string> = {
  ikke_aktiv: 'Forespørselen er allerede tildelt eller lukket.',
  ikke_gyldig: 'Tilbudet kan ikke velges lenger.',
  utlopt: 'Tilbudet har gått ut. Send leverandøren et spørsmål om et nytt.',
};

export async function velgTilbud(tilbudId: string, adresse: string): Promise<Svar> {
  const e = await eget(tilbudId);
  if (!e) return { ok: false, feil: 'Fant ikke tilbudet.' };
  const s = db();
  const { data, error } = await s.rpc('velg_tilbud', { p_tilbud: tilbudId, p_epost: e.epost, p_adresse: String(adresse ?? '').slice(0, 300) });
  if (error) {
    console.error('[velg]', error);
    return { ok: false, feil: 'Noe gikk galt. Prøv igjen.' };
  }
  if (data !== 'ok') return { ok: false, feil: VELG_FEIL[data as string] ?? 'Kunne ikke velge tilbudet.' };

  const { data: k } = await s.from('foresporsel_kontakt').select('navn, epost, telefon, adresse').eq('foresporsel_id', e.f.id).single();
  const hva = `${anledningNavn(e.f.anledning as Anledning).toLowerCase()} for ${e.f.gjester} gjester`;
  await sendEpost({
    til: e.l.epost,
    svarTil: e.epost,
    emne: `Du har vunnet oppdraget: ${hva}`,
    html: mal({
      tittel: 'Kunden har valgt tilbudet ditt',
      avsnitt: [
        `${k?.navn ?? 'Kunden'} har valgt tilbudet ditt på ${hva}. Ta kontakt for å avtale detaljene.`,
        [`E-post: ${k?.epost ?? e.epost}`, k?.telefon ? `Telefon: ${k.telefon}` : '', k?.adresse ? `Adresse: ${k.adresse}` : ''].filter(Boolean).join('\n'),
        'Du kan svare direkte på denne e-posten.',
      ],
      knapp: { tekst: 'Åpne oversikten', sti: '/leverandor' },
    }),
  });
  // Leverandørene som ikke ble valgt
  const { data: andre } = await s.from('tilbud').select('leverandor_id').eq('foresporsel_id', e.f.id).eq('status', 'avslatt');
  if (andre?.length) {
    const { data: lev } = await s.from('leverandorer').select('epost').in('id', andre.map((a) => a.leverandor_id));
    await Promise.all(
      (lev ?? []).map((l) =>
        sendEpost({
          til: l.epost,
          emne: `Kunden valgte et annet tilbud: ${hva}`,
          html: mal({ tittel: 'Kunden valgte et annet tilbud', avsnitt: [`Kunden har valgt en annen leverandør til ${hva}. Takk for at du svarte!`] }),
        }),
      ),
    );
  }
  revalidatePath(`/foresporsler/${e.f.id}`);
  return { ok: true };
}

export async function avslaTilbud(tilbudId: string, angre = false): Promise<Svar> {
  const e = await eget(tilbudId);
  if (!e) return { ok: false, feil: 'Fant ikke tilbudet.' };
  if (e.f.status !== 'aktiv') return { ok: false, feil: 'Forespørselen er ikke aktiv.' };
  const fra = angre ? ['avslatt'] : ['sendt', 'endret'];
  if (!fra.includes(e.t.status)) return { ok: false, feil: 'Tilbudet kan ikke endres.' };
  await db().from('tilbud').update({ status: angre ? 'sendt' : 'avslatt' }).eq('id', tilbudId);
  revalidatePath(`/foresporsler/${e.f.id}`);
  return { ok: true };
}

export async function sporLeverandor(tilbudId: string, tekst: string): Promise<Svar> {
  const e = await eget(tilbudId);
  if (!e) return { ok: false, feil: 'Fant ikke tilbudet.' };
  const t = String(tekst ?? '').trim().slice(0, 2000);
  if (t.length < 3) return { ok: false, feil: 'Skriv spørsmålet ditt før du sender.' };
  await db().from('meldinger').insert({ foresporsel_id: e.f.id, leverandor_id: e.t.leverandor_id, fra: 'kunde', tekst: t });
  await sendEpost({
    til: e.l.epost,
    svarTil: e.epost,
    emne: `Spørsmål fra kunden om tilbudet ditt`,
    html: mal({
      tittel: 'Kunden har et spørsmål',
      avsnitt: [`Om tilbudet ditt på ${anledningNavn(e.f.anledning as Anledning).toLowerCase()} for ${e.f.gjester} gjester:`, t, 'Svar direkte på denne e-posten, så går svaret til kunden.'],
      knapp: { tekst: 'Åpne oversikten', sti: '/leverandor' },
    }),
  });
  return { ok: true };
}

export async function trekkForesporsel(foresporselId: string): Promise<Svar> {
  const epost = await innloggetEpost();
  const s = db();
  const { data: f } = await s.from('foresporsler').select('id, kunde_epost, status').eq('id', foresporselId).maybeSingle();
  if (!f || f.kunde_epost !== epost) return { ok: false, feil: 'Fant ikke forespørselen.' };
  if (f.status !== 'aktiv') return { ok: false, feil: 'Forespørselen er ikke aktiv.' };
  await s.from('foresporsler').update({ status: 'trukket' }).eq('id', f.id);
  // Klippene refunderes til leverandører som låste opp men ikke har fått noe ut av det.
  const { data: oppl } = await s.from('opplasinger').select('id, leverandor_id, klipp').eq('foresporsel_id', f.id).eq('status', 'aktiv');
  for (const o of oppl ?? []) {
    await s.from('klipp_transaksjoner').upsert({ leverandor_id: o.leverandor_id, endring: o.klipp, grunn: 'refusjon', referanse: `refusjon:${o.id}` }, { onConflict: 'referanse', ignoreDuplicates: true });
    await s.from('opplasinger').update({ status: 'refundert' }).eq('id', o.id);
  }
  revalidatePath(`/foresporsler/${f.id}`);
  revalidatePath('/mine-foresporsler');
  return { ok: true };
}
