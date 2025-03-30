---
sidebar_position: 1
---

# create

The `create` function is the main API of zustand-context. It creates a context-aware Zustand store that can be used in your React components.

## Signature

```ts
function create<T>(
  initializer: StateCreator<T, any, any>,
  options: ContextOptions<T>,
): ContextStore<T>;
```

## Parameters

- **initializer**: A function that creates the initial state and defines actions, just like in regular Zustand.
- **options**: Configuration options for the context:

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

## Returns

The `create` function returns a `ContextStore` object with the following properties and methods:

### Hook Function

The returned value is a hook function that can be used in your components:

```ts
// Get the full state
const state = useCounterStore();

// Select specific parts of the state using selectors
const count = useCounterStore((state) => state.count);
```

### Provider Component

A React component to provide the store to your components:

```tsx
<useCounterStore.Provider>
  <YourComponent />
</useCounterStore.Provider>
```

You can also provide an initial state:

```tsx
<useCounterStore.Provider initialState={{ count: 10 }}>
  <YourComponent />
</useCounterStore.Provider>
```

And specify a merge strategy:

```tsx
<useCounterStore.Provider initialState={{ count: 10 }} mergeStrategy="deep">
  <YourComponent />
</useCounterStore.Provider>
```

### from Method

Access a specific context instance:

```ts
// Access the "team1" instance
const team1Count = useCounterStore.from('team1')((state) => state.count);
```

### useProxySelector

Safely check if a provider exists:

```ts
// Uses defaultState if no provider exists
const safeState = useCounterStore.useProxySelector(defaultState);
```

### \_context

The raw React Context object for advanced usage:

```ts
const StoreContext = useCounterStore._context;
```

## Options Detail

### name (required)

A unique name for your store. Used for debugging and error messages.

```ts
name: 'Counter';
```

### defaultInstanceId (optional)

The ID for the default context instance. Defaults to a unique symbol.

```ts
defaultInstanceId: 'default';
```

### strict (optional)

Whether to throw errors when Provider is missing. Defaults to `true`.

```ts
strict: true;
```

### defaultState (optional)

Default state when no Provider is available. Only used when `strict` is `false`.

```ts
defaultState: {
  count: 0;
}
```

### equalityFn (optional)

Custom equality function for selectors. Defaults to `Object.is`.

```ts
equalityFn: (a, b) => a === b;
```

### onError (optional)

Custom error handler. If not provided, errors are logged to console (when `debug` is `true`) and thrown (when `strict` is `true`).

```ts
onError: (error) => console.error(error);
```

### mergeOptions (optional)

Options for how initial state is merged with the default state.

```ts
mergeOptions: {
  // Use shallow merge (default) or deep merge
  shallow: true,

  // Only merge these keys
  whitelist: ['count', 'user'],

  // Don't merge these keys
  blacklist: ['sensitive'],

  // Custom merge function
  customMerge: (oldState, newState) => ({ ...oldState, ...newState })
}
```

### debug (optional)

Enable debug mode to log information about store creation and state updates.

```ts
debug: true;
```

## Example

```tsx
import { create } from 'zustand-context';

interface TodoState {
  todos: string[];
  addTodo: (text: string) => void;
  removeTodo: (index: number) => void;
}

const useTodoStore = create<TodoState>(
  (set) => ({
    todos: [],
    addTodo: (text) =>
      set((state) => ({
        todos: [...state.todos, text],
      })),
    removeTodo: (index) =>
      set((state) => ({
        todos: state.todos.filter((_, i) => i !== index),
      })),
  }),
  {
    name: 'TodoStore',
    strict: true,
    debug: true,
    mergeOptions: {
      shallow: false, // Use deep merge for initialState
    },
  },
);

function TodoList() {
  const todos = useTodoStore((state) => state.todos);
  const addTodo = useTodoStore((state) => state.addTodo);

  return (
    <div>
      <button onClick={() => addTodo('New todo')}>Add Todo</button>
      <ul>
        {todos.map((todo, index) => (
          <li key={index}>{todo}</li>
        ))}
      </ul>
    </div>
  );
}

function App() {
  return (
    <useTodoStore.Provider initialState={{ todos: ['Initial todo'] }}>
      <TodoList />
    </useTodoStore.Provider>
  );
}
```

## create.optional

For backward compatibility with Zustand, there's a `create.optional` method that creates a non-strict store with default state:

```tsx
const useOptionalStore = create.optional(
  (set) => ({
    count: 0,
    increment: () => set((state) => ({ count: state.count + 1 })),
  }),
  {
    // Default state when no Provider is found
    count: 0,
    increment: () => console.warn('No Provider found'),
  },
);
```

This is equivalent to:

```tsx
const useOptionalStore = create(
  (set) => ({
    count: 0,
    increment: () => set((state) => ({ count: state.count + 1 })),
  }),
  {
    name: 'optional',
    strict: false,
    defaultState: {
      count: 0,
      increment: () => console.warn('No Provider found'),
    },
  },
);
```
