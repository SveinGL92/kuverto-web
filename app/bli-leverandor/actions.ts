'use server';

import { ADMIN_VARSEL, mal, sendEpost } from '@/lib/server/epost';
import { dekningVisning, hentKommuner } from '@/lib/server/kommuner';
import { db } from '@/lib/server/supabase';

export interface RegistreringInn {
  orgnr: string;
  navn: string;
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

/** Kontrollsiffer for norske organisasjonsnumre (modulus 11). */
function gyldigOrgnr(nr: string) {
  if (!/^\d{9}$/.test(nr)) return false;
  const vekt = [3, 2, 7, 6, 5, 4, 3, 2];
  const sum = vekt.reduce((s, v, i) => s + v * Number(nr[i]), 0);
  const rest = 11 - (sum % 11);
  const kontroll = rest === 11 ? 0 : rest;
  return kontroll !== 10 && kontroll === Number(nr[8]);
}

const t = (v: unknown, maks: number) => (typeof v === 'string' ? v.trim().slice(0, maks) : '');

export async function registrerLeverandor(inn: RegistreringInn): Promise<Svar> {
  if (inn.felle) return { ok: true };
  const orgnr = t(inn.orgnr, 20).replace(/\s/g, '');
  const epost = t(inn.epost, 200).toLowerCase();
  const kontaktperson = t(inn.kontaktperson, 120);
  let navn = t(inn.navn, 160);

  if (!gyldigOrgnr(orgnr)) return { ok: false, felt: 'orgnr', feil: 'Organisasjonsnummeret må ha ni siffer og være gyldig.' };
  if (!kontaktperson) return { ok: false, felt: 'kontaktperson', feil: 'Skriv navnet på kontaktpersonen.' };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(epost)) return { ok: false, felt: 'epost', feil: 'Skriv en gyldig e-postadresse.' };
  if (!inn.bekreftet) return { ok: false, felt: 'bekreftet', feil: 'Du må bekrefte at opplysningene stemmer.' };

  const alle = await hentKommuner();
  const valgt = alle.filter((k) => inn.kommuner?.includes(k.nr));
  if (!valgt.length) return { ok: false, felt: 'kommuner', feil: 'Velg minst én kommune dere leverer til.' };

  // Slå opp i Enhetsregisteret. Er tjenesten nede, lar vi registreringen gå og sjekker manuelt.
  let brreg = 'ikke sjekket';
  try {
    const r = await fetch(`https://data.brreg.no/enhetsregisteret/api/enheter/${orgnr}`, { signal: AbortSignal.timeout(4000), headers: { Accept: 'application/json' } });
    if (r.status === 404 || r.status === 410) return { ok: false, felt: 'orgnr', feil: 'Vi finner ikke organisasjonsnummeret i Enhetsregisteret.' };
    if (r.ok) {
      const e = (await r.json()) as { navn?: string; konkurs?: boolean; underAvvikling?: boolean; naeringskode1?: { kode?: string; beskrivelse?: string } };
      if (e.konkurs || e.underAvvikling) return { ok: false, felt: 'orgnr', feil: 'Bedriften er registrert som konkurs eller under avvikling.' };
      if (e.navn) navn = navn || e.navn;
      brreg = `${e.navn ?? '?'} · ${e.naeringskode1?.kode ?? ''} ${e.naeringskode1?.beskrivelse ?? ''}`.trim();
    }
  } catch {
    // ignorer
  }
  if (!navn) return { ok: false, felt: 'navn', feil: 'Skriv navnet på bedriften.' };

  const s = db();
  const [{ data: a }, { data: b }] = await Promise.all([
    s.from('leverandorer').select('id').eq('orgnr', orgnr).eq('status', 'godkjent').limit(1),
    s.from('leverandorer').select('id').eq('epost', epost).limit(1),
  ]);
  if (b?.length) return { ok: false, feil: 'E-postadressen er allerede registrert. Logg inn med den, eller skriv til hei@kuverto.no.' };
  if (a?.length) return { ok: false, feil: 'Bedriften er allerede registrert og godkjent. Skriv til hei@kuverto.no hvis du skal ha tilgang.' };

  const { data: lev, error } = await s
    .from('leverandorer')
    .insert({
      navn,
      orgnr,
      epost,
      kontaktperson,
      telefon: t(inn.telefon, 30) || null,
      nettside: t(inn.nettside, 200) || null,
      beskrivelse: t(inn.beskrivelse, 300) || null,
      dekning_visning: dekningVisning(valgt),
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
      avsnitt: [`${navn} (org.nr. ${orgnr})`, `Enhetsregisteret: ${brreg}`, `Kontakt: ${kontaktperson} <${epost}> ${inn.telefon ?? ''}`, `Dekning: ${valgt.map((k) => k.navn).join(', ')}`],
      knapp: { tekst: 'Godkjenn i admin', sti: '/admin' },
    }),
  });
  return { ok: true };
}
