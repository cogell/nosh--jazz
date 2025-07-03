import { Badge } from '@/components/ui/badge';
import DevStuff from './dev-stuff';
import { H1, H2, P } from '@/components/ui/typography';
import { useSafeCoState } from '@/lib/use-safe-co-state';
import { Recipe } from '@/schema';
import { useCoState } from 'jazz-tools/react';
import { Link, useRoute } from 'wouter';

const IngredientList = ({ ingredients }: { ingredients: string[] }) => {
  return (
    <div className="flex flex-col gap-2">
      <H2>Ingredients</H2>
      <ul className="list-disc list-inside space-y-2">
        {ingredients.map((ingredient) => (
          <li key={ingredient}>{ingredient}</li>
        ))}
      </ul>
    </div>
  );
};

const InstructionList = ({ instructions }: { instructions: string[] }) => {
  return (
    <div className="flex flex-col gap-2">
      <H2>Instructions</H2>
      <ol className="list-decimal list-inside space-y-2">
        {instructions.map((instruction) => (
          <li key={instruction}>{instruction}</li>
        ))}
      </ol>
    </div>
  );
};

export default function RecipePage() {
  const [, params] = useRoute('/recipes/:id');
  const recipe = useSafeCoState(Recipe, params?.id);

  console.log('recipe', recipe);

  if (!recipe) {
    if (recipe === undefined) {
      return <div>Loading...</div>;
    }
    return <div>Recipe not found</div>;
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4 pt-8">
      <H1>{recipe?.title || recipe?.url.toString()}</H1>
      <div className="flex flex-row gap-2">
        {recipe?.tags?.map((tag) => (
          <Badge key={tag} variant="secondary">
            {tag}
          </Badge>
        ))}
      </div>
      {/* <div>{recipe?.firecrawlHtml}</div> */}
      <IngredientList ingredients={recipe?.ingredients || []} />
      <InstructionList instructions={recipe?.instructions || []} />

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

      <DevStuff recipe={recipe} />
    </div>
  );
}
