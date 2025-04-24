# create

The `create` function is the entry point for creating context-aware stores. It builds on Zustand's `create` function while adding context capabilities.

## Basic Usage

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs groupId="language">
  <TabItem value="ts" label="TypeScript" default>

```tsx
import { create } from '@mag1yar/zustand-context';

interface CounterState {
  count: number;
  increment: () => void;
}

const useCounterStore = create<CounterState>(
  (set) => ({
    count: 0,
    increment: () => set((state) => ({ count: state.count + 1 })),
  }),
  {
    name: 'Counter', // Required: name for your context
  },
);
```

  </TabItem>
  <TabItem value="js" label="JavaScript">

```jsx
import { create } from '@mag1yar/zustand-context';

const useCounterStore = create(
  (set) => ({
    count: 0,
    increment: () => set((state) => ({ count: state.count + 1 })),
  }),
  {
    name: 'Counter', // Required: name for your context
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
function create<T>(
  initializer: StateCreator<T, [], []>,
  options: ContextOptions,
): UseContextBoundStore<T>;
```

  </TabItem>
  <TabItem value="js" label="JavaScript">

```jsx
function create(
  initializer,
  options
)
```

  </TabItem>
</Tabs>

### Parameters

- **initializer**: A function that creates the store's state and actions

  - Identical to Zustand's initializer function
  - Receives `set`, `get`, and `store` parameters
  - Should return the initial state object with actions

- **options**: Configuration options for the context behavior

#### Context Options

<Tabs groupId="language">
  <TabItem value="ts" label="TypeScript" default>

```tsx
interface ContextOptions {
  /** Required unique name for the store context */
  name: string;

  /** Whether to throw errors when Provider is missing (default: true) */
  strict?: boolean;

  /** Custom error handler */
  onError?: (error: Error) => void;

  /** Enable debug logging (default: false) */
  debug?: boolean;
}
```

  </TabItem>
  <TabItem value="js" label="JavaScript">

```jsx
{
  // Required unique name for the store context
  name: string,

  // Whether to throw errors when Provider is missing (default: true)
  strict?: boolean,

  // Custom error handler
  onError?: (error) => void,

  // Enable debug logging (default: false)
  debug?: boolean
}
```

  </TabItem>
</Tabs>

### Return Value

The `create` function returns a hook function with additional properties:

<Tabs groupId="language">
  <TabItem value="ts" label="TypeScript" default>

```tsx
// The returned hook function
function useStore<U>(selector?: (state: T) => U, options?: StoreOptions): U;

// With attached Provider component and Zustand API
useStore.Provider: React.FC<ProviderProps<T>>;
useStore.getState: () => T;
useStore.setState: (state: Partial<T> | ((state: T) => Partial<T>)) => void;
useStore.subscribe: (listener: (state: T, prevState: T) => void) => () => void;
```

  </TabItem>
  <TabItem value="js" label="JavaScript">

```jsx
// The returned hook function
function useStore(selector, options);

// With attached Provider component and Zustand API
useStore.Provider
useStore.getState
useStore.setState
useStore.subscribe
```

  </TabItem>
</Tabs>

## Options Details

### `name` (required)

A unique string name for the store context. This is used for:

- The React Context's display name (helpful for React DevTools)
- Error messages and debugging
- Ensuring uniqueness of your contexts

```jsx
{
  name: 'Counter';
}
```

### `strict` (optional)

Controls whether errors are thrown when:

- A Provider is missing but the hook is used
- A specific instance ID is requested but not found

Default is `true` (errors are thrown).

```jsx
{
  strict: false;
} // No errors when Provider is missing
```

Setting `strict: false` enables "provider-optional" mode where components can use the store even without a Provider.

### `onError` (optional)

A custom error handler function for store errors:

<Tabs groupId="language">
  <TabItem value="ts" label="TypeScript" default>

```tsx
{
  onError: (error: Error) => {
    console.warn('Store error:', error.message);
    // Log to service, show fallback UI, etc.
  };
}
```

  </TabItem>
  <TabItem value="js" label="JavaScript">

```jsx
{
  onError: (error) => {
    console.warn('Store error:', error.message);
    // Log to service, show fallback UI, etc.
  };
}
```

  </TabItem>
</Tabs>

### `debug` (optional)

Enables detailed console logging about store creation, instance access, and errors.

```jsx
{
  debug: true;
}
```
