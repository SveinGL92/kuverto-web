import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/cn';

/** Bildeflate med navnelapp, brukt som lenke til en anledning. */
export function PhotoTile({
  href,
  src,
  alt,
  navn,
  posisjon = '50% 55%',
  sizes,
  className,
  stor,
}: {
  href: string;
  src: string;
  alt: string;
  navn: string;
  posisjon?: string;
  sizes: string;
  className?: string;
  stor?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn('group relative block overflow-hidden rounded-[28px] bg-[var(--k-photo-placeholder)] text-text no-underline md:rounded-media', className)}
    >
      <Image src={src} alt={alt} fill sizes={sizes} className="object-cover transition-transform duration-500 ease-kuverto group-hover:scale-[1.02] motion-reduce:transition-none" style={{ objectPosition: posisjon }} />
      <span
        className={cn(
          'k-heading absolute rounded-pill bg-white text-[#1C2210] tracking-normal',
          stor ? 'bottom-3.5 left-3.5 px-4 py-2 text-lg md:bottom-5 md:left-5 md:px-[18px] md:py-2.5 md:text-xl' : 'bottom-3 left-3 px-3.5 py-1.5 text-base md:bottom-4 md:left-4 md:px-4 md:py-2 md:text-lg',
        )}
      >
        {navn}
      </span>
    </Link>
  );
}
