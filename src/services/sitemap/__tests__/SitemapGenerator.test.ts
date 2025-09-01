import { describe, it, expect, beforeEach } from 'vitest';
import { SitemapGeneratorService } from '../SitemapGenerator';
import { SitemapConfig } from '../types';
import { XML_CONSTANTS } from '../constants';

describe('SitemapGeneratorService', () => {
  let config: SitemapConfig;
  let generator: SitemapGeneratorService;

  beforeEach(() => {
    config = {
      baseUrl: 'https://qbuyse.com',
      maxUrlsPerSitemap: 50000,
      cacheExpiryMinutes: 60,
    };
    generator = new SitemapGeneratorService(config);
  });

  describe('Configuration Validation', () => {
    it('should validate valid configuration', () => {
      expect(() => new SitemapGeneratorService(config)).not.toThrow();
    });

    it('should throw error for missing base URL', () => {
      const invalidConfig = { ...config, baseUrl: '' };
      expect(() => new SitemapGeneratorService(invalidConfig)).toThrow('Base URL is required');
    });

    it('should normalize base URL by removing trailing slash', () => {
      const configWithSlash = { ...config, baseUrl: 'https://qbuyse.com/' };
      const generatorWithSlash = new SitemapGeneratorService(configWithSlash);
      expect(generatorWithSlash['config'].baseUrl).toBe('https://qbuyse.com');
    });
  });

  describe('Sitemap Index Generation', () => {
    it('should generate valid sitemap index XML', async () => {
      const xml = await generator.generateSitemapIndex();
      
      expect(xml).toContain(XML_CONSTANTS.XML_DECLARATION);
      expect(xml).toContain(XML_CONSTANTS.SITEMAP_NAMESPACE);
      expect(xml).toContain('<sitemapindex');
      expect(xml).toContain('</sitemapindex>');
      expect(xml).toContain('sitemap-static.xml');
      expect(xml).toContain('sitemap-categories.xml');
      expect(xml).toContain('sitemap-states.xml');
      expect(xml).toContain('sitemap-posts-1.xml');
    });

    it('should include proper sitemap URLs in index', async () => {
      const xml = await generator.generateSitemapIndex();
      
      expect(xml).toContain('https://qbuyse.com/sitemap-static.xml');
      expect(xml).toContain('https://qbuyse.com/sitemap-categories.xml');
      expect(xml).toContain('https://qbuyse.com/sitemap-states.xml');
      expect(xml).toContain('https://qbuyse.com/sitemap-posts-1.xml');
    });
  });

  describe('Empty Sitemap Generation', () => {
    it('should generate empty static sitemap', async () => {
      const xml = await generator.generateStaticSitemap();
      
      expect(xml).toContain(XML_CONSTANTS.XML_DECLARATION);
      expect(xml).toContain(XML_CONSTANTS.SITEMAP_NAMESPACE);
      expect(xml).toContain('<urlset');
      expect(xml).toContain('</urlset>');
    });

    it('should generate empty categories sitemap', async () => {
      const xml = await generator.generateCategoriesSitemap();
      
      expect(xml).toContain(XML_CONSTANTS.XML_DECLARATION);
      expect(xml).toContain('<urlset');
      expect(xml).toContain('</urlset>');
    });

    it('should generate empty states sitemap', async () => {
      const xml = await generator.generateStatesSitemap();
      
      expect(xml).toContain(XML_CONSTANTS.XML_DECLARATION);
      expect(xml).toContain('<urlset');
      expect(xml).toContain('</urlset>');
    });

    it('should generate empty posts sitemap', async () => {
      const xml = await generator.generatePostsSitemap(1);
      
      expect(xml).toContain(XML_CONSTANTS.XML_DECLARATION);
      expect(xml).toContain('<urlset');
      expect(xml).toContain('</urlset>');
    });
  });

  describe('XML Escaping', () => {
    it('should properly escape XML special characters', () => {
      const testUrl = 'https://example.com/test?param=value&other=<test>';
      const generator = new SitemapGeneratorService(config);
      const escaped = generator['escapeXml'](testUrl);
      
      expect(escaped).toContain('&amp;');
      expect(escaped).toContain('&lt;');
      expect(escaped).toContain('&gt;');
      expect(escaped).not.toContain('<test>');
    });
  });
});