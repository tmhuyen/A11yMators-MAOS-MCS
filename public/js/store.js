export const data = {}; // will hold all step fields

/**
 * Store a value by path (flat keys in your current usage)
 */
export function set(path, value) {
  data[path] = value;
}

/**
 * Get a value by path
 */
export function get(path) {
  return data[path];
}

/**
 * Return a shallow copy of the whole data object
 * so hooks can safely export/preview all collected data.
 */
export function toObject() {
  // Return a copy so the caller can't mutate the real store directly
  return { ...data };
}

/**
 * Optional: clear all data (e.g., after export or restart)
 */
export function clear() {
  for (const key in data) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      delete data[key];
    }
  }
}

