import type { Metadata } from 'next';
import Link from 'next/link';
import { EmptyState } from '@/components/states/EmptyState';
import { tInnhold } from '@/lib/i18n';
import { sprak } from '@/lib/server/marked';

export async function generateMetadata(): Promise<Metadata> {
  const { marked } = await sprak();
  const t = tInnhold(marked);
  return { title: t('Fant ikke siden'), description: t('Siden finnes ikke, eller lenken er feil.') };
}

export default async function IkkeFunnet() {
  const { marked, sti } = await sprak();
  const t = tInnhold(marked);
  return (
    <main id="innhold" className="k-wrap flex min-h-[70dvh] items-center py-16">
      <EmptyState
        illustrasjon="/illustrasjoner/tom-tallerken.svg"
        tittel={t('Her var det ikke dekket på')}
        overskriftNiva={1}
        handling={
          <Link href={sti('/')} className="font-semibold">
            {t('Til forsiden')}
          </Link>
        }
      >
        {t('Siden finnes ikke, eller lenken er feil.')}
      </EmptyState>
    </main>
  );
}
