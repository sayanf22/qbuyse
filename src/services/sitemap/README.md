# Sitemap Service

A comprehensive TypeScript service for generating XML sitemaps optimized for the Qbuyse marketplace across all Indian states and categories.

## Overview

This service provides a complete sitemap generation system that creates SEO-optimized XML sitemaps following the official sitemap protocol. It's designed to handle large-scale marketplace content with proper categorization by Indian states and product categories.

## Features

- **XML Sitemap Protocol Compliance**: Follows official sitemap standards
- **State-Specific Optimization**: Includes all 29 Indian states with SEO-friendly slugs
- **Category Coverage**: Supports 16 core marketplace categories
- **Performance Optimized**: Built-in timeout handling and error management
- **Type Safety**: Full TypeScript support with comprehensive type definitions
- **Modular Architecture**: Clean separation of concerns with testable components

## Installation

The service is part of the main application and doesn't require separate installation. All dependencies are included in the main `package.json`.

## Usage

### Basic Usage

```typescript
import { SitemapGeneratorService, getSitemapConfig } from '@/services/sitemap';

// Initialize with default configuration
const config = getSitemapConfig();
const generator = new SitemapGeneratorService(config);

// Generate sitemap index
const indexXml = await generator.generateSitemapIndex();

// Generate specific sitemaps
const staticXml = await generator.generateStaticSitemap();
const categoriesXml = await generator.generateCategoriesSitemap();
const statesXml = await generator.generateStatesSitemap();
const postsXml = await generator.generatePostsSitemap(1);
```

### Custom Configuration

```typescript
import { SitemapGeneratorService, SitemapConfig } from '@/services/sitemap';

const customConfig: SitemapConfig = {
  baseUrl: 'https://your-domain.com',
  maxUrlsPerSitemap: 25000,
  cacheExpiryMinutes: 30,
};

const generator = new SitemapGeneratorService(customConfig);
```

### Using Constants

```typescript
import { INDIAN_STATES, SITEMAP_CATEGORIES, STATIC_PAGES } from '@/services/sitemap';

// Access Indian states data
console.log(INDIAN_STATES.length); // 29 states
console.log(INDIAN_STATES[0]); // { name: "Andhra Pradesh", code: "AP", slug: "andhra-pradesh" }

// Access categories
console.log(SITEMAP_CATEGORIES.length); // 16 categories
console.log(SITEMAP_CATEGORIES[0]); // { id: "Cars", name: "Cars", slug: "cars" }

// Access static pages configuration
console.log(STATIC_PAGES[0]); // { url: '/', priority: 1.0, changefreq: 'daily' }
```

## Configuration

### Environment Variables

Set these environment variables in your `.env` file:

```bash
# Base URL for the site (required)
VITE_SITE_BASE_URL=https://qbuyse.com

# Maximum number of URLs per sitemap file (default: 50000)
VITE_SITEMAP_MAX_URLS_PER_FILE=50000

# Cache expiry time in minutes (default: 60)
VITE_SITEMAP_CACHE_EXPIRY_MINUTES=60
```

### Configuration Management

```typescript
import { SitemapConfigManager } from '@/services/sitemap';

const configManager = SitemapConfigManager.getInstance();

// Get current configuration
const config = configManager.getConfig();

// Update configuration
configManager.updateConfig({
  baseUrl: 'https://new-domain.com',
  maxUrlsPerSitemap: 30000
});

// Validate configuration
const isValid = configManager.validateConfig();
```

## API Reference

### SitemapGeneratorService

Main service class for generating XML sitemaps.

#### Methods

- `generateSitemapIndex(): Promise<string>` - Generate main sitemap index
- `generateStaticSitemap(): Promise<string>` - Generate static pages sitemap
- `generateCategoriesSitemap(): Promise<string>` - Generate categories sitemap
- `generateStatesSitemap(): Promise<string>` - Generate states sitemap
- `generatePostsSitemap(page?: number): Promise<string>` - Generate posts sitemap with pagination

### Types

#### SitemapEntry
```typescript
interface SitemapEntry {
  url: string;
  lastmod: string;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: number;
}
```

#### SitemapConfig
```typescript
interface SitemapConfig {
  baseUrl: string;
  maxUrlsPerSitemap: number;
  cacheExpiryMinutes: number;
}
```

#### StateInfo
```typescript
interface StateInfo {
  name: string;
  code: string;
  slug: string;
}
```

#### CategoryInfo
```typescript
interface CategoryInfo {
  id: string;
  name: string;
  slug: string;
}
```

## Error Handling

The service includes comprehensive error handling:

```typescript
import { SitemapError, SitemapErrorType } from '@/services/sitemap';

try {
  const xml = await generator.generateSitemapIndex();
} catch (error) {
  if (error instanceof SitemapError) {
    console.error(`Sitemap error [${error.type}]:`, error.message);
    console.error(`Status code: ${error.statusCode}`);
  }
}
```

### Error Types

- `GENERATION_FAILED` - General sitemap generation failure
- `CACHE_ERROR` - Cache-related errors
- `DATABASE_ERROR` - Database connection or query errors
- `INVALID_REQUEST` - Invalid request parameters
- `TIMEOUT_ERROR` - Operation timeout
- `CONFIGURATION_ERROR` - Invalid configuration

## Utilities

### URL Utilities

```typescript
import { generateSlug, joinUrlPaths, formatSitemapDate } from '@/services/sitemap';

// Generate SEO-friendly slugs
const slug = generateSlug('Andhra Pradesh'); // 'andhra-pradesh'

// Join URL paths safely
const url = joinUrlPaths('https://example.com', 'state', 'AP'); // 'https://example.com/state/AP'

// Format dates for sitemaps
const date = formatSitemapDate(new Date()); // '2024-03-15'
```

## Testing

Run the test suite:

```bash
npm run test src/services/sitemap
```

The service includes comprehensive tests for:
- Configuration validation
- XML generation
- URL utilities
- Error handling
- Type safety

## Performance Considerations

- **Timeout Handling**: All operations have 30-second timeouts
- **Memory Efficient**: Streaming XML generation for large datasets
- **Caching Ready**: Built-in cache key generation and expiry
- **Pagination Support**: Automatic splitting of large sitemaps

## SEO Features

- **XML Protocol Compliance**: Follows sitemap.org standards
- **Proper Metadata**: Includes lastmod, changefreq, and priority
- **State Optimization**: All 29 Indian states with proper slugs
- **Category Coverage**: Complete marketplace category structure
- **URL Normalization**: Consistent URL formatting

## Integration

This service is designed to be integrated with:
- Supabase Edge Functions for server-side generation
- React applications for client-side sitemap management
- Background job systems for automatic updates
- CDN systems for global distribution

## Contributing

When extending the service:
1. Add comprehensive TypeScript types
2. Include unit tests for new functionality
3. Update documentation
4. Follow the existing error handling patterns
5. Maintain backward compatibility