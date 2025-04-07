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

A small, fast and scalable context-aware state management solution built on top of Zustand. It solves one key problem: **using the same store with different states in multiple component trees**.

## Features

- 📦 Multiple instances of the same store
- 🌲 Hierarchical state inheritance across components
- 🎯 Named store references with `from()` method
- 🔄 Same API as Zustand, just with context awareness

## Installation

```bash
# Using npm
npm install @mag1yar/zustand-context zustand

# Using yarn
yarn add @mag1yar/zustand-context zustand

# Using pnpm
pnpm add @mag1yar/zustand-context zustand
```

## Basic Usage

```tsx
// 1. Create a store with context awareness
import { create } from '@mag1yar/zustand-context';

interface CounterState {
  count: number;
  increment: () => void;
  reset: () => void;
}

const useCounterStore = create<CounterState>(
  (set) => ({
    count: 0,
    increment: () => set((state) => ({ count: state.count + 1 })),
    reset: () => set({ count: 0 }),
  }),
  {
    name: 'Counter', // Required: name for your store context
  },
);

// 2. Wrap your components with Provider
function App() {
  return (
    <useCounterStore.Provider initialState={{ count: 10 }}>
      <Counter />
    </useCounterStore.Provider>
  );
}

// 3. Use it just like regular Zustand
function Counter() {
  const count = useCounterStore((state) => state.count);
  const increment = useCounterStore((state) => state.increment);

  return (
    <div>
      <h1>Count: {count}</h1>
      <button onClick={increment}>Increment</button>
    </div>
  );
}
```

## Nested Contexts Example

```tsx
function App() {
  return (
    <useCounterStore.Provider instanceId="app" initialState={{ count: 100 }}>
      {/* Root Counter */}
      <Counter label="App Counter" />

      {/* First nested counter */}
      <div className="section">
        <useCounterStore.Provider instanceId="section1" initialState={{ count: 5 }}>
          <Counter label="Section 1" />
          <MultiCounterInfo />
        </useCounterStore.Provider>
      </div>

      {/* Second nested counter */}
      <div className="section">
        <useCounterStore.Provider instanceId="section2" initialState={{ count: 10 }}>
          <Counter label="Section 2" />
          <MultiCounterInfo />
        </useCounterStore.Provider>
      </div>
    </useCounterStore.Provider>
  );
}

// Counter uses the nearest provider automatically
function Counter({ label }) {
  const count = useCounterStore((state) => state.count);
  const increment = useCounterStore((state) => state.increment);

  return (
    <div>
      <h3>
        {label}: {count}
      </h3>
      <button onClick={increment}>Increment</button>
    </div>
  );
}

// Access multiple counters using the from() method
function MultiCounterInfo() {
  // Gets the current section's count
  const sectionCount = useCounterStore((state) => state.count);

  // Gets the app-level count from the parent
  const appCount = useCounterStore.from('app')((state) => state.count);

  return (
    <div className="info">
      <p>Section count: {sectionCount}</p>
      <p>App total: {appCount}</p>
    </div>
  );
}
```

## Why zustand-context?

| Challenge                 | React Context          | Zustand                  | zustand-context           |
| ------------------------- | ---------------------- | ------------------------ | ------------------------- |
| Component-specific state  | ✅ Good                | ❌ Global only           | ✅ Best                   |
| Avoiding re-renders       | ❌ Poor                | ✅ Good                  | ✅ Good                   |
| Multiple instances        | ✅ Good                | ⚠️ Requires custom setup | ✅ Best     |
| Access specific instances | ❌ No direct access    | ❌ Not applicable        | ✅ Simple with `from()`   |
| State inheritance         | ⚠️ Manual prop passing | ❌ Not applicable        | ✅ Automatic hierarchical |
| Middleware support        | ❌ None                | ✅ Excellent             | ✅ Compatible             |

## Perfect for

- **UI component libraries**: Create stateful components with isolated state
- **Multi-instance widgets**: Dashboards, forms, or any component that needs multiple instances
- **Hierarchical applications**: Inherit and override state through component trees
- **SSOT with locality**: Single source of truth within a component boundary

## Full Documentation

For complete API reference, advanced configuration, and more examples:  
[https://mag1yar.github.io/zustand-context/](https://mag1yar.github.io/zustand-context/)
