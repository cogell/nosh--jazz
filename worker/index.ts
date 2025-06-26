import { startWorker } from 'jazz-tools/worker';
import { Recipe } from '../src/schema';

interface NewRecipeRequest {
  url: string;
  senderId: string;
  recipeId: string;
}

async function handleNewRecipe(request: Request, env: Env) {
  try {
    const body = (await request.json()) as NewRecipeRequest; // TODO: add runtime check
    const { url, senderId, recipeId } = body;
    if (
      typeof url !== 'string' ||
      typeof senderId !== 'string' ||
      typeof recipeId !== 'string'
    ) {
      return Response.json(
        {
          success: false,
          error: 'Missing or invalid url or senderId or recipeId',
        },
        { status: 400 },
      );
    }

    console.log('senderId', senderId, 'recipeId', recipeId);

    // move this to a global variable so we don't have to start it every time?
    const { worker } = await startWorker({
      accountID: env.JAZZ_WORKER_ACCOUNT,
      accountSecret: env.JAZZ_WORKER_SECRET,
      // TODO: env var
      syncServer: 'wss://cloud.jazz.tools/?key=cedric.cogell@gmail.com',
      // crypto: await PureJSCrypto.create(),
      // AccountSchema: Account,
    });
    console.log('worker', worker);
    // const playerAccount = await co.account().load(senderId, { loadAs: worker });
    // console.log('playerAccount', playerAccount);

    // const userAccount = await Account.load(senderId, {
    //   resolve: {
    //     root: true,
    //     profile: true,
    //   },
    //   // loadAs: worker,
    // });
    // console.log('userAccount', userAccount);
    // const ownerGroup = userAccount?.root?.recipes?._owner.castAs(Group);
    // if (ownerGroup) {
    //   ownerGroup.addMember(worker, 'writer');
    // }

    console.log('loading recipe', recipeId);

    const recipe = await Recipe.load('co_z2C4Ktmmip2xqvgpR6Awsxv15JG');
    if (!recipe) {
      console.log('recipe not found');
      return Response.json(
        { success: false, error: 'Recipe not found' },
        { status: 404 },
      );
    }
    console.log('recipe', recipe);
    // const recipeGroup = recipe?._owner.castAs(Group);
    // if (recipeGroup) {
    //   recipeGroup.addMember(worker, 'writer');
    // }
    // console.log('recipeGroup', recipeGroup);

    recipe.title = 'updated from server worker';
    // await recipe.save();

    // console.log('userAccount', userAccount);

    // Here you could add logic to process the URL, e.g., fetch metadata, store in DB, etc.
    return Response.json({ success: true, url });
  } catch (error) {
    return Response.json(
      { success: false, error: 'Invalid request body' },
      { status: 400 },
    );
  }
}

export default {
  fetch(request, env) {
    const url = new URL(request.url);

    if (
      env.JAZZ_WORKER_ACCOUNT === undefined ||
      env.JAZZ_WORKER_SECRET === undefined
    ) {
      return Response.json(
        {
          success: false,
          error: 'JAZZ_WORKER_ACCOUNT or JAZZ_WORKER_SECRET is not set',
        },
        { status: 500 },
      );
    }

    if (url.pathname === '/api/new-recipe' && request.method === 'POST') {
      return handleNewRecipe(request, env);
    }

    if (url.pathname.startsWith('/api/')) {
      return Response.json({
        name: 'Cloudflare',
      });
    }
    return new Response(null, { status: 404 });
  },
} satisfies ExportedHandler<Env>;
