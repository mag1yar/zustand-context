# persist

The `persist` middleware in zustand-context is adapted from Zustand's original persist middleware to work correctly with multiple store instances. It ensures each provider instance has its own storage key while maintaining the familiar persist API.

:::note
When using middleware with zustand-context, you must use the double function call pattern: `create()()`. This applies to both TypeScript and JavaScript and ensures proper type inference and middleware compatibility.
:::

## Key Differences from Zustand's Persist

1. **Instance-aware storage keys**: Each instance automatically gets a unique storage key based on the instanceId
2. **Default instance behavior**: The default instance (`instanceId="default"` or not specified) disables persistence by default to avoid conflicts
3. **Automatic key scoping**: Storage keys are automatically prefixed with instanceId to prevent data collisions

## How It Works

Here's how the persist middleware is adapted for zustand-context:

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs groupId="language">
  <TabItem value="ts" label="TypeScript" default>

```tsx
import { persist as zustandPersist } from 'zustand/middleware';
import { adaptMiddleware } from './utils';

export const persist = adaptMiddleware(zustandPersist, {
  transformOptions: (options, identity) => {
    const contextOptions = { ...options };

    // For default instance, disable persistence
    if (!identity.instanceId || identity.instanceId === 'default') {
      return { ...contextOptions, storage: null };
    }

    // Create storage key with instanceId
    if (typeof contextOptions.name === 'string') {
      contextOptions.name = `${contextOptions.name}-${identity.instanceId}`;
    } else {
      // If no name provided, use contextName + instanceId
      contextOptions.name = `${identity.contextName}-${identity.instanceId}`;
    }

    return contextOptions;
  },
});
```

  </TabItem>
  <TabItem value="js" label="JavaScript">

```jsx
import { persist as zustandPersist } from 'zustand/middleware';
import { adaptMiddleware } from './utils';

export const persist = adaptMiddleware(zustandPersist, {
  transformOptions: (options, identity) => {
    const contextOptions = { ...options };

    // For default instance, disable persistence
    if (!identity.instanceId || identity.instanceId === 'default') {
      return { ...contextOptions, storage: null };
    }

    // Create storage key with instanceId
    if (typeof contextOptions.name === 'string') {
      contextOptions.name = `${contextOptions.name}-${identity.instanceId}`;
    } else {
      // If no name provided, use contextName + instanceId
      contextOptions.name = `${identity.contextName}-${identity.instanceId}`;
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
import { persist } from '@mag1yar/zustand-context/middleware';

interface ProfileState {
  username: string;
  theme: 'light' | 'dark';
  setUsername: (name: string) => void;
  toggleTheme: () => void;
}

const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      username: 'Guest',
      theme: 'light',
      setUsername: (name) => set({ username: name }),
      toggleTheme: () =>
        set((state) => ({
          theme: state.theme === 'light' ? 'dark' : 'light',
        })),
    }),
    {
      name: 'user-profile', // Storage key prefix
    },
  ),
  {
    name: 'UserProfile', // Context name
  },
);

// Usage with multiple instances
function App() {
  return (
    <>
      {/* This instance WON'T persist (default behavior) */}
      <useProfileStore.Provider>
        <DefaultProfile />
      </useProfileStore.Provider>

      {/* This instance WILL persist (key: "user-profile-user1") */}
      <useProfileStore.Provider instanceId="user1">
        <PersistedProfile />
      </useProfileStore.Provider>

      {/* This instance WILL persist (key: "user-profile-user2") */}
      <useProfileStore.Provider instanceId="user2">
        <PersistedProfile />
      </useProfileStore.Provider>
    </>
  );
}
```

  </TabItem>
  <TabItem value="js" label="JavaScript">

```jsx
import { create } from '@mag1yar/zustand-context';
import { persist } from '@mag1yar/zustand-context/middleware';

const useProfileStore = create()(
  persist(
    (set) => ({
      username: 'Guest',
      theme: 'light',
      setUsername: (name) => set({ username: name }),
      toggleTheme: () =>
        set((state) => ({
          theme: state.theme === 'light' ? 'dark' : 'light',
        })),
    }),
    {
      name: 'user-profile', // Storage key prefix
    },
  ),
  {
    name: 'UserProfile', // Context name
  },
);

// Usage with multiple instances
function App() {
  return (
    <>
      {/* This instance WON'T persist (default behavior) */}
      <useProfileStore.Provider>
        <DefaultProfile />
      </useProfileStore.Provider>

      {/* This instance WILL persist (key: "user-profile-user1") */}
      <useProfileStore.Provider instanceId="user1">
        <PersistedProfile />
      </useProfileStore.Provider>

      {/* This instance WILL persist (key: "user-profile-user2") */}
      <useProfileStore.Provider instanceId="user2">
        <PersistedProfile />
      </useProfileStore.Provider>
    </>
  );
}
```

  </TabItem>
</Tabs>

## Advanced Usage

### Custom Storage

The persist middleware supports all storage options from Zustand:

<Tabs groupId="language">
  <TabItem value="ts" label="TypeScript" default>

```tsx
import { create } from '@mag1yar/zustand-context';
import { persist, createJSONStorage } from '@mag1yar/zustand-context/middleware';
import type { StateStorage } from 'zustand/middleware';

interface SessionState {
  sessionData: Record<string, unknown>;
  updateSession: (data: Record<string, unknown>) => void;
}

const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      sessionData: {},
      updateSession: (data) => set({ sessionData: data }),
    }),
    {
      name: 'session',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({ sessionData: state.sessionData }),
    },
  ),
  {
    name: 'Session',
  },
);
```

  </TabItem>
  <TabItem value="js" label="JavaScript">

```jsx
import { create } from '@mag1yar/zustand-context';
import { persist, createJSONStorage } from '@mag1yar/zustand-context/middleware';

const useSessionStore = create()(
  persist(
    (set) => ({
      sessionData: {},
      updateSession: (data) => set({ sessionData: data }),
    }),
    {
      name: 'session',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({ sessionData: state.sessionData }),
    },
  ),
  {
    name: 'Session',
  },
);
```

  </TabItem>
</Tabs>

## Storage Keys in Practice

Here's how storage keys are generated for different scenarios:

| Persist `name` option | Context `instanceId` | Final storage key      |
| --------------------- | -------------------- | ---------------------- |
| "user-profile"        | "user1"              | "user-profile-user1"   |
| "user-profile"        | "admin"              | "user-profile-admin"   |
| Not provided          | "user1"              | "ProfileContext-user1" |
| "settings"            | default/not set      | (no persistence)       |
