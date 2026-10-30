import type { Metadata } from 'next';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { PILOT_GRATIS_KLIPP, REFUSJON_KORT } from '@/lib/klipp';
import { hentKommuner } from '@/lib/server/kommuner';
import { Registrering } from './Registrering';

export const metadata: Metadata = {
  title: 'Registrer bedriften som leverandør',
  description: 'Registrer cateringbedriften din på Kuverto og få forespørsler fra kunder i området ditt. Ingen provisjon.',
  alternates: { canonical: '/bli-leverandor' },
};

export const dynamic = 'force-dynamic';

export default async function BliLeverandor() {
  const kommuner = await hentKommuner();
  return (
    <>
      <SiteHeader />
      <main id="innhold" className="k-wrap">
        <div className="mx-auto flex max-w-[680px] flex-col gap-3 pt-4 md:pt-10">
          <h1 className="k-heading m-0 text-h1">Registrer bedriften</h1>
          <p className="m-0 text-[17px] leading-normal text-text-muted">
            Det tar et par minutter. Vi sjekker bedriften i Enhetsregisteret og godkjenner den manuelt, vanligvis samme dag. Når bedriften er godkjent, får du {PILOT_GRATIS_KLIPP} gratis klipp. {REFUSJON_KORT}
          </p>
          <Registrering kommuner={kommuner} />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
