import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { finnForesporsel, foresporsler, tilbudFor } from '@/lib/mock';
import { anledningNavn } from '@/lib/labels';
import { TilbudSide } from './TilbudSide';

export function generateStaticParams() {
  return foresporsler.map((f) => ({ id: f.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const f = finnForesporsel(id);
  if (!f) return { title: 'Fant ikke forespørselen' };
  return {
    title: `Tilbud på ${anledningNavn(f.anledning).toLowerCase()}`,
    description: `Sammenlign tilbudene på ${anledningNavn(f.anledning).toLowerCase()} for ${f.gjester} kuverter.`,
    robots: { index: false },
  };
}

export default async function Side({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const f = finnForesporsel(id);
  if (!f) notFound();
  return <TilbudSide foresporsel={f} tilbud={tilbudFor(id)} />;
}
