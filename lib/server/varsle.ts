import 'server-only';
import { tFor } from '@/lib/i18n';
import { MAKS_LEVERANDORER } from '@/lib/klipp';
import { anledningNavn } from '@/lib/labels';
import { erMarked, MARKED_INFO, type Marked } from '@/lib/markets';
import type { Anledning } from '@/lib/types';
import { ADMIN_VARSEL, mal, sendEpost } from './epost';
import { foresporselLinjer, fullstendigeLinjer } from './formatering';
import { db } from './supabase';

const markedFra = (v: unknown): Marked => (erMarked(v) ? v : 'no');

/** Varsler godkjente leverandører i kommunen (samme marked) og admin om en bekreftet forespørsel. */
export async function varsleOmForesporsel(id: string) {
  const s = db();
  const { data: f } = await s.from('foresporsler').select('*').eq('id', id).single();
  if (!f) return;
  const { data: k } = await s.from('foresporsel_kontakt').select('navn, firma, epost, telefon, melding, adresse').eq('foresporsel_id', id).single();
  const fMarked = markedFra(f.marked);

  const { data: dekning } = await s.from('dekning').select('leverandor_id').eq('kommunenr', f.kommunenr);
  const ider = (dekning ?? []).map((d) => d.leverandor_id);
  const { data: lev } = ider.length
    ? await s.from('leverandorer').select('epost, marked').in('id', ider).eq('status', 'godkjent').eq('marked', fMarked)
    : { data: [] };
  await Promise.all(
    (lev ?? []).map((l) => {
      // Hver leverandør får e-posten på sitt språk. Beløp i forespørselens valuta.
      const lMarked = markedFra(l.marked);
      const t = tFor(lMarked);
      const anledning = anledningNavn(f.anledning as Anledning, t).toLowerCase();
      return sendEpost({
        til: l.epost,
        emne: t('Ny forespørsel: {anledning} for {gjester} i {sted}', { anledning, gjester: f.gjester, sted: f.poststed }),
        html: mal({
          tittel: t('Ny forespørsel i ditt område'),
          avsnitt: [
            ...foresporselLinjer(f, t, fMarked, MARKED_INFO[lMarked].intl),
            t('Det koster {klipp} klipp å låse opp. Høyst {maks} leverandører kan svare.', { klipp: f.klipp_pris, maks: MAKS_LEVERANDORER }),
          ],
          knapp: { tekst: t('Se forespørselen'), sti: '/leverandor' },
          fot: t('Du får denne e-posten fordi bedriften din er leverandør på Kuverto og dekker dette området.'),
          marked: lMarked,
        }),
      });
    }),
  );

  // Admin: alltid norsk. Landet står i emnet når forespørselen ikke er norsk.
  const anledning = anledningNavn(f.anledning as Anledning).toLowerCase();
  const merke = fMarked === 'no' ? '[Kuverto]' : `[Kuverto ${fMarked.toUpperCase()}]`;
  const linjer = foresporselLinjer(f, undefined, fMarked, 'nb-NO');
  const ingen = !lev?.length;
  await sendEpost({
    til: ADMIN_VARSEL,
    emne: ingen
      ? `${merke} REKRUTTER: ingen leverandører i ${f.poststed} – ${anledning} ${f.gjester}`
      : `${merke} Ny forespørsel: ${anledning} ${f.gjester} i ${f.poststed}`,
    html: mal({
      tittel: ingen ? `Ingen leverandører dekker ${f.poststed}` : 'Ny bekreftet forespørsel',
      avsnitt: [
        ...(ingen
          ? [`Ingen godkjente leverandører har oppgitt at de leverer i kommunen (${f.kommunenr}). Kunden har fått beskjed om det. Finn en lokal leverandør og be dem registrere seg, så ser de forespørselen med en gang de er godkjent og har lagt til kommunen.`]
          : []),
        ...(k ? fullstendigeLinjer(f, k, undefined, fMarked, 'nb-NO') : linjer),
        `Varslet ${lev?.length ?? 0} godkjente leverandører i kommunen.`,
      ],
      knapp: { tekst: 'Åpne i admin', sti: `/admin/foresporsler/${f.id}` },
    }),
  });
}
