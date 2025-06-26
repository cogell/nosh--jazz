import { useState } from 'react';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Account, Recipe } from './schema';
import { useAccount, clearAccount } from 'jazz-tools/react';
import { AuthButton } from './components/auth-button';
import { co, Group } from 'jazz-tools';

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

function ResetButton() {
  const { logOut } = useAccount(Account);
  const handleReset = async () => {
    await logOut();
    window.location.reload();
  };
  return <Button onClick={handleReset}>Reset</Button>;
}

function App() {
  const { me } = useAccount(Account);
  const recipes = useRecipes();
  // console.log(recipes);
  const [url, setUrl] = useState<string>('');

  const handleAddRecipe = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log(url);
    if (!me) {
      console.log('no me');
      return;
    }
    const newRecipe = Recipe.create(
      {
        title: 'fetching...',
        url: url,
        description: '',
      },
      { owner: me },
    );
    const recipeGroup = newRecipe._owner.castAs(Group);
    recipeGroup.addMember(me, 'admin');
    const worker = await co
      .account()
      .load(import.meta.env.VITE_JAZZ_WORKER_ACCOUNT);
    if (worker) {
      console.log('adding worker to group', worker);
      recipeGroup.addMember(worker, 'writer');
    }
    recipes?.push(newRecipe);

    // fire off a call to the server to fetch the recipe
    // don't need to wait for the response, just fire and forget
    await fetch('/api/new-recipe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: url,
        senderId: me?.id,
        recipeId: newRecipe.id,
      }),
    });
  };

  return (
    <div className="flex flex-col px-4  min-h-screen h-full">
      <AuthButton />
      <div className="flex flex-col gap-4 max-w-md w-full h-full p-4 bg-slate-100 rounded-lg">
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
      <div className="flex flex-col gap-4 max-w-md w-full p-4 rounded-lg">
        <ResetButton />
      </div>
    </div>
  );
}

export default App;
