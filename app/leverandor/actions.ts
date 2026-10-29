'use server';

import { revalidatePath } from 'next/cache';
import { KLIPPAKKER } from '@/lib/klipp';
import { anledningNavn } from '@/lib/labels';
import { mal, sendEpost } from '@/lib/server/epost';
import { siteUrl } from '@/lib/server/site';
import { stripe, mvaSats } from '@/lib/server/stripe';
import { db, innloggetEpost } from '@/lib/server/supabase';
import type { Anledning } from '@/lib/types';

type Svar = { ok: true; melding?: string } | { ok: false; feil: string };

async function godkjentLeverandor() {
  const epost = await innloggetEpost();
  if (!epost) return null;
  const { data } = await db().from('leverandorer').select('id, navn, epost, status').eq('epost', epost).maybeSingle();
  return data?.status === 'godkjent' ? data : null;
}

async function harOpplast(foresporselId: string, leverandorId: string) {
  const { data } = await db().from('opplasinger').select('id').eq('foresporsel_id', foresporselId).eq('leverandor_id', leverandorId).eq('status', 'aktiv').maybeSingle();
  return !!data;
}

const LAS_OPP_FEIL: Record<string, string> = {
  finnes_ikke: 'Fant ikke forespørselen.',
  ikke_aktiv: 'Forespørselen er ikke lenger aktiv.',
  ikke_godkjent: 'Bedriften er ikke godkjent ennå.',
  utenfor_dekning: 'Forespørselen er utenfor området ditt.',
  allerede: 'Du har allerede låst opp denne.',
  full: 'Det maksimale antallet leverandører har allerede låst opp denne forespørselen.',
  for_lite: 'Du har ikke nok klipp. Kjøp flere for å låse opp.',
};

export async function lasOpp(foresporselId: string): Promise<Svar> {
  const lev = await godkjentLeverandor();
  if (!lev) return { ok: false, feil: 'Du må være logget inn som godkjent leverandør.' };
  const { data, error } = await db().rpc('las_opp', { p_foresporsel: foresporselId, p_leverandor: lev.id });
  if (error) {
    console.error('[las_opp]', error);
    return { ok: false, feil: 'Noe gikk galt. Prøv igjen.' };
  }
  if (data !== 'ok') return { ok: false, feil: LAS_OPP_FEIL[data as string] ?? 'Kunne ikke låse opp.' };
  revalidatePath('/leverandor');
  return { ok: true };
}

export interface TilbudInn {
  prisPerKuvert: number; // kroner inkl. mva
  meny: string;
  kostholdDekket: boolean;
  kostholdTekst: string;
  leveringInkludert: boolean;
  leveringPris: number; // kroner
  oppsettOgRydding: boolean;
  servise: string;
  gyldigTil: string;
  betingelser: string;
}

export async function sendTilbud(foresporselId: string, inn: TilbudInn): Promise<Svar> {
  const lev = await godkjentLeverandor();
  if (!lev) return { ok: false, feil: 'Du må være logget inn som godkjent leverandør.' };
  if (!(await harOpplast(foresporselId, lev.id))) return { ok: false, feil: 'Du må låse opp forespørselen først.' };
  const s = db();
  const { data: f } = await s.from('foresporsler').select('id, status, gjester, anledning, kunde_epost').eq('id', foresporselId).single();
  if (!f || f.status !== 'aktiv') return { ok: false, feil: 'Forespørselen er ikke lenger aktiv.' };

  const pris = Math.round(Number(inn.prisPerKuvert) * 100);
  const levPris = inn.leveringInkludert ? 0 : Math.round(Math.max(0, Number(inn.leveringPris) || 0) * 100);
  const meny = String(inn.meny ?? '').trim().slice(0, 2000);
  const idag = new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Oslo' });
  if (!(pris >= 1000 && pris <= 10_000_00)) return { ok: false, feil: 'Skriv pris per kuvert i kroner, mellom 10 og 10 000.' };
  if (meny.length < 5) return { ok: false, feil: 'Beskriv menyen.' };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(inn.gyldigTil) || inn.gyldigTil < idag) return { ok: false, feil: 'Velg en dato tilbudet gjelder til, fra i dag og fremover.' };

  const rad = {
    foresporsel_id: f.id,
    leverandor_id: lev.id,
    pris_per_kuvert: pris,
    total_inkl_mva: pris * f.gjester + levPris,
    meny,
    kosthold_dekket: !!inn.kostholdDekket,
    kosthold_tekst: String(inn.kostholdTekst ?? '').trim().slice(0, 300),
    levering_inkludert: !!inn.leveringInkludert,
    levering_pris: inn.leveringInkludert ? null : levPris,
    oppsett_og_rydding: !!inn.oppsettOgRydding,
    servise: String(inn.servise ?? '').trim().slice(0, 100),
    gyldig_til: inn.gyldigTil,
    betingelser: String(inn.betingelser ?? '').trim().slice(0, 1000) || null,
  };
  const { data: finnes } = await s.from('tilbud').select('id, status').eq('foresporsel_id', f.id).eq('leverandor_id', lev.id).maybeSingle();
  if (finnes && !['sendt', 'endret'].includes(finnes.status)) return { ok: false, feil: 'Tilbudet kan ikke endres lenger.' };
  const { error } = finnes
    ? await s.from('tilbud').update({ ...rad, status: 'endret' }).eq('id', finnes.id)
    : await s.from('tilbud').insert(rad);
  if (error) {
    console.error('[tilbud]', error);
    return { ok: false, feil: 'Vi fikk ikke lagret tilbudet. Prøv igjen.' };
  }
  await sendEpost({
    til: f.kunde_epost,
    emne: finnes ? `${lev.navn} har oppdatert tilbudet sitt` : `Nytt tilbud fra ${lev.navn}`,
    html: mal({
      tittel: finnes ? 'Et tilbud er oppdatert' : 'Du har fått et nytt tilbud',
      avsnitt: [
        `${lev.navn} har ${finnes ? 'oppdatert tilbudet sitt' : 'sendt deg et tilbud'} på ${anledningNavn(f.anledning as Anledning).toLowerCase()} for ${f.gjester} gjester: kr ${Math.round(pris / 100)} per kuvert inkl. mva.`,
        'Logg inn for å se hele tilbudet og sammenligne med de andre.',
      ],
      knapp: { tekst: 'Se tilbudet', sti: `/foresporsler/${f.id}` },
    }),
  });
  revalidatePath('/leverandor');
  return { ok: true, melding: finnes ? 'Tilbudet er oppdatert.' : 'Tilbudet er sendt. Kunden får beskjed på e-post.' };
}

