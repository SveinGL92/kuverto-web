'use client';

import { ErrorState } from '@/components/states/ErrorState';

export default function Feil({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main id="innhold" className="k-wrap flex min-h-[70dvh] items-center py-16">
      <ErrorState onProvIgjen={reset} tekst="Noe gikk galt da siden skulle lastes. Sjekk nettforbindelsen og prøv igjen." />
    </main>
  );
}
