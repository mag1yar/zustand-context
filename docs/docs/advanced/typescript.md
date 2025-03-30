---
sidebar_position: 1
---

# TypeScript Integration

zustand-context is built with TypeScript from the ground up. This guide covers advanced TypeScript patterns and techniques to get the most out of type safety when using zustand-context.

## Basic Type Safety

At its core, zustand-context uses generics to provide type safety for your stores:

```tsx
interface CounterState {
  count: number;
  increment: () => void;
  decrement: () => void;
}

const useCounterStore = create<CounterState>(
  (set) => ({
    count: 0,
    increment: () => set((state) => ({ count: state.count + 1 })),
    decrement: () => set((state) => ({ count: state.count - 1 })),
  }),
  { name: 'Counter' },
);

// TypeScript knows the correct types
const count = useCounterStore((state) => state.count); // number
const increment = useCounterStore((state) => state.increment); // () => void
```

## DeepPartial for Initial State

One of the powerful type features of zustand-context is the `DeepPartial<T>` type used for `initialState`. This allows you to provide partial state at any level of nesting:

```tsx
interface NestedState {
  user: {
    profile: {
      name: string;
      email: string;
      settings: {
        theme: 'light' | 'dark';
        notifications: boolean;
      };
    };
    permissions: string[];
  };
  app: {
    isLoading: boolean;
    error: string | null;
  };
}

const useNestedStore = create<NestedState>(
  () => ({
    user: {
      profile: {
        name: '',
        email: '',
        settings: {
          theme: 'light',
          notifications: true,
        },
      },
      permissions: [],
    },
    app: {
      isLoading: false,
      error: null,
    },
  }),
  { name: 'NestedStore' },
);

// TypeScript correctly allows partial nested state
<useNestedStore.Provider
  initialState={{
    user: {
      profile: {
        settings: {
          theme: 'dark',
          // No need to specify all other properties
        },
      },
    },
  }}>
  <Component />
</useNestedStore.Provider>;
```

The `DeepPartial<T>` type is defined as:

```ts
type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>;
    }
  : T;
```

This recursively makes all properties optional, including those in nested objects.

## Type-Safe Selectors

When using selectors, TypeScript can infer the return type:

```tsx
// TypeScript infers count as number
const count = useCounterStore((state) => state.count);

// TypeScript infers a custom return type
const doubled = useCounterStore((state) => state.count * 2);

// TypeScript infers a composite type
const status = useCounterStore((state) => ({
  count: state.count,
  isPositive: state.count > 0,
}));
```

For more complex selectors, you can explicitly type the return value:

```tsx
interface CountSummary {
  value: number;
  isPositive: boolean;
  isEven: boolean;
}

// Explicitly typed selector
const summary = useCounterStore(
  (state): CountSummary => ({
    value: state.count,
    isPositive: state.count > 0,
    isEven: state.count % 2 === 0,
  }),
);
```

## Type-Safe `from` Method

The `from` method preserves type safety when accessing specific instances:

```tsx
// TypeScript still knows the correct types
const teamName = useTeamStore.from('team1')((state) => state.name); // string
const incrementScore = useTeamStore.from('team1')((state) => state.incrementScore); // () => void
```

## Discriminated Unions

Discriminated unions are a powerful TypeScript pattern for modeling state that can be in different shapes based on a discriminator property:

```tsx
// Define a discriminated union for authentication state
type AuthState =
  | { status: 'unauthenticated' }
  | { status: 'authenticating'; username: string }
  | { status: 'authenticated'; user: { id: string; name: string; email: string } }
  | { status: 'error'; error: string };

interface AuthStore {
  auth: AuthState;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const useAuthStore = create<AuthStore>(
  (set) => ({
    auth: { status: 'unauthenticated' },
    login: async (username, password) => {
      set({ auth: { status: 'authenticating', username } });
      try {
        // Simulate API call
        const user = await fetchUser(username, password);
        set({ auth: { status: 'authenticated', user } });
      } catch (error) {
        set({ auth: { status: 'error', error: error.message } });
      }
    },
    logout: () => set({ auth: { status: 'unauthenticated' } }),
  }),
  { name: 'AuthStore' },
);

// Usage with type narrowing
function AuthStatus() {
  const auth = useAuthStore((state) => state.auth);

  // TypeScript narrows the type based on status
  switch (auth.status) {
    case 'unauthenticated':
      return <LoginForm />;

    case 'authenticating':
      // TypeScript knows auth.username exists here
      return <div>Authenticating {auth.username}...</div>;

    case 'authenticated':
      // TypeScript knows auth.user exists here
      return <div>Welcome, {auth.user.name}!</div>;

    case 'error':
      // TypeScript knows auth.error exists here
      return <div>Error: {auth.error}</div>;
  }
}
```

