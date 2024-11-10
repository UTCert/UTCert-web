export function textToHex(text: string) : string {
    let hex = '';

    for (let i = 0; i < text.length; i++) {
      let charCode = text.charCodeAt(i).toString(16);
      hex += ('00' + charCode).slice(-2); 
  }
  return hex;
}

export function cloneDeep<T>(obj: T, cache = new WeakMap()): T {
  // Check for primitive types and functions
  if (obj === null || typeof obj !== 'object') return obj;

  // Handle circular references by using a WeakMap cache
  if (cache.has(obj)) return cache.get(obj) as T;

  // Handle specific types: Date, Array, Map, Set
  if (obj instanceof Date) return new Date(obj) as T;
  if (Array.isArray(obj)) {
    const arrCopy = obj.map(item => cloneDeep(item, cache));
    return arrCopy as unknown as T;
  }
  if (obj instanceof Map) {
    const mapCopy = new Map();
    cache.set(obj, mapCopy); // add to cache before recursion
    obj.forEach((value, key) => {
      mapCopy.set(cloneDeep(key, cache), cloneDeep(value, cache));
    });
    return mapCopy as unknown as T;
  }
  if (obj instanceof Set) {
    const setCopy = new Set();
    cache.set(obj, setCopy);
    obj.forEach(value => {
      setCopy.add(cloneDeep(value, cache));
    });
    return setCopy as unknown as T;
  }

  // Handle generic object type
  const cloneObj = {} as { [key: string]: any };
  cache.set(obj, cloneObj); // add to cache before recursion
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      cloneObj[key] = cloneDeep((obj as { [key: string]: any })[key], cache);
    }
  }
  return cloneObj as T;
}
