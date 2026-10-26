# Kuverto – kuverto.no

Markedsplass for catering. Kunden sender én forespørsel. Godkjente leverandører i nærheten låser opp med klipp og svarer med meny og pris per kuvert. Kuverto tar ingen provisjon.

**Status:** fase 1, bare frontend med mock-data (`lib/mock.ts`).

## Kom i gang

```bash
npm install
npm run dev          # http://localhost:3000
npm run build        # produksjonsbygg
npm run lint
```

Sjekk av skjermbilder og tilgjengelighet. Kjør `npm run build && npm start` først:

```bash
npm run skjermbilder                 # 390 og 1440 px til skjermbilder/
npm run skjermbilder -- --dark       # mørk modus
node scripts/tilgjengelighet.mjs     # axe-core, WCAG 2.2 AA, lys og mørk
```

## Sider

| Rute | Artboard |
|---|---|
| `/` | O-Forside-mobil, O-Forside-desktop |
| `/foresporsel` | O-Skjema (sju steg og kvittering) |
| `/logg-inn` | O-Innlogging |
| `/foresporsler/[id]` | O-Tilbud-mobil, O-Tilbud-desktop |
| `/leverandor` | O-Dashbord-mobil, O-Dashbord-desktop, O-Foresporselskort (i dialog) |
| `/tilstander` | O-Tilstander (oversikt, ikke indeksert) |
| `/komponenter` | O-Komponenter (oversikt, ikke indeksert) |

## Struktur

```
app/            sider, layout, error.tsx, not-found.tsx, lokale fonter
components/ui/      Button, Chip, Input, Select, Badge, Alert, Card, PriceRing, Progress, Tabs, Dialog
components/layout/  Logo, SiteHeader, SiteFooter, ThemeToggle, AppHeader, LeverandorShell
components/kuverto/ HeroForm, PhotoTile, ForesporselKort
components/states/  EmptyState, LoadingState, ErrorState, BordetErDekket
lib/            types.ts (datamodell), mock.ts, labels.ts, format.ts, postnummer.ts
design/         designpakken (fasit) – DESIGN.md, tokens, artboards, bilder, logoer
```

## Designvalg og avvik fra artboardene

- **Fonter:** Manrope og Albert Sans ligger lokalt i `app/fonts/` (variable fonter fra Fontsource, SIL OFL) og lastes med `next/font/local`, ikke `next/font/google`. Det fjerner avhengigheten av Google ved bygg og sender ikke besøkende videre til Google.
- **Tailwind 3**, fordi `design/tokens/tailwind.preset.js` er skrevet for versjon 3.
- **Postnummer:** artboarden godtok bare 0000–3999. Appen godtar alle fire siffer (0001–9999). Oppslag mot registeret kommer i fase 2.
- **Mørk modus:** olivenpaneler bruker en egen mørk flate (`--k-panel` i `app/globals.css`), fordi primærfargen blir sitron i mørk modus. Strektegningene inverteres med `.k-ink`.
- **Strektegninger:** artboardene peker til lerretets ID-er. Koblingen til filene ligger i `design/blob-map.json`. Åtte av dem er koblet ved å se på tegningene.
- **Mock-datoer:** forespørselen er satt til torsdag 12. november 2026 (artboardet sier «torsdag 14. november», men den datoen er en lørdag i 2026). Relative tekster som «12 min» og «I morgen» regnes fra en fast mock-klokke (`MOCK_NA` i `lib/mock.ts`), så server og nettleser alltid viser det samme. Byttes mot ekte tid i fase 2.
- **Fokus på felt:** den globale 3 px olivenringen brukes også på felt (artboardet viste en lys ring som ikke har nok kontrast).

## Fase 2

- **Supabase:** tabeller etter `lib/types.ts` (beløp i øre, ISO-datoer). Kontaktinfo i egen tabell som bare kan leses etter opplåsing. RLS etter dekning (kommunenummer). Magisk lenke med rollene `kunde` og `leverandor`.
- **Postnummer:** Postens register, postnummer → kommune → fylke. Erstatter `lib/postnummer.ts`.
- **Resend:** e-post ved ny forespørsel i området, nytt tilbud og valgt tilbud.
- **Stripe:** kjøp av klipp (klippakker og kort per forespørsel).
- **Godkjenning av leverandører** på org.nr. og valg av dekningsområde (fylker og kommuner).
- Koble skjemaet (`app/foresporsel/Skjema.tsx`), innloggingen og «Lås opp» til ekte server actions. Markert med kommentarer i koden.
