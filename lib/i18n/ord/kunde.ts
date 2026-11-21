/**
 * Oversettelser. Nøkkel = den norske teksten nøyaktig slik den står i koden (med {felt} for variabler).
 * Verdien er teksten på svensk (sv), dansk (da) og finsk (fi). Mangler en nøkkel, vises norsk.
 *
 * Dekker kundens forespørselsskjema (app/foresporsel), bekreftelsessiden og -e-posten,
 * felles UI-komponenter (components/ui) og tilstander (components/states).
 */
const ord: { sv: Record<string, string>; da: Record<string, string>; fi: Record<string, string> } = {
  sv: {
    // Metadata
    'Få cateringtilbud': 'Få cateringofferter',
    'Beskriv behovet i to korte steg. Godkjente cateringleverandører i nærheten svarer med meny og pris per kuvert. Gratis og uforpliktende.':
      'Beskriv vad du behöver i två korta steg. Godkända cateringleverantörer i närheten svarar med meny och pris per kuvert. Gratis och utan förpliktelser.',

    // Skjemaet: ramme og steg
    'Tilbake til forsiden': 'Tillbaka till startsidan',
    'Tilbake til behovet': 'Tillbaka till behovet',
    'Steg {steg} av {totalt}': 'Steg {steg} av {totalt}',
    'Lukk skjemaet. Valgene om behovet og maten blir lagret i denne fanen.': 'Stäng formuläret. Dina val om behov och mat sparas i den här fliken.',
    'Fortell om ditt behov': 'Berätta vad du behöver',
    'Hvor skal vi sende tilbudene?': 'Vart ska vi skicka offerterna?',
    'Tar rundt to minutter. Et omtrentlig svar holder, leverandørene kan foreslå alternativer.':
      'Tar ungefär två minuter. Ett ungefärligt svar räcker, leverantörerna kan föreslå alternativ.',
    'Du trenger ikke lage konto. Vi sender lenke til tilbudene på e-post.': 'Du behöver inget konto. Vi skickar en länk till offerterna via e-post.',
    'Neste: kontaktinfo': 'Nästa: kontaktuppgifter',
    Sender: 'Skickar',
    'Send forespørsel': 'Skicka förfrågan',
    'Ingenting sendes før neste steg.': 'Inget skickas förrän i nästa steg.',
    'Gratis og uforpliktende.': 'Gratis och utan förpliktelser.',
    Nettside: 'Webbplats',

    // Steg 1: behovet
    'Hva gjelder det?': 'Vad gäller det?',
    'Antall gjester': 'Antal gäster',
    'Færre gjester': 'Färre gäster',
    'Flere gjester': 'Fler gäster',
    Dato: 'Datum',
    'Hentes kl.': 'Hämtas kl.',
    'Må leveres før kl.': 'Levereras senast kl.',
    'Datoen er fleksibel eller ikke bestemt': 'Datumet är flexibelt eller inte bestämt',
    'Levering eller henting': 'Leverans eller avhämtning',
    'Leveringsadresse (valgfritt nå)': 'Leveransadress (valfritt nu)',
    'Gate og nummer': 'Gata och nummer',
    'Deles bare med leverandøren du velger.': 'Delas bara med leverantören du väljer.',
    Postnummer: 'Postnummer',
    'Du får tilbud fra leverandører som leverer i området ditt.': 'Du får offerter från leverantörer som levererar i ditt område.',
    'Sjekker postnummeret …': 'Kontrollerar postnumret …',
    'Du får tilbud fra leverandørene som leverer her.': 'Du får offerter från leverantörerna som levererar hit.',
    'Ingen leverandører har oppgitt at de leverer her ennå, men du kan sende forespørselen likevel.':
      'Inga leverantörer har angett att de levererar hit än, men du kan skicka förfrågan ändå.',
    Maten: 'Maten',
    'Budsjett per kuvert inkl. mva': 'Budget per kuvert inkl. moms',
    Kosthold: 'Specialkost',
    'Velg det som gjelder, og hvor mange det gjelder.': 'Välj det som gäller och hur många det gäller.',
    Allergier: 'Allergier',
    'De 14 allergenene leverandøren skal merke etter Mattilsynets regler.': 'De 14 allergener som leverantören ska märka enligt Livsmedelsverkets regler.',
    'Valgt kosthold og allergier': 'Vald specialkost och allergier',
    'Allergi: {navn}': 'Allergi: {navn}',
    'Fjern {navn}': 'Ta bort {navn}',
    'Fjern allergi mot {navn}': 'Ta bort allergi mot {navn}',
    'Én person færre med {navn}': 'En person färre med {navn}',
    'Antall personer, {navn}': 'Antal personer, {navn}',
    'Én person til med {navn}': 'En person till med {navn}',
    person: 'person',
    personer: 'personer',
    Alvorlig: 'Allvarlig',
    'Andre ønsker (valgfritt)': 'Övriga önskemål (valfritt)',
    'For eksempel servering, drikke, servise, andre allergier eller fast levering. Vises bare for leverandørene som låser opp forespørselen.':
      'Till exempel servering, dryck, porslin, andra allergier eller återkommande leveranser. Visas bara för leverantörerna som låser upp förfrågan.',

    // Valideringsfeil
    'Skriv antall gjester, minst 1.': 'Ange antal gäster, minst 1.',
    'Velg en dato, eller kryss av for at datoen ikke er bestemt.': 'Välj ett datum, eller kryssa i att datumet inte är bestämt.',
    'Datoen har passert. Velg en dato fra i dag og fremover.': 'Datumet har passerat. Välj ett datum från och med i dag.',
    'Datoen har passert.': 'Datumet har passerat.',
    'Velg et klokkeslett.': 'Välj en tid.',
    'Ugyldig klokkeslett.': 'Ogiltig tid.',
    'Skriv postnummeret med fire siffer, for eksempel {eksempel}.': 'Skriv postnumret med fyra siffror, till exempel {eksempel}.',
    'Skriv postnummeret med fem siffer, for eksempel {eksempel}.': 'Skriv postnumret med fem siffror, till exempel {eksempel}.',
    'Vi finner ikke dette postnummeret.': 'Vi hittar inte det här postnumret.',
    'Vi finner ikke dette postnummeret. Sjekk at det stemmer.': 'Vi hittar inte det här postnumret. Kontrollera att det stämmer.',
    'Skriv navnet ditt.': 'Skriv ditt namn.',
    'E-postadressen mangler domene, for eksempel @firma.no.': 'E-postadressen saknar domän, till exempel @foretag.se.',
    'Skriv e-postadressen din, for eksempel kari@firma.no.': 'Skriv din e-postadress, till exempel anna@foretag.se.',
    'Skriv en gyldig e-postadresse.': 'Skriv en giltig e-postadress.',
    'Telefonnummeret må ha minst åtte siffer, for eksempel 912 34 567.': 'Telefonnumret måste ha minst åtta siffror, till exempel 070 123 45 67.',
    'Vi fikk ikke kontakt. Sjekk nettforbindelsen og prøv igjen. Det du har fylt ut, er tatt vare på.':
      'Vi fick ingen kontakt. Kontrollera internetanslutningen och försök igen. Det du har fyllt i är sparat.',
    'Noe i skjemaet mangler. Last siden på nytt og prøv igjen.': 'Något saknas i formuläret. Ladda om sidan och försök igen.',
    'Det er sendt mange forespørsler på kort tid. Vent litt, eller skriv til hei@kuverto.no.':
      'Många förfrågningar har skickats på kort tid. Vänta en stund, eller skriv till hei@kuverto.no.',
    'Vi fikk ikke lagret forespørselen. Prøv igjen om litt.': 'Vi kunde inte spara förfrågan. Försök igen om en stund.',

    // Steg 2: kontakt
    '{antall} gjester': '{antall} gäster',
    'Fleksibel dato': 'Flexibelt datum',
    'per kuvert': 'per kuvert',
    Endre: 'Ändra',
    behovet: 'behovet',
    Navn: 'Namn',
    'E-post': 'E-post',
    'Telefon (valgfritt)': 'Telefon (valfritt)',
    'Bedrift (valgfritt)': 'Företag (valfritt)',
    'Hvem ser hva?': 'Vem ser vad?',
    'Leverandører i området ser behovet og maten, ikke hvem du er.': 'Leverantörer i området ser behovet och maten, inte vem du är.',
    'Navn, kontaktinfo og ønskene dine ser bare de som låser opp forespørselen, høyst {maks}. Gateadressen deles først når du velger et tilbud.':
      'Namn, kontaktuppgifter och dina önskemål ser bara de som låser upp förfrågan, högst {maks}. Gatuadressen delas först när du väljer en offert.',
    Personvern: 'Integritet',
    '(åpnes i ny fane)': '(öppnas i ny flik)',

    // Etter innsending
    'Sjekk e-posten din': 'Kolla din e-post',
    'Vi har sendt en e-post til {epost}. Trykk på «Bekreft og send» i e-posten, så går forespørselen til leverandørene.':
      'Vi har skickat ett mejl till {epost}. Tryck på ”Bekräfta och skicka” i mejlet, så går förfrågan till leverantörerna.',
    '{antall} kuverter': '{antall} kuvert',
    'Hva skjer nå?': 'Vad händer nu?',
    'Ingen leverandører har oppgitt at de leverer i {sted} ennå. Når du har bekreftet, ligger forespørselen klar, og leverandører som begynner å levere der, ser den.':
      'Inga leverantörer har angett att de levererar i {sted} än. När du har bekräftat ligger förfrågan redo, och leverantörer som börjar leverera där ser den.',
    'Ingen leverandører har oppgitt at de leverer i området ditt ennå. Når du har bekreftet, ligger forespørselen klar, og leverandører som begynner å levere der, ser den.':
      'Inga leverantörer har angett att de levererar i ditt område än. När du har bekräftat ligger förfrågan redo, och leverantörer som börjar leverera där ser den.',
    'Når du har bekreftet, får godkjente leverandører som leverer i {sted} beskjed om forespørselen.':
      'När du har bekräftat får godkända leverantörer som levererar i {sted} besked om förfrågan.',
    'Når du har bekreftet, får godkjente leverandører som leverer i området ditt beskjed om forespørselen.':
      'När du har bekräftat får godkända leverantörer som levererar i ditt område besked om förfrågan.',
    'Du får en e-post hver gang et tilbud kommer inn. Høyst {maks} leverandører kan svare.':
      'Du får ett mejl varje gång en offert kommer in. Högst {maks} leverantörer kan svara.',
    'Sammenlign tilbudene og velg det som passer, eller la være. Det er helt uforpliktende.':
      'Jämför offerterna och välj den som passar, eller låt bli. Det är helt utan förpliktelser.',
    'Finner du ikke e-posten? Sjekk søppelpost, eller skriv til hei@kuverto.no.': 'Hittar du inte mejlet? Kolla skräpposten, eller skriv till hei@kuverto.no.',
    'Til forsiden': 'Till startsidan',

    // Bekreftelsessiden
    'Bekreft forespørselen': 'Bekräfta förfrågan',
    'Forespørselen er sendt': 'Förfrågan är skickad',
    'Takk! Godkjente leverandører i området har fått beskjed. Du får en e-post hver gang et tilbud kommer inn, og høyst {maks} leverandører kan svare.':
      'Tack! Godkända leverantörer i området har fått besked. Du får ett mejl varje gång en offert kommer in, och högst {maks} leverantörer kan svara.',
    'Logg inn og følg forespørselen': 'Logga in och följ förfrågan',
    'Lenken er allerede brukt': 'Länken har redan använts',
    'Ugyldig lenke': 'Ogiltig länk',
    'Forespørselen er trolig allerede bekreftet og sendt til leverandørene. Logg inn for å se den.':
      'Förfrågan är troligen redan bekräftad och skickad till leverantörerna. Logga in för att se den.',
    'Vi kjenner ikke igjen lenken. Kopier hele lenken fra e-posten, eller send en ny forespørsel.':
      'Vi känner inte igen länken. Kopiera hela länken från mejlet, eller skicka en ny förfrågan.',
    'Logg inn': 'Logga in',

    // E-post til kunden
    'Bekreft forespørselen din om {anledning}': 'Bekräfta din förfrågan om {anledning}',
    'Hei {fornavn}! Se over forespørselen under. Stemmer alt, trykker du på knappen. Da sender vi den til godkjente leverandører i området.':
      'Hej {fornavn}! Titta igenom förfrågan nedan. Stämmer allt trycker du på knappen. Då skickar vi den till godkända leverantörer i området.',
    'Leverandørene ser først området og behovet. Navn, kontaktinfo og ønskene dine ser bare de som låser opp forespørselen, og gateadressen deles først når du velger et tilbud.':
      'Leverantörerna ser först området och behovet. Namn, kontaktuppgifter och dina önskemål ser bara de som låser upp förfrågan, och gatuadressen delas först när du väljer en offert.',
    'Du får bare tilbud fra leverandører som har oppgitt at de leverer i ditt område.': 'Du får bara offerter från leverantörer som har angett att de levererar i ditt område.',
    'Ingen leverandører har oppgitt at de leverer i {kommune} ennå. Bekrefter du, ligger forespørselen klar, og leverandører som begynner å levere i området, ser den.':
      'Inga leverantörer har angett att de levererar i {kommune} än. Bekräftar du ligger förfrågan redo, och leverantörer som börjar leverera i området ser den.',
    'Er noe feil? Ikke bekreft. Send heller en ny forespørsel på kuverto.no.': 'Är något fel? Bekräfta inte. Skicka hellre en ny förfrågan på kuverto.no.',
    'Bekreft og send': 'Bekräfta och skicka',
    'Sendte du ikke denne forespørselen, kan du se bort fra e-posten. Da blir ingenting sendt videre.':
      'Har du inte skickat den här förfrågan kan du bortse från mejlet. Då skickas ingenting vidare.',

    // Datovelger
    'Forrige måned': 'Föregående månad',
    'Neste måned': 'Nästa månad',
    'dd.mm.åååå': 'dd.mm.åååå',
    'Velg dato i kalender. Valgt: {dato}': 'Välj datum i kalendern. Valt: {dato}',
    'Velg dato i kalender': 'Välj datum i kalendern',
    'Skriv datoen eller velg i kalenderen.': 'Skriv datumet eller välj i kalendern.',
    'I dag': 'I dag',
    Lukk: 'Stäng',

    // Tilstander
    'Bordet er dekket': 'Bordet är dukat',
    'Du har valgt {leverandor}. De tar kontakt for å avtale detaljene, og de andre får beskjed.':
      'Du har valt {leverandor}. De hör av sig för att komma överens om detaljerna, och de andra får besked.',
    'Vi får ikke kontakt': 'Vi får ingen kontakt',
    'Prøv igjen': 'Försök igen',
    'Sjekk nettforbindelsen. Det du har fylt ut, er lagret på telefonen.': 'Kontrollera internetanslutningen. Det du har fyllt i är sparat på telefonen.',
    Laster: 'Laddar',
  },

  da: {
    // Metadata
    'Få cateringtilbud': 'Få cateringtilbud',
    'Beskriv behovet i to korte steg. Godkjente cateringleverandører i nærheten svarer med meny og pris per kuvert. Gratis og uforpliktende.':
      'Beskriv dit behov i to korte trin. Godkendte cateringleverandører i nærheden svarer med menu og pris pr. kuvert. Gratis og uforpligtende.',

    // Skjemaet: ramme og steg
    'Tilbake til forsiden': 'Tilbage til forsiden',
    'Tilbake til behovet': 'Tilbage til behovet',
    'Steg {steg} av {totalt}': 'Trin {steg} af {totalt}',
    'Lukk skjemaet. Valgene om behovet og maten blir lagret i denne fanen.': 'Luk formularen. Dine valg om behov og mad gemmes i denne fane.',
    'Fortell om ditt behov': 'Fortæl, hvad du har brug for',
    'Hvor skal vi sende tilbudene?': 'Hvor skal vi sende tilbuddene hen?',
    'Tar rundt to minutter. Et omtrentlig svar holder, leverandørene kan foreslå alternativer.':
      'Tager cirka to minutter. Et omtrentligt svar er nok, leverandørerne kan foreslå alternativer.',
    'Du trenger ikke lage konto. Vi sender lenke til tilbudene på e-post.': 'Du behøver ikke oprette en konto. Vi sender et link til tilbuddene på e-mail.',
    'Neste: kontaktinfo': 'Næste: kontaktoplysninger',
    Sender: 'Sender',
    'Send forespørsel': 'Send forespørgsel',
    'Ingenting sendes før neste steg.': 'Intet sendes før næste trin.',
    'Gratis og uforpliktende.': 'Gratis og uforpligtende.',
    Nettside: 'Hjemmeside',

    // Steg 1: behovet
    'Hva gjelder det?': 'Hvad drejer det sig om?',
    'Antall gjester': 'Antal gæster',
    'Færre gjester': 'Færre gæster',
    'Flere gjester': 'Flere gæster',
    Dato: 'Dato',
    'Hentes kl.': 'Afhentes kl.',
    'Må leveres før kl.': 'Skal leveres senest kl.',
    'Datoen er fleksibel eller ikke bestemt': 'Datoen er fleksibel eller ikke fastlagt',
    'Levering eller henting': 'Levering eller afhentning',
    'Leveringsadresse (valgfritt nå)': 'Leveringsadresse (valgfrit nu)',
    'Gate og nummer': 'Vej og nummer',
    'Deles bare med leverandøren du velger.': 'Deles kun med den leverandør, du vælger.',
    Postnummer: 'Postnummer',
    'Du får tilbud fra leverandører som leverer i området ditt.': 'Du får tilbud fra leverandører, der leverer i dit område.',
    'Sjekker postnummeret …': 'Tjekker postnummeret …',
    'Du får tilbud fra leverandørene som leverer her.': 'Du får tilbud fra de leverandører, der leverer her.',
    'Ingen leverandører har oppgitt at de leverer her ennå, men du kan sende forespørselen likevel.':
      'Ingen leverandører har oplyst, at de leverer her endnu, men du kan sende forespørgslen alligevel.',
    Maten: 'Maden',
    'Budsjett per kuvert inkl. mva': 'Budget pr. kuvert inkl. moms',
    Kosthold: 'Kost',
    'Velg det som gjelder, og hvor mange det gjelder.': 'Vælg det, der gælder, og hvor mange det gælder.',
    Allergier: 'Allergier',
    'De 14 allergenene leverandøren skal merke etter Mattilsynets regler.': 'De 14 allergener, som leverandøren skal mærke efter Fødevarestyrelsens regler.',
    'Valgt kosthold og allergier': 'Valgt kost og allergier',
    'Allergi: {navn}': 'Allergi: {navn}',
    'Fjern {navn}': 'Fjern {navn}',
    'Fjern allergi mot {navn}': 'Fjern allergi over for {navn}',
    'Én person færre med {navn}': 'Én person færre med {navn}',
    'Antall personer, {navn}': 'Antal personer, {navn}',
    'Én person til med {navn}': 'Én person mere med {navn}',
    person: 'person',
    personer: 'personer',
    Alvorlig: 'Alvorlig',
    'Andre ønsker (valgfritt)': 'Andre ønsker (valgfrit)',
    'For eksempel servering, drikke, servise, andre allergier eller fast levering. Vises bare for leverandørene som låser opp forespørselen.':
      'For eksempel servering, drikkevarer, service, andre allergier eller fast levering. Vises kun for de leverandører, der låser forespørgslen op.',

    // Valideringsfeil
    'Skriv antall gjester, minst 1.': 'Skriv antal gæster, mindst 1.',
    'Velg en dato, eller kryss av for at datoen ikke er bestemt.': 'Vælg en dato, eller sæt kryds ved, at datoen ikke er fastlagt.',
    'Datoen har passert. Velg en dato fra i dag og fremover.': 'Datoen er overskredet. Vælg en dato fra i dag og frem.',
    'Datoen har passert.': 'Datoen er overskredet.',
    'Velg et klokkeslett.': 'Vælg et tidspunkt.',
    'Ugyldig klokkeslett.': 'Ugyldigt tidspunkt.',
    'Skriv postnummeret med fire siffer, for eksempel {eksempel}.': 'Skriv postnummeret med fire cifre, for eksempel {eksempel}.',
    'Skriv postnummeret med fem siffer, for eksempel {eksempel}.': 'Skriv postnummeret med fem cifre, for eksempel {eksempel}.',
    'Vi finner ikke dette postnummeret.': 'Vi kan ikke finde dette postnummer.',
    'Vi finner ikke dette postnummeret. Sjekk at det stemmer.': 'Vi kan ikke finde dette postnummer. Tjek, at det er rigtigt.',
    'Skriv navnet ditt.': 'Skriv dit navn.',
    'E-postadressen mangler domene, for eksempel @firma.no.': 'E-mailadressen mangler et domæne, for eksempel @firma.dk.',
    'Skriv e-postadressen din, for eksempel kari@firma.no.': 'Skriv din e-mailadresse, for eksempel anne@firma.dk.',
    'Skriv en gyldig e-postadresse.': 'Skriv en gyldig e-mailadresse.',
    'Telefonnummeret må ha minst åtte siffer, for eksempel 912 34 567.': 'Telefonnummeret skal have mindst otte cifre, for eksempel 20 12 34 56.',
    'Vi fikk ikke kontakt. Sjekk nettforbindelsen og prøv igjen. Det du har fylt ut, er tatt vare på.':
      'Vi fik ikke forbindelse. Tjek din internetforbindelse, og prøv igen. Det, du har udfyldt, er gemt.',
    'Noe i skjemaet mangler. Last siden på nytt og prøv igjen.': 'Der mangler noget i formularen. Genindlæs siden, og prøv igen.',
    'Det er sendt mange forespørsler på kort tid. Vent litt, eller skriv til hei@kuverto.no.':
      'Der er sendt mange forespørgsler på kort tid. Vent lidt, eller skriv til hei@kuverto.no.',
    'Vi fikk ikke lagret forespørselen. Prøv igjen om litt.': 'Vi kunne ikke gemme forespørgslen. Prøv igen om lidt.',

    // Steg 2: kontakt
    '{antall} gjester': '{antall} gæster',
    'Fleksibel dato': 'Fleksibel dato',
    'per kuvert': 'pr. kuvert',
    Endre: 'Ret',
    behovet: 'behovet',
    Navn: 'Navn',
    'E-post': 'E-mail',
    'Telefon (valgfritt)': 'Telefon (valgfrit)',
    'Bedrift (valgfritt)': 'Virksomhed (valgfrit)',
    'Hvem ser hva?': 'Hvem ser hvad?',
    'Leverandører i området ser behovet og maten, ikke hvem du er.': 'Leverandører i området ser behovet og maden, ikke hvem du er.',
    'Navn, kontaktinfo og ønskene dine ser bare de som låser opp forespørselen, høyst {maks}. Gateadressen deles først når du velger et tilbud.':
      'Navn, kontaktoplysninger og dine ønsker ser kun de, der låser forespørgslen op, højst {maks}. Adressen deles først, når du vælger et tilbud.',
    Personvern: 'Privatliv',
    '(åpnes i ny fane)': '(åbner i ny fane)',

    // Etter innsending
    'Sjekk e-posten din': 'Tjek din e-mail',
    'Vi har sendt en e-post til {epost}. Trykk på «Bekreft og send» i e-posten, så går forespørselen til leverandørene.':
      'Vi har sendt en e-mail til {epost}. Tryk på »Bekræft og send« i e-mailen, så går forespørgslen til leverandørerne.',
    '{antall} kuverter': '{antall} kuverter',
    'Hva skjer nå?': 'Hvad sker der nu?',
    'Ingen leverandører har oppgitt at de leverer i {sted} ennå. Når du har bekreftet, ligger forespørselen klar, og leverandører som begynner å levere der, ser den.':
      'Ingen leverandører har oplyst, at de leverer i {sted} endnu. Når du har bekræftet, ligger forespørgslen klar, og leverandører, der begynder at levere der, kan se den.',
    'Ingen leverandører har oppgitt at de leverer i området ditt ennå. Når du har bekreftet, ligger forespørselen klar, og leverandører som begynner å levere der, ser den.':
      'Ingen leverandører har oplyst, at de leverer i dit område endnu. Når du har bekræftet, ligger forespørgslen klar, og leverandører, der begynder at levere der, kan se den.',
    'Når du har bekreftet, får godkjente leverandører som leverer i {sted} beskjed om forespørselen.':
      'Når du har bekræftet, får godkendte leverandører, der leverer i {sted}, besked om forespørgslen.',
    'Når du har bekreftet, får godkjente leverandører som leverer i området ditt beskjed om forespørselen.':
      'Når du har bekræftet, får godkendte leverandører, der leverer i dit område, besked om forespørgslen.',
    'Du får en e-post hver gang et tilbud kommer inn. Høyst {maks} leverandører kan svare.':
      'Du får en e-mail, hver gang der kommer et tilbud. Højst {maks} leverandører kan svare.',
    'Sammenlign tilbudene og velg det som passer, eller la være. Det er helt uforpliktende.':
      'Sammenlign tilbuddene, og vælg det, der passer, eller lad være. Det er helt uforpligtende.',
    'Finner du ikke e-posten? Sjekk søppelpost, eller skriv til hei@kuverto.no.': 'Kan du ikke finde e-mailen? Tjek spam, eller skriv til hei@kuverto.no.',
    'Til forsiden': 'Til forsiden',

    // Bekreftelsessiden
    'Bekreft forespørselen': 'Bekræft forespørgslen',
    'Forespørselen er sendt': 'Forespørgslen er sendt',
    'Takk! Godkjente leverandører i området har fått beskjed. Du får en e-post hver gang et tilbud kommer inn, og høyst {maks} leverandører kan svare.':
      'Tak! Godkendte leverandører i området har fået besked. Du får en e-mail, hver gang der kommer et tilbud, og højst {maks} leverandører kan svare.',
    'Logg inn og følg forespørselen': 'Log ind, og følg forespørgslen',
    'Lenken er allerede brukt': 'Linket er allerede brugt',
    'Ugyldig lenke': 'Ugyldigt link',
    'Forespørselen er trolig allerede bekreftet og sendt til leverandørene. Logg inn for å se den.':
      'Forespørgslen er sandsynligvis allerede bekræftet og sendt til leverandørerne. Log ind for at se den.',
    'Vi kjenner ikke igjen lenken. Kopier hele lenken fra e-posten, eller send en ny forespørsel.':
      'Vi kan ikke genkende linket. Kopiér hele linket fra e-mailen, eller send en ny forespørgsel.',
    'Logg inn': 'Log ind',

    // E-post til kunden
    'Bekreft forespørselen din om {anledning}': 'Bekræft din forespørgsel om {anledning}',
    'Hei {fornavn}! Se over forespørselen under. Stemmer alt, trykker du på knappen. Da sender vi den til godkjente leverandører i området.':
      'Hej {fornavn}! Se forespørgslen igennem herunder. Passer det hele, trykker du på knappen. Så sender vi den til godkendte leverandører i området.',
    'Leverandørene ser først området og behovet. Navn, kontaktinfo og ønskene dine ser bare de som låser opp forespørselen, og gateadressen deles først når du velger et tilbud.':
      'Leverandørerne ser først området og behovet. Navn, kontaktoplysninger og dine ønsker ser kun de, der låser forespørgslen op, og adressen deles først, når du vælger et tilbud.',
    'Du får bare tilbud fra leverandører som har oppgitt at de leverer i ditt område.': 'Du får kun tilbud fra leverandører, der har oplyst, at de leverer i dit område.',
    'Ingen leverandører har oppgitt at de leverer i {kommune} ennå. Bekrefter du, ligger forespørselen klar, og leverandører som begynner å levere i området, ser den.':
      'Ingen leverandører har oplyst, at de leverer i {kommune} endnu. Bekræfter du, ligger forespørgslen klar, og leverandører, der begynder at levere i området, kan se den.',
    'Er noe feil? Ikke bekreft. Send heller en ny forespørsel på kuverto.no.': 'Er der noget galt? Så lad være med at bekræfte. Send hellere en ny forespørgsel på kuverto.no.',
    'Bekreft og send': 'Bekræft og send',
    'Sendte du ikke denne forespørselen, kan du se bort fra e-posten. Da blir ingenting sendt videre.':
      'Har du ikke sendt denne forespørgsel, kan du se bort fra e-mailen. Så bliver intet sendt videre.',

    // Datovelger
    'Forrige måned': 'Forrige måned',
    'Neste måned': 'Næste måned',
    'dd.mm.åååå': 'dd.mm.åååå',
    'Velg dato i kalender. Valgt: {dato}': 'Vælg dato i kalenderen. Valgt: {dato}',
    'Velg dato i kalender': 'Vælg dato i kalenderen',
    'Skriv datoen eller velg i kalenderen.': 'Skriv datoen, eller vælg i kalenderen.',
    'I dag': 'I dag',
    Lukk: 'Luk',

    // Tilstander
    'Bordet er dekket': 'Bordet er dækket',
    'Du har valgt {leverandor}. De tar kontakt for å avtale detaljene, og de andre får beskjed.':
      'Du har valgt {leverandor}. De kontakter dig for at aftale detaljerne, og de andre får besked.',
    'Vi får ikke kontakt': 'Vi kan ikke få forbindelse',
    'Prøv igjen': 'Prøv igen',
    'Sjekk nettforbindelsen. Det du har fylt ut, er lagret på telefonen.': 'Tjek din internetforbindelse. Det, du har udfyldt, er gemt på telefonen.',
    Laster: 'Indlæser',
  },

  fi: {
    // Metadata
    'Få cateringtilbud': 'Pyydä catering-tarjouksia',
    'Beskriv behovet i to korte steg. Godkjente cateringleverandører i nærheten svarer med meny og pris per kuvert. Gratis og uforpliktende.':
      'Kerro tarpeestasi kahdessa lyhyessä vaiheessa. Hyväksytyt catering-toimittajat läheltäsi vastaavat menulla ja hinnalla per henkilö. Maksuton ja sitoumukseton.',

    // Skjemaet: ramme og steg
    'Tilbake til forsiden': 'Takaisin etusivulle',
    'Tilbake til behovet': 'Takaisin tarpeisiin',
    'Steg {steg} av {totalt}': 'Vaihe {steg}/{totalt}',
    'Lukk skjemaet. Valgene om behovet og maten blir lagret i denne fanen.': 'Sulje lomake. Tarpeeseen ja ruokaan liittyvät valintasi tallentuvat tähän välilehteen.',
    'Fortell om ditt behov': 'Kerro tarpeestasi',
    'Hvor skal vi sende tilbudene?': 'Minne lähetämme tarjoukset?',
    'Tar rundt to minutter. Et omtrentlig svar holder, leverandørene kan foreslå alternativer.':
      'Vie noin kaksi minuuttia. Suuntaa-antava vastaus riittää, toimittajat voivat ehdottaa vaihtoehtoja.',
    'Du trenger ikke lage konto. Vi sender lenke til tilbudene på e-post.': 'Tiliä ei tarvita. Lähetämme linkin tarjouksiin sähköpostitse.',
    'Neste: kontaktinfo': 'Seuraavaksi: yhteystiedot',
    Sender: 'Lähetetään',
    'Send forespørsel': 'Lähetä tarjouspyyntö',
    'Ingenting sendes før neste steg.': 'Mitään ei lähetetä ennen seuraavaa vaihetta.',
    'Gratis og uforpliktende.': 'Maksuton ja sitoumukseton.',
    Nettside: 'Verkkosivusto',

    // Steg 1: behovet
    'Hva gjelder det?': 'Mihin tarpeeseen?',
    'Antall gjester': 'Vieraiden määrä',
    'Færre gjester': 'Vähemmän vieraita',
    'Flere gjester': 'Enemmän vieraita',
    Dato: 'Päivämäärä',
    'Hentes kl.': 'Nouto klo',
    'Må leveres før kl.': 'Toimitus viimeistään klo',
    'Datoen er fleksibel eller ikke bestemt': 'Päivämäärä on joustava tai ei vielä päätetty',
    'Levering eller henting': 'Toimitus vai nouto',
    'Leveringsadresse (valgfritt nå)': 'Toimitusosoite (vapaaehtoinen tässä vaiheessa)',
    'Gate og nummer': 'Katu ja numero',
    'Deles bare med leverandøren du velger.': 'Näytetään vain valitsemallesi toimittajalle.',
    Postnummer: 'Postinumero',
    'Du får tilbud fra leverandører som leverer i området ditt.': 'Saat tarjouksia toimittajilta, jotka toimittavat alueellesi.',
    'Sjekker postnummeret …': 'Tarkistetaan postinumeroa …',
    'Du får tilbud fra leverandørene som leverer her.': 'Saat tarjouksia toimittajilta, jotka toimittavat tänne.',
    'Ingen leverandører har oppgitt at de leverer her ennå, men du kan sende forespørselen likevel.':
      'Yksikään toimittaja ei ole vielä ilmoittanut toimittavansa tänne, mutta voit silti lähettää tarjouspyynnön.',
    Maten: 'Ruoka',
    'Budsjett per kuvert inkl. mva': 'Budjetti per henkilö (sis. alv)',
    Kosthold: 'Ruokavaliot',
    'Velg det som gjelder, og hvor mange det gjelder.': 'Valitse, mitkä koskevat teitä ja kuinka monta henkilöä.',
    Allergier: 'Allergiat',
    'De 14 allergenene leverandøren skal merke etter Mattilsynets regler.': 'Ne 14 allergeenia, jotka toimittajan on merkittävä Ruokaviraston ohjeiden mukaan.',
    'Valgt kosthold og allergier': 'Valitut ruokavaliot ja allergiat',
    'Allergi: {navn}': 'Allergia: {navn}',
    'Fjern {navn}': 'Poista {navn}',
    'Fjern allergi mot {navn}': 'Poista allergia: {navn}',
    'Én person færre med {navn}': 'Yksi henkilö vähemmän: {navn}',
    'Antall personer, {navn}': 'Henkilöiden määrä: {navn}',
    'Én person til med {navn}': 'Yksi henkilö lisää: {navn}',
    person: 'henkilö',
    personer: 'henkilöä',
    Alvorlig: 'Vakava',
    'Andre ønsker (valgfritt)': 'Muut toiveet (vapaaehtoinen)',
    'For eksempel servering, drikke, servise, andre allergier eller fast levering. Vises bare for leverandørene som låser opp forespørselen.':
      'Esimerkiksi tarjoilu, juomat, astiat, muut allergiat tai säännöllinen toimitus. Näkyy vain toimittajille, jotka avaavat tarjouspyynnön.',

    // Valideringsfeil
    'Skriv antall gjester, minst 1.': 'Kirjoita vieraiden määrä, vähintään 1.',
    'Velg en dato, eller kryss av for at datoen ikke er bestemt.': 'Valitse päivämäärä tai merkitse, ettei päivämäärää ole vielä päätetty.',
    'Datoen har passert. Velg en dato fra i dag og fremover.': 'Päivämäärä on mennyt. Valitse tämä päivä tai myöhempi päivä.',
    'Datoen har passert.': 'Päivämäärä on mennyt.',
    'Velg et klokkeslett.': 'Valitse kellonaika.',
    'Ugyldig klokkeslett.': 'Virheellinen kellonaika.',
    'Skriv postnummeret med fire siffer, for eksempel {eksempel}.': 'Kirjoita nelinumeroinen postinumero, esimerkiksi {eksempel}.',
    'Skriv postnummeret med fem siffer, for eksempel {eksempel}.': 'Kirjoita viisinumeroinen postinumero, esimerkiksi {eksempel}.',
    'Vi finner ikke dette postnummeret.': 'Emme löydä tätä postinumeroa.',
    'Vi finner ikke dette postnummeret. Sjekk at det stemmer.': 'Emme löydä tätä postinumeroa. Tarkista, että se on oikein.',
    'Skriv navnet ditt.': 'Kirjoita nimesi.',
    'E-postadressen mangler domene, for eksempel @firma.no.': 'Sähköpostiosoitteesta puuttuu verkkotunnus, esimerkiksi @yritys.fi.',
    'Skriv e-postadressen din, for eksempel kari@firma.no.': 'Kirjoita sähköpostiosoitteesi, esimerkiksi maija@yritys.fi.',
    'Skriv en gyldig e-postadresse.': 'Kirjoita kelvollinen sähköpostiosoite.',
    'Telefonnummeret må ha minst åtte siffer, for eksempel 912 34 567.': 'Puhelinnumerossa on oltava vähintään kahdeksan numeroa, esimerkiksi 040 123 4567.',
    'Vi fikk ikke kontakt. Sjekk nettforbindelsen og prøv igjen. Det du har fylt ut, er tatt vare på.':
      'Yhteyttä ei saatu. Tarkista verkkoyhteys ja yritä uudelleen. Täyttämäsi tiedot ovat tallessa.',
    'Noe i skjemaet mangler. Last siden på nytt og prøv igjen.': 'Lomakkeesta puuttuu jotain. Lataa sivu uudelleen ja yritä uudestaan.',
    'Det er sendt mange forespørsler på kort tid. Vent litt, eller skriv til hei@kuverto.no.':
      'Tarjouspyyntöjä on lähetetty paljon lyhyessä ajassa. Odota hetki tai kirjoita osoitteeseen hei@kuverto.no.',
    'Vi fikk ikke lagret forespørselen. Prøv igjen om litt.': 'Tarjouspyyntöä ei saatu tallennettua. Yritä hetken päästä uudelleen.',

    // Steg 2: kontakt
    '{antall} gjester': '{antall} vierasta',
    'Fleksibel dato': 'Joustava päivämäärä',
    'per kuvert': 'per henkilö',
    Endre: 'Muuta',
    behovet: 'tarpeita',
    Navn: 'Nimi',
    'E-post': 'Sähköposti',
    'Telefon (valgfritt)': 'Puhelin (vapaaehtoinen)',
    'Bedrift (valgfritt)': 'Yritys (vapaaehtoinen)',
    'Hvem ser hva?': 'Kuka näkee mitä?',
    'Leverandører i området ser behovet og maten, ikke hvem du er.': 'Alueen toimittajat näkevät tarpeen ja ruoan, eivät sitä, kuka olet.',
    'Navn, kontaktinfo og ønskene dine ser bare de som låser opp forespørselen, høyst {maks}. Gateadressen deles først når du velger et tilbud.':
      'Nimesi, yhteystietosi ja toiveesi näkevät vain tarjouspyynnön avaavat toimittajat, enintään {maks}. Katuosoite näytetään vasta, kun valitset tarjouksen.',
    Personvern: 'Tietosuoja',
    '(åpnes i ny fane)': '(avautuu uuteen välilehteen)',

    // Etter innsending
    'Sjekk e-posten din': 'Tarkista sähköpostisi',
    'Vi har sendt en e-post til {epost}. Trykk på «Bekreft og send» i e-posten, så går forespørselen til leverandørene.':
      'Lähetimme viestin osoitteeseen {epost}. Paina viestissä ”Vahvista ja lähetä”, niin tarjouspyyntö lähtee toimittajille.',
    '{antall} kuverter': '{antall} henkilöä',
    'Hva skjer nå?': 'Mitä seuraavaksi?',
    'Ingen leverandører har oppgitt at de leverer i {sted} ennå. Når du har bekreftet, ligger forespørselen klar, og leverandører som begynner å levere der, ser den.':
      'Yksikään toimittaja ei ole vielä ilmoittanut toimittavansa alueelle {sted}. Kun olet vahvistanut, tarjouspyyntö odottaa valmiina, ja sinne toimittamisen aloittavat toimittajat näkevät sen.',
    'Ingen leverandører har oppgitt at de leverer i området ditt ennå. Når du har bekreftet, ligger forespørselen klar, og leverandører som begynner å levere der, ser den.':
      'Yksikään toimittaja ei ole vielä ilmoittanut toimittavansa alueellesi. Kun olet vahvistanut, tarjouspyyntö odottaa valmiina, ja sinne toimittamisen aloittavat toimittajat näkevät sen.',
    'Når du har bekreftet, får godkjente leverandører som leverer i {sted} beskjed om forespørselen.':
      'Kun olet vahvistanut, hyväksytyt toimittajat, jotka toimittavat alueelle {sted}, saavat tiedon tarjouspyynnöstä.',
    'Når du har bekreftet, får godkjente leverandører som leverer i området ditt beskjed om forespørselen.':
      'Kun olet vahvistanut, alueellesi toimittavat hyväksytyt toimittajat saavat tiedon tarjouspyynnöstä.',
    'Du får en e-post hver gang et tilbud kommer inn. Høyst {maks} leverandører kan svare.':
      'Saat sähköpostin aina, kun uusi tarjous saapuu. Enintään {maks} toimittajaa voi vastata.',
    'Sammenlign tilbudene og velg det som passer, eller la være. Det er helt uforpliktende.':
      'Vertaile tarjouksia ja valitse sopivin – tai jätä valitsematta. Pyyntö ei sido sinua mihinkään.',
    'Finner du ikke e-posten? Sjekk søppelpost, eller skriv til hei@kuverto.no.': 'Etkö löydä viestiä? Tarkista roskaposti tai kirjoita osoitteeseen hei@kuverto.no.',
    'Til forsiden': 'Etusivulle',

    // Bekreftelsessiden
    'Bekreft forespørselen': 'Vahvista tarjouspyyntö',
    'Forespørselen er sendt': 'Tarjouspyyntö on lähetetty',
    'Takk! Godkjente leverandører i området har fått beskjed. Du får en e-post hver gang et tilbud kommer inn, og høyst {maks} leverandører kan svare.':
      'Kiitos! Alueen hyväksytyt toimittajat ovat saaneet tiedon. Saat sähköpostin aina, kun uusi tarjous saapuu, ja enintään {maks} toimittajaa voi vastata.',
    'Logg inn og følg forespørselen': 'Kirjaudu sisään ja seuraa tarjouspyyntöä',
    'Lenken er allerede brukt': 'Linkki on jo käytetty',
    'Ugyldig lenke': 'Virheellinen linkki',
    'Forespørselen er trolig allerede bekreftet og sendt til leverandørene. Logg inn for å se den.':
      'Tarjouspyyntö on todennäköisesti jo vahvistettu ja lähetetty toimittajille. Kirjaudu sisään nähdäksesi sen.',
    'Vi kjenner ikke igjen lenken. Kopier hele lenken fra e-posten, eller send en ny forespørsel.':
      'Emme tunnista linkkiä. Kopioi koko linkki sähköpostista tai lähetä uusi tarjouspyyntö.',
    'Logg inn': 'Kirjaudu sisään',

    // E-post til kunden
    'Bekreft forespørselen din om {anledning}': 'Vahvista tarjouspyyntösi: {anledning}',
    'Hei {fornavn}! Se over forespørselen under. Stemmer alt, trykker du på knappen. Da sender vi den til godkjente leverandører i området.':
      'Hei {fornavn}! Tarkista tarjouspyyntö alta. Jos kaikki on oikein, paina painiketta. Lähetämme sen silloin alueen hyväksytyille toimittajille.',
    'Leverandørene ser først området og behovet. Navn, kontaktinfo og ønskene dine ser bare de som låser opp forespørselen, og gateadressen deles først når du velger et tilbud.':
      'Toimittajat näkevät aluksi vain alueen ja tarpeen. Nimesi, yhteystietosi ja toiveesi näkevät vain tarjouspyynnön avaavat toimittajat, ja katuosoite näytetään vasta, kun valitset tarjouksen.',
    'Du får bare tilbud fra leverandører som har oppgitt at de leverer i ditt område.': 'Saat tarjouksia vain toimittajilta, jotka ovat ilmoittaneet toimittavansa alueellesi.',
    'Ingen leverandører har oppgitt at de leverer i {kommune} ennå. Bekrefter du, ligger forespørselen klar, og leverandører som begynner å levere i området, ser den.':
      'Yksikään toimittaja ei ole vielä ilmoittanut toimittavansa kuntaan {kommune}. Jos vahvistat, tarjouspyyntö odottaa valmiina, ja alueelle toimittamisen aloittavat toimittajat näkevät sen.',
    'Er noe feil? Ikke bekreft. Send heller en ny forespørsel på kuverto.no.': 'Onko jotain väärin? Älä vahvista. Lähetä mieluummin uusi tarjouspyyntö osoitteessa kuverto.no.',
    'Bekreft og send': 'Vahvista ja lähetä',
    'Sendte du ikke denne forespørselen, kan du se bort fra e-posten. Da blir ingenting sendt videre.':
      'Jos et lähettänyt tätä tarjouspyyntöä, voit jättää viestin huomiotta. Silloin mitään ei lähetetä eteenpäin.',

    // Datovelger
    'Forrige måned': 'Edellinen kuukausi',
    'Neste måned': 'Seuraava kuukausi',
    'dd.mm.åååå': 'pp.kk.vvvv',
    'Velg dato i kalender. Valgt: {dato}': 'Valitse päivämäärä kalenterista. Valittu: {dato}',
    'Velg dato i kalender': 'Valitse päivämäärä kalenterista',
    'Skriv datoen eller velg i kalenderen.': 'Kirjoita päivämäärä tai valitse se kalenterista.',
    'I dag': 'Tänään',
    Lukk: 'Sulje',

    // Tilstander
    'Bordet er dekket': 'Pöytä on katettu',
    'Du har valgt {leverandor}. De tar kontakt for å avtale detaljene, og de andre får beskjed.':
      'Valitsit toimittajan {leverandor}. He ottavat yhteyttä sopiakseen yksityiskohdista, ja muille ilmoitetaan.',
    'Vi får ikke kontakt': 'Yhteyttä ei saada',
    'Prøv igjen': 'Yritä uudelleen',
    'Sjekk nettforbindelsen. Det du har fylt ut, er lagret på telefonen.': 'Tarkista verkkoyhteys. Täyttämäsi tiedot on tallennettu puhelimeesi.',
    Laster: 'Ladataan',
  },
};
export default ord;
