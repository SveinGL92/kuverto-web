import Link from 'next/link';
import { cn } from '@/lib/cn';

export function Symbol({ size = 34, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true" className={className}>
      <rect x="3" y="11" width="5" height="26" rx="2.5" fill="currentColor" />
      <rect x="40" y="11" width="5" height="26" rx="2.5" fill="currentColor" />
      <circle cx="24" cy="24" r="10.5" fill="none" stroke="currentColor" strokeWidth="5" />
    </svg>
  );
}

/** Kuvert-symbolet + ordmerket. Fargen arves (oliven som standard). */
export function Logo({
  size = 'responsive',
  className,
  href = '/',
}: {
  size?: 'responsive' | 'lg' | 'md' | 'sm';
  className?: string;
  href?: string;
}) {
  const s = {
    responsive: { sym: 'h-[26px] w-[26px] md:h-[34px] md:w-[34px]', txt: 'text-[25px] md:text-[30px]' },
    lg: { sym: 'h-[34px] w-[34px]', txt: 'text-[30px]' },
    md: { sym: 'h-[26px] w-[26px]', txt: 'text-[25px]' },
    sm: { sym: 'h-[22px] w-[22px]', txt: 'text-xl' },
  }[size];
  return (
    <Link href={href} className={cn('inline-flex items-center gap-2 text-primary no-underline hover:text-primary md:gap-2.5', className)}>
      <Symbol className={s.sym} />
      <span className={cn('k-heading leading-none', s.txt)}>kuverto</span>
      <span className="sr-only">, til forsiden</span>
    </Link>
  );
}
