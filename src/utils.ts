/**
 * Checks if an item is an object (not null and not an array)
 */
export const isObject = (item: any): item is Record<string, any> => {
  return item && typeof item === 'object' && !Array.isArray(item);
};

/**
 * Deep merges two objects
 */
export const deepMerge = <T extends Record<string, any>>(target: T, source: any): T => {
  if (!isObject(source)) {
    return target;
  }

  const output = { ...target } as T;

  if (isObject(target)) {
    Object.keys(source).forEach((key) => {
      const sourceValue = source[key];

      if (isObject(sourceValue)) {
        if (!(key in target)) {
          (output as any)[key] = sourceValue;
        } else {
          (output as any)[key] = deepMerge(
            target[key as keyof T] as Record<string, any>,
            sourceValue as Record<string, any>,
          );
        }
      } else {
        (output as any)[key] = sourceValue;
      }
    });
  }

  return output;
};

/**
 * Creates a filtered state object based on whitelist/blacklist
 */
export const filterStateByLists = <T extends Record<string | number | symbol, any>>(
  state: Partial<T>,
  whitelist?: Array<keyof T>,
  blacklist?: Array<keyof T>,
): Partial<T> => {
  if (!whitelist && !blacklist) return state;

  const filteredState = { ...state } as Partial<T>;

  if (whitelist && whitelist.length > 0) {
    Object.keys(filteredState).forEach((key) => {
      if (!whitelist.includes(key as keyof T)) {
        delete (filteredState as any)[key];
      }
    });
  }

  if (blacklist && blacklist.length > 0) {
    blacklist.forEach((key) => {
      if (key in filteredState) {
        delete filteredState[key];
      }
    });
  }

  return filteredState;
};

/**
 * Creates a formatted log prefix for consistent logs
 */
export const createLogPrefix = (name: string, debug: boolean = false): string => {
  return debug ? `[zustand-context(${name})] ` : '';
};

/**
 * Formats error messages with consistent styling
 */
export const formatErrorMessage = (message: string, name: string): string => {
  return `Store context (${name}) error: ${message}`;
};