## Generics for Reusable Stores

You can create reusable store factories with generics:

```tsx
// Generic paginated list store creator
function createPaginatedListStore<T>(fetchItems: (page: number) => Promise<T[]>) {
  return create<{
    items: T[];
    currentPage: number;
    isLoading: boolean;
    hasMore: boolean;
    error: string | null;
    fetchPage: (page: number) => Promise<void>;
    fetchNextPage: () => Promise<void>;
    fetchPreviousPage: () => Promise<void>;
  }>(
    (set, get) => ({
      items: [],
      currentPage: 1,
      isLoading: false,
      hasMore: true,
      error: null,
      fetchPage: async (page) => {
        set({ isLoading: true, error: null });
        try {
          const items = await fetchItems(page);
          set({
            items,
            currentPage: page,
            isLoading: false,
            hasMore: items.length > 0,
          });
        } catch (error) {
          set({
            isLoading: false,
            error: error.message || 'Failed to fetch items',
            hasMore: false,
          });
        }
      },
      fetchNextPage: async () => {
        const { hasMore, isLoading, currentPage, fetchPage } = get();
        if (!hasMore || isLoading) return;
        await fetchPage(currentPage + 1);
      },
      fetchPreviousPage: async () => {
        const { isLoading, currentPage, fetchPage } = get();
        if (currentPage <= 1 || isLoading) return;
        await fetchPage(currentPage - 1);
      },
    }),
    { name: 'PaginatedList' },
  );
}

// Create a store for users with strong typing
interface User {
  id: string;
  name: string;
  email: string;
}

const useUserListStore = createPaginatedListStore<User>(async (page) => {
  const response = await fetch(`/api/users?page=${page}`);
  return response.json();
});

// Create a store for products with strong typing
interface Product {
  id: string;
  title: string;
  price: number;
  category: string;
}

const useProductListStore = createPaginatedListStore<Product>(async (page) => {
  const response = await fetch(`/api/products?page=${page}`);
  return response.json();
});
```

## Type Inference Helpers

Create helper types to extract information from your store:

```tsx
// Extract the state type from a store
type StoreState<T> = T extends ContextStore<infer S> ? S : never;

// Extract a specific slice of state
type StoreSlice<T, K extends keyof StoreState<T>> = Pick<StoreState<T>, K>;

// Usage
type AuthState = StoreState<typeof useAuthStore>;
type AuthActions = StoreSlice<typeof useAuthStore, 'login' | 'logout'>;
```

## Type-Safe Actions

For complex actions that modify state, you can use type-safe patterns:

```tsx
interface TodoState {
  todos: { id: string; text: string; completed: boolean }[];
  addTodo: (text: string) => void;
  toggleTodo: (id: string) => void;
  updateTodo: (id: string, updates: Partial<Omit<TodoState['todos'][number], 'id'>>) => void;
  removeTodo: (id: string) => void;
}

const useTodoStore = create<TodoState>(
  (set) => ({
    todos: [],
    addTodo: (text) =>
      set((state) => ({
        todos: [...state.todos, { id: Date.now().toString(), text, completed: false }],
      })),
    toggleTodo: (id) =>
      set((state) => ({
        todos: state.todos.map((todo) =>
          todo.id === id ? { ...todo, completed: !todo.completed } : todo,
        ),
      })),
    updateTodo: (id, updates) =>
      set((state) => ({
        todos: state.todos.map((todo) => (todo.id === id ? { ...todo, ...updates } : todo)),
      })),
    removeTodo: (id) =>
      set((state) => ({
        todos: state.todos.filter((todo) => todo.id !== id),
      })),
  }),
  { name: 'TodoStore' },
);
```

