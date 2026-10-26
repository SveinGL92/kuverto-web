import Link from 'next/link';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/cn';

/** Valgbrikke. «soft» = valgt med urt-flate (skjemaets enkeltvalg), «solid» = valgt i oliven (kosthold, budsjett, filtre). */
export function Chip({
  pressed,
  tone = 'solid',
  className,
  children,
  ...rest
}: { pressed: boolean; tone?: 'soft' | 'solid' } & ComponentProps<'button'>) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      {...rest}
      className={cn(
        'inline-flex min-h-touch items-center gap-2 rounded-pill px-4 text-[15px] transition-colors duration-200 ease-kuverto',
        pressed
          ? tone === 'solid'
            ? 'border-2 border-primary bg-primary font-bold text-primary-on'
            : 'border-2 border-primary bg-surface-soft font-bold text-text'
          : 'border-[1.5px] border-border-input bg-surface font-semibold text-text hover:border-primary',
        className,
      )}
    >
      {children}
    </button>
  );
}

/** Anledningsbrikke med strektegning, brukt som lenke på forsiden. */
export function OccasionChip({
  href,
  illustrasjon,
  aktiv,
  size = 'lg',
  children,
}: {
  href: ComponentProps<typeof Link>['href'];
  illustrasjon?: string;
  aktiv?: boolean;
  size?: 'lg' | 'md';
  children: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        'inline-flex items-center gap-2.5 rounded-pill font-semibold text-text no-underline transition-colors duration-200 hover:text-text',
        size === 'lg' ? 'min-h-14 pl-3.5 pr-[22px] text-[17px]' : 'min-h-12 pl-2.5 pr-4 text-base',
        aktiv ? 'k-on-accent bg-accent text-accent-on hover:text-accent-on' : 'bg-surface hover:bg-surface-soft',
      )}
    >
      {illustrasjon && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={illustrasjon} alt="" className={cn('k-ink w-auto', size === 'lg' ? 'h-[34px]' : 'h-7')} />
      )}
      {children}
    </Link>
  );
}
