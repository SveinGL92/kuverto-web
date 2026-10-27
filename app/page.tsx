import type { Metadata } from 'next';
import Image from 'next/image';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { HeroForm } from '@/components/kuverto/HeroForm';
import { PhotoTile } from '@/components/kuverto/PhotoTile';
import { ButtonLink } from '@/components/ui/Button';
import { OccasionChip } from '@/components/ui/Chip';
import { PriceRing } from '@/components/ui/PriceRing';
import { anledninger } from '@/lib/labels';

export const metadata: Metadata = {
  title: { absolute: 'Kuverto – catering til hvert kuvert' },
  description:
    'Send én forespørsel om catering. Godkjente leverandører nær deg svarer med meny og pris per kuvert. Gratis og uforpliktende, uten provisjon.',
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
      areaServed: [
        { '@type': 'AdministrativeArea', name: 'Oslo' },
        { '@type': 'AdministrativeArea', name: 'Akershus' },
      ],
      description: 'Send én forespørsel og få tilbud med meny og pris per kuvert fra godkjente cateringleverandører.',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'NOK', description: 'Gratis for kunden' },
    },
  ],
};

/* eslint-disable @next/next/no-img-element -- strektegningene er små SVG-er uten behov for bildeoptimalisering */
function Flyt() {
  const priser = ['kr 289', 'kr 345', 'kr 395'];
  return (
    <div aria-hidden="true" className="flex flex-col items-start gap-0.5 md:flex-[1.6_1_520px] md:flex-row md:flex-wrap md:items-center md:justify-between md:gap-2">
      <img src="/illustrasjoner/bordkort.svg" alt="" className="k-ink w-[130px] md:w-[120px]" />
      <img src="/illustrasjoner/pil.svg" alt="" className="k-ink ml-[50px] w-16 rotate-[70deg] md:ml-0 md:w-[60px] md:rotate-0" />
      <div className="flex items-end gap-1 md:gap-1.5">
        {priser.map((p) => (
          <span key={p} className="k-heading flex flex-col items-center text-base tracking-normal md:text-[17px]">
            <img src="/illustrasjoner/tom-tallerken.svg" alt="" className="k-ink w-[86px] md:w-[72px]" />
            {p}
          </span>
        ))}
      </div>
      <img src="/illustrasjoner/pil.svg" alt="" className="k-ink ml-40 w-16 rotate-[70deg] md:ml-0 md:w-[60px] md:rotate-0" />
      <img src="/illustrasjoner/tallerken-hake.svg" alt="" className="k-ink ml-[140px] w-[130px] md:ml-0 md:w-[120px]" />
    </div>
  );
}

