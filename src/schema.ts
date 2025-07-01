import { co, Group, z } from 'jazz-tools';

export const Recipe = co.map({
  url: z.url(), // TODO: pay attention to how this works....
  title: z.optional(z.string()),
  description: z.optional(z.string()),
  firecrawlHtml: z.optional(z.string()),
  ingredients: z.optional(z.string()),
  instructions: z.optional(z.string()),
  author: z.optional(z.string()),
  source: z.optional(z.string()),

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

export const Root = co.map({
  recipes: RecipeList,
});

export const Profile = co.map({
  name: z.string(),
});

// export const GroupWithServerWorker = co.group({
//   serverWorker: z.string(),
// });

// root + profile
export const Account = co
  .account({
    root: Root,
    profile: Profile,
  })
  // TODO: dont think any of this is happening.......
  .withMigration(async (acct) => {
    console.log('acct', acct);
    console.log('acct.root', acct.root);
    if (acct.root === undefined) {
      const recipesList = RecipeList.create([], { owner: acct });
      const ownerGroup = recipesList._owner.castAs(Group);
      ownerGroup.addMember(acct, 'admin');
      console.log('ownerGroup', ownerGroup);
      console.log('acct', acct);
      console.log('import.meta.env', import.meta.env);
      const workerID = import.meta.env.VITE_JAZZ_WORKER_ACCOUNT || '';
      if (workerID) {
        console.log('workerID', workerID);
        const workerAccount = await co.account().load(workerID);
        console.log('workerAccount', workerAccount);
        if (workerAccount) {
          console.log('adding worker to group', workerAccount);
          ownerGroup.addMember(workerAccount, 'writer');
        }
      }
      // ownerGroup.addMember(process.env.JAZZ_WORKER_ACCOUNT, 'writer');
      // console.log('me', me);

      acct.root = Root.create({
        recipes: recipesList,
      });
    }
    if (acct.profile === undefined) {
      acct.profile = Profile.create({
        name: 'Anon',
      });
    }
    return acct;
  });

export type Account = co.loaded<typeof Account>;
