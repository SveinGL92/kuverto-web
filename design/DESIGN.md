# Kuverto – endelig profil «Oliven og sitron»

Gjelder skjermene på lerretssiden «Endelig · Oliven og sitron» (`O-*.dc.html`). Erstatter Blåmalt, A2 og A3.

## Logo
Kuvert-symbolet viser en tallerken sett ovenfra mellom to parallelle bestikkstreker. Ordmerket er Manrope ExtraBold med −0,045 em bokstavavstand. Filene ligger i `logo/`:
- farge, sort og hvit
- favicon i 16 og 32 px, der 16 px har en egen, kraftigere tegning
- app-ikon: olivenbakgrunn, havrefargede bestikkstreker og sitronring
- profilbilde: sitronbakgrunn med olivensymbol

## Farger
| Navn | Hex | Bruk |
|---|---|---|
| Oliven | #2E3A12 | Primær: hovedknapper, lenker, valgte brikker, leverandørfelt, dashbordmeny |
| Sitron | #E2E66A | Aksent: prisen som skal ses først, «Ny»-merker, knapp på oliven. Aldri tekst på lys grunn |
| Urt | #ECEBCF | Myke flater: forklarende paneler, kostholdsmerker, «Opplåst» |
| Havre | #F6F4EA | Bakgrunn |
| Kull | #1C2210 | Tekst |
| Stein | #5F6152 | Sekundærtekst (≥ 14 px) |
| Linjer / feltkant | #DEDCCB / #8A8770 | |
| Status | #2C6E49 / #8A5A00 / #B42318 | Suksess, advarsel, feil, på egne lyse flater |

Omtrentlig fordeling på en skjerm: bakgrunn 60 %, hvite kort 20 %, oliven cirka 12 %, sitron cirka 7 %. Alle tekstpar oppfyller WCAG AA, og mørk modus er definert i `tokens/tokens.css`.

## Typografi
Manrope 800 brukes til overskrifter og logo, Albert Sans 400–700 til resten. Skalaen er:
- display 46–86 px
- h1 34–52 px
- h2 28–38 px
- h3 22 px
- brødtekst 17 px
- små tekster 14 px

## Form
| Element | Hjørneradius |
|---|---|
| Knapper og brikker | Pille (999 px) |
| Felt | 14 px |
| Varsler | 18 px |
| Kort | 24 px |
| Foto | 32 px |
| Store paneler | 40 px |

Skygge brukes bare på flytende elementer, som prislappen og minikortet på forsiden. Fokusmarkeringen er en 3 px olivenring med havrefarget kant.

## Illustrasjoner og signatur
Strektegningene er penneskisser i olivenblekk (`illustrasjoner/`). De brukes ved siden av foto og i tomme tilstander, aldri i stedet for matfoto.

Signaturen er at prisen per kuvert ringes inn med en tegnet dobbel tallerkenkant. Det er bare én ring per skjerm, og den tegner seg selv opp én gang.

## Foto
Se `BILDER-PROMPT.md`. Hver bildeflate i artboardene er merket med `data-foto="<nøkkel>"`, og nøklene er de samme som i prompten.

### Bildene som er satt inn
Alle bildene ligger i `bilder/` som WebP, og hver bildeflate i artboardene viser nå riktig bilde. I `artboards/` er bildene lenket som `/_blob/<id>` fra lerretet. I en ekte app bytter du dem ut med `/bilder/<nøkkel>.webp`.

Bildene er KI-genererte illustrasjoner:
- **Tilbud A/B/C og leverandør** er bare eksempelbilder, og alt-tekstene sier det. Kunder skal ikke tro at dette er leverandørenes egen mat.
- **Ytelse:** bruk `fetchpriority="high"` på hero-bildet og `loading="lazy"` på resten.
- **Ikke brukt i skjermene:** `smorbrod` og `sosiale-medier` er ment for markedsføring.
