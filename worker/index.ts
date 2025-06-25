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
