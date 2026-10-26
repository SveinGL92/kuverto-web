'use client';

import { ErrorState } from '@/components/states/ErrorState';

export function TilstandFeil() {
  return <ErrorState onProvIgjen={() => window.location.reload()} />;
}
