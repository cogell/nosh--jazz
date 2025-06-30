import { handleNewRecipe } from './new-recipe';

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
