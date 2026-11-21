'use server';

import { ADMIN_VARSEL, mal, sendEpost } from '@/lib/server/epost';
import { dekningVisning, gyldigeKommuner, hentKommuner } from '@/lib/server/kommuner';
import { aktivtMarked } from '@/lib/server/marked';
import { MARKED_INFO } from '@/lib/markets';
import { formaterOrgnr, gyldigMvaNummer, gyldigOrgnr, gyldigTelefon, rensMvaNummer, rensOrgnr } from '@/lib/orgnr';
import { db } from '@/lib/server/supabase';

export interface RegistreringInn {
  orgnr: string;
  navn: string;
  /** EU-MVA-nummer. Påkrevd i Sverige, Danmark og Finland (omvendt avgiftsplikt). */
  mvaNummer?: string;
  kontaktperson: string;
  epost: string;
  telefon: string;
  nettside: string;
  beskrivelse: string;
  kommuner: string[];
  bekreftet: boolean;
  markedsforing: boolean;
  felle?: string;
}

type Svar = { ok: true } | { ok: false; feil: string; felt?: string };


const t = (v: unknown, maks: number) => (typeof v === 'string' ? v.trim().slice(0, maks) : '');

export async function registrerLeverandor(inn: RegistreringInn): Promise<Svar> {
  if (inn.felle) return { ok: true };
  const MARKED = await aktivtMarked();
  const orgnr = rensOrgnr(t(inn.orgnr, 20));
  const info = MARKED_INFO[MARKED];
  const mvaNummer = info.omvendtAvgift ? rensMvaNummer(t(inn.mvaNummer, 20)) : null;
  const epost = t(inn.epost, 200).toLowerCase();
  const kontaktperson = t(inn.kontaktperson, 120);
  let navn = t(inn.navn, 160);

  if (!gyldigOrgnr(MARKED, orgnr)) return { ok: false, felt: 'orgnr', feil: `Sjekk ${info.orgnr.navn.toLowerCase()}, for eksempel ${info.orgnr.eksempel}.` };
  if (info.omvendtAvgift && !gyldigMvaNummer(MARKED, mvaNummer ?? '')) return { ok: false, felt: 'mvaNummer', feil: 'Skriv et gyldig MVA-nummer (VAT).' };
  if (!kontaktperson) return { ok: false, felt: 'kontaktperson', feil: 'Skriv navnet på kontaktpersonen.' };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(epost)) return { ok: false, felt: 'epost', feil: 'Skriv en gyldig e-postadresse.' };
  const telefon = t(inn.telefon, 30);
  if (!gyldigTelefon(telefon)) return { ok: false, felt: 'telefon', feil: 'Skriv et gyldig telefonnummer.' };
  const beskrivelse = t(inn.beskrivelse, 300);
  if (beskrivelse.length < 20) return { ok: false, felt: 'beskrivelse', feil: 'Skriv noen setninger om bedriften (minst 20 tegn).' };
  if (!inn.bekreftet) return { ok: false, felt: 'bekreftet', feil: 'Du må bekrefte at opplysningene stemmer.' };

  const valgt = await gyldigeKommuner(inn.kommuner ?? [], MARKED);
  if (!valgt.length) return { ok: false, felt: 'kommuner', feil: 'Velg minst én kommune dere leverer til.' };

  // Slå opp i registeret (Norge: Enhetsregisteret, Finland: YTJ). Sverige og Danmark: bare kontrollsiffer, admin sjekker manuelt.
  // Er tjenesten nede, lar vi registreringen gå og sjekker manuelt.
  let brreg = 'ikke sjekket';
  try {
    if (MARKED === 'no') {
      const r = await fetch(`https://data.brreg.no/enhetsregisteret/api/enheter/${orgnr}`, { signal: AbortSignal.timeout(4000), headers: { Accept: 'application/json' } });
      if (r.status === 404 || r.status === 410) return { ok: false, felt: 'orgnr', feil: 'Vi finner ikke organisasjonsnummeret i Enhetsregisteret.' };
      if (r.ok) {
        const e = (await r.json()) as { navn?: string; konkurs?: boolean; underAvvikling?: boolean; naeringskode1?: { kode?: string; beskrivelse?: string } };
        if (e.konkurs || e.underAvvikling) return { ok: false, felt: 'orgnr', feil: 'Bedriften er registrert som konkurs eller under avvikling.' };
        if (e.navn) navn = navn || e.navn;
        brreg = `${e.navn ?? '?'} · ${e.naeringskode1?.kode ?? ''} ${e.naeringskode1?.beskrivelse ?? ''}`.trim();
      }
    } else if (MARKED === 'fi') {
      const id = formaterOrgnr('fi', orgnr);
      const r = await fetch(`https://avoindata.prh.fi/opendata-ytj-api/v3/companies?businessId=${id}`, { signal: AbortSignal.timeout(4000), headers: { Accept: 'application/json' } });
      if (r.ok) {
        const d = (await r.json()) as { companies?: { endDate?: string | null; names?: { name?: string; endDate?: string | null }[] }[] };
        const c = d.companies?.[0];
        if (!c) return { ok: false, felt: 'orgnr', feil: 'Vi finner ikke Y-tunnus i YTJ.' };
        if (c.endDate) return { ok: false, felt: 'orgnr', feil: 'Bedriften er ikke lenger aktiv i YTJ.' };
        const n = c.names?.find((x) => x.name && !x.endDate)?.name;
        if (n) navn = navn || n;
        brreg = `YTJ: ${n ?? '?'}`;
      }
    } else brreg = `${info.orgnr.register}: kontrollsiffer OK, sjekk manuelt`;
  } catch {
    // ignorer
  }
  if (!navn) return { ok: false, felt: 'navn', feil: 'Skriv navnet på bedriften.' };

  const s = db();
  const [{ data: a }, { data: b }] = await Promise.all([
    s.from('leverandorer').select('id').eq('marked', MARKED).eq('orgnr', orgnr).eq('status', 'godkjent').limit(1),
    s.from('leverandorer').select('id').eq('epost', epost).limit(1),
  ]);
  if (b?.length) return { ok: false, feil: 'E-postadressen er allerede registrert. Logg inn med den, eller skriv til hei@kuverto.no.' };
  if (a?.length) return { ok: false, feil: 'Bedriften er allerede registrert og godkjent. Skriv til hei@kuverto.no hvis du skal ha tilgang.' };

  const { data: lev, error } = await s
    .from('leverandorer')
    .insert({
      marked: MARKED,
      navn,
      orgnr,
      mva_nummer: mvaNummer,
      epost,
      kontaktperson,
      telefon,
      nettside: t(inn.nettside, 200) || null,
      beskrivelse,
      dekning_visning: dekningVisning(valgt, await hentKommuner(MARKED)),
      markedsforing_samtykke: !!inn.markedsforing,
    })
    .select('id')
    .single();
  if (error || !lev) {
    console.error('[registrering]', error);
    return { ok: false, feil: 'Vi fikk ikke lagret registreringen. Prøv igjen om litt.' };
  }
  const { error: dErr } = await s.from('dekning').insert(valgt.map((k) => ({ leverandor_id: lev.id, kommunenr: k.nr })));
  if (dErr) {
    console.error('[registrering] dekning', dErr);
    await s.from('leverandorer').delete().eq('id', lev.id);
    return { ok: false, feil: 'Vi fikk ikke lagret registreringen. Prøv igjen om litt.' };
  }

  await sendEpost({
    til: epost,
    emne: 'Vi har mottatt registreringen din på Kuverto',
    html: mal({
      tittel: 'Takk for registreringen',
      avsnitt: [
        `Hei ${kontaktperson.split(' ')[0]}! Vi har mottatt registreringen av ${navn}.`,
        'Vi sjekker bedriften og godkjenner den så raskt vi kan, vanligvis samme dag. Du får en e-post når du kan begynne å svare på forespørsler.',
      ],
      fot: 'Du får denne e-posten fordi bedriften ble registrert som leverandør på Kuverto.',
    }),
  });
  await sendEpost({
    til: ADMIN_VARSEL,
    emne: `[Kuverto] Ny leverandør venter: ${navn}`,
    html: mal({
      tittel: 'Ny leverandør venter på godkjenning',
      avsnitt: [`${navn} (${info.land}, ${info.orgnr.navn} ${formaterOrgnr(MARKED, orgnr)}${mvaNummer ? `, MVA ${mvaNummer}` : ''})`, `Register: ${brreg}`, `Kontakt: ${kontaktperson} <${epost}> ${telefon}`, `Om bedriften: ${beskrivelse}`, `Dekning: ${dekningVisning(valgt, await hentKommuner(MARKED))} (${valgt.length} kommuner)`],
      knapp: { tekst: 'Godkjenn i admin', sti: '/admin' },
    }),
  });
  return { ok: true };
}
