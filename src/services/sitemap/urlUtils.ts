/**
 * URL utility functions for sitemap generation
 */

/**
 * Generate SEO-friendly URL slug from text
 */
export const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
};

/**
 * Validate URL format
 */
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Ensure URL starts with protocol
 */
export const ensureProtocol = (url: string): string => {
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return `https://${url}`;
  }
  return url;
};

/**
 * Join URL paths safely
 */
export const joinUrlPaths = (base: string, ...paths: string[]): string => {
  // Remove trailing slash from base
  let result = base.replace(/\/+$/, '');
  
  for (const path of paths) {
    if (path) {
      // Remove leading and trailing slashes from path
      const cleanPath = path.replace(/^\/+|\/+$/g, '');
      if (cleanPath) {
        result += `/${cleanPath}`;
      }
    }
  }
  
  return result;
};

/**
 * Format date for sitemap lastmod field (ISO 8601 format)
 */
export const formatSitemapDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString().split('T')[0]; // YYYY-MM-DD format
};