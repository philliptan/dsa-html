// modules/registry.js
const cache = new Map();

export async function useModule(path) {
  if (cache.has(path)) return cache.get(path);

  const mod = await import(path);
  cache.set(path, mod);
  return mod;
}
