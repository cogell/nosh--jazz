import { startWorker } from 'jazz-tools/worker';

startWorker({
  accountID: process.env.JAZZ_WORKER_ACCOUNT,
  accountSecret: process.env.JAZZ_WORKER_SECRET,
  // TODO: env var
  syncServer: 'wss://cloud.jazz.tools/?key=cedric.cogell@gmail.com',
  // AccountSchema: Account,
});

async function handleNewRecipe(request: Request) {
  try {
    const body = await request.json();
    const url =
      typeof body === 'object' && body !== null && 'url' in body
        ? (body as { url: string }).url
        : undefined;
    if (typeof url !== 'string') {
      return Response.json(
        { success: false, error: 'Missing or invalid url' },
        { status: 400 },
      );
    }
    console.log('new recipe', url);
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
  fetch(request) {
    const url = new URL(request.url);

    if (url.pathname === '/api/new-recipe' && request.method === 'POST') {
      return handleNewRecipe(request);
    }

    if (url.pathname.startsWith('/api/')) {
      return Response.json({
        name: 'Cloudflare',
      });
    }
    return new Response(null, { status: 404 });
  },
} satisfies ExportedHandler<Env>;
