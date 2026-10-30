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
  /** Mangler bildet, vises en tegning i stedet. */
  bilde?: { src: string; alt: string; posisjon?: string };
  /** Tegning brukt når det ikke finnes foto. */
  illustrasjon?: string;
  gruppe?: 'anledning' | 'mattype';
  /** Forslag til hva man kan bestille, vist som inspirasjon på landingssiden. */
  ideer?: string[];
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
  {
    id: 'kurs_konferanse',
    gruppe: 'anledning',
    slug: 'kurs-og-konferanse',
    navn: 'Kurs og konferanse',
    kortnavn: 'Kurs og konferanse',
    illustrasjon: '/illustrasjoner/kaffe-bolle.svg',
    tittel: 'Mat til kurs og konferanse – få tilbud på konferansemat',
    beskrivelse: 'Få tilbud på mat til kurs, seminar og konferanse. Frokost, lunsj, pausemat og middag fra godkjente leverandører. Én forespørsel, flere tilbud.',
    h1: 'Mat til kurs og konferanse',
    ingress: 'Frokost, lunsj og pausemat for en dag eller flere. Beskriv programmet én gang, så sender leverandørene forslag til meny og pris per kuvert.',
    oppgi: [
      'Hvor mange deltakere, og hvor mange dager',
      'Hvilke måltider: frokost, lunsj, pausemat, middag',
      'Tidspunkt for hvert måltid (skriv det under «Andre ønsker»)',
      'Allergier og kosthold, med antall for hver',
    ],
    ideer: ['Frokostbuffet med brød, pålegg og yoghurt', 'Lunsjbuffet med salater og varmrett', 'Pausemat med frukt, bakst og kaffe', 'Konferansemiddag'],
    standardGjester: 60,
  },
  {
    id: 'sommerfest',
    gruppe: 'anledning',
    slug: 'sommerfest',
    navn: 'Sommerfest',
    kortnavn: 'Sommerfest',
    illustrasjon: '/illustrasjoner/privat-fest.svg',
    tittel: 'Catering til sommerfest – få tilbud fra flere leverandører',
    beskrivelse: 'Få tilbud på mat til sommerfest for jobben eller privat. Grill, buffet eller fingermat. Send én forespørsel og sammenlign meny og pris per kuvert.',
    h1: 'Mat til sommerfest',
    ingress: 'Grillmat i hagen, buffet på taket eller fingermat til mingling. Beskriv festen én gang, så kommer forslagene til deg.',
    oppgi: ['Dato og tidspunkt, og om det er ute eller inne', 'Antall gjester', 'Om du ønsker grill, buffet eller fingermat', 'Om leverandøren skal stå for oppsett og grilling'],
    ideer: ['Grillbuffet med salater og tilbehør', 'Spekemat og sommersalater', 'Fingermat og tapas til mingling', 'Jordbær og sommerdesserter'],
    standardGjester: 50,
  },
  {
    id: 'dap',
    gruppe: 'anledning',
    slug: 'dap-og-navnefest',
    navn: 'Dåp og navnefest',
    kortnavn: 'Dåp og navnefest',
    illustrasjon: '/illustrasjoner/konfirmasjon.svg',
    tittel: 'Mat til dåp og navnefest – få tilbud',
    beskrivelse: 'Få tilbud på mat til dåp og navnefest. Smørbrød, koldtbord, kaker eller varm lunsj fra godkjente leverandører. Gratis og uforpliktende.',
    h1: 'Mat til dåp og navnefest',
    ingress: 'Lunsj etter seremonien eller kaffe og kaker hjemme. Beskriv selskapet én gang, så sender leverandørene forslag til deg.',
    oppgi: ['Dato og tidspunkt, gjerne når seremonien er ferdig', 'Antall voksne og barn', 'Om du ønsker lunsj, koldtbord eller kaker', 'Allergier og kosthold'],
    ideer: ['Smørbrød og koldtbord', 'Varm lunsj', 'Bløtkake og kaker til kaffen', 'Barnevennlig mat'],
    standardGjester: 30,
  },
  {
    id: 'jubileum',
    gruppe: 'anledning',
    slug: 'jubileum-og-bursdag',
    navn: 'Jubileum og bursdag',
    kortnavn: 'Jubileum og bursdag',
    illustrasjon: '/illustrasjoner/privat-fest.svg',
    tittel: 'Catering til jubileum og bursdag – få tilbud',
    beskrivelse: 'Få tilbud på mat til rund bursdag, firmajubileum eller bryllupsdag. Send én forespørsel og sammenlign meny og pris per kuvert.',
    h1: 'Mat til jubileum og bursdag',
    ingress: 'Rund dag, firmajubileum eller sølvbryllup. Beskriv feiringen én gang, så sender leverandørene forslag til meny og pris.',
    oppgi: ['Dato, tidspunkt og lokale', 'Antall gjester', 'Om det er middag, buffet eller fingermat', 'Om dere trenger servering og servise'],
    ideer: ['Tre retters middag', 'Buffet med kalde og varme retter', 'Fingermat og tapas', 'Kake og dessertbord'],
    standardGjester: 40,
  },
  {
    id: 'kaker_bakst',
    gruppe: 'mattype',
    slug: 'kaker-og-bakst',
    navn: 'Kaker og bakst',
    kortnavn: 'Kaker og bakst',
    bilde: { src: '/bilder/kaffe-kake.webp', alt: 'Kaffe og bløtkake med jordbær' },
    tittel: 'Bestille kaker og bakst – få tilbud fra bakerier',
    beskrivelse: 'Bestill bløtkake, kransekake, boller og bakst til jobb eller fest. Send én forespørsel og få tilbud fra bakerier og konditorier.',
    h1: 'Kaker og bakst',
    ingress: 'Bløtkake til jubileet, boller til møtet eller kransekake til bryllupet. Beskriv hva du trenger, så sender bakerier og konditorier deg tilbud.',
    oppgi: ['Hva slags kaker eller bakst, og omtrent hvor mange', 'Dato og når det skal hentes eller leveres', 'Tekst eller pynt på kaken (skriv det under «Andre ønsker»)', 'Allergier, for eksempel gluten, egg eller nøtter'],
    ideer: ['Bløtkake og marsipankake', 'Kransekake', 'Boller, kanelsnurrer og wienerbrød', 'Glutenfrie og veganske kaker'],
    standardGjester: 20,
  },
  {
    id: 'frokost',
    gruppe: 'mattype',
    slug: 'frokost',
    navn: 'Frokost',
    kortnavn: 'Frokost',
    illustrasjon: '/illustrasjoner/kaffe-bolle.svg',
    tittel: 'Frokostcatering til møter og jobb – få tilbud',
    beskrivelse: 'Få tilbud på frokost til frokostmøte, kurs eller fast frokost på jobben. Én forespørsel, flere tilbud fra godkjente leverandører.',
    h1: 'Frokost til jobb og møter',
    ingress: 'Frokostmøte, kursdag eller fast frokost på kontoret. Beskriv behovet én gang, så sender leverandører i nærheten forslag og pris.',
    oppgi: ['Antall personer', 'Når frokosten skal stå klar', 'Om det er én gang eller fast levering', 'Allergier og kosthold'],
    ideer: ['Frokostbuffet med brød og pålegg', 'Yoghurt, granola og frukt', 'Rundstykker og bakst', 'Smoothie og juice'],
    standardGjester: 20,
  },
  {
    id: 'fingermat',
    gruppe: 'mattype',
    slug: 'fingermat-og-tapas',
    navn: 'Fingermat og tapas',
    kortnavn: 'Fingermat og tapas',
    bilde: { src: '/bilder/tilbud-c.webp', alt: 'Tapasretter, brød og ostefat på et bord' },
    tittel: 'Fingermat og tapas – få tilbud på catering',
    beskrivelse: 'Få tilbud på fingermat og tapas til mingling, åpning eller fest. Send én forespørsel og sammenlign meny og pris per kuvert.',
    h1: 'Fingermat og tapas',
    ingress: 'Til mingling, åpning eller fest der gjestene står. Beskriv anledningen én gang, så sender leverandørene forslag til meny og pris.',
    oppgi: ['Antall gjester og hvor lenge det varer', 'Om fingermaten er hele måltidet eller et tillegg', 'Om dere trenger servering', 'Allergier og kosthold'],
    ideer: ['Småretter og spyd', 'Tapas med spekemat og ost', 'Vegetarisk fingermat', 'Søte småbiter'],
    standardGjester: 40,
  },
  {
    id: 'buffet',
    gruppe: 'mattype',
    slug: 'buffet',
    navn: 'Buffet',
    kortnavn: 'Buffet',
    illustrasjon: '/illustrasjoner/bord-ovenfra.svg',
    tittel: 'Buffet catering – få tilbud på buffet',
    beskrivelse: 'Få tilbud på kald eller varm buffet til jobb, fest og selskap. Send én forespørsel og sammenlign meny og pris per kuvert fra godkjente leverandører.',
    h1: 'Buffet til jobb og selskap',
    ingress: 'Kald eller varm buffet til jobb, fest og selskap. Beskriv behovet én gang, så sender leverandørene forslag til meny og pris per kuvert.',
    oppgi: ['Antall gjester', 'Kald, varm eller kombinert buffet', 'Om leverandøren skal rigge og rydde', 'Allergier og kosthold'],
    ideer: ['Koldtbord', 'Varm buffet med to hovedretter', 'Middelhavsbuffet', 'Dessertbuffet'],
    standardGjester: 40,
  },
  {
    id: 'grill',
    gruppe: 'mattype',
    slug: 'grillmat',
    navn: 'Grillmat',
    kortnavn: 'Grillmat',
    illustrasjon: '/illustrasjoner/bord-ovenfra.svg',
    tittel: 'Grillmat og grillcatering – få tilbud',
    beskrivelse: 'Få tilbud på grillmat til sommerfest, firmafest eller hagefest. Med eller uten grillmester. Én forespørsel, flere tilbud.',
    h1: 'Grillmat og grillcatering',
    ingress: 'Ferdig grillet mat levert, eller en grillmester på stedet. Beskriv festen én gang, så kommer forslagene til deg.',
    oppgi: ['Antall gjester', 'Om maten skal leveres ferdig eller grilles på stedet', 'Hvor det skal være, og om det finnes grill', 'Allergier og kosthold'],
    ideer: ['Grillbuffet med salater', 'Burgerbar', 'Vegetarisk grill', 'Grillmester på stedet'],
    standardGjester: 40,
  },
  {
    id: 'vegetar_vegansk',
    gruppe: 'mattype',
    slug: 'vegetar-og-vegansk',
    navn: 'Vegetar og vegansk',
    kortnavn: 'Vegetar og vegansk',
    illustrasjon: '/illustrasjoner/bord-ovenfra.svg',
    tittel: 'Vegetarisk og vegansk catering – få tilbud',
    beskrivelse: 'Få tilbud på vegetarisk og vegansk catering til jobb og fest. Send én forespørsel og sammenlign meny og pris per kuvert.',
    h1: 'Vegetarisk og vegansk catering',
    ingress: 'Hele menyen grønn, eller gode alternativer for noen av gjestene. Beskriv behovet én gang, så sender leverandørene forslag.',
    oppgi: ['Antall gjester, og hvor mange som er vegetar eller veganer', 'Om hele menyen skal være plantebasert', 'Allergier, for eksempel soya, nøtter eller gluten', 'Budsjett per kuvert, hvis du har et'],
    ideer: ['Plantebasert lunsjbuffet', 'Vegetariske smørbrød', 'Grønn fingermat', 'Veganske kaker'],
    standardGjester: 25,
  },
];

export const finnAnledningInnhold = (slug: string) => anledningerInnhold.find((a) => a.slug === slug);

/** Lenke til skjemaet med anledningen forhåndsvalgt. */
export const skjemaLenke = (a: Pick<AnledningInnhold, 'id' | 'standardGjester'>) =>
  `/foresporsel?anledning=${a.id}&gjester=${a.standardGjester}`;
