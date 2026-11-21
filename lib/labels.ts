import { fyll, type T } from './i18n/core';
import { fraNok, penger, type Marked } from './markets';
import type { Anledning, Budsjett, Kostholdstype, Levering, Servering } from './types';

/** Uten oversetter: norsk. Send inn t fra useSprak()/sprak() for andre språk. */
const ingen: T = (s, vars) => fyll(s, vars);

/** Kategorier kunden kan velge: anledninger (når) og mattyper (hva). */
export const anledninger: { id: Anledning; navn: string; gruppe: 'anledning' | 'mattype' | 'annet'; illustrasjon?: string }[] = [
  { id: 'firmalunsj', navn: 'Firmalunsj', gruppe: 'anledning', illustrasjon: '/illustrasjoner/smorbrod.svg' },
  { id: 'motemat', navn: 'Møtemat', gruppe: 'anledning', illustrasjon: '/illustrasjoner/kaffe-bolle.svg' },
  { id: 'kurs_konferanse', navn: 'Kurs og konferanse', gruppe: 'anledning', illustrasjon: '/illustrasjoner/kaffe-bolle.svg' },
  { id: 'julebord', navn: 'Julebord', gruppe: 'anledning', illustrasjon: '/illustrasjoner/julebord.svg' },
  { id: 'sommerfest', navn: 'Sommerfest', gruppe: 'anledning', illustrasjon: '/illustrasjoner/privat-fest.svg' },
  { id: 'bryllup', navn: 'Bryllup', gruppe: 'anledning', illustrasjon: '/illustrasjoner/bryllup.svg' },
  { id: 'konfirmasjon', navn: 'Konfirmasjon', gruppe: 'anledning', illustrasjon: '/illustrasjoner/konfirmasjon.svg' },
  { id: 'dap', navn: 'Dåp og navnefest', gruppe: 'anledning', illustrasjon: '/illustrasjoner/konfirmasjon.svg' },
  { id: 'jubileum', navn: 'Jubileum og bursdag', gruppe: 'anledning', illustrasjon: '/illustrasjoner/privat-fest.svg' },
  { id: 'minnesamvaer', navn: 'Minnesamvær', gruppe: 'anledning', illustrasjon: '/illustrasjoner/minnesamvaer.svg' },
  { id: 'privat_fest', navn: 'Privat fest', gruppe: 'anledning', illustrasjon: '/illustrasjoner/privat-fest.svg' },
  { id: 'kaker_bakst', navn: 'Kaker og bakst', gruppe: 'mattype', illustrasjon: '/illustrasjoner/kaffe-bolle.svg' },
  { id: 'frokost', navn: 'Frokost', gruppe: 'mattype', illustrasjon: '/illustrasjoner/kaffe-bolle.svg' },
  { id: 'fingermat', navn: 'Fingermat og tapas', gruppe: 'mattype', illustrasjon: '/illustrasjoner/smorbrod.svg' },
  { id: 'buffet', navn: 'Buffet', gruppe: 'mattype', illustrasjon: '/illustrasjoner/bord-ovenfra.svg' },
  { id: 'grill', navn: 'Grillmat', gruppe: 'mattype', illustrasjon: '/illustrasjoner/bord-ovenfra.svg' },
  { id: 'vegetar_vegansk', navn: 'Vegetar og vegansk', gruppe: 'mattype', illustrasjon: '/illustrasjoner/bord-ovenfra.svg' },
  { id: 'annet', navn: 'Noe annet', gruppe: 'annet' },
];

export const anledningNavn = (id: Anledning, t: T = ingen) => t(anledninger.find((a) => a.id === id)?.navn ?? id);
export const anledningIllustrasjon = (id: Anledning) =>
  anledninger.find((a) => a.id === id)?.illustrasjon ?? '/illustrasjoner/tom-tallerken.svg';

export const leveringer: { id: Levering; navn: string }[] = [
  { id: 'levering', navn: 'Levering' },
  { id: 'henting', navn: 'Henting' },
];

export const serveringer: { id: Servering; navn: string; beskrivelse: string }[] = [
  { id: 'levert_ferdig', navn: 'Levert ferdig', beskrivelse: 'Maten kommer klar til å settes frem' },
  { id: 'buffet_oppsett', navn: 'Buffet med oppsett', beskrivelse: 'Leverandøren rigger og rydder' },
  { id: 'servert_bordet', navn: 'Servert ved bordet', beskrivelse: 'Med servitører' },
  { id: 'fingermat', navn: 'Fingermat og småretter', beskrivelse: 'Til mingling og stående' },
];
export const serveringNavn = (id: Servering, t: T = ingen) => t(serveringer.find((s) => s.id === id)?.navn ?? id);

