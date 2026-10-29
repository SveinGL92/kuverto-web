import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { AnledningKort } from '@/components/innhold/AnledningKort';
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
                Anledninger
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
            <Image
              src={a.bilde.src}
              alt={a.bilde.alt}
              fill
              priority
              sizes="(min-width: 768px) 42vw, 92vw"
              className="object-cover"
              style={{ objectPosition: a.bilde.posisjon ?? '50% 50%' }}
            />
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

        <section aria-labelledby="anledning-steg" className="k-wrap pt-14 md:pt-20">
          <h2 id="anledning-steg" className="k-heading mb-6 mt-0 text-[30px] leading-[1.05] md:mb-9 md:text-[clamp(32px,3.2vw,44px)]">
            Slik fungerer det
          </h2>
          <StegListe steg={steg} />
        </section>

        <section aria-labelledby="trygghet-tittel" className="k-wrap pt-14 md:pt-20">
          <Trygghet />
        </section>

        <section aria-labelledby="andre-tittel" className="k-wrap pt-14 md:pt-20">
          <h2 id="andre-tittel" className="k-heading mb-6 mt-0 text-[26px] leading-[1.1] md:mb-8 md:text-[32px]">
            Andre anledninger
          </h2>
          <AnledningKort liste={anledningerInnhold.filter((x) => x.slug !== a.slug)} className="md:!grid-cols-3" />
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
