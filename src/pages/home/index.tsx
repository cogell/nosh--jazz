import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Account, Recipe } from '@/schema';
import { useAccount } from 'jazz-tools/react';
import { co, Group, z } from 'jazz-tools';
import { assign, fromPromise, setup } from 'xstate';
import { useMachine } from '@xstate/react';
import { Link } from 'wouter';

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
  const { me } = useAccount(Account);
  const recipes = useRecipes();

  const handleDeleteRecipe = (recipeId: string) => {
    const index = recipes?.findIndex((recipe) => recipe.id === recipeId);
    if (index !== undefined && index !== -1) {
      recipes?.splice(index, 1);
    }
  };

  const handleRetry = async (recipe: Recipe) => {
    console.log('retry', recipe.id);
    // fire off a call to the server to fetch the recipe
    // don't need to wait for the response, just fire and forget
    await fetch('/api/new-recipe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: recipe.url,
        senderId: me?.id,
        recipeId: recipe.id,
      }),
    });
  };

  return (
    <div>
      {recipes?.map((recipe) => (
        <div key={recipe.id}>
          <Link to={`/recipes/${recipe.id}`}>{recipe.title || recipe.url}</Link>

          <Button onClick={() => handleRetry(recipe)}>Retry</Button>
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

const UrlSchema = z.url();
type Url = z.infer<typeof UrlSchema>;

interface Context {
  url: Url;
  urlError: string | null;
  // me: Account | null;
  serverWorker: ReturnType<typeof co.account> | null;
  serverWorkerError: string | null;
  // recipes: Recipe[];
}

const initialContext: Context = {
  url: '',
  urlError: null,
  // recipes: [],
  serverWorker: null,
  serverWorkerError: null,
};

// these DON'T describe every way the context can be updated
// these DO describe every event that can come from UI
type Event =
  | {
      type: 'update-url';
      value: string;
    }
  | {
      type: 'submit';
    };

// #effect: prefer we used Effect to ensure we were catching all possible errors
const fetchWorkerAccount = fromPromise<
  ReturnType<typeof co.account> | string,
  void
>(async () => {
  // await new Promise((resolve) => setTimeout(resolve, 10000));
  const worker = await co
    .account()
    .load(import.meta.env.VITE_JAZZ_WORKER_ACCOUNT);
  return worker;
});

// for testing
// const fetchWorkerAccountThrow = fromPromise<
//   ReturnType<typeof co.account> | string,
//   void
// >(async () => {
//   throw new Error('test');
// });

const machine = setup({
  types: {
    context: {} as Context,
    events: {} as Event,
  },
  actors: {
    fetchWorkerAccount,
    // fetchWorkerAccount: fetchWorkerAccountThrow, // for testing
  },

  actions: {
    assignUrl: assign({
      url: ({ context, event }) =>
        event.type === 'update-url' ? event.value : context.url,
    }),
    assignValidationError: assign({
      // smelly
      urlError: ({ context }) => {
        if (UrlSchema.safeParse(context.url).success) {
          return null;
        } else {
          if (context.url === '') {
            return 'URL is required';
          }
          return 'URL is invalid';
        }
      },
    }),
    onSubmit: () => {},
    afterSubmit: assign({
      url: '',
      urlError: null,
    }),
    assignServerWorkerLoading: assign({
      serverWorkerError: ({ context }) => {
        if (
          context.serverWorkerError === null &&
          context.serverWorker === null
        ) {
          return 'Waiting for server worker to load...';
        }
        return context.serverWorkerError;
      },
    }),
  },
  guards: {
    isContextValid: ({ context }) =>
      context.serverWorker !== null && UrlSchema.safeParse(context.url).success,
  },
}).createMachine({
  context: initialContext,
  initial: 'All',
  states: {
    All: {
      initial: 'Editing',
      invoke: {
        id: 'fetchWorkerAccount',
        src: 'fetchWorkerAccount',
        onDone: {
          actions: assign({
            serverWorker: ({ event }) => event.output,
            serverWorkerError: null,
          }),
        },
        onError: {
          target: '.Error',
          actions: assign({
            serverWorkerError: ({ event }) => {
              console.log('serverWorkerError', event.error);
              return 'Server worker error';
            },
          }),
        },
      },
      on: {
        submit: [
          {
            // is url valid AND worker loaded?
            guard: 'isContextValid',
            actions: ['onSubmit', 'afterSubmit'],
          },
          {
            // if guard fails, move to dirty state and assign error
            target: '.Error',
            actions: ['assignValidationError', 'assignServerWorkerLoading'],
          },
        ],
      },
      states: {
        // until submit, we don't validate the url
        Editing: {
          on: {
            'update-url': {
              actions: ['assignUrl'],
            },
          },
        },
        // once we are in the dirty state, we validate on every update-url event
        Error: {
          on: {
            'update-url': {
              actions: ['assignUrl', 'assignValidationError'],
            },
          },
        },
      },
    },
  },
});

function AddRecipeForm() {
  const { me } = useAccount(Account);
  const recipes = useRecipes();
  const [snapshot, send] = useMachine(
    machine.provide({
      actions: {
        onSubmit: ({ context }) => {
          console.log('onSubmit', context);
          const ownerGroup = Group.create();
          ownerGroup.addMember(context.serverWorker, 'writer');
          const newRecipe = Recipe.create(
            {
              url: context.url,
            },
            ownerGroup,
          );
          recipes?.push(newRecipe);

          fetch('/api/new-recipe', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              url: snapshot.context.url,
              senderId: me?.id,
              recipeId: newRecipe.id,
            }),
          });
        },
      },
    }),
  );

  return (
    <div className="flex flex-col gap-4 max-w-md w-full h-full p-4 bg-slate-100 rounded-lg">
      <h1 className="text-2xl font-bold">Save Recipes</h1>
      <form
        className="flex flex-col gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          send({ type: 'submit' });
        }}
      >
        <Input
          type="text"
          placeholder="Recipe URL"
          value={snapshot.context.url}
          onChange={(e) => send({ type: 'update-url', value: e.target.value })}
          className="bg-white"
        />
        {snapshot.context.urlError && (
          <p className="text-red-500">{snapshot.context.urlError}</p>
        )}
        {snapshot.context.serverWorkerError && (
          <p className="text-red-500">{snapshot.context.serverWorkerError}</p>
        )}

        <Button type="submit">Add Recipe</Button>
      </form>
    </div>
  );
}

function HomePage() {
  return (
    <div className="flex flex-col items-center w-full">
      {/* <AuthButton /> */}
      <AddRecipeForm />
      <div className="flex flex-col gap-4 max-w-md w-full p-4 rounded-lg">
        <RecipeList />
      </div>
      {import.meta.env.DEV && (
        <div className="flex flex-col gap-4 max-w-md w-full p-4 rounded-lg">
          <ResetButton />
        </div>
      )}
    </div>
  );
}

export default HomePage;
