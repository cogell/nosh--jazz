import { co, Group, z } from 'jazz-tools';

export const Recipe = co.map({
  url: z.url(), // FIXME: pay attention to how this works....
  title: z.string(),
  description: z.string(),
});

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
