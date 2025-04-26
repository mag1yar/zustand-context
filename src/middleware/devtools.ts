import { devtools as zustandDevtools } from 'zustand/middleware';
import { adaptMiddleware } from './utils';

export const devtools = adaptMiddleware(zustandDevtools, {
  transformOptions: (options, { instanceId, contextName }) => {
    const contextOptions = { ...options };

    if (typeof contextOptions.name === 'string') {
      if (instanceId && instanceId !== 'default') {
        contextOptions.name = `${contextOptions.name}-${instanceId}`;
      }
    } else {
      if (instanceId && instanceId !== 'default') {
        contextOptions.name = `${contextName}-${instanceId}`;
      } else {
        contextOptions.name = contextName;
      }
    }

    return contextOptions;
  },
});
