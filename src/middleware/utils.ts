export type StoreIdentity = {
  instanceId?: string;
  contextName: string;
};

/**
 * Adapts any Zustand middleware to work with `zustand-context`
 */
export function adaptMiddleware<T>(
  middleware: T,
  options?: {
    transformOptions?: (options: any, identity: StoreIdentity) => any;
  },
): T {
  const defaultTransform = (opts: any, identity: StoreIdentity) => {
    const contextOptions = { ...opts };

    if ('name' in contextOptions && typeof contextOptions.name === 'string') {
      const originalName = contextOptions.name;
      contextOptions.name = identity.instanceId
        ? `${originalName}-${identity.instanceId}`
        : originalName;
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
      const contextName = (api as any)._contextName;

      const identity: StoreIdentity = {
        instanceId,
        contextName,
      };

      const contextOptions = transformOptions(options, identity);

      return (middleware as any)(initializer, contextOptions)(...middlewareArgs);
    };

    return contextAwareMiddleware;
  }) as T;
}
