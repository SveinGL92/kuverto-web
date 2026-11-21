'use client';

import { ErrorState } from '@/components/states/ErrorState';
import { useSprak } from '@/components/Sprak';

export default function Feil({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const { t } = useSprak();
  return (
    <main id="innhold" className="k-wrap flex min-h-[70dvh] items-center py-16">
      <ErrorState onProvIgjen={reset} tekst={t('Noe gikk galt da siden skulle lastes. Sjekk nettforbindelsen og prøv igjen.')} />
    </main>
  );
}
