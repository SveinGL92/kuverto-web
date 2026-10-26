'use client';

import { useId, type ComponentProps, type ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { feltKlasse } from './Input';

export function Select({
  label,
  hint,
  className,
  labelClassName,
  id,
  children,
  ...rest
}: { label: ReactNode; hint?: ReactNode; className?: string; labelClassName?: string } & ComponentProps<'select'>) {
  const auto = useId();
  const feltId = id ?? auto;
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={feltId} className={cn('text-[15px] font-semibold', labelClassName)}>
        {label}
      </label>
      <select id={feltId} aria-describedby={hint ? `${feltId}-hint` : undefined} className={cn(feltKlasse(), 'font-semibold')} {...rest}>
        {children}
      </select>
      {hint && (
        <span id={`${feltId}-hint`} className="text-small text-text-muted">
          {hint}
        </span>
      )}
    </div>
  );
}
