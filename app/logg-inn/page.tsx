import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { innloggetEpost } from '@/lib/server/supabase';
import { Innlogging } from './Innlogging';

export const metadata: Metadata = {
  title: 'Logg inn',
  description: 'Logg inn på Kuverto med en lenke på e-post, enten du bestiller mat eller er leverandør.',
  robots: { index: false },
};
export const dynamic = 'force-dynamic';

export default async function LoggInnSide() {
  // Allerede innlogget: rett til riktig side.
  if (await innloggetEpost()) redirect('/min-side');
  return (
    <Suspense>
      <Innlogging />
    </Suspense>
  );
}
