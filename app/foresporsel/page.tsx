import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Skjema } from './Skjema';

export const metadata: Metadata = {
  title: 'Få cateringtilbud',
  description: 'Beskriv behovet i to korte steg. Godkjente cateringleverandører i nærheten svarer med meny og pris per kuvert. Gratis og uforpliktende.',
  alternates: { canonical: '/foresporsel' },
};

export default function ForesporselSide() {
  return (
    <Suspense>
      <Skjema />
    </Suspense>
  );
}
