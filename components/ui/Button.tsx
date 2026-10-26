import Link from 'next/link';
import type { ComponentProps, ReactNode } from 'react';
import { cn } from '@/lib/cn';

type Variant = 'primary' | 'secondary' | 'text' | 'accent' | 'on-panel' | 'danger';
type Size = 'lg' | 'md' | 'sm';

const variants: Record<Variant, string> = {
  primary: 'bg-primary text-primary-on hover:bg-primary-hover border-0',
  secondary: 'border-2 border-primary text-primary bg-transparent hover:bg-surface-soft',
  text: 'border-0 bg-transparent text-primary underline underline-offset-4 hover:text-primary-hover !px-2',
  accent: 'bg-accent text-accent-on border-0 hover:brightness-95',
  'on-panel': 'border-2 border-panel-on text-panel-on bg-transparent hover:bg-white/10',
  danger: 'bg-error text-white border-0 hover:brightness-95',
};

const sizes: Record<Size, string> = {
  lg: 'min-h-[58px] px-6 text-[17px]',
  md: 'min-h-[52px] px-[22px] text-base',
  sm: 'min-h-touch px-4 text-[15px]',
};

const base =
  'inline-flex items-center justify-center gap-2 rounded-pill font-bold no-underline transition-colors duration-200 ease-kuverto text-center leading-tight py-2 disabled:bg-neutral-bg disabled:text-text-muted disabled:cursor-not-allowed aria-disabled:bg-neutral-bg aria-disabled:text-text-muted';

interface Felles {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
  busy?: boolean;
}

export function Button({ variant = 'primary', size = 'md', className, children, busy, ...rest }: Felles & ComponentProps<'button'>) {
  return (
    <button
      type="button"
      {...rest}
      aria-busy={busy || undefined}
      className={cn(base, variants[variant], sizes[size], className)}
    >
      {busy && <Spinner />}
      {children}
    </button>
  );
}

export function ButtonLink({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...rest
}: Felles & ComponentProps<typeof Link>) {
  return (
    <Link {...rest} className={cn(base, variants[variant], sizes[size], className)}>
      {children}
    </Link>
  );
}

export function Spinner({ className }: { className?: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      aria-hidden="true"
      className={cn('animate-spin motion-reduce:animate-none', className)}
    >
      <path d="M12 3a9 9 0 1 0 9 9" />
    </svg>
  );
}
