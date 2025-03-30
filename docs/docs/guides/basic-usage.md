---
sidebar_position: 1
---

# Basic Usage

This guide covers the basic usage patterns for zustand-context. We'll create a simple counter application to demonstrate the core concepts.

## Creating a Store

First, let's create a basic counter store:

```tsx
import { create } from 'zustand-context';

// Define the store state and actions
interface CounterState {
  count: number;
  increment: () => void;
  decrement: () => void;
  reset: () => void;
  incrementBy: (value: number) => void;
}

// Create the store
const useCounterStore = create<CounterState>(
  (set) => ({
    count: 0,
    increment: () => set((state) => ({ count: state.count + 1 })),
    decrement: () => set((state) => ({ count: state.count - 1 })),
    reset: () => set({ count: 0 }),
    incrementBy: (value) => set((state) => ({ count: state.count + value })),
  }),
  {
    name: 'Counter', // Required parameter
    debug: true, // Optional - enables debug logging
  },
);
```

The `create` function takes two arguments:

1. A state creator function (the same as in Zustand)
2. Options object (specific to zustand-context)

## Adding the Provider

To use the store in your components, you need to wrap them with the Provider:

```tsx
function App() {
  return (
    <div className="App">
      <h1>Counter App</h1>
      <useCounterStore.Provider>
        <Counter />
      </useCounterStore.Provider>
    </div>
  );
}
```

## Using the Store in Components

Now you can use the store in your components:

```tsx
function Counter() {
  // Get values from the store
  const count = useCounterStore((state) => state.count);
  const increment = useCounterStore((state) => state.increment);
  const decrement = useCounterStore((state) => state.decrement);
  const reset = useCounterStore((state) => state.reset);

  return (
    <div>
      <h2>Count: {count}</h2>
      <div>
        <button onClick={increment}>Increment</button>
        <button onClick={decrement}>Decrement</button>
        <button onClick={reset}>Reset</button>
      </div>
    </div>
  );
}
```

Just like in Zustand, you can:

- Access the entire state: `const state = useCounterStore()`
- Select specific parts using selectors: `const count = useCounterStore((state) => state.count)`

## Setting Initial State

You can provide initial state through the Provider:

```tsx
function App() {
  return (
    <div className="App">
      <h1>Counter App</h1>
      <useCounterStore.Provider initialState={{ count: 10 }}>
        <Counter />
      </useCounterStore.Provider>
    </div>
  );
}
```

This will initialize the counter with a value of 10 instead of the default 0.

## Updating State

There are multiple ways to update state:

```tsx
function AdvancedCounter() {
  const count = useCounterStore((state) => state.count);
  const incrementBy = useCounterStore((state) => state.incrementBy);

  // Update state with a custom value
  const handleCustomIncrement = () => {
    const value = parseInt(prompt('Enter increment value:', '5') || '5');
    incrementBy(value);
  };

  return (
    <div>
      <h2>Advanced Counter: {count}</h2>
      <button onClick={handleCustomIncrement}>Custom Increment</button>
    </div>
  );
}
```

## Subscribing to State Changes

You can directly subscribe to state changes using the store's `subscribe` method:

```tsx
import { useEffect } from 'react';

function CounterLogger() {
  useEffect(() => {
    // Get access to the raw store
    const storeContext = useCounterStore._context;

    // If no provider in context, return early
    if (!storeContext) return;

    // Assuming we're in a provider context
    const contextValue = React.useContext(storeContext);
    if (!contextValue) return;

    const store = contextValue.defaultStore;

    // Subscribe to changes
    const unsubscribe = store.subscribe((state) => {
      console.log('Counter changed:', state.count);
    });

    // Cleanup subscription
    return () => {
      unsubscribe();
    };
  }, []);

  return null;
}
```

## Multiple Consumers

You can have multiple components consuming the same store:

