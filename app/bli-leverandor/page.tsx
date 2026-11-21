import type { Metadata } from 'next';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { PILOT_GRATIS_KLIPP, refusjonKort } from '@/lib/klipp';
import { hentKommuner } from '@/lib/server/kommuner';
import { sprak } from '@/lib/server/marked';
import { Registrering } from './Registrering';

export async function generateMetadata(): Promise<Metadata> {
  const { t, sti } = await sprak();
  return {
    title: t('Registrer bedriften som leverandør'),
    description: t('Registrer cateringbedriften din på Kuverto og få forespørsler fra kunder i området ditt. Ingen provisjon.'),
    alternates: { canonical: sti('/bli-leverandor') },
  };
}

export const dynamic = 'force-dynamic';

export default async function BliLeverandor() {
  const { marked, info, t } = await sprak();
  const kommuner = await hentKommuner(marked);
  return (
    <>
      <SiteHeader />
      <main id="innhold" className="k-wrap">
        <div className="mx-auto flex max-w-[680px] flex-col gap-3 pt-4 md:pt-10">
          <h1 className="k-heading m-0 text-h1">{t('Registrer bedriften')}</h1>
          <p className="m-0 text-[17px] leading-normal text-text-muted">
            {t('Det tar et par minutter. Vi sjekker bedriften i {register} og godkjenner den manuelt, vanligvis samme dag. Når bedriften er godkjent, får du {klipp} gratis klipp.', { register: info.orgnr.register, klipp: PILOT_GRATIS_KLIPP })}{' '}
            {refusjonKort(t)}
          </p>
          <Registrering kommuner={kommuner} />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
