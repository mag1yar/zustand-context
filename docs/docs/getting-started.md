---
sidebar_position: 2
---

# 🚀 Getting Started

Let's get you up and running with `@mag1yar/zustand-context` in just a few minutes!

## 📦 Installation

`zustand-context` requires React as its only hard dependency:

```bash
# Using npm
npm install @mag1yar/zustand-context

# Using yarn
yarn add @mag1yar/zustand-context

# Using pnpm
pnpm add @mag1yar/zustand-context
```

While zustand is marked as an optional peer dependency, it's still recommended for the best experience:

```bash
# Using npm
npm install zustand

# Using yarn
yarn add zustand

# Using pnpm
pnpm add zustand
```

## 🧩 Prerequisites

- React 18.0.0+
- Zustand 5.0.0+ (recommended but optional)

## 🔰 Quick Start Example

Here's a minimal counter example to demonstrate the basics:

```tsx
import { create } from '@mag1yar/zustand-context';

// 1️⃣ Define your state and actions
interface CounterState {
  count: number;
  increment: () => void;
  decrement: () => void;
}

// 2️⃣ Create a context-aware store
const useCounterStore = create<CounterState>(
  (set) => ({
    count: 0,
    increment: () => set((state) => ({ count: state.count + 1 })),
    decrement: () => set((state) => ({ count: state.count - 1 })),
  }),
  {
    name: 'Counter', // 👉 Required: name for your store context
  },
);

// 3️⃣ Use in your components
function Counter() {
  // 💡 Works just like you'd expect
  const count = useCounterStore((state) => state.count);
  const increment = useCounterStore((state) => state.increment);

  return (
    <div>
      <h2>Count: {count}</h2>
      <button onClick={increment}>Increment</button>
    </div>
  );
}

// 4️⃣ Wrap with Provider
function App() {
  return (
    <useCounterStore.Provider>
      <Counter />
    </useCounterStore.Provider>
  );
}
```

That's it! You've created your first context-aware store. 🎉

## 🔍 What's Next?

Now that you have a basic understanding, explore these topics:

- [💡 Why use zustand-context?](./motivation)
- [🧠 Store with Context](../docs/core-concepts/store-with-context)
<!-- - [Basic Usage](../guides/basic-usage) - More detailed examples -->
<!-- - [API Reference](../api/create) - Complete API documentation -->
