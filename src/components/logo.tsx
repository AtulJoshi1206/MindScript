import { cn } from '@/lib/utils';

const BrainLeafIcon = ({ className }: { className?: string }) => (
  <svg
    className={cn('h-8 w-8 text-primary', className)}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 2a4.5 4.5 0 0 0-4.5 4.5c0 1.63.85 3.09 2.13 3.88" />
    <path d="M12 2a4.5 4.5 0 0 1 4.5 4.5c0 1.63-.85 3.09-2.13 3.88" />
    <path d="M12 22c-2 0-4.5-2-4.5-5.5S9.5 11 12 11s4.5 2 4.5 5.5S14 22 12 22z" />
    <path d="M15.87 10.38A4.5 4.5 0 0 0 12 6.5a4.5 4.5 0 0 0-3.87 3.88" />
    <path d="M9.87 10.38A4.5 4.5 0 0 1 12 6.5a4.5 4.5 0 0 1 2.13 3.88" />
    <path d="M12 11v11" />
    <path d="M12 6.5V2" />
    <path d="m14.5 4.5-.39 2.37" />
    <path d="m9.5 4.5.39 2.37" />
    <path d="M18 7.5h-1" />
    <path d="M7 7.5H6" />
    <path d="M17.13 10.38c.38-.63.63-1.35.63-2.13 0-2.49-2.01-4.5-4.5-4.5" />
    <path d="M6.24 8.25c.01-.8.26-1.5.63-2.13 1.1-1.83 3.25-3.12 5.13-3.12" />
  </svg>
);


export function Logo({ withText = true }: { withText?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <div className="rounded-full bg-primary/10 p-2">
        <BrainLeafIcon className="h-6 w-6 text-primary" />
      </div>
      {withText && (
        <span className="font-headline text-2xl font-bold tracking-wider text-foreground">
          MindScript
        </span>
      )}
    </div>
  );
}
