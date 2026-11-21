import { MARKED_INFO, type Marked, type Sprak } from '@/lib/markets';
import { lagT, type Ordbok } from './core';
import { ORD } from './ord';

export * from './core';

/** Ordboken for et språk (bare på serveren; klienten får sin via SprakProvider). */
export function ordbok(sprak: Sprak): Ordbok {
  return sprak === 'nb' ? {} : ORD[sprak];
}

export const tFor = (marked: Marked) => lagT(ordbok(MARKED_INFO[marked].sprak));
