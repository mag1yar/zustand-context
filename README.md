# zustand-context

Context-aware state management built on top of [Zustand](https://github.com/pmndrs/zustand).

## Features

- 🌟 **Context-Aware Stores** - Create Zustand stores with React Context integration
- 📦 **Multiple Providers** - Support for multiple isolated contexts
- 🔄 **Merge Strategies** - Control how initialState is merged with your store
- 🚫 **Strict Mode** - Configurable error handling when providers are missing
- 🧰 **TypeScript Support** - Full TypeScript support with proper typings
- 🔌 **Middleware Compatible** - Works with all Zustand middleware

## Installation

```bash
# Using npm
npm install zustand-context

# Using yarn
yarn add zustand-context

# Using pnpm
pnpm add zustand-context
```

## Quick Start

```tsx
import { create } from 'zustand-context';

// Define your state and actions
interface CounterState {
  count: number;
  increment: () => void;
  decrement: () => void;
}

// Create a context-aware store
const useCounterStore = create<CounterState>(
  (set) => ({
    count: 0,
    increment: () => set((state) => ({ count: state.count + 1 })),
    decrement: () => set((state) => ({ count: state.count - 1 })),
  }),
  {
    name: 'Counter', // Required parameter
    debug: true, // Optional - enables debug logging
  },
);

// Use in your components
function Counter() {
  const count = useCounterStore((state) => state.count);
  const increment = useCounterStore((state) => state.increment);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={increment}>Increment</button>
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

## Documentation

For more details and advanced usage, check out the [documentation](https://yourusername.github.io/zustand-context/).

## License

MIT
