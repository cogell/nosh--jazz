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
export const Tags = co.list(z.string());
export type Tags = co.loaded<typeof Tags>;
const makeInitialTags = (ownerGroup: Group) =>
  Tags.create(['Dinner', 'Lunch', 'Breakfast', 'Dessert', 'Snack'], ownerGroup);

const ROOT_CURRENT_SCHEMA_VERSION = 1;
export const Root = co.map({
  schemaVersion: z.number(),
  recipes: RecipeList,
  tags: Tags,
});
const makeInitialRoot = (ownerGroup: Group) =>
  Root.create({
    schemaVersion: ROOT_CURRENT_SCHEMA_VERSION,
    recipes: RecipeList.create([], ownerGroup),
    tags: makeInitialTags(ownerGroup),
  });

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

export const Account = co
  .account({
    root: Root,
    profile: Profile,
  })
  .withMigration(async (acct) => {
    console.log('withMigration running!');

    if (acct.root === undefined) {
      const ownerGroup = await makeOwnerGroup();
      acct.root = makeInitialRoot(ownerGroup);
    }
    if (acct.profile === undefined) {
      acct.profile = makeInitialProfile();
    }

    return acct;
  });

export type Account = co.loaded<typeof Account>;
