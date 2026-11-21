'use server';

import { revalidatePath } from 'next/cache';
import { tFor, type T } from '@/lib/i18n';
import { anledningNavn } from '@/lib/labels';
import { erMarked, type Marked } from '@/lib/markets';
import { mal, sendEpost } from '@/lib/server/epost';
import { sprak } from '@/lib/server/marked';
import { db, innloggetEpost } from '@/lib/server/supabase';
import type { Anledning } from '@/lib/types';

type Svar = { ok: true } | { ok: false; feil: string };

const markedAv = (v: unknown): Marked => (erMarked(v) ? v : 'no');

/** Henter tilbudet og sjekker at forespørselen tilhører innlogget kunde. */
async function eget(tilbudId: string) {
  const epost = await innloggetEpost();
  if (!epost) return null;
  const s = db();
  const { data: t } = await s.from('tilbud').select('id, status, foresporsel_id, leverandor_id').eq('id', tilbudId).maybeSingle();
  if (!t) return null;
  const { data: f } = await s.from('foresporsler').select('id, kunde_epost, status, anledning, gjester, postnummer, poststed, marked').eq('id', t.foresporsel_id).single();
  if (!f || f.kunde_epost !== epost) return null;
  const { data: l } = await s.from('leverandorer').select('navn, epost, telefon, kontaktperson, marked').eq('id', t.leverandor_id).single();
  return { epost, t, f, l: l! };
}

const VELG_FEIL: Record<string, string> = {
  ikke_aktiv: 'Forespørselen er allerede tildelt eller lukket.',
  ikke_gyldig: 'Tilbudet kan ikke velges lenger.',
  utlopt: 'Tilbudet har gått ut. Send leverandøren et spørsmål om et nytt.',
};

/** «julebord for 40 gjester» på mottakerens språk. */
const hvaFor = (f: { anledning: string; gjester: number }, t: T) =>
  t('{anledning} for {gjester} gjester', { anledning: anledningNavn(f.anledning as Anledning, t).toLowerCase(), gjester: f.gjester });

