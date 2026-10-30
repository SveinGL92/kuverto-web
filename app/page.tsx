import type { Metadata } from 'next';
import Image from 'next/image';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { AnledningKort } from '@/components/innhold/AnledningKort';
import { StegListe, type Steg } from '@/components/innhold/StegListe';
import { Sporsmal, type SporsmalSvar } from '@/components/innhold/Sporsmal';
import { Trygghet } from '@/components/innhold/Trygghet';
import { HeroForm } from '@/components/kuverto/HeroForm';
import { ButtonLink } from '@/components/ui/Button';
import { PriceRing } from '@/components/ui/PriceRing';
import { anledningerInnhold } from '@/lib/anledninger-innhold';
import { MAKS_LEVERANDORER } from '@/lib/klipp';

export const metadata: Metadata = {
  title: { absolute: 'Kuverto – få tilbud på catering i hele Norge' },
  description:
    'Send én forespørsel om catering. Godkjente leverandører nær deg svarer med meny og pris per kuvert. Sammenlign og velg selv. Gratis og uforpliktende.',
  alternates: { canonical: '/' },
};

const strukturertData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': 'https://kuverto.no/#org',
      name: 'Kuverto',
      url: 'https://kuverto.no',
      logo: 'https://kuverto.no/logo/kuverto-logo-farge.svg',
      legalName: 'Puncheur AS',
      taxID: '999552536',
    },
    {
      '@type': 'WebSite',
      '@id': 'https://kuverto.no/#nettsted',
      name: 'Kuverto',
      url: 'https://kuverto.no',
      inLanguage: 'nb-NO',
      publisher: { '@id': 'https://kuverto.no/#org' },
    },
    {
      '@type': 'Service',
      name: 'Tilbud på catering',
      serviceType: 'Catering',
      provider: { '@id': 'https://kuverto.no/#org' },
      areaServed: { '@type': 'Country', name: 'Norge' },
      description: 'Send én forespørsel og få tilbud med meny og pris per kuvert fra godkjente cateringleverandører.',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'NOK', description: 'Gratis for kunden' },
    },
  ],
};

const steg: Steg[] = [
  {
    tittel: 'Beskriv behovet',
    tekst: 'Fortell hva du planlegger, hvor mange gjester du venter og hva slags mat du ønsker. Det tar et par minutter.',
    illustrasjon: '/illustrasjoner/bordkort.svg',
  },
  {
    tittel: 'Motta tilbud',
    tekst: 'Godkjente leverandører i nærheten sender deg forslag til meny, pris per kuvert og levering.',
    illustrasjon: '/illustrasjoner/tom-tallerken.svg',
  },
  {
    tittel: 'Sammenlign og velg',
    tekst: 'Se tilbudene side om side og velg det som passer ditt behov best.',
    illustrasjon: '/illustrasjoner/tallerken-hake.svg',
  },
];

const sporsmal: SporsmalSvar[] = [
  {
    sporsmal: 'Hva koster det å bruke Kuverto?',
    svar: 'Det er gratis for deg som bestiller. Leverandørene betaler for å låse opp forespørslene de vil svare på, og Kuverto tar ingen provisjon av bestillingen. Prisen du ser i tilbudet, er prisen du betaler leverandøren.',
  },
  {
    sporsmal: 'Hvor mange tilbud får jeg?',
    svar: `Det varierer med anledning, dato og område. Høyst ${MAKS_LEVERANDORER} leverandører kan svare på samme forespørsel, så du får aldri flere enn ${MAKS_LEVERANDORER} tilbud.`,
  },
  {
    sporsmal: 'Hvem ser forespørselen min?',
    svar: `Bare godkjente leverandører som dekker området ditt. Før de låser opp, ser de anledning, dato, antall gjester, område, budsjett og kosthold. Navn, kontaktinfo og meldingen din ser bare leverandørene som låser opp forespørselen, høyst ${MAKS_LEVERANDORER}. Full adresse deles først når du velger et tilbud.`,
  },
  {
    sporsmal: 'Må jeg takke ja til et tilbud?',
    svar: 'Nei. Forespørselen er uforpliktende. Du kan la være å velge, eller trekke forespørselen når som helst.',
  },
  {
    sporsmal: 'Hvem har ansvaret for maten?',
    svar: 'Avtalen inngås direkte mellom deg og leverandøren du velger, og du betaler leverandøren direkte. Leverandøren har ansvaret for maten og leveransen. Kuverto formidler kontakten.',
  },
  {
    sporsmal: 'Hvilke områder dekker dere?',
    svar: 'Kuverto er åpent i hele Norge. Du får bare tilbud fra leverandører som har oppgitt at de leverer i området ditt, og vi rekrutterer stadig flere.',
  },
];

