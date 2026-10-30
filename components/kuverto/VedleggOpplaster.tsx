'use client';

import { useId, useRef, useState } from 'react';
import { lagOpplasting } from '@/app/leverandor/actions';
import { filstorrelse, kanVises, MAKS_VEDLEGG } from '@/lib/vedlegg';
import { supabaseKlient } from '@/lib/supabaseKlient';
import type { VedleggFil } from '@/lib/types';

type Fil = VedleggFil & { url?: string };

/** Last opp bilder og PDF-er til et tilbud. Filene går rett til lagringen med en signert URL. */
export function VedleggOpplaster({ foresporselId, vedlegg, onChange }: { foresporselId: string; vedlegg: Fil[]; onChange: (v: Fil[]) => void }) {
  const input = useRef<HTMLInputElement>(null);
  const [laster, setLaster] = useState<string[]>([]);
  const [feil, setFeil] = useState<string[]>([]);
  const [drar, setDrar] = useState(false);
  const hint = useId();
  const status = useId();
  const plass = MAKS_VEDLEGG - vedlegg.length - laster.length;

  const lastOpp = async (filer: File[]) => {
    setFeil([]);
    const nye = filer.slice(0, Math.max(0, plass));
    const feilListe: string[] = filer.length > nye.length ? [`Du kan legge ved høyst ${MAKS_VEDLEGG} filer.`] : [];
    setLaster((l) => [...l, ...nye.map((f) => f.name)]);
    const ferdige: Fil[] = [];
    for (const fil of nye) {
      // Noen nettlesere gir HEIC-bilder tom type.
      const type = fil.type || (/\.(heic|heif)$/i.test(fil.name) ? 'image/heic' : '');
      const svar = await lagOpplasting(foresporselId, fil.name, type, fil.size);
      if (!svar.ok) {
        feilListe.push(svar.feil);
      } else {
        const { error } = await supabaseKlient().storage.from('vedlegg').uploadToSignedUrl(svar.sti, svar.token, fil, { contentType: type });
        if (error) feilListe.push(`${fil.name} ble ikke lastet opp. Prøv igjen.`);
        else ferdige.push({ sti: svar.sti, navn: fil.name, type, storrelse: fil.size, url: kanVises(type) ? URL.createObjectURL(fil) : undefined });
      }
      setLaster((l) => l.filter((n) => n !== fil.name));
    }
    if (ferdige.length) onChange([...vedlegg, ...ferdige]);
    setFeil(feilListe);
    if (input.current) input.current.value = '';
  };

  return (
    <div className="flex flex-col gap-2">
      <span className="text-[15px] font-semibold">Bilder og filer (valgfritt)</span>
      <span id={hint} className="-mt-1 text-small text-text-muted">
        Bilder av maten, menykort eller prisliste. JPG, PNG, WebP, HEIC eller PDF, høyst 10 MB per fil og {MAKS_VEDLEGG} filer. Det første bildet vises øverst i tilbudet.
      </span>
      {vedlegg.length > 0 && (
        <ul className="m-0 grid list-none grid-cols-2 gap-2 p-0 min-[480px]:grid-cols-3">
          {vedlegg.map((v, i) => (
            <li key={v.sti} className="relative flex flex-col overflow-hidden rounded-alert border border-border bg-surface">
              {v.url && kanVises(v.type) ? (
                // eslint-disable-next-line @next/next/no-img-element -- midlertidig lenke, ikke optimaliserbar
                <img src={v.url} alt="" className="h-24 w-full object-cover" />
              ) : (
                <div className="flex h-24 items-center justify-center bg-surface-soft text-small font-bold uppercase text-text-muted" aria-hidden="true">
                  {v.type === 'application/pdf' ? 'PDF' : 'Bilde'}
                </div>
              )}
              <div className="flex items-center justify-between gap-1 p-2">
                <span className="min-w-0 truncate text-small font-semibold" title={v.navn}>
                  {i === 0 && kanVises(v.type) ? '★ ' : ''}
                  {v.navn}
                  <span className="block font-normal text-text-muted">{filstorrelse(v.storrelse)}</span>
                </span>
                <button
                  type="button"
                  onClick={() => onChange(vedlegg.filter((x) => x.sti !== v.sti))}
                  aria-label={`Fjern ${v.navn}`}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-pill text-text-muted hover:bg-surface-soft hover:text-text"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
                    <path d="M6 6l12 12M18 6L6 18" />
                  </svg>
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
      {plass > 0 && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDrar(true);
          }}
          onDragLeave={() => setDrar(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDrar(false);
            lastOpp([...e.dataTransfer.files]);
          }}
          className={`flex flex-col items-center gap-2 rounded-alert border-2 border-dashed px-4 py-5 text-center ${drar ? 'border-primary bg-surface-soft' : 'border-border-input'}`}
        >
          <button
            type="button"
            onClick={() => input.current?.click()}
            aria-describedby={hint}
            className="inline-flex min-h-touch items-center gap-2 rounded-pill border-[1.5px] border-border-input bg-surface px-5 text-[15px] font-bold hover:border-primary"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 16V4M7 9l5-5 5 5M5 20h14" />
            </svg>
            Legg til bilder eller PDF
          </button>
          <span className="text-small text-text-muted">eller dra filene hit</span>
          <input
            ref={input}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif,application/pdf"
            className="sr-only"
            tabIndex={-1}
            aria-hidden="true"
            onChange={(e) => lastOpp([...(e.target.files ?? [])])}
          />
        </div>
      )}
      <div id={status} aria-live="polite" className="flex flex-col gap-1">
        {laster.length > 0 && <span className="text-small font-semibold">Laster opp {laster.join(', ')} …</span>}
        {feil.map((f) => (
          <span key={f} className="text-small font-semibold text-error">
            {f}
          </span>
        ))}
      </div>
    </div>
  );
}
