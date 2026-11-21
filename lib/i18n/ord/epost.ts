/**
 * Oversettelser. Nøkkel = den norske teksten nøyaktig slik den står i koden (med {felt} for variabler).
 * Verdien er teksten på svensk (sv), dansk (da) og finsk (fi). Mangler en nøkkel, vises norsk.
 * Gjelder e-post og tekst laget på serveren (lib/server/epost.ts, varsle.ts, formatering.ts, data.ts, admin-e-post til leverandører).
 */
const ord: { sv: Record<string, string>; da: Record<string, string>; fi: Record<string, string> } = {
  sv: {
    // Mal
    'Du får denne e-posten fordi du bruker Kuverto. Svar på e-posten hvis du har spørsmål.':
      'Du får det här mejlet eftersom du använder Kuverto. Svara på mejlet om du har frågor.',
    // Formatering av forespørsler
    'fleksibel dato': 'flexibelt datum',
    'ingen oppgitt': 'inga angivna',
    '{anledning} for {gjester} gjester': '{anledning} för {gjester} gäster',
    'Når: {dato}, hentes kl. {kl}': 'När: {dato}, hämtas kl. {kl}',
    'Når: {dato}, leveres før kl. {kl}': 'När: {dato}, levereras före kl. {kl}',
    'Hvor: {omrade}': 'Var: {omrade}',
    'Servering: {servering}': 'Servering: {servering}',
    'Budsjett: {budsjett}': 'Budget: {budsjett}',
    'Budsjett: {budsjett} per kuvert': 'Budget: {budsjett} per kuvert',
    'Kosthold: {kosthold}': 'Specialkost: {kosthold}',
    '{naar} (datoen er fleksibel)': '{naar} (datumet är flexibelt)',
    'Sted: {sted} · {levering}': 'Plats: {sted} · {levering}',
    henting: 'hämtning',
    levering: 'leverans',
    'Andre ønsker: {melding}': 'Övriga önskemål: {melding}',
    ingen: 'inga',
    'Kontakt: {kontakt}': 'Kontakt: {kontakt}',
    // Tilbud (data.ts)
    'Bilde fra {navn}': 'Bild från {navn}',
    'Illustrasjonsbilde, ikke leverandørens egen mat': 'Illustrationsbild, inte leverantörens egen mat',
    Dekket: 'Tillgodosett',
    'Ikke oppgitt': 'Ej angivet',
    // Varsel til leverandører
    'Ny forespørsel: {anledning} for {gjester} i {sted}': 'Ny förfrågan: {anledning} för {gjester} i {sted}',
    'Ny forespørsel i ditt område': 'Ny förfrågan i ditt område',
    'Det koster {klipp} klipp å låse opp. Høyst {maks} leverandører kan svare.':
      'Det kostar {klipp} klipp att låsa upp. Högst {maks} leverantörer kan svara.',
    'Se forespørselen': 'Se förfrågan',
    'Du får denne e-posten fordi bedriften din er leverandør på Kuverto og dekker dette området.':
      'Du får det här mejlet eftersom ditt företag är leverantör på Kuverto och täcker det här området.',
    // Godkjenning av leverandør
    '{navn} er godkjent på Kuverto': '{navn} är godkänt på Kuverto',
    'Bedriften er godkjent': 'Företaget är godkänt',
    'Hei {fornavn}! {navn} er godkjent som leverandør på Kuverto.': 'Hej {fornavn}! {navn} är godkänt som leverantör på Kuverto.',
    'Du har fått {antall} gratis klipp. Logg inn med denne e-postadressen for å se forespørsler i området ditt. Du får også e-post når nye forespørsler kommer.':
      'Du har fått {antall} gratis klipp. Logga in med den här e-postadressen för att se förfrågningar i ditt område. Du får också ett mejl när nya förfrågningar kommer in.',
    'Du får klippene tilbake hvis kunden trekker forespørselen, eller ikke svarer innen {dager} dager etter at du sendte tilbudet.':
      'Du får tillbaka klippen om kunden drar tillbaka förfrågan eller inte svarar inom {dager} dagar efter att du skickade offerten.',
    'Logg inn': 'Logga in',
  },
  da: {
    'Du får denne e-posten fordi du bruker Kuverto. Svar på e-posten hvis du har spørsmål.':
      'Du får denne e-mail, fordi du bruger Kuverto. Svar på e-mailen, hvis du har spørgsmål.',
    'fleksibel dato': 'fleksibel dato',
    'ingen oppgitt': 'ingen angivet',
    '{anledning} for {gjester} gjester': '{anledning} til {gjester} gæster',
    'Når: {dato}, hentes kl. {kl}': 'Hvornår: {dato}, afhentes kl. {kl}',
    'Når: {dato}, leveres før kl. {kl}': 'Hvornår: {dato}, leveres inden kl. {kl}',
    'Hvor: {omrade}': 'Hvor: {omrade}',
    'Servering: {servering}': 'Servering: {servering}',
    'Budsjett: {budsjett}': 'Budget: {budsjett}',
    'Budsjett: {budsjett} per kuvert': 'Budget: {budsjett} pr. kuvert',
    'Kosthold: {kosthold}': 'Kosthensyn: {kosthold}',
    '{naar} (datoen er fleksibel)': '{naar} (datoen er fleksibel)',
    'Sted: {sted} · {levering}': 'Sted: {sted} · {levering}',
    henting: 'afhentning',
    levering: 'levering',
    'Andre ønsker: {melding}': 'Andre ønsker: {melding}',
    ingen: 'ingen',
    'Kontakt: {kontakt}': 'Kontakt: {kontakt}',
    'Bilde fra {navn}': 'Billede fra {navn}',
    'Illustrasjonsbilde, ikke leverandørens egen mat': 'Illustrationsfoto, ikke leverandørens egen mad',
    Dekket: 'Dækket',
    'Ikke oppgitt': 'Ikke oplyst',
    'Ny forespørsel: {anledning} for {gjester} i {sted}': 'Ny forespørgsel: {anledning} til {gjester} i {sted}',
    'Ny forespørsel i ditt område': 'Ny forespørgsel i dit område',
    'Det koster {klipp} klipp å låse opp. Høyst {maks} leverandører kan svare.':
      'Det koster {klipp} klipp at låse op. Højst {maks} leverandører kan svare.',
    'Se forespørselen': 'Se forespørgslen',
    'Du får denne e-posten fordi bedriften din er leverandør på Kuverto og dekker dette området.':
      'Du får denne e-mail, fordi din virksomhed er leverandør på Kuverto og dækker dette område.',
    '{navn} er godkjent på Kuverto': '{navn} er godkendt på Kuverto',
    'Bedriften er godkjent': 'Virksomheden er godkendt',
    'Hei {fornavn}! {navn} er godkjent som leverandør på Kuverto.': 'Hej {fornavn}! {navn} er godkendt som leverandør på Kuverto.',
    'Du har fått {antall} gratis klipp. Logg inn med denne e-postadressen for å se forespørsler i området ditt. Du får også e-post når nye forespørsler kommer.':
      'Du har fået {antall} gratis klipp. Log ind med denne e-mailadresse for at se forespørgsler i dit område. Du får også en e-mail, når der kommer nye forespørgsler.',
    'Du får klippene tilbake hvis kunden trekker forespørselen, eller ikke svarer innen {dager} dager etter at du sendte tilbudet.':
      'Du får dine klipp tilbage, hvis kunden trækker forespørgslen tilbage eller ikke svarer inden for {dager} dage, efter du har sendt tilbuddet.',
    'Logg inn': 'Log ind',
  },
  fi: {
    'Du får denne e-posten fordi du bruker Kuverto. Svar på e-posten hvis du har spørsmål.':
      'Saat tämän viestin, koska käytät Kuvertoa. Jos sinulla on kysyttävää, vastaa tähän viestiin.',
    'fleksibel dato': 'joustava päivämäärä',
    'ingen oppgitt': 'ei ilmoitettu',
    '{anledning} for {gjester} gjester': '{anledning}, {gjester} vierasta',
    'Når: {dato}, hentes kl. {kl}': 'Milloin: {dato}, nouto klo {kl}',
    'Når: {dato}, leveres før kl. {kl}': 'Milloin: {dato}, toimitus ennen klo {kl}',
    'Hvor: {omrade}': 'Missä: {omrade}',
    'Servering: {servering}': 'Tarjoilu: {servering}',
    'Budsjett: {budsjett}': 'Budjetti: {budsjett}',
    'Budsjett: {budsjett} per kuvert': 'Budjetti: {budsjett} per henkilö',
    'Kosthold: {kosthold}': 'Ruokavaliot: {kosthold}',
    '{naar} (datoen er fleksibel)': '{naar} (päivä on joustava)',
    'Sted: {sted} · {levering}': 'Paikka: {sted} · {levering}',
    henting: 'nouto',
    levering: 'toimitus',
    'Andre ønsker: {melding}': 'Muut toiveet: {melding}',
    ingen: 'ei mitään',
    'Kontakt: {kontakt}': 'Yhteystiedot: {kontakt}',
    'Bilde fra {navn}': 'Kuva: {navn}',
    'Illustrasjonsbilde, ikke leverandørens egen mat': 'Kuvituskuva, ei toimittajan omaa ruokaa',
    Dekket: 'Huomioitu',
    'Ikke oppgitt': 'Ei ilmoitettu',
    'Ny forespørsel: {anledning} for {gjester} i {sted}': 'Uusi tarjouspyyntö: {anledning}, {gjester} henkeä, {sted}',
    'Ny forespørsel i ditt område': 'Uusi tarjouspyyntö alueellasi',
    'Det koster {klipp} klipp å låse opp. Høyst {maks} leverandører kan svare.':
      'Avaaminen maksaa {klipp} klippiä. Enintään {maks} toimittajaa voi vastata.',
    'Se forespørselen': 'Katso tarjouspyyntö',
    'Du får denne e-posten fordi bedriften din er leverandør på Kuverto og dekker dette området.':
      'Saat tämän viestin, koska yrityksesi on Kuverton toimittaja ja palvelee tätä aluetta.',
    '{navn} er godkjent på Kuverto': '{navn} on hyväksytty Kuvertoon',
    'Bedriften er godkjent': 'Yritys on hyväksytty',
    'Hei {fornavn}! {navn} er godkjent som leverandør på Kuverto.': 'Hei {fornavn}! {navn} on hyväksytty Kuverton toimittajaksi.',
    'Du har fått {antall} gratis klipp. Logg inn med denne e-postadressen for å se forespørsler i området ditt. Du får også e-post når nye forespørsler kommer.':
      'Olet saanut {antall} ilmaista klippiä. Kirjaudu sisään tällä sähköpostiosoitteella, niin näet alueesi tarjouspyynnöt. Saat myös sähköpostin aina, kun uusia tarjouspyyntöjä tulee.',
    'Du får klippene tilbake hvis kunden trekker forespørselen, eller ikke svarer innen {dager} dager etter at du sendte tilbudet.':
      'Saat klipit takaisin, jos asiakas peruu tarjouspyynnön tai ei vastaa {dager} päivän kuluessa siitä, kun lähetit tarjouksen.',
    'Logg inn': 'Kirjaudu sisään',
  },
};
export default ord;
