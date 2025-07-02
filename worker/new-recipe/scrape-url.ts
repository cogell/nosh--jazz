import FirecrawlApp from '@mendable/firecrawl-js';
import { Data, Effect } from 'effect';

export interface ScrapeResult {
  html: string | null;
  success: boolean;
}

// Define a custom error type for scraping failures
export class ScrapingError extends Error {
  readonly _tag = 'ScrapingError';

  constructor(message: string, public cause?: unknown) {
    super(message);
    this.name = 'ScrapingError';
  }
}

class FirecrawlInitError extends Data.TaggedError('FirecrawlInitError')<{
  cause: unknown;
}> {}

function initFirecrawl(env: Env) {
  return Effect.tryPromise({
    try: async () => new FirecrawlApp({ apiKey: env.FIRECRAWL_API_KEY }),
    catch: (error) => new FirecrawlInitError({ cause: error }),
  });
}

/**
 * Scrapes the given URL using FirecrawlApp and returns the result.
 * Falls back to a failure result if any step errors.
 */
export async function scrapeUrl(url: string, env: Env): Promise<ScrapeResult> {
  // let app: FirecrawlApp;

  const app = await Effect.runPromise(
    initFirecrawl(env).pipe(
      Effect.catchTags({
        FirecrawlInitError: (error) => {
          console.error('Failed to initialize FirecrawlApp', error);
          return Effect.succeed(null);
        },
      }),
    ),
  );

  if (!app) {
    return { html: null, success: false };
  }

  // Perform the scraping operation
  try {
    const scrapeResponse = await app.scrapeUrl(url, {
      formats: ['html'],
      maxAge: 7 * 24 * 60 * 60, // 1 week in seconds
      proxy: 'auto',
    });
    console.log('firecrawlResponse', scrapeResponse);

    if (scrapeResponse.success && scrapeResponse.html) {
      return { html: scrapeResponse.html, success: true };
    }

    return { html: null, success: false };
  } catch (error) {
    console.error('Error scraping URL with Firecrawl:', error);
    return { html: null, success: false };
  }
}

// Alias for backward compatibility
export const scrapeUrlPromise = scrapeUrl;
