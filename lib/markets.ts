/**
 * Markeder (land). Kuverto kjører på kuverto.no med landprefiks, som Samtura:
 * Norge uten prefiks, Sverige /se, Danmark /dk og Finland /fi.
 * Ingen server-kode her: brukes i proxy, server og klient.
 */
export const MARKEDER = ['no', 'se', 'dk', 'fi'] as const;
export type Marked = (typeof MARKEDER)[number];
export type Sprak = 'nb' | 'sv' | 'da' | 'fi';
export type Valuta = 'NOK' | 'SEK' | 'DKK' | 'EUR';

export const STANDARD_MARKED: Marked = 'no';
export const MARKED_COOKIE = 'kuverto_marked';
export const MARKED_HEADER = 'x-kuverto-marked';

export interface MarkedInfo {
  kode: Marked;
  sprak: Sprak;
  htmlLang: string;
  intl: string;
  ogLocale: string;
  valuta: Valuta;
  /** Omregning fra NOK for priser og budsjett (samme som Samtura: SEK = NOK, DKK × 0,7, EUR ÷ 10). */
  faktor: number;
  /** Landets navn på eget språk. */
  land: string;
  sprakNavn: string;
  postnummerLengde: 4 | 5;
  /** Eksempel på postnummer i hjelpetekster. */
  postnummerEksempel: string;
  /** Leverandører i EU kjøper klipp med omvendt avgiftsplikt og må oppgi MVA-nummer. */
  omvendtAvgift: boolean;
  mvaPrefiks: string | null;
  /** Navn på organisasjonsnummer og register. */
  orgnr: { navn: string; eksempel: string; register: string };
  /** Hva de øverste områdene heter (fylke, län, region, maakunta). */
  omrade: string;
}

export const MARKED_INFO: Record<Marked, MarkedInfo> = {
  no: {
    kode: 'no', sprak: 'nb', htmlLang: 'nb', intl: 'nb-NO', ogLocale: 'nb_NO', valuta: 'NOK', faktor: 1,
    land: 'Norge', sprakNavn: 'Norsk', postnummerEksempel: '0150', postnummerLengde: 4, omvendtAvgift: false, mvaPrefiks: null,
    orgnr: { navn: 'Organisasjonsnummer', eksempel: '924 772 115', register: 'Enhetsregisteret' }, omrade: 'Fylke',
  },
  se: {
    kode: 'se', sprak: 'sv', htmlLang: 'sv', intl: 'sv-SE', ogLocale: 'sv_SE', valuta: 'SEK', faktor: 1,
    land: 'Sverige', sprakNavn: 'Svenska', postnummerEksempel: '11122', postnummerLengde: 5, omvendtAvgift: true, mvaPrefiks: 'SE',
    orgnr: { navn: 'Organisationsnummer', eksempel: '556677-8899', register: 'Bolagsverket' }, omrade: 'Län',
  },
  dk: {
    kode: 'dk', sprak: 'da', htmlLang: 'da', intl: 'da-DK', ogLocale: 'da_DK', valuta: 'DKK', faktor: 0.7,
    land: 'Danmark', sprakNavn: 'Dansk', postnummerEksempel: '2100', postnummerLengde: 4, omvendtAvgift: true, mvaPrefiks: 'DK',
    orgnr: { navn: 'CVR-nummer', eksempel: '12345678', register: 'CVR' }, omrade: 'Region',
  },
  fi: {
    kode: 'fi', sprak: 'fi', htmlLang: 'fi', intl: 'fi-FI', ogLocale: 'fi_FI', valuta: 'EUR', faktor: 0.1,
    land: 'Suomi', sprakNavn: 'Suomi', postnummerEksempel: '00100', postnummerLengde: 5, omvendtAvgift: true, mvaPrefiks: 'FI',
    orgnr: { navn: 'Y-tunnus', eksempel: '1234567-8', register: 'YTJ' }, omrade: 'Maakunta',
  },
};

/** Settes til true når Sverige, Danmark og Finland er ferdig oversatt og testet. */
export const UTLAND_LANSERT = true;

export const erMarked = (v: unknown): v is Marked => typeof v === 'string' && (MARKEDER as readonly string[]).includes(v);

/** Legger landprefiks på en intern sti: medPrefiks('se', '/foresporsel') → '/se/foresporsel'. */
export function medPrefiks(marked: Marked, sti: string): string {
  // API, innlogging, admin og filer har ikke landprefiks (se proxy.ts).
  if (marked === 'no' || /^https?:/.test(sti) || /^\/(api|auth|admin|logg-ut|epost)(\/|$|\?)/.test(sti)) return sti;
  if (sti === '/' || sti === '') return `/${marked}`;
  return `/${marked}${sti.startsWith('/') ? sti : `/${sti}`}`;
}

/** Beløp i minste enhet (øre/öre/cent) til «kr 289», «289 kr», «289 kr.» eller «29 €». */
export function penger(minor: number, marked: Marked): string {
  const m = MARKED_INFO[marked];
  const n = Math.round(minor / 100);
  const tall = new Intl.NumberFormat(m.intl, { maximumFractionDigits: 0 }).format(n).replace(/[  ]/g, ' ');
  if (marked === 'no') return `kr ${tall}`;
  if (marked === 'se') return `${tall} kr`;
  if (marked === 'dk') return `${tall} kr.`;
  return `${tall} €`;
}

/** NOK-beløp (i øre) omregnet til markedets valuta og avrundet pent. */
export function fraNok(ore: number, marked: Marked): number {
  const f = MARKED_INFO[marked].faktor;
  if (f === 1) return ore;
  const v = ore * f;
  const steg = marked === 'fi' ? 100 : 500; // hele euro, eller nærmeste 5 kr
  return Math.round(v / steg) * steg;
}
