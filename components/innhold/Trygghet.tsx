import Link from 'next/link';
import { MAKS_LEVERANDORER } from '@/lib/klipp';

const punkter = [
  {
    tittel: 'Gratis og uforpliktende',
    tekst: 'Det koster ingenting å sende en forespørsel. Du bestemmer selv om du vil takke ja til et tilbud.',
  },
  {
    tittel: 'Godkjente leverandører',
    tekst: 'Vi sjekker hver leverandør i Enhetsregisteret og godkjenner dem manuelt før de får se forespørsler.',
  },
  {
    tittel: 'Kontaktinfoen din er skjermet',
    tekst: 'Leverandørene ser behovet og området. Navn og e-post ser bare de som låser opp forespørselen for å svare, og full adresse deles først når du velger et tilbud.',
  },
  {
    tittel: `Høyst ${MAKS_LEVERANDORER} tilbud`,
    tekst: `Maks ${MAKS_LEVERANDORER} leverandører kan svare på samme forespørsel. Du får nok å velge mellom, uten å bli nedringt.`,
  },
];

/** Hvorfor kunden kan stole på Kuverto. Bare påstander som stemmer med hvordan tjenesten virker. */
export function Trygghet({ headingId = 'trygghet-tittel' }: { headingId?: string }) {
  return (
    <div className="flex flex-col gap-6 rounded-media bg-surface-soft px-[22px] py-8 md:gap-10 md:rounded-panel md:px-[clamp(24px,4vw,64px)] md:py-14">
      <div className="flex flex-col gap-3 md:max-w-[640px]">
        <h2 id={headingId} className="k-heading m-0 text-[30px] leading-[1.05] md:text-[clamp(32px,3.2vw,44px)]">
          Trygt og enkelt for deg som bestiller
        </h2>
        <p className="m-0 text-base leading-normal text-text-muted md:text-[17px]">
          Kuverto formidler forespørsler og tilbud. Selve avtalen inngår du direkte med leverandøren du velger, og leverandøren har ansvaret for maten og leveransen.{' '}
          <Link href="/personvern">Les hvordan vi behandler opplysningene dine</Link>.
        </p>
      </div>
      <ul className="m-0 grid list-none gap-x-10 gap-y-6 p-0 md:grid-cols-2">
        {punkter.map((p) => (
          <li key={p.tittel} className="flex gap-3.5">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--k-success)" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="mt-0.5 shrink-0">
              <path d="M5 12l5 5 9-10" />
            </svg>
            <div className="flex flex-col gap-1">
              <h3 className="m-0 text-[17px] font-bold leading-snug">{p.tittel}</h3>
              <p className="m-0 text-base leading-normal text-text-muted">{p.tekst}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
