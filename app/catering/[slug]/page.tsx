import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { KategoriLenker } from '@/components/innhold/KategoriLenker';
import { StegListe, type Steg } from '@/components/innhold/StegListe';
import { Trygghet } from '@/components/innhold/Trygghet';
import { HeroForm } from '@/components/kuverto/HeroForm';
import { anledningerInnhold, finnAnledningInnhold } from '@/lib/anledninger-innhold';

export const dynamicParams = false;

export function generateStaticParams() {
  return anledningerInnhold.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const a = finnAnledningInnhold(slug);
  if (!a) return {};
  return {
    title: a.tittel,
    description: a.beskrivelse,
    alternates: { canonical: `/catering/${a.slug}` },
    openGraph: { title: a.tittel, description: a.beskrivelse, url: `/catering/${a.slug}` },
  };
}

export default async function AnledningSide({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const a = finnAnledningInnhold(slug);
  if (!a) notFound();

  const steg: Steg[] = [
    {
      tittel: 'Beskriv behovet',
      tekst: 'Dato, antall gjester, sted, kosthold og budsjett. Det tar et par minutter.',
      illustrasjon: '/illustrasjoner/bordkort.svg',
    },
    {
      tittel: a.rolig ? 'Få forslag' : 'Motta tilbud',
      tekst: 'Godkjente leverandører i nærheten sender forslag til meny og pris per kuvert.',
      illustrasjon: '/illustrasjoner/tom-tallerken.svg',
    },
    {
      tittel: 'Velg det som passer',
      tekst: 'Sammenlign side om side. Du forplikter deg først når du velger.',
      illustrasjon: '/illustrasjoner/tallerken-hake.svg',
    },
  ];

  const sporsmal = [
    { sporsmal: 'Hva koster det å bruke Kuverto?', svar: 'Det er gratis å sende forespørsel og å få tilbud. Du betaler leverandøren du velger direkte, og Kuverto tar ingen provisjon.' },
    {
      sporsmal: 'Hvor mange tilbud får jeg?',
      svar: 'Høyst fem leverandører kan svare på samme forespørsel. Du får bare tilbud fra leverandører som har oppgitt at de leverer i området ditt.',
    },
    {
      sporsmal: 'Hvem ser forespørselen min?',
      svar: 'Godkjente leverandører i området ser behovet og området. Navn og kontaktinfo ser bare de som låser opp forespørselen for å svare, og gateadressen deles først når du velger et tilbud.',
    },
    { sporsmal: 'Kan jeg stille spørsmål før jeg velger?', svar: 'Ja. Du kan skrive med hver leverandør direkte på Kuverto, og du får e-post når de svarer.' },
    { sporsmal: 'Må jeg takke ja til et tilbud?', svar: 'Nei. Det er helt uforpliktende, og du kan trekke forespørselen når du vil.' },
  ];
  const faq = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: sporsmal.map((q) => ({ '@type': 'Question', name: q.sporsmal, acceptedAnswer: { '@type': 'Answer', text: q.svar } })),
  };

  const brodsmuler = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Kuverto', item: 'https://kuverto.no/' },
      { '@type': 'ListItem', position: 2, name: a.navn, item: `https://kuverto.no/catering/${a.slug}` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(brodsmuler) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faq) }} />
      <SiteHeader />
      <main id="innhold">
        <nav aria-label="Brødsmuler" className="k-wrap pt-2 text-[15px]">
          <ol className="m-0 flex list-none flex-wrap items-center gap-1.5 p-0 text-text-muted">
            <li>
              <Link href="/" className="inline-flex min-h-touch items-center text-text-muted">
                Forside
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link href="/#anledninger" className="inline-flex min-h-touch items-center text-text-muted">
                Kategorier
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="font-semibold text-text">
              {a.navn}
            </li>
          </ol>
        </nav>

        <section aria-labelledby="anledning-tittel" className="k-wrap flex flex-col gap-8 pt-6 md:flex-row md:flex-wrap md:items-center md:gap-x-14 md:pt-10">
          <div className="flex min-w-0 flex-col gap-5 md:max-w-[640px] md:flex-[1.1_1_480px] md:gap-6">
            <h1 id="anledning-tittel" className="k-heading m-0 text-[clamp(36px,10vw,46px)] leading-[1.0] tracking-[-0.045em] md:text-[clamp(44px,4.6vw,64px)]">
              {a.h1}
            </h1>
            <p className="m-0 max-w-[44ch] text-[17px] leading-normal text-text-muted md:text-[19px]">{a.ingress}</p>
            <HeroForm standardAnledning={a.id} standardGjester={a.standardGjester} knapp={a.rolig ? 'Be om forslag' : 'Få tilbud'} />
            <p className="m-0 text-[15px] text-text-muted">Gratis og uforpliktende. Du velger selv om du vil takke ja.</p>
          </div>
          <div className="relative h-[260px] min-w-0 overflow-hidden rounded-media bg-[var(--k-photo-placeholder)] md:h-[clamp(360px,36vw,500px)] md:flex-[1_1_380px] md:rounded-panel">
            {a.bilde ? (
              <Image
                src={a.bilde.src}
                alt={a.bilde.alt}
                fill
                priority
                sizes="(min-width: 768px) 42vw, 92vw"
                className="object-cover"
                style={{ objectPosition: a.bilde.posisjon ?? '50% 50%' }}
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-surface-soft">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={a.illustrasjon ?? '/illustrasjoner/tom-tallerken.svg'} alt="" className="k-ink w-[40%] max-w-[260px]" />
              </div>
            )}
          </div>
        </section>

        <section aria-labelledby="oppgi-tittel" className="k-wrap pt-14 md:pt-20">
          <div className="grid gap-6 rounded-card bg-surface p-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] md:gap-12 md:p-10">
            <div className="flex flex-col gap-2">
              <h2 id="oppgi-tittel" className="k-heading m-0 text-[26px] leading-[1.1] md:text-[32px]">
                Dette er nyttig å ha klart
              </h2>
              <p className="m-0 text-base text-text-muted">Jo mer leverandørene vet, desto mer treffende blir tilbudene. Et omtrentlig svar holder.</p>
            </div>
            <ul className="m-0 flex list-none flex-col gap-3 p-0">
              {a.oppgi.map((o) => (
                <li key={o} className="flex gap-3 text-base leading-normal md:text-[17px]">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--k-success)" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="mt-1 shrink-0">
                    <path d="M5 12l5 5 9-10" />
                  </svg>
                  {o}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {a.ideer && (
          <section aria-labelledby="ideer-tittel" className="k-wrap pt-14 md:pt-20">
            <h2 id="ideer-tittel" className="k-heading mb-2 mt-0 text-[26px] leading-[1.1] md:text-[32px]">
              Ideer til hva du kan be om
            </h2>
            <p className="m-0 mb-5 max-w-[60ch] text-base text-text-muted">Leverandørene foreslår gjerne alternativer. Skriv det du ser for deg under «Andre ønsker» i forespørselen.</p>
            <ul className="m-0 grid list-none gap-3 p-0 sm:grid-cols-2 lg:grid-cols-4">
              {a.ideer.map((i) => (
                <li key={i} className="rounded-card bg-surface p-5 text-base font-semibold leading-snug">
                  {i}
                </li>
              ))}
            </ul>
          </section>
        )}

        <section aria-labelledby="anledning-steg" className="k-wrap pt-14 md:pt-20">
          <h2 id="anledning-steg" className="k-heading mb-6 mt-0 text-[30px] leading-[1.05] md:mb-9 md:text-[clamp(32px,3.2vw,44px)]">
            Slik fungerer det
          </h2>
          <StegListe steg={steg} />
        </section>

        <section aria-labelledby="trygghet-tittel" className="k-wrap pt-14 md:pt-20">
          <Trygghet />
        </section>

        <section aria-labelledby="sporsmal-tittel" className="k-wrap pt-14 md:pt-20">
          <h2 id="sporsmal-tittel" className="k-heading mb-6 mt-0 text-[26px] leading-[1.1] md:mb-8 md:text-[32px]">
            Spørsmål og svar
          </h2>
          <div className="flex max-w-[760px] flex-col gap-2">
            {sporsmal.map((q) => (
              <details key={q.sporsmal} className="group rounded-card bg-surface px-5 py-1 md:px-6">
                <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-3 text-base font-bold md:text-[17px] [&::-webkit-details-marker]:hidden">
                  {q.sporsmal}
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true" className="shrink-0 transition-transform group-open:rotate-45 motion-reduce:transition-none">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                </summary>
                <p className="m-0 pb-4 text-base leading-normal text-text-muted">{q.svar}</p>
              </details>
            ))}
          </div>
        </section>

        <section aria-labelledby="andre-tittel" className="k-wrap flex flex-col gap-6 pt-14 md:pt-20">
          <h2 id="andre-tittel" className="k-heading m-0 text-[26px] leading-[1.1] md:text-[32px]">
            Flere kategorier
          </h2>
          <KategoriLenker tittel="Anledninger" liste={anledningerInnhold.filter((x) => x.slug !== a.slug && x.gruppe !== 'mattype')} />
          <KategoriLenker tittel="Type mat" liste={anledningerInnhold.filter((x) => x.slug !== a.slug && x.gruppe === 'mattype')} />
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
