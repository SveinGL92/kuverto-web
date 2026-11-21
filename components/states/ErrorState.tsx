'use client';

import { useSprak } from '@/components/Sprak';
import { Button } from '@/components/ui/Button';
import { EmptyState } from './EmptyState';

/** Når vi ikke får kontakt med serveren. Brukes også av error.tsx-filene. */
export function ErrorState({ onProvIgjen, tekst }: { onProvIgjen?: () => void; tekst?: string }) {
  const { t } = useSprak();
  return (
    <div role="alert">
      <EmptyState
        illustrasjon="/illustrasjoner/velt-glass.svg"
        tittel={t('Vi får ikke kontakt')}
        handling={onProvIgjen && <Button onClick={onProvIgjen}>{t('Prøv igjen')}</Button>}
      >
        {tekst ?? t('Sjekk nettforbindelsen. Det du har fylt ut, er lagret på telefonen.')}
      </EmptyState>
    </div>
  );
}
