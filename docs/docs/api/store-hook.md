---
sidebar_position: 3
---

# Store Hook

The store hook is what's returned from the `create` function. It's the primary way to access and use your store's state.

## Basic Usage

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs groupId="language">
  <TabItem value="ts" label="TypeScript" default>

```tsx
// Get a specific piece of state
const count = useCounterStore((state) => state.count);

// Get an action
const increment = useCounterStore((state) => state.increment);

// Get multiple values with useShallow to prevent unnecessary re-renders
import { useShallow } from '@mag1yar/zustand-context';

const { count, increment } = useCounterStore(
  useShallow((state) => ({
    count: state.count,
    increment: state.increment,
  })),
);
```

  </TabItem>
  <TabItem value="js" label="JavaScript">

```jsx
// Get a specific piece of state
const count = useCounterStore((state) => state.count);

// Get an action
const increment = useCounterStore((state) => state.increment);

// Get multiple values with useShallow to prevent unnecessary re-renders
import { useShallow } from '@mag1yar/zustand-context';

const { count, increment } = useCounterStore(
  useShallow((state) => ({
    count: state.count,
    increment: state.increment,
  })),
);
```

  </TabItem>
</Tabs>

## API Reference

### Signature

<Tabs groupId="language">
  <TabItem value="ts" label="TypeScript" default>

```tsx
function useStore<U>(selector?: (state: T) => U, options?: StoreOptions): U;
```

  </TabItem>
  <TabItem value="js" label="JavaScript">

```jsx
function useStore(
  selector,
  options
);
```

  </TabItem>
</Tabs>

### Parameters

#### selector (optional)

A function that extracts and returns values from the store's state. Accepts the full state and returns the derived value.

<Tabs groupId="language">
  <TabItem value="ts" label="TypeScript" default>

```tsx
// Single value selector
useStore((state) => state.count);

// Multiple value selector with useShallow
useStore(
  useShallow((state) => ({
    count: state.count,
    name: state.name,
  })),
);
```

  </TabItem>
  <TabItem value="js" label="JavaScript">

```jsx
// Single value selector
useStore((state) => state.count);

// Multiple value selector with useShallow
useStore(
  useShallow((state) => ({
    count: state.count,
    name: state.name,
  })),
);
```

  </TabItem>
</Tabs>

#### options (optional)

An options object for configuring hook behavior.

<Tabs groupId="language">
  <TabItem value="ts" label="TypeScript" default>

```tsx
interface StoreOptions {
  /** Access a specific store instance by ID */
  from?: string | symbol;
}
```

  </TabItem>
  <TabItem value="js" label="JavaScript">

```jsx
{
  // Access a specific store instance by ID
  from: string | Symbol;
}
```

  </TabItem>
</Tabs>

The `from` option specifies which store instance to access by its ID. It's used when you need to access a store instance other than the nearest one in the provider hierarchy.

## Example Scenarios

### Accessing the Nearest Provider

The default behavior is to access the nearest provider in the component tree:

<Tabs groupId="language">
  <TabItem value="ts" label="TypeScript" default>

```tsx
function Counter() {
  // Automatically connects to nearest Provider
  const count = useCounterStore((state) => state.count);
  const increment = useCounterStore((state) => state.increment);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={increment}>Increment</button>
    </div>
  );
}
```

  </TabItem>
  <TabItem value="js" label="JavaScript">

```jsx
function Counter() {
  // Automatically connects to nearest Provider
  const count = useCounterStore((state) => state.count);
  const increment = useCounterStore((state) => state.increment);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={increment}>Increment</button>
    </div>
  );
}
```

  </TabItem>
</Tabs>

### Accessing a Specific Provider

You can access any provider in the hierarchy by its ID using the `from` option:

<Tabs groupId="language">
  <TabItem value="ts" label="TypeScript" default>

```tsx
function NestedComponent() {
  // Access specifically named instances
  const headerCount = useCounterStore((state) => state.count, { from: 'header' });

  return (
    <div>
      <p>Header count: {headerCount}</p>
    </div>
  );
}
```

  </TabItem>
  <TabItem value="js" label="JavaScript">

```jsx
function NestedComponent() {
  // Access specifically named instances
  const headerCount = useCounterStore((state) => state.count, { from: 'header' });

  return (
    <div>
      <p>Header count: {headerCount}</p>
    </div>
  );
}
```

  </TabItem>
</Tabs>

## Performance Optimization

Just like regular Zustand, the hook will only trigger re-renders when the selected state changes:

<Tabs groupId="language">
  <TabItem value="ts" label="TypeScript" default>

```tsx
// This component only re-renders when count changes
function CountDisplay() {
  const count = useCounterStore((state) => state.count);
  return <div>{count}</div>;
}

// This component only re-renders when name changes
function NameDisplay() {
  const name = useUserStore((state) => state.name);
  return <div>{name}</div>;
}
```

  </TabItem>
  <TabItem value="js" label="JavaScript">

```jsx
// This component only re-renders when count changes
function CountDisplay() {
  const count = useCounterStore((state) => state.count);
  return <div>{count}</div>;
}

// This component only re-renders when name changes
function NameDisplay() {
  const name = useUserStore((state) => state.name);
  return <div>{name}</div>;
}
```

  </TabItem>
</Tabs>

### Using useShallow

For object selectors, you must use `useShallow` to prevent unnecessary re-renders:

<Tabs groupId="language">
  <TabItem value="ts" label="TypeScript" default>

```tsx
import { useShallow } from '@mag1yar/zustand-context';

function UserProfile() {
  // Only re-renders when either firstName or lastName change
  const { firstName, lastName } = useUserStore(
    useShallow((state) => ({
      firstName: state.firstName,
      lastName: state.lastName,
    })),
  );

  return (
    <div>
      {firstName} {lastName}
    </div>
  );
}
```

  </TabItem>
  <TabItem value="js" label="JavaScript">

```jsx
import { useShallow } from '@mag1yar/zustand-context';

function UserProfile() {
  // Only re-renders when either firstName or lastName change
  const { firstName, lastName } = useUserStore(
    useShallow((state) => ({
      firstName: state.firstName,
      lastName: state.lastName,
    })),
  );

  return (
    <div>
      {firstName} {lastName}
    </div>
  );
}
```

  </TabItem>
</Tabs>

## Handling Missing Providers

If a component tries to use a store without a Provider in strict mode, an error will be thrown:

<Tabs groupId="language">
  <TabItem value="ts" label="TypeScript" default>

```tsx
// This will throw an error in strict mode if not inside a Provider
function Component() {
  const count = useCounterStore((state) => state.count);
  return <div>{count}</div>;
}
```

  </TabItem>
  <TabItem value="js" label="JavaScript">

```jsx
// This will throw an error in strict mode if not inside a Provider
function Component() {
  const count = useCounterStore((state) => state.count);
  return <div>{count}</div>;
}
```

  </TabItem>
</Tabs>

You can handle this by:

1. Making sure the component is used within a Provider
2. Creating the store with `strict: false` to enable provider-optional mode
3. Adding custom error handling with the `onError` option
