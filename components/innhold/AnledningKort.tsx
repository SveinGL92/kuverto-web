import Image from 'next/image';
import Link from 'next/link';
import type { AnledningInnhold } from '@/lib/anledninger-innhold';
import { cn } from '@/lib/cn';

/** Rutenett med anledninger. Hvert kort går til landingssiden for anledningen. */
export function AnledningKort({
  liste,
  className,
  overskriftNiva = 'h3',
  medAnnet,
}: {
  liste: AnledningInnhold[];
  className?: string;
  overskriftNiva?: 'h2' | 'h3';
  /** Legger til et kort for «Noe annet» som går rett til skjemaet. */
  medAnnet?: boolean;
}) {
  const H = overskriftNiva;
  return (
    <ul className={cn('m-0 grid list-none grid-cols-2 gap-2.5 p-0 md:grid-cols-4 md:gap-4', className)}>
      {liste.map((a) => (
        <li key={a.slug}>
          <Link
            href={`/catering/${a.slug}`}
            className="group flex h-full flex-col overflow-hidden rounded-card bg-surface text-text no-underline transition-shadow duration-200 hover:text-text hover:shadow-float focus-visible:shadow-float"
          >
            <span className="relative block aspect-[4/3] overflow-hidden bg-[var(--k-photo-placeholder)]">
              {a.bilde ? (
                <Image
                  src={a.bilde.src}
                  alt=""
                  fill
                  sizes="(min-width: 768px) 25vw, 50vw"
                  className="object-cover transition-transform duration-500 ease-kuverto group-hover:scale-[1.03] motion-reduce:transition-none"
                  style={{ objectPosition: a.bilde.posisjon ?? '50% 50%' }}
                />
              ) : (
                <span className="flex h-full items-center justify-center bg-surface-soft">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={a.illustrasjon ?? '/illustrasjoner/tom-tallerken.svg'} alt="" className="k-ink w-[45%]" />
                </span>
              )}
            </span>
            <span className="flex flex-grow items-center justify-between gap-2 px-4 py-3.5 md:px-5 md:py-4">
              <H className="m-0 text-base font-bold leading-tight md:text-[17px]">{a.kortnavn}</H>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="shrink-0 text-primary transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </span>
          </Link>
        </li>
      ))}
      {medAnnet && (
        <li>
          <Link
            href="/foresporsel?anledning=annet"
            className="group flex h-full flex-col overflow-hidden rounded-card border-[1.5px] border-dashed border-border-input text-text no-underline transition-colors duration-200 hover:border-primary hover:text-text"
          >
            <span className="flex aspect-[4/3] items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/illustrasjoner/tom-tallerken.svg" alt="" className="k-ink w-[45%]" />
            </span>
            <span className="flex flex-grow items-center justify-between gap-2 px-4 py-3.5 md:px-5 md:py-4">
              <H className="m-0 text-base font-bold leading-tight md:text-[17px]">Noe annet</H>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="shrink-0 text-primary">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </span>
          </Link>
        </li>
      )}
    </ul>
  );
}
