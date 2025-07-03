import { co, Group, z } from 'jazz-tools';

export const RECIPE_CURRENT_SCHEMA_VERSION = 1;

export const Recipe = co.map({
  schemaVersion: z.number(),

  url: z.url(), // TODO: pay attention to how this works....
  title: z.optional(z.string()),
  description: z.optional(z.string()),
  firecrawlHtml: z.optional(z.string()),
  ingredients: z.optional(z.array(z.string())),
  instructions: z.optional(z.array(z.string())),
  author: z.optional(z.string()),
  source: z.optional(z.string()),

  tags: z.optional(z.array(z.string())),

  serverWorkerStatus: z.optional(
    z.enum(['ready', 'running', 'success', 'error']),
  ),
  serverWorkerError: z.optional(z.string()),
  serverWorkerProgress: z.optional(z.number()),
});

// const recipeStart = {
//   serverWorkerStatus: 'ready',
//   serverWorkerError: undefined,
//   serverWorkerProgress: 0,
// };

// const recipeSuccess = {
//   serverWorkerStatus: 'success',
//   serverWorkerError: undefined,
//   serverWorkerProgress: 100,
// };

// const recipeError: (error: string) => ({
//   serverWorkerStatus: 'error',
//   serverWorkerError: error,
//   serverWorkerProgress: undefined,
// });

export type Recipe = co.loaded<typeof Recipe>;

export const RecipeList = co.list(Recipe);
export type RecipeList = co.loaded<typeof RecipeList>;

// not sure it needs to be a co.list for our uses...
export const Tags = co.map({
  possibleTags: z.array(z.string()),
  instructions: z.string(),
});
export type Tags = co.loaded<typeof Tags>;
const makeInitialTags = (ownerGroup: Group) =>
  Tags.create(
    {
      possibleTags: ['Dinner', 'Lunch', 'Breakfast', 'Dessert', 'Snack'],
      instructions: `Apply tags to the recipe based on the recipe title, ingredients, instructions, and description. 

If you are debating between applying "Lunch" or "Dinner" tag, choose "Dinner".`,
    },
    ownerGroup,
  );

const ROOT_CURRENT_SCHEMA_VERSION = 1;
export const Root = co.map({
  schemaVersion: z.number(),
  recipes: RecipeList,
  tags: Tags,
});
// .withMigration((root) => {
//   console.log('Root.withMigration running!');
//   console.log('root', root);
//   if (root && root.schemaVersion === undefined) {
//     const ownerGroup = makeOwnerGroup();
//     root.schemaVersion = ROOT_CURRENT_SCHEMA_VERSION;
//     root.recipes = RecipeList.create([], ownerGroup);
//     root.tags = makeInitialTags();
//   }

//   // return root;
// });

const makeInitialRoot = (ownerGroup: Group) =>
  Root.create(
    {
      schemaVersion: ROOT_CURRENT_SCHEMA_VERSION,
      recipes: RecipeList.create([], ownerGroup),
      tags: makeInitialTags(ownerGroup),
    },
    ownerGroup,
  );

export const Profile = co.map({
  name: z.string(),
});
const makeInitialProfile = () =>
  Profile.create({
    name: 'Anon',
  });

const makeOwnerGroup = async () => {
  const serverWorker = await co
    .account()
    .load(import.meta.env.VITE_JAZZ_WORKER_ACCOUNT);
  if (!serverWorker) {
    throw new Error('Server worker not found');
  }
  const ownerGroup = Group.create();
  ownerGroup.addMember(serverWorker, 'writer');
  return ownerGroup;
};

// how can I init account root items with owner group and add server worker as a member?

export const Account = co
  .account({
    root: Root,
    profile: Profile,
  })
  .withMigration(async (acct) => {
    console.log('withMigration running!');
    console.log('acct.root', acct.root);

    // TODO: this doesn't seem to be working...
    if (acct.root && acct.root.schemaVersion === undefined) {
      console.log('acct.root.schemaVersion is undefined');
      const oldRecipes = acct.root?.recipes;
      console.log('oldRecipes', oldRecipes);
      const ownerGroup = await makeOwnerGroup();
      acct.root = makeInitialRoot(ownerGroup);
      if (oldRecipes) {
        console.log('migrating old recipes');
        oldRecipes.forEach((recipe) => {
          acct.root?.recipes?.push(recipe);
        });
      }
    }

    if (acct.root === undefined) {
      console.log('acct.root is undefined');
      const ownerGroup = await makeOwnerGroup();
      acct.root = makeInitialRoot(ownerGroup);
    }
    if (acct.profile === undefined) {
      console.log('acct.profile is undefined');
      acct.profile = makeInitialProfile();
    }
  });

export type Account = co.loaded<typeof Account>;
