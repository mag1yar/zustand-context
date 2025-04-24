# Getting Started

Let's get you up and running with `zustand-context` in just a few steps.

## Installation

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs groupId="package-manager">
  <TabItem value="npm" label="npm" default>

```bash
npm install @mag1yar/zustand-context
```

  </TabItem>
  <TabItem value="yarn" label="yarn">

```bash
yarn add @mag1yar/zustand-context
```

  </TabItem>
  <TabItem value="pnpm" label="pnpm">

```bash
pnpm add @mag1yar/zustand-context
```

  </TabItem>
</Tabs>

## Quick Example

Here's a minimal example showing how to use zustand-context:

<Tabs groupId="language">
  <TabItem value="ts" label="TypeScript" default>

```tsx
import { create } from '@mag1yar/zustand-context';

// Define your state type
interface CounterState {
  count: number;
  increment: () => void;
  decrement: () => void;
}

// 1. Create a context-aware store
const useCounterStore = create<CounterState>(
  (set) => ({
    count: 0,
    increment: () => set((state) => ({ count: state.count + 1 })),
    decrement: () => set((state) => ({ count: state.count - 1 })),
  }),
  {
    name: 'Counter', // Required: name for your context
  },
);

// 2. Create components that use the store
function Counter() {
  const count = useCounterStore((state) => state.count);
  const increment = useCounterStore((state) => state.increment);

  return (
    <div>
      <h2>Count: {count}</h2>
      <button onClick={increment}>Increment</button>
    </div>
  );
}

// 3. Use the Provider to create isolated instances
function App() {
  return (
    <div>
      <h1>Multiple Counters</h1>

      {/* First counter instance */}
      <div className="counter-container">
        <h3>Counter 1</h3>
        <useCounterStore.Provider initialState={{ count: 5 }}>
          <Counter />
        </useCounterStore.Provider>
      </div>

      {/* Second counter instance */}
      <div className="counter-container">
        <h3>Counter 2</h3>
        <useCounterStore.Provider initialState={{ count: 10 }}>
          <Counter />
        </useCounterStore.Provider>
      </div>
    </div>
  );
}
```

  </TabItem>
  <TabItem value="js" label="JavaScript">

```jsx
import { create } from '@mag1yar/zustand-context';

// 1. Create a context-aware store
const useCounterStore = create(
  (set) => ({
    count: 0,
    increment: () => set((state) => ({ count: state.count + 1 })),
    decrement: () => set((state) => ({ count: state.count - 1 })),
  }),
  {
    name: 'Counter', // Required: name for your context
  },
);

// 2. Create components that use the store
function Counter() {
  const count = useCounterStore((state) => state.count);
  const increment = useCounterStore((state) => state.increment);

  return (
    <div>
      <h2>Count: {count}</h2>
      <button onClick={increment}>Increment</button>
    </div>
  );
}

// 3. Use the Provider to create isolated instances
function App() {
  return (
    <div>
      <h1>Multiple Counters</h1>

      {/* First counter instance */}
      <div className="counter-container">
        <h3>Counter 1</h3>
        <useCounterStore.Provider initialState={{ count: 5 }}>
          <Counter />
        </useCounterStore.Provider>
      </div>

      {/* Second counter instance */}
      <div className="counter-container">
        <h3>Counter 2</h3>
        <useCounterStore.Provider initialState={{ count: 10 }}>
          <Counter />
        </useCounterStore.Provider>
      </div>
    </div>
  );
}
```

  </TabItem>
</Tabs>

## Understanding Component Access

Components can only access store instances that are available in their provider hierarchy:

<Tabs groupId="language">
  <TabItem value="ts" label="TypeScript" default>

```tsx
function App() {
  return (
    <useCounterStore.Provider instanceId="root">
      {/* This component can access the "root" instance */}
      <Counter />

      <useCounterStore.Provider instanceId="nested">
        {/* This component can access both "root" and "nested" instances */}
        <NestedComponent />
      </useCounterStore.Provider>

      {/* This component can ONLY access the "root" instance */}
      <AnotherComponent />
    </useCounterStore.Provider>
  );
}

function NestedComponent() {
  // Access the nearest provider (which is "nested")
  const nestedCount = useCounterStore((state) => state.count);

  // Access a specific parent provider by ID
  const rootCount = useCounterStore((state) => state.count, { from: 'root' });

  return (
    <div>
      <p>Nested count: {nestedCount}</p>
      <p>Root count: {rootCount}</p>
    </div>
  );
}
```

  </TabItem>
  <TabItem value="js" label="JavaScript">

```jsx
function App() {
  return (
    <useCounterStore.Provider instanceId="root">
      {/* This component can access the "root" instance */}
      <Counter />

      <useCounterStore.Provider instanceId="nested">
        {/* This component can access both "root" and "nested" instances */}
        <NestedComponent />
      </useCounterStore.Provider>

      {/* This component can ONLY access the "root" instance */}
      <AnotherComponent />
    </useCounterStore.Provider>
  );
}

function NestedComponent() {
  // Access the nearest provider (which is "nested")
  const nestedCount = useCounterStore((state) => state.count);

  // Access a specific parent provider by ID
  const rootCount = useCounterStore((state) => state.count, { from: 'root' });

  return (
    <div>
      <p>Nested count: {nestedCount}</p>
      <p>Root count: {rootCount}</p>
    </div>
  );
}
```

  </TabItem>
