import { Account, Recipe } from '@/schema';

export const postNewRecipe = (
  me: Account | undefined | null,
  url: string,
  recipeId: string,
) => {
  if (!me) {
    throw new Error('No account found');
  }

  fetch('/api/new-recipe', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      url,
      senderId: me?.id,
      recipeId,
    }),
  });
};

export const deleteRecipe = (recipes: Recipe[], recipeId: string) => {
  const index = recipes?.findIndex((recipe) => recipe.id === recipeId);
  if (index !== undefined && index !== -1) {
    recipes?.splice(index, 1);
  }
};
