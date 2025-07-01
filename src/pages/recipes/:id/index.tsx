import { Recipe } from '@/schema';
import { useCoState } from 'jazz-tools/react';
import { useRoute } from 'wouter';

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
    <div>
      <h1>{recipe?.title}</h1>
      <div>{recipe?.firecrawlHtml}</div>
    </div>
  );
}
