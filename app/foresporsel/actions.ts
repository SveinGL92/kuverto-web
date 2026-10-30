'use server';

import { createHash, randomBytes } from 'node:crypto';
import { headers } from 'next/headers';
import { klippForForesporsel, MAKS_LEVERANDORER } from '@/lib/klipp';
import { anledninger, budsjetter, erAllergen, kostholdstyper, leveringer } from '@/lib/labels';
import { mal, sendEpost } from '@/lib/server/epost';
import { fullstendigeLinjer, type KostholdRad } from '@/lib/server/formatering';
import { db } from '@/lib/server/supabase';
import type { Budsjett } from '@/lib/types';

export interface ForesporselInn {
  anledning: string;
  gjester: number;
  dato: string;
  klokkeslett: string;
  fleksibel: boolean;
  postnummer: string;
  /** Gateadresse. Valgfri, men postnummer må alltid være med. */
  adresse: string;
  levering: string;
  budsjett: string;
  kosthold: Record<string, { antall: number; alvorlig: boolean }>;
  melding: string;
  navn: string;
  epost: string;
  telefon: string;
  firma: string;
  /** Felle for roboter. Skal være tom. */
  nettside?: string;
  /** Når skjemaet ble åpnet (ms). Brukes til å stoppe roboter som sender på under 3 sekunder. */
  startet?: number;
}

type Svar = { ok: true; poststed: string } | { ok: false; feil: string; felt?: string };

const epostOk = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
const iDagOslo = () => new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Oslo' });
const tekst = (v: unknown, maks: number) => (typeof v === 'string' ? v.trim().slice(0, maks) : '');

