import type { Metadata } from 'next';
import { BordetErDekket } from '@/components/states/BordetErDekket';
import { EmptyState } from '@/components/states/EmptyState';
import { LoadingState } from '@/components/states/LoadingState';
import { Alert } from '@/components/ui/Alert';
import { Button, ButtonLink } from '@/components/ui/Button';
import { TilstandFeil } from './TilstandFeil';

export const metadata: Metadata = { title: 'Tilstander', robots: { index: false } };

const celle = 'flex flex-col gap-3 border-border p-0 py-8 md:p-8';

/** Oversikt over tomme tilstander, lasting, feil og bekreftelser (O-Tilstander). */
export default function Tilstander() {
  return (
    <main id="innhold" className="mx-auto max-w-[1200px] p-4 md:p-12">
      <h1 className="sr-only">Tilstander</h1>
      <div className="grid grid-cols-1 border-t-2 border-text md:grid-cols-3">
        <section className={`${celle} border-b md:border-r md:pl-0`}>
          <EmptyState
            illustrasjon="/illustrasjoner/tom-tallerken.svg"
            tittel="Ingen tilbud ennå"
            className="h-full"
            handling={
              <a href="/foresporsel" className="font-semibold">
                Endre forespørselen
              </a>
            }
          >
            Leverandørene har fått forespørselen. Du får en e-post når det første tilbudet kommer.
          </EmptyState>
        </section>
        <section className={`${celle} border-b md:border-r`}>
          <EmptyState illustrasjon="/illustrasjoner/kart.svg" tittel="Stille i området" className="h-full" handling={<Button variant="secondary" size="sm" className="min-h-12 px-5">Utvid området</Button>}>
            Vi varsler deg så snart noen i 0150–0190 sender en forespørsel. Et større område gir flere å velge mellom.
          </EmptyState>
        </section>
        <section className={`${celle} border-b md:pr-0`}>
          <EmptyState illustrasjon="/illustrasjoner/bordkort.svg" tittel="Ingen meldinger" className="h-full">
            Når du har låst opp en forespørsel, kan du skrive direkte til kunden her.
          </EmptyState>
        </section>
        <section className={`${celle} border-b md:border-b-0 md:border-r md:pb-0 md:pl-0`}>
          <TilstandFeil />
        </section>
        <section className={`${celle} border-b md:border-b-0 md:border-r md:pb-0`}>
          <h2 className="k-heading m-0 text-[28px] leading-[1.05]">Du trenger ett klipp til</h2>
          <Alert tone="advarsel">
            Denne forespørselen koster <strong>2 klipp</strong>. Du har <strong>1</strong>.
          </Alert>
          <p className="m-0 text-base text-text-muted">Fyll på klippkortet, så åpnes forespørselen med en gang. Den blir liggende til du kommer tilbake.</p>
          <div className="mt-auto flex flex-wrap items-center gap-6 pt-6">
            <Button>Kjøp klipp</Button>
            <a href="#" className="font-semibold">
              Ikke nå
            </a>
          </div>
        </section>
        <BordetErDekket
          leverandor="[Leverandør]"
          className="md:pb-0"
          handling={
            <ButtonLink href="#" variant="accent">
              Se avtalen
            </ButtonLink>
          }
        />
      </div>
      <section className="mt-12 max-w-[360px]">
        <h2 className="k-heading m-0 mb-4 text-[28px]">Laster</h2>
        <LoadingState tekst="Laster tilbud" />
      </section>
    </main>
  );
}
