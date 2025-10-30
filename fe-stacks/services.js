/* --- Generic API Wrapper --- */
const API_BASE = 'https://jsonplaceholder.typicode.com'; // demo public API

async function apiFetch(endpoint, options = {}) {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (!res.ok) throw new Error(`API Error: ${res.status}`);
  return res.json();
}

/* --- Domain Services --- */
export const postService = {
  async getAll() {
    return apiFetch('/posts?_limit=6');
  },
  async getById(id) {
    return apiFetch(`/posts/${id}`);
  },
  async create(data) {
    return apiFetch('/posts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

/* --- Simple in-memory cache --- */
const cache = new Map();

export async function cachedFetch(key, fetcher) {
  if (cache.has(key)) return cache.get(key);
  const data = await fetcher();
  cache.set(key, data);
  return data;
}
