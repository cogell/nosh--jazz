import { Account, Recipe, Tags } from '@/schema';

export const postNewRecipe = (
  me: Account,
  url: string,
  recipeId: string,
  tags: Tags,
) => {
  fetch('/api/new-recipe', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      url,
      senderId: me?.id,
      recipeId,
      tags,
    }),
  });
};

export const deleteRecipe = (recipes: Recipe[], recipeId: string) => {
  const index = recipes?.findIndex((recipe) => recipe.id === recipeId);
  if (index !== undefined && index !== -1) {
    recipes?.splice(index, 1);
  }
};
