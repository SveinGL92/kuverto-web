import type { Metadata } from 'next';
import Link from 'next/link';
import { EmptyState } from '@/components/states/EmptyState';

export const metadata: Metadata = { title: 'Fant ikke siden', description: 'Siden finnes ikke, eller lenken er feil.' };

export default function IkkeFunnet() {
  return (
    <main id="innhold" className="k-wrap flex min-h-[70dvh] items-center py-16">
      <EmptyState
        illustrasjon="/illustrasjoner/tom-tallerken.svg"
        tittel="Her var det ikke dekket på"
        overskriftNiva={1}
        handling={
          <Link href="/" className="font-semibold">
            Til forsiden
          </Link>
        }
      >
        Siden finnes ikke, eller lenken er feil.
      </EmptyState>
    </main>
  );
}
