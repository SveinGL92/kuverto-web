'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Input';
import { dagMndLang, kr } from '@/lib/format';
import type { Foresporsel, Tilbud } from '@/lib/types';

/**
 * Hele tilbudet i en dialog: detaljer, betingelser, spørsmål til leverandøren, velg eller avslå.
 * Fase 1: spørsmål og avslag lagres bare lokalt. Fase 2: server actions mot meldinger og tilbud.
 */
export function TilbudDetalj({
  tilbud: t,
  foresporsel: f,
  valgtId,
  avslatt,
  onVelg,
  onAvsla,
  onAngreAvslag,
}: {
  tilbud: Tilbud;
  foresporsel: Foresporsel;
  valgtId?: string;
  avslatt: boolean;
  onVelg: () => void;
  onAvsla: () => void;
  onAngreAvslag: () => void;
}) {
  const [sporsmal, setSporsmal] = useState('');
  const [sendt, setSendt] = useState(false);
  const [sporsmalFeil, setSporsmalFeil] = useState<string>();
  const [bekreftAvslag, setBekreftAvslag] = useState(false);
  const erValgt = valgtId === t.id;
  const levering = t.levering.inkludert ? 'Inkludert' : t.levering.pris ? `${kr(t.levering.pris)} i tillegg` : 'Ikke inkludert';

  const send = () => {
    if (sporsmal.trim().length < 3) {
      setSporsmalFeil('Skriv spørsmålet ditt før du sender.');
      document.getElementById(`sporsmal-${t.id}`)?.focus();
      return;
    }
    setSporsmalFeil(undefined);
    setSendt(true);
    setSporsmal('');
  };

  return (
    <div className="flex flex-col bg-bg">
      <div className="relative h-[180px] bg-[var(--k-photo-placeholder)] md:h-[220px]">
        <Image src={t.bilde.src} alt={t.bilde.alt} fill sizes="560px" className="object-cover" />
      </div>
      <div className="flex flex-col gap-6 p-5 md:p-7">
        <div className="flex flex-col gap-1.5">
          <h2 className="k-heading m-0 text-[28px] leading-[1.05]">{t.leverandorNavn}</h2>
          {t.leverandorBeskrivelse && <p className="m-0 text-base leading-normal text-text-muted">{t.leverandorBeskrivelse}</p>}
        </div>

        <div className="flex flex-wrap items-end gap-x-8 gap-y-2 border-y border-border py-4">
          <div className="flex flex-col">
            <span className="k-heading k-num text-[36px] leading-none tracking-[-0.04em]">{kr(t.prisPerKuvert)}</span>
            <span className="mt-1 text-small font-semibold">per kuvert inkl. mva</span>
          </div>
          <div className="flex flex-col">
            <span className="k-num text-xl font-bold">{kr(t.totalInklMva)}</span>
            <span className="text-small text-text-muted">totalt for {f.gjester} kuverter inkl. mva</span>
          </div>
        </div>

        <dl className="m-0 grid grid-cols-1 gap-4 text-[15px] min-[480px]:grid-cols-[132px_minmax(0,1fr)] min-[480px]:gap-x-4 min-[480px]:gap-y-3">
          <dt className="font-semibold text-text-muted">Meny</dt>
          <dd className="m-0 -mt-3 leading-normal min-[480px]:mt-0">{t.meny}</dd>
          <dt className="font-semibold text-text-muted">Kosthold</dt>
          <dd className="m-0 -mt-3 leading-normal min-[480px]:mt-0">
            <span className={t.kosthold.dekket ? 'text-success' : undefined}>{t.kosthold.tekst}</span>
            {t.kosthold.merknad && <span className="font-semibold text-warning"> {t.kosthold.merknad}</span>}
          </dd>
          <dt className="font-semibold text-text-muted">Levering</dt>
          <dd className="m-0 -mt-3 min-[480px]:mt-0">{levering}</dd>
          <dt className="font-semibold text-text-muted">Oppsett og rydding</dt>
          <dd className="m-0 -mt-3 min-[480px]:mt-0">{t.oppsettOgRydding ? 'Inkludert' : 'Ikke inkludert'}</dd>
          <dt className="font-semibold text-text-muted">Servise</dt>
          <dd className="m-0 -mt-3 min-[480px]:mt-0">{t.servise}</dd>
          <dt className="font-semibold text-text-muted">Gjelder til</dt>
          <dd className="m-0 -mt-3 min-[480px]:mt-0">{dagMndLang(t.gyldigTil)}</dd>
          {t.betingelser && (
            <>
              <dt className="font-semibold text-text-muted">Betingelser</dt>
              <dd className="m-0 -mt-3 leading-normal min-[480px]:mt-0">{t.betingelser}</dd>
            </>
          )}
        </dl>

        {!avslatt && (
          <section aria-labelledby={`sporsmal-tittel-${t.id}`} className="flex flex-col gap-3 rounded-alert bg-surface-soft p-4">
            <h3 id={`sporsmal-tittel-${t.id}`} className="m-0 text-[17px] font-bold">
              Spørsmål til leverandøren
            </h3>
            {sendt && (
              <Alert tone="status">Spørsmålet er sendt. Svaret kommer her og på e-post.</Alert>
            )}
            <Textarea
              id={`sporsmal-${t.id}`}
              label="Ditt spørsmål"
              rows={3}
              value={sporsmal}
              maxLength={1000}
              onChange={(e) => {
                setSporsmal(e.target.value);
                setSendt(false);
              }}
              placeholder="Kan dere lage nøttefri dessert?"
              feil={sporsmalFeil}
            />
            <Button variant="secondary" size="sm" onClick={send} className="self-start">
              Send spørsmål
            </Button>
          </section>
        )}

        <div className="flex flex-col gap-2">
          {avslatt ? (
            <>
              <p className="m-0 text-[15px] font-semibold text-text-muted">Du har avslått dette tilbudet.</p>
              <Button variant="text" onClick={onAngreAvslag} className="self-start !px-0">
                Angre avslaget
              </Button>
            </>
          ) : erValgt ? (
            <p className="m-0 font-bold text-success">Du har valgt dette tilbudet.</p>
          ) : (
            <>
              <Button size="lg" onClick={onVelg} disabled={!!valgtId}>
                Velg dette tilbudet
              </Button>
              {!valgtId &&
                (bekreftAvslag ? (
                  <div role="group" aria-label="Bekreft avslag" className="flex flex-col gap-2 rounded-alert border border-border p-4">
                    <p className="m-0 text-[15px]">Leverandøren får beskjed om at du ikke ønsker tilbudet. Du kan angre senere.</p>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="danger" size="sm" onClick={onAvsla}>
                        Avslå tilbudet
                      </Button>
                      <Button variant="secondary" size="sm" onClick={() => setBekreftAvslag(false)}>
                        Avbryt
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button variant="text" onClick={() => setBekreftAvslag(true)} className="self-center">
                    Avslå tilbudet
                  </Button>
                ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
