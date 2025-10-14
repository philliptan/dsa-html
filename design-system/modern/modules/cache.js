// modules/cache.js
// ---------------------------------------------------
// Generic cache helper for component demos and assets
// Supports in-memory + localStorage fallback
// ---------------------------------------------------

const memoryCache = new Map();
const CACHE_PREFIX = "ui-demo-cache:";

/**
 * Retrieve a cached value by key
 * Priority: Memory → LocalStorage → null
 */
export function getCache(key) {
  // 1. Memory cache
  if (memoryCache.has(key)) return memoryCache.get(key);

  // 2. LocalStorage
  try {
    const value = localStorage.getItem(CACHE_PREFIX + key);
    if (value) {
      memoryCache.set(key, value);
      return value;
    }
  } catch (err) {
    console.warn("Cache read failed:", err);
  }

  return null;
}

/**
 * Store a value in both memory and localStorage
 */
export function setCache(key, value) {
  try {
    memoryCache.set(key, value);
    localStorage.setItem(CACHE_PREFIX + key, value);
  } catch (err) {
    // Safari private mode or quota may fail
    console.warn("Cache write failed:", err);
  }
}

/**
 * Fetch content with caching
 * @param {string} url - Resource URL
 * @returns {Promise<string>} - Cached or fetched content
 */
export async function fetchWithCache(url) {
  const cached = getCache(url);
  if (cached) return cached;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(res.statusText);
    const data = await res.text();

    setCache(url, data);
    return data;
  } catch (err) {
    console.error(`[Cache fetch failed] ${url}:`, err);
    throw err;
  }
}

/**
 * Optional cleanup (to clear all cache)
 */
export function clearCache() {
  memoryCache.clear();
  try {
    Object.keys(localStorage)
      .filter(k => k.startsWith(CACHE_PREFIX))
      .forEach(k => localStorage.removeItem(k));
  } catch (err) {
    console.warn("Cache clear failed:", err);
  }
}
