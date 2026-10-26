import { cn } from '@/lib/cn';

/**
 * Signaturen: prisen per kuvert ringes inn med en tegnet dobbel tallerkenkant.
 * Bruk den bare én gang per skjerm, på det kunden bør se først.
 */
export function PriceRing({ children, className, ringed = true }: { children: React.ReactNode; className?: string; ringed?: boolean }) {
  return (
    <span className={cn('k-heading k-num relative inline-block self-start px-1.5 tracking-[-0.03em]', className)}>
      {children}
      {ringed && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src="/illustrasjoner/tallerkenring.svg"
          alt=""
          aria-hidden="true"
          className="k-ring k-ink pointer-events-none absolute left-[-20%] top-[-30%] h-[160%] w-[140%] max-w-none"
        />
      )}
    </span>
  );
}
