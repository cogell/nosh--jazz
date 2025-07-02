import { CallbackHandler } from 'langfuse-langchain';
import { ConfigProvider, Data, Effect } from 'effect';

import { Recipe } from '../../src/schema';
import { scrapeUrl, type ScrapeResult } from './scrape-url';
import { createRecipeDataNode } from './get-recipe-data';
import { startJazzWorker } from '../_lib/start-jazz-worker';
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

    const jazzWorker = await Effect.runPromise(
      Effect.withConfigProvider(
        startJazzWorker().pipe(
          Effect.catchTags({
            JazzWorkerStartError: (error) => {
              console.error('Failed to start Jazz worker', error);
              return Effect.succeed(null);
            },
            JazzWorkerCryptoError: (error) => {
              console.error('Failed to create crypto', error);
              return Effect.succeed(null);
            },
          }),
        ),
        ConfigProvider.fromJson(env),
      ),
    );

    if (!jazzWorker) {
      return Response.json(
        { success: false, error: 'Failed to start Jazz worker' },
        { status: 500 },
      );
    }

    // WHY BLOCKING?
    // the Jazz server is semi-reliable, so we wanna make sure we have the recipe here before doing any hard work
    // TODO: implement a retry mechanism?
    // TODO: recipe is not insured to be correctly shaped
    const recipe = await Recipe.load(recipeId);
    if (!recipe) {
      console.log('recipe not found');
      return Response.json(
        { success: false, error: 'Recipe not found' },
        { status: 404 },
      );
    }

    recipe.serverWorkerStatus = 'running';
    recipe.serverWorkerProgress = 0;
    recipe.serverWorkerError = undefined;

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
      recipe.serverWorkerStatus = 'error';
      recipe.serverWorkerError =
        'Failed to scrape url html - cedric has been notified';
      return Response.json(
        { success: false, error: 'Failed to scrape url' },
        { status: 500 },
      );
    }

    const html = scrapeResult.html;
    if (!cachedHtml) {
      await env.MY_RECIPES_KV.put(url, html);
    }

    recipe.firecrawlHtml = html;

    const lfHandler = new CallbackHandler({
      publicKey: env.LANGFUSE_PUBLIC_KEY,
      secretKey: env.LANGFUSE_SECRET_KEY,
      baseUrl: env.LANGFUSE_BASEURL,
    });

    const recipeData = await createRecipeDataNode({ env, lfHandler })({
      htmlContent: html,
    });

    if (!recipeData.title) {
      recipe.serverWorkerStatus = 'error';
      recipe.serverWorkerError =
        'Failed to read the recipe from the html - cedric has been notified';
      return Response.json(
        { success: false, error: 'Failed to get recipe data' },
        { status: 500 },
      );
    }

    recipe.serverWorkerStatus = 'success';
    recipe.serverWorkerProgress = 100;
    recipe.serverWorkerError = undefined;

    recipe.title = recipeData.title;
    recipe.ingredients = recipeData.ingredients;
    recipe.instructions = recipeData.instructions;
    recipe.description = recipeData.description;
    recipe.author = recipeData.author;
    recipe.source = recipeData.source;

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
