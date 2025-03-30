---
sidebar_position: 4
---

# Types

zustand-context is fully typed with TypeScript. This page documents the main types that you'll encounter when using the library.

## Core Types

### ContextOptions

Options for configuring a context-aware store.

```ts
interface ContextOptions<T> {
  // Display name for debugging and errors (REQUIRED!)
  name: string;

  // ID for default context instance
  defaultInstanceId?: string | symbol;

  // Throw errors when Provider is missing
  strict?: boolean;

  // Default state when no Provider is available (requires strict: false)
  defaultState?: T;

  // Equality function for selectors
  equalityFn?: <S>(a: S, b: S) => boolean;

  // Error handling
  onError?: (error: Error) => void;

  // Merge strategy options for initialState
  mergeOptions?: {
    shallow?: boolean;
    whitelist?: (keyof T)[];
    blacklist?: (keyof T)[];
    customMerge?: (oldState: T, newState: DeepPartial<T>) => T;
  };

  // Enable debug mode
  debug?: boolean;
}
```

### ProviderProps

Props for the Provider component.

```ts
interface ProviderProps<T> {
  // Unique identifier for this context instance
  instanceId?: string | symbol;

  // Initial state to merge with the default state
  initialState?: DeepPartial<T>;

  // Strategy for merging initialState with default state
  mergeStrategy?: 'shallow' | 'deep' | 'replace';

  // Child components
  children: React.ReactNode;
}
```

### ContextStore

The hook and attached methods returned by the `create` function.

```ts
interface ContextStore<T> {
  // Base hook function
  (): T;
  <U>(selector: (state: T) => U, equalityFn?: (a: U, b: U) => boolean): U;

  // Access specific context instance
  from: (instanceId?: string | symbol) => {
    (): T;
    <U>(selector: (state: T) => U, equalityFn?: (a: U, b: U) => boolean): U;
  };

  // Provider component
  Provider: React.FC<ProviderProps<T>>;

  // Check if provider exists (without throwing)
  useProxySelector: (fallback: T) => T;

  // Raw context for advanced usage
  _context: React.Context<{
    stores: ContextMap<T>;
    defaultStore: StoreApi<T>;
  } | null>;

  // Optional debug utilities
  _debug?: {
    getOptions: () => ContextOptions<T>;
  };
}
```

### DeepPartial

A recursive partial type that makes all properties optional, including nested objects.

```ts
type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>;
    }
  : T;
```

## Utility Types

### ContextMap

A map of context instance IDs to store APIs.

```ts
type ContextMap<T> = Map<string | symbol, StoreApi<T>>;
```

## Example Usage

### Defining a Store with Types

```tsx
import { create } from 'zustand-context';

// Define your state interface
interface UserState {
  user: {
    id: string;
    name: string;
    preferences: {
      theme: 'light' | 'dark';
      notifications: boolean;
    };
  } | null;
  isLoading: boolean;
  error: string | null;
  setUser: (user: UserState['user']) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  clearUser: () => void;
}

// Create the store with proper typing
const useUserStore = create<UserState>(
  (set) => ({
    user: null,
    isLoading: false,
    error: null,
    setUser: (user) => set({ user }),
    setTheme: (theme) =>
      set((state) => ({
        user: state.user
          ? { ...state.user, preferences: { ...state.user.preferences, theme } }
          : null,
      })),
    clearUser: () => set({ user: null }),
  }),
  { name: 'UserStore' },
);
```

### Using Provider with DeepPartial

The `initialState` prop uses `DeepPartial<T>`, so you only need to specify the properties you want to change:

```tsx
<useUserStore.Provider
  initialState={{
    user: {
      id: '123',
      name: 'John',
      // We don't need to specify all properties
      preferences: {
        theme: 'dark',
        // 'notifications' can be omitted
      },
    },
  }}
  mergeStrategy="deep">
  <UserProfile />
</useUserStore.Provider>
```

### Using TypeScript with Selectors

```tsx
function UserProfile() {
  // TypeScript infers the correct types
  const userName = useUserStore((state) => state.user?.name);
  const theme = useUserStore((state) => state.user?.preferences.theme);
  const setTheme = useUserStore((state) => state.setTheme);

  return (
    <div>
      <h2>User: {userName || 'Not logged in'}</h2>
      {theme && (
        <div>
          <p>Theme: {theme}</p>
          <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
            Toggle Theme
          </button>
        </div>
      )}
    </div>
  );
}
```

