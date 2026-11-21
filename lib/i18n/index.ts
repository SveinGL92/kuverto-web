import { MARKED_INFO, type Marked, type Sprak } from '@/lib/markets';
import { lagT, type Ordbok } from './core';
import { ORD } from './ord';
import innhold from './ord/innhold';

export * from './core';

/** Ordboken for et språk (bare på serveren; klienten får sin via SprakProvider). */
export function ordbok(sprak: Sprak): Ordbok {
  return sprak === 'nb' ? {} : ORD[sprak];
}

export const tFor = (marked: Marked) => lagT(ordbok(MARKED_INFO[marked].sprak));

/** For lange innholdstekster som bare brukes i serverkomponenter (holdes utenfor klientens ordbok). Faller tilbake til den vanlige ordboken. */
export const tInnhold = (marked: Marked) => {
  const sprak = MARKED_INFO[marked].sprak;
  if (sprak === 'nb') return lagT({});
  return lagT({ ...ORD[sprak], ...innhold[sprak] });
};
