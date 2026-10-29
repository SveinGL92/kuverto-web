import 'server-only';
import type { Anledning, Budsjett, Foresporsel, ForesporselKontakt, Kosthold, Levering, Servering, Tilbud } from '@/lib/types';

/* Oversetter rader fra databasen (snake_case) til typene i lib/types.ts (camelCase). */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Rad = Record<string, any>;

export const tilForesporsel = (r: Rad): Foresporsel => ({
  id: r.id,
  kundeId: '', // kundens e-post sendes aldri til nettleseren
  status: r.status,
  anledning: r.anledning as Anledning,
  gjester: r.gjester,
  dato: r.dato ?? '',
  klokkeslett: r.klokkeslett,
  varighet: r.varighet ?? '',
  fleksibelDato: r.fleksibel_dato,
  postnummer: r.postnummer,
  poststed: r.poststed,
  kommunenr: r.kommunenr,
  fylkesnr: r.fylkesnr,
  levering: r.levering as Levering,
  servering: r.servering as Servering,
  kosthold: (r.kosthold ?? []) as Kosthold[],
  budsjett: r.budsjett as Budsjett,
  maksLeverandorer: r.maks_leverandorer,
  klippPris: r.klipp_pris,
  opprettet: r.opprettet,
  omradeVisning: r.omrade_visning,
});

export const tilKontakt = (r: Rad): ForesporselKontakt => ({
  foresporselId: r.foresporsel_id,
  navn: r.navn,
  firma: r.firma ?? undefined,
  epost: r.epost,
  telefon: r.telefon ?? undefined,
  adresse: r.adresse ?? undefined,
  melding: r.melding ?? undefined,
});

const BILDER = ['/bilder/tilbud-a.webp', '/bilder/tilbud-b.webp', '/bilder/tilbud-c.webp', '/bilder/smorbrod.webp', '/bilder/hero-langbord.webp'];

export const tilTilbud = (r: Rad, lev: { navn: string; beskrivelse?: string | null }, i: number): Tilbud => ({
  id: r.id,
  foresporselId: r.foresporsel_id,
  leverandorId: r.leverandor_id,
  leverandorNavn: lev.navn,
  leverandorBeskrivelse: lev.beskrivelse ?? undefined,
  bilde: { src: BILDER[i % BILDER.length], alt: 'Illustrasjonsbilde, ikke leverandørens egen mat' },
  prisPerKuvert: r.pris_per_kuvert,
  totalInklMva: r.total_inkl_mva,
  meny: r.meny,
  kosthold: { dekket: r.kosthold_dekket, tekst: r.kosthold_tekst || (r.kosthold_dekket ? 'Dekket' : 'Ikke oppgitt'), merknad: r.kosthold_merknad ?? undefined },
  levering: { inkludert: r.levering_inkludert, pris: r.levering_pris ?? undefined },
  oppsettOgRydding: r.oppsett_og_rydding,
  servise: r.servise || 'Ikke oppgitt',
  gyldigTil: r.gyldig_til,
  betingelser: r.betingelser ?? undefined,
  status: r.status,
  opprettet: r.opprettet,
});