## Advanced Type Patterns

### Union Types with Discriminated Unions

```tsx
type UserState =
  | { status: 'unauthenticated' }
  | { status: 'authenticated'; user: { id: string; name: string } }
  | { status: 'loading' };

const useAuthStore = create<{
  auth: UserState;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}>(
  (set) => ({
    auth: { status: 'unauthenticated' },
    login: async (username, password) => {
      set({ auth: { status: 'loading' } });
      try {
        // API call...
        set({
          auth: {
            status: 'authenticated',
            user: { id: '123', name: username },
          },
        });
      } catch (error) {
        set({ auth: { status: 'unauthenticated' } });
      }
    },
    logout: () => set({ auth: { status: 'unauthenticated' } }),
  }),
  { name: 'AuthStore' },
);

// Usage with type narrowing
function AuthStatus() {
  const auth = useAuthStore((state) => state.auth);

  if (auth.status === 'loading') {
    return <div>Loading...</div>;
  }

  if (auth.status === 'authenticated') {
    // TypeScript knows auth.user exists here
    return <div>Welcome, {auth.user.name}!</div>;
  }

  return <div>Please log in</div>;
}
```

### Generic Stores

You can create reusable generic stores for common patterns:

```tsx
// Generic paginated list store
function createPaginatedListStore<T>(
  fetchItems: (page: number) => Promise<T[]>,
  options?: { pageSize?: number },
) {
  return create<{
    items: T[];
    currentPage: number;
    isLoading: boolean;
    hasMore: boolean;
    fetchPage: (page: number) => Promise<void>;
    fetchNextPage: () => Promise<void>;
  }>(
    (set, get) => ({
      items: [],
      currentPage: 0,
      isLoading: false,
      hasMore: true,
      fetchPage: async (page) => {
        set({ isLoading: true });
        try {
          const items = await fetchItems(page);
          set({
            items,
            currentPage: page,
            isLoading: false,
            hasMore: items.length === (options?.pageSize || 10),
          });
        } catch (error) {
          set({ isLoading: false, hasMore: false });
        }
      },
      fetchNextPage: async () => {
        const { hasMore, isLoading, currentPage, fetchPage } = get();
        if (!hasMore || isLoading) return;
        await fetchPage(currentPage + 1);
      },
    }),
    { name: 'PaginatedList' },
  );
}

// Usage with specific type
const useUserListStore = createPaginatedListStore<{
  id: string;
  name: string;
  email: string;
}>(
  async (page) => {
    // Fetch users for the specified page
    return await fetchUsers(page);
  },
  { pageSize: 20 },
);
```

## Type Extensions

### Extending Existing Stores

You can extend an existing store type:

```tsx
// Base store
interface BaseState {
  count: number;
  increment: () => void;
}

const useBaseStore = create<BaseState>(
  (set) => ({
    count: 0,
    increment: () => set((state) => ({ count: state.count + 1 })),
  }),
  { name: 'BaseStore' },
);

// Extended store
interface ExtendedState extends BaseState {
  double: number;
  multiply: (factor: number) => void;
}

const useExtendedStore = create<ExtendedState>(
  (set) => ({
    ...useBaseStore.getState(),
    double: useBaseStore.getState().count * 2,
    multiply: (factor) => set((state) => ({ count: state.count * factor })),
  }),
  { name: 'ExtendedStore' },
);
```

## Type Inference Helpers

### Helper for Type Inference

Sometimes you may want to extract the state type from a store:

```tsx
// Helper to extract state type from a store
type StoreState<T> = T extends ContextStore<infer S> ? S : never;

// Usage
const useFormStore = create<{
  values: Record<string, any>;
  setField: (field: string, value: any) => void;
}>(
  (set) => ({
    values: {},
    setField: (field, value) =>
      set((state) => ({
        values: { ...state.values, [field]: value },
      })),
  }),
  { name: 'FormStore' },
);

// Extract the state type
type FormState = StoreState<typeof useFormStore>;

// Now we can use FormState elsewhere
function updateForm(state: FormState) {
  // ...
}
```

These type definitions ensure that your zustand-context code is fully type-safe and provides excellent developer experience with IDE autocompletion and type checking.
