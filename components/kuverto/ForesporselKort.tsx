import { Alert } from '@/components/ui/Alert';
import { Badge, DietTag } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { datoKort, stor } from '@/lib/format';
import { anledningIllustrasjon, anledningNavn, budsjettNavn, kostholdNavn, serveringNavn } from '@/lib/labels';
import type { Foresporsel, ForesporselKontakt } from '@/lib/types';
import { tidSiden } from './tid';

const nyTekst = (iso: string) => {
  const t = tidSiden(iso);
  return t === 'i går' ? t : `${t} siden`;
};

/**
 * Forespørselen slik leverandøren ser den. Før opplåsing er kunden anonym.
 * Etter opplåsing vises navn, kontaktinfo og melding.
 */
export function ForesporselKort({
  foresporsel: f,
  kontakt,
  klippsaldo,
  onLasOpp,
  onIkkeAktuell,
  onLagTilbud,
  onSendMelding,
}: {
  foresporsel: Foresporsel;
  kontakt?: ForesporselKontakt;
  klippsaldo: number;
  onLasOpp?: () => void;
  onIkkeAktuell?: () => void;
  onLagTilbud?: () => void;
  onSendMelding?: () => void;
}) {
  const opplast = !!kontakt;
  const tittel = `${anledningNavn(f.anledning)} for ${f.gjester}`;
  const dato = `${stor(datoKort(f.dato))}, kl. ${f.klokkeslett}`;
  const nokKlipp = klippsaldo >= f.klippPris;
  const mangler = f.klippPris - klippsaldo;

  return (
    <article aria-label={tittel} className="flex flex-col gap-[22px] rounded-[28px] border border-border bg-surface p-6 md:p-7">
      <div className="flex items-start justify-between gap-4 pr-12">
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap gap-1.5">
            {opplast ? (
              <>
                <Badge tone="opplast">Opplåst</Badge>
                <Badge tone="advarsel">Svar innen i morgen</Badge>
              </>
            ) : (
              <Badge tone="ny">Ny · {nyTekst(f.opprettet)}</Badge>
            )}
          </div>
          <h2 className="k-heading m-0 text-[30px] leading-none md:text-[34px]">{tittel}</h2>
          <span className="text-base text-text-muted">{opplast ? `${dato} · ${budsjettNavn(f.budsjett)} per kuvert` : f.omradeVisning}</span>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={anledningIllustrasjon(f.anledning)} alt="" className="k-ink hidden w-[120px] shrink-0 sm:block" />
      </div>

      {opplast ? (
        <>
          <div className="flex flex-col gap-1 rounded-[20px] bg-panel px-5 py-[18px] text-base leading-normal text-panel-on">
            <strong className="k-heading text-[22px] tracking-[-0.02em]">
              {kontakt.navn}
              {kontakt.firma ? `, ${kontakt.firma}` : ''}
            </strong>
            <span>
              <a href={`mailto:${kontakt.epost}`} className="text-panel-on">
                {kontakt.epost}
              </a>
              {kontakt.telefon && (
                <>
                  {' · '}
                  <a href={`tel:${kontakt.telefon.replace(/\s/g, '')}`} className="text-panel-on">
                    {kontakt.telefon}
                  </a>
                </>
              )}
            </span>
            {kontakt.adresse && <span>{kontakt.adresse}</span>}
          </div>
          {kontakt.melding && (
            <blockquote className="m-0 text-[17px] leading-[1.55]">
              «{kontakt.melding}»
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/illustrasjoner/understrek.svg" alt="" className="k-ink mt-1 block w-[220px]" />
            </blockquote>
          )}
          <div className="flex flex-wrap gap-2.5">
            <Button onClick={onLagTilbud} className="min-h-[54px] flex-grow text-[17px]">
              Lag tilbud
            </Button>
            <Button variant="secondary" onClick={onSendMelding} className="min-h-[54px] px-5">
              Send melding
            </Button>
          </div>
        </>
      ) : (
        <>
          <dl className="m-0 grid grid-cols-2 gap-x-6 gap-y-4 border-y border-border py-[18px]">
            <div>
              <dt className="text-small font-semibold text-text-muted">Dato</dt>
              <dd className="m-0 mt-0.5 text-[17px] font-semibold">{dato}</dd>
            </div>
            <div>
              <dt className="text-small font-semibold text-text-muted">Budsjett per kuvert</dt>
              <dd className="m-0 mt-0.5 text-[17px] font-semibold">{budsjettNavn(f.budsjett)}</dd>
            </div>
            <div>
              <dt className="text-small font-semibold text-text-muted">Servering</dt>
              <dd className="m-0 mt-0.5 text-[17px] font-semibold">{serveringNavn(f.servering)}</dd>
            </div>
            <div>
              <dt className="text-small font-semibold text-text-muted">Kosthold</dt>
              <dd className="m-0 mt-1 flex flex-wrap gap-1.5">
                {f.kosthold.length === 0 ? (
                  <span className="text-[17px] font-semibold">Ingen oppgitt</span>
                ) : (
                  f.kosthold.map((k) => (
                    <DietTag key={k.type} alvorlig={k.alvorlig}>
                      {kostholdNavn(k.type)} {k.antall}
                      {k.alvorlig ? ', alvorlig' : ''}
                    </DietTag>
                  ))
                )}
              </dd>
            </div>
          </dl>
          <div className="flex items-center gap-3.5">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--k-primary)" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="shrink-0">
              <rect x="5" y="11" width="14" height="10" rx="2" />
              <path d="M8 11V8a4 4 0 0 1 8 0v3" />
            </svg>
            <span className="text-base leading-[1.45]">Navn, firma, kontaktinfo og melding vises når du låser opp. Adressen deles når kunden velger tilbudet ditt.</span>
          </div>
          {nokKlipp ? (
            <>
              <div className="flex flex-wrap items-center gap-2.5">
                <Button onClick={onLasOpp} className="min-h-[54px] flex-grow text-[17px]">
                  Lås opp for {f.klippPris} klipp
                </Button>
                <Button variant="secondary" onClick={onIkkeAktuell} className="min-h-[54px] px-5">
                  Ikke aktuell
                </Button>
              </div>
              <span className="text-[15px] text-text-muted">
                Du har {klippsaldo} klipp. Etter opplåsing: {klippsaldo - f.klippPris}. Høyst {f.maksLeverandorer} leverandører kan låse opp denne forespørselen.
              </span>
            </>
          ) : (
            <div className="flex flex-col gap-3">
              <Alert tone="advarsel">
                Denne forespørselen koster <strong>{f.klippPris} klipp</strong>. Du har <strong>{klippsaldo}</strong>. Du trenger {mangler} klipp til.
              </Alert>
              <div className="flex flex-wrap items-center gap-4">
                <Button>Kjøp klipp</Button>
                <Button variant="text" onClick={onIkkeAktuell}>
                  Ikke nå
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </article>
  );
}
