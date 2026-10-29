'use client';

import { useId, type ComponentProps, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

export const feltKlasse = (feil?: boolean) =>
  cn(
    'w-full min-h-[52px] rounded-input bg-surface px-3.5 text-[17px] font-medium text-text box-border',
    'focus:border-2 focus:border-primary focus:px-[13px]',
    feil ? 'border-2 border-error px-[13px]' : 'border-[1.5px] border-border-input',
  );

interface FeltProps {
  label: ReactNode;
  hint?: ReactNode;
  feil?: string;
  className?: string;
  labelClassName?: string;
}

export function Input({ label, hint, feil, className, labelClassName, id, ...rest }: FeltProps & ComponentProps<'input'>) {
  const auto = useId();
  const feltId = id ?? auto;
  const hintId = `${feltId}-hint`;
  const feilId = `${feltId}-feil`;
  const beskrevet = [hint ? hintId : null, feil ? feilId : null].filter(Boolean).join(' ') || undefined;
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={feltId} className={cn('text-[15px] font-semibold', labelClassName)}>
        {label}
      </label>
      <input id={feltId} aria-invalid={feil ? true : undefined} aria-describedby={beskrevet} className={feltKlasse(!!feil)} {...rest} />
      {hint && (
        <span id={hintId} className="text-small font-medium text-text-muted">
          {hint}
        </span>
      )}
      {feil && (
        <span id={feilId} className="text-small font-semibold text-error">
          {feil}
        </span>
      )}
    </div>
  );
}

export function Textarea({ label, hint, feil, className, id, ...rest }: FeltProps & ComponentProps<'textarea'>) {
  const auto = useId();
  const feltId = id ?? auto;
  const hintId = `${feltId}-hint`;
  const feilId = `${feltId}-feil`;
  const beskrevet = [hint ? hintId : null, feil ? feilId : null].filter(Boolean).join(' ') || undefined;
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={feltId} className="text-[15px] font-semibold">
        {label}
      </label>
      <textarea
        id={feltId}
        aria-invalid={feil ? true : undefined}
        aria-describedby={beskrevet}
        className={cn(feltKlasse(!!feil), 'min-h-[84px] py-3 leading-snug')}
        {...rest}
      />
      {hint && (
        <span id={hintId} className="text-small font-medium text-text-muted">
          {hint}
        </span>
      )}
      {feil && (
        <span id={feilId} className="text-small font-semibold text-error">
          {feil}
        </span>
      )}
    </div>
  );
}