## Advanced Type Patterns

### Branded Types

Use branded types for more type safety:

```tsx
// Create branded types
type UserId = string & { readonly __brand: unique symbol };
type TeamId = string & { readonly __brand: unique symbol };

// Helper functions to create branded types
const createUserId = (id: string): UserId => id as UserId;
const createTeamId = (id: string): TeamId => id as TeamId;

// Store with branded types
interface UserState {
  users: Record<string, { id: UserId; name: string }>;
  getUser: (id: UserId) => { id: UserId; name: string } | undefined;
  addUser: (name: string) => UserId;
}

const useUserStore = create<UserState>(
  (set, get) => ({
    users: {},
    getUser: (id) => get().users[id as string],
    addUser: (name) => {
      const id = createUserId(Date.now().toString());
      set((state) => ({
        users: { ...state.users, [id]: { id, name } },
      }));
      return id;
    },
  }),
  { name: 'UserStore' },
);

// Now these can't be accidentally mixed up
const userId: UserId = createUserId('user-123');
const teamId: TeamId = createTeamId('team-456');

// Type error: Argument of type 'TeamId' is not assignable to parameter of type 'UserId'
useUserStore.getState().getUser(teamId); // Error!
```

### Conditional Types

Use conditional types for advanced type logic:

```tsx
type Unpacked<T> = T extends (infer U)[]
  ? U
  : T extends (...args: any[]) => infer U
  ? U
  : T extends Promise<infer U>
  ? U
  : T;

// Helper to extract a selector return type
type SelectorResult<T, S> = S extends (state: T) => infer R ? R : never;

// Usage
type CountResult = SelectorResult<CounterState, (state: CounterState) => number>;
```

### React Component Props with Store

Create type-safe components that consume store state:

```tsx
// Higher-order component with store props
type WithStore<P, S> = P & {
  store: ContextStore<S>;
};

// User component with store props
function UserProfile<P extends WithStore<{}, UserState>>({ store, ...props }: P) {
  const user = store((state) => state.user);

  return (
    <div>
      <h2>{user.name}</h2>
      <p>{user.email}</p>
    </div>
  );
}

// Usage
<UserProfile store={useUserStore} />;
```

## Type-Safe Provider Props

The `ProviderProps` type is fully typed and ensures type safety for your provider components:

```tsx
<useStore.Provider
  // Type-safe instance ID
  instanceId="instance1"
  // Type-safe initial state with DeepPartial
  initialState={{
    user: { name: 'John' }, // TypeScript checks this against your store type
  }}
  // Type-safe merge strategy
  mergeStrategy="deep" // TypeScript ensures this is 'shallow', 'deep', or 'replace'
>
  <Component />
</useStore.Provider>
```

## Type-Safe Context Access

For advanced scenarios, you can access the raw context with proper typing:

```tsx
import React, { useContext } from 'react';

function AdvancedComponent() {
  const context = useContext(useStore._context);

  if (!context) {
    throw new Error('No provider found');
  }

  // TypeScript knows these types
  const { stores, defaultStore } = context;

  // Access a specific store
  const specificStore = stores.get('instance1');

  // Use the store API
  if (specificStore) {
    specificStore.getState();
    specificStore.setState({
      /* ... */
    });
    specificStore.subscribe(() => {
      /* ... */
    });
  }

  return <div>{/* ... */}</div>;
}
```

## Best Practices

1. **Define explicit interfaces** - Always define explicit interfaces for your store state.

2. **Use discriminated unions** for different state shapes - They provide better type safety when state can take different forms.

3. **Leverage generics** for reusable patterns - Create generic store factories for common patterns.

4. **Use type inference helpers** - Create helper types to extract information from your stores.

5. **Avoid `any`** - Instead of using `any`, use proper TypeScript patterns like generics and utility types.

6. **Document complex types** - Add comments to complex types to explain their purpose and constraints.

7. **Type component props carefully** - When components rely on store types, be explicit about the dependencies.

By following these practices, you can create strongly typed applications with zustand-context that leverage TypeScript's powerful type system to catch errors at compile time rather than runtime.
