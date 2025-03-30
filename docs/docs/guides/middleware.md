---
sidebar_position: 4
---

# Middleware Integration

zustand-context is fully compatible with Zustand's middleware ecosystem. This guide explores how to use popular middleware with your context-aware stores.

## Understanding Middleware

Middleware in Zustand wraps your store creation to add extra functionality. Common use cases include:

- **Persistence** - Saving state to localStorage or other storage
- **Immer** - More convenient state updates with Immer
- **Redux DevTools** - Debugging state changes
- **Logger** - Logging state changes
- **Custom middleware** - Creating your own middleware

## Basic Middleware Usage

To use middleware with zustand-context, you apply it to the state creator function:

```tsx
import { create } from 'zustand-context';
import { persist, devtools, immer } from 'zustand/middleware';

const useStore = create<MyState>(
  middleware1(
    middleware2((set, get) => ({
      // Your state and actions
    })),
  ),
  {
    name: 'StoreName', // Required for zustand-context
    // Other zustand-context options
  },
);
```

## Persist Middleware

The `persist` middleware saves your state to storage (like localStorage) and rehydrates it when the store is created:

```tsx
import { create } from 'zustand-context';
import { persist } from 'zustand/middleware';

interface SettingsState {
  theme: 'light' | 'dark';
  fontSize: 'small' | 'medium' | 'large';
  notifications: boolean;
  setTheme: (theme: 'light' | 'dark') => void;
  setFontSize: (size: 'small' | 'medium' | 'large') => void;
  toggleNotifications: () => void;
}

const useSettingsStore = create<SettingsState>(
  persist(
    (set) => ({
      theme: 'light',
      fontSize: 'medium',
      notifications: true,
      setTheme: (theme) => set({ theme }),
      setFontSize: (fontSize) => set({ fontSize }),
      toggleNotifications: () => set((state) => ({ notifications: !state.notifications })),
    }),
    {
      name: 'settings-storage', // Storage key
      storage: localStorage, // Default is localStorage
      // Optional: Select which parts of state to persist
      partialize: (state) => ({
        theme: state.theme,
        fontSize: state.fontSize,
        notifications: state.notifications,
      }),
    },
  ),
  {
    name: 'Settings', // Required for zustand-context
  },
);
```

### Per-Instance Persistence

What makes zustand-context especially powerful with persist middleware is the ability to have different persistence for different instances:

```tsx
import { create } from 'zustand-context';
import { persist } from 'zustand/middleware';

// Create the store with persistence
const useUserSettingsStore = create<SettingsState>(
  persist(
    (set) => ({
      theme: 'light',
      fontSize: 'medium',
      notifications: true,
      setTheme: (theme) => set({ theme }),
      setFontSize: (fontSize) => set({ fontSize }),
      toggleNotifications: () => set((state) => ({ notifications: !state.notifications })),
    }),
    {
      // Use a function for dynamic storage key based on instance
      name: (storeId) => `user-settings-${storeId || 'default'}`,
      storage: localStorage,
    },
  ),
  {
    name: 'UserSettings',
  },
);

// Usage with multiple instances, each with its own persistence
function App() {
  return (
    <div>
      <useUserSettingsStore.Provider instanceId="user1">
        <UserSettings userId="user1" />
      </useUserSettingsStore.Provider>

      <useUserSettingsStore.Provider instanceId="user2">
        <UserSettings userId="user2" />
      </useUserSettingsStore.Provider>
    </div>
  );
}
```

Each instance gets its own storage key, resulting in separate persisted state for each user.

## Immer Middleware

The `immer` middleware makes state updates more convenient, especially for complex nested objects, using Immer's produce function:

