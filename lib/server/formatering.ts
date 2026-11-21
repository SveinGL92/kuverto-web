import 'server-only';
import { fyll, type T } from '@/lib/i18n/core';
import { anledningNavn, budsjettNavn, kostholdLinje, serveringNavn } from '@/lib/labels';
import { erMarked, MARKED_INFO, type Marked } from '@/lib/markets';
import type { Anledning, Budsjett, Kostholdstype, Servering } from '@/lib/types';

/** Uten oversetter: norsk. Send inn t (tFor(marked)) for andre språk. */
const norsk: T = (x, v) => fyll(x, v);

/** Markedet fra en databaserad (foresporsler.marked), ellers Norge. */
const markedFra = (v: unknown): Marked => (erMarked(v) ? v : 'no');

export const datoTekst = (iso: string | null, t: T = norsk, intl = 'nb-NO') =>
  iso ? new Date(iso + 'T12:00:00Z').toLocaleDateString(intl, { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'Europe/Oslo' }) : t('fleksibel dato');

export interface KostholdRad {
  type: Kostholdstype;
  antall: number;
  alvorlig?: boolean;
}

export const kostholdTekst = (k: KostholdRad[], t: T = norsk) =>
  k.length ? k.map((x) => kostholdLinje(x, t)).join(', ') : t('ingen oppgitt');

type ForesporselRad = {
  anledning: string;
  gjester: number;
  dato: string | null;
  klokkeslett: string;
  omrade_visning: string;
  servering?: string | null;
  budsjett: string;
  levering?: string;
  kosthold: unknown;
  marked?: string | null;
};

/**
 * Kort beskrivelse uten personopplysninger, trygg å vise leverandører før opplåsing.
 * t: språket teksten skrives på (standard norsk). marked: valuta på budsjettet (standard f.marked, ellers Norge).
 * intl: datoformat (standard markedets; send 'nb-NO' for norsk tekst om et utenlandsk marked).
 */
export function foresporselLinjer(f: ForesporselRad, t: T = norsk, marked: Marked = markedFra(f.marked), intl: string = MARKED_INFO[marked].intl) {
  const dato = datoTekst(f.dato, t, intl);
  const kl = f.klokkeslett;
  return [
    t('{anledning} for {gjester} gjester', { anledning: anledningNavn(f.anledning as Anledning, t), gjester: f.gjester }),
    f.levering === 'henting' ? t('Når: {dato}, hentes kl. {kl}', { dato, kl }) : t('Når: {dato}, leveres før kl. {kl}', { dato, kl }),
    t('Hvor: {omrade}', { omrade: f.omrade_visning }),
    f.servering ? t('Servering: {servering}', { servering: serveringNavn(f.servering as Servering, t) }) : '',
    f.budsjett === 'vet_ikke'
      ? t('Budsjett: {budsjett}', { budsjett: budsjettNavn(f.budsjett as Budsjett, marked, t) })
      : t('Budsjett: {budsjett} per kuvert', { budsjett: budsjettNavn(f.budsjett as Budsjett, marked, t) }),
    t('Kosthold: {kosthold}', { kosthold: kostholdTekst((f.kosthold as KostholdRad[]) ?? [], t) }),
  ].filter(Boolean);
}

/** Alt kunden har fylt ut, til bekreftelsen og admin. Inneholder personopplysninger: aldri til leverandører før opplåsing. */
export function fullstendigeLinjer(
  f: ForesporselRad & { postnummer: string; poststed: string; levering: string; fleksibel_dato?: boolean },
  k: { navn: string; firma?: string | null; epost: string; telefon?: string | null; melding?: string | null; adresse?: string | null },
  t: T = norsk,
  marked: Marked = markedFra(f.marked),
  intl: string = MARKED_INFO[marked].intl,
) {
  const linjer = foresporselLinjer(f, t, marked, intl);
  const [hva, naar] = linjer;
  const sted = [k.adresse, `${f.postnummer} ${f.poststed}`].filter(Boolean).join(', ');
  return [
    hva,
    f.dato && f.fleksibel_dato ? t('{naar} (datoen er fleksibel)', { naar }) : naar,
    t('Sted: {sted} · {levering}', { sted, levering: f.levering === 'henting' ? t('henting') : t('levering') }),
    ...linjer.slice(3),
    t('Andre ønsker: {melding}', { melding: k.melding?.trim() || t('ingen') }),
    t('Kontakt: {kontakt}', { kontakt: `${[k.navn, k.firma].filter(Boolean).join(', ')} · ${k.epost}${k.telefon ? ` · ${k.telefon}` : ''}` }),
  ];
}
