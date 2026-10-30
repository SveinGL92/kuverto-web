import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { MAKS_LEVERANDORER } from '@/lib/klipp';

// UTKAST: må gjennomgås juridisk før lansering. Lagringstider og databehandlere må bekreftes.
export const metadata: Metadata = {
  title: 'Personvern',
  description: 'Slik behandler Kuverto opplysningene dine når du sender en forespørsel om catering eller er leverandør.',
  alternates: { canonical: '/personvern' },
  robots: { index: false },
};

function Del({ tittel, children }: { tittel: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="k-heading m-0 text-[24px] leading-[1.15] md:text-[28px]">{tittel}</h2>
      <div className="flex flex-col gap-3 text-base leading-[1.65] md:text-[17px] [&_li]:mb-1.5 [&_p]:m-0 [&_ul]:m-0 [&_ul]:pl-5">{children}</div>
    </section>
  );
}

export default function Personvern() {
  return (
    <>
      <SiteHeader />
      <main id="innhold" className="k-wrap">
        <div className="mx-auto flex max-w-[720px] flex-col gap-10 pt-6 md:pt-12">
          <div className="flex flex-col gap-3">
            <h1 className="k-heading m-0 text-h1">Personvern</h1>
            <p className="m-0 text-[17px] leading-normal text-text-muted md:text-[19px]">
              Her forklarer vi hvilke opplysninger Kuverto behandler, hvorfor, og hvem som får se dem.
            </p>
          </div>

          <Del tittel="Hvem er ansvarlig?">
            <p>
              Puncheur AS (org.nr. 999 552 536) er behandlingsansvarlig for opplysningene i Kuverto. Spørsmål om personvern sender du til{' '}
              <a href="mailto:hei@kuverto.no">hei@kuverto.no</a>.
            </p>
          </Del>

          <Del tittel="Når du sender en forespørsel">
            <p>Vi lagrer det du fyller ut i skjemaet:</p>
            <ul>
              <li>Om arrangementet: anledning, dato, klokkeslett, antall gjester, postnummer, gateadresse (valgfritt), budsjett, kosthold og allergier.</li>
              <li>Kontaktinformasjon: navn, e-post og eventuelt telefon og bedrift.</li>
              <li>Meldingen din til leverandørene, hvis du skriver en.</li>
            </ul>
            <p>Vi bruker opplysningene til å formidle forespørselen til leverandører, sende deg tilbudene og gi deg beskjed på e-post.</p>
          </Del>

          <Del tittel="Hvem ser hva?">
            <ul>
              <li>Godkjente leverandører som dekker området ditt, ser anledning, dato, antall gjester, område, budsjett, kosthold og allergier. De ser ikke hvem du er.</li>
              <li>Navn, kontaktinformasjon og meldingen din ser bare leverandørene som låser opp forespørselen, høyst {MAKS_LEVERANDORER}.</li>
              <li>Full adresse deles bare med leverandøren du velger.</li>
            </ul>
            <p>Leverandøren du velger, blir selv ansvarlig for opplysningene de bruker til å levere bestillingen.</p>
          </Del>

          <Del tittel="Hvor lenge lagrer vi opplysningene?">
            <p>
              Vi lagrer forespørselen og kontaktinformasjonen så lenge det trengs for å formidle tilbud og følge opp bestillingen, og sletter eller anonymiserer dem senest 12 måneder etter arrangementsdatoen. Du kan be om sletting når som helst.
            </p>
          </Del>

          <Del tittel="Hvem hjelper oss?">
            <p>Vi bruker leverandører som behandler opplysninger på våre vegne, med databehandleravtale:</p>
            <ul>
              <li>Supabase: database og innlogging, lagret i EU (Stockholm).</li>
              <li>Vercel: drift av nettsiden.</li>
              <li>Resend: utsending av e-post, fra EU.</li>
              <li>Stripe: betaling for leverandører. Kunder betaler ikke via Kuverto.</li>
            </ul>
          </Del>

          <Del tittel="Informasjonskapsler">
            <p>
              Vi bruker ingen informasjonskapsler til sporing eller annonser. Nettleseren lagrer et utkast av skjemaet i fanen du har åpen, uten kontaktopplysninger. Utkastet slettes når du lukker fanen. Velger du lyst eller mørkt tema, husker nettleseren valget til du tømmer nettleserdataene.
            </p>
          </Del>

          <Del tittel="Rettighetene dine">
            <p>
              Du kan be om innsyn, retting, sletting eller begrensning, og protestere mot behandlingen. Send en e-post til <a href="mailto:hei@kuverto.no">hei@kuverto.no</a>. Mener du at vi behandler opplysningene feil, kan du klage til{' '}
              <a href="https://www.datatilsynet.no" rel="noopener">
                Datatilsynet
              </a>
              .
            </p>
          </Del>

          <p className="m-0 text-[15px] text-text-muted">
            <Link href="/">Til forsiden</Link>
          </p>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
