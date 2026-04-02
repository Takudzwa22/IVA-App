'use client';

/**
 * Module-level in-memory cache for the browser session.
 *
 * Lives outside React — survives component unmounts and page navigation.
 * Each hook checks this before hitting the API, so data is fetched at most
 * once per TTL window per cache key within a single browser session.
 */

interface CacheEntry<T> {
  data: T;
  fetchedAt: number;
}

const store = new Map<string, CacheEntry<unknown>>();

const TTL_MS = {
  timetable: Infinity,       // timetables don't change mid-session
  assessments: 5 * 60_000,   // 5 min — marks can be published during the day
  attendance: 2 * 60_000,    // 2 min
} as const;

export type CacheNamespace = keyof typeof TTL_MS;

export function getCached<T>(namespace: CacheNamespace, key: string): T | null {
  const entry = store.get(`${namespace}:${key}`) as CacheEntry<T> | undefined;
  if (!entry) return null;
  const ttl = TTL_MS[namespace];
  if (ttl !== Infinity && Date.now() - entry.fetchedAt > ttl) {
    store.delete(`${namespace}:${key}`);
    return null;
  }
  return entry.data;
}

export function setCached<T>(namespace: CacheNamespace, key: string, data: T): void {
  store.set(`${namespace}:${key}`, { data, fetchedAt: Date.now() });
}

export function invalidate(namespace: CacheNamespace, key: string): void {
  store.delete(`${namespace}:${key}`);
}

export function invalidateAll(namespace: CacheNamespace): void {
  Array.from(store.keys())
    .filter(k => k.startsWith(`${namespace}:`))
    .forEach(k => store.delete(k));
}