export async function velgTilbud(tilbudId: string, adresse: string): Promise<Svar> {
  const { t: tSide } = await sprak();
  const e = await eget(tilbudId);
  if (!e) return { ok: false, feil: tSide('Fant ikke tilbudet.') };
  const s = db();
  const { data, error } = await s.rpc('velg_tilbud', { p_tilbud: tilbudId, p_epost: e.epost, p_adresse: String(adresse ?? '').slice(0, 300) });
  if (error) {
    console.error('[velg]', error);
    return { ok: false, feil: tSide('Noe gikk galt. Prøv igjen.') };
  }
  if (data !== 'ok') return { ok: false, feil: tSide(VELG_FEIL[data as string] ?? 'Kunne ikke velge tilbudet.') };

  const { data: k } = await s.from('foresporsel_kontakt').select('navn, epost, telefon, adresse').eq('foresporsel_id', e.f.id).single();
  const kundeMarked = markedAv(e.f.marked);
  const levMarked = markedAv(e.l.marked);
  const tL = tFor(levMarked);
  const tK = tFor(kundeMarked);
  const hvaL = hvaFor(e.f, tL);
  const hvaK = hvaFor(e.f, tK);
  await sendEpost({
    til: e.l.epost,
    svarTil: e.epost,
    emne: tL('Du har vunnet oppdraget: {hva}', { hva: hvaL }),
    html: mal({
      marked: levMarked,
      tittel: tL('Kunden har valgt tilbudet ditt'),
      avsnitt: [
        tL('{kunde} har valgt tilbudet ditt på {hva}. Ta kontakt for å avtale detaljene.', { kunde: k?.navn ?? tL('Kunden'), hva: hvaL }),
        [
          tL('E-post: {epost}', { epost: k?.epost ?? e.epost }),
          k?.telefon ? tL('Telefon: {telefon}', { telefon: k.telefon }) : '',
          k?.adresse
            ? tL('Adresse: {adresse}', { adresse: `${k.adresse}, ${e.f.postnummer} ${e.f.poststed}` })
            : tL('Postnummer: {postnummer}', { postnummer: `${e.f.postnummer} ${e.f.poststed}` }),
        ]
          .filter(Boolean)
          .join('\n'),
        tL('Du kan svare direkte på denne e-posten.'),
      ],
      knapp: { tekst: tL('Åpne oversikten'), sti: '/leverandor' },
    }),
  });
  // Kvittering til kunden med leverandørens kontaktinfo
  await sendEpost({
    til: e.epost,
    svarTil: e.l.epost,
    emne: tK('Du har valgt {leverandor}', { leverandor: e.l.navn }),
    html: mal({
      marked: kundeMarked,
      tittel: tK('Bordet er dekket'),
      avsnitt: [
        tK('Du har valgt tilbudet fra {leverandor} til {hva}. De tar kontakt for å avtale detaljene, og de andre leverandørene har fått beskjed.', { leverandor: e.l.navn, hva: hvaK }),
        [
          tK('Kontakt: {navn}', { navn: e.l.kontaktperson }),
          tK('E-post: {epost}', { epost: e.l.epost }),
          e.l.telefon ? tK('Telefon: {telefon}', { telefon: e.l.telefon }) : '',
        ]
          .filter(Boolean)
          .join('\n'),
        tK('Avtalen og betalingen gjør du direkte med leverandøren. Svar på denne e-posten, så går svaret til dem.'),
      ],
      knapp: { tekst: tK('Se tilbudet'), sti: `/foresporsler/${e.f.id}` },
    }),
  });
  // Leverandørene som ikke ble valgt
  const { data: andre } = await s.from('tilbud').select('leverandor_id').eq('foresporsel_id', e.f.id).eq('status', 'avslatt');
  if (andre?.length) {
    const { data: lev } = await s.from('leverandorer').select('epost, marked').in('id', andre.map((a) => a.leverandor_id));
    await Promise.all(
      (lev ?? []).map((l) => {
        const m = markedAv(l.marked);
        const tA = tFor(m);
        const hva = hvaFor(e.f, tA);
        return sendEpost({
          til: l.epost,
          emne: tA('Kunden valgte et annet tilbud: {hva}', { hva }),
          html: mal({ marked: m, tittel: tA('Kunden valgte et annet tilbud'), avsnitt: [tA('Kunden har valgt en annen leverandør til {hva}. Takk for at du svarte!', { hva })] }),
        });
      }),
    );
  }
  revalidatePath(`/foresporsler/${e.f.id}`);
  return { ok: true };
}

export async function avslaTilbud(tilbudId: string, angre = false): Promise<Svar> {
  const { t } = await sprak();
  const e = await eget(tilbudId);
  if (!e) return { ok: false, feil: t('Fant ikke tilbudet.') };
  if (e.f.status !== 'aktiv') return { ok: false, feil: t('Forespørselen er ikke aktiv.') };
  const fra = angre ? ['avslatt'] : ['sendt', 'endret'];
  if (!fra.includes(e.t.status)) return { ok: false, feil: t('Tilbudet kan ikke endres.') };
  await db().from('tilbud').update({ status: angre ? 'sendt' : 'avslatt' }).eq('id', tilbudId);
  revalidatePath(`/foresporsler/${e.f.id}`);
  return { ok: true };
}

export async function trekkForesporsel(foresporselId: string): Promise<Svar> {
  const { t } = await sprak();
  const epost = await innloggetEpost();
  if (!epost) return { ok: false, feil: t('Du må være logget inn.') };
  const { data, error } = await db().rpc('trekk_foresporsel', { p_foresporsel: foresporselId, p_epost: epost });
  if (error || data !== 'ok') return { ok: false, feil: data === 'ikke_aktiv' ? t('Forespørselen er ikke aktiv.') : t('Fant ikke forespørselen.') };
  revalidatePath(`/foresporsler/${foresporselId}`);
  revalidatePath('/mine-foresporsler');
  return { ok: true };
}
