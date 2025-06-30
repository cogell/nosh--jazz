import FirecrawlApp from '@mendable/firecrawl-js';

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

/**
 * Scrapes the given URL using FirecrawlApp and returns the result.
 * Falls back to a failure result if any step errors.
 */
export async function scrapeUrl(url: string, env: Env): Promise<ScrapeResult> {
  let app: FirecrawlApp;

  // Initialize the FirecrawlApp
  try {
    app = new FirecrawlApp({ apiKey: env.FIRECRAWL_API_KEY });
  } catch (error) {
    console.error('Failed to initialize FirecrawlApp', error);
    return { html: null, success: false };
  }

  // Perform the scraping operation
  try {
    const scrapeResponse = await app.scrapeUrl(url, {
      formats: ['html'],
      maxAge: 7 * 24 * 60 * 60, // 1 week in seconds
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
