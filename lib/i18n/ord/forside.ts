/**
 * Oversettelser. Nøkkel = den norske teksten nøyaktig slik den står i koden (med {felt} for variabler).
 * Verdien er teksten på svensk (sv), dansk (da) og finsk (fi). Mangler en nøkkel, vises norsk.
 *
 * Korte tekster i rammen rundt sidene (topp, bunn, logo, tema, hurtigskjema, feilside).
 * Disse sendes til nettleseren. Lange innholdstekster ligger i innhold.ts.
 * Hver rad: [norsk, svensk, dansk, finsk].
 */
const rader: [string, string, string, string][] = [
  // Topp og bunn
  ['Hovedmeny', 'Huvudmeny', 'Hovedmenu', 'Päävalikko'],
  ['Meny', 'Meny', 'Menu', 'Valikko'],
  ['Slik fungerer det', 'Så fungerar det', 'Sådan fungerer det', 'Näin se toimii'],
  ['Finn catering', 'Hitta catering', 'Find catering', 'Löydä catering'],
  ['For leverandører', 'För leverantörer', 'For leverandører', 'Toimittajille'],
  ['Logg inn', 'Logga in', 'Log ind', 'Kirjaudu'],
  ['Logg ut', 'Logga ut', 'Log ud', 'Kirjaudu ulos'],
  ['Få tilbud', 'Få offerter', 'Få tilbud', 'Pyydä tarjouksia'],
  ['Be om forslag', 'Be om förslag', 'Bed om forslag', 'Pyydä ehdotuksia'],
  [', til forsiden', ', till startsidan', ', til forsiden', ', etusivulle'],
  ['Til forsiden', 'Till startsidan', 'Til forsiden', 'Etusivulle'],
  ['Konto', 'Konto', 'Konto', 'Tili'],
  ['Mine forespørsler', 'Mina förfrågningar', 'Mine forespørgsler', 'Omat tarjouspyynnöt'],
  ['Bunnmeny', 'Sidfotsmeny', 'Menu i sidefoden', 'Alavalikko'],
  ['For deg som bestiller', 'För dig som beställer', 'For dig, der bestiller', 'Tilaajalle'],
  ['Anledninger', 'Tillfällen', 'Anledninger', 'Tilaisuudet'],
  ['Bli leverandør', 'Bli leverantör', 'Bliv leverandør', 'Ryhdy toimittajaksi'],
  ['Priser', 'Priser', 'Priser', 'Hinnat'],
  ['Personvern', 'Integritetspolicy', 'Privatlivspolitik', 'Tietosuoja'],
  ['Land og språk', 'Land och språk', 'Land og sprog', 'Maa ja kieli'],
  [
    'Én forespørsel, flere tilbud, i hele Norge. Du får tilbud fra leverandørene som leverer i området ditt.',
    'En förfrågan, flera offerter, i hela Sverige. Du får offerter från leverantörerna som levererar i ditt område.',
    'Én forespørgsel, flere tilbud, i hele Danmark. Du får tilbud fra de leverandører, der leverer i dit område.',
    'Yksi tarjouspyyntö, useita tarjouksia koko Suomessa. Saat tarjouksia toimittajilta, jotka toimittavat alueellesi.',
  ],
  [
    '© 2026 Puncheur AS · Org.nr. 999 552 536',
    '© 2026 Puncheur AS (Norge) · Org.nr 999 552 536',
    '© 2026 Puncheur AS (Norge) · Org.nr. 999 552 536',
    '© 2026 Puncheur AS (Norja) · Norjan yritystunnus 999 552 536',
  ],
  // Tema
  ['Fargetema', 'Färgtema', 'Farvetema', 'Väriteema'],
  ['System', 'System', 'System', 'Järjestelmä'],
  ['Lys', 'Ljust', 'Lyst', 'Vaalea'],
  ['Mørk', 'Mörkt', 'Mørkt', 'Tumma'],
  // Hurtigskjema
  ['Start en forespørsel', 'Starta en förfrågan', 'Start en forespørgsel', 'Aloita tarjouspyyntö'],
  ['Hva gjelder det?', 'Vad gäller det?', 'Hvad drejer det sig om?', 'Mikä tilaisuus?'],
  ['Gjester', 'Gäster', 'Gæster', 'Vieraita'],
  ['Postnummer', 'Postnummer', 'Postnummer', 'Postinumero'],
  [
    'Skriv postnummeret med {antall} siffer, for eksempel {eksempel}.',
    'Skriv postnumret med {antall} siffror, till exempel {eksempel}.',
    'Skriv postnummeret med {antall} cifre, for eksempel {eksempel}.',
    'Postinumerossa on {antall} numeroa, esimerkiksi {eksempel}.',
  ],
  ['fire', 'fyra', 'fire', 'neljä'],
  ['fem', 'fem', 'fem', 'viisi'],
  // Steg (skjermlesertekst)
  ['Steg {nr}: ', 'Steg {nr}: ', 'Trin {nr}: ', 'Vaihe {nr}: '],
  // Feilside
  [
    'Noe gikk galt da siden skulle lastes. Sjekk nettforbindelsen og prøv igjen.',
    'Något gick fel när sidan skulle laddas. Kontrollera internetanslutningen och försök igen.',
    'Noget gik galt, da siden skulle indlæses. Tjek din internetforbindelse, og prøv igen.',
    'Sivun lataamisessa tapahtui virhe. Tarkista verkkoyhteys ja yritä uudelleen.',
  ],
];

const ord: { sv: Record<string, string>; da: Record<string, string>; fi: Record<string, string> } = {
  sv: Object.fromEntries(rader.map((r) => [r[0], r[1]])),
  da: Object.fromEntries(rader.map((r) => [r[0], r[2]])),
  fi: Object.fromEntries(rader.map((r) => [r[0], r[3]])),
};
export default ord;