export async function sendForesporsel(inn: ForesporselInn): Promise<Svar> {
  // Robotsjekk: stille avvisning som ser vellykket ut.
  if (inn.nettside || (inn.startet && Date.now() - inn.startet < 3000)) return { ok: true, poststed: '' };

  const anledning = anledninger.find((a) => a.id === inn.anledning)?.id;
  const levering = leveringer.find((l) => l.id === inn.levering)?.id;
  const budsjett = budsjetter.find((b) => b.id === inn.budsjett)?.id;
  const gjester = Math.round(Number(inn.gjester));
  const epost = tekst(inn.epost, 200).toLowerCase();
  const navn = tekst(inn.navn, 120);
  const postnummer = tekst(inn.postnummer, 4);
  const dato = /^\d{4}-\d{2}-\d{2}$/.test(inn.dato ?? '') ? inn.dato : '';

  if (!anledning || !levering || !budsjett) return { ok: false, feil: 'Noe i skjemaet mangler. Last siden på nytt og prøv igjen.' };
  if (!(gjester >= 1 && gjester <= 9999)) return { ok: false, feil: 'Skriv antall gjester, minst 1.', felt: 'gjester' };
  if (!dato && !inn.fleksibel) return { ok: false, feil: 'Velg en dato, eller kryss av for at datoen ikke er bestemt.', felt: 'dato' };
  if (dato && dato < iDagOslo()) return { ok: false, feil: 'Datoen har passert.', felt: 'dato' };
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(inn.klokkeslett ?? '')) return { ok: false, feil: 'Ugyldig klokkeslett.', felt: 'klokkeslett' };
  if (!navn) return { ok: false, feil: 'Skriv navnet ditt.', felt: 'navn' };
  if (!epostOk(epost)) return { ok: false, feil: 'Skriv en gyldig e-postadresse.', felt: 'epost' };

  const kosthold: KostholdRad[] = Object.entries(inn.kosthold ?? {})
    .filter(([type]) => kostholdstyper.some((k) => k.id === type))
    .map(([type, v]) => ({ type: type as KostholdRad['type'], antall: Math.max(0, Math.min(9999, Math.round(Number(v?.antall) || 0))), alvorlig: erAllergen(type as KostholdRad['type']) && !!v?.alvorlig }))
    .filter((k) => k.antall > 0);
  const adresse = levering === 'levering' ? tekst(inn.adresse, 200) || null : null;

  const s = db();
  const { data: pn } = await s.from('postnummer').select('poststed, kommunenr, kommunenavn, fylkesnr').eq('postnummer', postnummer).maybeSingle();
  if (!pn)
    return {
      ok: false,
      felt: 'postnummer',
      feil: `Vi dekker foreløpig bare Oslo og Akershus, og postnummer ${postnummer} er utenfor området. Skriv til hei@kuverto.no, så sier vi fra når vi kommer dit.`,
    };

  // Begrensning: høyst 5 forespørsler per e-post og 10 per IP-adresse i timen.
  const ip = (await headers()).get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'ukjent';
  const ipHash = createHash('sha256').update(`kuverto:${ip}`).digest('hex').slice(0, 32);
  const enTimeSiden = new Date(Date.now() - 3600_000).toISOString();
  const [{ count: perEpost }, { count: perIp }] = await Promise.all([
    s.from('foresporsler').select('id', { count: 'exact', head: true }).eq('kunde_epost', epost).gte('opprettet', enTimeSiden),
    s.from('foresporsler').select('id', { count: 'exact', head: true }).eq('ip_hash', ipHash).gte('opprettet', enTimeSiden),
  ]);
  if ((perEpost ?? 0) >= 5 || (perIp ?? 0) >= 10) return { ok: false, feil: 'Det er sendt mange forespørsler på kort tid. Vent litt, eller skriv til hei@kuverto.no.' };
  const token = randomBytes(24).toString('base64url');

  const omrade = pn.poststed === pn.kommunenavn ? `${pn.poststed} (${postnummer.slice(0, 2)}xx)` : `${pn.poststed}, ${pn.kommunenavn} (${postnummer.slice(0, 2)}xx)`;
  const rad = {
    kunde_epost: epost,
    anledning,
    gjester,
    dato: dato || null,
    klokkeslett: inn.klokkeslett,
    fleksibel_dato: !!inn.fleksibel,
    postnummer,
    poststed: pn.poststed,
    kommunenr: pn.kommunenr,
    fylkesnr: pn.fylkesnr ?? pn.kommunenr.slice(0, 2),
    levering,
    servering: null,
    kosthold,
    budsjett,
    maks_leverandorer: MAKS_LEVERANDORER,
    klipp_pris: klippForForesporsel(gjester, budsjett as Budsjett),
    omrade_visning: omrade,
  };
  const lagres = { ...rad, status: 'venter_bekreftelse', bekreft_token: token, ip_hash: ipHash };
  const { data: f, error } = await s.from('foresporsler').insert(lagres).select('id').single();
  if (error || !f) {
    console.error('[foresporsel] insert', error);
    return { ok: false, feil: 'Vi fikk ikke lagret forespørselen. Prøv igjen om litt.' };
  }
  const { error: kErr } = await s.from('foresporsel_kontakt').insert({
    foresporsel_id: f.id,
    navn,
    firma: tekst(inn.firma, 160) || null,
    epost,
    telefon: tekst(inn.telefon, 30) || null,
    melding: tekst(inn.melding, 1000) || null,
    adresse,
  });
  if (kErr) {
    console.error('[foresporsel] kontakt', kErr);
    await s.from('foresporsler').delete().eq('id', f.id);
    return { ok: false, feil: 'Vi fikk ikke lagret forespørselen. Prøv igjen om litt.' };
  }

  const linjer = fullstendigeLinjer(rad, {
    navn,
    firma: tekst(inn.firma, 160) || null,
    epost,
    telefon: tekst(inn.telefon, 30) || null,
    melding: tekst(inn.melding, 1000) || null,
    adresse,
  });
  const anledningTekst = anledninger.find((a) => a.id === anledning)?.navn ?? '';
  await sendEpost({
    til: epost,
    emne: `Bekreft forespørselen din om ${anledningTekst.toLowerCase()}`,
    html: mal({
      tittel: 'Bekreft forespørselen',
      avsnitt: [
        `Hei ${navn.split(' ')[0]}! Se over forespørselen under. Stemmer alt, trykker du på knappen. Da sender vi den til godkjente leverandører i området.`,
        linjer.join('\n'),
        'Leverandørene ser først området og behovet. Navn, kontaktinfo og ønskene dine ser bare de som låser opp forespørselen, og gateadressen deles først når du velger et tilbud.',
        'Er noe feil? Ikke bekreft. Send heller en ny forespørsel på kuverto.no.',
      ],
      knapp: { tekst: 'Bekreft og send', sti: `/foresporsel/bekreft?t=${token}` },
      fot: 'Sendte du ikke denne forespørselen, kan du se bort fra e-posten. Da blir ingenting sendt videre.',
    }),
  });

  return { ok: true, poststed: pn.poststed };
}

