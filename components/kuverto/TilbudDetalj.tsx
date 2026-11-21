'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Samtale } from '@/components/kuverto/Samtale';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useSprak } from '@/components/Sprak';
import { dagMndLang } from '@/lib/format';
import { filstorrelse, kanVises } from '@/lib/vedlegg';
import type { Foresporsel, Tilbud } from '@/lib/types';

/**
 * Hele tilbudet i en dialog: detaljer, betingelser, spørsmål til leverandøren, velg eller avslå.
 * Fase 1: spørsmål og avslag lagres bare lokalt. Fase 2: server actions mot meldinger og tilbud.
 */
export function TilbudDetalj({
  tilbud: t,
  foresporsel: f,
  valgtId,
  startMedBekreftelse = false,
  utlopt = false,
  avslatt,
  onVelg,
  onAvsla,
  onAngreAvslag,
  levering = true,
  startAdresse = '',
  aktiv = true,
}: {
  tilbud: Tilbud;
  foresporsel: Foresporsel;
  valgtId?: string;
  /** Åpnet fra «Velg»-knappen: vis bekreftelsen med en gang. */
  startMedBekreftelse?: boolean;
  utlopt?: boolean;
  avslatt: boolean;
  /** Returnerer en feilmelding hvis valget ikke gikk gjennom. */
  onVelg: (adresse: string) => Promise<string | undefined>;
  onAvsla: () => void;
  onAngreAvslag: () => void;
  /** Om maten skal leveres. Da må kunden oppgi adresse ved valg. */
  levering?: boolean;
  /** Adressen kunden oppga i forespørselen, forhåndsutfylt. */
  startAdresse?: string;
  aktiv?: boolean;
}) {
  // tr: oversetter (t er tilbudet).
  const { info, t: tr, penger } = useSprak();
  const [bekreftAvslag, setBekreftAvslag] = useState(false);
  const [bekreftValg, setBekreftValg] = useState(startMedBekreftelse);
  const [adresse, setAdresse] = useState(startAdresse);
  const [adresseFeil, setAdresseFeil] = useState<string>();
  const [velgFeil, setVelgFeil] = useState<string>();
  const [opptatt, setOpptatt] = useState(false);
  const velg = async () => {
    if (levering && adresse.trim().length < 5) {
      setAdresseFeil(tr('Skriv adressen maten skal leveres til.'));
      document.getElementById(`adresse-${t.id}`)?.focus();
      return;
    }
    setOpptatt(true);
    const feil = await onVelg(adresse.trim());
    setOpptatt(false);
    if (feil) setVelgFeil(feil);
  };
  const erValgt = valgtId === t.id;
  const leveringTekst = t.levering.inkludert ? tr('Inkludert') : t.levering.pris ? tr('{pris} i tillegg', { pris: penger(t.levering.pris) }) : tr('Ikke inkludert');
  const bildeAlt = t.bilde.alt.startsWith('Bilde fra ') ? tr('Bilde fra {navn}', { navn: t.bilde.alt.slice(10) }) : tr(t.bilde.alt);

  return (
    <div className="flex flex-col bg-bg">
      <div className="relative h-[180px] bg-[var(--k-photo-placeholder)] md:h-[220px]">
        <Image src={t.bilde.src} alt={bildeAlt} unoptimized={t.bilde.src.startsWith('http')} fill sizes="560px" className="object-cover" />
      </div>
      <div className="flex flex-col gap-6 p-5 md:p-7">
        <div className="flex flex-col gap-1.5">
          <h2 className="k-heading m-0 text-[28px] leading-[1.05]">{t.leverandorNavn}</h2>
          {t.leverandorBeskrivelse && <p className="m-0 text-base leading-normal text-text-muted">{t.leverandorBeskrivelse}</p>}
        </div>

        <div className="flex flex-wrap items-end gap-x-8 gap-y-2 border-y border-border py-4">
          <div className="flex flex-col">
            <span className="k-heading k-num text-[36px] leading-none tracking-[-0.04em]">{penger(t.prisPerKuvert)}</span>
            <span className="mt-1 text-small font-semibold">{tr('per kuvert inkl. mva')}</span>
          </div>
          <div className="flex flex-col">
            <span className="k-num text-xl font-bold">{penger(t.totalInklMva)}</span>
            <span className="text-small text-text-muted">{tr('totalt for {gjester} kuverter inkl. mva', { gjester: f.gjester })}</span>
          </div>
        </div>

        <dl className="m-0 grid grid-cols-1 gap-4 text-[15px] min-[480px]:grid-cols-[132px_minmax(0,1fr)] min-[480px]:gap-x-4 min-[480px]:gap-y-3">
          <dt className="font-semibold text-text-muted">{tr('Meny')}</dt>
          <dd className="m-0 -mt-3 leading-normal min-[480px]:mt-0">{t.meny}</dd>
          <dt className="font-semibold text-text-muted">{tr('Kosthold')}</dt>
          <dd className="m-0 -mt-3 leading-normal min-[480px]:mt-0">
            <span className={t.kosthold.dekket ? 'text-success' : undefined}>{tr(t.kosthold.tekst)}</span>
            {t.kosthold.merknad && <span className="font-semibold text-warning"> {t.kosthold.merknad}</span>}
          </dd>
          <dt className="font-semibold text-text-muted">{tr('Levering')}</dt>
          <dd className="m-0 -mt-3 min-[480px]:mt-0">{leveringTekst}</dd>
          <dt className="font-semibold text-text-muted">{tr('Oppsett og rydding')}</dt>
          <dd className="m-0 -mt-3 min-[480px]:mt-0">{t.oppsettOgRydding ? tr('Inkludert') : tr('Ikke inkludert')}</dd>
          <dt className="font-semibold text-text-muted">{tr('Servise')}</dt>
          <dd className="m-0 -mt-3 min-[480px]:mt-0">{tr(t.servise)}</dd>
          <dt className="font-semibold text-text-muted">{tr('Gjelder til')}</dt>
          <dd className="m-0 -mt-3 min-[480px]:mt-0">{dagMndLang(t.gyldigTil, info.intl)}</dd>
          {t.betingelser && (
            <>
              <dt className="font-semibold text-text-muted">{tr('Betingelser')}</dt>
              <dd className="m-0 -mt-3 leading-normal min-[480px]:mt-0">{t.betingelser}</dd>
            </>
          )}
        </dl>

        {(t.menyUrl || (t.vedlegg?.length ?? 0) > 0) && (
          <section aria-labelledby={`vedlegg-${t.id}`} className="flex flex-col gap-3">
            <h3 id={`vedlegg-${t.id}`} className="m-0 text-[17px] font-bold">
              {tr('Meny, bilder og filer')}
            </h3>
            {t.menyUrl && (
              <a href={t.menyUrl} target="_blank" rel="noopener noreferrer" className="self-start text-base font-semibold">
                {tr('Se menyen på nettsiden til {navn}', { navn: t.leverandorNavn })}
                <span className="sr-only">{` (${tr('åpnes i ny fane')})`}</span> ↗
              </a>
            )}
            {t.vedlegg?.some((v) => kanVises(v.type)) && (
              <ul className="m-0 grid list-none grid-cols-2 gap-2 p-0 min-[480px]:grid-cols-3">
                {t.vedlegg
                  .filter((v) => kanVises(v.type))
                  .map((v) => (
                    <li key={v.url}>
                      <a href={v.url} target="_blank" rel="noopener noreferrer" className="block overflow-hidden rounded-alert border border-border">
                        {/* eslint-disable-next-line @next/next/no-img-element -- midlertidig signert lenke */}
                        <img src={v.url} alt={`${v.navn} (${tr('åpnes i ny fane')})`} loading="lazy" className="h-28 w-full object-cover" />
                      </a>
                    </li>
                  ))}
              </ul>
            )}
            {t.vedlegg?.some((v) => !kanVises(v.type)) && (
              <ul className="m-0 flex list-none flex-col gap-1 p-0">
                {t.vedlegg
                  .filter((v) => !kanVises(v.type))
                  .map((v) => (
                    <li key={v.url}>
                      <a href={v.url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-touch items-center gap-2 text-base font-semibold">
                        <span className="rounded-[6px] bg-surface-soft px-1.5 py-0.5 text-small font-bold uppercase text-text-muted" aria-hidden="true">
                          {v.type === 'application/pdf' ? 'PDF' : tr('Fil')}
                        </span>
                        {v.navn}
                        <span className="font-normal text-text-muted">({filstorrelse(v.storrelse)})</span>
                        <span className="sr-only">{` (${tr('åpnes i ny fane')})`}</span>
                      </a>
                    </li>
                  ))}
              </ul>
            )}
          </section>
        )}

        {!avslatt && (
          <div className="rounded-alert border border-border p-4">
            <Samtale foresporselId={f.id} leverandorId={t.leverandorId} tittel={tr('Skriv til {navn}', { navn: t.leverandorNavn })} kompakt />
          </div>
        )}

        <div className="flex flex-col gap-2">
          {avslatt ? (
            <>
              <p className="m-0 text-[15px] font-semibold text-text-muted">{tr('Du har avslått dette tilbudet.')}</p>
              <Button variant="text" onClick={onAngreAvslag} className="self-start !px-0">
                {tr('Angre avslaget')}
              </Button>
            </>
          ) : erValgt ? (
            <p className="m-0 font-bold text-success">{tr('Du har valgt dette tilbudet.')}</p>
          ) : utlopt ? (
            <p className="m-0 font-semibold text-warning">{tr('Tilbudet har gått ut. Send leverandøren et spørsmål hvis du vil ha et nytt.')}</p>
          ) : (
            <>
              {bekreftValg && !valgtId ? (
                <div role="group" aria-labelledby={`bekreft-${t.id}`} className="flex flex-col gap-3 rounded-alert border-2 border-primary p-4">
                  <p id={`bekreft-${t.id}`} className="m-0 text-base font-semibold leading-normal">
                    {tr('Vil du velge {navn} for {pris}?', { navn: t.leverandorNavn, pris: penger(t.totalInklMva) })}
                  </p>
                  <p className="m-0 text-[15px] leading-normal text-text-muted">
                    {levering
                      ? tr('Leverandøren får adressen din og tar kontakt for å avtale detaljene. De andre leverandørene får beskjed om at du har valgt.')
                      : tr('Leverandøren får beskjed og tar kontakt for å avtale detaljene. De andre leverandørene får beskjed om at du har valgt.')}
                  </p>
                  {levering && (
                    <Input
                      id={`adresse-${t.id}`}
                      label={tr('Leveringsadresse (gate og nummer)')}
                      autoComplete="street-address"
                      value={adresse}
                      onChange={(e) => {
                        setAdresse(e.target.value);
                        setAdresseFeil(undefined);
                      }}
                      feil={adresseFeil}
                      required
                    />
                  )}
                  {velgFeil && <Alert tone="feil">{velgFeil}</Alert>}
                  <div className="flex flex-wrap gap-2">
                    <Button onClick={velg} busy={opptatt} disabled={opptatt}>
                      {tr('Ja, velg tilbudet')}
                    </Button>
                    <Button variant="secondary" onClick={() => setBekreftValg(false)}>
                      {tr('Avbryt')}
                    </Button>
                  </div>
                </div>
              ) : (
                <Button size="lg" onClick={() => setBekreftValg(true)} disabled={!!valgtId || !aktiv}>
                  {tr('Velg dette tilbudet')}
                </Button>
              )}
              {!valgtId &&
                aktiv &&
                (bekreftAvslag ? (
                  <div role="group" aria-label={tr('Bekreft avslag')} className="flex flex-col gap-2 rounded-alert border border-border p-4">
                    <p className="m-0 text-[15px]">{tr('Leverandøren får beskjed om at du ikke ønsker tilbudet. Du kan angre senere.')}</p>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="danger" size="sm" onClick={onAvsla}>
                        {tr('Avslå tilbudet')}
                      </Button>
                      <Button variant="secondary" size="sm" onClick={() => setBekreftAvslag(false)}>
                        {tr('Avbryt')}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button variant="text" onClick={() => setBekreftAvslag(true)} className="self-center">
                    {tr('Avslå tilbudet')}
                  </Button>
                ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
