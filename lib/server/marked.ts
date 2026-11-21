import 'server-only';
import { headers } from 'next/headers';
import { lagT, ordbok } from '@/lib/i18n';
import { erMarked, MARKED_HEADER, MARKED_INFO, medPrefiks, penger, STANDARD_MARKED, type Marked } from '@/lib/markets';

/** Markedet for denne forespørselen, satt av proxy ut fra landprefikset i adressen. */
export async function aktivtMarked(): Promise<Marked> {
  const v = (await headers()).get(MARKED_HEADER);
  return erMarked(v) ? v : STANDARD_MARKED;
}

/** Alt en serverkomponent trenger for språk og marked. */
export async function sprak() {
  const marked = await aktivtMarked();
  const info = MARKED_INFO[marked];
  const t = lagT(ordbok(info.sprak));
  return {
    marked,
    info,
    t,
    sti: (s: string) => medPrefiks(marked, s),
    penger: (minor: number) => penger(minor, marked),
  };
}
