import DevOnly from '@/components/dev-only';
import { Button } from '@/components/ui/button';
import { H1, H2, P } from '@/components/ui/typography';
import { deleteRecipe, postNewRecipe } from '@/lib/recipe';
import { useRecipes } from '@/lib/selectors';
import { Account, Recipe } from '@/schema';
import { useAccount, useCoState } from 'jazz-tools/react';
import { Link, useRoute, useLocation } from 'wouter';

export default function RecipePage() {
  const { me } = useAccount(Account);
  const recipes = useRecipes();
  const [, params] = useRoute('/recipes/:id');
  const recipe = useCoState(Recipe, params?.id);
  const [, setLocation] = useLocation();

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

      <DevOnly>
        <Button
          onClick={() => postNewRecipe(me, recipe.url.toString(), recipe.id)}
        >
          Retry Server Worker
        </Button>
        <div className="flex flex-col gap-0">
          <div>Server Worker</div>
          <div className="pl-4 text-muted-foreground">
            <div>Status: {recipe.serverWorkerStatus}</div>
            <div>Error: {recipe.serverWorkerError}</div>
            <div>Progress: {recipe.serverWorkerProgress?.toFixed(0)}%</div>
          </div>
        </div>
        <div>
          <details className="border rounded p-2">
            <summary className="cursor-pointer font-medium">
              Show Full HTML
            </summary>
            <pre className="mt-2 text-xs overflow-auto max-h-96 max-w-full bg-muted p-2 rounded">
              {recipe.firecrawlHtml || 'No HTML available'}
            </pre>
          </details>
        </div>
        <Button
          onClick={() => {
            deleteRecipe(recipes || [], recipe.id);
            setLocation('/');
          }}
          variant="destructive"
        >
          Delete Recipe
        </Button>
      </DevOnly>
    </div>
  );
}