```tsx
import { create } from 'zustand-context';
import { immer } from 'zustand/middleware/immer';

interface TodoState {
  todos: {
    id: string;
    text: string;
    completed: boolean;
    tags: string[];
  }[];
  addTodo: (text: string) => void;
  toggleTodo: (id: string) => void;
  addTag: (todoId: string, tag: string) => void;
  removeTag: (todoId: string, tagIndex: number) => void;
}

const useTodoStore = create<TodoState>(
  immer((set) => ({
    todos: [],
    addTodo: (text) =>
      set((state) => {
        // Immer allows direct "mutations"
        state.todos.push({
          id: Date.now().toString(),
          text,
          completed: false,
          tags: [],
        });
      }),
    toggleTodo: (id) =>
      set((state) => {
        const todo = state.todos.find((t) => t.id === id);
        if (todo) {
          todo.completed = !todo.completed;
        }
      }),
    addTag: (todoId, tag) =>
      set((state) => {
        const todo = state.todos.find((t) => t.id === todoId);
        if (todo) {
          todo.tags.push(tag);
        }
      }),
    removeTag: (todoId, tagIndex) =>
      set((state) => {
        const todo = state.todos.find((t) => t.id === todoId);
        if (todo && tagIndex >= 0 && tagIndex < todo.tags.length) {
          todo.tags.splice(tagIndex, 1);
        }
      }),
  })),
  {
    name: 'TodoStore',
  },
);
```

Immer lets you write simpler code for complex state updates by allowing you to "mutate" the draft state directly.

## DevTools Middleware

The `devtools` middleware connects your store to Redux DevTools for state inspection and time-travel debugging:

```tsx
import { create } from 'zustand-context';
import { devtools } from 'zustand/middleware';

interface CounterState {
  count: number;
  increment: () => void;
  decrement: () => void;
  reset: () => void;
}

const useCounterStore = create<CounterState>(
  devtools(
    (set) => ({
      count: 0,
      increment: () => set((state) => ({ count: state.count + 1 }), false, 'increment'),
      decrement: () => set((state) => ({ count: state.count - 1 }), false, 'decrement'),
      reset: () => set({ count: 0 }, false, 'reset'),
    }),
    {
      name: 'Counter', // Name shown in Redux DevTools
      // Other devtools options
    },
  ),
  {
    name: 'Counter', // Required for zustand-context
  },
);
```

### Instance-Specific DevTools

When using multiple instances, you can create instance-specific DevTools labels:

```tsx
import { create } from 'zustand-context';
import { devtools } from 'zustand/middleware';

const useCounterStore = create<CounterState>(
  devtools(
    (set) => ({
      count: 0,
      increment: () => set((state) => ({ count: state.count + 1 }), false, 'increment'),
      decrement: () => set((state) => ({ count: state.count - 1 }), false, 'decrement'),
      reset: () => set({ count: 0 }, false, 'reset'),
    }),
    {
      // Use a function for dynamic name based on instance
      name: (storeId) => `Counter-${storeId || 'default'}`,
    },
  ),
  {
    name: 'Counter',
  },
);

// Multiple instances with distinct DevTools labels
function App() {
  return (
    <div>
      <useCounterStore.Provider instanceId="team1">
        <Counter team="team1" />
      </useCounterStore.Provider>

      <useCounterStore.Provider instanceId="team2">
        <Counter team="team2" />
      </useCounterStore.Provider>
    </div>
  );
}
```

## Combining Multiple Middleware

You can compose multiple middleware together:

```tsx
import { create } from 'zustand-context';
import { persist, devtools, immer } from 'zustand/middleware';

const useStore = create<MyState>(
  persist(
    devtools(
      immer((set) => ({
        // Your state and actions
      })),
    ),
    { name: 'storage-key' },
  ),
  {
    name: 'StoreName',
  },
);
```

The order of middleware matters. In this example:

1. `immer` is applied first, allowing "mutative" updates
2. `devtools` wraps those updates for debugging
3. `persist` handles saving the state to storage

## Creating Custom Middleware

You can create custom middleware for zustand-context:

```tsx
import { create } from 'zustand-context';
import { StateCreator, StoreApi } from 'zustand';

// Define a logger middleware
const logger =
  <T extends object>(config: StateCreator<T>): StateCreator<T> =>
  (set, get, api) =>
    config(
      (args) => {
        console.log('Applying state:', args);
        set(args);
        console.log('New state:', get());
      },
      get,
      api,
    );

// Create a store with custom middleware
const useLoggedStore = create<MyState>(
  logger((set) => ({
    // Your state and actions
  })),
  {
    name: 'LoggedStore',
  },
);
```

### Advanced Custom Middleware

For more complex middleware that needs to interact with the context:

