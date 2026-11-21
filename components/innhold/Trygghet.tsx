import Link from 'next/link';
import { tInnhold, type T } from '@/lib/i18n';
import { MAKS_LEVERANDORER } from '@/lib/klipp';
import type { MarkedInfo } from '@/lib/markets';
import { sprak } from '@/lib/server/marked';

const lagPunkter = (t: T, info: MarkedInfo) => [
  {
    tittel: t('Gratis og uforpliktende'),
    tekst: t('Det koster ingenting å sende en forespørsel. Du bestemmer selv om du vil takke ja til et tilbud.'),
  },
  {
    tittel: t('Godkjente leverandører'),
    tekst: t('Vi sjekker hver leverandør i {register} og godkjenner dem manuelt før de får se forespørsler.', { register: info.orgnr.register }),
  },
  {
    tittel: t('Kontaktinfoen din er skjermet'),
    tekst: t('Leverandørene ser behovet og området. Navn og kontaktinfo ser bare de som låser opp forespørselen for å svare, og full adresse deles først når du velger et tilbud.'),
  },
  {
    tittel: t('Høyst {maks} tilbud', { maks: MAKS_LEVERANDORER }),
    tekst: t('Maks {maks} leverandører kan svare på samme forespørsel, så du får et oversiktlig antall tilbud å sammenligne.', { maks: MAKS_LEVERANDORER }),
  },
];

/** Hvorfor kunden kan stole på Kuverto. Bare påstander som stemmer med hvordan tjenesten virker. */
export async function Trygghet({ headingId = 'trygghet-tittel' }: { headingId?: string }) {
  const { marked, info, sti } = await sprak();
  const t = tInnhold(marked);
  const punkter = lagPunkter(t, info);
  return (
    <div className="flex flex-col gap-6 rounded-media bg-surface-soft px-[22px] py-8 md:gap-10 md:rounded-panel md:px-[clamp(24px,4vw,64px)] md:py-14">
      <div className="flex flex-col gap-3 md:max-w-[640px]">
        <h2 id={headingId} className="k-heading m-0 text-[30px] leading-[1.05] md:text-[clamp(32px,3.2vw,44px)]">
          {t('Trygt og enkelt for deg som bestiller')}
        </h2>
        <p className="m-0 text-base leading-normal text-text-muted md:text-[17px]">
          {t('Kuverto formidler forespørsler og tilbud. Selve avtalen inngår du direkte med leverandøren du velger, og leverandøren har ansvaret for maten og leveransen.')}{' '}
          <Link href={sti('/personvern')}>{t('Les hvordan vi behandler opplysningene dine')}</Link>.
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