</Tabs>

## Accessing Multiple Instances

To access multiple store instances from a single component, the component must be within the hierarchy of all providers it needs to access:

### Proper Provider Hierarchy

<Tabs groupId="language">
  <TabItem value="ts" label="TypeScript" default>

```tsx
function App() {
  return (
    // Common parent provider that will contain both instances
    <useCounterStore.Provider instanceId="root">
      {/* First instance */}
      <useCounterStore.Provider instanceId="counter1" initialState={{ count: 5 }}>
        <div className="counter-section">
          <h3>Counter 1</h3>
          <Counter />

          {/* Second instance nested inside first */}
          <useCounterStore.Provider instanceId="counter2" initialState={{ count: 10 }}>
            <div className="counter-section">
              <h3>Counter 2</h3>
              <Counter />

              {/* This component can access both counters because it's inside BOTH providers */}
              <CounterSummary />
            </div>
          </useCounterStore.Provider>
        </div>
      </useCounterStore.Provider>
    </useCounterStore.Provider>
  );
}

function CounterSummary() {
  const counter1 = useCounterStore((s) => s.count, { from: 'counter1' });
  const counter2 = useCounterStore((s) => s.count, { from: 'counter2' });

  return <p>Total: {counter1 + counter2}</p>;
}
```

  </TabItem>
  <TabItem value="js" label="JavaScript">

```jsx
function App() {
  return (
    // Common parent provider that will contain both instances
    <useCounterStore.Provider instanceId="root">
      {/* First instance */}
      <useCounterStore.Provider instanceId="counter1" initialState={{ count: 5 }}>
        <div className="counter-section">
          <h3>Counter 1</h3>
          <Counter />

          {/* Second instance nested inside first */}
          <useCounterStore.Provider instanceId="counter2" initialState={{ count: 10 }}>
            <div className="counter-section">
              <h3>Counter 2</h3>
              <Counter />

              {/* This component can access both counters because it's inside BOTH providers */}
              <CounterSummary />
            </div>
          </useCounterStore.Provider>
        </div>
      </useCounterStore.Provider>
    </useCounterStore.Provider>
  );
}

function CounterSummary() {
  const counter1 = useCounterStore((s) => s.count, { from: 'counter1' });
  const counter2 = useCounterStore((s) => s.count, { from: 'counter2' });

  return <p>Total: {counter1 + counter2}</p>;
}
```

  </TabItem>
</Tabs>

### Alternative: Provider-Specific Components

Another approach is to create components that each access only one provider:

<Tabs groupId="language">
  <TabItem value="ts" label="TypeScript" default>

```tsx
function App() {
  return (
    <div>
      <useCounterStore.Provider instanceId="counter1" initialState={{ count: 5 }}>
        <div className="counter-section">
          <h3>Counter 1</h3>
          <Counter />
          <Counter1Observer />
        </div>
      </useCounterStore.Provider>

      <useCounterStore.Provider instanceId="counter2" initialState={{ count: 10 }}>
        <div className="counter-section">
          <h3>Counter 2</h3>
          <Counter />
          <Counter2Observer />
        </div>
      </useCounterStore.Provider>

      {/* Display summaries from both observers */}
      <DisplaySummary />
    </div>
  );
}

// These components access their respective providers and could use
// other state management techniques to share data between them
function Counter1Observer() {
  const count = useCounterStore((s) => s.count);
  // Update some external state or context with this value
  return null;
}

function Counter2Observer() {
  const count = useCounterStore((s) => s.count);
  // Update some external state or context with this value
  return null;
}
```

  </TabItem>
  <TabItem value="js" label="JavaScript">

```jsx
function App() {
  return (
    <div>
      <useCounterStore.Provider instanceId="counter1" initialState={{ count: 5 }}>
        <div className="counter-section">
          <h3>Counter 1</h3>
          <Counter />
          <Counter1Observer />
        </div>
      </useCounterStore.Provider>

      <useCounterStore.Provider instanceId="counter2" initialState={{ count: 10 }}>
        <div className="counter-section">
          <h3>Counter 2</h3>
          <Counter />
          <Counter2Observer />
        </div>
      </useCounterStore.Provider>

      {/* Display summaries from both observers */}
      <DisplaySummary />
    </div>
  );
}

// These components access their respective providers and could use
// other state management techniques to share data between them
function Counter1Observer() {
  const count = useCounterStore((s) => s.count);
  // Update some external state or context with this value
  return null;
}

function Counter2Observer() {
  const count = useCounterStore((s) => s.count);
  // Update some external state or context with this value
  return null;
}
```

  </TabItem>
</Tabs>
