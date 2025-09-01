import { SitemapEntry, SitemapIndex, SitemapConfig } from "../../types/sitemap";
import { SitemapConfigService } from "./config";
import { XML_CONSTANTS, DEFAULT_SITEMAP_CONFIG } from "./constants";
import { escapeXml, formatSitemapDate, joinUrlPaths } from "./utils";

/**
 * Main service class for generating XML sitemaps
 */
export class SitemapGeneratorService {
  private config: SitemapConfig;
  private configService: SitemapConfigService;

  constructor() {
    this.configService = SitemapConfigService.getInstance();
    this.config = this.configService.getConfig();
    this.validateConfig();
  }

  /**
   * Validate the sitemap configuration
   */
  private validateConfig(): void {
    const validation = this.configService.validateConfig();
    if (!validation.isValid) {
      throw new Error(`Sitemap configuration error: ${validation.errors.join(', ')}`);
    }
  }

  /**
   * Generate the main sitemap index
   */
  async generateSitemapIndex(): Promise<string> {
    try {
      const sitemapIndex = await this.buildSitemapIndex();
      return this.buildSitemapIndexXml(sitemapIndex);
    } catch (error) {
      console.error('Failed to generate sitemap index:', error);
      throw new Error(`Failed to generate sitemap index: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate static pages sitemap
   */
  async generateStaticSitemap(): Promise<string> {
    try {
      const entries = await this.buildStaticSitemapEntries();
      return this.buildXmlSitemap(entries);
    } catch (error) {
      console.error('Failed to generate static sitemap:', error);
      throw new Error(`Failed to generate static sitemap: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate categories sitemap
   */
  async generateCategoriesSitemap(): Promise<string> {
    try {
      const entries = await this.buildCategoriesSitemapEntries();
      return this.buildXmlSitemap(entries);
    } catch (error) {
      console.error('Failed to generate categories sitemap:', error);
      throw new Error(`Failed to generate categories sitemap: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate states sitemap
   */
  async generateStatesSitemap(): Promise<string> {
    try {
      const entries = await this.buildStatesSitemapEntries();
      return this.buildXmlSitemap(entries);
    } catch (error) {
      console.error('Failed to generate states sitemap:', error);
      throw new Error(`Failed to generate states sitemap: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate posts sitemap with pagination support
   */
  async generatePostsSitemap(page: number = 1): Promise<string> {
    try {
      const entries = await this.buildPostsSitemapEntries(page);
      return this.buildXmlSitemap(entries);
    } catch (error) {
      console.error(`Failed to generate posts sitemap page ${page}:`, error);
      throw new Error(`Failed to generate posts sitemap: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Build sitemap index structure
   */
  private async buildSitemapIndex(): Promise<SitemapIndex> {
    const now = formatSitemapDate(new Date());
    const baseUrl = this.config.baseUrl;
    
    return {
      sitemaps: [
        {
          loc: joinUrlPaths(baseUrl, 'sitemap-static.xml'),
          lastmod: now
        },
        {
          loc: joinUrlPaths(baseUrl, 'sitemap-categories.xml'),
          lastmod: now
        },
        {
          loc: joinUrlPaths(baseUrl, 'sitemap-states.xml'),
          lastmod: now
        },
        {
          loc: joinUrlPaths(baseUrl, 'sitemap-posts-1.xml'),
          lastmod: now
        }
      ]
    };
  }

  /**
   * Build static pages sitemap entries (placeholder implementation)
   */
  private async buildStaticSitemapEntries(): Promise<SitemapEntry[]> {
    // This will be implemented in task 4
    return [];
  }

  /**
   * Build categories sitemap entries (placeholder implementation)
   */
  private async buildCategoriesSitemapEntries(): Promise<SitemapEntry[]> {
    // This will be implemented in task 5
    return [];
  }

  /**
   * Build states sitemap entries (placeholder implementation)
   */
  private async buildStatesSitemapEntries(): Promise<SitemapEntry[]> {
    // This will be implemented in task 6
    return [];
  }

  /**
   * Build posts sitemap entries (placeholder implementation)
   */
  private async buildPostsSitemapEntries(page: number): Promise<SitemapEntry[]> {
    // This will be implemented in task 7
    return [];
  }

  /**
   * Build XML sitemap from entries
   */
  private buildXmlSitemap(entries: SitemapEntry[]): string {
    const urls = entries.map(entry => `
  <url>
    <loc>${escapeXml(entry.url)}</loc>
    <lastmod>${entry.lastmod}</lastmod>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`).join('');

    return `${XML_CONSTANTS.XML_DECLARATION}
<urlset xmlns="${XML_CONSTANTS.SITEMAP_NAMESPACE}">${urls}
</urlset>`;
  }

  /**
   * Build XML sitemap index from sitemap index structure
   */
  private buildSitemapIndexXml(sitemapIndex: SitemapIndex): string {
    const sitemaps = sitemapIndex.sitemaps.map(sitemap => `
  <sitemap>
    <loc>${escapeXml(sitemap.loc)}</loc>
    <lastmod>${sitemap.lastmod}</lastmod>
  </sitemap>`).join('');

    return `${XML_CONSTANTS.XML_DECLARATION}
<sitemapindex xmlns="${XML_CONSTANTS.SITEMAP_NAMESPACE}">${sitemaps}
</sitemapindex>`;
  }

  /**
   * Get sitemap metadata for monitoring
   */
  getSitemapMetadata(type: string, urlCount: number) {
    return {
      sitemap_type: type,
      last_modified: formatSitemapDate(new Date()),
      url_count: urlCount,
      base_url: this.config.baseUrl,
      max_urls_per_sitemap: this.config.maxUrlsPerSitemap
    };
  }

  /**
   * Update configuration
   */
  updateConfig(updates: Partial<SitemapConfig>): void {
    this.configService.updateConfig(updates);
    this.config = this.configService.getConfig();
    this.validateConfig();
  }
}