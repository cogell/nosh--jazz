import { startWorker } from 'jazz-tools/worker';
import { PureJSCrypto } from 'cojson/crypto/PureJSCrypto';
import { Recipe } from '../../src/schema';
import { scrapeUrl, type ScrapeResult } from './scrape-url';

interface NewRecipeRequest {
  url: string;
  senderId: string;
  recipeId: string;
}

export async function handleNewRecipe(request: Request, env: Env) {
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
      // @ts-ignore: https://github.com/garden-co/jazz/blob/fa1b302474d978e1cf8d1ccc7a4f94288626955b/tests/cloudflare-workers/src/index.ts#L30
      crypto: await PureJSCrypto.create(),
    });

    // WHY BLOCKING?
    // the Jazz server is semi-reliable, so we wanna make sure we have the recipe here before doing any hard work
    // TODO: implement a retry mechanism
    const recipe = await Recipe.load(recipeId);
    if (!recipe) {
      console.log('recipe not found');
      return Response.json(
        { success: false, error: 'Recipe not found' },
        { status: 404 },
      );
    }
    // check if we have a cached version of this url
    let scrapeResult: ScrapeResult | null = null;
    const cachedHtml = await env.MY_RECIPES_KV.get(url);
    if (cachedHtml) {
      // TODO: posthog logging
      scrapeResult = { success: true, html: cachedHtml };
    } else {
      scrapeResult = await scrapeUrl(url, env);
    }

    if (!scrapeResult?.success || !scrapeResult?.html) {
      // TODO: posthog logging
      return Response.json(
        { success: false, error: 'Failed to scrape url' },
        { status: 500 },
      );
    }

    const html = scrapeResult.html;
    if (!cachedHtml) {
      await env.MY_RECIPES_KV.put(url, html);
    }

    // const recipe = await recipePromise;
    if (!recipe) {
      console.log('recipe not found');
      return Response.json(
        { success: false, error: 'Recipe not found' },
        { status: 404 },
      );
    }

    recipe.title = 'updated from server worker';
    recipe.firecrawlHtml = html;

    // TODO:
    // do I need to wait for this sync to complete?

    return Response.json({ success: true, url });
  } catch (error) {
    return Response.json(
      { success: false, error: 'Invalid request body' },
      { status: 400 },
    );
  }
}
