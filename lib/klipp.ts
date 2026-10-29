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

export const MVA_SATS = 0.25;
/** Flest leverandører som kan låse opp samme forespørsel. */
export const MAKS_LEVERANDORER = 5;
/** Gratis klipp til nye leverandører i piloten. */
export const PILOT_GRATIS_KLIPP = 20;
/** Klippene refunderes hvis kunden trekker forespørselen eller ikke svarer innen så mange dager. */
export const REFUSJON_ETTER_DAGER = 7;

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

/** Laveste og høyeste pris per klipp i øre, eks. mva (største og minste pakke). */
export const prisPerKlipp = (p: Klippakke) => p.prisEksMva / p.klipp;
export const KLIPP_PRIS_SPENN = {
  min: Math.min(...KLIPPAKKER.map(prisPerKlipp)),
  maks: Math.max(...KLIPPAKKER.map(prisPerKlipp)),
};
