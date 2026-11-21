import { fyll, type T } from './i18n/core';
import { fraNok, type Marked } from './markets';
import type { Budsjett } from './types';

/**
 * Prisregler for klipp. Vedtatt 27.10.2026.
 * Pakkene finnes som produkter i Stripe (Kuverto-kontoen) med samme id.
 * Pris-id hentes fra produktets standardpris, så test og live kan ha ulike priser.
 */
export interface Klippakke {
  id: 'klipp_start' | 'klipp_vanlig' | 'klipp_stor';
  navn: string;
  klipp: number;
  prisEksMva: number; // øre
}

export const KLIPPAKKER: Klippakke[] = [
  { id: 'klipp_start', navn: 'Start', klipp: 20, prisEksMva: 149000 },
  { id: 'klipp_vanlig', navn: 'Vanlig', klipp: 50, prisEksMva: 329000 },
  { id: 'klipp_stor', navn: 'Stor', klipp: 120, prisEksMva: 699000 },
];

/** Pakkens pris eks. mva i markedets valuta (minste enhet): SEK = NOK, DKK × 0,7, EUR ÷ 10. */
export const pakkePris = (p: Klippakke, marked: Marked = 'no') => fraNok(p.prisEksMva, marked);

export const MVA_SATS = 0.25;
/** Flest leverandører som kan låse opp samme forespørsel. */
export const MAKS_LEVERANDORER = 5;
/** Gratis klipp til nye leverandører i piloten. */
export const PILOT_GRATIS_KLIPP = 20;
/** Klippene refunderes hvis kunden trekker forespørselen eller ikke svarer innen så mange dager. */
export const REFUSJON_ETTER_DAGER = 7;
/** Uten oversetter: norsk. */
const ingen: T = (s, vars) => fyll(s, vars);
/** Refusjonsregelen slik den vises for leverandører. Samme regel kjøres i databasen (trekk_foresporsel og daglig_vedlikehold). Send inn t for andre språk. */
export const refusjonKort = (t: T = ingen) =>
  t('Klippene tilbake hvis kunden trekker forespørselen, eller ikke svarer innen {dager} dager etter at du sendte tilbudet.', { dager: REFUSJON_ETTER_DAGER });
export const refusjonLang = (t: T = ingen) =>
  t(
    'Du får klippene tilbake hvis kunden trekker forespørselen, eller Kuverto stopper den. Du får dem også tilbake hvis kunden ikke svarer innen {dager} dager etter at du sendte tilbudet. Å svare betyr å velge tilbudet, avslå det eller skrive til deg. Sender du ikke tilbud, beholder vi klippene.',
    { dager: REFUSJON_ETTER_DAGER },
  );
/** Norsk tekst (beholdt for eldre bruk). Bruk refusjonKort(t) / refusjonLang(t). */
export const REFUSJON_KORT = refusjonKort();
export const REFUSJON_LANG = refusjonLang();

/** Typisk pris per kuvert i øre for hvert budsjettvalg, brukt til å anslå oppdragets verdi. */
const ANSLATT_PER_KUVERT: Record<Budsjett, number> = {
  under_250: 20000,
  '250_400': 32500,
  '400_600': 50000,
  over_600: 70000,
  vet_ikke: 35000,
};

/** Trinn: anslått verdi i øre (øvre grense, ikke inkludert) → klipp. */
export const TRINN: { under: number; klipp: number }[] = [
  { under: 1_000_000, klipp: 2 },
  { under: 3_000_000, klipp: 4 },
  { under: 7_500_000, klipp: 7 },
  { under: Infinity, klipp: 10 },
];

export function anslattVerdi(gjester: number, budsjett: Budsjett): number {
  return gjester * ANSLATT_PER_KUVERT[budsjett];
}

/** Hvor mange klipp det koster å låse opp en forespørsel. */
export function klippForForesporsel(gjester: number, budsjett: Budsjett): number {
  const verdi = anslattVerdi(gjester, budsjett);
  return TRINN.find((t) => verdi < t.under)!.klipp;
}

/** Pris per klipp i markedets valuta (minste enhet), eks. mva. Uten marked: NOK. */
export const prisPerKlipp = (p: Klippakke, marked: Marked = 'no') => pakkePris(p, marked) / p.klipp;
/** Laveste og høyeste pris per klipp i markedets valuta (minste enhet), eks. mva (største og minste pakke). */
export const klippPrisSpenn = (marked: Marked = 'no') => ({
  min: Math.min(...KLIPPAKKER.map((p) => prisPerKlipp(p, marked))),
  maks: Math.max(...KLIPPAKKER.map((p) => prisPerKlipp(p, marked))),
});
/** I NOK (øre). */
export const KLIPP_PRIS_SPENN = klippPrisSpenn('no');