export default function Forside() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(strukturertData) }} />
      <SiteHeader />
      <main id="innhold">
        {/* Hero */}
        <section className="k-wrap flex flex-col gap-7 pt-5 md:flex-row md:flex-wrap md:items-center md:gap-x-14 md:gap-y-12 md:pt-8">
          <div className="flex min-w-0 flex-col gap-4 md:flex-[1.15_1_520px] md:gap-[26px]">
            <h1 className="k-heading m-0 text-[46px] leading-[0.98] tracking-[-0.05em] md:text-[clamp(48px,6vw,86px)]">
              Catering til hvert kuvert.
            </h1>
            <p className="m-0 text-[17px] leading-normal text-text-muted md:max-w-[32ch] md:text-[21px]">
              Send én forespørsel. Godkjente leverandører nær deg svarer med meny og pris per kuvert. Gratis for deg.
            </p>
            <div className="mt-1.5 md:mt-0">
              <HeroForm />
            </div>
            <ul className="m-0 hidden list-none flex-wrap gap-x-[22px] gap-y-2 p-0 text-[15px] font-semibold text-text-muted md:flex">
              <li>Gratis og uforpliktende</li>
              <li>Godkjente leverandører</li>
              <li>Ingen provisjon</li>
            </ul>
          </div>

          <div className="relative h-[380px] min-w-0 md:h-[clamp(420px,44vw,620px)] md:flex-[1_1_440px]">
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
              <span className="text-[13px] font-bold md:text-small">per kuvert</span>
            </div>
            <div className="absolute bottom-0 left-0 hidden items-center gap-3 rounded-[22px] bg-surface px-[18px] py-3.5 shadow-float md:flex">
              <img src="/illustrasjoner/smorbrod.svg" alt="" className="k-ink w-[88px]" />
              <span className="flex flex-col">
                <strong className="text-base">Firmalunsj · 25 kuverter</strong>
                <span className="text-small text-text-muted">Vegetar 4 · nøtter 1</span>
              </span>
            </div>
          </div>
        </section>

        {/* Anledninger */}
        <nav id="anledninger" aria-label="Anledninger" className="k-wrap flex scroll-mt-6 flex-wrap gap-2 pt-9 md:gap-3 md:pt-16">
          {anledninger
            .filter((a) => a.illustrasjon)
            .map((a, i) => (
              <OccasionChip key={a.id} href={`/foresporsel?anledning=${a.id}`} illustrasjon={a.illustrasjon} aktiv={i === 0}>
                {a.navn}
              </OccasionChip>
            ))}
        </nav>

        {/* Slik fungerer det */}
        <section id="slik-fungerer-det" className="k-wrap scroll-mt-6 pt-10 md:pt-[72px]">
          <div className="flex flex-col gap-[18px] rounded-media bg-surface-soft px-[22px] py-7 md:flex-row md:flex-wrap md:items-center md:gap-x-12 md:gap-y-8 md:rounded-panel md:px-[clamp(24px,4vw,64px)] md:py-[clamp(28px,4vw,56px)]">
            <div className="contents md:flex md:min-w-0 md:flex-[1_1_340px] md:flex-col md:gap-[18px]">
              <h2 className="k-heading m-0 text-[32px] leading-[1.02] md:text-[clamp(34px,3.4vw,48px)]">Én forespørsel. Flere bord dekket.</h2>
              <p className="order-last m-0 leading-[1.55] text-text-muted md:order-none md:max-w-[46ch]">
                Du beskriver selskapet én gang: dato, gjester, sted, allergier og budsjett. Leverandører i nærheten svarer med meny og pris per
                kuvert. Du velger ett tilbud, de andre får beskjed.
              </p>
            </div>
            <Flyt />
          </div>
        </section>

        {/* Bilder og leverandør */}
        <section aria-label="Populære anledninger" className="k-wrap grid grid-cols-2 gap-2.5 pt-10 md:flex md:flex-wrap md:gap-4 md:pt-[72px]">
          <PhotoTile
            href="/foresporsel?anledning=julebord"
            src="/bilder/julebord.webp"
            alt="Julemat med granbar og lys"
            navn="Julebord"
            posisjon="50% 60%"
            sizes="(min-width: 768px) 38vw, 92vw"
            stor
            className="col-span-2 h-60 md:h-auto md:min-h-[516px] md:flex-[1.3_1_320px]"
          />
          <div className="contents md:flex md:min-w-0 md:flex-[2_1_560px] md:flex-col md:gap-4">
            <div className="contents md:flex md:flex-wrap md:gap-4">
              <PhotoTile
                href="/foresporsel?anledning=bryllup"
                src="/bilder/bryllup.webp"
                alt="Bryllupsbord i kveldslys"
                navn="Bryllup"
                sizes="(min-width: 768px) 28vw, 46vw"
                className="h-[180px] md:h-[250px] md:flex-[1_1_260px]"
              />
              <PhotoTile
                href="/foresporsel?anledning=konfirmasjon"
                src="/bilder/kaffe-kake.webp"
                alt="Kaffe og bløtkake"
                navn="Konfirmasjon"
                sizes="(min-width: 768px) 28vw, 46vw"
                className="h-[180px] md:hidden"
              />
              <PhotoTile
                href="/foresporsel?anledning=konfirmasjon"
                src="/bilder/kaffe-kake.webp"
                alt="Kaffe og bløtkake"
                navn="Konfirmasjon og minnesamvær"
                sizes="28vw"
                className="hidden md:block md:h-[250px] md:flex-[1_1_260px]"
              />
            </div>
            <div className="col-span-2 mt-[30px] flex flex-col gap-3.5 rounded-media bg-panel px-[22px] py-7 text-panel-on md:mt-0 md:min-h-[250px] md:flex-row md:flex-wrap md:items-center md:justify-between md:gap-5 md:px-9 md:py-8">
              <div className="flex flex-col gap-3.5 md:flex-[1_1_300px] md:gap-2.5">
                <h2 className="k-heading m-0 text-[32px] leading-none md:text-[38px]">Lager du maten?</h2>
                <p className="m-0 leading-normal text-panel-on-muted md:max-w-[40ch] md:text-[17px]">
                  Se forespørsler i ditt område og lås opp dem du vil svare på.{' '}
                  <span className="md:hidden">Ingen provisjon.</span>
                  <span className="hidden md:inline">Du betaler bare for dem du velger, og vi tar ingen provisjon.</span>
                </p>
              </div>
              <ButtonLink href="/logg-inn?rolle=leverandor" variant="accent" className="self-start whitespace-nowrap md:min-h-14 md:self-auto md:px-[26px]">
                Bli leverandør
              </ButtonLink>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
