import { persist as zustandPersist } from 'zustand/middleware';
import { adaptMiddleware } from './utils';

export const persist = adaptMiddleware(zustandPersist, {
  transformOptions: (options, { instanceId, contextName }) => {
    const contextOptions = { ...options };

    if (!instanceId || instanceId === 'default') {
      return { ...contextOptions, storage: null };
    }

    if (typeof contextOptions.name === 'string') {
      contextOptions.name = `${contextOptions.name}-${instanceId}`;
    } else {
      contextOptions.name = `${contextName}-${instanceId}`;
    }

    return contextOptions;
  },
});
