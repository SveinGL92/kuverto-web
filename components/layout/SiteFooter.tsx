import Link from 'next/link';
import { Symbol } from './Logo';
import { ThemeToggle } from './ThemeToggle';

const lenker = ['Om oss', 'Kundeservice', 'Personvern', 'Vilkår'];

export function SiteFooter() {
  return (
    <footer className="k-wrap flex flex-wrap items-center justify-between gap-4 pb-10 pt-16 text-[15px] text-text-muted">
      <span className="flex items-center gap-2 text-primary">
        <Symbol size={22} />
        <span className="k-heading text-xl leading-none">kuverto</span>
      </span>
      <nav aria-label="Bunnmeny">
        <ul className="m-0 flex list-none flex-wrap items-center gap-x-1 p-0">
          {lenker.map((l, i) => (
            <li key={l} className="flex items-center gap-1">
              {i > 0 && <span aria-hidden="true">·</span>}
              <Link href="#" className="inline-flex min-h-touch items-center text-text-muted no-underline hover:text-text hover:underline">
                {l}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <ThemeToggle />
    </footer>
  );
}
