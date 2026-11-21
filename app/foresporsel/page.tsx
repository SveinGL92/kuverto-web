import type { Metadata } from 'next';
import { Suspense } from 'react';
import { sprak } from '@/lib/server/marked';
import { Skjema } from './Skjema';

export async function generateMetadata(): Promise<Metadata> {
  const { t, sti } = await sprak();
  return {
    title: t('Få cateringtilbud'),
    description: t('Beskriv behovet i to korte steg. Godkjente cateringleverandører i nærheten svarer med meny og pris per kuvert. Gratis og uforpliktende.'),
    alternates: { canonical: sti('/foresporsel') },
  };
}

export default function ForesporselSide() {
  return (
    <Suspense>
      <Skjema />
    </Suspense>
  );
}
