import { persist as zustandPersist } from 'zustand/middleware';
import { adaptMiddleware } from './utils';

export const persist = adaptMiddleware(zustandPersist, {
  transformOptions: (options, instanceId) => {
    const contextOptions = { ...options };

    const isDefaultInstance = !instanceId || instanceId === 'default';

    if (isDefaultInstance) {
      return { ...contextOptions, storage: null };
    }

    if (typeof contextOptions.name === 'string') {
      const originalName = contextOptions.name;
      contextOptions.name = `${originalName}-${instanceId}`;
    }

    return contextOptions;
  },
});
