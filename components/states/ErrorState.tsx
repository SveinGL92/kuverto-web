'use client';

import { Button } from '@/components/ui/Button';
import { EmptyState } from './EmptyState';

/** Når vi ikke får kontakt med serveren. Brukes også av error.tsx-filene. */
export function ErrorState({ onProvIgjen, tekst }: { onProvIgjen?: () => void; tekst?: string }) {
  return (
    <div role="alert">
      <EmptyState
        illustrasjon="/illustrasjoner/velt-glass.svg"
        tittel="Vi får ikke kontakt"
        handling={onProvIgjen && <Button onClick={onProvIgjen}>Prøv igjen</Button>}
      >
        {tekst ?? 'Sjekk nettforbindelsen. Det du har fylt ut, er lagret på telefonen.'}
      </EmptyState>
    </div>
  );
}
