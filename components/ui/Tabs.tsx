'use client';

import { useRef, type KeyboardEvent } from 'react';
import { cn } from '@/lib/cn';

export interface Fane {
  id: string;
  navn: string;
  antall?: number | string;
}

/** Faner med piltaster, som i WAI-ARIA-mønsteret. Panelene må ha id `${id}-panel`. */
export function Tabs({
  faner,
  aktiv,
  onVelg,
  label,
  className,
  tone = 'lys',
}: {
  faner: Fane[];
  aktiv: string;
  onVelg: (id: string) => void;
  label: string;
  className?: string;
  tone?: 'lys' | 'panel';
}) {
  const ref = useRef<(HTMLButtonElement | null)[]>([]);
  const tast = (e: KeyboardEvent, i: number) => {
    const n = e.key === 'ArrowRight' ? i + 1 : e.key === 'ArrowLeft' ? i - 1 : null;
    if (n === null) return;
    e.preventDefault();
    const neste = (n + faner.length) % faner.length;
    onVelg(faner[neste].id);
    ref.current[neste]?.focus();
  };
  return (
    <div role="tablist" aria-label={label} className={cn('flex gap-6', tone === 'lys' && 'border-b border-border', className)}>
      {faner.map((f, i) => {
        const valgt = f.id === aktiv;
        return (
          <button
            key={f.id}
            ref={(el) => {
              ref.current[i] = el;
            }}
            type="button"
            role="tab"
            id={`${f.id}-fane`}
            aria-selected={valgt}
            aria-controls={`${f.id}-panel`}
            tabIndex={valgt ? 0 : -1}
            onClick={() => onVelg(f.id)}
            onKeyDown={(e) => tast(e, i)}
            className={cn(
              'min-h-12 whitespace-nowrap border-b-[3px] text-base',
              tone === 'lys'
                ? valgt
                  ? 'border-primary font-bold text-text'
                  : 'border-transparent font-semibold text-text-muted hover:text-text'
                : valgt
                  ? 'border-accent font-bold text-panel-on'
                  : 'border-transparent font-semibold text-panel-on-muted hover:text-panel-on',
            )}
          >
            {f.navn}
            {f.antall !== undefined && (
              <span className={cn('ml-1.5 font-semibold', tone === 'lys' ? 'text-text-muted' : 'text-panel-on-muted')}>{f.antall}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