```tsx
function CounterDisplay() {
  const count = useCounterStore((state) => state.count);
  return <div>Current count: {count}</div>;
}

function CounterControls() {
  const increment = useCounterStore((state) => state.increment);
  const decrement = useCounterStore((state) => state.decrement);
  return (
    <div>
      <button onClick={increment}>+</button>
      <button onClick={decrement}>-</button>
    </div>
  );
}

function App() {
  return (
    <useCounterStore.Provider>
      <h1>Counter App</h1>
      <CounterDisplay />
      <CounterControls />
    </useCounterStore.Provider>
  );
}
```

Only the components that actually use the state will re-render when the state changes.

## Complete Example

Let's put everything together:

```tsx
import React from 'react';
import { create } from 'zustand-context';

// Define the store state and actions
interface CounterState {
  count: number;
  increment: () => void;
  decrement: () => void;
  reset: () => void;
  incrementBy: (value: number) => void;
}

// Create the store
const useCounterStore = create<CounterState>(
  (set) => ({
    count: 0,
    increment: () => set((state) => ({ count: state.count + 1 })),
    decrement: () => set((state) => ({ count: state.count - 1 })),
    reset: () => set({ count: 0 }),
    incrementBy: (value) => set((state) => ({ count: state.count + value })),
  }),
  {
    name: 'Counter',
    debug: true,
  },
);

// Counter display component
function CounterDisplay() {
  const count = useCounterStore((state) => state.count);
  return <h2>Count: {count}</h2>;
}

// Counter controls component
function CounterControls() {
  const increment = useCounterStore((state) => state.increment);
  const decrement = useCounterStore((state) => state.decrement);
  const reset = useCounterStore((state) => state.reset);
  const incrementBy = useCounterStore((state) => state.incrementBy);

  const handleCustomIncrement = () => {
    const value = parseInt(prompt('Enter increment value:', '5') || '5');
    incrementBy(value);
  };

  return (
    <div>
      <button onClick={increment}>+1</button>
      <button onClick={decrement}>-1</button>
      <button onClick={reset}>Reset</button>
      <button onClick={handleCustomIncrement}>Add Custom</button>
    </div>
  );
}

// Main app component
function CounterApp() {
  return (
    <div className="counter-app">
      <h1>Counter Application</h1>
      <useCounterStore.Provider initialState={{ count: 5 }}>
        <CounterDisplay />
        <CounterControls />
      </useCounterStore.Provider>
    </div>
  );
}

// Export the app
export default CounterApp;
```

## Using Without a Provider

By default, zustand-context operates in strict mode, which means you must wrap your components with a Provider.

If you want to use the store without a Provider (like regular Zustand), you can set `strict: false` and provide a `defaultState`:

```tsx
const useCounterStore = create<CounterState>(
  (set) => ({
    count: 0,
    increment: () => set((state) => ({ count: state.count + 1 })),
    decrement: () => set((state) => ({ count: state.count - 1 })),
    reset: () => set({ count: 0 }),
  }),
  {
    name: 'Counter',
    strict: false,
    defaultState: {
      count: 0,
      increment: () => console.warn('No Provider found'),
      decrement: () => console.warn('No Provider found'),
      reset: () => console.warn('No Provider found'),
    },
  },
);

// Now you can use useCounterStore without a Provider
function StandAloneCounter() {
  const count = useCounterStore((state) => state.count);
  return <div>Count: {count}</div>;
}
```

## Best Practices

1. **Name your stores clearly** - Use descriptive names as they're used for debugging and error messages.

2. **Separate state concerns** - Create multiple stores for different parts of your application instead of one giant store.

3. **Use selectors for performance** - Always select only the parts of the state that you need to avoid unnecessary re-renders.

4. **Collocate providers with consumers** - Place providers as close as possible to the components that use them in the component tree.

5. **Enable debug mode during development** - The `debug: true` option provides helpful logging to understand what's happening.

6. **Organize actions logically** - Group related actions together in your store definition for better maintainability.

In the next guide, we'll explore more advanced usage patterns, including working with multiple instances of the same store.
