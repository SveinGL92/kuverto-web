import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Innlogging } from './Innlogging';

export const metadata: Metadata = {
  title: 'Logg inn',
  description: 'Logg inn på Kuverto med en lenke på e-post, enten du bestiller mat eller er leverandør.',
};

export default function LoggInnSide() {
  return (
    <Suspense>
      <Innlogging />
    </Suspense>
  );
}
