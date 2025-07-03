import { CallbackHandler } from 'langfuse-langchain';
import { ConfigProvider, Data, Effect, Layer, ManagedRuntime } from 'effect';

import { Account, Recipe, Tags } from '../../src/schema';
import { scrapeUrl, type ScrapeResult } from './scrape-url';
import { createRecipeDataNode } from './get-recipe-data';
import { createApplyTagsNode } from './apply-tags';
import { startJazzWorker } from '../_lib/start-jazz-worker';
import { z } from 'jazz-tools';
// import { Langfuse } from 'langfuse';

const NewRecipeRequest = z.object({
  url: z.string(),
  senderId: z.string(),
  recipeId: z.string(),
  tagsId: z.string(),
});

export async function handleNewRecipe(request: Request, env: Env) {
  try {
    const body = NewRecipeRequest.safeParse(await request.json());
    if (!body.success) {
      const error = body.error.message;
      return Response.json({ success: false, error }, { status: 400 });
    }

    const { url, senderId, recipeId, tagsId } = body.data;

    console.log('senderId', senderId, 'recipeId', recipeId, 'tagsId', tagsId);

    // const account = await co.account().load(senderId, {
    //   resolve: {
    //     root: {
    //       tags: {
    //         $each: true,
    //       },
    //     },
    //   },
    // });

    // console.log('account.root.tags', account.root?.tags);

    // const langfuse = new Langfuse({
    //   publicKey: env.LANGFUSE_PUBLIC_KEY,
    //   secretKey: env.LANGFUSE_SECRET_KEY,
    //   baseUrl: env.LANGFUSE_BASEURL,
    // });

    // const root = langfuse.trace({ name: 'new-recipe' });

    // can I add a Logger layer to our worker runtime?
    // - [ ] what about for langfuse? dunno.
    // set log level from config - https://effect.website/docs/observability/logging/#loading-the-log-level-from-configuration

    const LiveConfigProvider = ConfigProvider.fromJson(env);
    // const BadConfigProvider = ConfigProvider.fromJson({
    //   JAZZ_WORKER_ACCOUNT: '123',
    //   JAZZ_WORKER_SECRET: '123',
    //   JAZZ_WORKER_SYNC_SERVER: '123',
    // });

    const ConfigProviderLayer = Layer.setConfigProvider(LiveConfigProvider);
    const WorkerRuntime = ManagedRuntime.make(ConfigProviderLayer);

    const jazzWorker = await WorkerRuntime.runPromise(
      startJazzWorker().pipe(Effect.catchAllCause(Effect.logError)),
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

    const tags = await Tags.load(tagsId);
    if (!tags) {
      recipe.serverWorkerStatus = 'error';
      recipe.serverWorkerError =
        'Failed to load tags - cedric has been notified';
      return Response.json(
        { success: false, error: 'Failed to load tags' },
        { status: 500 },
      );
    }

    const recipeTags = await createApplyTagsNode({ env, lfHandler })({
      tagInstructions: tags.instructions,
      possibleTags: tags.possibleTags,
      recipeTitle: recipeData.title,
      recipeIngredients: recipeData.ingredients,
      recipeInstructions: recipeData.instructions,
      recipeDescription: recipeData.description,
    });

    recipe.serverWorkerStatus = 'success';
    recipe.serverWorkerProgress = 100;
    recipe.serverWorkerError = undefined;

    recipe.title = recipeData.title;
    recipe.ingredients = recipeData.ingredients;
    recipe.instructions = recipeData.instructions;
    recipe.description = recipeData.description;
    recipe.author = recipeData.author;
    recipe.source = recipeData.source;
    recipe.tags = recipeTags.tags;

    // TODO:
    // do I need to wait for this sync to complete?

    return Response.json({ success: true, url });
  } catch (error) {
    console.error('error', error);
    return Response.json(
      { success: false, error: 'Invalid request body' },
      { status: 400 },
    );
  }
}
