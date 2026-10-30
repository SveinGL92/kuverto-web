import 'server-only';
import { MAKS_LEVERANDORER } from '@/lib/klipp';
import { anledningNavn } from '@/lib/labels';
import type { Anledning } from '@/lib/types';
import { ADMIN_VARSEL, mal, sendEpost } from './epost';
import { foresporselLinjer, fullstendigeLinjer } from './formatering';
import { db } from './supabase';

/** Varsler godkjente leverandører i kommunen og admin om en bekreftet forespørsel. */
export async function varsleOmForesporsel(id: string) {
  const s = db();
  const { data: f } = await s.from('foresporsler').select('*').eq('id', id).single();
  if (!f) return;
  const { data: k } = await s.from('foresporsel_kontakt').select('navn, firma, epost, telefon, melding, adresse').eq('foresporsel_id', id).single();
  const linjer = foresporselLinjer(f);
  const anledning = anledningNavn(f.anledning as Anledning).toLowerCase();

  const { data: dekning } = await s.from('dekning').select('leverandor_id').eq('kommunenr', f.kommunenr);
  const ider = (dekning ?? []).map((d) => d.leverandor_id);
  const { data: lev } = ider.length ? await s.from('leverandorer').select('epost').in('id', ider).eq('status', 'godkjent') : { data: [] };
  await Promise.all(
    (lev ?? []).map((l) =>
      sendEpost({
        til: l.epost,
        emne: `Ny forespørsel: ${anledning} for ${f.gjester} i ${f.poststed}`,
        html: mal({
          tittel: 'Ny forespørsel i ditt område',
          avsnitt: [...linjer, `Det koster ${f.klipp_pris} klipp å låse opp. Høyst ${MAKS_LEVERANDORER} leverandører kan svare.`],
          knapp: { tekst: 'Se forespørselen', sti: '/leverandor' },
          fot: 'Du får denne e-posten fordi bedriften din er leverandør på Kuverto og dekker dette området.',
        }),
      }),
    ),
  );
  const ingen = !lev?.length;
  await sendEpost({
    til: ADMIN_VARSEL,
    emne: ingen
      ? `[Kuverto] REKRUTTER: ingen leverandører i ${f.poststed} – ${anledning} ${f.gjester}`
      : `[Kuverto] Ny forespørsel: ${anledning} ${f.gjester} i ${f.poststed}`,
    html: mal({
      tittel: ingen ? `Ingen leverandører dekker ${f.poststed}` : 'Ny bekreftet forespørsel',
      avsnitt: [
        ...(ingen
          ? [`Ingen godkjente leverandører har oppgitt at de leverer i kommunen (${f.kommunenr}). Kunden har fått beskjed om det. Finn en lokal leverandør og be dem registrere seg, så ser de forespørselen med en gang de er godkjent og har lagt til kommunen.`]
          : []),
        ...(k ? fullstendigeLinjer(f, k) : linjer),
        `Varslet ${lev?.length ?? 0} godkjente leverandører i kommunen.`,
      ],
      knapp: { tekst: 'Åpne i admin', sti: `/admin/foresporsler/${f.id}` },
    }),
  });
}
