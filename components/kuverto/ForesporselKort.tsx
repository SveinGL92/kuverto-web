import { Alert } from '@/components/ui/Alert';
import { Badge, DietTag } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { datoKort, stor } from '@/lib/format';
import { anledningIllustrasjon, anledningNavn, budsjettNavn, erAllergen, kostholdNavn, serveringNavn } from '@/lib/labels';
import type { ReactNode } from 'react';
import type { Foresporsel, ForesporselKontakt } from '@/lib/types';
import type { T } from '@/lib/i18n/core';
import { useSprak } from '@/components/Sprak';

/** «12 min siden», «1 t siden», «i går», «3 dager siden» (samme avrunding som tidSiden i ./tid). */
const nyTekst = (iso: string, t: T) => {
  const min = Math.max(1, Math.round((Date.now() - Date.parse(iso)) / 60_000));
  if (min < 60) return t('{n} min siden', { n: min });
  const timer = Math.round(min / 60);
  if (timer < 24) return t('{n} t siden', { n: timer });
  const d = Math.round(timer / 24);
  return d === 1 ? t('i går') : t('{n} dager siden', { n: d });
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
  meldingTekst,
  onKjopKlipp,
  svarfrist,
  tilbudStatus,
  lagTilbudTekst,
  opptatt,
}: {
  foresporsel: Foresporsel;
  kontakt?: ForesporselKontakt;
  klippsaldo: number;
  onLasOpp?: () => void;
  onIkkeAktuell?: () => void;
  onLagTilbud?: () => void;
  onSendMelding?: () => void;
  /** Tekst på meldingsknappen, f.eks. «Meldinger (2 nye)». */
  meldingTekst?: string;
  onKjopKlipp?: () => void;
  /** Tekst i merket for opplåste forespørsler, f.eks. «Svar innen i morgen». */
  svarfrist?: string;
  /** Vises over knappene når et tilbud er sendt. */
  tilbudStatus?: ReactNode;
  lagTilbudTekst?: string;
  opptatt?: boolean;
}) {
  const { t, marked, info } = useSprak();
  const opplast = !!kontakt;
  const tittel = t('{hva} for {gjester}', { hva: anledningNavn(f.anledning, t), gjester: f.gjester });
  const tid = f.levering === 'henting' ? t('hentes kl. {tid}', { tid: f.klokkeslett }) : t('før kl. {tid}', { tid: f.klokkeslett });
  const dato = f.dato ? `${stor(datoKort(f.dato, info.intl))}, ${tid}` : t('Fleksibel dato, {tid}', { tid });
  const nokKlipp = klippsaldo >= f.klippPris;
  const mangler = f.klippPris - klippsaldo;

  return (
    <article aria-label={tittel} className="flex flex-col gap-[22px] rounded-[28px] border border-border bg-surface p-6 md:p-7">
      <div className="flex items-start justify-between gap-4 pr-12">
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap gap-1.5">
            {opplast ? (
              <>
                <Badge tone="opplast">{t('Opplåst')}</Badge>
                {svarfrist && <Badge tone="advarsel">{svarfrist}</Badge>}
              </>
            ) : (
              <Badge tone="ny">{t('Ny')} · {nyTekst(f.opprettet, t)}</Badge>
            )}
          </div>
          <h2 className="k-heading m-0 text-[30px] leading-none md:text-[34px]">{tittel}</h2>
          <span className="text-base text-text-muted">{opplast ? `${dato} · ${t('{budsjett} per kuvert', { budsjett: budsjettNavn(f.budsjett, marked, t) })}` : f.omradeVisning}</span>
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
          {tilbudStatus}
          <div className="flex flex-wrap gap-2.5">
            {onLagTilbud && (
              <Button onClick={onLagTilbud} className="min-h-[54px] flex-grow text-[17px]">
                {lagTilbudTekst ?? t('Lag tilbud')}
              </Button>
            )}
            <Button variant="secondary" onClick={onSendMelding} className="min-h-[54px] px-5">
              {meldingTekst ?? t('Send melding')}
            </Button>
          </div>
        </>
      ) : (
        <>
          <dl className="m-0 grid grid-cols-2 gap-x-6 gap-y-4 border-y border-border py-[18px]">
            <div>
              <dt className="text-small font-semibold text-text-muted">{t('Dato')}</dt>
              <dd className="m-0 mt-0.5 text-[17px] font-semibold">{dato}</dd>
            </div>
            <div>
              <dt className="text-small font-semibold text-text-muted">{t('Budsjett per kuvert')}</dt>
              <dd className="m-0 mt-0.5 text-[17px] font-semibold">{budsjettNavn(f.budsjett, marked, t)}</dd>
            </div>
            {f.servering && (
              <div>
                <dt className="text-small font-semibold text-text-muted">{t('Servering')}</dt>
                <dd className="m-0 mt-0.5 text-[17px] font-semibold">{serveringNavn(f.servering, t)}</dd>
              </div>
            )}
            <div>
              <dt className="text-small font-semibold text-text-muted">{t('Kosthold og allergier')}</dt>
              <dd className="m-0 mt-1 flex flex-wrap gap-1.5">
                {f.kosthold.length === 0 ? (
                  <span className="text-[17px] font-semibold">{t('Ingen oppgitt')}</span>
                ) : (
                  f.kosthold.map((k) => (
                    <DietTag key={k.type} alvorlig={k.alvorlig}>
                      {erAllergen(k.type) ? `${t('Allergi')}: ` : ''}
                      {kostholdNavn(k.type, t)} {k.antall}
                      {k.alvorlig ? `, ${t('alvorlig')}` : ''}
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
            <span className="text-base leading-[1.45]">{t('Navn, firma, kontaktinfo og melding vises når du låser opp. Adressen deles når kunden velger tilbudet ditt.')}</span>
          </div>
          {nokKlipp ? (
            <>
              <div className="flex flex-wrap items-center gap-2.5">
                <Button onClick={onLasOpp} busy={opptatt} disabled={opptatt} className="min-h-[54px] flex-grow text-[17px]">
                  {t('Lås opp for {n} klipp', { n: f.klippPris })}
                </Button>
                <Button variant="secondary" onClick={onIkkeAktuell} className="min-h-[54px] px-5">
                  {t('Ikke aktuell')}
                </Button>
              </div>
              <span className="text-[15px] text-text-muted">
                {t('Du har {saldo} klipp. Etter opplåsing: {etter}. Høyst {maks} leverandører kan låse opp denne forespørselen.', { saldo: klippsaldo, etter: klippsaldo - f.klippPris, maks: f.maksLeverandorer })}
              </span>
            </>
          ) : (
            <div className="flex flex-col gap-3">
              <Alert tone="advarsel">
                {t('Denne forespørselen koster')} <strong>{t('{n} klipp', { n: f.klippPris })}</strong>. {t('Du har')} <strong>{klippsaldo}</strong>. {t('Du trenger {n} klipp til.', { n: mangler })}
              </Alert>
              <div className="flex flex-wrap items-center gap-4">
                <Button onClick={onKjopKlipp}>{t('Kjøp klipp')}</Button>
                <Button variant="text" onClick={onIkkeAktuell}>
                  {t('Ikke nå')}
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </article>
  );
}
