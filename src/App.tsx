import { useState } from 'react';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Account, Recipe } from './schema';
import { useAccount } from 'jazz-tools/react';

const useRecipes = () => {
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

function RecipeList() {
  const recipes = useRecipes();

  const handleDeleteRecipe = (recipeId: string) => {
    const index = recipes?.findIndex((recipe) => recipe.id === recipeId);
    if (index !== undefined && index !== -1) {
      recipes?.splice(index, 1);
    }
  };

  return (
    <div>
      {recipes?.map((recipe) => (
        <div key={recipe.id}>
          {recipe.title}
          <Button onClick={() => handleDeleteRecipe(recipe.id)}>Delete</Button>
        </div>
      ))}
    </div>
  );
}

function App() {
  const recipes = useRecipes();
  // console.log(recipes);
  const [url, setUrl] = useState<string>('');

  const handleAddRecipe = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log(url);
    const newRecipe = Recipe.create({
      title: 'fetching...',
      url: url,
      description: '',
    });
    recipes?.push(newRecipe);

    // fire off a call to the server to fetch the recipe
    // don't need to wait for the response, just fire and forget
    await fetch('/api/new-recipe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url: url }),
    });
  };

  return (
    <div className="flex flex-col px-4 items-center justify-center min-h-screen h-full">
      <div className="flex flex-col gap-4 max-w-md w-full p-4 bg-slate-100 rounded-lg">
        <h1 className="text-2xl font-bold">Save Recipes</h1>
        <form className="flex flex-col gap-2" onSubmit={handleAddRecipe}>
          <Input
            type="text"
            placeholder="Recipe URL"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="bg-white"
          />

          <Button type="submit">Add Recipe</Button>
          {/* <Button type="button">Login</Button> */}
        </form>
      </div>
      <div className="flex flex-col gap-4 max-w-md w-full p-4 rounded-lg">
        <RecipeList />
      </div>
    </div>
  );
}

export default App;
