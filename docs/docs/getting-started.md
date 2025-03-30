---
sidebar_position: 1
---

# Getting Started

## Installation

Install zustand-context using your preferred package manager:

```bash
# Using npm
npm install zustand-context

# Using yarn
yarn add zustand-context

# Using pnpm
pnpm add zustand-context
```

## Prerequisites

This library requires:

- React 18.0.0 or higher
- Zustand 5.0.0 or higher

Make sure these dependencies are installed in your project:

```bash
npm install react zustand
```

## Basic Usage

Here's a simple counter example to get you started:

```tsx
import { create } from 'zustand-context';

// Define your state and actions
interface CounterState {
  count: number;
  increment: () => void;
  decrement: () => void;
  reset: () => void;
}

// Create a context-aware store
const useCounterStore = create<CounterState>(
  (set) => ({
    count: 0,
    increment: () => set((state) => ({ count: state.count + 1 })),
    decrement: () => set((state) => ({ count: state.count - 1 })),
    reset: () => set({ count: 0 }),
  }),
  {
    name: 'Counter', // Required parameter
    debug: false, // Optional - enables debug logging
  },
);

// Use in a component
function Counter() {
  const count = useCounterStore((state) => state.count);
  const increment = useCounterStore((state) => state.increment);
  const decrement = useCounterStore((state) => state.decrement);
  const reset = useCounterStore((state) => state.reset);

  return (
    <div>
      <h2>Count: {count}</h2>
      <button onClick={increment}>+</button>
      <button onClick={decrement}>-</button>
      <button onClick={reset}>Reset</button>
    </div>
  );
}

// Wrap with Provider
function App() {
  return (
    <useCounterStore.Provider>
      <Counter />
    </useCounterStore.Provider>
  );
}
```

## Key Concepts

- **Context-Aware Store**: A Zustand store that is integrated with React Context
- **Provider**: A component that provides the store to its children
- **Initial State**: Optional state that can be passed to the Provider
- **Multiple Contexts**: Create multiple isolated contexts with different instance IDs

## Next Steps

Now that you have a basic understanding of zustand-context, you can explore the following topics:

- [Motivation and Benefits](./motivation.md)
- [API Reference](./api/create.md)
- [Merge Strategies](./guides/merge-strategies.md)
- [Multiple Contexts](./guides/multiple-contexts.md)
