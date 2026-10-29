import 'server-only';
import { anledningNavn, budsjettNavn, kostholdNavn, serveringNavn } from '@/lib/labels';
import type { Anledning, Budsjett, Kostholdstype, Servering } from '@/lib/types';

export const datoTekst = (iso: string | null) =>
  iso ? new Date(iso + 'T12:00:00Z').toLocaleDateString('nb-NO', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'Europe/Oslo' }) : 'fleksibel dato';

export interface KostholdRad {
  type: Kostholdstype;
  antall: number;
  alvorlig?: boolean;
}

export const kostholdTekst = (k: KostholdRad[]) =>
  k.length ? k.map((x) => `${kostholdNavn(x.type)} ${x.antall}${x.alvorlig ? ' (alvorlig)' : ''}`).join(', ') : 'ingen oppgitt';

/** Kort beskrivelse uten personopplysninger, trygg å vise leverandører før opplåsing. */
export function foresporselLinjer(f: {
  anledning: string;
  gjester: number;
  dato: string | null;
  klokkeslett: string;
  omrade_visning: string;
  servering: string;
  budsjett: string;
  kosthold: unknown;
}) {
  return [
    `${anledningNavn(f.anledning as Anledning)} for ${f.gjester} gjester`,
    `Når: ${datoTekst(f.dato)}${f.dato ? ` kl. ${f.klokkeslett}` : ''}`,
    `Hvor: ${f.omrade_visning}`,
    `Servering: ${serveringNavn(f.servering as Servering)}`,
    `Budsjett: ${budsjettNavn(f.budsjett as Budsjett)}${f.budsjett === 'vet_ikke' ? '' : ' per kuvert'}`,
    `Kosthold: ${kostholdTekst((f.kosthold as KostholdRad[]) ?? [])}`,
  ];
}
