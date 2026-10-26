# Prompt til Claude Code – bygg Kuverto (fase 1)

Lag et nytt, tomt GitHub-repo, for eksempel `kuverto-web`. Legg innholdet i `kuverto-endelig.zip` i mappen `design/` i repoet. Start en Claude Code-økt på repoet, og lim inn teksten under streken.

---

Du skal bygge første versjon av **Kuverto** (kuverto.no), en norsk markedsplass for catering. Kunden sender én forespørsel med anledning, dato, antall gjester, postnummer, allergier og budsjett. Godkjente cateringleverandører i nærheten låser opp forespørselen med klipp og svarer med meny og pris per kuvert. Kunden sammenligner tilbudene og velger ett. Kuverto tar ingen provisjon. Leverandørene betaler for klipp.

All tekst i grensesnittet skal være på norsk bokmål.

## Designet er ferdig – følg det
Alt ligger i `design/`. Les disse filene før du skriver kode:
- `DESIGN.md` – farger, typografi, hjørneradier, illustrasjoner, signaturen og regler for bilder.
- `tokens/tokens.css`, `tokens/tokens.json`, `tokens/tailwind.preset.js` – design-tokens med lys og mørk modus.
- `artboards/O-*.dc.html` – fasiten for hver skjerm. Det er HTML med inline-stiler. `/_blob/<id>` peker til bilder og strektegninger: bildene finner du i `bilder/<nøkkel>.webp` (nøkkelen står i `data-foto`), og strektegningene i `illustrasjoner/`.
- `logo/` – SVG-logoer og favicon.

Skjermene skal se ut som artboardene. Ikke finn på nye farger, fonter, radier eller skygger. Mangler du en komponent, bygg den av tokens og mønstrene som finnes. Ikke bruk kokkelue, cloche, kryssede bestikk eller oransje/rød «leveringsapp»-stil.

## Teknologi
- Next.js (App Router) med TypeScript og Tailwind. Bruk `tailwind.preset.js` og importer `tokens.css` i `app/globals.css`.
- Fonter med `next/font/google`: Manrope 800 som `--font-manrope` og Albert Sans 400–700 som `--font-albert`.
- Bilder med `next/image`. Hero-bildet får `priority`, resten lastes lat. Alt-tekstene finner du i artboardene.
- Ingen UI-bibliotek. Lag egne små komponenter i `components/ui/`.

## Fase 1 – det du skal levere nå
Bygg bare frontend, med mock-data i `lib/mock.ts`. Backend kommer i fase 2.

1. **Fundament.** Tokens, fonter, layout med header og footer, og UI-komponentene `Button`, `Chip`, `Input`, `Select`, `Badge`, `Alert`, `Card` og `PriceRing`. `PriceRing` er den tegnede ringen rundt prisen, og den brukes én gang per skjerm.
2. **Forside `/`** (O-Forside-desktop og O-Forside-mobil). Mobil først, og responsiv opp til desktop.
3. **Forespørsel `/foresporsel`** (O-Skjema). Et steg-for-steg-skjema som validerer postnummer (fire siffer) og dato. Bruk native date-input.
4. **Innlogging `/logg-inn`** (O-Innlogging). Velg mellom «Jeg bestiller mat» og «Jeg er leverandør», og send innloggingslenke på e-post. Foreløpig skal den bare vise «Sjekk e-posten din».
5. **Tilbud `/foresporsler/[id]`** (O-Tilbud-mobil og O-Tilbud-desktop). Kort som sveipes på mobil og tabell på desktop, sortering og «Velg dette tilbudet».
6. **Leverandørdashbord `/leverandor`** (O-Dashbord-mobil og O-Dashbord-desktop). Nye forespørsler, opplåste forespørsler, klippsaldo og meldinger.
7. **Tilstander** (O-Tilstander og O-Foresporselskort). Tomme tilstander med illustrasjon, lasting, feil og «ingen tilbud ennå».

## Krav
- WCAG 2.2 AA:
  - Kontrastene er allerede sjekket. Behold fargeparene.
  - Synlig fokus: 3 px olivenring.
  - Berøringsflater på minst 44 px.
  - Riktige `label`-er og feilmeldinger koblet til feltene.
  - `prefers-reduced-motion` skal respekteres.
- Mørk modus via `[data-theme="dark"]` og systemvalg. Lag en enkel bryter i footeren.
- Bildene er KI-genererte illustrasjoner. Tilbuds- og leverandørbildene skal merkes som eksempelbilder og må aldri framstå som leverandørenes egne bilder.
- Ingen ansikter i bilder. Ikke bruk stockfoto av kontorfolk.
- Hver side skal ha `metadata` på norsk. Sett `lang="nb"`.

## Slik jobber du
1. Les `design/` og lag en kort plan med filstruktur og komponenter. Vis meg planen før du bygger.
2. Bygg ett steg av gangen, i rekkefølgen over. Etter hvert steg:
   - Kjør `npm run build` og `npm run lint`.
   - Ta skjermbilder med Playwright i 390 px og 1440 px, og sammenlign med artboardet.
   - Rett avvik før du går videre.
3. Gjør små commits med beskrivende meldinger på norsk.
4. Avslutt med en kort rapport: hva som er ferdig, hva som avviker fra designet og hvorfor, og hva fase 2 trenger.

## Fase 2 (ikke nå, men planlegg for det)
- Supabase: database, innlogging med magisk lenke og rollene kunde og leverandør.
- Resend: e-post ved ny forespørsel, nytt tilbud og valgt tilbud.
- Stripe: kjøp av klipp.
- Godkjenning av leverandører, og hvilke områder de dekker etter postnummer.

Skriv datamodellen i `lib/types.ts` allerede i fase 1, slik at mock-dataene har samme form som de ekte dataene får.
