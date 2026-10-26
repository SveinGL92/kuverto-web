'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

/** Modal basert på <dialog>: nettleseren holder fokus inne, Esc lukker, og fokus går tilbake ved lukking. */
export function Dialog({
  apen,
  onLukk,
  label,
  children,
  className,
}: {
  apen: boolean;
  onLukk: () => void;
  label: string;
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (apen && !d.open) d.showModal();
    if (!apen && d.open) d.close();
  }, [apen]);
  return (
    <dialog
      ref={ref}
      aria-label={label}
      onClose={onLukk}
      onClick={(e) => e.target === ref.current && onLukk()}
      className={cn(
        'm-auto w-[calc(100%-32px)] max-w-[560px] overflow-visible bg-transparent p-0 text-text backdrop:bg-[rgba(28,34,16,0.45)]',
        className,
      )}
    >
      <div className="relative max-h-[calc(100dvh-32px)] overflow-y-auto rounded-[28px]">
        <button
          type="button"
          aria-label="Lukk"
          onClick={onLukk}
          className="absolute right-3 top-3 z-10 flex h-11 w-11 items-center justify-center rounded-pill bg-bg text-text"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
        {apen && children}
      </div>
    </dialog>
  );
}
