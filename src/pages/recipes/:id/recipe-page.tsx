import { H1, H2, P } from '@/components/ui/typography';
import { Recipe } from '@/schema';
import { useCoState } from 'jazz-tools/react';
import { Link, useRoute } from 'wouter';

export default function RecipePage() {
  const [, params] = useRoute('/recipes/:id');
  const recipe = useCoState(Recipe, params?.id);

  if (!recipe) {
    if (recipe === undefined) {
      return <div>Loading...</div>;
    }
    return <div>Recipe not found</div>;
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4 pt-8">
      <H1>{recipe?.title || recipe?.url.toString()}</H1>
      {/* <div>{recipe?.firecrawlHtml}</div> */}
      <div className="flex flex-col gap-2">
        <H2>Ingredients</H2>
        <div>{recipe?.ingredients}</div>
      </div>
      <div className="flex flex-col gap-2">
        <H2>Instructions</H2>
        <div>{recipe?.instructions}</div>
      </div>

      <P>{recipe?.description}</P>
      <P>{recipe?.author}</P>
      <P>{recipe?.source}</P>

      <a
        href={recipe.url.toString()}
        className="text-sm hover:underline text-blue-500"
        target="_blank"
      >
        View original recipe
      </a>

      <Link to="/" className="text-sm text-muted-foreground hover:underline">
        Back to recipes
      </Link>
    </div>
  );
}