export default function Forside() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(strukturertData) }} />
      <SiteHeader />
      <main id="innhold">
        {/* Hero */}
        <section aria-labelledby="hero-tittel" className="k-wrap flex flex-col gap-8 pt-4 md:flex-row md:flex-wrap md:items-center md:gap-x-14 md:gap-y-12 md:pt-8">
          <div className="flex min-w-0 flex-col gap-5 md:max-w-[660px] md:flex-[1.15_1_520px] md:gap-7">
            <h1 id="hero-tittel" className="k-heading m-0 text-[clamp(36px,11vw,46px)] leading-[1.0] tracking-[-0.045em] md:text-[clamp(44px,4.8vw,68px)]">
              Én forespørsel. Flere tilbud. Du velger.
            </h1>
            <p className="m-0 max-w-[36ch] text-[17px] leading-normal text-text-muted md:text-[20px]">
              Beskriv behovet, få tilbud fra godkjente leverandører nær deg, og sammenlign meny og pris per kuvert på ett sted.
            </p>
            <div className="mt-1 md:mt-0">
              <HeroForm />
            </div>
            <p className="m-0 text-[15px] text-text-muted">
              Gratis å sende forespørsel. Du velger selv om du vil takke ja til et tilbud.
            </p>
          </div>

          <div className="relative h-[340px] min-w-0 md:h-[clamp(420px,44vw,600px)] md:flex-[1_1_400px]">
            <div className="absolute bottom-0 left-[34px] right-0 top-7 rounded-media bg-surface-soft md:left-auto md:top-10 md:w-[78%] md:rounded-panel" />
            <div className="absolute bottom-10 left-0 right-[30px] top-0 overflow-hidden rounded-media bg-[var(--k-photo-placeholder)] md:bottom-[60px] md:right-auto md:w-[86%] md:rounded-panel">
              <Image
                src="/bilder/hero-langbord.webp"
                alt="Langbord ovenfra i dagslys med smørbrød og salat"
                fill
                priority
                sizes="(min-width: 768px) 45vw, 92vw"
                className="object-cover"
              />
            </div>
            <div className="k-on-accent absolute bottom-0 right-0 flex flex-col rounded-[24px] bg-accent px-[18px] py-3.5 text-accent-on shadow-float md:bottom-auto md:top-[70px] md:rounded-[28px] md:px-[22px] md:py-[18px]">
              <span className="text-[13px] font-semibold md:text-small">Eksempel på tilbud</span>
              <PriceRing className="mb-2.5 ml-3 mt-2.5 text-[32px] tracking-[-0.04em] md:mb-3.5 md:ml-3.5 md:mt-3 md:text-[40px]">kr 289</PriceRing>
              <span className="text-[13px] font-bold md:text-small">per kuvert inkl. mva</span>
              <span className="mt-0.5 hidden text-[13px] md:block">Smørbrød, salat og frukt · levering inkludert</span>
            </div>
            <div className="absolute bottom-0 left-0 hidden items-center gap-3 rounded-[22px] bg-surface px-[18px] py-3.5 shadow-float md:flex">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/illustrasjoner/smorbrod.svg" alt="" className="k-ink w-[88px]" />
              <span className="flex flex-col">
                <strong className="text-base">Firmalunsj · 25 kuverter</strong>
                <span className="text-small text-text-muted">Vegetar 4 · nøtter 1</span>
              </span>
            </div>
          </div>
        </section>

        {/* Slik fungerer det */}
        <section id="slik-fungerer-det" aria-labelledby="steg-tittel" className="k-wrap scroll-mt-6 pt-14 md:pt-24">
          <div className="mb-6 flex flex-col gap-2 md:mb-9">
            <h2 id="steg-tittel" className="k-heading m-0 text-[30px] leading-[1.05] md:text-[clamp(32px,3.2vw,44px)]">
              Slik fungerer Kuverto
            </h2>
            <p className="m-0 max-w-[52ch] text-base text-text-muted md:text-[17px]">Du beskriver behovet én gang. Leverandørene gjør resten av jobben.</p>
          </div>
          <StegListe steg={steg} />
          <div className="mt-6 md:mt-8">
            <ButtonLink href="/foresporsel" size="lg">
              Få cateringtilbud
            </ButtonLink>
          </div>
        </section>

        {/* Anledninger */}
        <section id="anledninger" aria-labelledby="anledninger-tittel" className="k-wrap scroll-mt-6 pt-14 md:pt-24">
          <div className="mb-6 flex flex-col gap-2 md:mb-9">
            <h2 id="anledninger-tittel" className="k-heading m-0 text-[30px] leading-[1.05] md:text-[clamp(32px,3.2vw,44px)]">
              Mat til alle anledninger
            </h2>
            <p className="m-0 max-w-[52ch] text-base text-text-muted md:text-[17px]">Velg kategorien som passer ditt behov best, og motta tilbud fra anerkjente restauranter, cateringvirksomheter og bakerier.</p>
          </div>
          <AnledningKort liste={anledningerInnhold} medAnnet />
        </section>

        {/* Tillit */}
        <section aria-labelledby="trygghet-tittel" className="k-wrap pt-14 md:pt-24">
          <Trygghet />
        </section>

        {/* Leverandør */}
        <section aria-labelledby="leverandor-tittel" className="k-wrap pt-10 md:pt-16">
          <div className="flex flex-col gap-4 rounded-media bg-panel px-[22px] py-8 text-panel-on md:flex-row md:flex-wrap md:items-center md:justify-between md:gap-6 md:rounded-panel md:px-[clamp(24px,4vw,64px)] md:py-12">
            <div className="flex flex-col gap-3 md:flex-[1_1_420px]">
              <h2 id="leverandor-tittel" className="k-heading m-0 text-[30px] leading-none md:text-[40px]">
                Lager du maten?
              </h2>
              <p className="m-0 max-w-[48ch] leading-normal text-panel-on-muted md:text-[17px]">
                Se forespørsler i ditt område og svar på dem du vil ha. Du betaler bare for forespørslene du låser opp, og vi tar ingen provisjon.
              </p>
            </div>
            <ButtonLink href="/for-leverandorer" variant="accent" size="lg" className="self-start whitespace-nowrap md:self-auto">
              Les mer for leverandører
            </ButtonLink>
          </div>
        </section>

        {/* Spørsmål */}
        <section aria-labelledby="sporsmal-tittel" className="k-wrap grid gap-6 pt-14 md:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)] md:gap-14 md:pt-24">
          <h2 id="sporsmal-tittel" className="k-heading m-0 text-[30px] leading-[1.05] md:text-[clamp(32px,3.2vw,44px)]">
            Spørsmål og svar
          </h2>
          <Sporsmal liste={sporsmal} />
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
