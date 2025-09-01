/**
 * Error handling utilities for sitemap generation
 */

export enum SitemapErrorType {
  GENERATION_FAILED = 'GENERATION_FAILED',
  CACHE_ERROR = 'CACHE_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  INVALID_REQUEST = 'INVALID_REQUEST',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  CONFIGURATION_ERROR = 'CONFIGURATION_ERROR'
}

export class SitemapError extends Error {
  constructor(
    public type: SitemapErrorType,
    message: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'SitemapError';
  }
}

/**
 * Wrap async operations with timeout handling
 */
export const withTimeout = async <T>(
  operation: Promise<T>,
  timeoutMs: number,
  errorMessage: string = 'Operation timed out'
): Promise<T> => {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new SitemapError(
        SitemapErrorType.TIMEOUT_ERROR,
        errorMessage,
        504
      ));
    }, timeoutMs);
  });

  return Promise.race([operation, timeoutPromise]);
};

/**
 * Log sitemap generation metrics for monitoring
 */
export const logSitemapMetrics = (
  sitemapType: string,
  urlCount: number,
  generationTimeMs: number,
  fromCache: boolean = false
): void => {
  console.log(`Sitemap Metrics [${sitemapType}]:`, {
    urlCount,
    generationTimeMs,
    fromCache,
    timestamp: new Date().toISOString()
  });
};