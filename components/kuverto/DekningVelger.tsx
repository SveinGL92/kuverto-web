'use client';

/** Velg dekningsområde: én avkrysning per fylke, med enkeltkommuner i en nedtrekksliste. */
export interface Kommune {
  nr: string;
  navn: string;
  fylkesnr: string;
  fylke: string;
}

interface Fylke {
  nr: string;
  navn: string;
  kommuner: Kommune[];
}

function FylkeRad({ fy, valgt, onChange }: { fy: Fylke; valgt: string[]; onChange: (l: string[]) => void }) {
  const valgte = fy.kommuner.filter((k) => valgt.includes(k.nr)).length;
  const alle = valgte === fy.kommuner.length;
  const delvis = valgte > 0 && !alle;
  const ettKommune = fy.kommuner.length === 1;
  const nr = fy.kommuner.map((k) => k.nr);
  const vekslFylke = () => onChange(alle ? valgt.filter((x) => !nr.includes(x)) : [...new Set([...valgt, ...nr])]);
  const vekslKommune = (k: string) => onChange(valgt.includes(k) ? valgt.filter((x) => x !== k) : [...valgt, k]);
  // «Herøy (Nordland)» → «Herøy» når fylket allerede står over.
  const kortNavn = (n: string) => n.replace(/\s*\([^)]*\)$/, '');
  return (
    <div className="flex flex-col rounded-alert border border-border">
      <label className="flex min-h-14 cursor-pointer items-center gap-3 px-4 text-base font-bold">
        <input
          type="checkbox"
          checked={alle}
          ref={(el) => {
            if (el) el.indeterminate = delvis;
          }}
          aria-describedby={`fylke-${fy.nr}-status`}
          onChange={vekslFylke}
          className="h-6 w-6 shrink-0 accent-[var(--k-primary)]"
        />
        <span className="flex-grow">{fy.navn}</span>
        <span id={`fylke-${fy.nr}-status`} className="text-small font-semibold text-text-muted">
          {ettKommune ? '' : alle ? `Alle ${fy.kommuner.length} kommuner` : valgte ? `${valgte} av ${fy.kommuner.length} kommuner` : `${fy.kommuner.length} kommuner`}
        </span>
      </label>
      {!ettKommune && (
        <details className="group border-t border-border" open={delvis || undefined}>
          <summary className="flex min-h-touch cursor-pointer list-none items-center gap-2 px-4 text-[15px] font-semibold text-primary [&::-webkit-details-marker]:hidden">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="transition-transform group-open:rotate-90 motion-reduce:transition-none">
              <path d="M9 6l6 6-6 6" />
            </svg>
            Velg enkeltkommuner i {fy.navn}
          </summary>
          <div className="grid grid-cols-1 gap-x-4 px-4 pb-3 min-[420px]:grid-cols-2 md:grid-cols-3">
            {fy.kommuner.map((k) => (
              <label key={k.nr} className="flex min-h-touch cursor-pointer items-center gap-3 text-[15px] font-semibold">
                <input type="checkbox" checked={valgt.includes(k.nr)} onChange={() => vekslKommune(k.nr)} className="h-6 w-6 shrink-0 accent-[var(--k-primary)]" />
                {kortNavn(k.navn)}
              </label>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}

export function DekningVelger({
  kommuner,
  valgt,
  onChange,
  feilId,
}: {
  kommuner: Kommune[];
  valgt: string[];
  onChange: (kommuner: string[]) => void;
  feilId?: string;
}) {
  const perFylke = new Map<string, Fylke>();
  for (const k of kommuner) {
    const f = perFylke.get(k.fylkesnr) ?? perFylke.set(k.fylkesnr, { nr: k.fylkesnr, navn: k.fylke, kommuner: [] }).get(k.fylkesnr)!;
    f.kommuner.push(k);
  }
  const fylker = [...perFylke.values()];
  for (const f of fylker) f.kommuner.sort((a, b) => a.navn.localeCompare(b.navn, 'nb'));
  fylker.sort((a, b) => a.navn.localeCompare(b.navn, 'nb'));

  return (
    <fieldset id="felt-kommuner" tabIndex={-1} aria-describedby={feilId} className="m-0 flex flex-col gap-3 border-0 p-0 outline-none">
      <legend className="sr-only">Fylker og kommuner</legend>
      {fylker.map((fy) => (
        <FylkeRad key={fy.nr} fy={fy} valgt={valgt} onChange={onChange} />
      ))}
    </fieldset>
  );
}
