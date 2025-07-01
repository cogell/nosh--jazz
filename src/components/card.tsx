import { cn } from '@/lib/utils';

export const CARD_PADDING_CLASS = 'p-4';
// const CARD_PADDING_CLASS = `p-${CARD_PADDING_VALUE}`;
// WTF: this wouldn't work?!
// const CARD_NEGATIVE_MARGIN_CLASS = `-m-${CARD_PADDING_VALUE}`;

export function Card({
  children,
  className,
  style,
  noPadding,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  noPadding?: boolean;
}) {
  return (
    <div
      className={cn(
        'flex flex-col gap-2 rounded-lg border border-slate-200 bg-slate-50 w-full',
        noPadding ? '' : CARD_PADDING_CLASS,
        className,
      )}
      style={style}
    >
      {children}
    </div>
  );
}

// EdgeToEdge removes the card padding from its parent and allows its children to render edge-to-edge
// The negative margins match the card's padding on both axes
// export function EdgeToEdge({
//   children,
//   className,
// }: {
//   children: React.ReactNode;
//   className?: string;
// }) {
//   return <div className={cn('-p-4', className)}>{children}</div>;
// }
