import { co, z } from 'jazz-tools';

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

// root + profile
export const Account = co
  .account({
    root: Root,
    profile: Profile,
  })
  .withMigration((acct) => {
    if (acct.root === undefined) {
      acct.root = Root.create({
        recipes: RecipeList.create(
          [],
          // owner: acct, // FIXME: do I need this? might want to update owner to a group that includes server worker id?
        ),
      });
    }
    if (acct.profile === undefined) {
      acct.profile = Profile.create({
        name: 'Anon',
      });
    }
    return acct;
  });
