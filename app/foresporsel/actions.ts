'use server';

import { headers } from 'next/headers';
import { klippForForesporsel, MAKS_LEVERANDORER } from '@/lib/klipp';
import { anledninger, budsjetter, kostholdstyper, leveringer, serveringer } from '@/lib/labels';
import { ADMIN_VARSEL, mal, sendEpost } from '@/lib/server/epost';
import { foresporselLinjer, type KostholdRad } from '@/lib/server/formatering';
import { db } from '@/lib/server/supabase';
import type { Budsjett } from '@/lib/types';

export interface ForesporselInn {
  anledning: string;
  gjester: number;
  dato: string;
  klokkeslett: string;
  fleksibel: boolean;
  postnummer: string;
  levering: string;
  servering: string;
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
  const servering = serveringer.find((s) => s.id === inn.servering)?.id;
  const budsjett = budsjetter.find((b) => b.id === inn.budsjett)?.id;
  const gjester = Math.round(Number(inn.gjester));
  const epost = tekst(inn.epost, 200).toLowerCase();
  const navn = tekst(inn.navn, 120);
  const postnummer = tekst(inn.postnummer, 4);
  const dato = /^\d{4}-\d{2}-\d{2}$/.test(inn.dato ?? '') ? inn.dato : '';

  if (!anledning || !levering || !servering || !budsjett) return { ok: false, feil: 'Noe i skjemaet mangler. Last siden på nytt og prøv igjen.' };
  if (!(gjester >= 1 && gjester <= 9999)) return { ok: false, feil: 'Skriv antall gjester, minst 1.', felt: 'gjester' };
  if (!dato && !inn.fleksibel) return { ok: false, feil: 'Velg en dato, eller kryss av for at datoen ikke er bestemt.', felt: 'dato' };
  if (dato && dato < iDagOslo()) return { ok: false, feil: 'Datoen har passert.', felt: 'dato' };
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(inn.klokkeslett ?? '')) return { ok: false, feil: 'Ugyldig klokkeslett.', felt: 'klokkeslett' };
  if (!navn) return { ok: false, feil: 'Skriv navnet ditt.', felt: 'navn' };
  if (!epostOk(epost)) return { ok: false, feil: 'Skriv en gyldig e-postadresse.', felt: 'epost' };

  const kosthold: KostholdRad[] = Object.entries(inn.kosthold ?? {})
    .filter(([type]) => kostholdstyper.some((k) => k.id === type))
    .map(([type, v]) => ({ type: type as KostholdRad['type'], antall: Math.max(0, Math.min(9999, Math.round(Number(v?.antall) || 0))), alvorlig: !!v?.alvorlig }));

  const s = db();
  const { data: pn } = await s.from('postnummer').select('poststed, kommunenr, kommunenavn, fylkesnr').eq('postnummer', postnummer).maybeSingle();
  if (!pn)
    return {
      ok: false,
      felt: 'postnummer',
      feil: `Vi dekker foreløpig bare Oslo og Akershus, og postnummer ${postnummer} er utenfor området. Skriv til hei@kuverto.no, så sier vi fra når vi kommer dit.`,
    };

  // Enkel begrensning: høyst 5 forespørsler per e-post per time.
  const enTimeSiden = new Date(Date.now() - 3600_000).toISOString();
  const { count } = await s.from('foresporsler').select('id', { count: 'exact', head: true }).eq('kunde_epost', epost).gte('opprettet', enTimeSiden);
  if ((count ?? 0) >= 5) return { ok: false, feil: 'Du har sendt mange forespørsler på kort tid. Vent litt, eller skriv til hei@kuverto.no.' };

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
    servering,
    kosthold,
    budsjett,
    maks_leverandorer: MAKS_LEVERANDORER,
    klipp_pris: klippForForesporsel(gjester, budsjett as Budsjett),
    omrade_visning: omrade,
  };
  const { data: f, error } = await s.from('foresporsler').insert(rad).select('id').single();
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
  });
  if (kErr) {
    console.error('[foresporsel] kontakt', kErr);
    await s.from('foresporsler').delete().eq('id', f.id);
    return { ok: false, feil: 'Vi fikk ikke lagret forespørselen. Prøv igjen om litt.' };
  }

  const linjer = foresporselLinjer(rad);
  const anledningTekst = anledninger.find((a) => a.id === anledning)?.navn ?? '';

  // Kunden
  await sendEpost({
    til: epost,
    emne: `Vi har mottatt forespørselen din om ${anledningTekst.toLowerCase()}`,
    html: mal({
      tittel: 'Forespørselen er sendt',
      avsnitt: [
        `Hei ${navn.split(' ')[0]}! Godkjente leverandører i området har fått beskjed. Du får en e-post hver gang et tilbud kommer inn.`,
        linjer.join('\n'),
        'Du ser og sammenligner tilbudene når du logger inn med denne e-postadressen.',
      ],
      knapp: { tekst: 'Se forespørselen', sti: `/logg-inn?epost=${encodeURIComponent(epost)}` },
    }),
  });

  // Leverandører som dekker kommunen
  const { data: dekning } = await s.from('dekning').select('leverandor_id').eq('kommunenr', pn.kommunenr);
  const ider = (dekning ?? []).map((d) => d.leverandor_id);
  let antallLev = 0;
  if (ider.length) {
    const { data: lev } = await s.from('leverandorer').select('epost').in('id', ider).eq('status', 'godkjent');
    antallLev = lev?.length ?? 0;
    await Promise.all(
      (lev ?? []).map((l) =>
        sendEpost({
          til: l.epost,
          emne: `Ny forespørsel: ${anledningTekst.toLowerCase()} for ${gjester} i ${pn.poststed}`,
          html: mal({
            tittel: 'Ny forespørsel i ditt område',
            avsnitt: [...linjer, `Det koster ${rad.klipp_pris} klipp å låse opp. Høyst ${MAKS_LEVERANDORER} leverandører kan svare.`],
            knapp: { tekst: 'Se forespørselen', sti: '/leverandor' },
            fot: 'Du får denne e-posten fordi bedriften din er leverandør på Kuverto og dekker dette området.',
          }),
        }),
      ),
    );
  }

  // Admin
  const ip = (await headers()).get('x-forwarded-for')?.split(',')[0] ?? 'ukjent';
  await sendEpost({
    til: ADMIN_VARSEL,
    emne: `[Kuverto] Ny forespørsel: ${anledningTekst} ${gjester} i ${pn.poststed}`,
    html: mal({
      tittel: 'Ny forespørsel',
      avsnitt: [...linjer, `Kunde: ${navn} <${epost}>${inn.telefon ? `, ${inn.telefon}` : ''}`, `Varslet ${antallLev} godkjente leverandører i kommunen. IP: ${ip}`],
      knapp: { tekst: 'Åpne admin', sti: '/admin' },
    }),
  });

  return { ok: true, poststed: pn.poststed };
}

