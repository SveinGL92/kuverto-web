import { cn } from '@/lib/cn';

/** Plassholder mens innhold lastes. Animasjonen stoppes ved prefers-reduced-motion. */
export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden="true" className={cn('animate-pulse rounded-card bg-neutral-bg motion-reduce:animate-none', className)} />;
}

export function LoadingState({ tekst = 'Laster' }: { tekst?: string }) {
  return (
    <div role="status" aria-live="polite" className="flex flex-col gap-4">
      <span className="sr-only">{tekst} …</span>
      <Skeleton className="h-[130px] rounded-card" />
      <Skeleton className="h-6 w-1/2 rounded-pill" />
      <Skeleton className="h-10 w-2/3 rounded-pill" />
      <Skeleton className="h-4 w-full rounded-pill" />
      <Skeleton className="h-4 w-5/6 rounded-pill" />
    </div>
  );
}
