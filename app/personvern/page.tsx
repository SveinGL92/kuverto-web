import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { tInnhold } from '@/lib/i18n';
import { MAKS_LEVERANDORER } from '@/lib/klipp';
import type { Marked } from '@/lib/markets';
import { sprak } from '@/lib/server/marked';

// UTKAST: må gjennomgås juridisk før lansering. Lagringstider og databehandlere må bekreftes.
// JURIDISK UTKAST (gjelder også svensk, dansk og finsk versjon i lib/i18n/ord/innhold.ts):
// Oversettelsene er maskinelle utkast og er IKKE kvalitetssikret. Eieren tar alle språkversjonene
// til advokat før publisering. Sjekk særlig tilsynsmyndighet per land, lagringstider, databehandlere
// og om norsk behandlingsansvarlig (Puncheur AS) trenger representant/kontaktpunkt i EU.

/** Tilsynsmyndigheten kunden kan klage til, per land. */
const TILSYN: Record<Marked, { navn: string; url: string }> = {
  no: { navn: 'Datatilsynet', url: 'https://www.datatilsynet.no' },
  se: { navn: 'Integritetsskyddsmyndigheten (IMY)', url: 'https://www.imy.se' },
  dk: { navn: 'Datatilsynet', url: 'https://www.datatilsynet.dk' },
  fi: { navn: 'tietosuojavaltuutetun toimistolle', url: 'https://tietosuoja.fi' },
};

export async function generateMetadata(): Promise<Metadata> {
  const { marked, sti } = await sprak();
  const t = tInnhold(marked);
  return {
    title: t('Personvern'),
    description: t('Slik behandler Kuverto opplysningene dine når du sender en forespørsel om catering eller er leverandør.'),
    alternates: { canonical: sti('/personvern') },
    robots: { index: false },
  };
}

function Del({ tittel, children }: { tittel: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="k-heading m-0 text-[24px] leading-[1.15] md:text-[28px]">{tittel}</h2>
      <div className="flex flex-col gap-3 text-base leading-[1.65] md:text-[17px] [&_li]:mb-1.5 [&_p]:m-0 [&_ul]:m-0 [&_ul]:pl-5">{children}</div>
    </section>
  );
}

export default async function Personvern() {
  const { marked, sti } = await sprak();
  const t = tInnhold(marked);
  const tilsyn = TILSYN[marked];
  return (
    <>
      <SiteHeader />
      <main id="innhold" className="k-wrap">
        <div className="mx-auto flex max-w-[720px] flex-col gap-10 pt-6 md:pt-12">
          <div className="flex flex-col gap-3">
            <h1 className="k-heading m-0 text-h1">{t('Personvern')}</h1>
            <p className="m-0 text-[17px] leading-normal text-text-muted md:text-[19px]">
              {t('Her forklarer vi hvilke opplysninger Kuverto behandler, hvorfor, og hvem som får se dem.')}
            </p>
          </div>

          <Del tittel={t('Hvem er ansvarlig?')}>
            <p>
              {t('Puncheur AS (org.nr. 999 552 536) er behandlingsansvarlig for opplysningene i Kuverto. Spørsmål om personvern sender du til')}{' '}
              <a href="mailto:hei@kuverto.no">hei@kuverto.no</a>.
            </p>
          </Del>

          <Del tittel={t('Når du sender en forespørsel')}>
            <p>{t('Vi lagrer det du fyller ut i skjemaet:')}</p>
            <ul>
              <li>{t('Om behovet: kategori, dato, klokkeslett, antall gjester, postnummer, gateadresse (valgfritt), budsjett, kosthold og allergier.')}</li>
              <li>{t('Kontaktinformasjon: navn, e-post og eventuelt telefon og bedrift.')}</li>
              <li>{t('Meldingen din til leverandørene, hvis du skriver en.')}</li>
            </ul>
            <p>{t('Vi bruker opplysningene til å formidle forespørselen til leverandører, sende deg tilbudene og gi deg beskjed på e-post.')}</p>
          </Del>

          <Del tittel={t('Hvem ser hva?')}>
            <ul>
              <li>{t('Godkjente leverandører som dekker området ditt, ser anledning, dato, antall gjester, område, budsjett, kosthold og allergier. De ser ikke hvem du er.')}</li>
              <li>{t('Navn, kontaktinformasjon og meldingen din ser bare leverandørene som låser opp forespørselen, høyst {maks}.', { maks: MAKS_LEVERANDORER })}</li>
              <li>{t('Full adresse deles bare med leverandøren du velger.')}</li>
            </ul>
            <p>{t('Leverandøren du velger, blir selv ansvarlig for opplysningene de bruker til å levere bestillingen.')}</p>
          </Del>

          <Del tittel={t('Hvor lenge lagrer vi opplysningene?')}>
            <p>
              {t('Vi lagrer forespørselen og kontaktinformasjonen så lenge det trengs for å formidle tilbud og følge opp bestillingen, og sletter eller anonymiserer dem senest 12 måneder etter arrangementsdatoen. Du kan be om sletting når som helst.')}
            </p>
          </Del>

          <Del tittel={t('Hvem hjelper oss?')}>
            <p>{t('Vi bruker leverandører som behandler opplysninger på våre vegne, med databehandleravtale:')}</p>
            <ul>
              <li>{t('Supabase: database og innlogging, lagret i EU (Stockholm).')}</li>
              <li>{t('Vercel: drift av nettsiden.')}</li>
              <li>{t('Resend: utsending av e-post, fra EU.')}</li>
              <li>{t('Stripe: betaling for leverandører. Kunder betaler ikke via Kuverto.')}</li>
            </ul>
          </Del>

          <Del tittel={t('Informasjonskapsler')}>
            <p>
              {t('Vi bruker ingen informasjonskapsler til sporing eller annonser. Nettleseren lagrer et utkast av skjemaet i fanen du har åpen, uten kontaktopplysninger. Utkastet slettes når du lukker fanen. Velger du lyst eller mørkt tema, husker nettleseren valget til du tømmer nettleserdataene. Vi teller besøk med Vercel Web Analytics, som ikke bruker informasjonskapsler og ikke lagrer IP-adresser eller identifiserer deg.')}
            </p>
          </Del>

          <Del tittel={t('Rettighetene dine')}>
            <p>
              {t('Du kan be om innsyn, retting, sletting eller begrensning, og protestere mot behandlingen. Send en e-post til')} <a href="mailto:hei@kuverto.no">hei@kuverto.no</a>.{' '}
              {t('Mener du at vi behandler opplysningene feil, kan du klage til')}{' '}
              <a href={tilsyn.url} rel="noopener">
                {tilsyn.navn}
              </a>
              .
            </p>
          </Del>

          <p className="m-0 text-[15px] text-text-muted">
            <Link href={sti('/')}>{t('Til forsiden')}</Link>
          </p>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
