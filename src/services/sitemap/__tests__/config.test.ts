import { describe, it, expect, beforeEach } from 'vitest';
import { SitemapConfigManager } from '../config';

describe('SitemapConfigManager', () => {
  let configManager: SitemapConfigManager;

  beforeEach(() => {
    configManager = SitemapConfigManager.getInstance();
  });

  describe('Configuration Loading', () => {
    it('should load default configuration', () => {
      const config = configManager.getConfig();
      
      expect(config.baseUrl).toBeDefined();
      expect(config.maxUrlsPerSitemap).toBeGreaterThan(0);
      expect(config.cacheExpiryMinutes).toBeGreaterThan(0);
    });

    it('should normalize base URL by removing trailing slash', () => {
      configManager.updateConfig({ baseUrl: 'https://example.com/' });
      const config = configManager.getConfig();
      
      expect(config.baseUrl).toBe('https://example.com');
    });
  });

  describe('Configuration Validation', () => {
    it('should validate correct configuration', () => {
      configManager.updateConfig({
        baseUrl: 'https://qbuyse.com',
        maxUrlsPerSitemap: 50000,
        cacheExpiryMinutes: 60
      });
      
      expect(configManager.validateConfig()).toBe(true);
    });

    it('should reject empty base URL', () => {
      configManager.updateConfig({ baseUrl: '' });
      expect(configManager.validateConfig()).toBe(false);
    });

    it('should reject invalid base URL', () => {
      configManager.updateConfig({ baseUrl: 'not-a-url' });
      expect(configManager.validateConfig()).toBe(false);
    });

    it('should reject negative maxUrlsPerSitemap', () => {
      configManager.updateConfig({ maxUrlsPerSitemap: -1 });
      expect(configManager.validateConfig()).toBe(false);
    });

    it('should reject zero cacheExpiryMinutes', () => {
      configManager.updateConfig({ cacheExpiryMinutes: 0 });
      expect(configManager.validateConfig()).toBe(false);
    });
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = SitemapConfigManager.getInstance();
      const instance2 = SitemapConfigManager.getInstance();
      
      expect(instance1).toBe(instance2);
    });

    it('should maintain state across getInstance calls', () => {
      const instance1 = SitemapConfigManager.getInstance();
      instance1.updateConfig({ baseUrl: 'https://test.com' });
      
      const instance2 = SitemapConfigManager.getInstance();
      expect(instance2.getConfig().baseUrl).toBe('https://test.com');
    });
  });
});