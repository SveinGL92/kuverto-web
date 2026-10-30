// Datamodellen for Kuverto. Mock-dataene i fase 1 har samme form som tabellene i Supabase får i fase 2.
// Beløp lagres i øre (heltall), som i Samtura. Datoer er ISO-strenger.

export type Anledning =
  | 'firmalunsj'
  | 'motemat'
  | 'julebord'
  | 'bryllup'
  | 'konfirmasjon'
  | 'minnesamvaer'
  | 'privat_fest'
  | 'sommerfest'
  | 'dap'
  | 'jubileum'
  | 'kurs_konferanse'
  | 'kaker_bakst'
  | 'frokost'
  | 'fingermat'
  | 'buffet'
  | 'grill'
  | 'vegetar_vegansk'
  | 'annet';

export type Levering = 'levering' | 'henting';

export type Servering = 'levert_ferdig' | 'buffet_oppsett' | 'servert_bordet' | 'fingermat';

/** Kosthold og livssyn, pluss de 14 allergenene Mattilsynet krever merket (matinformasjonsforskriften). */
export type Kostholdstype =
  | 'vegetar'
  | 'vegansk'
  | 'laktosefri'
  | 'halal'
  | 'uten_svin'
  | 'gluten'
  | 'skalldyr'
  | 'egg'
  | 'fisk'
  | 'peanotter'
  | 'soya'
  | 'melk'
  | 'notter'
  | 'selleri'
  | 'sennep'
  | 'sesam'
  | 'lupin'
  | 'blotdyr'
  | 'sulfitt';

export type Budsjett = 'under_250' | '250_400' | '400_600' | 'over_600' | 'vet_ikke';

export type ForesporselStatus =
  | 'utkast'
  | 'venter_bekreftelse'
  | 'til_godkjenning'
  | 'aktiv'
  | 'tildelt'
  | 'lukket'
  | 'trukket'
  | 'avvist';

export interface Kosthold {
  type: Kostholdstype;
  antall: number;
  alvorlig?: boolean;
}

/** Gjentakende levering, for eksempel fast lunsj hver tirsdag. */
export interface Gjentakelse {
  ukedager: number[]; // 1 = mandag
  fra: string;
  til?: string;
}

export interface Foresporsel {
  id: string;
  kundeId: string;
  status: ForesporselStatus;
  anledning: Anledning;
  gjester: number;
  dato: string; // YYYY-MM-DD, tom når datoen er fleksibel
  klokkeslett: string; // HH:MM
  varighet: string;
  fleksibelDato: boolean;
  gjentakelse?: Gjentakelse;
  postnummer: string;
  poststed: string;
  kommunenr: string;
  fylkesnr: string;
  levering: Levering;
  /** Utgått fra skjemaet (avtales med leverandøren). Finnes bare på eldre forespørsler. */
  servering?: Servering | null;
  kosthold: Kosthold[];
  budsjett: Budsjett;
  maksLeverandorer: number;
  klippPris: number;
  opprettet: string;
  /** Kort tekst leverandørene ser før opplåsing, f.eks. «Oslo sentrum (01xx)». */
  omradeVisning: string;
}

/** Skjult til en leverandør har låst opp. Egen tabell med egen tilgangsregel. */
export interface ForesporselKontakt {
  foresporselId: string;
  navn: string;
  firma?: string;
  epost: string;
  telefon?: string;
  adresse?: string; // hentes når kunden velger et tilbud
  melding?: string;
}

export type LeverandorStatus = 'venter' | 'godkjent' | 'avvist' | 'suspendert';

export interface Leverandor {
  id: string;
  navn: string;
  orgnr: string;
  status: LeverandorStatus;
  /** Kommunenumre leverandøren dekker. */
  dekning: string[];
  dekningVisning: string;
  klippsaldo: number;
}

export type TilbudStatus = 'sendt' | 'endret' | 'godtatt' | 'avslatt' | 'trukket' | 'utlopt';

export interface Tilbud {
  id: string;
  foresporselId: string;
  leverandorId: string;
  leverandorNavn: string;
  /** Kort presentasjon av leverandøren, hentes fra leverandørprofilen. */
  leverandorBeskrivelse?: string;
  bilde: { src: string; alt: string };
  prisPerKuvert: number; // øre
  totalInklMva: number; // øre
  meny: string;
  kosthold: { dekket: boolean; tekst: string; merknad?: string };
  levering: { inkludert: boolean; pris?: number };
  oppsettOgRydding: boolean;
  servise: string;
  gyldigTil: string; // YYYY-MM-DD
  /** Betingelser leverandøren vil at kunden skal se, f.eks. avbestilling og betaling. */
  betingelser?: string;
  /** Lenke til menyen på leverandørens nettside. */
  menyUrl?: string;
  /** Bilder og PDF-er fra leverandøren, med midlertidige signerte lenker. */
  vedlegg?: Vedlegg[];
  status: TilbudStatus;
  opprettet: string;
}

/** Vedlegg slik det lagres på tilbudet (sti i bøtta «vedlegg»). */
export interface VedleggFil {
  sti: string;
  navn: string;
  type: string;
  storrelse: number;
}

export interface Vedlegg {
  navn: string;
  type: string;
  storrelse: number;
  url: string;
}

export type OpplasingStatus = 'aktiv' | 'refundert' | 'trukket';

export interface Opplasing {
  id: string;
  foresporselId: string;
  leverandorId: string;
  metode: 'klipp' | 'kort' | 'admin';
  klipp: number;
  status: OpplasingStatus;
  svarfrist?: string;
  opprettet: string;
}

export interface Melding {
  id: string;
  samtaleId: string;
  fra: string;
  tekst: string;
  ulest: boolean;
  sendtAvMeg: boolean;
  opprettet: string;
}

export type Rolle = 'kunde' | 'leverandor';
