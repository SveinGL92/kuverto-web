import type { Metadata } from 'next';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { ButtonLink } from '@/components/ui/Button';
import { MAKS_LEVERANDORER } from '@/lib/klipp';
import { db } from '@/lib/server/supabase';
import { varsleOmForesporsel } from '@/lib/server/varsle';

export const metadata: Metadata = { title: 'Bekreft forespørselen', robots: { index: false } };
export const dynamic = 'force-dynamic';

export default async function Bekreft({ searchParams }: { searchParams: Promise<{ t?: string }> }) {
  const { t } = await searchParams;
  let resultat: 'ok' | 'allerede' | 'ugyldig' = 'ugyldig';
  let epost = '';
  if (t && /^[A-Za-z0-9_-]{20,64}$/.test(t)) {
    const s = db();
    // Bytt status bare én gang, selv om lenken åpnes flere ganger.
    const { data } = await s.from('foresporsler').update({ status: 'aktiv', bekreft_token: null }).eq('bekreft_token', t).eq('status', 'venter_bekreftelse').select('id, kunde_epost');
    if (data?.length) {
      resultat = 'ok';
      epost = data[0].kunde_epost;
      await varsleOmForesporsel(data[0].id);
    } else resultat = 'allerede';
  }
  return (
    <>
      <SiteHeader />
      <main id="innhold" className="k-wrap">
        <div className="mx-auto flex max-w-[600px] flex-col gap-4 py-10 md:py-16">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/illustrasjoner/tallerken-hake.svg" alt="" className="k-ink w-[120px]" />
          {resultat === 'ok' ? (
            <>
              <h1 className="k-heading m-0 text-h1">Forespørselen er sendt</h1>
              <p className="m-0 text-[17px] leading-normal text-text-muted">
                Takk! Godkjente leverandører i området har fått beskjed. Du får en e-post hver gang et tilbud kommer inn, og høyst {MAKS_LEVERANDORER} leverandører kan svare.
              </p>
              <ButtonLink href={`/logg-inn?epost=${encodeURIComponent(epost)}`} className="self-start">
                Logg inn og følg forespørselen
              </ButtonLink>
            </>
          ) : (
            <>
              <h1 className="k-heading m-0 text-h1">{resultat === 'allerede' ? 'Lenken er allerede brukt' : 'Ugyldig lenke'}</h1>
              <p className="m-0 text-[17px] leading-normal text-text-muted">
                {resultat === 'allerede'
                  ? 'Forespørselen er trolig allerede bekreftet og sendt til leverandørene. Logg inn for å se den.'
                  : 'Vi kjenner ikke igjen lenken. Kopier hele lenken fra e-posten, eller send en ny forespørsel.'}
              </p>
              <ButtonLink href="/logg-inn" variant="secondary" className="self-start">
                Logg inn
              </ButtonLink>
            </>
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
