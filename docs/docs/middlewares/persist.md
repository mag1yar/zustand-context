# Persist

The `persist` middleware in zustand-context builds on Zustand's original persist middleware with important modifications for multi-instance support.

## Key Differences from Zustand's Persist

1. **Instance-aware storage keys**: Each instance automatically gets a unique storage key based on the instanceId
2. **Default instance behavior**: The default instance (`instanceId="default"` or not specified) disables persistence by default
3. **Inheritance-friendly**: Works correctly with the hierarchical Provider system

## Basic Usage

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs groupId="language">
  <TabItem value="ts" label="TypeScript" default>

```tsx
import { create } from '@mag1yar/zustand-context';
import { persist } from '@mag1yar/zustand-context/middleware';

type ProfileState = {
  username: string;
  theme: 'light' | 'dark';
  setUsername: (name: string) => void;
  toggleTheme: () => void;
};

const useProfileStore = create<ProfileState>(
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
      name: 'user-profile',
    },
  ),
  {
    name: 'UserProfile',
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

      {/* This instance WILL persist (has explicit instanceId) */}
      <useProfileStore.Provider instanceId="user1">
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

const useProfileStore = create(
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
      name: 'user-profile',
    },
  ),
  {
    name: 'UserProfile',
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

      {/* This instance WILL persist (has explicit instanceId) */}
      <useProfileStore.Provider instanceId="user1">
        <PersistedProfile />
      </useProfileStore.Provider>
    </>
  );
}
```

  </TabItem>
</Tabs>

## Storage Options

The persist middleware supports all the same storage options as Zustand's persist middleware:

<Tabs groupId="language">
  <TabItem value="ts" label="TypeScript" default>

```tsx
import { create } from '@mag1yar/zustand-context';
import { persist, createJSONStorage } from '@mag1yar/zustand-context/middleware';

const useSessionStore = create(
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

const useSessionStore = create(
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

# Best Practices

1. **Use explicit instance IDs** for any store that needs persistence
2. **Keep storage keys descriptive** - they're automatically namespaced with instanceId
3. **Remember inheritance** - child providers can inherit from parent, but each has its own persistence
4. **Use partialize** to control exactly what gets persisted, especially for stores with complex state
