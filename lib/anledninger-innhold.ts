import type { Anledning } from './types';

/**
 * Innhold til anledningskortene på forsiden og landingssidene under /catering/[slug].
 * Teksten beskriver hvordan tjenesten fungerer for anledningen. Ingen påstander om priser,
 * antall leverandører eller kunder før vi har ekte tall.
 */
export interface AnledningInnhold {
  id: Anledning;
  slug: string;
  navn: string;
  /** Kort navn til kort og brødsmuler. */
  kortnavn: string;
  bilde: { src: string; alt: string; posisjon?: string };
  tittel: string; // <title>
  beskrivelse: string; // meta description
  h1: string;
  ingress: string;
  /** Hva leverandørene trenger å vite, vist som punktliste. */
  oppgi: string[];
  standardGjester: number;
  /** Følsomme anledninger får en roligere tone og ingen salgsord. */
  rolig?: boolean;
}

export const anledningerInnhold: AnledningInnhold[] = [
  {
    id: 'firmalunsj',
    slug: 'firmalunsj',
    navn: 'Firmalunsj',
    kortnavn: 'Firmalunsj',
    bilde: { src: '/bilder/smorbrod.webp', alt: 'Smørbrød med reker og egg på et skjærebrett' },
    tittel: 'Catering til firmalunsj – få tilbud fra flere leverandører',
    beskrivelse:
      'Få tilbud på firmalunsj fra godkjente cateringleverandører. Send én forespørsel, sammenlign meny og pris per kuvert, og velg det som passer. Gratis og uforpliktende.',
    h1: 'Catering til firmalunsj',
    ingress:
      'Enten det er én lunsj til teamet eller noe dere vil gjenta: beskriv behovet én gang, så sender leverandører i nærheten deg meny og pris per kuvert.',
    oppgi: [
      'Antall personer, og om dere ønsker fast levering (skriv det under «Andre ønsker»)',
      'Når maten skal stå klar, og om den skal leveres eller hentes',
      'Allergier og kosthold, med antall for hver',
      'Budsjett per kuvert, hvis du har et',
    ],
    standardGjester: 25,
  },
  {
    id: 'motemat',
    slug: 'motemat',
    navn: 'Møtemat',
    kortnavn: 'Møtemat',
    bilde: { src: '/bilder/sosiale-medier.webp', alt: 'Møtebord med smørbrød, salat, frukt og kaffekanner', posisjon: '50% 40%' },
    tittel: 'Møtemat til møter og kurs – få tilbud',
    beskrivelse:
      'Bestill møtemat til styremøte, kurs eller seminar. Send én forespørsel og få tilbud med meny og pris per kuvert fra leverandører i nærheten.',
    h1: 'Møtemat til møter, kurs og seminarer',
    ingress:
      'Frokost, lunsj eller noe å bite i underveis. Fortell hvor mange dere blir og når, så sender leverandørene deg tilbud.',
    oppgi: [
      'Tidspunkt for servering, og om det er flere måltider samme dag',
      'Antall deltakere og om noen spiser vegetar eller har allergier',
      'Om maten skal leveres ferdig eller settes opp',
      'Postnummer der maten skal serveres',
    ],
    standardGjester: 15,
  },
  {
    id: 'julebord',
    slug: 'julebord',
    navn: 'Julebord',
    kortnavn: 'Julebord',
    bilde: { src: '/bilder/julebord.webp', alt: 'Julebord med ribbe, rødkål og tilbehør', posisjon: '50% 60%' },
    tittel: 'Julebord catering – få tilbud på julemat',
    beskrivelse:
      'Få tilbud på julebordsmat fra cateringleverandører der du bor. Sammenlign meny, pris per kuvert og hva som er inkludert.',
    h1: 'Catering til julebord',
    ingress:
      'Ribbe, pinnekjøtt eller noe helt annet. Beskriv julebordet én gang, så sender leverandørene deg forslag til meny og pris per kuvert.',
    oppgi: [
      'Dato og klokkeslett, og om datoen er fleksibel',
      'Antall gjester og ønsket servering, for eksempel buffet eller servert ved bordet',
      'Om dere trenger servise, servitører eller oppsett og rydding',
      'Allergier og kosthold',
    ],
    standardGjester: 40,
  },
  {
    id: 'bryllup',
    slug: 'bryllup',
    navn: 'Bryllup',
    kortnavn: 'Bryllup',
    bilde: { src: '/bilder/bryllup.webp', alt: 'Langbord til bryllup i kveldslys' },
    tittel: 'Bryllupscatering – få tilbud fra flere leverandører',
    beskrivelse:
      'Planlegger dere bryllup? Send én forespørsel og få tilbud på bryllupsmat med meny og pris per kuvert. Sammenlign og velg i ro og mak.',
    h1: 'Catering til bryllup',
    ingress:
      'Middag, buffet eller tapas til mingling. Beskriv dagen én gang, og sammenlign tilbudene side om side når de kommer.',
    oppgi: [
      'Dato og sted, og om lokalet har kjøkken',
      'Antall gjester og hvilke måltider dere ønsker',
      'Servering, servise og eventuelt servitører',
      'Allergier og kosthold blant gjestene',
    ],
    standardGjester: 80,
  },
  {
    id: 'konfirmasjon',
    slug: 'konfirmasjon',
    navn: 'Konfirmasjon',
    kortnavn: 'Konfirmasjon',
    bilde: { src: '/bilder/kaffe-kake.webp', alt: 'Kaffe og bløtkake med jordbær' },
    tittel: 'Catering til konfirmasjon – få tilbud',
    beskrivelse:
      'Få tilbud på konfirmasjonsmat fra cateringleverandører nær deg. Send én forespørsel, sammenlign meny og pris per kuvert, og velg det som passer.',
    h1: 'Catering til konfirmasjon',
    ingress:
      'Middag, koldtbord eller kaker og kaffe. Fortell hva dere ønsker, så kan dere bruke tiden på konfirmanten i stedet for å ringe rundt.',
    oppgi: [
      'Dato og klokkeslett for festen',
      'Antall gjester, og hvor mange som er barn',
      'Om maten skal leveres ferdig eller settes opp',
      'Allergier og kosthold',
    ],
    standardGjester: 40,
  },
  {
    id: 'minnesamvaer',
    slug: 'minnesamvaer',
    navn: 'Minnesamvær',
    kortnavn: 'Minnesamvær',
    bilde: { src: '/bilder/tilbud-a.webp', alt: 'Smørbrød, salat og fruktfat på et dekket bord' },
    tittel: 'Mat til minnesamvær',
    beskrivelse:
      'Trenger du mat til minnesamvær? Send én forespørsel, så tar leverandører i nærheten kontakt med forslag og pris. Uforpliktende.',
    h1: 'Mat til minnesamvær',
    ingress:
      'Når mye skal ordnes på kort tid, kan det være en hjelp å slippe å ringe rundt. Beskriv det du trenger én gang, så sender leverandørene forslag til deg.',
    oppgi: [
      'Dato og tidspunkt, også om det er kort tid til',
      'Omtrent hvor mange som kommer',
      'Om du ønsker smørbrød, kaffe og kaker eller noe annet',
      'Postnummer der maten skal serveres',
    ],
    standardGjester: 40,
    rolig: true,
  },
  {
    id: 'privat_fest',
    slug: 'privat-fest',
    navn: 'Privat fest',
    kortnavn: 'Privat fest',
    bilde: { src: '/bilder/tilbud-c.webp', alt: 'Tapasretter, brød og ostefat på et bord' },
    tittel: 'Catering til privat fest og bursdag',
    beskrivelse:
      'Få tilbud på catering til bursdag, jubileum eller sommerfest. Send én forespørsel og sammenlign meny og pris per kuvert.',
    h1: 'Catering til privat fest',
    ingress:
      'Rund bursdag, jubileum eller hagefest. Beskriv festen én gang, så sender leverandørene deg forslag til meny og pris.',
    oppgi: [
      'Dato, tidspunkt og sted',
      'Antall gjester',
      'Hvilken type mat og servering du ser for deg',
      'Allergier og kosthold',
    ],
    standardGjester: 30,
  },
];

export const finnAnledningInnhold = (slug: string) => anledningerInnhold.find((a) => a.slug === slug);

/** Lenke til skjemaet med anledningen forhåndsvalgt. */
export const skjemaLenke = (a: Pick<AnledningInnhold, 'id' | 'standardGjester'>) =>
  `/foresporsel?anledning=${a.id}&gjester=${a.standardGjester}`;
