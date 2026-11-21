import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { sprak } from '@/lib/server/marked';
import { innloggetEpost } from '@/lib/server/supabase';
import { Innlogging } from './Innlogging';

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await sprak();
  return {
    title: t('Logg inn'),
    description: t('Logg inn på Kuverto med en lenke på e-post, enten du bestiller mat eller er leverandør.'),
    robots: { index: false },
  };
}
export const dynamic = 'force-dynamic';

export default async function LoggInnSide() {
  // Allerede innlogget: rett til riktig side.
  const { sti } = await sprak();
  if (await innloggetEpost()) redirect(sti('/min-side'));
  return (
    <Suspense>
      <Innlogging />
    </Suspense>
  );
}
