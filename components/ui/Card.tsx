import type { ComponentProps } from 'react';
import { cn } from '@/lib/cn';

export function Card({ className, ...rest }: ComponentProps<'article'>) {
  return <article className={cn('rounded-card border border-border bg-surface', className)} {...rest} />;
}
