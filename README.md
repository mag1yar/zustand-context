# @mag1yar/zustand-context

<p align="center">
  <strong>Context-aware state management built on top of <a href="https://github.com/pmndrs/zustand">Zustand</a></strong><br />
  <em>The same bear, now with context superpowers</em>
</p>

<p align="center">
  <a href="https://npmjs.org/package/@mag1yar/zustand-context">
    <img src="https://img.shields.io/npm/v/@mag1yar/zustand-context?style=flat&colorA=000000&colorB=000000" alt="Version">
  </a>
  <a href="https://github.com/mag1yar/zustand-context/blob/main/LICENSE">
    <img src="https://img.shields.io/github/license/mag1yar/zustand-context?style=flat&colorA=000000&colorB=000000" alt="License">
  </a>
</p>

A small, fast and scalable context-aware state management solution built on top of [Zustand](https://github.com/pmndrs/zustand). Provides hierarchical state management with all the benefits of Zustand's simplicity.

## Documentation

For full documentation, visit [https://mag1yar.github.io/zustand-context/](https://mag1yar.github.io/zustand-context/)

## Why @mag1yar/zustand-context?

Zustand is fantastic for global state, but sometimes you need:

- Multiple instances of the same store in different parts of your app
- Store inheritance across component hierarchies
- Component-specific store configuration
- Easy access to specific store instances

`@mag1yar/zustand-context` gives you all that while keeping Zustand's simplicity.

```bash
# Using npm
npm install @mag1yar/zustand-context zustand

# Using yarn
yarn add @mag1yar/zustand-context zustand

# Using pnpm
pnpm add @mag1yar/zustand-context zustand
```

## First create a store

Your store is a hook! Just like in Zustand, but with context awareness built in:

```tsx
import { create } from '@mag1yar/zustand-context';

// Define your store's state and actions
interface BearState {
  bears: number;
  increase: (by: number) => void;
  reset: () => void;
}

// Create the store with context support
const useBearStore = create<BearState>(
  (set) => ({
    bears: 0,
    increase: (by) => set((state) => ({ bears: state.bears + by })),
    reset: () => set({ bears: 0 }),
  }),
  {
    name: 'Bears', // Required name for your store context
  },
);
```

## Then wrap your components with the Provider

```tsx
import React from 'react';
import { useBearStore } from './store';

function App() {
  return (
    <useBearStore.Provider>
      <BearCounter />
      <Controls />
    </useBearStore.Provider>
  );
}
```

## And use it just like regular Zustand

```tsx
import React from 'react';
import { useBearStore } from './store';

function BearCounter() {
  const bears = useBearStore((state) => state.bears);
  return <h1>{bears} around here...</h1>;
}

function Controls() {
  const increase = useBearStore((state) => state.increase);
  return (
    <div>
      <button onClick={() => increase(1)}>one up</button>
    </div>
  );
}
```

# Features

## Multiple store instances

Create multiple instances of the same store with different initial states:

```tsx
import React from 'react';
import { useBearStore } from './store';

function App() {
  return (
    <div className="forests">
      <section>
        <h2>Forest A</h2>
        <useBearStore.Provider initialState={{ bears: 10 }}>
          <BearDisplay />
        </useBearStore.Provider>
      </section>

      <section>
        <h2>Forest B</h2>
        <useBearStore.Provider initialState={{ bears: 5 }}>
          <BearDisplay />
        </useBearStore.Provider>
      </section>
    </div>
  );
}

function BearDisplay() {
  const bears = useBearStore((state) => state.bears);
  const increase = useBearStore((state) => state.increase);

  return (
    <div>
      <h3>{bears} bears in this forest</h3>
      <button onClick={() => increase(1)}>Add bear</button>
    </div>
  );
}
```

## Named instances and the `from` method

The `from` method allows accessing specific store instances across your component tree:

```tsx
import React from 'react';
import { useBearStore } from './store';

function App() {
  return (
    <useBearStore.Provider instanceId="park" initialState={{ bears: 10 }}>
      <div>
        <h1>National Park</h1>
        <ParkStats /> {/* Can only access "park" instance */}
        <ForestA />
        <ForestB />
      </div>
    </useBearStore.Provider>
  );
}

function ForestA() {
  return (
    <useBearStore.Provider instanceId="forestA" initialState={{ bears: 3 }}>
      <h2>Forest A</h2>
      <BearCounter />
      <ForestStats /> {/* Can access both "park" and "forestA" instances */}
    </useBearStore.Provider>
  );
}

function ForestB() {
  return (
    <useBearStore.Provider instanceId="forestB" initialState={{ bears: 7 }}>
      <h2>Forest B</h2>
      <BearCounter />
      <ForestStats /> {/* Can access both "park" and "forestB" instances */}
    </useBearStore.Provider>
  );
}

// Component using the nearest bear store instance
function BearCounter() {
  const bears = useBearStore((state) => state.bears);
  const increase = useBearStore((state) => state.increase);

  return (
    <div>
      <h3>{bears} bears in this forest</h3>
      <button onClick={() => increase(1)}>Add bear</button>
    </div>
  );
}

// ParkStats can only access the "park" instance
function ParkStats() {
  const parkBears = useBearStore((state) => state.bears); // Gets bears from "park"

  return <div>Total park bears: {parkBears}</div>;
}

// ForestStats can access parent instances
function ForestStats() {
  // Gets bears from the nearest instance (forestA or forestB)
  const forestBears = useBearStore((state) => state.bears);

  // Explicitly access the park instance
  const parkBears = useBearStore.from('park')((state) => state.bears);

  return (
    <div>
      <div>Forest bears: {forestBears}</div>
      <div>Total park bears: {parkBears}</div>
    </div>
  );
}
```

> ℹ️ The `from` method can only access store instances within the current React context hierarchy. In strict mode, it will throw an error if the provider is not found.

## Using without Provider

For cases where you need to use the store without a Provider:

```tsx
import { create } from '@mag1yar/zustand-context';

interface FishState {
  fishes: number;
  addFish: () => void;
}

// Create a non-strict store with default state
const useFishStore = create<FishState>(
  (set) => ({
    fishes: 0,
    addFish: () => set((state) => ({ fishes: state.fishes + 1 })),
  }),
  {
    name: 'FishStore',
    strict: false, // Don't throw if Provider is missing
    defaultState: {
      fishes: 3,
      addFish: () => console.warn('Provider not found, using default value'),
    }, // Used when no Provider is found
  },
);

function StandaloneFishCounter() {
  // Works even without Provider wrapping it
  const fishes = useFishStore((state) => state.fishes);
  return <h1>{fishes} fish swimming around</h1>; // Shows 3
}
```

## Hierarchical stores

Child providers inherit from parent providers and can override state:

```tsx
import React from 'react';
import { useBearStore } from './store';

function App() {
  return (
    <useBearStore.Provider initialState={{ bears: 10 }}>
      <div>
        <h2>Wildlife Reserve</h2>
        <BearCounter />
        <Controls />

        <div className="tourist-area">
          <h3>Tourist Area</h3>
          <useBearStore.Provider initialState={{ bears: 3 }}>
            <BearCounter /> {/* This gets initial bears: 3 */}
            <Controls />
          </useBearStore.Provider>
        </div>
      </div>
    </useBearStore.Provider>
  );
}

function BearCounter() {
  const bears = useBearStore((state) => state.bears);
  return <p>{bears} bears roaming around</p>;
}

function Controls() {
  const increase = useBearStore((state) => state.increase);
  const reset = useBearStore((state) => state.reset);

  return (
    <div>
      <button onClick={() => increase(1)}>Add bear</button>
      <button onClick={reset}>Reset population</button>
    </div>
  );
}
```

## Different merge strategies

Control how `initialState` is merged with existing state:

```tsx
// 'shallow' (default) - Shallow merge
<useCounterStore.Provider initialState={{ count: 10 }}>
  {/* state = { ...currentState, ...initialState } */}
</useCounterStore.Provider>

// 'deep' - Deep merge nested objects
<useCounterStore.Provider
  initialState={{ nested: { value: 10 } }}
  mergeStrategy="deep">
  {/* Deeply merges nested objects */}
</useCounterStore.Provider>

// 'replace' - Replace entire state
<useCounterStore.Provider
  initialState={{ count: 10 }}
  mergeStrategy="replace">
  {/* state = initialState */}
</useCounterStore.Provider>
```

## Advanced configuration

```tsx
import { create } from '@mag1yar/zustand-context';
import { shallow } from 'zustand/shallow';

interface ForestState {
  bears: number;
  trees: number;
  ecosystem: {
    health: number;
    rainfall: number;
  };
  addBears: (count: number) => void;
  plantTrees: (count: number) => void;
}

const useForestStore = create<ForestState>(
  (set) => ({
    bears: 0,
    trees: 100,
    secret: '***',
    ecosystem: { health: 75, rainfall: 50 },
    addBears: (count) => set((state) => ({ bears: state.bears + count })),
    plantTrees: (count) => set((state) => ({ trees: state.trees + count })),
  }),
  {
    name: 'ForestStore',
    defaultInstanceId: 'primary', // Default ID for the instance
    strict: true, // Throw if Provider is missing (default)
    equalityFn: shallow, // Custom equality function for selectors
    onError: (error) => console.error('Forest Store Error:', error), // Custom error handler
    debug: true, // Enable console logging for debugging
    mergeOptions: {
      shallow: true, // Use shallow merge (default)
      whitelist: ['bears', 'trees'], // Only merge these keys
      blacklist: ['secret'], // Don't merge these keys
      customMerge: (oldState, newState) => ({ ...oldState, ...newState } as ForestState),
    },
  },
);
```

## Working with Zustand Middleware

Zustand middleware works seamlessly with @mag1yar/zustand-context:

```tsx
import { create } from '@mag1yar/zustand-context';
import { persist, devtools, immer } from 'zustand/middleware';

interface BearState {
  bears: number;
  addBear: () => void;
}

// Composing multiple middleware
const usePersistBearStore = create<BearState>(
  devtools(
    persist(
      (set) => ({
        bears: 0,
        addBear: () =>
          set((state) => ({
            bears: state.bears + 1,
          })),
      }),
      { name: 'bears-storage' },
    ),
    { name: 'bears' },
  ),
  {
    name: 'BearStore',
  },
);
```

> ℹ️ When using persist middleware with multiple store instances, each instance will share the same storage key by default. For instance-specific persistence, custom adaptations may be needed.

## Comparison

### Why @mag1yar/zustand-context over regular Context API?

- Built-in state management with immutable updates
- Easy access to specific store instances
- Hierarchical state inheritance
- Advanced merging strategies for initialState
- Optimized re-rendering with selector pattern

### When to use what?

- **Zustand** - For truly global, singleton state
- **React Context API** - For simple prop drilling prevention without state management
- **@mag1yar/zustand-context** - When you need multiple instances of the same store type or component-specific state with inheritance

## Roadmap

| Area                       | Focus                                                                                       |
| -------------------------- | ------------------------------------------------------------------------------------------- |
| **Refactoring**            | Simplifying core API and improving code organization                                        |
| **Middleware Support**     | Creating context-aware versions of persist and other middleware with dynamic instance names |
| **Documentation**          | Expanding examples and usage patterns                                                       |
| **Non-TypeScript Support** | Fixing JavaScript-only usage patterns                                                       |
