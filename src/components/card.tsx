import { cn } from '@/lib/utils';

export function Card({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex flex-col gap-2 p-4 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 w-full',
        className,
      )}
    >
      {children}
    </div>
  );
}