export async function sendMeldingTilKunde(foresporselId: string, tekst: string): Promise<Svar> {
  const lev = await godkjentLeverandor();
  if (!lev) return { ok: false, feil: 'Du må være logget inn som godkjent leverandør.' };
  if (!(await harOpplast(foresporselId, lev.id))) return { ok: false, feil: 'Du må låse opp forespørselen først.' };
  const t = String(tekst ?? '').trim().slice(0, 2000);
  if (t.length < 2) return { ok: false, feil: 'Skriv en melding.' };
  const s = db();
  const { data: f } = await s.from('foresporsler').select('id, kunde_epost, anledning').eq('id', foresporselId).single();
  if (!f) return { ok: false, feil: 'Fant ikke forespørselen.' };
  await s.from('meldinger').insert({ foresporsel_id: f.id, leverandor_id: lev.id, fra: 'leverandor', tekst: t });
  await sendEpost({
    til: f.kunde_epost,
    svarTil: lev.epost,
    emne: `Melding fra ${lev.navn} om forespørselen din`,
    html: mal({
      tittel: `Melding fra ${lev.navn}`,
      avsnitt: [t, `Svar direkte på denne e-posten, så går svaret til ${lev.navn}.`],
      knapp: { tekst: 'Se forespørselen', sti: `/foresporsler/${f.id}` },
    }),
  });
  return { ok: true, melding: 'Meldingen er sendt. Kunden kan svare deg på e-post.' };
}

export async function kjopKlipp(pakkeId: string): Promise<{ ok: true; url: string } | { ok: false; feil: string }> {
  const lev = await godkjentLeverandor();
  if (!lev) return { ok: false, feil: 'Du må være logget inn som godkjent leverandør.' };
  const pakke = KLIPPAKKER.find((p) => p.id === pakkeId);
  if (!pakke) return { ok: false, feil: 'Ukjent pakke.' };
  try {
    const s = stripe();
    const sesjon = await s.checkout.sessions.create({
      mode: 'payment',
      locale: 'nb',
      customer_email: lev.epost,
      line_items: [
        {
          quantity: 1,
          tax_rates: [await mvaSats()],
          price_data: {
            currency: 'nok',
            unit_amount: pakke.prisEksMva,
            product_data: { name: `Klipp – ${pakke.navn} (${pakke.klipp} klipp)`, description: 'Klipp for å låse opp cateringforespørsler på Kuverto' },
          },
        },
      ],
      invoice_creation: { enabled: true, invoice_data: { description: `Kuverto – ${pakke.klipp} klipp`, footer: 'Puncheur AS · Org.nr. 999 552 536 MVA' } },
      metadata: { leverandor_id: lev.id, klipp: String(pakke.klipp), pakke: pakke.id },
      payment_intent_data: { metadata: { leverandor_id: lev.id, klipp: String(pakke.klipp) } },
      success_url: `${siteUrl()}/leverandor?kjop=ok`,
      cancel_url: `${siteUrl()}/leverandor?kjop=avbrutt`,
    });
    if (!sesjon.url) return { ok: false, feil: 'Fikk ikke startet betalingen.' };
    return { ok: true, url: sesjon.url };
  } catch (e) {
    console.error('[stripe]', e);
    return { ok: false, feil: 'Betaling er ikke tilgjengelig akkurat nå. Skriv til hei@kuverto.no, så hjelper vi deg.' };
  }
}
