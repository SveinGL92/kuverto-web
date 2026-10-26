import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Skjema } from './Skjema';

export const metadata: Metadata = {
  title: 'Send forespørsel',
  description: 'Beskriv selskapet ditt i sju korte steg. Godkjente cateringleverandører i nærheten svarer med meny og pris per kuvert.',
};

export default function ForesporselSide() {
  return (
    <Suspense>
      <Skjema />
    </Suspense>
  );
}
