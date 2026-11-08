import type { Anledning } from './types';

/** Sesongseksjonen på forsiden. Velges ut fra dagens dato i Oslo. */
export interface Sesong {
  id: string;
  /** Første dag i perioden som MM-DD. Perioden varer til neste sesong starter. */
  fra: string;
  tittel: string;
  tekst: string;
  knapp: string;
  anledning: Anledning;
  gjester: number;
  slug: string;
  lesMer: string;
  bilde: { src: string; alt: string; posisjon?: string };
}

export const SESONGER: Sesong[] = [
  {
    id: 'kickoff',
    fra: '01-01',
    tittel: 'Kickoff eller kursdag i starten av året?',
    tekst: 'Frokost, lunsj og pausemat til samlinger og kurs. Send én forespørsel, så får du meny og pris per kuvert fra leverandører i nærheten.',
    knapp: 'Få tilbud på konferansemat',
    anledning: 'kurs_konferanse',
    gjester: 40,
    slug: 'kurs-og-konferanse',
    lesMer: 'Mer om mat til kurs og konferanse',
    bilde: { src: '/bilder/sosiale-medier.webp', alt: 'Møtebord med smørbrød, salat, frukt og kaffekanner', posisjon: '50% 40%' },
  },
  {
    id: 'konfirmasjon',
    fra: '03-01',
    tittel: 'Konfirmasjon i vår? Bestill maten i god tid.',
    tekst: 'Mange konfirmasjoner faller på de samme helgene. Send forespørselen nå, så har leverandørene tid til å svare med meny og pris.',
    knapp: 'Få tilbud på konfirmasjonsmat',
    anledning: 'konfirmasjon',
    gjester: 40,
    slug: 'konfirmasjon',
    lesMer: 'Mer om mat til konfirmasjon',
    bilde: { src: '/bilder/kaffe-kake.webp', alt: 'Kaffe og bløtkake med jordbær' },
  },
  {
    id: 'sommerfest',
    fra: '05-21',
    tittel: 'Sommerfest på jobben eller i hagen?',
    tekst: 'Grillmat, buffet eller fingermat til mingling. Beskriv festen én gang, så kommer tilbudene til deg.',
    knapp: 'Få tilbud på sommerfest',
    anledning: 'sommerfest',
    gjester: 50,
    slug: 'sommerfest',
    lesMer: 'Mer om mat til sommerfest',
    bilde: { src: '/bilder/tilbud-c.webp', alt: 'Tapasretter, brød og ostefat på et bord' },
  },
  {
    id: 'hostlunsj',
    fra: '08-16',
    tittel: 'Ny høst, nye møter. Trenger dere lunsj?',
    tekst: 'Én lunsj til teamet eller fast levering hver uke. Få tilbud fra leverandører i nærheten og sammenlign meny og pris.',
    knapp: 'Få tilbud på firmalunsj',
    anledning: 'firmalunsj',
    gjester: 25,
    slug: 'firmalunsj',
    lesMer: 'Mer om firmalunsj',
    bilde: { src: '/bilder/smorbrod.webp', alt: 'Smørbrød med reker og egg på et skjærebrett' },
  },
  {
    id: 'julebord',
    fra: '10-01',
    tittel: 'Har du husket å bestille mat til julebordet?',
    tekst: 'Desember fylles fort opp hos leverandørene. Send én forespørsel nå, så får du tilbud med meny og pris per kuvert fra flere leverandører i nærheten.',
    knapp: 'Få tilbud på julebordsmat',
    anledning: 'julebord',
    gjester: 40,
    slug: 'julebord',
    lesMer: 'Mer om catering til julebord',
    bilde: { src: '/bilder/julebord.webp', alt: 'Julebord med ribbe, rødkål og tilbehør', posisjon: '50% 60%' },
  },
  {
    id: 'nyttar',
    fra: '12-16',
    tittel: 'Feirer dere romjul eller nyttår?',
    tekst: 'Fingermat, buffet eller tre retter til selskapet. Send én forespørsel, så sender leverandørene forslag og pris.',
    knapp: 'Få tilbud på selskapsmat',
    anledning: 'privat_fest',
    gjester: 20,
    slug: 'privat-fest',
    lesMer: 'Mer om mat til privat fest',
    bilde: { src: '/bilder/hero-langbord.webp', alt: 'Langbord med smørbrød, salat og fat' },
  },
];

/** Sesongen som gjelder for en dato (standard: i dag i Oslo). */
export function aktivSesong(dato = new Date()): Sesong {
  const md = dato.toLocaleDateString('sv-SE', { timeZone: 'Europe/Oslo' }).slice(5);
  const sortert = [...SESONGER].sort((a, b) => a.fra.localeCompare(b.fra));
  return [...sortert].reverse().find((s) => s.fra <= md) ?? sortert[sortert.length - 1];
}
