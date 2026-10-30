import 'server-only';
import type { Anledning, Budsjett, Foresporsel, ForesporselKontakt, Kosthold, Levering, Servering, Tilbud, VedleggFil } from '@/lib/types';
import { db } from './supabase';

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
  servering: (r.servering as Servering | null) ?? null,
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

type LagretVedlegg = VedleggFil;

/** Signerte lenker (1 time) til vedleggene på tilbudene, nøkkel = sti. */
export async function signerVedlegg(rader: Rad[]): Promise<Map<string, string>> {
  const stier = rader.flatMap((r) => ((r.vedlegg as LagretVedlegg[]) ?? []).map((v) => v.sti));
  if (!stier.length) return new Map();
  const { data } = await db().storage.from('vedlegg').createSignedUrls(stier, 3600);
  return new Map((data ?? []).filter((d) => d.signedUrl && d.path).map((d) => [d.path as string, d.signedUrl as string]));
}

export const tilTilbud = (r: Rad, lev: { navn: string; beskrivelse?: string | null }, i: number, lenker?: Map<string, string>): Tilbud => {
  const vedlegg = ((r.vedlegg as LagretVedlegg[]) ?? [])
    .map((v) => ({ navn: v.navn, type: v.type, storrelse: v.storrelse, url: lenker?.get(v.sti) ?? '' }))
    .filter((v) => v.url);
  const forsteBilde = vedlegg.find((v) => v.type.startsWith('image/') && !/heic|heif/.test(v.type));
  return {
  id: r.id,
  foresporselId: r.foresporsel_id,
  leverandorId: r.leverandor_id,
  leverandorNavn: lev.navn,
  leverandorBeskrivelse: lev.beskrivelse ?? undefined,
  bilde: forsteBilde ? { src: forsteBilde.url, alt: `Bilde fra ${lev.navn}` } : { src: BILDER[i % BILDER.length], alt: 'Illustrasjonsbilde, ikke leverandørens egen mat' },
  prisPerKuvert: r.pris_per_kuvert,
  totalInklMva: r.total_inkl_mva,
  meny: r.meny,
  kosthold: { dekket: r.kosthold_dekket, tekst: r.kosthold_tekst || (r.kosthold_dekket ? 'Dekket' : 'Ikke oppgitt'), merknad: r.kosthold_merknad ?? undefined },
  levering: { inkludert: r.levering_inkludert, pris: r.levering_pris ?? undefined },
  oppsettOgRydding: r.oppsett_og_rydding,
  servise: r.servise || 'Ikke oppgitt',
  gyldigTil: r.gyldig_til,
  betingelser: r.betingelser ?? undefined,
  menyUrl: r.meny_url ?? undefined,
  vedlegg,
  status: r.status,
  opprettet: r.opprettet,
  };
};
