import { DATA_CACHE_KEY, DATA_CACHE_TTL_MS } from './constants.js';

export function loadCachedData() {
  try {
    const raw = localStorage.getItem(DATA_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !parsed.data || !parsed.storedAt) return null;
    if (Date.now() - parsed.storedAt > DATA_CACHE_TTL_MS) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveCachedData(data) {
  try {
    localStorage.setItem(DATA_CACHE_KEY, JSON.stringify({ storedAt: Date.now(), data }));
  } catch (e) {
    try { localStorage.removeItem(DATA_CACHE_KEY); } catch {}
    try { localStorage.setItem(DATA_CACHE_KEY, JSON.stringify({ storedAt: Date.now(), data })); } catch {}
  }
}
