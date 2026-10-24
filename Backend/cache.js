// Small in-memory cache with expiry (TTL).
// Same city searched again within a few minutes is served from here,
// so we call OpenWeatherMap less often (faster response, fewer API calls).
const store = new Map();
const MAX_ENTRIES = 500;

export function cacheGet(key) {
    const entry = store.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expires) {
        store.delete(key); // expired
        return null;
    }
    return entry.value;
}

export function cacheSet(key, value, ttlMs) {
    // Keep memory under control: remove the oldest entry when full
    if (store.size >= MAX_ENTRIES) {
        store.delete(store.keys().next().value);
    }
    store.set(key, { value, expires: Date.now() + ttlMs });
}

export function cacheSize() {
    return store.size;
}
