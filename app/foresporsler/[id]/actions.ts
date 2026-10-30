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
  const { data: l } = await s.from('leverandorer').select('navn, epost, telefon, kontaktperson').eq('id', t.leverandor_id).single();
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
  // Kvittering til kunden med leverandørens kontaktinfo
  await sendEpost({
    til: e.epost,
    svarTil: e.l.epost,
    emne: `Du har valgt ${e.l.navn}`,
    html: mal({
      tittel: 'Bordet er dekket',
      avsnitt: [
        `Du har valgt tilbudet fra ${e.l.navn} til ${hva}. De tar kontakt for å avtale detaljene, og de andre leverandørene har fått beskjed.`,
        [`Kontakt: ${e.l.kontaktperson}`, `E-post: ${e.l.epost}`, e.l.telefon ? `Telefon: ${e.l.telefon}` : ''].filter(Boolean).join('\n'),
        'Avtalen og betalingen gjør du direkte med leverandøren. Svar på denne e-posten, så går svaret til dem.',
      ],
      knapp: { tekst: 'Se tilbudet', sti: `/foresporsler/${e.f.id}` },
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
  if (!epost) return { ok: false, feil: 'Du må være logget inn.' };
  const { data, error } = await db().rpc('trekk_foresporsel', { p_foresporsel: foresporselId, p_epost: epost });
  if (error || data !== 'ok') return { ok: false, feil: data === 'ikke_aktiv' ? 'Forespørselen er ikke aktiv.' : 'Fant ikke forespørselen.' };
  revalidatePath(`/foresporsler/${foresporselId}`);
  revalidatePath('/mine-foresporsler');
  return { ok: true };
}