export const kostholdstyper: { id: Kostholdstype; navn: string; gruppe: 'kosthold' | 'allergen' }[] = [
  { id: 'vegetar', navn: 'Vegetar', gruppe: 'kosthold' },
  { id: 'vegansk', navn: 'Vegansk', gruppe: 'kosthold' },
  { id: 'laktosefri', navn: 'Laktosefri', gruppe: 'kosthold' },
  { id: 'halal', navn: 'Halal', gruppe: 'kosthold' },
  { id: 'uten_svin', navn: 'Uten svinekjøtt', gruppe: 'kosthold' },
  { id: 'gluten', navn: 'Gluten', gruppe: 'allergen' },
  { id: 'skalldyr', navn: 'Skalldyr', gruppe: 'allergen' },
  { id: 'egg', navn: 'Egg', gruppe: 'allergen' },
  { id: 'fisk', navn: 'Fisk', gruppe: 'allergen' },
  { id: 'peanotter', navn: 'Peanøtter', gruppe: 'allergen' },
  { id: 'soya', navn: 'Soya', gruppe: 'allergen' },
  { id: 'melk', navn: 'Melk', gruppe: 'allergen' },
  { id: 'notter', navn: 'Nøtter', gruppe: 'allergen' },
  { id: 'selleri', navn: 'Selleri', gruppe: 'allergen' },
  { id: 'sennep', navn: 'Sennep', gruppe: 'allergen' },
  { id: 'sesam', navn: 'Sesamfrø', gruppe: 'allergen' },
  { id: 'lupin', navn: 'Lupin', gruppe: 'allergen' },
  { id: 'blotdyr', navn: 'Bløtdyr', gruppe: 'allergen' },
  { id: 'sulfitt', navn: 'Svoveldioksid og sulfitter', gruppe: 'allergen' },
];
export const kostholdNavn = (id: Kostholdstype, t: T = ingen) => t(kostholdstyper.find((k) => k.id === id)?.navn ?? id);
export const erAllergen = (id: Kostholdstype) => kostholdstyper.find((k) => k.id === id)?.gruppe === 'allergen';
/** «Vegetar», «uten svinekjøtt», «allergi: gluten». Til løpende tekst. */
export const kostholdKort = (id: Kostholdstype, t: T = ingen) =>
  erAllergen(id) ? t('allergi mot {navn}', { navn: kostholdNavn(id, t).toLowerCase() }) : kostholdNavn(id, t).toLowerCase();
/** «Allergi mot gluten: 2 (alvorlig)» eller «Vegetar: 5». */
export const kostholdLinje = (k: { type: Kostholdstype; antall: number; alvorlig?: boolean }, t: T = ingen) =>
  `${erAllergen(k.type) ? t('Allergi mot {navn}', { navn: kostholdNavn(k.type, t).toLowerCase() }) : kostholdNavn(k.type, t)}: ${k.antall}${k.alvorlig ? ` (${t('alvorlig')})` : ''}`;

export const budsjetter: { id: Budsjett; navn: string }[] = [
  { id: 'under_250', navn: 'Under kr 250' },
  { id: '250_400', navn: 'kr 250–400' },
  { id: '400_600', navn: 'kr 400–600' },
  { id: 'over_600', navn: 'Over kr 600' },
  { id: 'vet_ikke', navn: 'Vet ikke ennå' },
];
/** Budsjettet i markedets valuta: «Under kr 250», «250–400 kr», «Under 175 kr.», «Alle 25 €». */
export function budsjettNavn(id: Budsjett, marked: Marked = 'no', t: T = ingen): string {
  if (marked === 'no') return t(budsjetter.find((b) => b.id === id)?.navn ?? id);
  const p = (n: number) => penger(fraNok(n * 100, marked), marked);
  const spenn = (a: number, b: number) => p(b).replace(String(Math.round(fraNok(b * 100, marked) / 100)), `${Math.round(fraNok(a * 100, marked) / 100)}–${Math.round(fraNok(b * 100, marked) / 100)}`);
  switch (id) {
    case 'under_250': return t('Under {belop}', { belop: p(250) });
    case '250_400': return spenn(250, 400);
    case '400_600': return spenn(400, 600);
    case 'over_600': return t('Over {belop}', { belop: p(600) });
    default: return t('Vet ikke ennå');
  }
}
