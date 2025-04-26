# adaptMiddleware

The `adaptMiddleware` utility allows you to use any Zustand middleware with zustand-context, ensuring it works correctly with multiple store instances. It's the foundation for adapting middleware like persist and devtools to be context-aware.

## Basic Usage

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs groupId="language">
  <TabItem value="ts" label="TypeScript" default>

```tsx
import { adaptMiddleware } from '@mag1yar/zustand-context/middleware';
import { persist as zustandPersist } from 'zustand/middleware';

// Create a context-aware version of the persist middleware
const contextPersist = adaptMiddleware(zustandPersist, {...});

// Use the adapted middleware in your store
const useStore = create<StoreState>()(
  contextPersist(
    (set) => ({
      // ... your store implementation
    }),
    {
      name: 'my-storage',
    },
  ),
  {
    name: 'MyContext',
  },
);
```

  </TabItem>
  <TabItem value="js" label="JavaScript">

```jsx
import { adaptMiddleware } from '@mag1yar/zustand-context/middleware';
import { persist as zustandPersist } from 'zustand/middleware';

// Create a context-aware version of the persist middleware
const contextPersist = adaptMiddleware(zustandPersist, {...});

// Use the adapted middleware in your store
const useStore = create()(
  contextPersist(
    (set) => ({
      // ... your store implementation
    }),
    {
      name: 'my-storage',
    },
  ),
  {
    name: 'MyContext',
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
type StoreIdentity = {
  instanceId?: string;
  contextName: string;
};

function adaptMiddleware<T>(
  middleware: T,
  options?: {
    transformOptions?: (options: any, identity: StoreIdentity) => any;
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
  - **transformOptions**: A function that transforms middleware options based on the store identity

### How It Works

The `adaptMiddleware` utility:

1. Takes a Zustand middleware function as input
2. Returns an adapted version that's aware of zustand-context
3. Intercepts the middleware creation to inject context information
4. Passes the store identity (contextName and instanceId) to the transformation function

## Creating Custom Adapters

You can create your own middleware adapters with custom transformation logic:

### Example: Custom Persist Adapter

<Tabs groupId="language">
  <TabItem value="ts" label="TypeScript" default>

```tsx
import { adaptMiddleware } from '@mag1yar/zustand-context/middleware';
import { persist as zustandPersist } from 'zustand/middleware';

export const customPersist = adaptMiddleware(zustandPersist, {
  transformOptions: (options, identity) => {
    const contextOptions = { ...options };

    // Disable persistence for default instances
    if (!identity.instanceId || identity.instanceId === 'default') {
      return { ...contextOptions, storage: null };
    }

    // Create instance-specific storage keys
    if (typeof contextOptions.name === 'string') {
      contextOptions.name = `${contextOptions.name}-${identity.instanceId}`;
    } else {
      contextOptions.name = `${identity.contextName}-${identity.instanceId}`;
    }

    // Add custom prefix or suffix
    contextOptions.name = `app_${contextOptions.name}_v1`;

    return contextOptions;
  },
});
```

  </TabItem>
  <TabItem value="js" label="JavaScript">

```jsx
import { adaptMiddleware } from '@mag1yar/zustand-context/middleware';
import { persist as zustandPersist } from 'zustand/middleware';

export const customPersist = adaptMiddleware(zustandPersist, {
  transformOptions: (options, identity) => {
    const contextOptions = { ...options };

    // Disable persistence for default instances
    if (!identity.instanceId || identity.instanceId === 'default') {
      return { ...contextOptions, storage: null };
    }

    // Create instance-specific storage keys
    if (typeof contextOptions.name === 'string') {
      contextOptions.name = `${contextOptions.name}-${identity.instanceId}`;
    } else {
      contextOptions.name = `${identity.contextName}-${identity.instanceId}`;
    }

    // Add custom prefix or suffix
    contextOptions.name = `app_${contextOptions.name}_v1`;

    return contextOptions;
  },
});
```

  </TabItem>
</Tabs>

## Default Transformation Behavior

When no custom transformer is provided, `adaptMiddleware` uses a default transformation that:

1. Clones the original options object
2. If `options.name` is a string, appends the instanceId to create a unique identifier
3. Preserves all other original options

```js
// Default transformation logic
if ('name' in contextOptions && typeof contextOptions.name === 'string') {
  const originalName = contextOptions.name;
  contextOptions.name = identity.instanceId
    ? `${originalName}-${identity.instanceId}`
    : originalName;
}
```
