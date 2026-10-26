/** Fremdrift i sju kuverter: ferdige tallerkener er fylt, aktiv har sitronkjerne. */
export function Progress({ steg, totalt = 7, navn }: { steg: number; totalt?: number; navn?: string }) {
  return (
    <div
      className="flex items-center gap-2.5"
      role="progressbar"
      aria-valuemin={1}
      aria-valuemax={totalt}
      aria-valuenow={steg}
      aria-label={`Steg ${steg} av ${totalt}${navn ? ` · ${navn}` : ''}`}
    >
      {Array.from({ length: totalt }, (_, i) => i + 1).map((n) => (
        <svg key={n} width="28" height="28" viewBox="0 0 28 28" aria-hidden="true" className="shrink-0">
          {n < steg ? (
            <>
              <circle cx="14" cy="14" r="12" fill="var(--k-primary)" />
              <circle cx="14" cy="14" r="6" fill="none" stroke="var(--k-on-primary)" strokeWidth="1.6" />
            </>
          ) : n === steg ? (
            <>
              <circle cx="14" cy="14" r="11" fill="var(--k-surface)" stroke="var(--k-primary)" strokeWidth="2.4" />
              <circle cx="14" cy="14" r="5" fill="var(--k-accent)" />
            </>
          ) : (
            <circle cx="14" cy="14" r="11" fill="none" stroke="var(--k-border-input)" strokeWidth="1.6" />
          )}
        </svg>
      ))}
    </div>
  );
}
