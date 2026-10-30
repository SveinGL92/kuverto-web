'use client';

/** Velg dekningsområde: én avkrysning per fylke, med valgfrie enkeltkommuner. */
export interface Kommune {
  nr: string;
  navn: string;
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
  const v = { kommuner: valgt };
  const sett = (_: 'kommuner', liste: string[]) => onChange(liste);
  const FYLKER: Record<string, string> = { '03': 'Oslo', '32': 'Akershus' };
  const fylker = Object.entries(
    kommuner.reduce<Record<string, Kommune[]>>((acc, k) => {
      (acc[k.nr.slice(0, 2)] ??= []).push(k);
      return acc;
    }, {}),
  )
    .map(([nr, liste]) => ({ nr, navn: FYLKER[nr] ?? nr, kommuner: liste }))
    .sort((a, b) => a.nr.localeCompare(b.nr));
  const vekslKommune = (nr: string) => sett('kommuner', v.kommuner.includes(nr) ? v.kommuner.filter((x) => x !== nr) : [...v.kommuner, nr]);
  const vekslFylke = (liste: Kommune[], alle: boolean) => {
    const nr = liste.map((k) => k.nr);
    sett('kommuner', alle ? v.kommuner.filter((x) => !nr.includes(x)) : [...new Set([...v.kommuner, ...nr])]);
  };
  return (
        <fieldset id="felt-kommuner" tabIndex={-1} aria-describedby={feilId} className="m-0 flex flex-col gap-3 border-0 p-0 outline-none">
          <legend className="sr-only">Fylker og kommuner</legend>
          {fylker.map((fy) => {
            const valgte = fy.kommuner.filter((k) => v.kommuner.includes(k.nr)).length;
            const alle = valgte === fy.kommuner.length;
            const delvis = valgte > 0 && !alle;
            const ettKommune = fy.kommuner.length === 1;
            return (
              <div key={fy.nr} className="flex flex-col rounded-alert border border-border">
                <label className="flex min-h-14 cursor-pointer items-center gap-3 px-4 text-base font-bold">
                  <input
                    type="checkbox"
                    checked={alle}
                    ref={(el) => {
                      if (el) el.indeterminate = delvis;
                    }}
                    aria-describedby={`fylke-${fy.nr}-status`}
                    onChange={() => vekslFylke(fy.kommuner, alle)}
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
                          <input type="checkbox" checked={v.kommuner.includes(k.nr)} onChange={() => vekslKommune(k.nr)} className="h-6 w-6 shrink-0 accent-[var(--k-primary)]" />
                          {k.navn}
                        </label>
                      ))}
                    </div>
                  </details>
                )}
              </div>
            );
          })}
        </fieldset>
  );
}
