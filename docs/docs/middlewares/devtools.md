# devtools

The `devtools` middleware in zustand-context is adapted from Zustand's original devtools middleware to work correctly with multiple store instances. It ensures each provider instance appears with a unique identifier in Redux DevTools while maintaining the familiar devtools API.

:::note
When using middleware with zustand-context, you must use the double function call pattern: `create()()`. This applies to both TypeScript and JavaScript and ensures proper type inference and middleware compatibility.
:::

## Key Differences from Zustand's DevTools

1. **Instance-aware naming**: Each instance gets a unique name in Redux DevTools based on the instanceId
2. **Default instance visibility**: All instances, including default ones, appear in Redux DevTools
3. **Automatic name generation**: If no name is provided, the store's context name is used

## How It Works

Here's how the devtools middleware is adapted for zustand-context:

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs groupId="language">
  <TabItem value="ts" label="TypeScript" default>

```tsx
import { devtools as zustandDevtools } from 'zustand/middleware';
import { adaptMiddleware } from './utils';

export const devtools = adaptMiddleware(zustandDevtools, {
  transformOptions: (options, identity) => {
    const contextOptions = { ...options };

    // If name is already provided, enhance it
    if (typeof contextOptions.name === 'string') {
      // For non-default instances, append instance ID
      if (identity.instanceId && identity.instanceId !== 'default') {
        contextOptions.name = `${contextOptions.name}-${identity.instanceId}`;
      }
    } else {
      // No name provided, create one using context name
      if (identity.instanceId && identity.instanceId !== 'default') {
        contextOptions.name = `${identity.contextName}-${identity.instanceId}`;
      } else {
        // Default instance uses just the context name
        contextOptions.name = identity.contextName;
      }
    }

    return contextOptions;
  },
});
```

  </TabItem>
  <TabItem value="js" label="JavaScript">

```jsx
import { devtools as zustandDevtools } from 'zustand/middleware';
import { adaptMiddleware } from './utils';

export const devtools = adaptMiddleware(zustandDevtools, {
  transformOptions: (options, identity) => {
    const contextOptions = { ...options };

    // If name is already provided, enhance it
    if (typeof contextOptions.name === 'string') {
      // For non-default instances, append instance ID
      if (identity.instanceId && identity.instanceId !== 'default') {
        contextOptions.name = `${contextOptions.name}-${identity.instanceId}`;
      }
    } else {
      // No name provided, create one using context name
      if (identity.instanceId && identity.instanceId !== 'default') {
        contextOptions.name = `${identity.contextName}-${identity.instanceId}`;
      } else {
        // Default instance uses just the context name
        contextOptions.name = identity.contextName;
      }
    }

    return contextOptions;
  },
});
```

  </TabItem>
</Tabs>

## Basic Usage

<Tabs groupId="language">
  <TabItem value="ts" label="TypeScript" default>

```tsx
import { create } from '@mag1yar/zustand-context';
import { devtools } from '@mag1yar/zustand-context/middleware';

interface CounterState {
  count: number;
  increment: () => void;
  reset: () => void;
}

const useCounterStore = create<CounterState>()(
  devtools(
    (set) => ({
      count: 0,
      increment: () => set((state) => ({ count: state.count + 1 })),
      reset: () => set({ count: 0 }),
    }),
    {
      name: 'Counter', // Optional: custom name for Redux DevTools
    },
  ),
  {
    name: 'Counter', // Required: context name
  },
);

// Usage with multiple instances
function App() {
  return (
    <>
      {/* Shows as "Counter" in Redux DevTools */}
      <useCounterStore.Provider>
        <DefaultCounter />
      </useCounterStore.Provider>

      {/* Shows as "Counter-header" in Redux DevTools */}
      <useCounterStore.Provider instanceId="header">
        <HeaderCounter />
      </useCounterStore.Provider>

      {/* Shows as "Counter-dashboard" in Redux DevTools */}
      <useCounterStore.Provider instanceId="dashboard">
        <DashboardCounter />
      </useCounterStore.Provider>
    </>
  );
}
```

  </TabItem>
  <TabItem value="js" label="JavaScript">

```jsx
import { create } from '@mag1yar/zustand-context';
import { devtools } from '@mag1yar/zustand-context/middleware';

const useCounterStore = create()(
  devtools(
    (set) => ({
      count: 0,
      increment: () => set((state) => ({ count: state.count + 1 })),
      reset: () => set({ count: 0 }),
    }),
    {
      name: 'Counter', // Optional: custom name for Redux DevTools
    },
  ),
  {
    name: 'CounterContext', // Required: context name
  },
);

// Usage with multiple instances
function App() {
  return (
    <>
      {/* Shows as "Counter" in Redux DevTools */}
      <useCounterStore.Provider>
        <DefaultCounter />
      </useCounterStore.Provider>

      {/* Shows as "Counter-header" in Redux DevTools */}
      <useCounterStore.Provider instanceId="header">
        <HeaderCounter />
      </useCounterStore.Provider>

      {/* Shows as "Counter-dashboard" in Redux DevTools */}
      <useCounterStore.Provider instanceId="dashboard">
        <DashboardCounter />
      </useCounterStore.Provider>
    </>
  );
}
```

  </TabItem>
</Tabs>

## Without Explicit Name

When no devtools name is provided, the context name is used:

<Tabs groupId="language">
  <TabItem value="ts" label="TypeScript" default>

```tsx
const useUserStore = create<UserState>()(
  devtools(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      logout: () => set({ user: null }),
    }),
    // No name provided - context name will be used
  ),
  {
    name: 'UserContext',
  },
);

// In Redux DevTools:
// - "UserContext" (default instance)
// - "UserContext-admin" (named instance)
```

  </TabItem>
  <TabItem value="js" label="JavaScript">

```jsx
const useUserStore = create()(
  devtools(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      logout: () => set({ user: null }),
    }),
    // No name provided - context name will be used
  ),
  {
    name: 'UserContext',
  },
);

// In Redux DevTools:
// - "UserContext" (default instance)
// - "UserContext-admin" (named instance)
```

  </TabItem>
</Tabs>

## DevTools Naming Table

Here's how different configurations appear in Redux DevTools:

| Devtools `name` option | Context `name`   | Context `instanceId` | DevTools display    |
| ---------------------- | ---------------- | -------------------- | ------------------- |
| "Counter"              | "CounterContext" | default/not set      | "Counter"           |
| "Counter"              | "CounterContext" | "header"             | "Counter-header"    |
| Not provided           | "UserContext"    | default/not set      | "UserContext"       |
| Not provided           | "UserContext"    | "admin"              | "UserContext-admin" |