```tsx
import { create } from 'zustand-context';
import { StateCreator } from 'zustand';

// Middleware that logs instance ID
const instanceLogger =
  <T extends object>(config: StateCreator<T>): StateCreator<T> =>
  (set, get, api: any) => {
    // Store the original onCreate handler
    const originalOnCreate = api.setState;

    // Replace it with our own
    api.setState = (...args: any[]) => {
      // Get the store ID if available
      const storeId = api._storeId || 'unknown';
      console.log(`[Store ${storeId}] setState called`);

      // Call the original
      return originalOnCreate(...args);
    };

    return config(set, get, api);
  };

// Create the store with custom middleware
const useLoggedStore = create<MyState>(
  instanceLogger((set) => ({
    // Your state and actions
  })),
  {
    name: 'LoggedStore',
  },
);
```

## TypeScript with Middleware

Using TypeScript with middleware requires some type annotations:

```tsx
import { create } from 'zustand-context';
import { StateCreator } from 'zustand';
import { persist, PersistOptions } from 'zustand/middleware';

// Define your state interface
interface SettingsState {
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
}

// Define persist options type
type SettingsPersist = (
  config: StateCreator<SettingsState>,
  options: PersistOptions<SettingsState>,
) => StateCreator<SettingsState>;

// Create the store with typed middleware
const useSettingsStore = create<SettingsState>(
  (persist as SettingsPersist)(
    (set) => ({
      theme: 'light',
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'settings',
    },
  ),
  {
    name: 'Settings',
  },
);
```

For multiple middleware, the typing gets more complex:

```tsx
import { create } from 'zustand-context';
import { StateCreator } from 'zustand';
import { persist, devtools, immer } from 'zustand/middleware';
import { Mutate, StoreApi } from 'zustand/vanilla';

// Your state interface
interface TodoState {
  todos: any[];
  addTodo: (text: string) => void;
}

// Define middleware types
type ImmerMiddleware = <T extends object, Mps extends [['zustand/immer', never]], Mcs extends []>(
  initializer: StateCreator<T, [...Mps, ...Mcs]>,
) => StateCreator<T, Mps, Mcs>;

type DevtoolsMiddleware = <
  T extends object,
  Mps extends [['zustand/devtools', never]],
  Mcs extends [],
>(
  initializer: StateCreator<T, [...Mps, ...Mcs]>,
  devtoolsOptions?: any,
) => StateCreator<T, Mps, Mcs>;

type PersistMiddleware = <
  T extends object,
  Mps extends [['zustand/persist', unknown]],
  Mcs extends [],
>(
  initializer: StateCreator<T, [...Mps, ...Mcs]>,
  persistOptions: any,
) => StateCreator<T, Mps, Mcs>;

// Create the store with properly typed middleware
const useTodoStore = create<TodoState>()(
  (persist as unknown as PersistMiddleware)(
    (devtools as unknown as DevtoolsMiddleware)(
      (immer as unknown as ImmerMiddleware)((set) => ({
        todos: [],
        addTodo: (text) =>
          set((state) => {
            state.todos.push({ id: Date.now(), text, completed: false });
          }),
      })),
    ),
    { name: 'todos-storage' },
  ),
  {
    name: 'Todos',
  },
);
```

While this full typing is complex, in practice you can often simplify it with `as any` for middleware composition without losing type safety for your state and actions.

## Best Practices

1. **Start simple, add middleware as needed** - Don't add middleware until you need its functionality.

2. **Consider middleware order** - The order of middleware matters. Generally:

   - `immer` should be first (innermost)
   - `devtools` should wrap most other middleware
   - `persist` is typically the outermost wrapper

3. **Use instance-specific storage keys** - When using persist middleware with multiple instances, use dynamic storage keys.

4. **Balance DevTools usage** - Too many instances with DevTools can get overwhelming. Consider enabling DevTools selectively.

5. **Custom middleware for cross-cutting concerns** - Create custom middleware for functionality that should apply across all stores.

6. **Test middleware thoroughly** - Middleware can introduce subtle bugs. Test your stores with middleware applied.

7. **Document middleware behavior** - Especially for custom middleware, document how it affects the store behavior.

By effectively using middleware, you can enhance your zustand-context stores with powerful capabilities like persistence, easier state updates, and better debugging tools while maintaining the benefits of context-aware state management.
