import { describe, it, expect } from 'vitest';
import {
  generateSlug,
  isValidUrl,
  ensureProtocol,
  joinUrlPaths,
  formatSitemapDate
} from '../urlUtils';

describe('URL Utilities', () => {
  describe('generateSlug', () => {
    it('should convert text to lowercase slug', () => {
      expect(generateSlug('Hello World')).toBe('hello-world');
    });

    it('should remove special characters', () => {
      expect(generateSlug('Hello & World!')).toBe('hello-world');
    });

    it('should handle multiple spaces and underscores', () => {
      expect(generateSlug('Hello   World_Test')).toBe('hello-world-test');
    });

    it('should remove leading and trailing hyphens', () => {
      expect(generateSlug('  -Hello World-  ')).toBe('hello-world');
    });

    it('should handle Indian state names', () => {
      expect(generateSlug('Andhra Pradesh')).toBe('andhra-pradesh');
      expect(generateSlug('Tamil Nadu')).toBe('tamil-nadu');
    });
  });

  describe('isValidUrl', () => {
    it('should validate correct URLs', () => {
      expect(isValidUrl('https://example.com')).toBe(true);
      expect(isValidUrl('http://localhost:3000')).toBe(true);
      expect(isValidUrl('https://qbuyse.com/path')).toBe(true);
    });

    it('should reject invalid URLs', () => {
      expect(isValidUrl('not-a-url')).toBe(false);
      expect(isValidUrl('ftp://example.com')).toBe(true); // FTP is valid URL
      expect(isValidUrl('')).toBe(false);
    });
  });

  describe('ensureProtocol', () => {
    it('should add https to URLs without protocol', () => {
      expect(ensureProtocol('example.com')).toBe('https://example.com');
      expect(ensureProtocol('qbuyse.com')).toBe('https://qbuyse.com');
    });

    it('should not modify URLs with protocol', () => {
      expect(ensureProtocol('https://example.com')).toBe('https://example.com');
      expect(ensureProtocol('http://example.com')).toBe('http://example.com');
    });
  });

  describe('joinUrlPaths', () => {
    it('should join paths correctly', () => {
      expect(joinUrlPaths('https://example.com', 'path', 'to', 'resource'))
        .toBe('https://example.com/path/to/resource');
    });

    it('should handle trailing slashes in base URL', () => {
      expect(joinUrlPaths('https://example.com/', 'path'))
        .toBe('https://example.com/path');
    });

    it('should handle leading slashes in paths', () => {
      expect(joinUrlPaths('https://example.com', '/path/', '/to/'))
        .toBe('https://example.com/path/to');
    });

    it('should handle empty paths', () => {
      expect(joinUrlPaths('https://example.com', '', 'path', ''))
        .toBe('https://example.com/path');
    });
  });

  describe('formatSitemapDate', () => {
    it('should format Date object to YYYY-MM-DD', () => {
      const date = new Date('2024-03-15T10:30:00Z');
      expect(formatSitemapDate(date)).toBe('2024-03-15');
    });

    it('should format date string to YYYY-MM-DD', () => {
      expect(formatSitemapDate('2024-03-15T10:30:00Z')).toBe('2024-03-15');
    });

    it('should handle different date formats', () => {
      expect(formatSitemapDate('2024-12-01')).toBe('2024-12-01');
    });
  });
});