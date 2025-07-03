import { Card, CARD_PADDING_CLASS } from '@/components/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { H3, Muted } from '@/components/ui/typography';
import { cn } from '@/lib/utils';
import type { Recipe } from '@/schema';
import { motion } from 'motion/react';
import { useRef, useLayoutEffect } from 'react';
import { Link } from 'wouter';

const AuthorSource = ({
  author,
  source,
}: {
  author: string | undefined;
  source: string | undefined;
}) => {
  if (!author && !source) {
    return null;
  }

  const toDisplay = [author, source].filter(Boolean).join(' • ');

  return (
    <div className="flex flex-row gap-1 justify-end opacity-50">
      <Muted>{toDisplay}</Muted>
    </div>
  );
};

const ProgressBar = ({
  progress,
  isRunning,
}: {
  progress: number | undefined;
  isRunning: boolean;
}) => {
  const progressAmount = progress ?? 0;
  const heightRef = useRef<number | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (contentRef.current) {
      heightRef.current = contentRef.current.getBoundingClientRect().height;
    }
  }, [isRunning]);

  return (
    <motion.div
      key="panel"
      initial={{ height: 0, opacity: 0 }}
      animate={{
        height: isRunning
          ? heightRef.current !== null
            ? heightRef.current
            : 'auto'
          : 0,
        opacity: isRunning ? 1 : 0,
      }}
      style={{ overflow: 'hidden', willChange: 'height, opacity' }}
      transition={{
        height: { duration: 0.3, ease: 'easeInOut' },
        opacity: { duration: 0.3, ease: 'easeInOut' },
      }}
    >
      <div
        ref={contentRef}
        className="flex flex-col gap-0 px-4 py-2 rounded-tl-lg rounded-tr-lg border-b border-slate-200 bg-slate-100"
      >
        <span className="text-sm">Reading thru the recipe</span>
        <div className="flex flex-row items-center gap-2">
          <Progress value={progressAmount} />
          <span className="text-sm text-muted-foreground">
            {progressAmount.toFixed(0)}%
          </span>
        </div>
        <span className="text-sm text-muted-foreground">
          This can take ~30 seconds. You can close this window and come back
          later.
        </span>
      </div>
    </motion.div>
  );
};

const ErrorBar = ({
  isErrorStatus,
  error,
}: {
  isErrorStatus: boolean;
  error: string | undefined;
}) => {
  if (!isErrorStatus) {
    return null;
  }

  return (
    <div className="flex flex-col gap-0 px-4 py-2 rounded-tl-lg rounded-tr-lg border-b border-slate-100 bg-red-50 h-full">
      <span className="text-sm italic">{error}</span>
    </div>
  );
};

export function RecipeCard({ recipe }: { recipe: Recipe }) {
  const titleToDisplay = recipe.title || recipe.url.toString();
  const isErrorStatus = recipe.serverWorkerStatus === 'error';

  return (
    <Link to={`/recipes/${recipe.id}`}>
      <Card className="hover:bg-slate-100 bg-white" noPadding>
        {recipe.serverWorkerStatus === 'running' && (
          <ProgressBar
            progress={recipe.serverWorkerProgress}
            isRunning={recipe.serverWorkerStatus === 'running'}
          />
        )}

        <ErrorBar
          isErrorStatus={isErrorStatus}
          error={recipe.serverWorkerError}
        />

        <div
          className={cn(
            'flex flex-col gap-4',
            CARD_PADDING_CLASS,
            isErrorStatus ? 'opacity-50' : '',
          )}
        >
          <div className="flex flex-col gap-0">
            <H3 className="text-base">{titleToDisplay}</H3>
            <span className="text-sm text-muted-foreground">
              {recipe.description || 'No description'}
            </span>
          </div>
          <div className="flex flex-row gap-2 items-end">
            <div className="flex-1 flex flex-row gap-2 flex-wrap">
              {recipe.tags?.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
            <AuthorSource author={recipe.author} source={recipe.source} />
          </div>
        </div>
      </Card>
    </Link>
  );
}
