import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { Alert } from '@/components/ui/Alert';
import { Badge, DietTag } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PriceRing } from '@/components/ui/PriceRing';
import { Progress } from '@/components/ui/Progress';
import { KomponentDemo } from './demo';

export const metadata: Metadata = { title: 'Komponenter', description: 'Oversikt over knapper, felt, merker og andre komponenter i Kuverto.', robots: { index: false } };

const H = ({ children }: { children: string }) => <h2 className="k-heading m-0 text-2xl">{children}</h2>;

export default function Komponenter() {
  // Demoside med eksempeldata. Skjult i produksjon.
  if (process.env.VERCEL_ENV === 'production') notFound();
  return (
    <main id="innhold" className="mx-auto grid max-w-[1200px] grid-cols-1 content-start gap-x-14 gap-y-12 p-6 md:grid-cols-2 md:p-12">
      <section className="flex flex-col gap-3.5">
        <H>Knapper</H>
        <div className="flex flex-wrap items-center gap-2.5">
          <Button>Send forespørsel</Button>
          <Button variant="secondary">Lagre utkast</Button>
          <Button variant="text">Avbryt</Button>
        </div>
        <div className="flex flex-wrap items-center gap-2.5 bg-panel p-4">
          <Button variant="accent">På oliven: sitron</Button>
          <Button variant="on-panel">Sekundær</Button>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <Button variant="danger" size="sm">Trekk tilbudet</Button>
          <Button size="sm" disabled>Ikke tilgjengelig</Button>
          <Button size="sm" busy>Sender</Button>
        </div>
      </section>

      <section className="flex flex-col gap-3.5">
        <H>Pris på tallerkenen</H>
        <div className="flex flex-wrap items-center gap-8">
          <div className="flex flex-col items-start gap-0.5">
            <PriceRing className="my-3 ml-4 text-[44px]">kr 289</PriceRing>
            <span className="pl-2 text-[15px] font-semibold">per kuvert</span>
          </div>
          <div className="flex flex-col gap-0.5 text-text-muted">
            <PriceRing ringed={false} className="text-[44px]">kr 345</PriceRing>
            <span className="pl-2 text-[15px] font-semibold">per kuvert</span>
          </div>
          <p className="m-0 flex-[1_1_200px] text-[15px] text-text-muted">
            Ringen markerer det kunden bør se først: laveste pris, valgt tilbud eller det som har endret seg. Bare én ring per skjerm.
          </p>
        </div>
      </section>

      <section className="flex flex-col gap-3.5">
        <H>Felt</H>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Input label="Postnummer" defaultValue="0150" hint="Oslo sentrum" inputMode="numeric" />
          <Input label="Gjester" defaultValue="25" hint="Klikk for fokus" inputMode="numeric" />
          <Input label="E-post" defaultValue="kari@firma" feil="Mangler domene, f.eks. @firma.no" />
        </div>
      </section>

      <section className="flex flex-col gap-3.5">
        <H>Fremdrift i sju kuverter</H>
        <div className="flex flex-wrap items-center gap-2">
          <Progress steg={3} navn="Dato og tid" />
          <span className="ml-2 text-[15px] font-semibold">Steg 3 av 7 · Dato og tid</span>
        </div>
      </section>

      <KomponentDemo />

      <section className="flex flex-col gap-3.5">
        <H>Status</H>
        <div className="flex flex-wrap gap-2">
          <Badge tone="ny">Ny</Badge>
          <Badge tone="last">Låst</Badge>
          <Badge tone="opplast">Opplåst</Badge>
          <Badge tone="suksess">Godtatt</Badge>
          <Badge tone="advarsel">Svar innen i morgen</Badge>
          <Badge tone="feil">Avslått</Badge>
        </div>
        <div className="flex flex-wrap gap-2">
          <DietTag ikon="blad">Vegetar · 4</DietTag>
          <DietTag ikon="not" alvorlig>Nøtter · 1, alvorlig</DietTag>
          <DietTag>Glutenfri · 2</DietTag>
        </div>
      </section>

      <section className="flex flex-col gap-3.5">
        <H>Varsler</H>
        <Alert tone="status" handling={<a href="#">Se den</a>}>
          Forespørselen er sendt til 5 leverandører
        </Alert>
        <Alert tone="feil">
          <strong>Endringene ble ikke lagret.</strong> Sjekk nettforbindelsen og prøv igjen. Det du skrev, ligger fortsatt i skjemaet.
        </Alert>
      </section>
    </main>
  );
}
