import { StateInfo, CategoryInfo, StaticPageInfo } from "../../types/sitemap";

/**
 * Complete list of 29 Indian states with codes and SEO-friendly slugs
 */
export const INDIAN_STATES: StateInfo[] = [
  { name: "Andhra Pradesh", code: "AP", slug: "andhra-pradesh" },
  { name: "Arunachal Pradesh", code: "AR", slug: "arunachal-pradesh" },
  { name: "Assam", code: "AS", slug: "assam" },
  { name: "Bihar", code: "BR", slug: "bihar" },
  { name: "Chhattisgarh", code: "CG", slug: "chhattisgarh" },
  { name: "Goa", code: "GA", slug: "goa" },
  { name: "Gujarat", code: "GJ", slug: "gujarat" },
  { name: "Haryana", code: "HR", slug: "haryana" },
  { name: "Himachal Pradesh", code: "HP", slug: "himachal-pradesh" },
  { name: "Jharkhand", code: "JH", slug: "jharkhand" },
  { name: "Karnataka", code: "KA", slug: "karnataka" },
  { name: "Kerala", code: "KL", slug: "kerala" },
  { name: "Madhya Pradesh", code: "MP", slug: "madhya-pradesh" },
  { name: "Maharashtra", code: "MH", slug: "maharashtra" },
  { name: "Manipur", code: "MN", slug: "manipur" },
  { name: "Meghalaya", code: "ML", slug: "meghalaya" },
  { name: "Mizoram", code: "MZ", slug: "mizoram" },
  { name: "Nagaland", code: "NL", slug: "nagaland" },
  { name: "Odisha", code: "OD", slug: "odisha" },
  { name: "Punjab", code: "PB", slug: "punjab" },
  { name: "Rajasthan", code: "RJ", slug: "rajasthan" },
  { name: "Sikkim", code: "SK", slug: "sikkim" },
  { name: "Tamil Nadu", code: "TN", slug: "tamil-nadu" },
  { name: "Telangana", code: "TG", slug: "telangana" },
  { name: "Tripura", code: "TR", slug: "tripura" },
  { name: "Uttar Pradesh", code: "UP", slug: "uttar-pradesh" },
  { name: "Uttarakhand", code: "UK", slug: "uttarakhand" },
  { name: "West Bengal", code: "WB", slug: "west-bengal" },
  { name: "Delhi", code: "DL", slug: "delhi" }
];

/**
 * Categories configuration matching the existing categories.ts structure
 * Reduced to the 16 core categories as specified in the design document
 */
export const SITEMAP_CATEGORIES: CategoryInfo[] = [
  { id: "Cars", name: "Cars", slug: "cars" },
  { id: "Properties", name: "Properties", slug: "properties" },
  { id: "Mobiles", name: "Mobiles", slug: "mobiles" },
  { id: "Jobs", name: "Jobs", slug: "jobs" },
  { id: "Fashion", name: "Fashion", slug: "fashion" },
  { id: "Bikes", name: "Bikes", slug: "bikes" },
  { id: "Electronics", name: "Electronics & Appliances", slug: "electronics" },
  { id: "Commercial", name: "Commercial Vehicles", slug: "commercial-vehicles" },
  { id: "Furniture", name: "Furniture", slug: "furniture" },
  { id: "Pets", name: "Pets", slug: "pets" },
  { id: "Kids", name: "Kids", slug: "kids" },
  { id: "Sports", name: "Sports & Fitness", slug: "sports-fitness" },
  { id: "Books", name: "Books", slug: "books" },
  { id: "Services", name: "Services", slug: "services" },
  { id: "Gaming", name: "Gaming", slug: "gaming" },
  { id: "Photography", name: "Photography", slug: "photography" }
];

/**
 * Static pages configuration with SEO priorities and change frequencies
 */
export const STATIC_PAGES: StaticPageInfo[] = [
  { url: '/', priority: 1.0, changefreq: 'daily' },
  { url: '/search', priority: 0.8, changefreq: 'daily' },
  { url: '/post', priority: 0.7, changefreq: 'weekly' },
  { url: '/about', priority: 0.5, changefreq: 'monthly' },
  { url: '/terms', priority: 0.3, changefreq: 'yearly' },
  { url: '/privacy', priority: 0.3, changefreq: 'yearly' }
];

/**
 * Default sitemap configuration values
 */
export const DEFAULT_SITEMAP_CONFIG = {
  MAX_URLS_PER_SITEMAP: 50000,
  CACHE_EXPIRY_MINUTES: 60,
  GENERATION_TIMEOUT_SECONDS: 30,
  DEFAULT_CHANGEFREQ: 'weekly' as const,
  DEFAULT_PRIORITY: 0.5,
  BASE_URL: 'https://qbuyse.com',
};

/**
 * XML namespace and protocol constants
 */
export const XML_CONSTANTS = {
  SITEMAP_NAMESPACE: 'http://www.sitemaps.org/schemas/sitemap/0.9',
  XML_DECLARATION: '<?xml version="1.0" encoding="UTF-8"?>',
  CONTENT_TYPE: 'application/xml; charset=utf-8',
};