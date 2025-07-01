import { Card } from '@/components/card';
import { H3, Muted } from '@/components/ui/typography';
import type { Recipe } from '@/schema';
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
    <div className="flex flex-row gap-1 justify-end w-full opacity-50">
      <Muted>{toDisplay}</Muted>
    </div>
  );
};

export function RecipeCard({ recipe }: { recipe: Recipe }) {
  const titleToDisplay = recipe.title || recipe.url.toString();
  return (
    <Link to={`/recipes/${recipe.id}`}>
      <Card className="hover:bg-slate-100">
        <H3 className="text-base">{titleToDisplay}</H3>
        <span className="text-sm text-muted-foreground">
          {recipe.description}
        </span>
        <AuthorSource author={recipe.author} source={recipe.source} />
      </Card>
    </Link>
  );
}
