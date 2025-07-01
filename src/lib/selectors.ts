import { useAccount } from 'jazz-tools/react';
import { useCoState } from 'jazz-tools/react';
import { Account, Recipe } from '../schema';

export const useRecipes = () => {
  const { me } = useAccount(Account, {
    resolve: {
      root: {
        recipes: {
          $each: true,
        },
      },
    },
  });
  return me?.root.recipes;
};

export const useRecipe = (id: string) => {
  return useCoState(Recipe, id);
};
