/**
 * Adapts any Zustand middleware to work with `zustand-context`
 */
export function adaptMiddleware<T>(
  middleware: T,
  options?: {
    transformOptions?: (options: any, instanceId?: string) => any;
  },
): T {
  const defaultTransform = (opts: any, instanceId?: string) => {
    const contextOptions = { ...opts };

    if ('name' in contextOptions && typeof contextOptions.name === 'string') {
      const originalName = contextOptions.name;
      contextOptions.name = instanceId ? `${originalName}-${String(instanceId)}` : originalName;
    }

    return contextOptions;
  };

  const transformOptions = options?.transformOptions || defaultTransform;

  return ((...args: any[]) => {
    const [initializer, options = {}] = args;

    const contextAwareMiddleware = (...middlewareArgs: any[]) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const [_, __, api] = middlewareArgs;
      const instanceId = (api as any)._contextInstanceId;

      const contextOptions = transformOptions(options, instanceId);

      return (middleware as any)(initializer, contextOptions)(...middlewareArgs);
    };

    return contextAwareMiddleware;
  }) as T;
}
