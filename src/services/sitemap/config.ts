import { SitemapConfig } from "../../types/sitemap";
import { DEFAULT_SITEMAP_CONFIG } from "./constants";

/**
 * Sitemap configuration management
 */
export class SitemapConfigService {
  private static instance: SitemapConfigService;
  private config: SitemapConfig;

  private constructor() {
    this.config = this.loadConfiguration();
  }

  public static getInstance(): SitemapConfigService {
    if (!SitemapConfigService.instance) {
      SitemapConfigService.instance = new SitemapConfigService();
    }
    return SitemapConfigService.instance;
  }

  /**
   * Load configuration with hardcoded defaults
   */
  private loadConfiguration(): SitemapConfig {
    return {
      baseUrl: DEFAULT_SITEMAP_CONFIG.BASE_URL,
      maxUrlsPerSitemap: DEFAULT_SITEMAP_CONFIG.MAX_URLS_PER_SITEMAP,
      cacheExpiryMinutes: DEFAULT_SITEMAP_CONFIG.CACHE_EXPIRY_MINUTES,
    };
  }

  /**
   * Get current configuration
   */
  public getConfig(): SitemapConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  public updateConfig(updates: Partial<SitemapConfig>): void {
    this.config = { ...this.config, ...updates };
    
    // Ensure base URL doesn't end with slash
    if (this.config.baseUrl.endsWith('/')) {
      this.config.baseUrl = this.config.baseUrl.slice(0, -1);
    }
  }

  /**
   * Validate configuration
   */
  public validateConfig(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.config.baseUrl) {
      errors.push('Base URL is required');
    }

    if (!this.isValidUrl(this.config.baseUrl)) {
      errors.push('Base URL must be a valid URL');
    }

    if (this.config.maxUrlsPerSitemap <= 0) {
      errors.push('Max URLs per sitemap must be greater than 0');
    }

    if (this.config.cacheExpiryMinutes <= 0) {
      errors.push('Cache expiry minutes must be greater than 0');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Check if URL is valid
   */
  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get base URL for sitemap generation
   */
  public getBaseUrl(): string {
    return this.config.baseUrl;
  }

  /**
   * Get maximum URLs per sitemap file
   */
  public getMaxUrlsPerSitemap(): number {
    return this.config.maxUrlsPerSitemap;
  }

  /**
   * Get cache expiry time in minutes
   */
  public getCacheExpiryMinutes(): number {
    return this.config.cacheExpiryMinutes;
  }
}