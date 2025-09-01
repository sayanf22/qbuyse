# Requirements Document

## Introduction

This feature will implement a comprehensive sitemap system for the Qbuyse marketplace that generates XML sitemaps optimized for all Indian states. The sitemap will improve SEO by providing search engines with structured information about all pages, categories, and state-specific content, helping users discover relevant marketplace listings in their regions.

## Requirements

### Requirement 1

**User Story:** As a search engine crawler, I want to access a comprehensive sitemap, so that I can efficiently index all marketplace pages and improve the site's search visibility.

#### Acceptance Criteria

1. WHEN a search engine accesses /sitemap.xml THEN the system SHALL return a valid XML sitemap index
2. WHEN the sitemap index is accessed THEN it SHALL include references to all sub-sitemaps (static pages, categories, states, posts)
3. WHEN any sitemap is generated THEN it SHALL follow the XML sitemap protocol standards
4. WHEN sitemaps are accessed THEN they SHALL include proper lastmod, changefreq, and priority values
5. IF a sitemap exceeds 50,000 URLs THEN the system SHALL split it into multiple sitemap files

### Requirement 2

**User Story:** As a user searching for products in my state, I want search engines to find state-specific pages, so that I can discover relevant local marketplace listings through search results.

#### Acceptance Criteria

1. WHEN the state sitemap is generated THEN it SHALL include URLs for all 29 Indian states
2. WHEN a state page URL is included THEN it SHALL follow the format /state/{state-code}
3. WHEN state pages are listed THEN each SHALL include proper metadata for SEO optimization
4. WHEN state-specific category pages exist THEN they SHALL be included in the state sitemap
5. IF a state has no active posts THEN its page SHALL still be included in the sitemap

### Requirement 3

**User Story:** As a user browsing by category, I want search engines to index category pages, so that I can find category-specific content through search engines.

#### Acceptance Criteria

1. WHEN the category sitemap is generated THEN it SHALL include URLs for all 16 predefined categories
2. WHEN category URLs are included THEN they SHALL follow the format /category/{category-id}
3. WHEN category pages are listed THEN each SHALL include state-specific variations
4. WHEN state-category combinations are generated THEN they SHALL follow /state/{state-code}/category/{category-id} format
5. IF a category-state combination has no posts THEN it SHALL still be included for SEO completeness

### Requirement 4

**User Story:** As a marketplace user, I want my posts to be discoverable through search engines, so that I can reach more potential buyers or sellers.

#### Acceptance Criteria

1. WHEN the posts sitemap is generated THEN it SHALL include URLs for all active public posts
2. WHEN post URLs are included THEN they SHALL follow the format /post/{post-id}
3. WHEN posts are listed THEN each SHALL include the post's last modified date
4. WHEN a post is deleted or made private THEN it SHALL be removed from the sitemap
5. IF the posts sitemap exceeds URL limits THEN it SHALL be split into multiple dated sitemap files

### Requirement 5

**User Story:** As a site administrator, I want sitemaps to be automatically updated, so that search engines always have current information about the site's content.

#### Acceptance Criteria

1. WHEN a new post is created THEN the posts sitemap SHALL be regenerated within 1 hour
2. WHEN a post is deleted or updated THEN the posts sitemap SHALL reflect the change within 1 hour
3. WHEN static content is updated THEN the static sitemap SHALL be regenerated
4. WHEN sitemaps are regenerated THEN the sitemap index SHALL be updated with new lastmod dates
5. IF sitemap generation fails THEN the system SHALL log the error and retry within 30 minutes

### Requirement 6

**User Story:** As a developer, I want sitemap generation to be performant and scalable, so that it doesn't impact the application's performance or user experience.

#### Acceptance Criteria

1. WHEN sitemaps are generated THEN the process SHALL complete within 30 seconds for up to 100,000 URLs
2. WHEN sitemap generation runs THEN it SHALL not block other application operations
3. WHEN sitemaps are requested THEN they SHALL be served from cache when possible
4. WHEN the cache expires THEN sitemaps SHALL be regenerated in the background
5. IF sitemap generation takes longer than expected THEN it SHALL be moved to a background job

### Requirement 7

**User Story:** As a user accessing the site from different devices, I want sitemap URLs to be properly formatted and accessible, so that all content is discoverable regardless of how I access the site.

#### Acceptance Criteria

1. WHEN sitemap URLs are generated THEN they SHALL use the correct base URL for the environment
2. WHEN sitemaps are accessed THEN they SHALL return proper HTTP headers (Content-Type: application/xml)
3. WHEN sitemap files are served THEN they SHALL be compressed with gzip when supported
4. WHEN robots.txt is accessed THEN it SHALL reference the sitemap location
5. IF a sitemap URL is malformed THEN the system SHALL return a 404 error with proper logging