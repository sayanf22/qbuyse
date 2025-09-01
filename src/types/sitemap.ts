/**
 * Core sitemap data structures and interfaces
 */

export interface SitemapEntry {
  url: string;
  lastmod: string;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: number;
}

export interface SitemapIndex {
  sitemaps: {
    loc: string;
    lastmod: string;
  }[];
}

export interface SitemapConfig {
  baseUrl: string;
  maxUrlsPerSitemap: number;
  cacheExpiryMinutes: number;
}

export interface StateInfo {
  name: string;
  code: string;
  slug: string;
}

export interface CategoryInfo {
  id: string;
  name: string;
  slug: string;
}

export interface StaticPageInfo {
  url: string;
  priority: number;
  changefreq: SitemapEntry['changefreq'];
}

export interface PostInfo {
  id: string;
  created_at: string;
  updated_at: string;
  state?: string;
  category?: string;
}

export interface SitemapMetadata {
  sitemap_type: string;
  last_modified: string;
  url_count: number;
}