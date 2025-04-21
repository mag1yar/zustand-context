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
