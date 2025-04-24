# adaptMiddleware

The `adaptMiddleware` utility allows you to use any Zustand middleware with zustand-context, ensuring it works correctly with multiple store instances.

## Basic Usage

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs groupId="language">
  <TabItem value="ts" label="TypeScript" default>

```tsx
import { create, adaptMiddleware } from '@mag1yar/zustand-context';
import { persist as zustandPersist } from 'zustand/middleware';

// Adapt the middleware for zustand-context
const contextPersist = adaptMiddleware(zustandPersist);

// Use the adapted middleware in your store
const useStore = create(
  contextPersist(
    (set) => ({
      count: 0,
      increment: () => set((state) => ({ count: state.count + 1 })),
    }),
    {
      name: 'counter',
    },
  ),
  {
    name: 'Counter',
  },
);
```

  </TabItem>
  <TabItem value="js" label="JavaScript">

```jsx
import { create, adaptMiddleware } from '@mag1yar/zustand-context';
import { persist as zustandPersist } from 'zustand/middleware';

// Adapt the middleware for zustand-context
const contextPersist = adaptMiddleware(zustandPersist);

// Use the adapted middleware in your store
const useStore = create(
  contextPersist(
    (set) => ({
      count: 0,
      increment: () => set((state) => ({ count: state.count + 1 })),
    }),
    {
      name: 'counter',
    },
  ),
  {
    name: 'Counter',
  },
);
```

  </TabItem>
</Tabs>

## API Reference

### Signature

<Tabs groupId="language">
  <TabItem value="ts" label="TypeScript" default>

```tsx
function adaptMiddleware<T>(
  middleware: T,
  options?: {
    transformOptions?: (options: any, instanceId?: string) => any;
  },
): T;
```

  </TabItem>
  <TabItem value="js" label="JavaScript">

```jsx
function adaptMiddleware(
  middleware,
  options
)
```

  </TabItem>
</Tabs>

### Parameters

- **middleware**: The original Zustand middleware function to adapt

- **options**: (Optional) Configuration for adapting the middleware
  - **transformOptions**: A function that transforms middleware options based on the instanceId

### How It Works

The `adaptMiddleware` utility:

1. Takes a Zustand middleware function as input
2. Returns an adapted version that's aware of zustand-context
3. Automatically modifies options like `name` to make them instance-specific
4. Passes the current instanceId to the middleware for context-aware behavior

## Custom Option Transformers

You can customize how middleware options are transformed based on the instanceId:

<Tabs groupId="language">
  <TabItem value="ts" label="TypeScript" default>

```tsx
import { create, adaptMiddleware } from '@mag1yar/zustand-context';
import { devtools as zustandDevtools } from 'zustand/middleware';

// Custom transformer for devtools middleware
const contextDevtools = adaptMiddleware(zustandDevtools, {
  transformOptions: (options, instanceId) => {
    return {
      ...options,
      name: instanceId === 'default' ? options.name : `${options.name}:${instanceId}`,
      enabled: process.env.NODE_ENV === 'development',
    };
  },
});
```

  </TabItem>
  <TabItem value="js" label="JavaScript">

```jsx
import { create, adaptMiddleware } from '@mag1yar/zustand-context';
import { devtools as zustandDevtools } from 'zustand/middleware';

// Custom transformer for devtools middleware
const contextDevtools = adaptMiddleware(zustandDevtools, {
  transformOptions: (options, instanceId) => {
    return {
      ...options,
      name: instanceId === 'default' ? options.name : `${options.name}:${instanceId}`,
      enabled: process.env.NODE_ENV === 'development',
    };
  },
});
```

  </TabItem>
</Tabs>

## Default Transformation Behavior

When no custom transformer is provided, `adaptMiddleware` will:

1. Clone the original options object
2. If `options.name` is a string, append the instanceId (e.g., `"store-instanceId"`)
3. Pass the transformed options to the original middleware
