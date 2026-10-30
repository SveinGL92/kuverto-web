import 'server-only';
import { anledningNavn, budsjettNavn, kostholdLinje, serveringNavn } from '@/lib/labels';
import type { Anledning, Budsjett, Kostholdstype, Servering } from '@/lib/types';

export const datoTekst = (iso: string | null) =>
  iso ? new Date(iso + 'T12:00:00Z').toLocaleDateString('nb-NO', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'Europe/Oslo' }) : 'fleksibel dato';

export interface KostholdRad {
  type: Kostholdstype;
  antall: number;
  alvorlig?: boolean;
}

export const kostholdTekst = (k: KostholdRad[]) =>
  k.length ? k.map(kostholdLinje).join(', ') : 'ingen oppgitt';

/** Kort beskrivelse uten personopplysninger, trygg å vise leverandører før opplåsing. */
export function foresporselLinjer(f: {
  anledning: string;
  gjester: number;
  dato: string | null;
  klokkeslett: string;
  omrade_visning: string;
  servering?: string | null;
  budsjett: string;
  levering?: string;
  kosthold: unknown;
}) {
  return [
    `${anledningNavn(f.anledning as Anledning)} for ${f.gjester} gjester`,
    `Når: ${datoTekst(f.dato)}, ${f.levering === 'henting' ? 'hentes' : 'leveres før'} kl. ${f.klokkeslett}`,
    `Hvor: ${f.omrade_visning}`,
    f.servering ? `Servering: ${serveringNavn(f.servering as Servering)}` : '',
    `Budsjett: ${budsjettNavn(f.budsjett as Budsjett)}${f.budsjett === 'vet_ikke' ? '' : ' per kuvert'}`,
    `Kosthold: ${kostholdTekst((f.kosthold as KostholdRad[]) ?? [])}`,
  ].filter(Boolean);
}

/** Alt kunden har fylt ut, til bekreftelsen og admin. Inneholder personopplysninger: aldri til leverandører før opplåsing. */
export function fullstendigeLinjer(
  f: Parameters<typeof foresporselLinjer>[0] & { postnummer: string; poststed: string; levering: string; fleksibel_dato?: boolean },
  k: { navn: string; firma?: string | null; epost: string; telefon?: string | null; melding?: string | null; adresse?: string | null },
) {
  const linjer = foresporselLinjer(f);
  const [hva, naar] = linjer;
  return [
    hva,
    `${naar}${f.dato && f.fleksibel_dato ? ' (datoen er fleksibel)' : ''}`,
    `Sted: ${[k.adresse, `${f.postnummer} ${f.poststed}`].filter(Boolean).join(', ')} · ${f.levering === 'henting' ? 'henting' : 'levering'}`,
    ...linjer.slice(3),
    `Andre ønsker: ${k.melding?.trim() || 'ingen'}`,
    `Kontakt: ${[k.navn, k.firma].filter(Boolean).join(', ')} · ${k.epost}${k.telefon ? ` · ${k.telefon}` : ''}`,
  ];
}
