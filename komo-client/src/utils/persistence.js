export function readStoredValue(key, validate, fallback) {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return fallback;
    const value = JSON.parse(raw);
    if (validate(value)) return value;
    window.localStorage.removeItem(key);
  } catch {
    try {
      window.localStorage.removeItem(key);
    } catch {
      // Storage may be unavailable; use the in-memory fallback.
    }
  }
  return fallback;
}

export function writeStoredValue(key, value) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage may be unavailable; the in-memory setting still works.
  }
}
