'use client';

import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { hentSamtale, sendChatMelding, type ChatMelding } from '@/app/samtale/actions';
import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/Button';

const tid = (iso: string) => new Date(iso).toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Oslo' });
const dag = (iso: string) => {
  const d = new Date(iso).toLocaleDateString('sv-SE', { timeZone: 'Europe/Oslo' });
  const idag = new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Oslo' });
  const igar = new Date(Date.now() - 86_400_000).toLocaleDateString('sv-SE', { timeZone: 'Europe/Oslo' });
  if (d === idag) return 'I dag';
  if (d === igar) return 'I går';
  const t = new Date(iso).toLocaleDateString('nb-NO', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'Europe/Oslo' });
  return t.charAt(0).toUpperCase() + t.slice(1);
};

/**
 * Chat mellom kunde og leverandør om én forespørsel. Henter nye meldinger hvert 8. sekund mens fanen er synlig.
 * leverandorId trengs når kunden er innlogget; for leverandøren utledes den på serveren.
 */
export function Samtale({ foresporselId, leverandorId, tittel, kompakt = false }: { foresporselId: string; leverandorId?: string; tittel?: string; kompakt?: boolean }) {
  const [meldinger, setMeldinger] = useState<ChatMelding[]>();
  const [meg, setMeg] = useState<'kunde' | 'leverandor'>();
  const [motpart, setMotpart] = useState('');
  const [kanSende, setKanSende] = useState(true);
  const [grunn, setGrunn] = useState<string>();
  const [tekst, setTekst] = useState('');
  const [feil, setFeil] = useState<string>();
  const [sender, setSender] = useState(false);
  const [nytt, setNytt] = useState('');
  const logg = useRef<HTMLDivElement>(null);
  const antall = useRef(0);
  const sistFraMotpart = useRef(-1);
  const feltId = useId();
  const tittelId = useId();

  const hent = useCallback(async () => {
    const svar = await hentSamtale(foresporselId, leverandorId);
    if (!svar.ok) {
      setFeil(svar.feil);
      return;
    }
    setMeg(svar.meg);
    setMotpart(svar.motpart);
    setKanSende(svar.kanSende);
    setGrunn(svar.grunn);
    const fraMotpart = svar.meldinger.filter((m) => m.fra !== svar.meg);
    if (sistFraMotpart.current >= 0 && fraMotpart.length > sistFraMotpart.current) setNytt(`Ny melding fra ${svar.motpart}: ${fraMotpart.at(-1)?.tekst ?? ''}`);
    sistFraMotpart.current = fraMotpart.length;
    setMeldinger(svar.meldinger);
  }, [foresporselId, leverandorId]);

  useEffect(() => {
    let aktiv = true;
    const kjor = () => aktiv && document.visibilityState === 'visible' && hent();
    kjor();
    const t = setInterval(kjor, 8000);
    document.addEventListener('visibilitychange', kjor);
    return () => {
      aktiv = false;
      clearInterval(t);
      document.removeEventListener('visibilitychange', kjor);
    };
  }, [hent]);

  // Rull til bunnen når det kommer nye meldinger.
  useEffect(() => {
    if (meldinger && meldinger.length !== antall.current) {
      antall.current = meldinger.length;
      logg.current?.scrollTo({ top: logg.current.scrollHeight });
    }
  }, [meldinger]);

  const send = async () => {
    const t = tekst.trim();
    if (!t || sender) return;
    setSender(true);
    setFeil(undefined);
    const svar = await sendChatMelding(foresporselId, leverandorId ?? null, t);
    setSender(false);
    if (!svar.ok) {
      setFeil(svar.feil);
      return;
    }
    setTekst('');
    setMeldinger((m) => [...(m ?? []), svar.melding]);
  };

  let forrigeDag = '';
  return (
    <section aria-labelledby={tittelId} className="flex min-h-0 flex-col gap-3">
      <h2 id={tittelId} className={cn('m-0', kompakt ? 'text-[17px] font-bold' : 'k-heading pr-10 text-[26px]')}>
        {tittel ?? (motpart ? `Samtale med ${motpart}` : 'Samtale')}
      </h2>
      <div
        ref={logg}
        role="log"
        aria-label={`Meldinger${motpart ? ` med ${motpart}` : ''}`}
        tabIndex={0}
        className={cn('flex flex-col gap-2 overflow-y-auto rounded-alert bg-surface-soft p-3', kompakt ? 'max-h-[260px] min-h-[120px]' : 'h-[min(52dvh,440px)]')}
      >
        {!meldinger ? (
          <p className="m-auto text-[15px] text-text-muted">Henter meldinger …</p>
        ) : meldinger.length === 0 ? (
          <p className="m-auto max-w-[36ch] text-center text-[15px] text-text-muted">
            Ingen meldinger ennå. {meg === 'kunde' ? 'Still spørsmål om menyen, allergier eller levering.' : 'Spør kunden om det du trenger for å gi et godt tilbud.'}
          </p>
        ) : (
          meldinger.map((m) => {
            const min = m.fra === meg;
            const d = dag(m.opprettet);
            const visDag = d !== forrigeDag;
            forrigeDag = d;
            return (
              <div key={m.id} className="flex flex-col gap-2">
                {visDag && <p className="m-0 mt-1 text-center text-small font-semibold text-text-muted">{d}</p>}
                <div className={cn('flex max-w-[85%] flex-col gap-0.5', min ? 'self-end items-end' : 'self-start items-start')}>
                  <p className={cn('m-0 whitespace-pre-wrap break-words rounded-[18px] px-3.5 py-2 text-base leading-normal', min ? 'rounded-br-[6px] bg-primary text-primary-on' : 'rounded-bl-[6px] bg-surface text-text')}>
                    <span className="sr-only">{min ? 'Du' : motpart}: </span>
                    {m.tekst}
                  </p>
                  <span className="px-1 text-small text-text-muted">
                    {tid(m.opprettet)}
                    {min && m.lest ? ' · Lest' : ''}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
      <span className="sr-only" aria-live="polite">
        {nytt}
      </span>
      {kanSende ? (
        <form
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
          className="flex items-end gap-2"
        >
          <div className="flex min-w-0 flex-grow flex-col gap-1">
            <label htmlFor={feltId} className="sr-only">
              Skriv en melding{motpart ? ` til ${motpart}` : ''}
            </label>
            <textarea
              id={feltId}
              rows={2}
              maxLength={2000}
              value={tekst}
              onChange={(e) => setTekst(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
                  e.preventDefault();
                  send();
                }
              }}
              placeholder={`Skriv til ${motpart || 'motparten'} …`}
              aria-describedby={`${feltId}-hjelp`}
              className="min-h-[52px] w-full resize-none rounded-input border-[1.5px] border-border-input bg-surface px-3.5 py-3 text-base focus:border-2 focus:border-primary"
            />
            <span id={`${feltId}-hjelp`} className="text-small text-text-muted">
              Enter sender, Shift + Enter gir ny linje.
            </span>
          </div>
          <Button type="submit" busy={sender} disabled={sender || !tekst.trim()} className="mb-6 shrink-0">
            Send
          </Button>
        </form>
      ) : (
        grunn && <p className="m-0 text-[15px] text-text-muted">{grunn}</p>
      )}
      {feil && <p className="m-0 text-small font-semibold text-error">{feil}</p>}
    </section>
  );
}
