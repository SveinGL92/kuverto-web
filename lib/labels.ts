import type { Anledning, Budsjett, Kostholdstype, Levering, Servering } from './types';

export const anledninger: { id: Anledning; navn: string; illustrasjon?: string }[] = [
  { id: 'firmalunsj', navn: 'Firmalunsj', illustrasjon: '/illustrasjoner/smorbrod.svg' },
  { id: 'motemat', navn: 'Møtemat', illustrasjon: '/illustrasjoner/kaffe-bolle.svg' },
  { id: 'julebord', navn: 'Julebord', illustrasjon: '/illustrasjoner/julebord.svg' },
  { id: 'bryllup', navn: 'Bryllup', illustrasjon: '/illustrasjoner/bryllup.svg' },
  { id: 'konfirmasjon', navn: 'Konfirmasjon', illustrasjon: '/illustrasjoner/konfirmasjon.svg' },
  { id: 'minnesamvaer', navn: 'Minnesamvær', illustrasjon: '/illustrasjoner/minnesamvaer.svg' },
  { id: 'privat_fest', navn: 'Privat fest', illustrasjon: '/illustrasjoner/privat-fest.svg' },
  { id: 'annet', navn: 'Noe annet' },
];

export const anledningNavn = (id: Anledning) => anledninger.find((a) => a.id === id)?.navn ?? id;
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
export const serveringNavn = (id: Servering) => serveringer.find((s) => s.id === id)?.navn ?? id;

export const kostholdstyper: { id: Kostholdstype; navn: string }[] = [
  { id: 'vegetar', navn: 'Vegetar' },
  { id: 'vegansk', navn: 'Vegansk' },
  { id: 'glutenfri', navn: 'Glutenfri' },
  { id: 'laktosefri', navn: 'Laktosefri' },
  { id: 'halal', navn: 'Halal' },
  { id: 'notter', navn: 'Nøtter' },
];
export const kostholdNavn = (id: Kostholdstype) => kostholdstyper.find((k) => k.id === id)?.navn ?? id;

export const budsjetter: { id: Budsjett; navn: string }[] = [
  { id: 'under_250', navn: 'Under kr 250' },
  { id: '250_400', navn: 'kr 250–400' },
  { id: '400_600', navn: 'kr 400–600' },
  { id: 'over_600', navn: 'Over kr 600' },
  { id: 'vet_ikke', navn: 'Vet ikke ennå' },
];
export const budsjettNavn = (id: Budsjett) => budsjetter.find((b) => b.id === id)?.navn ?? id;
